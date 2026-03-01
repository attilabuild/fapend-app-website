const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withRevenueCatUI = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const mainApplicationPath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java/com/pureresist/nofapapp/MainApplication.kt'
      );

      let contents = await fs.promises.readFile(mainApplicationPath, 'utf-8');

      // Add RevenueCat UI package to the package list
      if (!contents.includes('import com.revenuecat.purchases.ui.react.RNPurchasesUIPackage')) {
        contents = contents.replace(
          'import com.facebook.react.ReactApplication',
          `import com.facebook.react.ReactApplication\nimport com.revenuecat.purchases.ui.react.RNPurchasesUIPackage`
        );
      }

      // Add the package to getPackages()
      if (!contents.includes('RNPurchasesUIPackage()')) {
        contents = contents.replace(
          'return packages',
          'packages.add(RNPurchasesUIPackage())\n      return packages'
        );
      }

      await fs.promises.writeFile(mainApplicationPath, contents);

      return config;
    },
  ]);
};

module.exports = withRevenueCatUI; 