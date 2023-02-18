---
category: Components
type: 通用
title: Button
subtitle: 按钮
cover: ''
---

## 介绍

通用按钮组件

按钮类型

-   主按钮：类型`primary`，一般用于弹窗的确定按钮，每行的确认按钮，一个操作区域只能有一个主按钮
-   默认按钮：工具栏按钮
-   文本按钮：取消功能

按钮状态

-   禁用：工具栏禁用状态
-   加载中：异步操作等待状态

## API

通过设置 Button 的属性来产生不同的按钮样式，推荐顺序为：`type` -> `shape` -> `size` -> `loading` -> `disabled`。

按钮的属性说明如下：

| 属性      | 说明                                                                                                                                 | 类型                                                              | 默认值    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------- |
| block     | 将按钮宽度调整为其父宽度的选项                                                                                                       | boolean                                                           | false     |
| danger    | 设置危险按钮                                                                                                                         | boolean                                                           | false     |
| disabled  | 按钮失效状态                                                                                                                         | boolean                                                           | false     |
| htmlType  | 设置 `button` 原生的 `type` 值，可选值请参考 [HTML 标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) | string                                                            | `button`  |
| loading   | 设置按钮载入状态                                                                                                                     | boolean \| { delay: number }                                      | false     |
| shape     | 设置按钮形状                                                                                                                         | `circle` \| `round`                                               | -         |
| size      | 设置按钮大小                                                                                                                         | `large` \| `middle` \| `small`                                    | `middle`  |
| type      | 设置按钮类型                                                                                                                         | `primary` \| `ghost` \| `dashed` \| `link` \| `text` \| `default` | `default` |
| onClick   | 点击按钮时的回调                                                                                                                     | (event) => void                                                   | -         |
| children  | 按钮内容或者子节点                                                                                                                   | any                                                               | -         |
| className | 点击按钮时的回调                                                                                                                     | string                                                            | -         |

支持原生 button 的其他所有属性。

## 案例

```jsx
import { Button } from '@univerjs/style-univer';

const Toolbar = () => {
    const buttonText = '确认';
    return (
        <Button
            type="primary"
            onClick={() => {
                this.handleClick();
            }}
        >
            {buttonText}
        </Button>
    );
};
```
