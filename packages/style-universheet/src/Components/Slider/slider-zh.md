---
category: Components
type: 通用
title: slider
subtitle: 滑块组件
cover: ''
---

## 介绍

滑块组件

-   用 css 写的滑块组件,IE 和火狐样式会错乱

## API

属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |

| min | 最小值 | number | 0 |
| max | 最大值 | number | 100 |
| step | 步长，取值必须大于 0，并且可被 (max - min) 整除 | number | 1 |
| className | 类名 | string | - |
| style | css style | cssStyle | - |
| value | 设置当前值 | number | - |
| onChange | 改变滑块值的回调 | (e: Event) => void | - |
| onClick | 点击滑块的回调 | (e: Event, value: number | string) => void | - |

## 案例

```jsx
import { Slider } from '@univer/style-universheet';

<Slider onChange={this.onChange} value={zoom} min={this.min} max={this.max} onClick={this.handleClick} />;
```
