---
category: Components
type: 通用
title: UL
subtitle: 无序列表组件
cover: ''
---

## 介绍

无序列表组件

配合 select 组件使用,也可单独使用

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| label | li 显示的内容 | string/JSX | - |
| selected | li 选项被选中时显示的 √ | boolean | - |
| icon | 尾处的图标或文字或 jsx | JSX.Element/string | - |
| tooltip | li 移入时的提示 | string | - |
| children | 按钮内容或者子节点 | any | - |
| className | 类名 | string | - |
| onClick | 点击按钮时的回调 | (...arg: Array<any>) => void | - |
| style | 样式 | cssStyle | - |
| border | 显示上边框 | boolean | - |
| show | 是否显示 | boolean | - |
| showSelect | 显示 ul | (e) => void | - |
| showParentSelect | 显示父级 li(如果 li 里有子元素) | () => void | - |
| hideSelect | 隐藏 ul | (e) => void | - |

## 案例

```jsx
import { Ul } from '@univerjs/style-univer';

<Ul children={this.state.children} onClick={this.handleClick} ref={this.ref}></Ul>;
```
