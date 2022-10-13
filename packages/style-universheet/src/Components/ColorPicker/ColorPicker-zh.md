---
category: Components
type: 通用
title: ColorPicker
subtitle: 颜色选择器
cover: ''
---

## 介绍

颜色选择器组件

## API

按钮的属性说明如下：

| 属性      | 说明     | 类型              | 默认值 |
| --------- | -------- | ----------------- | ------ |
| color     | 默认颜色 | string            | `#000` |
| onCancel  | 取消按钮 | function          | -      |
| onClick   | 确定按钮 | function          | -      |
| onChange  | 切换按钮 | function          | -      |
| style     | 内联样式 | JSX.CSSProperties | -      |
| className | 类名     | string            | -      |

支持原生 button 的其他所有属性。

## 案例

```jsx
import { ColorPicker } from '@univer/style-universheet';

const Demo = () => {
    const buttonText = '确认';
    return (
        <ColorPicker
            color="#000"
            onClick={(color) => {
                console.log(color);
            }}
        />
    );
};
```
