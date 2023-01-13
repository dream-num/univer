---
category: Components
type: 定制
title: ToolBar
subtitle: 工具栏
cover: ''
---

## 介绍

工具栏

## API

工具栏的属性说明如下：

| 属性       | 说明                  | 类型                        | 默认值                     |
| ---------- | --------------------- | --------------------------- | -------------------------- |
| style      | 自定义 css 央样式对象 | `JSX.CSSProperties`         | -                          |
| config     | 配置项                | `IShowToolBarConfig`        | `IShowToolBarConfig`       |
| forwardRef | preact refs 引用      | `RefObject<HTMLDivElement>` | -                          |
| func       | 回调挂载              | `object`                    | `{ addButton: Function; }` |

`IShowToolBarConfig`包含以下配置，默认都为 `true`，可以指定想隐藏的工具栏按钮为`false`

```json
{
    "undoRedo": false, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
    "paintFormat": false, //格式刷
    "currencyFormat": false, //货币格式
    "percentageFormat": false, //百分比格式
    "numberDecrease": false, // '减少小数位数'
    "numberIncrease": false, // '增加小数位数
    "moreFormats": false, // '更多格式'
    "font": false, // '字体'
    "fontSize": false, // '字号大小'
    "bold": false, // '粗体 (Ctrl+B)'
    "italic": false, // '斜体 (Ctrl+I)'
    "strikethrough": false, // '删除线 (Alt+Shift+5)'
    "underline": false, // '下划线 (Alt+Shift+6)'
    "textColor": false, // '文本颜色'
    "fillColor": false, // '单元格颜色'
    "border": false, // '边框'
    "mergeCell": false, // '合并单元格'
    "horizontalAlignMode": false, // '水平对齐方式'
    "verticalAlignMode": false, // '垂直对齐方式'
    "textWrapMode": false, // '换行方式'
    "textRotateMode": false // '文本旋转方式'
}
```

以下这些配置已经分配到各个插件中了

```json
{
    "link": false, // '插入链接'
    "image": false, // '插入图片'
    "chart": false, // '图表'
    "comment": false, //'批注'
    "pivotTable": false, //'数据透视表'
    "function": false, // '公式'
    "frozenMode": false, // '冻结方式'
    "sort": false, // '排序'
    "filter": false, // '筛选'
    "conditionalalFormat": false, // '条件格式'
    "dataValidation": false, // '数据验证'
    "splitColumn": false, // '分列'
    "screenshot": false, // '截图'
    "findAndReplace": false, // '查找替换'
    "protection": false, // '工作表保护'
    "print": false // '打印'
}
```

## 案例

```jsx
import { ToolBar } from '@univer/style-univer';

const SheetContainer = () => {
    return (
        <ToolBar
            style={{
                display: layout.toolBar ? 'block' : 'none',
            }}
            config={layout.toolBarConfig!}
            func={{ addButton }}
            ref={this.toolBarRef}
        ></ToolBar>
    );
};
```
