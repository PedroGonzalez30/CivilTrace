This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npm test                    # jest-expo + React Native Testing Library (__tests__/*-test.ts(x))
npm run test:cobertura      # coverage; 60 % per feature file (thresholds in package.json)
npm run verificar-formato   # Prettier check (npm run formatear to fix)
```

Run lint, typecheck and tests before declaring any task done.

- API address: copy `.env.example` to `.env.local` (git-ignored) and restart with
  `npx expo start --clear`; otherwise the app says the server address is not configured.

- Dev dependencies: `npx expo install <pkg> -- --dev` may still save them under `dependencies`;
  move them to `devDependencies` by hand.
- Testing Library 14: `render`, `fireEvent` and `renderHook` are **async** — always `await` them.
- Native modules (SQLite, camera, network, location, file system, secure store, crypto) are
  replaced in `jest.setup.ts`. Use `jest.clearAllMocks()` (not `resetAllMocks`, which wipes those
  doubles). Local storage in tests: `__tests__/dobles/repositorioEnMemoria.ts`.
- Offline attendance code lives in `src/servicios/local/` (SQLite queue, offline package, sync).
- Jest runs with `maxWorkers: 50%`; on low-memory machines use `--maxWorkers=2`.

## Navigation & Routing

- Use **React Navigation** (`@react-navigation/native`, `native-stack`, `bottom-tabs`) for all navigation — **not Expo Router** (team decision T-01 in `docs/decisiones.md`). Do not add `expo-router` or a `src/app/` routes folder.
- Navigators live in `src/navegacion/`; screens live in `src/pantallas/`.
- Docs: https://reactnavigation.org/docs/getting-started

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
