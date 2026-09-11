Java.perform(function () {
  const BlobModule = Java.use("com.facebook.react.modules.blob.BlobModule");
  const JString = Java.use("java.lang.String");

  const storeOverload = BlobModule.store.overload("[B");

  storeOverload.implementation = function (bytes) {
    try {
      const original = JString.$new(bytes, "UTF-8").toString();
      if (original.indexOf('"isPremium":false') !== -1) {
        const patched = original.replace('"isPremium":false', '"isPremium":true ');
        console.log("[VB03] intercepted blob store, response body contains isPremium");
        console.log("[VB03] original: " + original);
        console.log("[VB03] patched:  " + patched);
        const newBytes = JString.$new(patched).getBytes("UTF-8");
        return this.store(newBytes);
      }
    } catch (e) {
      console.log("[VB03] error inspecting blob bytes: " + e);
    }
    return this.store(bytes);
  };

  console.log("[VB03] Hook installed on BlobModule.store(byte[])");
});
