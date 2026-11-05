# Krono R8 rules
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
-dontwarn javax.annotation.**

# DTOs are (de)serialized reflectively via kotlinx-serialization + Retrofit generics.
-keep,includedescriptorclasses class com.meet11.krono.data.remote.dto.** { *; }
-keepclassmembers class com.meet11.krono.data.remote.dto.** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit service interfaces
-keep,allowobfuscation interface com.meet11.krono.data.remote.api.**

# OkHttp optional platform deps
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
