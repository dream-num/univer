---
category: Components
type: 通用
title: CellRangeModal
subtitle: 范围选择组件
cover: ''
---

## 介绍

范围选择组件

## API

属性说明如下：

```jsx
type ModalButtonGroup = {
    name?: string,
    label?: string,
    onClick?: (e?: any) => void,
    type?: string,
};

interface ModalProps extends ModalBaseProps {
    show?: boolean;
    name?: string;
}
```

| 属性 | 说明 | 类型 | 默认值 |

| placeholderProps | 范围选择输入框占位符 | string | - |
| valueProps | 范围 | string | - |
| placeholderState | 范围选择确定框占位符 | string | - |
| modalData | 范围选择确定模态框内容 | ModalProps | - |
| value | 范围选择确定框值 | string | - |

## 案例

```jsx
import { CellRangeModal } from '@univerjs/style-univer';

<CellRangeModal placeholderProps="请使用字符串" valueProps="A10:B10"></CellRangeModal>;
```
