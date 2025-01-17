# @univerjs/sheets-source-binding

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-source-binding)](https://npmjs.org/packages/@univerjs/sheets-source-binding)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-source-binding)](https://img.shields.io/npm/l/@univerjs/sheets-source-binding)

## 介绍

`sheets-source-binding` 插件用于读取来自第三方的数据，可以通过在sheet单元格上设置要绑定的数据格式的path和对应的 `source` 来实现简单的数据写入sheet的单元格.

> 该插件目前属于draft状态，不支持协同.

## 使用方法 `facade`

#### 示例代码

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
    fields: ['商品', '种类','日期'],
    records: [['苹果', 1, 1736942545041], ['香蕉', '水果',1736942545041], ['圆珠笔', '文具',1736942545041]]
})
fSheet.setBindingNode({
    row: 1,
    column: 4,
    path: '商品',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.List,
    sourceId: listSource.getId()
})

fSheet.setBindingNode({
    row: 1,
    column: 5,
    path: '种类',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.List,
    sourceId: listSource.getId()
})
fSheet.setBindingNode({
    row: 1,
    column: 6,
    path: '日期',
    type: univerAPI.Enum.DataBindingNodeTypeEnum.List,
    sourceId: listSource.getId(),
    isDate:true,
})

```

#### `facade api` 介绍

`sheets-source-binding` 分为两部分， `source` 和 `bind` ：

`source` 相关的api封装在 `FWorkbook` 上:

```ts
// 创建，
createSource(type, isListObject?, id?): SourceModelBase;
// 获取
getSource(sourceId): SourceModelBase;
// 更新数据
setSourceData(sourceId, data): void;
```
 `bind` 相关api可以在 `FWorksheet`:

 ```ts
 /**
 * The binding node of cell, which config the source id, path, row, column.
 */
export interface ICellBindingNodeParam {
    /**
     * The binding node type, the node type should be same as provide source type.
     */
    type: DataBindingNodeTypeEnum;
    /**
     * The path of the binding node, the path should be same as provide source path.
     * @example
     * for object type : the source is :{user: {name :'Tom'}}, we can set path 'user.name' to represent the Tom.
     * for list type : the source is :{fields:['name', 'age'], records:[['Tom', 18],['Jerry', 20]]}, we can set path 'name' to represent the all names in data.
     */
    path: string;
    /**
     * The source id of the binding node, the source id should be same as provide source id.
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
      * Whether treat the data as date.
      */
    isDate?: boolean;
}
// 设置
setBindingNode(bindingNode): void;
// 删除
removeBindingNode(row, column): void;
// 读取
getBindingNode(row, column): ICellBindingNode | undefined;

 ```
 另外我们提供了数据模式和绑定模式， 可以在 `FWorkbook` 通过 `facade api` 切换：

 ```ts
// 绑定模式
fWorkbook.usePathMode();
// 取值模式
fWorkbook.useValueMode()
 ```
在取值模式下， `univer` 会直接读取设置在source中的value， 在绑定模式下，会显示绑定的path在单元格上。

### 安装

```shell
npm i @univerjs/sheets-source-binding
```

### 导入

```ts
import { UniverSheetsBindingSourcePlugin } from '@univerjs/sheets-source-binding';

univer.registerPlugin(UniverSheetsBindingSourcePlugin);
```