Java.perform(function () {
  const PATCHED_BUNDLE_PATH = "/data/local/tmp/dvrn_b_patched.bundle";

  function hookClass(className) {
    try {
      const Cls = Java.use(className);
      Cls["getJSBundleFile"].implementation = function () {
        const original = this["getJSBundleFile"]();
        console.log(
          "[ROUNDTRIP] " + className + ".getJSBundleFile() called, original=" +
          original + " -> redirecting to " + PATCHED_BUNDLE_PATH
        );
        return PATCHED_BUNDLE_PATH;
      };
      console.log("[ROUNDTRIP] Hooked " + className + ".getJSBundleFile()");
    } catch (e) {
      console.log("[ROUNDTRIP] Could not hook " + className + ": " + e);
    }
  }

  hookClass("com.facebook.react.ReactNativeHost");
  hookClass("com.facebook.react.defaults.DefaultReactNativeHost");
});
