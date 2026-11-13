# @univerjs/sheets-filter

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter)

`@univerjs/sheets-filter` adds the core filtering model, commands, and services for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-filter` | `UniverSheetsFilter` | No | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-filter
# or
npm install @univerjs/sheets-filter
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import EnUS from '@univerjs/sheets-filter/locale/en-US';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(EnUS),
    },
});

univer.registerPlugin(UniverSheetsFilterPlugin);
```

### Worker usage

On the main thread, import `UniverSheetsFilterPlugin` from `@univerjs/sheets-filter`.

In the worker entry, import `UniverSheetsFilterPlugin` from `@univerjs/sheets-filter/worker`:

```ts
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter/worker';

univer.registerPlugin(UniverSheetsFilterPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-filter-ui` when users need filter menus and panels.
- Import `@univerjs/sheets-filter/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-filter)
- [GitHub repository](https://github.com/dream-num/univer)
