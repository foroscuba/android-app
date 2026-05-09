# Data Safety questionnaire — pre-filled answers

For the Google Play Console **Store settings → Data safety** form.
Source of truth: `/PRIVACY.md` and `docs/privacy.html`.

## Data collection and security

### Does your app collect or share any of the required user data types?

**Yes** — limited to:

- Device or other IDs (Firebase Cloud Messaging registration token)
- App activity (forum session via WebView, treated as first-party
  fcuba.net data; we do not collect or process it server-side)

### Is all of the user data collected by your app encrypted in transit?

**Yes.** All traffic to fcuba.net is HTTPS (the Capacitor server
config sets `androidScheme: "https"` and `usesCleartextTraffic` is
`false` in `AndroidManifest.xml`). Firebase Cloud Messaging is HTTPS.

### Do you provide a way for users to request that their data be deleted?

**Yes — partially in-app, partially server-side.**
- App data: Settings → Apps → FCuba → Storage → Clear data wipes the
  local cookie, FCM token, and cached pages.
- Server data: users can ask the forum admin
  (`lazarogomezmunoz@gmail.com`) to delete their forum account, which
  removes the FCM token row and forum profile. Stated in
  `PRIVACY.md`.

## Per-data-type answers

### Personal info → Name

Not collected.

### Personal info → Email address

Not collected by the app. (The forum has an email field on signup
but that's a fcuba.net data flow, not the app.)

### Personal info → User IDs

Not collected by the app. (XenForo has internal user IDs but they
never leave the forum.)

### Personal info → Address

Not collected.

### Personal info → Phone number

Not collected.

### Personal info → Race and ethnicity

Not collected.

### Personal info → Political or religious beliefs

Not collected.

### Personal info → Sexual orientation

Not collected.

### Personal info → Other info

Not collected.

### Financial info

Not collected. No payments in-app.

### Health and fitness

Not collected.

### Messages

Not collected. (Forum DMs live on the server, never relayed through
us.)

### Photos and videos

Not collected.

### Audio files

Not collected.

### Files and docs

Not collected.

### Calendar

Not collected.

### Contacts

Not collected.

### App activity → App interactions

Not collected.

### App activity → In-app search history

Not collected.

### App activity → Installed apps

Not collected.

### App activity → Other user-generated content

**Posted to fcuba.net by the user; not collected by the app itself.**
Forum posts are first-party fcuba.net content covered by the forum's
own privacy practices. Do not declare in this section unless Play
review pushes back.

### App activity → Other actions

Not collected.

### Web browsing

Not collected.

### App info and performance → Crash logs

Not collected. (No Crashlytics or similar SDK is included.)

### App info and performance → Diagnostics

Not collected.

### App info and performance → Other app performance data

Not collected.

### Device or other IDs

**Collected.**
- **Type:** Device or other IDs (specifically: Firebase Cloud
  Messaging registration token)
- **Why:** App functionality (push notifications)
- **Required or optional?** Optional — user can deny `POST_NOTIFICATIONS`
  permission and the app keeps working.
- **Encrypted in transit:** Yes
- **Shared with third parties:** No (not shared beyond Firebase, which
  is the delivery infrastructure, not a third party in the data-safety
  sense per Google's policy).
- **Collected** (not shared).

## Summary that will appear on the Play listing

> This app collects:
> - **Device or other IDs** — for app functionality. Optional.
>
> Data is encrypted in transit and not shared with third parties.
> You can request deletion via the in-app data clear or by emailing
> the developer.
