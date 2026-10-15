const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const {
  getBundleModeMetroConfig,
} = require("react-native-worklets/bundleMode");

const defaultConfig = getDefaultConfig(__dirname);

// Bundle Mode writes its generated files into the worklets package. Metro must
// watch that folder to serve them.
defaultConfig.watchFolders.push(
  path.join(
    path.dirname(require.resolve("react-native-worklets/package.json")),
    ".worklets",
  ),
);

const config = getBundleModeMetroConfig(defaultConfig);
const bundleModeResolveRequest = config.resolver.resolveRequest;

// `jose` (used by CopilotKit) ships a Node build that React Native cannot run.
// Resolve it through its browser build instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "jose" || moduleName.startsWith("jose/")) {
    return context.resolveRequest(
      { ...context, unstable_conditionNames: ["browser"] },
      moduleName,
      platform,
    );
  }

  return bundleModeResolveRequest
    ? bundleModeResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
