---
category: Components
type: 通用
title: Checkbox
subtitle: 头像框
cover: ''
---

## 介绍

头像框组件

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| alt | 图像无法显示时的替代文本 | string | - |
| shape | 头像形状 | 'circle'\|'square' | - |
| size | 头像尺寸 | number\|'large'\|'small'\|'default' | - |
| src | 图片来源 | string | - |
| style | 组件样式 | JSX.CSSProperties | - |
| fit | 图片包含方式 | 'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down' | - |
| children | 子内容 | any | - |
| onError | 图片加载失败回调 | (event) => void | - |
| onLoad | 图片加载后回调 | (event) => void | - |
| title | 图片 title | string | - |

## 案例

```jsx
import { Avatar } from '@univer/style-universheet';

<Avatar size="small" />;
```
