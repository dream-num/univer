# @univerjs/sheets-hyper-link-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-hyper-link-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)

`@univerjs/sheets-hyper-link-ui` adds hyperlink menus, dialogs, rendering, and interaction UI for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-hyper-link-ui` | `UniverSheetsHyperLinkUi` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-hyper-link-ui
# or
npm install @univerjs/sheets-hyper-link-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-hyper-link-ui/lib/index.css';
import EnUS from '@univerjs/sheets-hyper-link-ui/locale/en-US';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';

univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-hyper-link-ui)
- [GitHub repository](https://github.com/dream-num/univer)

