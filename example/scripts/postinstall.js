const cp = require('child_process');
cp.execSync(`rm -rf node_modules/react-native-navigation/node_modules`);
cp.execSync(`rm -rf node_modules/react-native-navigation/example`);
cp.execSync(`rm -rf node_modules/react-native-navigation-mock-render/example`);
