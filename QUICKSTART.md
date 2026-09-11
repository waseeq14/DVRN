# DVRN Quickstart

Command-first. Full exploitation walkthroughs live in each variant's `docs/verification-log.md` — this doc only gets you to "app is running, ready to test."

All paths below assume `cd /Users/waseeq/Workspace/DVRN` as the starting point.

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

AVD name: **`Pentest`**.

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

**Variant-specific emulator state:** all three variants use the same package name (`com.dvrn.app`) and are **never installed simultaneously**. You must uninstall whichever variant is currently installed before installing a different one — see §4. There's nothing else variant-specific about emulator state (same AVD, same Frida/Magisk setup, same backend serves all three).

`frida-server` is pre-staged at `/data/local/tmp/frida-server` on this AVD already — don't re-push it. It needs root to enumerate processes; this AVD has Magisk, so:

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

Variant-specific gotchas (from `variant-a-no-hermes/docs/verification-log.md`):
- RN 0.81.6 (the project's normal version ceiling) is **broken for JSC** — that's *why* this variant is pinned to 0.80.3 instead. Don't "helpfully" bump this to 0.81.6.
- The release bundle is genuinely plain ASCII JS text (not Hermes bytecode) — `file android/app/build/outputs/apk/release/app-release.apk`'s extracted `assets/index.android.bundle` will confirm this if you need proof mid-session.

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

Variant-specific gotchas (from `variant-b-old-hermes/docs/verification-log.md`):
- **JDK 17, not JDK 21** — the single most likely thing to trip up a fresh session on this variant specifically.
- VB-01's AsyncStorage uses the **old** naming: `databases/RKStorage`, table `catalystLocalStorage` — not `AsyncStorage`/`Storage` like variant-a/c. Pull with `adb exec-out run-as com.dvrn.app cat /data/data/com.dvrn.app/databases/RKStorage > RKStorage.db`, then `sqlite3 RKStorage.db "SELECT * FROM catalystLocalStorage;"`.
- `MainApplication` here is **plain Java `ReactNativeHost`**, not the Kotlin `DefaultReactNativeHost` template variant-a/c use. If Frida-hooking `getJSBundleFile()` for VB-03, hook `com.facebook.react.ReactNativeHost` directly — `com.facebook.react.defaults.DefaultReactNativeHost` doesn't exist at this RN version (`ClassNotFoundException` if you try it).
- The working hbctool disassemble/reassemble toolchain (for VB-02/VB-03's static-patch exploitation path) is a **merged fork**, not off-the-shelf — rebuild it with:
  ```
  python3 -m venv hbc89_fixed_venv
  hbc89_fixed_venv/bin/pip install git+https://github.com/killerkingMD/hbctool-add-vers-o-90.git
  cp variant-b-old-hermes/docs/hasm_fixed.py hbc89_fixed_venv/lib/python3.14/site-packages/hbctool/hasm.py
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

Variant-specific gotchas (from `variant-c-new-hermes/docs/verification-log.md`):
- **VB-03's `getJSBundleFile()` Frida bypass only works against the release build.** A debug build's live Metro connection overrides whatever the hook returns — the hook fires and logs correctly, but the app keeps loading from Metro anyway, silently. If a Frida hook "isn't working," check you're not on a debug build first.
- `MainApplication` here **is** the Kotlin `DefaultReactNativeHost` template — hook `com.facebook.react.defaults.DefaultReactNativeHost`, not the base `ReactNativeHost` (the concrete class actually invoked at runtime is the `Default` one at this RN version — opposite of variant-b).
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

---

## 5. Known gotchas across all variants (operational, not vuln-specific)

- **`frida`'s `-q` flag detaches before the hook actually installs.** `-q` exits right after the script "loads" syntactically, which is *before* an async `Java.perform` callback finishes. Keep the session alive with a blocking stdin pipe instead:
  ```
  sleep 120 | frida -U -f com.dvrn.app -l hook.js
  ```
- **`adb shell input tap` coordinates go stale if the on-screen keyboard opens/closes between your screenshot and the tap.** Get exact bounds immediately before tapping instead of estimating from a screenshot:
  ```
  adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml
  grep -o '<node[^>]*content-desc="LOGIN"[^>]*bounds="[^"]*"' ui.xml
  ```
- **A custom `android:networkSecurityConfig` replaces `usesCleartextTraffic` entirely for ALL domains — it doesn't add a per-domain exception.** All three variants' configs already include `<base-config cleartextTrafficPermitted="true" />` for this reason. If you ever add a new domain-specific rule, keep the base-config or you'll silently break Metro's own dev websocket.
- **The emulator's own network can degrade after a long-running session** — symptoms: `Network request failed` in the app, `ping 10.0.2.2` → "Network is unreachable," unrelated system DNS failures in `logcat`. Fix: `adb reboot` (reboots the guest OS only, keeps the AVD and installed app — much faster than a cold AVD restart).
- **`INSUFFICIENT_STORAGE` during a build is usually pre-installed Google consumer apps, not a real problem.** This AVD's disk is only 5.8GB. Check with `adb shell df -h /storage/emulated/0`; if tight, `adb uninstall` unused consumer apps (Photos/YouTube/Maps/Gmail/Messages/YouTube Music were removed already — if it recurs, check what's grown with `adb shell "su -c 'du -sh /data/app/*/* 2>/dev/null'" | sort -rh | head`).
- **`adb root` is rejected on this AVD** (`adbd cannot run as root in production builds`) — use Magisk instead for anything needing root: `adb shell "su -c '<command>'"`.
