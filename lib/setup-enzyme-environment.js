/* eslint-disable import/no-extraneous-dependencies, no-console */
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

require('react-native-mock-render/mock');

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));

  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
copyProps(window, global);

Enzyme.configure({ adapter: new Adapter() });

const consoleMethods = ['error', 'warn'];
consoleMethods.forEach(consoleMethod => {
  const originalConsoleMethod = console[consoleMethod];
  console[consoleMethod] = (...args) => {
    const shouldIgnoreMessage = [
      'Warning: Invalid DOM property',
      'Warning: Unknown prop',
      'Warning: View.propTypes',
      'Warning: Received',
      'Warning: <',
      'Warning: The tag',
      'Warning: Unknown event handler property',
      'Warning: React does not recognize the',
    ].some(l => args[0].startsWith(l));
    if (!shouldIgnoreMessage) {
      originalConsoleMethod(args);
    }
  };
});
