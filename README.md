# AquaVanguard

**Find unsafe water. Treat it. Prove it's cleaner.**

AquaVanguard is a community water-safety prototype that guides people through a practical loop: report a water-source concern, screen observations, choose cautious next steps, and record a follow-up test for review. It combines problem-specific guidance and visual field guides with a local water-source map and an offline-capable web app shell.

> **Important:** AquaVanguard is an educational demonstration, not a water-testing service, public-health authority, or substitute for local emergency advice. It cannot determine that a real water source is safe. Its map examples, progress numbers, and simulated tests are not live measurements.

## What the website offers

### 1. Home — overview and quick access

[`index.html`](index.html) introduces the Report → Diagnose → Act → Verify flow and links to the main sections. It includes:

- A short animated water-wave introduction to the AquaVanguard name.
- Navigation and action buttons to reach reporting, the map, and offline guides.
- A “How it works” sequence and links to each step.
- Sample community-progress counters and a map preview. These numbers and markers are illustrative demo content, not live service data.
- A safety reminder about the limits of household filters.
- A “Did you know?” ticker with 49 short water-quality facts, grouped across contamination, safe drinking and filtration, testing, natural events, and community action. It rotates automatically, can be paused or navigated manually, and stays manual for visitors who prefer reduced motion.

### 2. Map — browse example and community reports

[`map.html`](map.html) presents a Leaflet map for **Lagos State** and **Ondo State**, alongside a selectable report list. Visitors can:

- Filter the displayed sources by high, medium, or low demo risk.
- Switch between the two states and inspect a source’s approximate area, type, date, and observation.
- Continue to observation screening for a selected source.
- Open a retest form for a saved community report.

The map includes fictional sample sources and any reports saved in the current browser. Risk labels summarize observations; they are not test results or safety clearances. Map tiles require an internet connection, though cached app pages and report lists may still be available offline.

### 3. Report — record a local observation

[`report.html`](report.html) provides a guided form to record a source name, approximate community, state, source type, observed status, and visible concerns such as cloudiness, unusual smell, nearby waste, or a possible spill. A visitor can select an approximate point on the map or request device location, and may attach a photo.

- Reports are saved in the browser on that device; they are **not uploaded to a server** or shared with other people.
- Selected coordinates are rounded before saving/displaying to reduce location precision.
- Optional images are resized and compressed in the browser before local storage.
- The form warns visitors not to enter private details or approach unsafe water.
- The demo limits local reports to 40 per browser.

### 4. Diagnose — screen observations, not water

[`diagnose.html`](diagnose.html) asks about appearance, smell, nearby pollution, recent flooding, and heavy rain. A transparent, rule-based screen returns one of three precautionary outcomes:

- **High concern**
- **Follow-up recommended**
- **No warning signs reported**

The last result is not a pass: normal appearance and smell cannot rule out invisible contamination. The page shows the observations that led to its guidance and offers links to the map and relevant Act guidance.

Visitors may also record a home-kit or laboratory result as entered, optionally associate it with a saved source, and later use it as a before-action baseline. Entries remain user-provided and unverified. A separate sample workflow shows two fictional test scenarios; it does not analyze a real sample, connect to lab equipment, or provide a live test feed.

### 5. Act — concern-specific advice, videos, and practical planning

[`blueprints.html`](blueprints.html) adapts its content to a selected concern:

- **Safety unknown / no test**
- **Possible germs or flooding**
- **Cloudy or muddy water**
- **Possible fuel or chemical contamination**

It provides recommended next steps, a matched materials plan, and an optional local-price budget estimate in Nigerian naira. Prices are entered by the visitor; the app does not assume vendor prices. The plans are educational planning aids, not certified treatment-system designs.

The Act page also includes:

- A curated library of nine water-safety videos, with concern filtering, search, browse-all controls, and incremental loading.
- In-page video playback using YouTube’s privacy-enhanced embed host, plus a watch history stored in the browser. Video availability and playback rules still depend on YouTube and the visitor’s connection.
- Safety notes alongside the videos. In particular, filtration demonstrations do not establish disinfection or chemical removal.
- Built-in, illustrated picture guides with a print/save option.
- Links to the standalone offline field-guide directory.

The current nine-video library does not have a dedicated match for every concern: selecting cloudy water or possible chemical contamination shows no video results and points visitors to the corresponding picture guide. Chemical concerns should not be answered with generic DIY filtration videos.

**Safety boundary:** For cloudy water, settling and cloth straining are described only as visible-particle pre-treatment. They do not make water safe to drink. For suspected fuel or chemical contamination, the guidance is to avoid contact and use, seek a known safe alternative, and contact the responsible authority—not to boil or improvise a filter.

### 6. Offline field guides — visual problem-first instructions

[`offline-guides.html`](offline-guides.html) is a directory of illustrated guides for:

- No known safe source
- Floodwater reaching a source
- Cloudy or muddy water
- A possible fuel, oil, or chemical spill
- Drought, heat, or shortage
- Protecting already-safe water during storage

[`offline-guide.html`](offline-guide.html) renders the selected guide with a real-world image, attributed photo credit and license, safety limits, ordered steps, and relevant references. The cloudy-water guide lets visitors choose **5 L, 20 L, or 60 L** clarification batches and see the corresponding container/equipment list. These are batch capacities for settling and cloth pre-filtration—not filter dimensions or validated drinking-water system designs. The shortage guide includes a planning calculator.

The guide pages and their local images are part of the service-worker app shell. Open/save the app while connected before relying on it offline. External references, videos, and live map tiles still need internet.

The field-guide photos include visible creator and license attributions; they are illustrative examples, not evidence about the visitor's local water.

### 7. Verify — record comparable retests for review

[`community.html`](community.html) lets visitors choose a saved source and record before/after results, parameter and units, method, and dates. It can prefill a baseline previously entered on the Diagnose page. It requires the visitor to confirm both readings use the same source, parameter, units, and method.

This prototype has no moderator, server, or independent test-provider integration. Retests are marked **awaiting independent review**, award **zero points**, and do not change a map pin to “safe” or “improved.” A lower reading for one indicator does not establish overall water safety.

### Additional pages and helper

- [`offline.html`](offline.html) is a standalone offline notice. The active service worker instead falls back to the cached home page (`index.html`) for an uncached navigation.
- [`blueprint.html`](blueprint.html) is a legacy redirect to the Act page.
- [`tools/export-icons.html`](tools/export-icons.html) is a local helper for converting the supplied SVG app icons into the PNG sizes referenced by the web app manifest.

## Suggested walkthrough for a demo or judging

1. Start on the home page and explain the four-step workflow and safety limits.
2. Open **Map**, select Lagos or Ondo, filter the sample reports, and inspect one source.
3. Open **Report** and submit a clearly fictional observation. Show that it is saved on this browser and appears in the map/report list.
4. Open **Diagnose**, select observations, and show how the precautionary explanation changes. Optionally run a sample simulation, emphasizing it is fictional.
5. Continue to **Act** and select the related concern. Review the guidance, materials plan, videos, and safety notes. Open a picture guide and select a batch size for the cloudy-water pre-treatment example.
6. Open **Verify** and record a comparable retest for a saved report. Point out that it stays pending and receives no points until an independent review system exists.
7. To demonstrate offline use, visit the site while connected and allow the app shell/field-guide assets to be cached; then disconnect and open a saved guide. Explain that videos, live map tiles, and external links are unavailable offline.

## Run locally

This is a static HTML, CSS, and vanilla JavaScript project. There is no package installation, compile step, backend, or database setup.

1. Open the project folder in Visual Studio Code.
2. Start the **Live Server** extension from the project root (typically `http://127.0.0.1:5500`).
3. Open `http://127.0.0.1:5500/index.html`.

Use `localhost`/Live Server or HTTPS for service-worker and install features; browsers restrict these APIs on ordinary `file://` pages. For the icon exporter, open `http://127.0.0.1:5500/tools/export-icons.html`.

### Install and offline setup

The root [`manifest.json`](manifest.json) describes a standalone app and references the SVG icon plus three PNG icons. The PNG files are generated locally with [`tools/export-icons.html`](tools/export-icons.html); after downloading them, place them in `icons/`:

- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/icon-maskable-512.png`

These PNG files are not included until exported. The manifest references them, so generate them before presenting the app as having the complete PWA icon set.

The active app service worker is [`sw.js`](sw.js). It caches the local app pages, scripts, styles, manifest, SVG assets, offline-guide photos, and icon-export helper; it serves cached resources when offline and falls back to the cached home page for an uncached navigation. The Act page also offers **Save app for offline use**. Installability and offline behavior should be tested in the target browser after the app has been served from localhost or HTTPS.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home page, workflow entry points, map preview, safety message, and facts ticker |
| `map.html`, `map.js` | State map, risk filters, source list, and selected-source details |
| `report.html`, `report.js` | Source-observation form, approximate location, optional photo, and local saves |
| `diagnose.html`, `diagnose.js` | Observation screening, simulated examples, and user-entered test records |
| `blueprints.html`, `act.js`, `video-library.js` | Concern-specific action guidance, videos/history, picture guidance, and budget estimate |
| `community.html`, `verify.js` | Before/after retest entry and pending-review history |
| `offline-guides.html`, `offline-directory.js` | Problem-first illustrated field-guide directory |
| `offline-guide.html`, `offline-guide.js`, `offline-guide-data.js` | Guide rendering, steps, batch-size choices, and shortage calculator |
| `data.js` | Illustrative source and state data for the map and demo |
| `water-data.js` | Browser `localStorage` records for reports, tests, and retests |
| `app.js`, `style.css` | Shared page behavior, intro, facts ticker, responsive layout, and styling |
| `manifest.json`, `sw.js` | PWA metadata, app-shell caching, and offline fallback behavior |
| `icons/` | SVG app and inline-letter artwork; generated PNG icons are added here |
| `assets/offline-guides/` | Local photographs used by offline guide cards |
| `tools/export-icons.html` | Browser-based SVG-to-PNG helper |

## Privacy, reliability, and scope

- The prototype has **no application server or shared account system**. Reports, tests, retests, and video history use browser-local storage and are not synchronized across devices.
- Do not enter names, home addresses, contact details, or other sensitive information. Reported map locations are approximate.
- Demo map entries, home-page counters, and simulated test scenarios are illustrative; they are not live community statistics, public-health alerts, or lab results.
- Observation screening is deliberately precautionary and is not a validated risk score or diagnosis.
- No guide or improvised filter can confirm drinking-water safety. Follow current local advisories and obtain suitable testing and qualified advice.
- Internet access is needed for third-party map tiles, YouTube playback, and linked external resources. Cached app pages and bundled guide content are the offline-focused parts.
- The map uses Leaflet from a CDN and Esri-hosted map tiles. Video playback uses YouTube embeds. Those external services may be unavailable, change, or apply their own usage and availability rules.
- The interface uses responsive layouts, semantic forms, visible keyboard focus, and status announcements for important dynamic updates. At 700px and narrower, the header menu exposes all six main destinations; forms and map details reflow for phones, and the footer links remain available. The home-page fact ticker respects the reduced-motion preference.
