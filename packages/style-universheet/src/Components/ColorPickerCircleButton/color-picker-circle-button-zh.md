---
category: Components
type: 通用
title: ColorPickerCircleButton
subtitle: 颜色选择器-圆形按钮
cover: ''
---

## 介绍

颜色选择器，由一个圆形按钮触发颜色选择

## API

颜色选择器-圆形按钮的属性说明如下：

| 属性     | 说明                     | 类型                                      | 默认值 |
| -------- | ------------------------ | ----------------------------------------- | ------ |
| color    | 初始化颜色               | `string`                                  | -      |
| style    | 自定义 css 样式对象      | `JSX.CSSProperties`                       | -      |
| onColor  | 用户选择颜色后的回调函数 | `(color: string, val?: boolean) => void;` | -      |
| onCancel | 用户取消选择后的回调函数 | `() => void`                              | -      |

## 案例

```jsx
import { ColorPickerCircleButton } from '@univer/style-universheet';
import { Component } from '@univer/base-component';

type IPanelProps = {};

interface IState {}

class AlternatingColorsSide extends Component<IPanelProps, IState> {
    /**
     * choose custom color
     */
    handleColorSelect(color: string) {}
    /**
     * cancel choose custom color
     */
    handleColorCancel() {}

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IPanelProps, state: IState) {
        return (
            <ColorPickerCircleButton
                color={'#ffffff'}
                style={{ bottom: '30px', right: '0' }}
                onColor={this.handleColorSelect.bind(this)}
                onCancel={this.handleColorCancel.bind(this)}
            />
        );
    }
}
```
