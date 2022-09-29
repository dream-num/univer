---
category: Components
type: 通用
title: slider
subtitle: 滑块组件
cover: ''
---

## Introduce

Slider Component

-   Slider components written in CSS. It will be distorted when IE and Firefox

## API

Property Introduction:

| Property | Description | Type | Default |

| min | The maximum value the slider can slide to | number | 0 |
| max | The minimum value the slider can slide to | number | 100 |
| step | The granularity the slider can step through values. Must greater than 0, and be divided by (max - min) | number | 1 |
| className | classname | string | - |
| style | css style | cssStyle | - |
| value | The value of slider | number | - |
| onChange | Callback function that is fired when the user changes the slider's value | (e: Event) => void | - |
| onClick | Callback function that is fired when the user click the slider | (e: Event, value: number | string) => void | - |

## Case

```jsx
import { Slider } from '@univer/style-universheet';

<Slider onChange={this.onChange} value={zoom} min={this.min} max={this.max} onClick={this.handleClick} />;
```
