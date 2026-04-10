import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

function parseAmenities(amenitiesStr: string | null | undefined): string[] {
  if (!amenitiesStr || amenitiesStr === '[]') return []
  try {
    const parsed = JSON.parse(amenitiesStr)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tier = searchParams.get('tier')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const amenitiesParam = searchParams.get('amenities')

    // Proximity params
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const radiusParam = searchParams.get('radius') // in meters

    const isProximitySearch = latParam && lngParam && radiusParam

    // Parse requested amenities (comma-separated, case-insensitive)
    const requestedAmenities = amenitiesParam
      ? amenitiesParam.split(',').map(a => a.trim().toLowerCase()).filter(Boolean)
      : []

    // If amenities filtering is needed, first find matching listing IDs via raw SQL
    let amenityListingIds: string[] | null = null
    if (requestedAmenities.length > 0) {
      const placeholders = requestedAmenities.map(() => '?').join(',')
      const params = [...requestedAmenities, String(requestedAmenities.length)]

      const rows = await db.$queryRawUnsafe<{ id: string }[]>(
        `SELECT l.id FROM "Listing" l, json_each(l.amenities) AS je
         WHERE LOWER(je.value) IN (${placeholders})
         GROUP BY l.id
         HAVING COUNT(DISTINCT LOWER(je.value)) = ?`,
        ...params
      )
      amenityListingIds = rows.map(r => r.id)

      if (amenityListingIds.length === 0) {
        return NextResponse.json([])
      }
    }

    // Build base WHERE conditions
    const conditions: string[] = []
    const params: any[] = []

    if (category && category !== 'All') {
      conditions.push(`l.category = ?`)
      params.push(category)
    }
    if (tier && tier !== 'All') {
      conditions.push(`l.tier = ?`)
      params.push(tier)
    }
    if (search) {
      conditions.push(`(l.title LIKE ? OR l.description LIKE ? OR l.location LIKE ?)`)
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }
    if (minPrice) {
      conditions.push(`l.price >= ?`)
      params.push(parseFloat(minPrice))
    }
    if (maxPrice) {
      conditions.push(`l.price <= ?`)
      params.push(parseFloat(maxPrice))
    }
    if (amenityListingIds) {
      const idPlaceholders = amenityListingIds.map(() => '?').join(',')
      conditions.push(`l.id IN (${idPlaceholders})`)
      params.push(...amenityListingIds)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // If proximity search, use raw SQL with Haversine
    if (isProximitySearch) {
      const lat = parseFloat(latParam!)
      const lng = parseFloat(lngParam!)
      const radius = parseFloat(radiusParam!) // meters

      // SQLite Haversine formula: distance in meters
      const haversineSQL = `
        6371000 * acos(
          cos(radians(?)) * cos(radians(l.latitude)) *
          cos(radians(l.longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(l.latitude))
        )
      `

      const proximityWhere = whereClause
        ? `${whereClause} AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND (${haversineSQL}) <= ?`
        : `WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND (${haversineSQL}) <= ?`

      const proximityParams = [lat, lng, lat, lng, radius]

      const rows = await db.$queryRawUnsafe<any[]>(
        `SELECT l.*, ROUND((${haversineSQL}) / 1000, 1) as distance
         FROM "Listing" l
         ${proximityWhere}
         ORDER BY distance ASC`,
        ...proximityParams,
        ...params,
        ...proximityParams, // for ORDER BY
      )

      const enriched = rows.map(l => ({
        ...l,
        distance: Number(l.distance),
        amenitiesList: parseAmenities(l.amenities),
      }))

      return NextResponse.json(enriched)
    }

    // Standard query (no proximity)
    const listings = await db.listing.findMany({
      where: (() => {
        const where: Record<string, unknown> = {}
        if (category && category !== 'All') where.category = category
        if (tier && tier !== 'All') where.tier = tier
        if (search) {
          where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
            { location: { contains: search } },
          ]
        }
        if (minPrice || maxPrice) {
          const price: Record<string, unknown> = {}
          if (minPrice) price.gte = parseFloat(minPrice)
          if (maxPrice) price.lte = parseFloat(maxPrice)
          where.price = price
        }
        if (amenityListingIds) where.id = { in: amenityListingIds }
        return Object.keys(where).length > 0 ? where : undefined
      })(),
      include: {
        owner: { select: { isVerifiedAgent: true, name: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })

    // Parse amenities JSON for each listing and flatten owner
    const enriched = listings.map(l => ({
      ...l,
      ownerIsVerifiedAgent: (l.owner as any)?.isVerifiedAgent ?? false,
      ownerName: (l.owner as any)?.name ?? null,
      amenitiesList: parseAmenities(l.amenities),
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, priceUnit, location, category, categoryId, imageUrl, imageUrls, contactPhone, contactEmail, amenities, latitude, longitude } = body

    // Validate required fields
    const errors: string[] = []
    if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters')
    if (!description || description.trim().length < 10) errors.push('Description must be at least 10 characters')
    if (!price || price <= 0) errors.push('Price must be greater than 0')
    if (!location || location.trim().length < 2) errors.push('Location is required')
    if (!imageUrl || imageUrl.trim().length === 0) errors.push('Image is required')

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 })
    }

    // Parse and validate amenities
    let amenitiesJson = '[]'
    if (amenities && Array.isArray(amenities)) {
      amenitiesJson = JSON.stringify(amenities.filter(a => typeof a === 'string' && a.trim()))
    }

    // Create listing with user as owner
    const listing = await db.listing.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        priceUnit: priceUnit || 'month',
        location: location.trim(),
        category: category || '',
        categoryId: categoryId || null,
        imageUrl: imageUrl.trim(),
        imageUrls: imageUrls || '[]',
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        ownerId: payload.userId,
        tier: 'standard',
        isFeatured: false,
        isApproved: true,
        status: 'active',
        amenities: amenitiesJson,
        latitude: latitude != null ? parseFloat(latitude) : null,
        longitude: longitude != null ? parseFloat(longitude) : null,
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
