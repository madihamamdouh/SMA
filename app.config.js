module.exports = {
  expo: {
    name: "SMA",
    slug: "sma-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/icon.png",
    scheme: "reactnativeapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: "madiha-m",
    android: {
      package: "com.madiha.sma",
      adaptiveIcon: {
        backgroundColor: "#3b4a9c",
        foregroundImage: "./assets/images/adaptive-icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    ios: {
      bundleIdentifier: "com.madiha.sma",
      supportsTablet: true,
    },
    web: {
      output: "static",
      favicon: "./assets/icons/icon.png",
    },
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      eas: {
        projectId: "1e75acde-881d-41e5-853a-621c5e52da4e",
      },
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#f4f6fb",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/PlusJakartaSans-Regular.ttf",
            "./assets/fonts/PlusJakartaSans-Bold.ttf",
            "./assets/fonts/PlusJakartaSans-Medium.ttf",
            "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
            "./assets/fonts/PlusJakartaSans-ExtraBold.ttf",
            "./assets/fonts/PlusJakartaSans-Light.ttf",
          ],
        },
      ],

      [
        "expo-build-properties",
        {
          android: {
            packagingOptions: {
              exclude: ["META-INF/versions/9/OSGI-INF/MANIFEST.MF"],
            },
          },
        },
      ],
      ["expo-localization"],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
