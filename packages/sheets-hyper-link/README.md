# @univerjs/sheets-hyper-link

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-hyper-link?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-hyper-link?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-hyper-link?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-hyper-link)

`@univerjs/sheets-hyper-link` adds the core hyperlink model, commands, and sheet-specific services for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-hyper-link` | `UniverSheetsHyperLink` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-hyper-link
# or
npm install @univerjs/sheets-hyper-link
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import EnUS from '@univerjs/sheets-hyper-link/locale/en-US';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(EnUS),
    },
});

univer.registerPlugin(UniverSheetsHyperLinkPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-hyper-link-ui` when users need hyperlink editing UI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-hyper-link)
- [GitHub repository](https://github.com/dream-num/univer)
