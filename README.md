# DevKit — All-in-One Developer Tools

A Chrome extension (Manifest V3) that bundles **45+ developer tools** into one fast, private popup. 100% client-side — no servers, no analytics, no data collection. Permissions are limited to `activeTab`, `scripting`, and `storage`.

> The loadable extension lives in [`devkit/`](devkit/). Full docs: [devkit/README.md](devkit/README.md).

## Tools at a glance

- **Code & Data** — JSON formatter/tree, Base64, URL, HTML entities, JWT decoder, number base, CSV ⇄ JSON, query string ⇄ JSON, SQL formatter, Markdown preview
- **Generators** — UUID, SHA hashes, secure passwords, QR codes, mock data, lorem ipsum
- **Design** — color converter, screen eyedropper, WCAG contrast, px⇄rem, box-shadow, gradient
- **Text** — regex tester, case converter, word counter, line tools, slugify, string escaper
- **Compare** — text diff, JSON diff, list compare, text similarity, date diff, number diff, image diff
- **Time** — timestamp converter, cron explainer
- **Page tools** — element ruler, font inspector, outline overlay, palette extractor, screenshot
- **Page analysis** — SEO audit, performance/Core Web Vitals, storage viewer, tech detector
- **Reference** — HTTP status codes, MIME types, User-Agent parser

## Install (development)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the [`devkit/`](devkit/) folder
4. Shortcut: `Alt+Shift+D`

## Preview the popup in a browser

```bash
node tools/dev-server.js
# then open http://localhost:8123/popup/popup.html
```

## Privacy

DevKit collects nothing. See [PRIVACY.md](PRIVACY.md).

## License

[MIT](LICENSE) © Zubair Alam
