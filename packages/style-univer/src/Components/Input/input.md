---
category: Components
type: General
title: Input
cover: ''
---

## Introduce

Input Component

## API

Property Introduction:

| Property | Description | Type | Default |

| disabled | Disabled state of input | boolean | false |
| onChange | Set the handler to handle `change` event | (event) => void | - |
| onFocus | Set the handler to handle `focue` event | (event) => void | - |
| onBlur | Set the handler to handle `blur` event | (event) => void | - |
| onClick | Set the handler to handle `click` event | (event) => void | - |
| className | input classname | string | - |
| id | input id | string | - |
| value | input value | string | - |
| type | type of input | 'text' | 'button' | 'checkbox' | 'file' | 'hidden' | 'image' | 'password' | 'radio' | 'rest' | 'submit' | - |
| placeholder | placeholder | string | - |
| border | set border of input | boolean | true |
| readonly | input is readonly | boolean | false |

## Case

```jsx
import { Input } from '@univer/style-univer';

<Input onChange={() => {}} type="text" placeholder="good" value="1"></Input>;
```
