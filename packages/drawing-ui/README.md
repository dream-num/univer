# @univerjs/drawing-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/drawing-ui)
[![license](https://img.shields.io/npm/l/@univerjs/drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/drawing-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/drawing-ui)

`@univerjs/drawing-ui` provides common drawing UI services and components that document- or sheet-specific drawing packages build on.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/drawing-ui` | `UniverDrawingUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/drawing-ui
# or
npm install @univerjs/drawing-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/drawing-ui/lib/index.css';
import EnUS from '@univerjs/drawing-ui/locale/en-US';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';

univer.registerPlugin(UniverDrawingUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/drawing-ui)
- [GitHub repository](https://github.com/dream-num/univer)

