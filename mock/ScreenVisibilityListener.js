/**
 * https://github.com/wix/react-native-navigation/blob/master/src/ScreenVisibilityListener.js
 *
 * Changes:
 * - replaced with node event emitter
 * - emitScreenEvent function to be used by platform
 */

import EventEmitter from 'events';

const emitter = new EventEmitter();

export function emitScreenEvent(event, screenId) {
  emitter.emit(event, { screen: screenId });
}

export default class ScreenVisibilityListener {
  constructor(listeners) {
    this.emitter = emitter;
    this.listeners = listeners;
  }

  register() {
    const {
      willAppear,
      didAppear,
      willDisappear,
      didDisappear,
    } = this.listeners;
    this.willAppearSubscription =
      willAppear && this.emitter.addListener('willAppear', willAppear);
    this.didAppearSubscription =
      didAppear && this.emitter.addListener('didAppear', didAppear);
    this.willDisappearSubscription =
      willDisappear && this.emitter.addListener('willDisappear', willDisappear);
    this.didDisappearSubscription =
      didDisappear && this.emitter.addListener('didDisappear', didDisappear);
  }

  unregister() {
    if (this.willAppearSubscription) {
      this.willAppearSubscription.remove();
    }

    if (this.didAppearSubscription) {
      this.didAppearSubscription.remove();
    }

    if (this.willDisappearSubscription) {
      this.willDisappearSubscription.remove();
    }

    if (this.didDisappearSubscription) {
      this.didDisappearSubscription.remove();
    }
  }
}
