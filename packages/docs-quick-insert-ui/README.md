# @univerjs/docs-quick-insert-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-quick-insert-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-quick-insert-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-quick-insert-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-quick-insert-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-quick-insert-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-quick-insert-ui)

`@univerjs/docs-quick-insert-ui` adds quick-insert UI capabilities for Univer Docs, including insert affordances backed by the Docs and Drawing packages.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-quick-insert-ui` | `UniverDocsQuickInsertUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-quick-insert-ui
# or
npm install @univerjs/docs-quick-insert-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-quick-insert-ui/lib/index.css';
import EnUS from '@univerjs/docs-quick-insert-ui/locale/en-US';
import { UniverDocsQuickInsertUIPlugin } from '@univerjs/docs-quick-insert-ui';

univer.registerPlugin(UniverDocsQuickInsertUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-quick-insert-ui)
- [GitHub repository](https://github.com/dream-num/univer)

