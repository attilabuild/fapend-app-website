const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Config plugin for RevenueCat integration
 */
const withRevenueCat = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    // Add required frameworks
    if (xcodeProject.pbxProjectSection()) {
      const target = xcodeProject.getFirstTarget().uuid;
      xcodeProject.addFramework('StoreKit.framework', { target, link: true });
    }

    return config;
  });
};

module.exports = withRevenueCat; 