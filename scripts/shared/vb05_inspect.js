Java.perform(function () {
  Java.scheduleOnMainThread(function () {
    console.log("[VB05_INSPECT] Searching for android.webkit.WebView instances...");
    Java.choose("android.webkit.WebView", {
      onMatch: function (instance) {
        try {
          console.log("[VB05_INSPECT] Found WebView instance: " + instance);
          console.log("[VB05_INSPECT]   class: " + instance.getClass().getName());
          console.log("[VB05_INSPECT]   url(): " + instance.getUrl());
          console.log("[VB05_INSPECT]   originalUrl(): " + instance.getOriginalUrl());
          console.log("[VB05_INSPECT]   title(): " + instance.getTitle());
          console.log("[VB05_INSPECT]   settings.getJavaScriptEnabled(): " + instance.getSettings().getJavaScriptEnabled());
        } catch (e) {
          console.log("[VB05_INSPECT]   error reading instance details: " + e);
        }
      },
      onComplete: function () {
        console.log("[VB05_INSPECT] Done searching for WebView instances.");
      },
    });

    console.log("[VB05_INSPECT] Searching for RNCWebView subclass (react-native-webview's actual WebView subclass)...");
    try {
      Java.choose("com.reactnativecommunity.webview.RNCWebView", {
        onMatch: function (instance) {
          console.log("[VB05_INSPECT] Found RNCWebView instance: " + instance);
        },
        onComplete: function () {
          console.log("[VB05_INSPECT] Done searching for RNCWebView instances.");
        },
      });
    } catch (e) {
      console.log("[VB05_INSPECT] RNCWebView class not found or error: " + e);
    }
  });
});
