# DVRN - Damn Vulnerable React Native

DVRN is a deliberately vulnerable React Native application built to demonstrate real-world mobile security testing techniques specific to React Native's architecture.

It's the practical companion to a two-part blog series on testing React Native applications:

- **Part 1:** [Understanding React Native Apps: A Pentester's Field Guide](https://waseeq14.github.io/posts/react-native-pentesting-fundamentals)
- **Part 2:** [Exploiting React Native Apps: A Hands-On Walkthrough with DVRN](https://waseeq14.github.io/posts/react-native-pentesting-with-dvrn)

Read Part 1 first if you're new to testing React Native apps — it covers the concepts (bridge vs. new architecture, Hermes vs. JSC, bundle extraction) this repo assumes you already understand.

---

## Why three variants?

The same JS-layer vulnerability requires a completely different exploitation technique depending on how the app's JavaScript was compiled. DVRN ships as three separate builds to demonstrate all three cases:

| Variant | Engine | What it demonstrates |
|---|---|---|
| **`variant-a-no-hermes`** | JSC (Hermes disabled) | Plain, readable JS bundle - direct static patching |
| **`variant-b-old-hermes`** | Hermes, HBC89 | Bytecode with working disassemble/reassemble tooling |
| **`variant-c-new-hermes`** | Hermes, HBC96 | Bytecode where no reassembler was available at the time of testing - runtime interception instead |

Same five vulnerabilities, identical logic, implemented across all three - only the *technique* needed to exploit two of them changes. Part 2 of the blog series walks through all five vulnerabilities across all three variants in full detail.

---

## The five vulnerabilities

- **VB-01** - Insecure local storage (plaintext session token in `AsyncStorage`)
- **VB-02** - Hardcoded secret in the JS bundle
- **VB-03** - Client-side authorization bypass (the flagship vuln - three different techniques, one per variant)
- **VB-04** - Exposed native module with no input validation
- **VB-05** - Insecure WebView bridge

Full technical write-ups, exploitation walkthroughs, and screenshots for each are in Part 2 of the blog series linked above.

---

## Repo structure

```
DVRN/
├── backend/                   Shared Express.js backend - all three variants use this
├── scripts/
│   ├── shared/                 Frida scripts reused across variants (VB-04, VB-05)
│   ├── variant-b/               Tooling + scripts specific to Variant B (hbctool fix, bundle reload hook)
│   └── variant-c/               Scripts specific to Variant C (traffic tracing, blob rewrite)
├── variant-a-no-hermes/        Full RN project source (JSC)
├── variant-b-old-hermes/       Full RN project source (Hermes, HBC89)
├── variant-c-new-hermes/       Full RN project source (Hermes, HBC96)
└── QUICKSTART.md               Fast setup commands for every variant + backend
```

Source is included for all three variants - this isn't meant to be a black-box challenge. Read the code, patch it, rebuild it, break it your own way.

---

## Getting started

See **[QUICKSTART.md](./QUICKSTART.md)** for the exact commands to get the backend and any variant running from a clean clone. Brief overview:

1. **Start the backend** (`backend/`) - all three variants talk to the same server
2. **Pick a variant** and build/install it on an emulator or device
3. **Build a release APK**, not debug - several of the demonstrated techniques (VB-03 in particular) only work correctly against release builds

Each variant is a standard React Native CLI project (not Expo) - `npm install`, then build via Android Studio or `./gradlew assembleRelease` inside the variant's `android/` folder.

### Requirements

- Node.js and npm
- Android SDK + an emulator or physical device
- Variant B specifically requires **JDK 17** (`JAVA_HOME` set accordingly) - this era's Gradle rejects newer JDKs

---

## Scripts

The `scripts/` folder contains the Frida scripts referenced in the blog series, ready to use directly rather than copy-pasted from the posts:

- **`shared/`** - `vb04_hook.js` (native module exploitation via `Java.choose()` + a fake `Promise`), `vb05_hook.js` / `vb05_inspect.js` (WebView bridge exploitation)
- **`variant-b/`** - `hasm_fixed.py` (the merged, working hbctool fix for HBC89), `vb_roundtrip_hook.js` (redirects bundle loading to a patched file)
- **`variant-c/`** - `vb03_trace_all.js` (view RN network traffic live, no proxy needed), `vb03_blob_rewrite.js` (the working VB-03 exploit for this variant)

Read Part 2 of the blog series for the full context behind each script - what it does, why it's built the way it is, and what didn't work before it.

---

## Scope

DVRN deliberately does **not** cover SSL pinning bypass, root/jailbreak detection bypass, or other generic mobile-hardening checks. Those aren't specific to React Native, and they're already well covered by existing vulnerable apps like AndroGoat and DVAA. DVRN's scope is narrower and more deliberate: vulnerabilities that are either unique to how React Native itself is built, or meaningfully different to exploit because of its architecture.

---

## Disclaimer

DVRN is intentionally vulnerable and built for learning and practice only. Do not deploy it anywhere reachable by untrusted networks, and do not reuse any of its code, patterns, or the hardcoded secrets in a real application.
