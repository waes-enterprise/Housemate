---
Task ID: 3a
Agent: saved-inbox-builder
Task: Build saved listings and inbox pages

Work Log:
- Read worklog.md for project context and style reference
- Reviewed existing listing detail and explore pages for consistent patterns
- Reviewed favorites API route (GET, POST, DELETE) for auth/sessionId handling
- Created /saved/page.tsx with:
  - Green header bar with back button and title
  - Subtitle showing listing count
  - 2-col mobile / 3-col desktop grid of saved listings
  - Each card: image, verified badge, remove button (X), title, location, price
  - Click card navigates to /listings/[id]
  - Auth check: if authenticated uses cookie, else sessionId from localStorage
  - Remove: DELETE /api/favorites with listingId and sessionId (or no sessionId if auth)
  - Local state filtering after remove with "Removed" feedback text
  - Empty state with Heart icon, message, and "Explore Listings" button
  - Loading skeleton state with header and grid placeholders
- Created /inbox/page.tsx with:
  - Green header bar with back button, "Messages" title, and decorative Bell with notification dot
  - Empty state with MessageCircle icon, heading, and descriptive text
  - Tips section card with Lightbulb icon heading and 3 tips (Phone, Shield, MapPin icons in green circles)
  - Featured properties section fetching from /api/listings/featured, showing first 3
  - Horizontal scroll of small cards linking to /listings/[id] with "Contact" text
- Used existing Listing type and formatPrice from listing-card component
- Used shadcn Skeleton for loading states
- Consistent with existing project brand (#006633 green, bg-[#f8f9fa])

Stage Summary:
- Saved page shows favorited listings with remove functionality and proper auth handling
- Inbox page shows professional empty state with tips and featured listings
- Both pages match existing design patterns from listing-detail and explore pages
