---
category: Components
type: 通用
title: Checkbox
subtitle: 头像框
cover: ''
---

## Introduce

Avatar Component

## API

Property Introduction:

| Property | Description | Type | Default |

| alt | This attribute defines the alternative text describing the image | string | - |
| shape | shape of avatar | 'circle'\|'square' | - |
| size | avatar's size | number\|'large'\|'small'\|'default' | - |
| src | image source | string | - |
| style | css style | JSX.CSSProperties | - |
| fit | how to fit image | 'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down' | - |
| children | avatar content or child nodes | any | - |
| onError | Handler when img load error, return false to prevent default fallback behavior | (event) => void | - |
| onLoad | Handler when img loaded | (event) => void | - |
| title | title of image | string | - |

## 案例

```jsx
import { Avatar } from '@univer/style-univer';

<Avatar size="small" />;
```
