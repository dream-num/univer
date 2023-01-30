---
category: Components
type: 通用
title: Collapse
subtitle: 折叠面板
cover: ''
---

## 介绍

折叠面板

## API

属性说明如下：

```jsx
interface PanelProps {
    children: ComponentChildren;
    header?: ComponentChildren;
}
```

| 属性 | 说明 | 类型 | 默认值 |

| header | 标题 | ComponentChildren | - |

## 案例

```jsx
import { Collapse, Panel } from '@univerjs/style-univer';

<Collapse>
    <Panel header="title"></Panel>
</Collapse>;
```
