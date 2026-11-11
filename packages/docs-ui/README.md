# @univerjs/docs-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)

`@univerjs/docs-ui` provides the editor UI layer for Univer Docs, including selection rendering, clipboard support, menus, and document interaction services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/docs-ui` | `UniverDocsUi` | Yes | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-ui
# or
npm install @univerjs/docs-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/docs-ui/lib/index.css';
import EnUS from '@univerjs/docs-ui/locale/en-US';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';

univer.registerPlugin(UniverDocsUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

- Import `@univerjs/docs-ui/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-ui)
- [GitHub repository](https://github.com/dream-num/univer)
