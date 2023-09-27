# unplugin-load-file

unplugin-load-file is a utility library designed to resolve the configuration file loading issues in CommonJS and ECMAScript Modules (ESM) environments in Node.js.

## Installation

```bash
npm install @cc-heart/unplugin-load-file
```

## Usage

To use unplugin-load-file, you need to import the loadFile function from the library and provide the filename path to your configuration file as an argument. The loadFile function will automatically handle the differences between CommonJS and ESM environments and return the loaded configuration object.

Here's an example of how to use loadFile:

```js
import { loadConfig } from '@cc-heart/unplugin-load-file'

const config = await loadConfig({
  filetPath: 'config',
  suffixList: ['ts', 'mts', 'mjs', 'js'],
})
```

> if you are using commonjs, use the flowing:

```js
const { loadConfig } = require('@cc-heart/unplugin-load-file')
```

## LICENSE

[MIT](./LICENSE)
