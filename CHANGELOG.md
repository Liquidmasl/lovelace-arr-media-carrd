# Changelog

## [Unreleased]

The card has been renamed to `arr-media-carrd` (yes, two r's — we're leaning into the arr thing). This is required to get the card listed in the HACS default store, where the JS filename must match the repository name. Sorry about that.

**Action needed if you installed manually:** update your resource URL from `arr-media-card.js` to `arr-media-carrd.js` and your dashboard type from `arr-media-card` to `arr-media-carrd`.

**HACS users:** just hit update, HACS handles the file automatically. However, please also update your custom repository URL from `Liquidmasl/homeassistant-arr-queue-card` to `Liquidmasl/lovelace-arr-media-carrd` — GitHub redirects the old URL for now, but that won't last forever.

The old element type `arr-media-card` still works for now and will print a deprecation warning in the browser console so you don't miss it. It will be removed in a future major version.

<details>
<summary>Changes</summary>

- Repository renamed from `homeassistant-arr-queue-card` to `lovelace-arr-media-carrd`
- JS file renamed from `arr-media-card.js` to `arr-media-carrd.js`
- Primary element type is now `arr-media-carrd` (note the extra r before the d)
- Old element type `arr-media-card` kept as a deprecated alias with a console warning
- Editor element renamed to `arr-media-carrd-editor` internally

</details>

## [1.3.1]

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
