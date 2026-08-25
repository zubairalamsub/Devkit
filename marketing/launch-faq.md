# DevKit — Launch-day kit (comment replies, checklist, demo GIF)

Keep this open while you launch. Reply fast and human in the first 2–3 hours —
that window decides whether a Show HN / Reddit post takes off.

**Links:** Store: https://chromewebstore.google.com/detail/bkchkmepmeccpehnfgnecmdobfhejpoc ·
Site: https://zubairalamsub.github.io/Devkit/ · Code: https://github.com/zubairalamsub/Devkit

---

## Tone rules
- Be a builder, not a marketer. Answer the actual question first, links second.
- Concede real limitations openly — it earns trust and defuses pile-ons.
- Never argue. Thank critics, note the point, say what you'll do.
- Feature requests: "Good idea — opening an issue for it" beats "great feedback!".

---

## Anticipated questions & ready replies

**"Why not just use the browser DevTools / [existing single-purpose extension]?"**
> DevTools is great for debugging a page; DevKit is for the little standalone tasks —
> format some JSON, decode a token, diff two blobs, generate a QR — without leaving
> the tab or opening a website. The point is having all of them in one place instead
> of ten extensions, and having it work entirely offline.

**"How do I know it's actually private / doesn't phone home?"**
> It makes zero network requests — you can verify in the Network tab, or just read the
> source (it's small, no build step, no third-party libraries). Only permissions are
> activeTab, scripting, and storage; there are no host permissions, so it can't sit in
> the background watching pages. It only runs on a tab when you click a tool.

**"Is it open source? Can I load it unpacked / self-host?"**
> Yes — MIT, all the code is on GitHub. You can clone it and Load Unpacked in
> chrome://extensions to run your own copy. No build step needed.

**"Manifest V3 — isn't that a downgrade / spyware risk?"**
> This uses MV3 the boring way: no remote code, no webRequest blocking, no background
> data collection. MV3's remote-code ban actually helps here — everything ships in the
> package and is auditable.

**"45 tools sounds like feature bloat / a kitchen sink."**
> Fair worry. It's a launcher, not a suite — each tool is a small focused panel, the
> sidebar is searchable, and there's a favorites + recent list so you only ever see the
> handful you use. Nothing loads until you open it.

**"How does the QR generator / JSON diff work?"**
> The QR encoder is a from-scratch port of Nayuki's algorithm (Reed–Solomon ECC, mask
> selection) — verified against the canonical test vector, no library. The JSON diff is
> structural: it walks both objects and reports added/removed/changed by path, not a
> line diff. Happy to go deeper if useful.

**"Firefox / Edge / Safari version?"**
> Edge should work today (it's Chromium — you can load the same package). Firefox is on
> the list; it needs a few manifest tweaks. Not planning Safari right now. (Adjust to
> what's true when asked.)

**"What's the catch? Monetization? Will it stay free?"**
> No catch. It's free and open source, collects nothing, and has no ads. If I ever add a
> paid tier it'd be for heavier/pro features — the current toolset stays free.

**"Can you add [tool X]?"**
> Good call — please open an issue (or reply here) and I'll track it:
> https://github.com/zubairalamsub/Devkit/issues . Quick wins get in fast.

**"How is this different from DevUtils / Frontend Hero / [other toolkit]?"**
> Similar spirit. DevKit's angle is: browser extension (not a separate app), fully
> offline/no-tracking, open source, and it spans both data tools and on-page tools
> (ruler, SEO/perf audit) in one place. Use whatever fits — happy to hear what's missing.

**"Found a bug: [X]"**
> Thanks — that shouldn't happen. Could you open an issue with the steps/input? I'll
> fix it quickly: https://github.com/zubairalamsub/Devkit/issues

**"Nice, but I'd want a keyboard-first workflow."**
> It opens with the search focused and supports arrow-keys + Enter to jump to any tool,
> plus Alt+Shift+D to open the popup. More shortcuts are easy to add if you have a flow
> in mind.

---

## Launch-day checklist
- [ ] Promo tiles uploaded to the store listing (440×280 + 1400×560).
- [ ] Post **Show HN** (morning US time tends to do best). Immediately add the first comment.
- [ ] Post to **one** subreddit (respect its self-promo rules); don't cross-post everywhere at once.
- [ ] Pin the GitHub repo; make sure the README's Add-to-Chrome + site links work.
- [ ] Watch HN/Reddit/GitHub issues and reply within minutes for the first few hours.
- [ ] Ask a few people who actually use it for an honest store review (never incentivize).
- [ ] Note recurring feature requests → open GitHub issues so commenters see momentum.
- [ ] Day 2: post a short dev.to build story linking back.

---

## Demo GIF — quick recipe (do this yourself; ~10 min)
A 5–10s looping GIF on the store listing, README, and posts lifts conversions a lot.
I can't screen-record the live extension from here, so:

1. Install **ScreenToGif** (free, Windows): https://www.screentogif.com/
2. Open the DevKit popup on a normal page. Record a tight window around it.
3. Shot list (keep it snappy, ~8s total):
   - Type in search → arrow down → open **JSON Formatter**, click **Format**.
   - Click **JSON Diff** in the sidebar, show the colored diff.
   - Click **QR Code**, show it generate.
   - Star a tool → show it appear under **★ Favorites**.
4. Export as GIF, target < 5 MB and ≤ 800px wide so it loads fast.
5. Drop it in the repo (e.g. `docs/img/demo.gif`), embed at the top of `README.md`, and
   attach it to the Reddit/dev.to posts. (Store screenshots must stay PNG/JPEG — the GIF
   is for the repo and posts, not the screenshot slots.)
