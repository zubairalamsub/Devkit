# Chrome Web Store listing — copy-paste material

> ⚠️ Rejected twice for keyword spam. The copy below is deliberately plain marketing
> prose with only a handful of feature terms and NO comma-separated tool lists.
> Do not reintroduce keyword lists (e.g. "JSON, JWT, Base64, regex, …") anywhere in
> the summary or description — that phrasing is exactly what the spam filter flags.

## Name
DevKit - All-in-One Developer Tools

## Category
Developer Tools

## Summary (max 132 chars)
45+ developer utilities in one fast, private popup — no servers, no tracking, no clutter.

## Description

DevKit brings the small utilities developers reach for all day into one fast popup, so you stop installing a separate extension for every little task.

Open it, search or pick a tool, and go. Everything lives in a searchable sidebar with favorites and a recent list, so what you need is always a click away.

What you can do with DevKit:
• Format, validate, and explore your data, and decode tokens.
• Generate IDs, hashes, secure passwords, and QR codes — all on your own machine.
• Compare two things — text, data, or images — and see exactly what changed.
• Work with color: convert formats, pick any pixel on screen, and check contrast.
• Clean up and reshape text.
• Inspect the page you're on and audit it for SEO and performance.

Private by design
DevKit runs entirely in your browser. It makes no network requests — no servers, no analytics, no accounts, and no data collection. It asks for only three narrow permissions (activeTab, scripting, storage), and it acts on a page only when you click a tool.

Free and open source, with dark and light themes and a keyboard shortcut (Alt+Shift+D).

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
