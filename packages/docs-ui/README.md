# @univerjs/docs-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)

`@univerjs/docs-ui` provides the editor UI layer for Univer Docs, including selection rendering, clipboard support, menus, and document interaction services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-ui` | `UniverDocsUi` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/docs-ui
# or
npm install @univerjs/docs-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-ui/lib/index.css';
import EnUS from '@univerjs/docs-ui/locale/en-US';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';

univer.registerPlugin(UniverDocsUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-ui)
- [GitHub repository](https://github.com/dream-num/univer)

