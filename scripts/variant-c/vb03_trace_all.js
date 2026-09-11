Java.perform(function () {
  const ResponseUtil = Java.use("com.facebook.react.modules.network.ResponseUtil");
  const NetworkingModule = Java.use("com.facebook.react.modules.network.NetworkingModule");

  function safeStr(v) {
    try {
      return v === null ? "null" : v.toString();
    } catch (e) {
      return "<unstringable: " + e + ">";
    }
  }

  ResponseUtil.onDataReceived.overload(
    "com.facebook.react.bridge.ReactApplicationContext", "int", "com.facebook.react.bridge.WritableMap"
  ).implementation = function (ctx, id, map) {
    console.log("[TRACE] onDataReceived(WritableMap) id=" + id);
    try {
      const WritableNativeMap = Java.use("com.facebook.react.bridge.WritableNativeMap");
      const casted = Java.cast(map, WritableNativeMap);
      console.log("[TRACE]   toString()=" + safeStr(casted.toString()));
    } catch (e) {
      console.log("[TRACE]   error casting/printing map: " + e);
    }
    return this.onDataReceived(ctx, id, map);
  };

  ResponseUtil.onDataReceived.overload(
    "com.facebook.react.bridge.ReactApplicationContext", "int", "java.lang.String"
  ).implementation = function (ctx, id, body) {
    console.log("[TRACE] onDataReceived(String) id=" + id + " body=" + safeStr(body));
    return this.onDataReceived(ctx, id, body);
  };

  ResponseUtil.onIncrementalDataReceived.implementation = function (ctx, id, data, progress, total) {
    console.log("[TRACE] onIncrementalDataReceived id=" + id + " data=" + safeStr(data) + " progress=" + progress + " total=" + total);
    return this.onIncrementalDataReceived(ctx, id, data, progress, total);
  };

  ResponseUtil.onResponseReceived.implementation = function (ctx, id, status, headers, url) {
    console.log("[TRACE] onResponseReceived id=" + id + " status=" + status + " url=" + safeStr(url) + " headers=" + safeStr(headers));
    return this.onResponseReceived(ctx, id, status, headers, url);
  };

  ResponseUtil.onRequestSuccess.implementation = function (ctx, id) {
    console.log("[TRACE] onRequestSuccess id=" + id);
    return this.onRequestSuccess(ctx, id);
  };

  NetworkingModule.readWithProgress.implementation = function (id, body) {
    console.log("[TRACE] readWithProgress id=" + id + " bodyClass=" + safeStr(body.getClass().getName()));
    return this.readWithProgress(id, body);
  };

  console.log("[TRACE] All hooks installed.");
});
