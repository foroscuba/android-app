# Screenshots

Place phone screenshots here. The landing page (`docs/index.html`) and
the README hero block reference filenames in this folder.

## Specs

| Surface | Required count | Format | Aspect | Min resolution | Filename suggestion |
| --- | --- | --- | --- | --- | --- |
| Play Store phone | 2–8 | JPEG or 24-bit PNG, no transparency | 9:16 or 16:9 | 320 px on the short side, 3840 px max on the long side | `play-01-home.png` … `play-08-thread.png` |
| README hero | 1 | PNG | landscape works best | ~1600×900 | `readme-hero.png` |
| Landing-page gallery | 3 | PNG | 9:19.5 (modern phone) | 1080×2340 | `01-home.png`, `02-thread.png`, `03-onboarding.png` |

## How to capture

```
# On a connected device
adb shell screencap -p /sdcard/shot.png
adb pull /sdcard/shot.png ./docs/screenshots/01-home.png
```

Or use Android Studio's emulator camera button. Capture in the
post-onboarding state with the dark forum visible, since the splash and
onboarding screens are too short-lived to showcase the app.

## Once you've added the files

In `docs/index.html`, find the commented-out `<div class="screenshots">`
block and uncomment it. In `README.md`, replace the placeholder hero
line with `![Screenshot](docs/screenshots/readme-hero.png)`.
