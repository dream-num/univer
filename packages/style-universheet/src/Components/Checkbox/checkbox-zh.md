---
category: Components
type: 通用
title: Checkbox CheckboxGroup
subtitle: 复选框  复选框组合
cover: ''
---

## 介绍

复选框组件

复选框状态

-   checked 选中
-   disabled 禁止选中

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| disabled | 复选框失效状态 | boolean | false |
| onChange | 勾选的回调 | (event) => void | - |
| children | 复选框内容或者子节点 | any | - |
| className | 复选框父容器类名 | string | - |
| value | 复选框 value | string | - |

## 介绍

复选框组合

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

type options = {
checked?: boolean;
disabled?: boolean;
name?: string;
label?: string | JSX.Element;
value?: string;
};

| disabled | 复选框失效状态 | boolean | false |
| onChange | 勾选的回调 | (event) => void | - |
| options | 复选框组合内容(类型为 type options) | Array<options> | - |

## 案例

```jsx
import { Checkbox, CheckboxGroup } from '@univer/style-universheet';

let options = {
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    label?: string | JSX.Element;
    value?: string;
};

<CheckboxGroup options={[options]} onChange={()=>{}}></CheckboxGroup>
<Checkbox value={`Header`} checked={true}>Header</Checkbox>
```
