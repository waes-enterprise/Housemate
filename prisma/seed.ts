import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const db = new PrismaClient()

const listings = [
  // Premium listings (3)
  {
    title: "Luxury 3-Bedroom Apartment in Makeni",
    description: "Stunning modern apartment with panoramic views of Lusaka city. Fully furnished with air conditioning, high-speed WiFi, swimming pool access, and 24/7 security. Located in the prestigious Makeni neighborhood, close to Arcades Shopping Mall and major embassies.",
    price: 3500,
    priceUnit: "month",
    location: "Makeni, Lusaka",
    category: "Rooms",
    imageUrl: "/listing-images/luxury-makeni.png",
    tier: "premium",
    contactPhone: "+260977123456",
    contactEmail: "makeni.rentals@email.com",
    isFeatured: true,
    amenities: '["Air Conditioning","Swimming Pool","WiFi","Security Guard","Parking","Solar Power"]',
    latitude: -15.4025,
    longitude: 28.3378,
  },
  {
    title: "500-Hectare Commercial Farm in Chisamba",
    description: "Prime agricultural land with fully operational irrigation system, farm buildings, and worker quarters. Ideal for maize, wheat, or soybean production. Includes tractors and farming equipment. Fertile loam soil with reliable water supply from the Kafue River tributary.",
    price: 45000,
    priceUnit: "month",
    location: "Chisamba, Central Province",
    category: "Farms",
    imageUrl: "/listing-images/chisamba-farm.png",
    tier: "premium",
    contactPhone: "+260966789012",
    contactEmail: "chisamba.farms@email.com",
    isFeatured: true,
    amenities: '["Borehole/Well","Water Tank","Generator","Servants Quarters","Wall Fence","Parking"]',
    latitude: -14.4647,
    longitude: 28.0686,
  },
  {
    title: "Modern Office Space - Cairo Road",
    description: "Premium Grade A office space in the heart of Lusaka's business district. Open-plan layout with partitioned meeting rooms, fiber optic internet, backup generator, and dedicated parking for 10 vehicles. Perfect for corporate headquarters or co-working space.",
    price: 12000,
    priceUnit: "month",
    location: "Cairo Road, Lusaka",
    category: "Offices",
    imageUrl: "/listing-images/cairo-office.png",
    tier: "premium",
    contactPhone: "+260955345678",
    contactEmail: "cairo.offices@email.com",
    isFeatured: true,
    amenities: '["WiFi","Parking","Generator","CCTV","Elevator","Air Conditioning"]',
    latitude: -15.4162,
    longitude: 28.2871,
  },

  // Featured listings (5)
  {
    title: "Cozy Studio Near University of Zambia",
    description: "Well-maintained studio apartment, 5-minute walk to UNZA main campus. Includes bed, desk, wardrobe, and small kitchenette. Shared bathroom. Perfect for students or young professionals. Electricity and water included in rent.",
    price: 800,
    priceUnit: "month",
    location: "Great East Road, Lusaka",
    category: "Rooms",
    imageUrl: "/listing-images/unza-studio.png",
    tier: "featured",
    contactPhone: "+260977234567",
    isFeatured: true,
    amenities: '["WiFi","Prepaid Electricity","Water Tank","Built-in Cupboards"]',
    latitude: -15.3912,
    longitude: 28.3487,
  },
  {
    title: "Industrial Storage Facility - Ndola",
    description: "Secure warehouse storage facility with 24/7 CCTV surveillance, fire suppression system, and loading dock. Ideal for inventory storage, equipment, or commercial goods. Forklift available on site. Flexible lease terms available.",
    price: 2500,
    priceUnit: "month",
    location: "Industrial Area, Ndola",
    category: "Storage",
    imageUrl: "/listing-images/ndola-storage.png",
    tier: "featured",
    contactPhone: "+260966456789",
    contactEmail: "ndola.storage@email.com",
    isFeatured: true,
    amenities: '["CCTV","Security Guard","Electric Fence","Fire Suppression"]',
    latitude: -12.9737,
    longitude: 28.6564,
  },
  {
    title: "Elegant Event Venue - The Boma",
    description: "Beautiful outdoor and indoor event space suitable for weddings, corporate events, and parties. Accommodates up to 500 guests. Includes stage, sound system, lighting, and catering kitchen. Ample parking space available.",
    price: 8500,
    priceUnit: "event",
    location: "Kabulonga, Lusaka",
    category: "Event Spaces",
    imageUrl: "/listing-images/boma-events.png",
    tier: "featured",
    contactPhone: "+260955567890",
    contactEmail: "theboma.events@email.com",
    isFeatured: true,
    amenities: '["Parking","Garden","Security Guard","WiFi","Generator"]',
    latitude: -15.4321,
    longitude: 28.3543,
  },
  {
    title: "Secure Underground Parking - CBD Kitwe",
    description: "Covered underground parking spot in the central business district of Kitwe. 24/7 security, well-lit, and easily accessible. Monthly or daily rates available. Ideal for professionals working in the CBD area.",
    price: 15,
    priceUnit: "day",
    location: "CBD, Kitwe",
    category: "Parking",
    imageUrl: "/listing-images/kitwe-parking.png",
    tier: "featured",
    contactPhone: "+260977678901",
    isFeatured: true,
    amenities: '["CCTV","Security Guard","Electric Fence","Parking"]',
    latitude: -12.8125,
    longitude: 28.2167,
  },
  {
    title: "2-Bedroom Flat in Kabwe Town Center",
    description: "Spacious 2-bedroom flat in the heart of Kabwe. Recently renovated with new tiles, paint, and fixtures. Close to shops, schools, and public transport. Secure compound with burglar bars and gate.",
    price: 1800,
    priceUnit: "month",
    location: "Town Center, Kabwe",
    category: "Rooms",
    imageUrl: "/listing-images/kabwe-flat.png",
    tier: "featured",
    contactPhone: "+260966789012",
    amenities: '["Tiled Floor","Built-in Cupboards","Wall Fence","Gate","Prepaid Electricity"]',
    latitude: -14.4419,
    longitude: 28.4567,
  },

  // Spotlight listings (4)
  {
    title: "Mechanic Garage with Equipment - Livingstone",
    description: "Well-equipped mechanic garage near Livingstone town center. Includes hydraulic lift, tire machine, compressor, and various tools. Ideal for auto repair business. High foot traffic area near the main road to Victoria Falls.",
    price: 3000,
    priceUnit: "month",
    location: "Industrial Area, Livingstone",
    category: "Garages",
    imageUrl: "/listing-images/livingstone-garage.png",
    tier: "spotlight",
    contactPhone: "+260955890123",
    amenities: '["Parking","Electric Fence","Security Guard","Water Tank"]',
    latitude: -17.8527,
    longitude: 25.8475,
  },
  {
    title: "Retail Shop Space - Levy Mall Area",
    description: "Prime retail space available in high-traffic area near Levy Junction Mall. 80 square meters, ideal for clothing store, electronics shop, or restaurant. Large glass storefront, air conditioning, and ample customer parking.",
    price: 5000,
    priceUnit: "month",
    location: "Levy Junction, Lusaka",
    category: "Shops",
    imageUrl: "/listing-images/levy-shop.png",
    tier: "spotlight",
    contactPhone: "+260977901234",
    contactEmail: "levy.retail@email.com",
    amenities: '["Air Conditioning","Parking","WiFi","Security Guard"]',
    latitude: -15.3782,
    longitude: 28.3124,
  },
  {
    title: "2000 sqm Warehouse - Fairview",
    description: "Large warehouse space in Fairview industrial area. High ceiling, reinforced concrete floor, roller shutter doors, and 3-phase power connection. Suitable for manufacturing, distribution, or logistics operations.",
    price: 8000,
    priceUnit: "month",
    location: "Fairview, Lusaka",
    category: "Warehouses",
    imageUrl: "/listing-images/fairview-warehouse.png",
    tier: "spotlight",
    contactPhone: "+260966012345",
    contactEmail: "fairview.wh@email.com",
    amenities: '["CCTV","Electric Fence","Parking","Generator","Water Tank"]',
    latitude: -15.3715,
    longitude: 28.2956,
  },
  {
    title: "Agricultural Land with Borehole - Chipata",
    description: "100-hectare plot with fully functional borehole and irrigation infrastructure. Fertile soil suitable for crop farming or livestock. Includes a 3-bedroom farmhouse and staff quarters. Title deeds available.",
    price: 15000,
    priceUnit: "month",
    location: "Chipata, Eastern Province",
    category: "Land",
    imageUrl: "/listing-images/chipata-land.png",
    tier: "spotlight",
    contactPhone: "+260955123456",
    amenities: '["Borehole/Well","Servants Quarters","Wall Fence","Water Tank","Solar Power"]',
    latitude: -13.6227,
    longitude: 32.6592,
  },

  // Standard listings (10)
  {
    title: "Single Room - Rhodes Park",
    description: "Clean and tidy single room in a shared house. Access to shared kitchen and bathroom. Quiet neighborhood with good security. Perfect for a single professional. Water and electricity included.",
    price: 500,
    priceUnit: "month",
    location: "Rhodes Park, Lusaka",
    category: "Rooms",
    imageUrl: "/listing-images/rhodespark-room.png",
    tier: "standard",
    contactPhone: "+260977234567",
    amenities: '["WiFi","Prepaid Electricity","Built-in Cupboards"]',
    latitude: -15.3956,
    longitude: 28.3091,
  },
  {
    title: "Poultry Farm - Chongwe",
    description: "Established poultry farm with capacity for 5,000 broilers. Includes 4 poultry houses, feed storage, and water system. Good road access. Current owner available for training and handover period.",
    price: 5000,
    priceUnit: "month",
    location: "Chongwe, Lusaka Province",
    category: "Farms",
    imageUrl: "/listing-images/chongwe-poultry.png",
    tier: "standard",
    contactPhone: "+260966345678",
    amenities: '["Borehole/Well","Water Tank","Servants Quarters","Wall Fence"]',
    latitude: -15.2792,
    longitude: 28.6833,
  },
  {
    title: "Shared Office Desk - Bwinjifuma",
    description: "Hot desk in a modern co-working space. Includes high-speed WiFi, printing access, meeting room booking (4 hours/month), and free coffee/tea. Community events and networking opportunities. Flexible monthly plan.",
    price: 450,
    priceUnit: "month",
    location: "Bwinjifuma, Lusaka",
    category: "Offices",
    imageUrl: "/listing-images/bwinjifuma-cowork.png",
    tier: "standard",
    contactEmail: "bwinjifuma.cowork@email.com",
    amenities: '["WiFi","Air Conditioning","Parking"]',
    latitude: -15.3687,
    longitude: 28.3345,
  },
  {
    title: "Self-Storage Unit - Northmead",
    description: "Secure self-storage unit, 3x3 meters. Ideal for furniture, boxes, or business inventory. Clean, dry, and pest-free. 24/7 access with your own key. Monthly billing with no long-term commitment.",
    price: 300,
    priceUnit: "month",
    location: "Northmead, Lusaka",
    category: "Storage",
    imageUrl: "/listing-images/northmead-storage.png",
    tier: "standard",
    contactPhone: "+260955456789",
    amenities: '["CCTV","Security Guard"]',
    latitude: -15.3734,
    longitude: 28.3278,
  },
  {
    title: "Garden Party Venue - Ibex Hill",
    description: "Beautiful garden setting perfect for bridal showers, birthday parties, and intimate gatherings. Accommodates up to 150 guests. Lush green lawns, braai area, and built-in sound system. Weekend specials available.",
    price: 2500,
    priceUnit: "event",
    location: "Ibex Hill, Lusaka",
    category: "Event Spaces",
    imageUrl: "/listing-images/ibex-garden.png",
    tier: "standard",
    contactPhone: "+260977567890",
    amenities: '["Garden","Parking","WiFi"]',
    latitude: -15.4103,
    longitude: 28.3612,
  },
  {
    title: "Double Garage - Woodlands",
    description: "Double garage available for rent in Woodlands residential area. Suitable for vehicle storage, workshop, or small business. Electric roller door, good lighting, and drainage. Quiet neighborhood.",
    price: 800,
    priceUnit: "month",
    location: "Woodlands, Lusaka",
    category: "Garages",
    imageUrl: "/listing-images/woodlands-garage.png",
    tier: "standard",
    amenities: '["Electric Fence","Water Tank"]',
    latitude: -15.4156,
    longitude: 28.3054,
  },
  {
    title: "Large Warehouse - Kafue Road",
    description: "Spacious warehouse along Kafue Road, ideal for distribution and logistics. 3000 sqm floor area, high bay lighting, and heavy-duty flooring. Easy access to Great North Road. Loading bay for trucks.",
    price: 15000,
    priceUnit: "month",
    location: "Kafue Road, Lusaka",
    category: "Warehouses",
    imageUrl: "/listing-images/kafue-warehouse.png",
    tier: "standard",
    contactPhone: "+260966678901",
    contactEmail: "kafue.wh@email.com",
    amenities: '["CCTV","Electric Fence","Parking","Generator","Water Tank"]',
    latitude: -15.4789,
    longitude: 28.2534,
  },
  {
    title: "1-Hectare Plot with Title - Riverside",
    description: "Residential plot with clean title deed in the up-and-coming Riverside area. Flat terrain, serviced with water and electricity nearby. Great investment opportunity. Surveyed and pegged.",
    price: 2500,
    priceUnit: "month",
    location: "Riverside, Livingstone",
    category: "Land",
    imageUrl: "/listing-images/riverside-plot.png",
    tier: "standard",
    contactPhone: "+260955789012",
    amenities: '["Water Tank","Wall Fence","Prepaid Electricity"]',
    latitude: -17.8327,
    longitude: 25.8675,
  },
  {
    title: "Shop Space in Market - Kamwala",
    description: "Compact shop space in the busy Kamwala market area. Ideal for small retail business, salon, or phone shop. High foot traffic from daily market visitors. Secure with metal grilles.",
    price: 1200,
    priceUnit: "month",
    location: "Kamwala, Lusaka",
    category: "Shops",
    imageUrl: "/listing-images/kamwala-shop.png",
    tier: "standard",
    contactPhone: "+260977890123",
    amenities: '["Security Guard","CCTV","Electric Fence"]',
    latitude: -15.3998,
    longitude: 28.3012,
  },
  {
    title: "Open Air Parking Lot - Manda Hill",
    description: "Well-maintained open air parking lot near Manda Hill Shopping Centre. Daily and monthly rates available. Security guard on duty during business hours. Suitable for commuter parking or long-term vehicle storage.",
    price: 10,
    priceUnit: "day",
    location: "Manda Hill, Lusaka",
    category: "Parking",
    imageUrl: "/listing-images/mandahill-parking.png",
    tier: "standard",
    contactPhone: "+260966901234",
    amenities: '["Security Guard","CCTV"]',
    latitude: -15.3834,
    longitude: 28.3189,
  },
]

const categories = [
  { name: "Rooms", slug: "rooms", icon: "BedDouble", sortOrder: 1 },
  { name: "Farms", slug: "farms", icon: "Wheat", sortOrder: 2 },
  { name: "Offices", slug: "offices", icon: "Building2", sortOrder: 3 },
  { name: "Storage", slug: "storage", icon: "Archive", sortOrder: 4 },
  { name: "Event Spaces", slug: "event-spaces", icon: "PartyPopper", sortOrder: 5 },
  { name: "Garages", slug: "garages", icon: "Car", sortOrder: 6 },
  { name: "Warehouses", slug: "warehouses", icon: "Warehouse", sortOrder: 7 },
  { name: "Land", slug: "land", icon: "Mountain", sortOrder: 8 },
  { name: "Shops", slug: "shops", icon: "Store", sortOrder: 9 },
  { name: "Parking", slug: "parking", icon: "CircleParking", sortOrder: 10 },
  { name: "Other", slug: "other", icon: "MoreHorizontal", sortOrder: 11 },
]

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await db.favorite.deleteMany()
  await db.activityLog.deleteMany()
  await db.siteSetting.deleteMany()
  await db.listing.deleteMany()
  await db.category.deleteMany()

  // Create admin user
  const adminExists = await db.user.findUnique({ where: { email: 'admin@housematezm.com' } })
  if (!adminExists) {
    const adminPassword = await hashPassword('Admin@123')
    await db.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@housematezm.com',
        password: adminPassword,
        role: 'admin',
      },
    })
    console.log('  ✓ Created admin user: admin@housematezm.com')
  } else {
    console.log('  ✓ Admin user already exists')
  }

  // Create verified agent user
  const agentEmail = 'agent@zambahomes.com'
  const agentExists = await db.user.findUnique({ where: { email: agentEmail } })
  if (!agentExists) {
    const agentPassword = await hashPassword('Agent@123')
    await db.user.create({
      data: {
        name: 'Chanda Mwansa',
        email: agentEmail,
        password: agentPassword,
        phone: '+260977555123',
        role: 'user',
        isVerifiedAgent: true,
        agentBio: 'Experienced real estate agent with 10+ years in the Zambian property market.',
        agentCompany: 'Zambia Homes Realty',
        agentSpecialties: '["Residential","Commercial","Land"]',
      },
    })
    console.log(`  ✓ Created verified agent: ${agentEmail}`)
  } else {
    // Update existing user to be a verified agent
    await db.user.update({
      where: { email: agentEmail },
      data: {
        isVerifiedAgent: true,
        agentBio: 'Experienced real estate agent with 10+ years in the Zambian property market.',
        agentCompany: 'Zambia Homes Realty',
        agentSpecialties: '["Residential","Commercial","Land"]',
      },
    })
    console.log(`  ✓ Updated verified agent: ${agentEmail}`)
  }

  // Create categories
  const categoryMap = new Map<string, string>()
  for (const cat of categories) {
    const created = await db.category.create({ data: cat })
    categoryMap.set(cat.name, created.id)
    console.log(`  ✓ Created category: ${cat.name}`)
  }

  // Create listings with category links
  for (const listing of listings) {
    const categoryId = categoryMap.get(listing.category)
    // Generate realistic random analytics data
    const viewCount = Math.floor(Math.random() * 1950) + 50  // 50 - 2000
    const inquiryCount = Math.floor(Math.random() * 16)        // 0 - 15

    await db.listing.create({
      data: {
        ...listing,
        viewCount,
        inquiryCount,
        categoryId: categoryId || null,
      },
    })
    console.log(`  ✓ Created: ${listing.title} (${viewCount} views, ${inquiryCount} inquiries)`)
  }

  // Create default site settings
  const settings = [
    { key: 'site_name', value: 'Housemate ZM' },
    { key: 'site_description', value: "Premium marketplace for renting anything in Zambia" },
    { key: 'contact_email', value: 'info@housematezm.com' },
    { key: 'contact_phone', value: '+260977000000' },
    { key: 'default_currency', value: 'ZMW' },
    { key: 'listings_per_page', value: '12' },
    { key: 'allow_registrations', value: 'true' },
    { key: 'require_listing_approval', value: 'false' },
    { key: 'maintenance_mode', value: 'false' },
  ]
  for (const setting of settings) {
    await db.siteSetting.create({ data: setting })
  }
  console.log('  ✓ Created site settings')

  console.log(`\n✅ Seeded ${listings.length} listings, ${categories.length} categories, and admin user successfully!`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
