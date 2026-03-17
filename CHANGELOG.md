# Changelog

## [Unreleased]

- Search bar can now be hidden via the card editor. 
- Releasing is now fully automated via `npm version`.

<details>
<summary>Changes</summary>

- Automated changelog versioning: `npm version` now renames `[Unreleased]` to the new version and creates a fresh `[Unreleased]` header automatically

</details>

## [1.3.0]

Search bar can now be hidden via the card editor.

<details>
<summary>Changes</summary>

- Added toggle in Header Options to show/hide the search bar
- Header is now fully hidden when all header elements are disabled
- Versioning switched to `npm version` for atomic package.json + lock file bumps
- Added CLAUDE.md documenting the release process

</details>

## [1.1.0]

Sonarr library mode: browse your full series library with expandable episodes grouped by season, including availability counts per season. Also fixes several bugs when running Radarr and Sonarr side by side.

<details>
<summary>Changes</summary>

- Sonarr library mode with expandable series and per-season episode lists
- Episodes fetched on demand and cached; collapsible seasons with available/total counts
- Fixed series titles showing as "undefined" in Sonarr library
- Fixed Radarr and Sonarr not showing simultaneously when both are configured
- Fixed cover art flickering when expanding/collapsing series or seasons
- Slide-down animation on expand
- Raised default max_items from 50 to 500

</details>

## [1.0.2]

Search, compact mode, pagination, and Sonarr queue support.

<details>
<summary>Changes</summary>

- Search/filter bar in card header
- Compact mode option
- Pagination support
- Sonarr queue support (episodes with season/episode identifiers)
- Poster art with fanart background tint on queue items

</details>

## [1.0.0]

Initial release with Radarr download queue display.
