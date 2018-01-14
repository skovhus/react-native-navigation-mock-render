import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';

export default function startApp() {
  registerScreens();

  Navigation.startSingleScreenApp({
    screen: {
      screen: 'example.Main',
    },
  });
}
