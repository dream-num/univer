# @univerjs/sheets-filter-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-filter-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-filter-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-filter-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter-ui)

`@univerjs/sheets-filter-ui` adds filter menus, panels, and interaction UI for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-filter-ui` | `UniverSheetsFilterUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-filter-ui
# or
npm install @univerjs/sheets-filter-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-filter-ui/lib/index.css';
import EnUS from '@univerjs/sheets-filter-ui/locale/en-US';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

univer.registerPlugin(UniverSheetsFilterUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverSheetsFilterUIPlugin`
- `UniverSheetsFilterMobileUIPlugin`
- `UniverSheetsFilterUIWorkerPlugin`

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-filter-ui)
- [GitHub repository](https://github.com/dream-num/univer)

