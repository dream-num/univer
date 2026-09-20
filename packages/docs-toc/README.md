# @univerjs/docs-toc

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-toc?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc)
[![license](https://img.shields.io/npm/l/@univerjs/docs-toc?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-toc?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc)

`@univerjs/docs-toc` provides table-of-contents insertion, update, deletion, and FIELD-range lookup for Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-toc` | `UniverDocsToc` | No | No | No |

## Installation

```sh
pnpm add @univerjs/docs-toc
# or
npm install @univerjs/docs-toc
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverDocsTocPlugin } from '@univerjs/docs-toc';

univer.registerPlugin(UniverDocsTocPlugin);
```

Use this package with `@univerjs/docs-toc-ui` when users need Ribbon, context-menu, dialog, and active-range feedback.

The updater currently evaluates outline-based TOC instructions (`\\o`). Other Word TOC switches are retained in FIELD metadata but are not all evaluated.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-toc)
- [GitHub repository](https://github.com/dream-num/univer)
