// Polyfills must load before any other module. Hermes lacks the Web APIs that
// CopilotKit relies on, and the first crypto polyfill to load is the one kept.
import "react-native-get-random-values";
import "@copilotkit/react-native/polyfills";

// Registers the Expo Router app for both Expo Go and native builds.
import "expo-router/entry";
