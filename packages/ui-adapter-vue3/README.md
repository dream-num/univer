# @univerjs/ui-adapter-vue3

[![npm version](https://img.shields.io/npm/v/@univerjs/ui-adapter-vue3?style=flat-square)](https://npmjs.com/package/@univerjs/ui-adapter-vue3)
[![license](https://img.shields.io/npm/l/@univerjs/ui-adapter-vue3?style=flat-square)](https://npmjs.com/package/@univerjs/ui-adapter-vue3)
[![downloads](https://img.shields.io/npm/dm/@univerjs/ui-adapter-vue3?style=flat-square)](https://npmjs.com/package/@univerjs/ui-adapter-vue3)

`@univerjs/ui-adapter-vue3` adapts Univer UI services for Vue 3 integrations.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/ui-adapter-vue3` | `UniverUiAdapterVue3` | No | No | No | No |

## Installation

```sh
pnpm add @univerjs/ui-adapter-vue3
# or
npm install @univerjs/ui-adapter-vue3
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';

univer.registerPlugin(UniverVue3AdapterPlugin);
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/ui-adapter-vue3)
- [GitHub repository](https://github.com/dream-num/univer)
