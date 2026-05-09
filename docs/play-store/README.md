# Google Play Console submission — checklist

Internal notes for the first listing of `net.fcuba.app`. Not published.

## 0. Prerequisites

- Google Play Developer account ($25 one-off). Use a long-lived
  Google account, not a personal alias that could be deactivated.
- Verified developer identity (Google requires gov-ID + address since
  2024 for new individual accounts).
- The signing keystore and its passwords stored offline in two
  separate places. **Losing it means you can never publish updates
  to the same listing.**

## 1. Create the app

Console → "Create app":

- **App name:** `FCuba`
- **Default language:** Spanish (Spain) — `es-ES`
- **App or game:** App
- **Free or paid:** Free
- Declarations: confirm the app complies with the Developer Program
  Policies and US export laws.

## 2. Set up the listing

### Store listing

- **Short description (≤80 chars):** see `descriptions.es.md`
- **Full description (≤4000 chars):** see `descriptions.es.md`
- **App icon:** 512×512 PNG with transparency.
  Source-of-truth is `/resources/icon.png` (1024×1024); resize to 512.
- **Feature graphic:** 1024×500 PNG/JPEG (no transparency).
  Place final file at `docs/play-store/feature-graphic.png` for
  reference. **Owner needs to design this** — typically the logo
  on a brand-coloured background with the tagline.
- **Phone screenshots:** 2–8 PNGs at 9:16 or 16:9, min 320 px short
  side. See `docs/screenshots/README.md` for capture instructions.
- **App category:** *Social* (forum). Tag: *Communication* secondary.
- **Contact details:** email `lazarogomezmunoz@gmail.com` (or a
  dedicated support address). Website `https://fcuba.net`.
- **Privacy policy URL:**
  `https://foroscuba.github.io/android-app/privacy.html`

### Store settings → App access

> "All or some functionality is restricted." → "Yes."
> Provide test credentials (a fcuba.net account in good standing) so
> the Play reviewer can sign in. Note this in the comments box.

### Store settings → Ads

"This app does not contain ads."

### Store settings → Content rating

Fill the IARC questionnaire. Expected outcome:
- Violence: none
- Sexuality: none
- Profanity: user-generated content possible (check "Yes" — the forum
  is a UGC platform; rating typically lands at *Teen 13+*)
- Gambling: none
- Drug references: none

### Store settings → Target audience and content

- **Target audience:** 13+
- **App appeals to children:** No
- **Privacy policy URL** prefilled.
- **Cooperation with parents/guardians:** N/A (not for kids).

### Store settings → Data safety

See `data-safety.md` for pre-filled answers. The summary:
no analytics, no advertising, only an FCM token + a forum session
cookie + IP visible to Firebase/server. All listed as **collected,
not shared, encrypted in transit, optional via permission denial.**

### Store settings → News apps

Not a news app.

### Store settings → Government apps

Not a government app.

### Store settings → Health apps

Not a health app.

### Store settings → Financial features

Not a finance app.

## 3. Upload the AAB

1. Trigger CI on `main` (or `workflow_dispatch`). Wait for the rolling
   `latest` release to refresh.
2. Download `fcuba-release.aab` from
   `https://github.com/foroscuba/android-app/releases/download/latest/fcuba-release.aab`.
3. Console → Production → Create new release → upload AAB.
4. Add release notes (max 500 chars per language). Spanish notes
   should match the most recent commit summary.

## 4. Roll out

For the first submission:
- **Closed testing** track first (recommended): invite ~5 testers
  by email, wait 14 days of "active testing" before applying for
  production access (Google's 2024 requirement for new accounts).
- After the 14-day window, promote the closed-test build to
  production.

## 5. After approval

- Add the real Play listing URL to the README badge link
  (currently `#`).
- Add a `Get it on Google Play` badge link to `docs/index.html`
  (currently disabled / "Disponible próximamente").
- Bump `versionCode` and `versionName` in
  `android/app/build.gradle:10-11` for every subsequent upload.
- Keep the AAB build path in CI in sync with whatever Play Console
  expects (currently AAB at root, asset name `fcuba-release.aab`).

## Version-bump strategy

`android/app/build.gradle:10-11`:

```
versionCode 1     # MUST increment by ≥1 every Play upload
versionName "1.0" # human-readable, bump as you wish (1.0 → 1.0.1 → 1.1)
```

Manual for now. Don't automate until you've shipped a few releases by
hand and know the cadence.
