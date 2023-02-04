---
category: Components
type: 通用
title: Input
subtitle: 输入框
cover: ''
---

## 介绍

输入框组件

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| disabled | 输入框失效状态 | boolean | false |
| onChange | 输入框值改变时的回调 | (event) => void | - |
| onFocus | 输入框聚焦时的回调 | (event) => void | - |
| onBlur | 输入框值失焦时的回调 | (event) => void | - |
| onClick | 输入框值点击时的回调 | (event) => void | - |
| className | 输入框类名 | string | - |
| id | 输入框 id | string | - |
| value | 输入框 value | string | - |
| type | 输入框类型 | 'text' | 'button' | 'checkbox' | 'file' | 'hidden' | 'image' | 'password' | 'radio' | 'rest' | 'submit' | - |
| placeholder | 占位符 | string | - |
| border | 输入框边框 | boolean | true |
| readonly | 输入框是否只读 | boolean | false |

## 案例

```jsx
import { Input } from '@univerjs/style-univer';

<Input onChange={() => {}} type="text" placeholder="哈哈" value="1"></Input>;
```
