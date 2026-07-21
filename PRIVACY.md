# DevKit — Privacy Policy

_Last updated: 22 July 2026_

## The short version

**DevKit does not collect, store, transmit, or sell any user data. Period.**

## What DevKit does

DevKit is a collection of developer utilities (formatters, converters, generators, comparison tools, page inspection and page analysis) that run entirely inside your browser. The extension makes **no network requests** of any kind: there are no servers, no analytics, no crash reporting, and no third-party services.

## Data handling

- Text you paste into tools (JSON, tokens, colors, etc.) is processed locally in the popup and is never sent anywhere.
- On-page tools (ruler, font inspector, SEO audit, storage viewer, screenshot, palette extractor) run only on the tab where you explicitly click a DevKit button, using Chrome's `activeTab` permission. Results are shown to you and then discarded.
- Screenshots and generated images (e.g. QR codes) are saved directly to your device; they are never uploaded.
- The only things DevKit persists are your theme preference and last-used tool, stored locally via `chrome.storage.local` on your own machine.

## Permissions

- **activeTab** — grants temporary access to the current tab, only after you click DevKit, so on-page tools can run there.
- **scripting** — injects the on-page tools (overlays, analysis) into that tab on your request.
- **storage** — saves your theme and last-used tool locally.

## Changes

If this policy ever changes, the updated version will be published at this URL and the "Last updated" date will change.

## Contact

Questions about this policy: zubair@bracsaajan.com
