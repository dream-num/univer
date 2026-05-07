# @univerjs/slides-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/slides-ui?style=flat-square)](https://npmjs.com/package/@univerjs/slides-ui)
[![license](https://img.shields.io/npm/l/@univerjs/slides-ui?style=flat-square)](https://npmjs.com/package/@univerjs/slides-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/slides-ui?style=flat-square)](https://npmjs.com/package/@univerjs/slides-ui)

`@univerjs/slides-ui` adds the presentation editor UI layer for Univer Slides.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/slides-ui` | `UniverSlidesUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/slides-ui
# or
npm install @univerjs/slides-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/slides-ui/lib/index.css';
import EnUS from '@univerjs/slides-ui/locale/en-US';
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui';

univer.registerPlugin(UniverSlidesUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/slides-ui)
- [GitHub repository](https://github.com/dream-num/univer)

