/* eslint-env jest */
import React from 'react';
import 'react-native-navigation-mock-render/setup/enzyme-environment';

import { mount } from 'enzyme';

import Intro from '../screens/Intro';
import Welcome from '../screens/Welcome';

test('mounting', () => {
  const enzymeScreen = mount(<Intro />);

  const instance = enzymeScreen
    .find(Intro)
    .first()
    .instance();

  expect(instance.onPressAcceptTerms).toBeTruthy();

  const enzymeScreen2 = mount(<Welcome />);

  const instance2 = enzymeScreen2
    .find(Welcome)
    .first()
    .instance();

  expect(instance2.onPressThanks).toBeTruthy();
});
