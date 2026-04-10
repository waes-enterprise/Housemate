---
Task ID: 2c
Agent: ui-components-builder
Task: Build admin UI layout and reusable components

Work Log:
- Updated admin layout (src/app/admin/layout.tsx) with session check, login page exclusion, loading state, and 280px sidebar
- Updated admin sidebar (src/components/admin/admin-sidebar.tsx) with 280px width, bg-slate-800 active state with left green border, Home icon logo, "Navigation" section label, divider line, "Back to Site" link, and bottom admin avatar + email + logout button
- Updated admin header (src/components/admin/admin-header.tsx) with admin avatar, name, email display, role badge, and responsive logout button
- Enhanced stats card (src/components/admin/stats-card.tsx) with new trend/trendUp props, TrendingUp/TrendingDown icons, shadcn Card, backward compatible
- Enhanced page header (src/components/admin/page-header.tsx) with action prop, backward compatible with children
- Enhanced status badge (src/components/admin/status-badge.tsx) with smart status prop, banned color, shadcn Badge
- Enhanced confirm dialog (src/components/admin/confirm-dialog.tsx) with async onConfirm, loading state, Loader2 spinner
- Created data table (src/components/admin/data-table.tsx) — generic typed component with skeleton loading
- Created empty state (src/components/admin/empty-state.tsx) — centered icon + text + action layout
- ESLint: zero errors, Build: successful (31 pages)

Stage Summary:
- 9 admin components ready and build-verified
- All backward compatible with existing page usage
