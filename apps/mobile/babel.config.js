module.exports = function (api) {
  api.cache(true);

  return {
    // In a pnpm workspace the preset cannot find the worklets plugin by
    // itself, so turn its auto-detection off and add the plugin below.
    presets: [["babel-preset-expo", { worklets: false, reanimated: false }]],
    plugins: [
      [
        "react-native-worklets/plugin",
        // CopilotChat renders markdown on a worklet thread, which needs
        // Bundle Mode to load the `remend` package there.
        { bundleMode: true, importForwarding: { moduleNames: ["remend"] } },
      ],
    ],
  };
};
