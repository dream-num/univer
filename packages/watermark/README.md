# @univerjs/watermark

[![npm version](https://img.shields.io/npm/v/@univerjs/watermark?style=flat-square)](https://npmjs.com/package/@univerjs/watermark)
[![license](https://img.shields.io/npm/l/@univerjs/watermark?style=flat-square)](https://npmjs.com/package/@univerjs/watermark)
[![downloads](https://img.shields.io/npm/dm/@univerjs/watermark?style=flat-square)](https://npmjs.com/package/@univerjs/watermark)

`@univerjs/watermark` adds configurable watermark rendering to Univer documents and sheets through the render engine.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/watermark` | `UniverWatermark` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/watermark
# or
npm install @univerjs/watermark
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverWatermarkPlugin } from '@univerjs/watermark';

univer.registerPlugin(UniverWatermarkPlugin);
```

## Integration Notes

- Import `@univerjs/watermark/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/watermark)
- [GitHub repository](https://github.com/dream-num/univer)
