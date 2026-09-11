package com.dvrn.app;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

public class DebugModule extends ReactContextBaseJavaModule {

  DebugModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "DebugModule";
  }

  @ReactMethod
  public void readInternalFile(String path, Promise promise) {
    try {
      byte[] bytes = Files.readAllBytes(new File(path).toPath());
      promise.resolve(new String(bytes));
    } catch (IOException e) {
      promise.reject("READ_ERROR", e);
    }
  }
}
