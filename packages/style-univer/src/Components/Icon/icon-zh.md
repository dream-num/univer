---
category: Components
type: 通用
title: Icon
subtitle: 图标
cover: ''
---

## 介绍

图标集组件

icon 图标以 svg 形式展示,统一导出

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| spin | 是否一直旋转 | boolean | false |
| rotate | 旋转角度 | number | - |
| style | 样式 | cssStyle | - |
| className | 父容器类名 | string | - |

## 案例

```jsx
import { Icon } from '@univer/style-univer';

<Icon.Text.TopVerticalIcon />
<Icon.Format.NextIcon rotate={90} />

```
