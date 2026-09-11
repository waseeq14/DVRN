# DVRN Quickstart

Command-first guide to get the backend and any variant running from a clean clone. Full exploitation walkthroughs, screenshots, and the story behind each technique live in the [blog series](./README.md) - this doc only gets you to "app is running, ready to test."

All paths below assume you're in the repo root (`DVRN/`) as the starting point.

---

## 1. Backend

Start it:

```
cd backend
node server.js
```

Runs on port **3000**. Routes: `POST /api/login`, `GET /api/premium`, `GET /help`.

Confirm it's up on the host:

```
curl -s http://localhost:3000/help
```

Confirm it's reachable **from the emulator** (not just host localhost) — the app connects via `10.0.2.2:3000`, the emulator's alias for the host loopback:

```
adb shell "echo -e 'GET /help HTTP/1.0\r\n\r\n' | nc 10.0.2.2 3000"
```

Expect `HTTP/1.1 200 OK` and the help page HTML back. (The emulator's shell has no `curl`, only `nc` — this raw-HTTP-over-`nc` form is the working substitute.)

**Ordering: variants can start first.** The backend isn't needed until you actually hit Login — app install/launch doesn't touch it. But start it before you try to log in, or you'll just get a network error on the login screen (not a crash).

---

## 2. Emulator setup

Create/use any AVD running a recent Android version (API 30+ recommended). Examples below assume an AVD named `Pentest` — substitute your own name.

Start it:

```
"$HOME/Library/Android/sdk/emulator/emulator" -avd Pentest -no-snapshot-load &
```

Confirm booted:

```
until [ "$("$HOME/Library/Android/sdk/platform-tools/adb" shell getprop sys.boot_completed 2>/dev/null)" = "1" ]; do sleep 2; done
adb devices
```

Expect `emulator-5554	device` in the output.

**Variant-specific emulator state:** all three variants use the same package name (`com.dvrn.app`) and are **never installed simultaneously**. You must uninstall whichever variant is currently installed before installing a different one — see §4. There's nothing else variant-specific about emulator state (same AVD, same Frida/root setup, same backend serves all three).

You'll need `frida-server` pushed and running on the device/emulator, matching your host's Frida version. It needs root to enumerate processes — on a rooted emulator/Magisk device:

```
adb shell "su -c '/data/local/tmp/frida-server &'"
```

---

## 3. Per-variant build/run

### variant-a-no-hermes (RN 0.80.3, JSC)

JDK: **default system JDK works** (21) — no `JAVA_HOME` override needed.

Debug build + install:

```
cd variant-a-no-hermes
npx react-native start --port 8081 &
npx react-native run-android
```

Release build + install:

```
cd variant-a-no-hermes/android
./gradlew assembleRelease
cd ..
adb uninstall com.dvrn.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

Launch state: `run-android` auto-launches. For a release build (no auto-launch), `adb shell am start -n com.dvrn.app/.MainActivity`. Either way you land on **DVRN Login** (Username/Password/Login button) — no auto-login, log in with any username/password to reach Home.

Gotchas:
- RN 0.81.6 (the project's normal version ceiling) is **broken for JSC** — that's *why* this variant is pinned to 0.80.3 instead. Don't "helpfully" bump this to 0.81.6.
- The release bundle is genuinely plain ASCII JS text (not Hermes bytecode) — `file` on the extracted `assets/index.android.bundle` will confirm this if you need proof mid-session.

### variant-b-old-hermes (RN 0.70.15, Hermes/HBC89)

JDK: **JDK 17 required, explicitly.** JDK 21 fails with `Unsupported class file major version 65` (Gradle 7.5.1 in this RN version rejects it).

```
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
```

Set this in every shell you build variant-b from — it does not carry over from other terminal sessions.

Debug build + install:

```
cd variant-b-old-hermes
npx react-native start --port 8081 &
JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home" npx react-native run-android
```

Release build + install:

```
cd variant-b-old-hermes/android
JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home" ./gradlew assembleRelease
cd ..
adb uninstall com.dvrn.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

Launch state: same as variant-a — lands on **DVRN Login**, log in with any username/password.

Gotchas:
- **JDK 17, not JDK 21** — the single most likely thing to trip up a fresh session on this variant specifically.
- VB-01's AsyncStorage uses the **old** naming: `databases/RKStorage`, table `catalystLocalStorage` — not `AsyncStorage`/`Storage` like variant-a/c. Pull with `adb exec-out run-as com.dvrn.app cat /data/data/com.dvrn.app/databases/RKStorage > RKStorage.db`, then `sqlite3 RKStorage.db "SELECT * FROM catalystLocalStorage;"`.
- `MainApplication` here is **plain Java `ReactNativeHost`**, not the Kotlin `DefaultReactNativeHost` template variant-a/c use. If Frida-hooking `getJSBundleFile()` for VB-03, hook `com.facebook.react.ReactNativeHost` directly — `com.facebook.react.defaults.DefaultReactNativeHost` doesn't exist at this RN version (`ClassNotFoundException` if you try it).
- The working hbctool disassemble/reassemble toolchain (for VB-03's static-patch exploitation path) is a **merged fork**, not off-the-shelf — rebuild it with:
  ```
  python3 -m venv hbc89_fixed_venv
  hbc89_fixed_venv/bin/pip install git+https://github.com/killerkingMD/hbctool-add-vers-o-90.git
  cp scripts/variant-b/hasm_fixed.py hbc89_fixed_venv/lib/python3.14/site-packages/hbctool/hasm.py
  ```
  Replacement strings can't be longer than the original (`Overflowed string length is not supported yet`) — same-length-or-shorter edits only, and shorter ones leave a trailing leftover byte from the original unless padded to exact length.

### variant-c-new-hermes (RN 0.81.6, Hermes/HBC96)

JDK: **default system JDK works** (21) — no override needed.

Debug build + install:

```
cd variant-c-new-hermes
npx react-native start --port 8081 &
npx react-native run-android
```

Release build + install (needed for VB-03's Frida bypass — see gotcha below):

```
cd variant-c-new-hermes/android
./gradlew assembleRelease
cd ..
adb uninstall com.dvrn.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

Launch state: same — **DVRN Login**, any username/password.

Gotchas:
- **VB-03's exploitation for this variant only works against the release build.** A debug build's live Metro connection interferes with the network/bundle interception - if a Frida hook "isn't working," check you're not on a debug build first.
- `MainApplication` here **is** the Kotlin `DefaultReactNativeHost` template.
- `NativeModules` is a Proxy with only a `get` trap — `Object.keys(NativeModules)` always returns `[]`, even right after successfully calling a real module through it. Don't waste time debugging this as if it were broken; direct property access (`NativeModules.DebugModule.readInternalFile(...)`) works fine regardless.

---

## 4. Switching between variants

Every variant uses `com.dvrn.app`. Exact sequence, every time:

```
adb uninstall com.dvrn.app
```

Then kill whatever Metro is currently running — **a stale Metro instance serves the wrong project's bundle** and causes `"<AppName>" has not been registered` on launch, since Metro doesn't know you've switched projects:

```
lsof -i :8081
kill <PID from above>
```

Then `cd` into the new variant and follow its build/run steps in §3 (which start a fresh Metro from the correct directory).

Don't skip the `adb uninstall` step even though all three variants likely share the same debug-keystore signature (RN template ships the same default keystore) — old `AsyncStorage`/`RKStorage` data from the previous variant will otherwise persist and produce confusing state (e.g. reading a token that belongs to a different variant's session).


