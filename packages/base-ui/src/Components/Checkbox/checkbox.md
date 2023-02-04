---
category: Components
type: General
title: Checkbox CheckboxGroup
cover: ''
---

## Introduction

Checkbox Component

Checkbox Type

-   checked
-   disabled

## API

Property Introduction:

| Property | Description | Type | Default |

| disabled | Disabled state of checkbox | boolean | false |
| onChange | Set the handler to handle `change` event | (event) => void | - |
| children | Button content or child nodes | any | - |
| className | Classname of parent | string | - |
| value | Checkbox value | string | - |

## Introduction

Checkbox Group

## API

Property Introduction:

| Property | Description | Type | Default |

type options = {
checked?: boolean;
disabled?: boolean;
name?: string;
label?: string | JSX.Element;
value?: string;
};

| disabled | Disabled state of checkbox | boolean | false |
| onChange | Set the handler to handle `change` event | (event) => void | - |
| options | Component Content(type: options) | Array<options> | - |

## Case

```jsx
import { Checkbox, CheckboxGroup } from '@univerjs/style-univer';

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
