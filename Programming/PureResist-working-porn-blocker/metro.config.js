const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Simple optimizations that don't break Metro
if (process.env.NODE_ENV === 'production') {
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
    },
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
