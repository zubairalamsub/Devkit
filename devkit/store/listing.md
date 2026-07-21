# Chrome Web Store listing — copy-paste material

## Name
DevKit - All-in-One Developer Tools

## Summary (max 132 chars)
45+ dev tools in one: JSON, JWT, Base64, regex, QR codes, diff & compare, color picker, page ruler, SEO & performance audit.

## Category
Developer Tools

## Description

Stop juggling a dozen single-purpose extensions. DevKit packs 45+ essential developer tools into one fast, private popup.

★ CODE & DATA
• JSON formatter, validator & minifier with a collapsible tree view and error line/column
• Base64 encode/decode (UTF-8 safe, URL-safe variant)
• URL encoder/decoder + full URL parser with query-param table
• JWT decoder with human-readable claims and expiry check
• HTML entity escape/unescape
• Number base converter (binary / octal / decimal / hex / any base to 36)
• CSV ⇄ JSON converter
• Query string ⇄ JSON converter
• SQL formatter
• Markdown preview with live rendering

★ GENERATORS
• UUID v4 generator (bulk up to 500)
• SHA-1 / SHA-256 / SHA-384 / SHA-512 hashes (Web Crypto, computed locally)
• Secure password generator with entropy meter
• QR code generator — download or copy as PNG
• Mock data generator (names, emails, phones, IPs and more)
• Lorem ipsum (words / sentences / paragraphs)

★ DESIGN
• Color converter: HEX ⇄ RGB ⇄ HSL
• Screen eyedropper — pick any pixel, even outside the browser
• WCAG contrast checker (AA / AAA, normal & large text)
• px ⇄ rem calculator with quick-reference table
• Box-shadow generator with live preview
• Gradient generator (linear / radial) with live preview

★ TEXT
• Regex tester with live match highlighting and capture-group table
• Case converter: camelCase, PascalCase, snake_case, kebab-case + 6 more
• Word & character counter with reading time
• Line tools: sort, dedupe, reverse, shuffle, trim, number
• Slugify — turn any text into a URL slug
• String escaper for JS / JSON literals

★ COMPARE
• Text diff — line-by-line, added/removed highlighting
• JSON diff — structural comparison with paths, added/removed/changed
• List compare — what's unique to each list and what they share
• Text similarity — edit distance, similarity % and inline word diff
• Date/time diff — duration between two dates, breakdown and totals
• Number diff — difference, percentage change and ratio
• Image diff — highlight the pixels that differ between two images

★ TIME
• Unix timestamp ⇄ date converter, live epoch clock, relative time
• Cron expression explainer with the next upcoming run times

★ REFERENCE
• HTTP status codes (searchable)
• MIME types by file extension (searchable)
• User-Agent parser (browser / OS / engine / device)

★ ON-PAGE TOOLS
• Element ruler — hover any element for size, margin/padding and selector
• Font inspector — hover text for family, size, weight, line-height, color
• Outline all elements — depth-tinted layout debugging
• Palette extractor — every color actually used on the page, click to copy
• Screenshot the visible tab — download PNG or copy to clipboard

★ PAGE ANALYSIS
• SEO audit: title/description lengths, OpenGraph & Twitter cards, canonical, H1 count, images missing alt
• Performance: TTFB, FCP, LCP, CLS, load times, resource breakdown by type
• Storage viewer: localStorage, sessionStorage and cookies — inspect, delete, clear
• Tech detector: React, Vue, Angular, Next.js, WordPress, Tailwind and more

★ PRIVATE BY DESIGN
Everything runs locally in your browser. No servers, no accounts, no analytics, no data collection — and only three narrow permissions (activeTab, scripting, storage). DevKit can only touch a page when you click a button.

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
