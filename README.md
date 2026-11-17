# Repo Vault — the phone app

Rob's repo collectors as a real app on his phone. Expo (React Native) + React
Native Elements. Dark, warm ink + brass, shelves on the front screen.

## What it does

- **Shelves on the front screen** — big tiles, one per category, each with its
  repo count and a peek at what's sitting on it. Tap a shelf to see its repos
  as cards. Plus three built-in shelves: **All**, **Top rated** (4–5 stars),
  **New** (added in the last 60 days).
- **Every repo card shows:** name, link (taps open GitHub), date installed,
  category, stars, note — plus the description and status badge
  (FORGE-INSTALLED / LATER / VAULT-ONLY / UNRESOLVED).
- **Stars and notes persist on the phone** (AsyncStorage). The old web app
  lost stars when the page closed; this one doesn't.
- **Categories are yours.** Manage shelves: add, rename, delete. A shelf with
  repos on it can't be deleted until you move them off it. Move a repo between
  shelves from its card. Categories are data, never hardcoded.
- **Search** on the home screen (across the whole vault) and inside each
  shelf.
- **Add a repo** from any category shelf — name, link, description, status.
  Dated today; change the date on the card.
- **Edit the date installed** on any card (tap it, YYYY-MM-DD).
- Seeded with the 77 repos from the web collectors, all dated 2026-09-19
  (the VAULT.md batch dates). First launch copies the seed into the phone's
  storage; edits never touch the seed file.

## Run it (dev)

```bash
cd repo-vault-app
npm install
npx expo start
```

Then press `a` for an Android emulator, or scan the QR code with **Expo Go**
on your phone. Note: Expo Go does not bundle every native module in this
app, so if something looks off in Expo Go, use a development build or the
APK below instead — the APK is the real thing.

## How the APK gets on Rob's phone

Two ways, both free, no card needed. Pick one.

### Option A — EAS Build (recommended, simplest)

Expo's free cloud build. Needs a **free Expo account** — that's the one thing
Rob has to make (expo.dev, sign up, no card).

```bash
npm install -g eas-cli
eas login            # the Expo account
eas build -p android --profile preview
```

EAS builds the APK in the cloud and gives a download link. Install the APK
on the phone (allow "install unknown apps" for the browser once). The
`preview` profile in `eas.json` builds an APK (not an app bundle), which is
what sideloading wants.

### Option B — GitHub Actions (no Expo account)

Push this folder to a GitHub repo, then add a workflow like the Tube I.Q.
one (`build-apk.yml`: checkout, setup Java 17, `npx expo prebuild`,
`./gradlew assembleDebug`). GitHub builds the APK on every push to main and
keeps it as an artifact for 30 days. Needs: the repo, and `npx expo prebuild`
run once to generate the `android/` folder (it's gitignored here — generated,
never edited by hand).

## Stack

- Expo SDK 58, React Native 0.88, React 19
- @rneui/themed + @rneui/base 5.0.0 (React Native Elements), with
  react-native-safe-area-context and react-native-vector-icons
- Expo Router (file-based routes in `src/app/`)
- @react-native-async-storage/async-storage for persistence
- Icons from `@expo/vector-icons` (Feather) — the Expo-native path, so the
  glyphs work in Expo Go, dev builds, and the APK alike

## Project layout

```
app.json                 name, slug, scheme, icon, splash plugin
eas.json                 EAS build profiles (preview = APK)
src/app/_layout.tsx      providers (theme, safe area, vault) + Stack
src/app/index.tsx        home — search + shelves
src/app/shelf/[id].tsx   one shelf — search + repo cards + add repo
src/components/
  ShelfTile.tsx          the shelf tile (the showpiece)
  RepoCard.tsx           expandable card: stars, note, date, move, delete
  CategoryManager.tsx    add / rename / delete shelves
  AddRepo.tsx            add a repo to a shelf
src/data/seed.ts         the 77 repos + 7 categories (generated from the
                         web collectors' JSON — never edited by hand)
src/store.tsx            AsyncStorage load/save + all vault actions
src/shelves.ts           shelf resolution (All / Top rated / New / category)
src/theme.ts             palette, radii, spacing, RNE theme
assets/                  custom icon + splash (ink + brass shelf mark)
```

## Notes for the next build

- The `@rneui/template` scaffold is stale (Expo SDK 47 / React Native 0.64,
  from 2022), so this project was scaffolded on plain modern Expo and RNE
  was installed on top. Do not re-scaffold from that template.
- A few installs needed `--legacy-peer-deps`: RNE 5's test-library peer chain
  (`@testing-library/react-native` 13 vs expo-router wanting 14) conflicts
  with strict npm resolution. Those are test-only packages, never imported at
  runtime. `npx expo-doctor` passes 20/20.
- `dist/` is the Expo web export (proof the app bundles). It is not the app
  and not a deliverable — the app is this project, and the APK is the thing
  that goes on the phone.
