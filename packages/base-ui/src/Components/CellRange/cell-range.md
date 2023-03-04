---
category: Components
type: General
title: CellRangeModal
cover: ''
---

## Introduce

CellRangeModal Component

## API

Property Introduction:

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

| Property | Description | Type | Default |

| placeholderProps | placeholders of Range select input | string | - |
| valueProps | range value | string | - |
| placeholderState | placeholder of Range selection confirmation input | string | - |
| modalData | contents of the range selection modal | ModalProps | - |
| value | range value of range selection modal | string | - |

## Case

```jsx
import { CellRangeModal } from '@univerjs/style-univer';

<CellRangeModal placeholderProps="请使用字符串" valueProps="A10:B10"></CellRangeModal>;
```
