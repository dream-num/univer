# @univerjs/docs-drawing

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/docs-drawing)
[![license](https://img.shields.io/npm/l/@univerjs/docs-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/docs-drawing)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/docs-drawing)

`@univerjs/docs-drawing` connects the common drawing model to Univer Docs so documents can host and manage drawing objects.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/docs-drawing` | `UniverDocsDrawing` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-drawing
# or
npm install @univerjs/docs-drawing
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';

univer.registerPlugin(UniverDocsDrawingPlugin);
```

## Integration Notes

- Import `@univerjs/docs-drawing/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-drawing)
- [GitHub repository](https://github.com/dream-num/univer)
