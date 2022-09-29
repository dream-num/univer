---
category: Components
type: General
title: UL
cover: ''
---

## Introduce

Ul Component

Use with select component, also use alone

## API

| Property | Description | Type | Default |

| label | label of li | string/JSX | - |
| selected | when li is selected to show √ | boolean | - |
| icon | label/icon/jsx in the end | JSX.Element/string | - |
| tooltip | tooltip | string | - |
| children | Content or child nodes | any | - |
| className | classname | string | - |
| onClick | Set the handler to handle `click` event | (...arg: Array<any>) => void | - |
| style | css style | cssStyle | - |
| border | show top border | boolean | - |
| show | is show | boolean | - |
| showSelect | show ul | (e) => void | - |
| showParentSelect | show parent li(if li has children) | () => void | - |
| hideSelect | hide ul | (e) => void | - |

## Case

```jsx
import { Ul } from '@univer/style-universheet';

<Ul children={this.state.children} onClick={this.handleClick} ref={this.ref}></Ul>;
```
