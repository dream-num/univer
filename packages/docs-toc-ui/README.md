# @univerjs/docs-toc-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-toc-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-toc-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-toc-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc-ui)

`@univerjs/docs-toc-ui` adds Ribbon, context-menu, update dialog, and active-range feedback for `@univerjs/docs-toc`.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-toc-ui` | `UniverDocsTocUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-toc-ui
# or
npm install @univerjs/docs-toc-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-toc-ui/lib/index.css';
import EnUS from '@univerjs/docs-toc-ui/locale/en-US';
import { UniverDocsTocUIPlugin } from '@univerjs/docs-toc-ui';

univer.registerPlugin(UniverDocsTocUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Register this package after Docs, Docs UI, Render Engine, and Docs TOC core packages.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-toc-ui)
- [GitHub repository](https://github.com/dream-num/univer)
