# @univerjs/sheets-hyper-link-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)

`@univerjs/sheets-hyper-link-ui` adds hyperlink menus, dialogs, rendering, and interaction UI for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-hyper-link-ui` | `UniverSheetsHyperLinkUi` | Yes | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-hyper-link-ui
# or
npm install @univerjs/sheets-hyper-link-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/sheets-hyper-link-ui/lib/index.css';
import EnUS from '@univerjs/sheets-hyper-link-ui/locale/en-US';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';

univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

- Import `@univerjs/sheets-hyper-link-ui/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)
- [GitHub repository](https://github.com/dream-num/univer)
