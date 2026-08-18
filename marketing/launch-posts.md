# DevKit — Launch posts (ready to edit & publish)

**Links to use everywhere**
- Chrome Web Store: https://chromewebstore.google.com/detail/bkchkmepmeccpehnfgnecmdobfhejpoc
- Website: https://zubairalamsub.github.io/Devkit/
- GitHub (open source): https://github.com/zubairalamsub/Devkit

**Positioning (the one line that sells it):** 45+ developer tools in one Chrome extension that runs 100% locally — no servers, no tracking, no account.

> Tips before posting: read each community's self-promotion rules; reply to every comment fast in the first few hours; never ask for upvotes or fake reviews (against store + community rules).

---

## 1) Hacker News — "Show HN"

**Title (≤ 80 chars, no emoji, HN style):**
```
Show HN: DevKit – 45+ developer tools in one private Chrome extension
```

**First comment (post right after submitting):**
```
I kept installing a separate extension for every small task — JSON formatting,
JWT decoding, Base64, regex, a color picker — and got tired of the clutter and
the permissions each one asked for. So I built DevKit: 45+ tools in one popup.

A few things I cared about:
- 100% client-side. It makes zero network requests — no servers, analytics, or
  accounts. Permissions are just activeTab, scripting, and storage.
- Manifest V3, vanilla JS, no build step or third-party libraries, so the whole
  thing is auditable in a few files.
- The QR generator is a from-scratch port of Nayuki's algorithm; the JSON diff
  is structural (paths + added/removed/changed), not line-based.

It's free and MIT-licensed. Code: https://github.com/zubairalamsub/Devkit
Store: https://chromewebstore.google.com/detail/bkchkmepmeccpehnfgnecmdobfhejpoc

Happy to answer questions or take feature requests.
```

---

## 2) Reddit

Good subs: r/webdev (check the weekly "Showoff Saturday" thread), r/chrome_extensions,
r/SideProject, r/coolgithubprojects. Post to one or two, not all at once.

**Title:**
```
I built an all-in-one dev tools Chrome extension (45+ tools, 100% offline, open source)
```

**Body:**
```
I was tired of juggling a dozen single-purpose extensions, so I made DevKit — one
popup with 45+ tools I actually use:

- Code & data: JSON formatter/tree, JWT decoder, Base64, number base, CSV⇄JSON,
  SQL formatter, Markdown preview
- Generators: UUID, SHA hashes, secure passwords, QR codes, mock data
- Compare: text diff, structural JSON diff, list compare, image diff
- Design: color converter, screen eyedropper, WCAG contrast, box-shadow/gradient
- Page tools: element ruler, font inspector, SEO & performance audit, storage viewer

The main thing: it runs entirely in your browser. No servers, no analytics, no
account — just activeTab/scripting/storage permissions. Free and MIT-licensed.

Store: https://chromewebstore.google.com/detail/bkchkmepmeccpehnfgnecmdobfhejpoc
Code: https://github.com/zubairalamsub/Devkit

Would love feedback on which tools to add next.
```

---

## 3) dev.to / Hashnode article

**Title:**
```
I built a private, all-in-one developer toolkit as a Chrome extension
```

**Tags:** `chrome`, `javascript`, `webdev`, `opensource`

**Outline / draft:**
```
## The itch
Six extensions for six tiny tasks — each one more clutter and more permissions.
I wanted one popup that does the small stuff and keeps its hands off my data.

## What DevKit does
A quick tour of the 8 tool groups (screenshot each). Call out the ones people
don't expect in a "utility" extension: structural JSON diff, image pixel diff,
a real QR generator, a cron explainer, WCAG contrast.

## The constraints I set
- Zero network calls. Everything is local; the privacy policy is basically "we
  collect nothing."
- Manifest V3, no build step, no third-party libraries — easy to audit.
- Minimal permissions (activeTab/scripting/storage), no host permissions.

## One fun implementation detail
How the QR generator works (Reed–Solomon ECC, mask selection) — porting Nayuki's
algorithm and verifying it against the canonical "HELLO WORLD" test vector.

## Try it / build on it
Store + GitHub links. Invite feature requests and contributions.
```

---

## 4) Product Hunt

**Tagline (≤ 60 chars):**
```
45+ developer tools in one private Chrome extension
```

**Description:**
```
DevKit puts 45+ developer tools — JSON, JWT, Base64, regex, QR codes, diffs,
color & page-inspection tools — into one fast popup. It runs 100% locally: no
servers, no tracking, no account. Free, Manifest V3, and open source (MIT).
```

**First comment:** reuse the HN first comment, lightly trimmed.

---

## 5) Short social (X / LinkedIn / Mastodon)

```
Shipped DevKit 🧰 — 45+ developer tools in one Chrome extension.

JSON • JWT • Base64 • regex • QR • diff/compare • color • page audit — all in one
popup that runs 100% in your browser. No servers, no tracking, open source.

Free: https://zubairalamsub.github.io/Devkit/
```

---

## 6) Get listed in "best extensions" roundups
Search for recent articles like "best Chrome extensions for developers <year>" and
email/DM the authors a short, no-pressure note with the store link, the one-line
positioning, and the marquee image (`devkit/store/promo-marquee-1400x560.png`).
