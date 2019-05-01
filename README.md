# @riotjs/hydrate

[![Build Status][travis-image]][travis-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]

## Installation

```bash
npm i -S riotjs @riotjs/hydrate
```

## Usage

If you are using [`@riotjs/ssr`](https://github.com/riot/ssr) you might prefer hydrating your server side rendered HTML enhancing your application user experience. Your users will get initially the static HTML (generated via `@riotjs/ssr`) that will be enhanced only when javascript application will be loaded.<br/> `@riotjs/hydrate` will allow you avoiding any perceivable application flickering or input fields focus loss when the javascript components will replace the static rendered markup.

A good practice is to mount your Riot.js components **exactly with the same initial properties** on the server as on the client.

```js
import hydrate from '@riotjs/hydrate'
import MyComponent from './my-component.riot'

const hydrateWithMyComponent = hydrate(MyComponent)

// hydrate the SSR DOM contained in the #root element
hydrateWithMyComponent(
  document.getElementById('root'),
  window.__INITIAL_APPLICATION_PROPS__
)
```

### Callbacks

You can use the `onBeforeHydrate` and `onHydrated` callback in your components to setup your application internal state. Notice that these callbacks will be called only on the component hydrated and not on all its nested children components.

```html
<my-component>
  <script>
    export default {
      onBeforeHydrate() {
        // do something before the hydration
      },
      onHydrated() {
        // do something after the hydration
      }
    }
  </script>
</my-component>
```

### Caveats

The `hydrate` method will mount your components on a clone of your target node not yet in the DOM. If your component state relies on DOM computations like `get​Bounding​Client​Rect` and you don't want to use the `onHydrated` callback, you will need to use a `requestAnimationFrame` callback in your `onMounted` method to wait that your root node has replaced completely the initial static markup for example:

```html
<my-component>
  <script>
    export default {
      onMounted() {
        // your root node is not yet in the DOM
        requestAnimationFrame(() => {
          // your root is in the DOM
        })
      },
    }
  </script>
</my-component>
```

[travis-image]:https://img.shields.io/travis/riot/hydrate.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/hydrate

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE

[npm-version-image]:http://img.shields.io/npm/v/@riotjs/hydrate.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/@riotjs/hydrate.svg?style=flat-square
[npm-url]:https://npmjs.org/package/@riotjs/hydrate


