# @univerjs/docs-hyper-link-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-hyper-link-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-hyper-link-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-hyper-link-ui)

`@univerjs/docs-hyper-link-ui` adds the UI for creating and editing hyperlinks in Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-hyper-link-ui` | `UniverDocsHyperLinkUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-hyper-link-ui
# or
npm install @univerjs/docs-hyper-link-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-hyper-link-ui/lib/index.css';
import EnUS from '@univerjs/docs-hyper-link-ui/locale/en-US';
import { UniverDocsHyperLinkUIPlugin } from '@univerjs/docs-hyper-link-ui';

univer.registerPlugin(UniverDocsHyperLinkUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

Register this package after the Docs, Docs UI, and Docs hyperlink core packages.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-hyper-link-ui)
- [GitHub repository](https://github.com/dream-num/univer)

