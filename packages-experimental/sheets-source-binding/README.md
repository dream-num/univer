# @univerjs/sheets-source-binding

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-source-binding)](https://npmjs.org/packages/@univerjs/sheets-source-binding)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-source-binding)](https://img.shields.io/npm/l/@univerjs/sheets-source-binding)

## Introduction

 The `sheets-source-binding` plugin is used to read data from third parties. You can set the path of the data format to be bound and the corresponding `source` on the sheet cell to achieve simple data writing to the sheet cell.

> This plugin is currently in draft status and does not support collaboration.

## Usage `facade`

#### Example Code

```ts
const fWorkbook = univerAPI.getActiveWorkbook();
const fSheet = fWorkbook.getActiveSheet();

const source = fWorkbook.createSource(univerAPI.Enum.DataBindingNodeTypeEnum.Object);
source.setSourceData({
    user: {
        name: 'Jack'
    }
})

fSheet.setBindingNode({
    row: 1,
    column: 2,
    path: 'user.name',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.Object,
    sourceId: source.getId()
})

const listSource = fWorkbook.createSource(univerAPI.Enum.DataBindingNodeTypeEnum.List, false);
listSource.setSourceData({
    fields: ['Product', 'Category', 'Date'],
    records: [['Apple', 1, 1736942545041], ['Banana', 'Fruit', 1736942545041], ['Pen', 'Stationery', 1736942545041]]
})
fSheet.setBindingNode({
    row: 1,
    column: 4,
    path: 'Product',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.List,
    sourceId: listSource.getId()
})

fSheet.setBindingNode({
    row: 1,
    column: 5,
    path: 'Category',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.List,
    sourceId: listSource.getId()
})
fSheet.setBindingNode({
    row: 1,
    column: 6,
    path: 'Date',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.List,
    sourceId: listSource.getId(),
    isDate: true,
})

```

#### `facade api` Introduction

`sheets-source-binding` is divided into two parts, `source` and `bind`:

The `source` related APIs are encapsulated in `FWorkbook`:

```ts
// Create
createSource(type, isListObject?, id?): SourceModelBase;
// Get
getSource(sourceId): SourceModelBase;
// Update data
setSourceData(sourceId, data): void;
```
The `bind` related APIs can be found in `FWorksheet`:

```ts
/**
 * The binding node of cell, which configures the source id, path, row, column.
 */
export interface ICellBindingNodeParam {
    /**
     * The binding node type, the node type should be the same as the provided source type.
     */
    type: DataBindingNodeTypeEnum;
    /**
     * The path of the binding node, the path should be the same as the provided source path.
     * @example
     * for object type: the source is: {user: {name: 'Tom'}}, we can set path 'user.name' to represent Tom.
     * for list type: the source is: {fields: ['name', 'age'], records: [['Tom', 18], ['Jerry', 20]]}, we can set path 'name' to represent all names in data.
     */
    path: string;
    /**
     * The source id of the binding node, the source id should be the same as the provided source id.
     */
    sourceId: string;
    /**
     * The target row of the binding node.
     */
    row: number;
    /**
     * The target column of the binding node.
     */
    column: number;
    /**
     * Whether to treat the data as a date.
     */
    isDate?: boolean;
}
// Set
setBindingNode(bindingNode): void;
// Remove
removeBindingNode(row, column): void;
// Get
getBindingNode(row, column): ICellBindingNode | undefined;

```
Additionally, we provide data mode and binding mode, which can be switched in `FWorkbook` through the `facade api`:

```ts
// Binding mode
fWorkbook.usePathMode();
// Value mode
fWorkbook.useValueMode()
```
In value mode, `univer` will directly read the value set in the source. In binding mode, the bound path will be displayed on the cell.

### Installation

```shell
npm i @univerjs/sheets-source-binding
```

### Import

```ts
import { UniverSheetsBindingSourcePlugin } from '@univerjs/sheets-source-binding';

univer.registerPlugin(UniverSheetsBindingSourcePlugin);
```