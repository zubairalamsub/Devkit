# Chrome Web Store listing — copy-paste material

## Name
DevKit - All-in-One Developer Tools

## Summary (max 132 chars)
45+ dev tools in one: JSON, JWT, Base64, regex, QR codes, diff & compare, color picker, page ruler, SEO & performance audit.

## Category
Developer Tools

## Description

Stop juggling a dozen single-purpose extensions. DevKit packs 45+ developer tools into one fast, private popup.

★ CODE & DATA
JSON formatter with tree view, Base64, URL and HTML-entity encoders, JWT decoder, number-base converter, CSV/JSON and query-string converters, SQL formatter, and Markdown preview.

★ GENERATORS
UUIDs, SHA hashes, secure passwords, QR codes, mock data, and lorem ipsum.

★ DESIGN
Color converter, screen eyedropper, WCAG contrast checker, px/rem calculator, and box-shadow & gradient builders — all with live preview.

★ TEXT & COMPARE
Regex tester, case converter, word counter, line tools, slugify and string escaper — plus a full compare suite: text diff, JSON diff, list compare, text similarity, date diff, number diff and image diff.

★ TIME & REFERENCE
Timestamp converter, cron explainer, and quick references for HTTP status codes, MIME types and User-Agent strings.

★ ON-PAGE TOOLS & ANALYSIS
Element ruler, font inspector, outline overlay, palette extractor and full-tab screenshots. Plus on-demand page analysis: SEO checks, performance metrics, a storage viewer and framework detection.

★ PRIVATE BY DESIGN
Everything runs locally. No servers, no accounts, no analytics, no data collection — just three narrow permissions (activeTab, scripting, storage). DevKit only touches a page when you click a button.

Dark & light themes. Searchable tool list. Keyboard shortcut: Alt+Shift+D.

## Privacy practices tab — paste these exactly

### Single purpose description
DevKit is a developer utility toolbox. Its single purpose is to provide a collection of client-side developer tools — formatters, encoders/decoders, generators, converters, comparison/diff tools, and on-page inspection and analysis — all accessible from the extension's toolbar popup.

### Permission justification — activeTab
activeTab is used only when the user clicks a DevKit tool that acts on the current page (element ruler, font inspector, outline overlay, color-palette extractor, screenshot, SEO audit, performance metrics, storage viewer, tech detector). It grants temporary access to the active tab in response to that explicit click so the tool can read the page the user is looking at. No pages are accessed in the background, and no broad host permissions are requested.

### Permission justification — scripting
scripting is required to inject DevKit's on-page tools and analysis code into the active tab after the user clicks a tool button. It runs the inspection overlays (ruler, font inspector, outline) and collects page data (meta/SEO tags, performance timings, storage contents, framework detection) to display back to the user. Injection happens only on user action and only in the active tab.

### Permission justification — storage
storage is used to save the user's preferences locally via chrome.storage.local — specifically the selected theme (light/dark) and the last-used tool, so the popup reopens in the expected state. No user content and no page data are stored, and nothing is transmitted off the device.

### Remote code
Answer: **No, I am not using remote code.** All JavaScript is bundled in the extension package. DevKit does not load, fetch, or eval any code from remote sources.

### Data usage
- The extension does **not** collect or use any user data. Leave all data-type checkboxes unchecked (or select "does not collect user data" if offered).
- Check all three certification statements:
  1. I do not sell or transfer user data to third parties, outside of the approved use cases.
  2. I do not use or transfer user data for purposes unrelated to my item's single purpose.
  3. I do not use or transfer user data to determine creditworthiness or for lending purposes.
- Then tick the final box certifying compliance with the Developer Program Policies.

## Screenshot ideas (1280×800 PNG, 3–5 recommended)
1. JSON formatter with tree view (dark theme)
2. JSON diff or image diff (Compare group)
3. QR code generator
4. Color tools with contrast checker
5. Element ruler overlay / SEO inspector on a real page
