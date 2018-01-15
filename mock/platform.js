/* eslint-disable react/prop-types, guard-for-in, no-return-await, prefer-destructuring */
/* eslint-disable no-param-reassign, react/jsx-key, eqeqeq, no-shadow, import/first, import/order */
/* eslint-disable react-native/split-platform-components, class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
/**
 *
 * https://github.com/wix/react-native-navigation/blob/master/src/deprecated/platformSpecificDeprecated.ios.js
 *
 * Changes:
 * - throw instead of console.error
 * - mock all platform specific code
 * - rendering using Enzyme and expose getEnzymeAppWrapper function
 */

import React, { Component } from 'react';
import { findNodeHandle } from 'react-native';
import { mount } from 'enzyme';

import _ from 'lodash';

import Navigation from 'react-native-navigation/src/Navigation';
import PropRegistry from 'react-native-navigation/src/PropRegistry';
import { emitScreenEvent } from './ScreenVisibilityListener';

// =========================
// Mock
// =========================

function mountNode(screen) {
  return new Promise((resolve, reject) => {
    const screenId = screen.screen;

    const ScreenClass = Navigation.getRegisteredScreen(screenId);
    if (!ScreenClass) {
      throw new Error(`screen not registered ${screenId}`);
    }

    console.log('>> mountNode mounting', screenId, ScreenClass);

    const node = mount(
      <ScreenClass navigator={Navigation} {...screen.passProps} />
    );
    // Life cycle methods can be async
    setImmediate(() => {
      console.log('>> mountNode mounted', screenId);
      resolve(node);
    });
  });
}

export function getEnzymeAppWrapper() {
  // FIXME: rename
  console.log(
    'getEnzymeAppWrapper',
    Modal.getCurrentScreenNode().name(),
    ControllerRegistry.getCurrentScreenNode().name()
  );
  return (
    Modal.getCurrentScreenNode() || ControllerRegistry.getCurrentScreenNode()
  );
}

class NavigationControllerClass {
  constructor(fn) {
    this.fn = fn;
    this.stack = [];
    this.lastOptions = null;
  }

  push(options) {
    this.stack.push(options);
    this.lastOptions = options;
  }

  pop(options) {
    this.stack.pop();
    this.lastOptions = options;
  }

  popToRoot(options) {
    this.stack = [this.stack[0]];
    this.lastOptions = options;
  }

  resetTo(options) {
    throw new Error('not implemented');
  }
}

class ControllerRegistryClass {
  constructor() {
    this.controllers = {};
    this.screenIdToNode = {};
    this.rootId = null;
  }

  registerController(id, fn) {
    this.controllers[id] = new NavigationControllerClass(fn);
  }

  getCurrentScreen() {
    return this.controllers[this.rootId].fn();
  }

  getCurrentScreenNode() {
    const screen = this.getCurrentScreen();
    const screenId = screen.screen;

    const node = this.screenIdToNode[screenId];
    if (!node) {
      console.error(
        `ControllerRegistryClass: Did not find ${screenId} in `,
        this.screenIdToNode
      );
      throw new Error('ControllerRegistryClass: Internal state out of sync...');
    }

    return node;
  }

  getCurrentScreenId() {
    return this.getCurrentScreen().screen;
  }

  async setRootController(id, animationType, passProps) {
    this.rootId = id;
    const screen = this.getCurrentScreen();
    const screenId = screen.screen;

    const node = await mountNode(screen);

    this.screenIdToNode[screenId] = node;

    return node;
  }
}

const ControllerRegistry = new ControllerRegistryClass();

function ControllersNavigationController(id) {
  const controller = ControllerRegistry.controllers[id];
  if (!controller) {
    throw new Error('Controller not found');
  }
  return controller;
}

class ModalClass {
  constructor() {
    this.currentModals = []; // not controller
    this.screenIdToNode = {};
  }

  getCurrentScreen() {
    return this.currentModals.length === 0
      ? null
      : this.currentModals[this.currentModals.length - 1];
  }

  getCurrentScreenNode() {
    const screen = this.getCurrentScreen();
    if (!screen) {
      return null;
    }

    const screenId = screen.screen;

    const node = this.screenIdToNode[screenId];
    if (!node) {
      console.warn(
        `ModalClass: Did not find ${screenId} in `,
        this.screenIdToNode
      );
      console.warn(Object.keys(this.screenIdToNode));
      throw new Error('ModalClass: Internal state out of sync...');
    }

    return node;
  }

  getCurrentScreenId() {
    const screen = this.getCurrentScreen();
    return (screen && screen.screen) || null;
  }

  async showController(controllerId, animationType) {
    const controller = ControllerRegistry.controllers[controllerId];
    if (!controller) {
      throw new Error('Modal.showController: Controller not found');
    }
    const screen = controller.fn();

    const screenId = screen.screen;

    if (!screenId) {
      throw new Error('Modal.showController: screenId not found');
    }

    const node = await mountNode(screen);
    console.log('--- showModal 14', node.debug());

    this.screenIdToNode[screenId] = node;

    console.log('--- showModal 15');

    this.currentModals.push(screen);
  }

  async dismissController(animationType) {
    // FIXME; unmount
    this.currentModals.pop();
    this._updateApp();
  }

  dismissAllControllers(animationType) {
    // FIXME; unmount
    this.currentModals = [];
    this._updateApp();
  }
}

const Modal = new ModalClass();

// =========================
// Implementation
// =========================

async function startTabBasedApp(params) {
  throw new Error('Mock not implemented');
}

async function startSingleScreenApp(params) {
  if (!params.screen) {
    throw new Error('startSingleScreenApp(params): params.screen is required');
  }

  const controllerID = _.uniqueId('controllerID');
  const screen = params.screen;
  if (!screen.screen) {
    throw new Error(
      'startSingleScreenApp(params): screen must include a screen property'
    );
  }

  const navigatorID = `${controllerID}_nav`;
  const screenInstanceID = _.uniqueId('screenInstanceID');
  const {
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
  } = _mergeScreenSpecificSettings(screen.screen, screenInstanceID, screen);
  _saveNavigatorButtonsProps(navigatorButtons);
  _saveNavBarComponentProps(navigatorStyle);
  params.navigationParams = {
    screenInstanceID,
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
    navigatorID,
  };

  const Controller = {
    navigatorID,
    screen: screen.screen,
    passProps: {
      navigatorID,
      screenInstanceID,
      navigatorEventID,
    },
    style: navigatorStyle,
    leftButtons: navigatorButtons.leftButtons,
    rightButtons: navigatorButtons.rightButtons,
    appStyle: params.appStyle,
    params,
  };

  savePassProps(params);

  ControllerRegistry.registerController(controllerID, () => Controller);
  return ControllerRegistry.setRootController(
    controllerID,
    params.animationType,
    params.passProps || {}
  );
}

function _mergeScreenSpecificSettings(screenID, screenInstanceID, params) {
  const screenClass = Navigation.getRegisteredScreen(screenID);
  if (!screenClass) {
    throw new Error(
      `Cannot create screen ${screenID}. Are you it was registered with Navigation.registerScreen?`
    );
  }
  const navigatorStyle = Object.assign({}, screenClass.navigatorStyle);
  if (params.navigatorStyle) {
    Object.assign(navigatorStyle, params.navigatorStyle);
  }

  const navigatorEventID = `${screenInstanceID}_events`;
  let navigatorButtons = _.cloneDeep(screenClass.navigatorButtons);
  if (params.navigatorButtons) {
    navigatorButtons = _.cloneDeep(params.navigatorButtons);
  }
  if (navigatorButtons.leftButtons) {
    for (let i = 0; i < navigatorButtons.leftButtons.length; i++) {
      navigatorButtons.leftButtons[i].onPress = navigatorEventID;
    }
  }
  if (navigatorButtons.rightButtons) {
    for (let i = 0; i < navigatorButtons.rightButtons.length; i++) {
      navigatorButtons.rightButtons[i].onPress = navigatorEventID;
    }
  }
  return { navigatorStyle, navigatorButtons, navigatorEventID };
}

function navigatorPush(navigator, params) {
  if (!params.screen) {
    throw new Error('Navigator.push(params): params.screen is required');
  }
  let previewViewID;
  const screenInstanceID = _.uniqueId('screenInstanceID');
  if (params.previewView instanceof Component) {
    previewViewID = findNodeHandle(params.previewView);
  } else if (typeof params.previewView === 'number') {
    previewViewID = params.previewView;
  } else if (params.previewView) {
    throw new Error(
      'Navigator.push(params): params.previewView is not a valid react view'
    );
  }
  const {
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
  } = _mergeScreenSpecificSettings(params.screen, screenInstanceID, params);
  _saveNavigatorButtonsProps(navigatorButtons);
  _saveNavBarComponentProps(navigatorStyle);
  const passProps = Object.assign({}, params.passProps);
  passProps.navigatorID = navigator.navigatorID;
  passProps.screenInstanceID = screenInstanceID;
  passProps.navigatorEventID = navigatorEventID;
  passProps.previewViewID = previewViewID;
  passProps.isPreview = !!previewViewID;

  params.navigationParams = {
    screenInstanceID,
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
    navigatorID: navigator.navigatorID,
  };

  savePassProps(params);

  ControllersNavigationController(navigator.navigatorID).push({
    title: params.title,
    subtitle: params.subtitle,
    titleImage: params.titleImage,
    component: params.screen,
    animated: params.animated,
    animationType: params.animationType,
    passProps,
    style: navigatorStyle,
    backButtonTitle: params.backButtonTitle,
    backButtonHidden: params.backButtonHidden,
    leftButtons: navigatorButtons.leftButtons,
    rightButtons: navigatorButtons.rightButtons,
    previewViewID,
    previewActions: params.previewActions,
    previewHeight: params.previewHeight,
    previewCommit: params.previewCommit,
    timestamp: Date.now(),
  });
}

function navigatorPop(navigator, params) {
  ControllersNavigationController(navigator.navigatorID).pop({
    animated: params.animated,
    animationType: params.animationType,
    timestamp: Date.now(),
  });
}

function navigatorPopToRoot(navigator, params) {
  ControllersNavigationController(navigator.navigatorID).popToRoot({
    animated: params.animated,
    animationType: params.animationType,
  });
}

function navigatorResetTo(navigator, params) {
  if (!params.screen) {
    throw new Error('Navigator.resetTo(params): params.screen is required');
  }
  const screenInstanceID = _.uniqueId('screenInstanceID');
  const {
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
  } = _mergeScreenSpecificSettings(params.screen, screenInstanceID, params);
  _saveNavigatorButtonsProps(navigatorButtons);
  _saveNavBarComponentProps(navigatorStyle);
  const passProps = Object.assign({}, params.passProps);
  passProps.navigatorID = navigator.navigatorID;
  passProps.screenInstanceID = screenInstanceID;
  passProps.navigatorEventID = navigatorEventID;

  params.navigationParams = {
    screenInstanceID,
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
    navigatorID: navigator.navigatorID,
  };

  savePassProps(params);

  ControllersNavigationController(navigator.navigatorID).resetTo({
    title: params.title,
    subtitle: params.subtitle,
    titleImage: params.titleImage,
    component: params.screen,
    animated: params.animated,
    animationType: params.animationType,
    passProps,
    style: navigatorStyle,
    leftButtons: navigatorButtons.leftButtons,
    rightButtons: navigatorButtons.rightButtons,
  });
}

function navigatorSetDrawerEnabled(navigator, params) {
  // TODO
}

function navigatorSetTitle(navigator, params) {
  // TODO
}

function navigatorSetSubtitle(navigator, params) {
  // TODO
}

function navigatorSetTitleImage(navigator, params) {
  // TODO
}

function navigatorToggleNavBar(navigator, params) {
  // TODO
}

function navigatorSetStyle(navigator, params) {
  throw new Error('Mock not implemented');
}

function navigatorToggleDrawer(navigator, params) {
  throw new Error('Mock not implemented');
}

function navigatorToggleTabs(navigator, params) {
  throw new Error('Mock not implemented');
}

function navigatorSetTabBadge(navigator, params) {
  throw new Error('Mock not implemented');
}

function navigatorSetTabButton(navigator, params) {
  throw new Error('Mock not implemented');
}

function navigatorSwitchToTab(navigator, params) {
  throw new Error('Mock not implemented');
}

function navigatorSetButtons(navigator, navigatorEventID, params) {
  throw new Error('Mock not implemented');
}

function showModal(params) {
  if (!params.screen) {
    throw new Error('showModal(params): params.screen is required');
  }
  const controllerID = _.uniqueId('controllerID');
  const navigatorID = `${controllerID}_nav`;
  const screenInstanceID = _.uniqueId('screenInstanceID');
  const {
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
  } = _mergeScreenSpecificSettings(params.screen, screenInstanceID, params);
  _saveNavigatorButtonsProps(navigatorButtons);
  _saveNavBarComponentProps(navigatorStyle);
  const passProps = Object.assign({}, params.passProps);
  passProps.navigatorID = navigatorID;
  passProps.screenInstanceID = screenInstanceID;
  passProps.navigatorEventID = navigatorEventID;
  passProps.timestamp = Date.now();

  params.navigationParams = {
    screenInstanceID,
    navigatorStyle,
    navigatorButtons,
    navigatorEventID,
    // FIXME: contribute to react-native-navigation (no-undef)
    navigatorID,
  };

  const Controller = {
    navigatorID,
    params,
    screen: params.screen,
    passProps,
    style: navigatorStyle,
    leftButtons: navigatorButtons.leftButtons,
    rightButtons: navigatorButtons.rightButtons,
  };

  savePassProps(params);

  ControllerRegistry.registerController(controllerID, () => Controller);

  Modal.showController(controllerID, params.animationType);
}

async function dismissModal(params) {
  return await Modal.dismissController(params.animationType);
}

function dismissAllModals(params) {
  Modal.dismissAllControllers(params.animationType);
}

function showLightBox(params) {
  if (!params.screen) {
    throw new Error('showLightBox(params): params.screen is required');
  }
  throw new Error('Mock not implemented');
}

function dismissLightBox(params) {
  throw new Error('Mock not implemented');
}

function showInAppNotification(params) {
  throw new Error('Mock not implemented');
}

function dismissInAppNotification(params) {
  throw new Error('Mock not implemented');
}

function savePassProps(params) {
  // TODO this needs to be handled in a common place,
  // TODO also, all global passProps should be handled differently
  if (params.navigationParams && params.passProps) {
    PropRegistry.save(
      params.navigationParams.screenInstanceID,
      params.passProps
    );
  }

  if (params.screen && params.screen.passProps) {
    PropRegistry.save(
      params.screen.navigationParams.screenInstanceID,
      params.screen.passProps
    );
  }

  if (_.get(params, 'screen.topTabs')) {
    _.forEach(params.screen.topTabs, tab => savePassProps(tab));
  }

  if (params.tabs) {
    _.forEach(params.tabs, tab => {
      if (!tab.passProps) {
        tab.passProps = params.passProps;
      }
      savePassProps(tab);
    });
  }
}

function showContextualMenu() {
  throw new Error('Mock not implemented');
}

function dismissContextualMenu() {
  throw new Error('Mock not implemented');
}

async function getCurrentlyVisibleScreenId() {
  const screenId =
    Modal.getCurrentScreenId() || ControllerRegistry.getCurrentScreenId();

  if (!screenId) {
    throw new Error('Did not find any modals or root screen');
  }

  return screenId;
}

function _saveNavBarComponentProps(navigatorStyle) {
  if (navigatorStyle.navBarCustomViewInitialProps) {
    const passPropsKey = _.uniqueId('navBarComponent');
    PropRegistry.save(
      passPropsKey,
      navigatorStyle.navBarCustomViewInitialProps
    );
    navigatorStyle.navBarCustomViewInitialProps = { passPropsKey };
  }
}

function _saveNavigatorButtonsProps({ rightButtons, leftButtons }) {
  _saveNavigatorButtonsPassProps(rightButtons);
  _saveNavigatorButtonsPassProps(leftButtons);
}

function _saveNavigatorButtonsPassProps(buttons = []) {
  buttons.forEach(button => {
    if (button.component) {
      const passPropsKey = _.uniqueId('customButtonComponent');
      PropRegistry.save(passPropsKey, button.passProps);
      button.passProps = { passPropsKey };
    }
  });
}

export default {
  startTabBasedApp,
  startSingleScreenApp,
  navigatorPush,
  navigatorPop,
  navigatorPopToRoot,
  navigatorResetTo,
  showModal,
  dismissModal,
  dismissAllModals,
  showLightBox,
  dismissLightBox,
  showInAppNotification,
  dismissInAppNotification,
  navigatorSetButtons,
  navigatorSetDrawerEnabled,
  navigatorSetTitle,
  navigatorSetSubtitle,
  navigatorSetStyle,
  navigatorSetTitleImage,
  navigatorToggleDrawer,
  navigatorToggleTabs,
  navigatorSetTabBadge,
  navigatorSetTabButton,
  navigatorSwitchToTab,
  navigatorToggleNavBar,
  showContextualMenu,
  dismissContextualMenu,
  getCurrentlyVisibleScreenId,
};
