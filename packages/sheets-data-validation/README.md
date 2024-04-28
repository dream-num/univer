# @univerjs/sheets-data-validation

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation)](https://npmjs.org/packages/@univerjs/sheets-data-validation)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-data-validation)](https://img.shields.io/npm/l/@univerjs/sheets-data-validation)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## Introduction

> `@univerjs/sheets-data-validation` provides full capabilities for Univer Sheet data validation, including panel capabilities.

## Usage

### Installation

```shell
# Using npm
npm i @univerjs/sheets-data-validation

# Using pnpm
pnpm add

### Register the plugin

```typescript
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';

univer.registerPlugin(UniverDataValidationPlugin);
univer.registerPlugin(UniverSheetsDataValidationPlugin);

// initial data validation
// dentation: https://github.com/dream-num/univer/blob/dev/packages/core/src/types/interfaces/i-data-validation.ts#L48
const dataValidation = [
    {
        uid: 'xxx-2',
        type: DataValidationType.CHECKBOX,
        ranges: [{
            startRow: 6,
            endRow: 10,
            startColumn: 0,
            endColumn: 5,
        }],
    },
];

export const DEFAULT_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'workbook-01',
    locale: LocaleType.ZH_CN,
    name: 'UniverSheet Demo',
    resource: [{
        name: DATA_VALIDATION_PLUGIN_NAME,
        data: JSON.stringify({
            'sheetId-1': dataValidation,
        }),
    }]
    // ...
}

// load initial snapshot
univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
```
