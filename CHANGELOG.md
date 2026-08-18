# Changelog

All notable changes to DevKit are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-08-19

### Added
- **Favorites** — star any tool to pin it to a "★ Favorites" group at the top of the sidebar (saved locally).
- **Recent** — a "Recent" group that automatically tracks your last-used tools.
- **Search keyboard navigation** — the search box auto-focuses on open; ↑/↓ move through matches, Enter opens the selection, Esc clears.

### Changed
- **Modernized UI** — refined color tokens, a tinted active-nav state with an accent indicator (replacing the solid-blue bar), focus rings, a brand subtitle, and a cleaner icon-free sidebar.
- Tuned the light theme so key text pairs meet WCAG contrast.
- `homepage_url` now points to the project landing page.

### Fixed
- Restructured nav rows so the favorite toggle is a sibling button rather than an interactive control nested inside another button (accessibility).

## [1.0.0] — 2026-07-22

### Added
- Initial release: 45+ client-side developer tools across Code & Data, Generators, Design, Text, Compare, Time, Page Tools, Page Analysis, and Reference.
- 100% local — no servers, no analytics, no data collection. Permissions limited to `activeTab`, `scripting`, and `storage`.
