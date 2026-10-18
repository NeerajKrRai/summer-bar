# CLAUDE.md — Neeksha's Summer Refreshment Bar

Kawaii make-believe cocktail-maker app built by **Neeksha (age 8)** with Claude; her dad **Neeraj** is continuing it here. Now a PWA (web assets in `www/`) wrapped for Android with **Capacitor** (`android/`), headed for Google Play as a children's app.

## Read first

- **This file** is current; **`COMPLIANCE.md`** is the Play-launch runbook; **`store-assets/LISTING.md`** has the store copy/assets.
- **`HANDOVER_for_Neeraj.md`** (the original handover from Neeksha's sessions — feature intent + history, but describes the retired single-file era; this file wins on any conflict) is kept **local-only / gitignored** now, out of the public repo; recover it from git history if needed (`git log --all --oneline -- HANDOVER_for_Neeraj.md`).

## Hard constraints

- **Age-appropriate always** — Neeksha is 8. All "cocktail" content is imaginary make-believe (fruits, herbs, tea — no alcohol references). Defer parental decisions to Neeraj.
- **Keep the aesthetic** — kawaii/anime visual language, kaomoji characters `♪( ´∀｀)` `人(´∀｀ )♪`, soft palette (rosy charcoal `#2B2B2B`, royal green `#2D6A4F`/`#52B788`, dusty rose `#C97B84`), Playfair Display + DM Sans.
- **No backend, no network** — runs entirely in the browser; state lives in localStorage (`nk_ck`, `nk_glaze`, `nk_owned`, `nk_chef`, `nk_vip`). Fonts are self-hosted in `www/fonts/`; the Android manifest declares **zero permissions** (not even INTERNET). Never add an external request or SDK without Neeraj signing off — the children's-compliance posture (see `COMPLIANCE.md`) depends on it.

## Gotchas (learned the hard way — see handover §Known Issues)

- Some **kaomoji contain hidden backticks** that break JS template literals. After editing anything near kaomoji strings, run `node --check` on the edited `js/*.js` file.
- Don't store generated images in localStorage (`QuotaExceededError`) — generate fresh on download.
- No `confirm()` dialogs — blocked on many mobile browsers.
- Don't rely on `event.target` inside arrow functions — pass the element as a parameter.

## Current state (2026-07-05)

- **Layout:** `www/` is the whole web app (Capacitor `webDir`): `index.html`, `css/styles.css`, `js/` (10 classic scripts in load order: `data, app, cocktail, reactions, screens, glaze, drink, file, fx, pwa`), `fonts/` (self-hosted woff2), `icons/`, `manifest.json`, `sw.js`. `android/` is the generated Capacitor project (committed; build outputs gitignored). `resources/` holds icon/splash source art.
- **Classic scripts, one global scope — NOT ES modules.** Inline `onclick="…"` handlers in index.html call these globals, and script load order matters. Don't add `type="module"` or `import`/`export` without reworking all inline handlers.
- **Roadmap:** ~~1) multi-file split~~ ✅ → ~~2) PWA~~ ✅ → **3) Play Store** — see `COMPLIANCE.md` (launch runbook) and `PRIVACY.md` (ready to host). Polish ideas: Web Audio ASMR, straw animation, haptics, time-of-day beach.
- A max-effort review (2026-07-05) fixed 15 verified bugs; notable behaviors that are now DELIBERATE: glaze is earned at save-time (5/VIP item, not on tile-tap); VIP unlock persists via `nk_vip` (deleting cards can't revoke it); herb pack/tea bag/VIP picks live in `gSel` like every other selection; one save per drink (`saving` guard); auto-navigation timers are cancelled by any manual `go()`.

## Build & preview

- Web preview: `.claude/launch.json` → `summer-bar` (4173) / `summer-bar-test` (4174), both `python3 -m http.server --directory www`.
- Android: `npx cap sync android` after ANY `www/` change, then `npx cap open android` (Android Studio builds/signs; no system Java needed).
- Shipping a web/PWA update? Bump `CACHE` in `www/sw.js` — the service worker is cache-first and `ignoreSearch:true`, so query-string cache-busting does NOT work.
- **Live web hosting:** GitHub repo `NeerajKrRai/summer-bar`; the site is the `gh-pages` branch (refresh it via `git commit-tree HEAD:www` + force-push; `.nojekyll` required). Public URL **https://apps.neeksha.com/summer-bar/** — the domain lives on the user-site hub repo `NeerajKrRai.github.io` ("Neeksha's Apps" landing page; new apps = new repos, they appear under the same domain automatically). Cloudflare proxies the `apps` CNAME (orange, SSL **"Full (strict)"** as of 2026-10-18). GitHub's own Let's Encrypt cert for apps.neeksha.com IS now minted (done by briefly greying the `apps` record so GitHub could validate, then re-proxying), so strict validates the CF→GitHub hop. If you ever need to re-mint (cert issues): grey the `apps` record, re-save the custom domain in `NeerajKrRai.github.io` Settings→Pages until the cert shows issued, then re-orange — do NOT leave it on strict while the origin cert is invalid or the site 525s.

## Working style

Neeksha communicates in short bursts and redirects mid-build — adapt quickly, don't over-explain. When she's driving, keep responses playful and visual.
