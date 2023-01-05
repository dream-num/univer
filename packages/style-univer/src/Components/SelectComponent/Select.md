---
category: Components
type: General
title: Select
cover: ''
---

## Introductionzu

Select Component

Select Type

-   default：click to popup select
-   input：click input to popup select
-   double：click left button to relize function,click right button to popup select
-   color：click left button to relize function,click right button to popup colorpicker component
-   jsx：insert jsx

## API

| Property | Description | Type | Default |

| label | content of select button | string/JSX | - |
| selected | when select's options is selected to show √ | boolean | - |
| icon | label/icon/jsx in the end | JSX.Element/string | - |
| tooltip | tooltip | string | - |
| children | Content or child nodes | any | - |
| className | classname | string | - |
| onClick | Set the handler to handle `click` event | (...arg: Array<any>) => void | - |
| needChange | change label of button | boolean | - |
| selectType | select type | input/color/double/jsx | - |
| border | show side border | boolean | - |
| showSelect | show select | (e) => void | - |
| hideSelect | hide select | (e) => void | - |

## Case

```jsx
import { Select } from '@univer/style-univer';

<Select
    tooltip={item.tooltip}
    tooltipRight={item.tooltipRight}
    key={item.name}
    children={item.children}
    label={item.label}
    icon={item.icon}
    needChange={item.needChange}
    selectType={item.selectType}
    border={item.border}
    slot={item.slot || {}}
    onClick={item.onClick?.bind(this, { item, index }, this.context)}
/>;
```
