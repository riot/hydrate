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

[travis-image]:https://img.shields.io/travis/riot/hydrate.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/hydrate

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE

[npm-version-image]:http://img.shields.io/npm/v/@riotjs/hydrate.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/@riotjs/hydrate.svg?style=flat-square
[npm-url]:https://npmjs.org/package/@riotjs/hydrate


