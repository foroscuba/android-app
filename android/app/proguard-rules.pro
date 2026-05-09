# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor — keep the bridge and any annotated plugin methods so the
# WebView can still call into them after R8 renames everything else.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}
-keepclassmembers class * {
    @com.getcapacitor.annotation.PluginMethod <methods>;
}

# App package — the Capacitor plugin loader looks up plugins by FQCN, so
# don't let R8 strip them.
-keep class net.fcuba.app.** { *; }

# Cordova compatibility shim Capacitor pulls in.
-keep class org.apache.cordova.** { *; }
-keep class * extends org.apache.cordova.CordovaPlugin

# Firebase Cloud Messaging — Google's libraries are mostly safe but a
# few reflection paths need keep rules.
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses

# WebView with JS interface — keep so reflection from JS keeps working.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep stack-trace line numbers so Play Console crash reports stay
# readable; rename source file to "SourceFile" to avoid leaking the
# original name.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
