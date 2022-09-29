---
category: Components
type: 通用
title: drag
subtitle: 拖拽
cover: ''
---

## 介绍

拖拽

## API

属性说明如下：

```jsx
interface IProps {
    isDrag: boolean;
}
```

| 属性 | 说明 | 类型 | 默认值 |

| isDrag | 是否拖拽 | boolean | - |

## 案例

```jsx
import { Drag } from '@univer/style-universheet';

<Drag isDrag={true}>
    <div>container</div>
</Drag>;
```
