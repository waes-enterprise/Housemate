# Task: Messaging System Implementation

## Status: COMPLETED

## Summary
Implemented a complete in-built messaging system for the Housemate ZM webapp with file sharing capabilities.

## Files Created/Modified

### Schema Changes
- `prisma/schema.prisma` - Added `Conversation` and `Message` models, updated `User` and `Listing` relations

### Upload
- `public/uploads/chat/` - Directory for file uploads

### API Routes (6 endpoints)
1. `src/app/api/upload/route.ts` - POST file upload (multipart/form-data, 10MB max, type validation)
2. `src/app/api/conversations/route.ts` - GET list conversations, POST create/get conversation
3. `src/app/api/conversations/[id]/route.ts` - GET conversation with messages, DELETE conversation
4. `src/app/api/conversations/[id]/messages/route.ts` - GET messages (paginated), POST send message
5. `src/app/api/conversations/[id]/read/route.ts` - POST mark messages as read
6. `src/app/api/messages/unread/route.ts` - GET total unread count

### Chat Components
- `src/components/chat/file-attachment.tsx` - File preview/download (images inline, docs as cards)
- `src/components/chat/message-bubble.tsx` - Message bubble with green/white styling, timestamps, read receipts
- `src/components/chat/chat-input.tsx` - Input with file picker, upload handling, send button
- `src/components/chat/conversation-list.tsx` - Searchable list with avatars, unread badges, last message preview
- `src/components/chat/chat-view.tsx` - Full chat interface with header, message list, polling (3s), delete option

### Pages
- `src/app/inbox/page.tsx` - Complete inbox page with responsive split-panel layout (mobile: toggle, desktop: side-by-side)

### Updated Components
- `src/components/marketplace/listing-detail.tsx` - Added "Message" button with auth check, creates/opens conversation
- `src/components/marketplace/bottom-nav.tsx` - Added unread message badge on Inbox tab (polls every 10s)
- `src/components/marketplace/listing-card.tsx` - Added `ownerId` to Listing type

## Design
- Green theme: sent = bg-[#006633] text-white, received = bg-white text-gray-900
- Mobile-first responsive design
- 3-second message polling
- File attachments with type-specific icons and inline image previews
- Smooth animations for new messages
