# @univerjs/sheets-conditional-formatting

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-conditional-formatting)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-conditional-formatting?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-conditional-formatting)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-conditional-formatting?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-conditional-formatting)

`@univerjs/sheets-conditional-formatting` adds the core conditional formatting model, commands, and calculation support for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-conditional-formatting` | `UniverSheetsConditionalFormatting` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-conditional-formatting
# or
npm install @univerjs/sheets-conditional-formatting
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';

univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-conditional-formatting-ui` when users need menus and rule-management panels.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-conditional-formatting)
- [GitHub repository](https://github.com/dream-num/univer)

