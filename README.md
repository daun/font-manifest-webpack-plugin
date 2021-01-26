# Webpack Font Manifest Plugin

A webpack plugin for generating a font manifest.

## What's a font manifest?

Similar to an asset manifest, a font manifest holds info about fonts used in your
CSS build artefacts. This info can be used to optimize the font loading process,
e.g. by generating preload hints or inlining the font face CSS.

```json
{
  "/dist/myfont.8a1dbb54.woff2": {
    "family": "MyFont",
    "weight": "normal",
    "style": "normal",
    "format": "woff2",
    "url": "/dist/myfont.8a1dbb54.woff2",
    "css": "@font-face { /* */ }"
  },
  "/dist/myfont.bold.52d19f94.woff2": {
    "family": "MyFont",
    "weight": "bold",
    "style": "normal",
    "format": "woff2",
    "url": "/dist/myfont.bold.52d19f94.woff2",
    "css": "@font-face { /* */ }"
  }
}
```

## Install

Using npm:

```console
npm install font-manifest-webpack-plugin --save-dev
```

## Usage

In your `webpack.config.js` file:

```js
const FontManifestPlugin = require('font-manifest-webpack-plugin');

module.exports = {
  // an example entry definition
  entry: [ 'app.js'],
  plugins: [
    new FontManifestPlugin()
  ]
};
```

## Options

All options and their defaults. See below for an explanation of individual options.

```js
new FontManifestPlugin({
  formats: ['woff2', 'woff']
})
```

### formats

Array of font formats to include in the manifest.

## License

[MIT](./LICENSE)
