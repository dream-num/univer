# @univerjs/engine-render

[![npm version](https://img.shields.io/npm/v/@univerjs/engine-render?style=flat-square)](https://npmjs.com/package/@univerjs/engine-render)
[![license](https://img.shields.io/npm/l/@univerjs/engine-render?style=flat-square)](https://npmjs.com/package/@univerjs/engine-render)
[![downloads](https://img.shields.io/npm/dm/@univerjs/engine-render?style=flat-square)](https://npmjs.com/package/@univerjs/engine-render)

`@univerjs/engine-render` is Univer's canvas rendering engine. It handles document layout, rendering primitives, interaction layers, scrolling, and zooming.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/engine-render` | `UniverEngineRender` | No | No | No |

## Installation

```sh
pnpm add @univerjs/engine-render
# or
npm install @univerjs/engine-render
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';

univer.registerPlugin(UniverRenderEnginePlugin);
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/engine-render)
- [GitHub repository](https://github.com/dream-num/univer)

