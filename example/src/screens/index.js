import { Navigation } from 'react-native-navigation';

import Intro from './Intro';
import Main from './Main';
import Welcome from './Welcome';

export function registerScreens() {
  Navigation.registerComponent('example.Intro', () => Intro);
  Navigation.registerComponent('example.Main', () => Main);
  Navigation.registerComponent('example.Welcome', () => Welcome);
}
