<div align="center">
  <h1>react-native-navigation-mock-render</h1>

  [![NPM Version](https://img.shields.io/npm/v/react-native-navigation-mock-render.svg?style=flat)](https://www.npmjs.com/package/react-native-navigation-mock-render)
  [![Build Status](https://travis-ci.org/skovhus/react-native-navigation-mock-render.svg?branch=master)](https://travis-ci.org/skovhus/react-native-navigation-mock-render)
  [![MIT License](https://img.shields.io/npm/l/react-native-navigation-mock-render.svg?style=flat-square)](https://github.com/skovhus/react-native-navigation-mock-render/blob/master/LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
</div>

**Work in progress, stay tuned.**

Thin node.js mock of [wix/react-native-navigation](https://github.com/wix/react-native-navigation) that makes it possible to write fast integration test including:
- rendering of screens
- life cycle methods
- navigation between screens

Uses:
- [react-native-mock-render](https://github.com/Root-App/react-native-mock-render)
- [enzyme](https://github.com/airbnb/enzyme)
- [jsdom](https://github.com/tmpvar/jsdom)

## Prerequisite

- `react-native` >= 0.49
- `react` >= 16.0.0


## Example usage with Jest

```shell
yarn add --dev react-native-navigation-mock-render jsdom@^11.5.1 enzyme@^3.3.0 enzyme-adapter-react-16@^1.1.1 react-native-mock-render@^0.0.19
```

Besides you need a version of `react-dom` matching your version of `react`.

```javascript

import { Navigation } from 'react-native-navigation'
import 'react-native-navigation-mock-render/lib/setup-enzyme-environment'
import { getEnzymeAppWrapper } from 'react-native-navigation-mock-render/lib/platform'

import { IntroScreen } from '../screens/Intro'
import startApp from '../index'

jest.mock('react-native-navigation/src/deprecated/platformSpecificDeprecated', () =>
  require.requireActual('react-native-navigation-mock-render/lib/platform')
)

jest.mock('react-native-navigation/src/ScreenVisibilityListener', () =>
  require.requireActual(
    'react-native-navigation-mock-render/lib/ScreenVisibilityListener'
  )
)

const wrapper = getEnzymeAppWrapper()

const flushAllPromises = () =>
  new Promise(resolve => setImmediate(resolve))

describe('app integration test', () => {

  it('shows main screen after stepping through intro', async () => {
    startApp()

    await flushAllPromises()

    let screenId = await Navigation.getCurrentlyVisibleScreenId()
    expect(screenId).toEqual('MyApp.Intro')

    const introInstance = wrapper
      .find(IntroScreen)
      .first()
      .instance()

    introInstance.onAcceptTermsPressed()

    await flushAllPromises()

    screenId = await Navigation.getCurrentlyVisibleScreenId()
    expect(screenId).toEqual('MyApp.MainScreen')
  })
})
```

See more inside the `example/__tests__` folder.

## Limitations

Still early stages. First focus is apps using `startSingleScreenApp`.

Besides:
- not all `ScreenVisibilityListener` have been implemented
- not all `Navigation` methods have been implemented (e.g. `startTabBasedApp`, `showContextualMenu`)


## Contributing

To get started, run:

	yarn

When developing:

	yarn run lint


## License

MIT
