# Task 5: Area/Neighborhood Guide Pages

## Summary
Created comprehensive Area Guide pages for 8 major Zambian locations on Housemate ZM.

## Files Created

### 1. `src/lib/area-guides.ts`
- Data file with `AreaGuide` interface and 8 fully detailed guides
- Areas: Lusaka Central, Rhodes Park, Kabulonga, Woodlands, Kitwe, Ndola, Livingstone, Kabwe
- Each guide includes: description, long description (2 paragraphs), 10+ highlights, 12 amenities, 6 transport options, safety assessment, best-for tags, rent/sale prices, population, coordinates
- Exported helper functions: `getGuideBySlug()`, `getProvinces()`

### 2. `src/app/guides/layout.tsx`
- Server component with metadata for the guides section

### 3. `src/app/guides/page.tsx`
- Client component with green header pattern (Home link, logo, "Area Guides" title)
- Search bar with real-time filtering by name/description/province
- Province filter pills (All Provinces, Lusaka, Copperbelt, Southern, Central)
- Grid of area guide cards (1 col mobile, 2 cols tablet, 3 cols desktop)
- Each card: gradient placeholder with initials, province badge, description, avg rent/sale, "best for" tags, highlights count, "View Guide" CTA
- Empty state with clear filters option
- Staggered fade-in animations

### 4. `src/app/guides/[slug]/layout.tsx`
- Server component with dynamic metadata via `generateMetadata`
- `generateStaticParams` for all 8 slugs

### 5. `src/app/guides/[slug]/page.tsx`
- Client component with full guide detail view
- Green header with breadcrumbs (Home > Area Guides > {Area Name})
- Gradient hero section with area name and description
- Quick stats card: Province, Population, Avg Rent, Avg Sale
- About section with 2-paragraph long description
- Highlights grid with contextual icons
- Amenities table with icons and count badges
- Transport section with bus icons
- Safety section with shield icon and detailed assessment
- "Best For" tag pills
- "Properties in {Area}" section — fetches from `/api/listings?search={area}`, shows up to 6 listing cards with skeleton loading
- Empty state for no listings with CTA
- "Explore Properties in {Area}" CTA banner
- 404 state for invalid slugs

## Lint
✅ `bun run lint` passes with 0 errors, 0 warnings.
