---
category: Components
type: 通用
title: Select
subtitle: 下拉框组件
cover: ''
---

## 介绍

下拉框组件

下拉框组件类型

-   默认：点击弹出下拉框
-   文本框：类型`input`，点击文本框弹出下拉框
-   复合类型：左侧按钮是功能按钮,右侧按钮弹出下拉框
-   颜色选择类型：左侧按钮是功能按钮,右侧按钮弹出颜色选择器
-   jsx 类型：插入 jsx

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| label | 下拉按钮显示的内容 | string/JSX | - |
| selected | 下拉框选项被选中时显示的 √ | boolean | - |
| icon | 尾处的图标或文字或 jsx | JSX.Element/string | - |
| tooltip | 下拉按钮移入时的提示 | string | - |
| children | 按钮内容或者子节点 | any | - |
| className | 点击按钮时的回调 | string | - |
| onClick | 点击按钮时的回调 | (...arg: Array<any>) => void | - |
| needChange | 是否改变按钮内容 | boolean | - |
| selectType | 下拉框类型 | input/color/double/jsx | - |
| border | 显示侧边框 | boolean | - |
| showSelect | 显示下拉框 | (e) => void | - |
| hideSelect | 隐藏侧边框 | (e) => void | - |

## 案例

```jsx
import { Select } from '@univerjs/style-univer';

<Select
    tooltip={item.tooltip}
    tooltipRight={item.tooltipRight}
    key={item.name}
    children={item.children}
    label={item.label}
    icon={item.icon}
    needChange={item.needChange}
    selectType={item.selectType}
    border={item.border}
    slot={item.slot || {}}
    onClick={item.onClick?.bind(this, { item, index }, this.context)}
/>;
```
