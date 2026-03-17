# Changelog

## [Unreleased]

### ⚠️ Check your dashboard resources after updating

This repository was renamed, which causes HACS to add a **duplicate resource entry** in your dashboard. Both the old (`arr-media-card.js`) and new (`arr-media-carrd.js`) files end up loaded side by side, and depending on load order the wrong version may be displayed.

**To fix:** Go to **Settings → Dashboards → Resources** and remove the old entry `/hacsfiles/homeassistant-arr-queue-card/arr-media-card.js` if it's still there. Keep only the new one.

You can verify in your browser console — `ARR-MEDIA-CARRD` should appear exactly once, at version 1.3.4 or higher.

HACS should track the repository rename automatically, but it's worth updating your custom repository URL to `Liquidmasl/lovelace-arr-media-carrd` anyway to keep things clean.

**If you installed manually:** update your resource URL from `arr-media-card.js` to `arr-media-carrd.js` and re-add it as a resource in **Settings → Dashboards → Resources**.

---

The rename itself: the card is now called `arr-media-carrd` (yes, two r's — HACS requires the JS filename to match the repository name, so here we arrr). The old element type `type: custom:arr-media-card` still works but logs a deprecation warning in the browser console. It will be removed in a future major version.

<details>
<summary>Changes</summary>

- Repository renamed from `homeassistant-arr-queue-card` to `lovelace-arr-media-carrd`
- JS file renamed from `arr-media-card.js` to `arr-media-carrd.js`
- Primary element type is now `arr-media-carrd` (note the extra r before the d)
- Old element type `arr-media-card` kept as a deprecated alias with a console warning
- Editor element renamed to `arr-media-carrd-editor` internally

</details>

## [1.3.4]

### ⚠️ Check your dashboard resources after updating

This repository was renamed, which causes HACS to add a **duplicate resource entry** in your dashboard. Both the old (`arr-media-card.js`) and new (`arr-media-carrd.js`) files end up loaded side by side, and depending on load order the wrong version may be displayed.

**To fix:** Go to **Settings → Dashboards → Resources** and remove the old entry `/hacsfiles/homeassistant-arr-queue-card/arr-media-card.js` if it's still there. Keep only the new one.

You can verify in your browser console — `ARR-MEDIA-CARRD` should appear exactly once, at version 1.3.4 or higher.

HACS should track the repository rename automatically, but it's worth updating your custom repository URL to `Liquidmasl/lovelace-arr-media-carrd` anyway to keep things clean.

**If you installed manually:** update your resource URL from `arr-media-card.js` to `arr-media-carrd.js` and re-add it as a resource in **Settings → Dashboards → Resources**.

---

The rename itself: the card is now called `arr-media-carrd` (yes, two r's — HACS requires the JS filename to match the repository name, so here we arrr). The old element type `type: custom:arr-media-card` still works but logs a deprecation warning in the browser console. It will be removed in a future major version.

<details>
<summary>Changes</summary>

- Repository renamed from `homeassistant-arr-queue-card` to `lovelace-arr-media-carrd`
- JS file renamed from `arr-media-card.js` to `arr-media-carrd.js`
- Primary element type is now `arr-media-carrd` (note the extra r before the d)
- Old element type `arr-media-card` kept as a deprecated alias with a console warning
- Editor element renamed to `arr-media-carrd-editor` internally

</details>


## [1.3.3]

### ⚠️ ACTION REQUIRED — You are probably not receiving updates anymore

This repository was renamed. HACS does **not** follow repository renames the way i though.. sorry. 
It silently keeps your old installation frozen at whatever version you had, and adds the new one as additional resource. So even if HACS updates are made, the card in your UI might just not adapt.
Check you browser console, the Arr Media Carrd should only show up once!

**If you installed via HACS (custom repository):**

1. In HACS → Frontend, remove the old entry (`homeassistant-arr-queue-card`)
2. Add the new repository: `Liquidmasl/lovelace-arr-media-carrd`
3. Install and do a hard refresh

**If you installed manually:** update your resource URL from `arr-media-card.js` to `arr-media-carrd.js`.

---

The rename itself: the card is now called `arr-media-carrd` (yes, two r's — HACS requires the JS filename to match the repository name, so here we arrr). The old element type `type: custom:arr-media-card` still works but logs a deprecation warning in the browser console. It will be removed in a future major version.

<details>
<summary>Changes</summary>

- Repository renamed from `homeassistant-arr-queue-card` to `lovelace-arr-media-carrd`
- JS file renamed from `arr-media-card.js` to `arr-media-carrd.js`
- Primary element type is now `arr-media-carrd` (note the extra r before the d)
- Old element type `arr-media-card` kept as a deprecated alias with a console warning
- Editor element renamed to `arr-media-carrd-editor` internally

</details>

## [1.3.2]

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
