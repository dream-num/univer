# @univerjs/sheets-data-validation

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation)](https://npmjs.org/packages/@univerjs/sheets-data-validation)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-data-validation)](https://img.shields.io/npm/l/@univerjs/sheets-data-validation)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

> `@univerjs/sheets-data-validation` 为 Univer Sheet 提供了完整的数据验证功能。

## 使用指南

### 安装

```shell
# 使用 npm
npm i @univerjs/sheets-data-validation

# 使用 pnpm
pnpm add @univerjs/sheets-data-validation
```

### 注册插件

```typescript
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';

univer.registerPlugin(UniverDataValidationPlugin);
univer.registerPlugin(UniverSheetsDataValidationPlugin);

// 配置初始化数据验证数据
// 定义: https://github.com/dream-num/univer/blob/dev/packages/core/src/types/interfaces/i-data-validation.ts#L48
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
    // 其他配置省略
}

// 加载初始snapshot
univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
```
