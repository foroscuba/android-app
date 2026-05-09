# `/docs/` — public-facing assets

This folder is published as a GitHub Pages site at
<https://foroscuba.github.io/android-app/>.

## What's in here

| Path | Purpose |
| --- | --- |
| `index.html` | Public download landing page (Spanish, dark theme matching the app). Big "Descargar APK" button → rolling `latest` GitHub release asset. |
| `privacy.html` | Privacy policy for the Play Store listing. Same content as `/PRIVACY.md`. |
| `img/logo.png` | Copy of `/resources/icon.png` — the source-of-truth 1024×1024 logo. Replace `/resources/icon.png` and re-copy this file when the logo changes. |
| `badges/play-store.png` | Static copy of Google's "Get it on Google Play" badge. |
| `badges/get-it-on-github.png` | Kunzisoft "Get it on GitHub" badge. |
| `screenshots/` | Place phone screenshots here (PNG, 1080×2400 or similar 9:19.5). The landing page has a commented-out gallery ready to enable once images exist. |
| `play-store/` | Internal notes & templates for the Play Console submission (not published in any meaningful way, just convenient to keep here). |

## Enabling GitHub Pages (one-time)

In **Settings → Pages**:

1. **Source:** *Deploy from a branch*
2. **Branch:** `main`
3. **Folder:** `/docs`
4. Save.

GitHub builds the site automatically on every push to `main` that
touches `/docs/`. The published URL is
`https://<owner>.github.io/<repo>/`, i.e.
`https://foroscuba.github.io/android-app/`.

## Updating

- Logo / icon → replace `/resources/icon.png`, then `Copy-Item
  resources/icon.png docs/img/logo.png -Force`.
- Privacy text → edit `/PRIVACY.md` and mirror the same content into
  `docs/privacy.html`. Keep the effective date in sync.
- Screenshots → drop PNGs into `docs/screenshots/` and uncomment the
  gallery block in `index.html`.
