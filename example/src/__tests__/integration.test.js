/* eslint-env jest */
import { Navigation } from 'react-native-navigation';
import 'react-native-navigation-mock-render/setup/enzyme-environment';
import { getEnzymeAppWrapper } from 'react-native-navigation-mock-render/mock/platform';

import startApp from '../app';
import IntroScreen from '../screens/Intro';

jest.mock(
  'react-native-navigation/src/deprecated/platformSpecificDeprecated',
  () =>
    require.requireActual('react-native-navigation-mock-render/mock/platform')
);

jest.mock('react-native-navigation/src/ScreenVisibilityListener', () =>
  require.requireActual(
    'react-native-navigation-mock-render/mock/ScreenVisibilityListener'
  )
);

// const wrapper = getEnzymeAppWrapper();

const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

describe('app integration test', () => {
  it('shows welcome screen after stepping through intro', async () => {
    await startApp();

    //console.log('>>>', getEnzymeAppWrapper().debug());

    await flushAllPromises();

    // console.log('>>>', getEnzymeAppWrapper().debug());

    console.log('** 1');

    let screenId = await Navigation.getCurrentlyVisibleScreenId();

    expect(screenId).toEqual('example.Intro');

    console.log('** 2');

    await flushAllPromises();

    const introInstance = getEnzymeAppWrapper()
      .find(IntroScreen)
      .first()
      .instance();

    console.log('** 4');

    introInstance.onPressAcceptTerms();

    console.log('** 5');

    await flushAllPromises();

    screenId = await Navigation.getCurrentlyVisibleScreenId();
    expect(screenId).toEqual('example.Welcome');

    // FIXME: this shows that componentDidMount is called on Main,
    // which it should be after modals have been opened.
    /*
    const welcomeInstance = wrapper
      .find(WelcomeScreen)
      .first()
      .instance();

    welcomeInstance.onPressThanks();

    await flushAllPromises();

    screenId = await Navigation.getCurrentlyVisibleScreenId();
    expect(screenId).toEqual('example.Main');
    */
  });
});
