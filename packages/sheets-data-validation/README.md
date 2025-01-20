# @univerjs/sheets-data-validation

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/sheets-data-validation` | `UniverSheetsDataValidation` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ️❌ | ❌️ |

## Introduction

> `@univerjs/sheets-data-validation` provides full capabilities for Univer Sheet data validation.

## Usage

### Installation

```shell
# Using npm
npm i @univerjs/sheets-data-validation

# Using pnpm
pnpm add
```

### Register the plugin

```typescript
import type { IWorkbookData } from '@univerjs/core';
import { DataValidationType, ICommandService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import {
    DATA_VALIDATION_PLUGIN_NAME,
    UniverSheetsDataValidationPlugin,
} from '@univerjs/sheets-data-validation';

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
    resources: [{
        name: DATA_VALIDATION_PLUGIN_NAME,
        data: JSON.stringify({
            'sheetId-1': dataValidation,
        }),
    }],
    // ...
};

// load initial snapshot
univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
```

### API
```typescript
// Commands and Command params for sheet-data-validation management
import type {
    IAddSheetDataValidationCommandParams,
    IRemoveSheetDataValidationCommandParams,
    IUpdateSheetDataValidationOptionsCommandParams,
    IUpdateSheetDataValidationRangeCommandParams,
    IUpdateSheetDataValidationSettingCommandParams,
} from '@univerjs/sheets-data-validation';
import {
    AddSheetDataValidationCommand,
    DATA_VALIDATION_PLUGIN_NAME,
    RemoveSheetDataValidationCommand,
    UniverSheetsDataValidationPlugin,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
    // internal service
    SheetsDataValidationValidatorService
} from '@univerjs/sheets-data-validation';

// eg. Add data validation from command
const commandService = univer.__getInjector().get(ICommandService);

commandService.executeCommand(AddSheetDataValidationCommand.id, {
    unitId: 'unitId',
    subUnitId: 'subUnitId',
    rule: {
        uid: 'xxx-2',
        type: DataValidationType.CHECKBOX,
        ranges: [{
            startRow: 6,
            endRow: 10,
            startColumn: 0,
            endColumn: 5,
        }],
    },
} as IAddSheetDataValidationCommandParams);

// Using internal service Such as validator
const sheetsDataValidationValidatorService = univer.__getInjector().get(SheetsDataValidationValidatorService);
sheetsDataValidationValidatorService.validatorWorksheet('unitId', 'sheetId')
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-data-validation?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-data-validation
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-data-validation?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-data-validation?style=flat-square
