# @univerjs/sheets-conditional-formatting-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-conditional-formatting-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-conditional-formatting-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-conditional-formatting-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-conditional-formatting-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-conditional-formatting-ui)

`@univerjs/sheets-conditional-formatting-ui` adds the conditional formatting panels, menus, and interaction UI for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-conditional-formatting-ui` | `UniverSheetsConditionalFormattingUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-conditional-formatting-ui
# or
npm install @univerjs/sheets-conditional-formatting-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-conditional-formatting-ui/lib/index.css';
import EnUS from '@univerjs/sheets-conditional-formatting-ui/locale/en-US';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';

univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverSheetsConditionalFormattingUIPlugin`
- `UniverSheetsConditionalFormattingMobileUIPlugin`

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-conditional-formatting-ui)
- [GitHub repository](https://github.com/dream-num/univer)

