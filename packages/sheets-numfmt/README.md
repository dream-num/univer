# @univerjs/sheets-numfmt
sheets-numfmt

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/sheets-numfmt` | `UniverSheetsNumfmt` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ⭕️ | ⭕️ |

## Introduction

Providing editing/rendering capabilities around `number format`, such as edit panels, toolbar buttons, real-time previews, row/column variations, etc.

> [!NOTE]
> Numerical format is one of the core functions of electronic spreadsheets, and therefore, parsing and handling of numerical format is done within `@univerjs/sheets`.

## Usage

### Installation

```shell
# Using npm
npm install @univerjs/sheets-numfmt

# Using pnpm
pnpm add @univerjs/sheets-numfmt
```

### How to use

Import `@univerjs/sheets-numfmt` at the entrance .

```typescript
import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales,
    logLevel: LogLevel.VERBOSE,
});

// ... Other plug-ins are registered

univer.registerPlugin(UniverSheetsNumfmtPlugin);
```

> [!NOTE]
> If you need to export the snapshot to support the export data format, you need to add [some additional code](/)

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-numfmt?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-numfmt
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-numfmt?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-numfmt?style=flat-square
