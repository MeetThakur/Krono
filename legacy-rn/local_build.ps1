# local_build.ps1
Write-Host "Searching for Android Studio bundled JDK..."

$javaPaths = @(
    "C:\Program Files\Android\Android Studio\jbr",
    "C:\Program Files\Android\Android Studio\jre",
    "C:\Program Files\Android\Android Studio\bin\jbr",
    "C:\Program Files\Android\Android Studio\bin\jre"
)

$jdkPath = $null

foreach ($path in $javaPaths) {
    if (Test-Path "$path\bin\java.exe") {
        Write-Host "Found JDK at: $path"
        $jdkPath = $path
        break
    }
}

if ($null -eq $jdkPath) {
    Write-Error "Could not find bundled JDK in standard Android Studio locations."
    Write-Host "Please install Java or set JAVA_HOME manually."
    exit 1
}

$env:JAVA_HOME = $jdkPath
$env:Path = "$jdkPath\bin;" + $env:Path

Write-Host "Java Version Check:"
& "$jdkPath\bin\java.exe" -version

Write-Host "Starting Gradle Build..."
Set-Location android

if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a "-Dorg.gradle.java.home=$jdkPath"
}
else {
    Write-Error "gradlew.bat not found in android directory. Did you run 'npx expo prebuild'?"
    exit 1
}
