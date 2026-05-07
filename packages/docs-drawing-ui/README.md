# @univerjs/docs-drawing-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-drawing-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-drawing-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-drawing-ui)

`@univerjs/docs-drawing-ui` adds the user interface for creating, selecting, editing, and rendering drawing objects in Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-drawing-ui` | `UniverDocsDrawingUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-drawing-ui
# or
npm install @univerjs/docs-drawing-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-drawing-ui/lib/index.css';
import EnUS from '@univerjs/docs-drawing-ui/locale/en-US';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';

univer.registerPlugin(UniverDocsDrawingUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-drawing-ui)
- [GitHub repository](https://github.com/dream-num/univer)

