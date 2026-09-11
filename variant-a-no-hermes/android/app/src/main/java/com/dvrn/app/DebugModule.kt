package com.dvrn.app

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class DebugModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "DebugModule"

  @ReactMethod
  fun readInternalFile(path: String, promise: Promise) {
    try {
      val content = File(path).readText()
      promise.resolve(content)
    } catch (e: Exception) {
      promise.reject("READ_ERROR", e)
    }
  }
}
