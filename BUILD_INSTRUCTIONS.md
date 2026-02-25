# How to Build the Flutter App for Android (APK)

Follow these steps to set up, configure, and build an APK file from this Flutter project.

## 1. Prerequisites

- **Install Flutter SDK:** If you haven't already, follow the official guide to [install Flutter](https://docs.flutter.dev/get-started/install) for your operating system.
- **Install Android Studio:** You'll need Android Studio to get the Android SDK, command-line tools, and to create an emulator. [Install Android Studio](https://developer.android.com/studio).
- **Set up an Editor:** Configure your editor of choice (like VS Code or Android Studio) with the Flutter and Dart plugins.
- **Set up an Android device:** You can use a physical Android device or set up an [Android emulator](https://docs.flutter.dev/run-test/setting-up-android-emulator) through Android Studio.

## 2. Project Setup

1.  **Get Dependencies:** Open your terminal, navigate to the project's root directory (where `pubspec.yaml` is located), and run:
    ```sh
    flutter pub get
    ```

2.  **Create Splash Screen Asset:** The splash screen is configured in `pubspec.yaml` under `flutter_native_splash`. It requires an image asset.
    - In the project root, create a new folder named `assets`.
    - Inside the `assets` folder, place your app logo and name it `splash.png`. A good size is 1024x1024 pixels. The app name "Sayed Hassan" should ideally be part of this image.
    - Run the following command in your terminal to apply the splash screen to the native Android/iOS projects:
    ```sh
    flutter pub run flutter_native_splash:create
    ```

## 3. Configure API Key (Best Practice)

This project uses the `flutter_dotenv` package to keep your API key secure and out of source code.

1.  **Create `.env` file:** In the root directory of the project, create a new file named `.env`.
2.  **Add your API key:** Open the `.env` file and add your Gemini API key like this (copy from `.env.example`):
    ```
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
3.  **Save the file.** The `.env` file is listed in `.gitignore` by default in Flutter projects, so it won't be committed to version control. The app will now be able to securely access your key.

## 4. Run the App in Debug Mode

Before building the final APK, ensure the app runs correctly on an emulator or a physical device.

1.  Make sure an emulator is running or a physical device is connected and recognized by Flutter (use `flutter devices` to check).
2.  Run the app from your terminal:
    ```sh
    flutter run
    ```
This will install and launch the app on your selected device.

## 5. Build the APK for Distribution

When you are ready to build the release version, you can create an APK file, which can be installed on Android devices.

1.  **Build the APK:** Run the following command in your terminal:
    ```sh
    flutter build apk
    ```
    This command builds a universal APK that works on most modern Android devices. The output file will be located at:
    `build/app/outputs/flutter-apk/app-release.apk`

2.  **(Recommended for Google Play) Build an App Bundle:** The Google Play Store prefers the App Bundle (`.aab`) format as it allows Google to deliver optimized, smaller downloads to users.
    ```sh
    flutter build appbundle
    ```
    The output file will be at: `build/app/outputs/bundle/release/app-release.aab`.

## 6. Install the APK

You can now take the `app-release.apk` file, transfer it to an Android device, and install it. You might need to enable "Install from unknown sources" in the device's security settings to do this.
