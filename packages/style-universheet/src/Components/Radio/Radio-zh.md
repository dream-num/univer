---
category: Radio
type: 通用
title: Radio
subtitle: 单选
cover: ''
---

## 介绍

模态框

## RadioGroup API

`RadioGroup` 的属性说明如下：

| 属性      | 说明           | 类型                 | 默认值 |
| --------- | -------------- | -------------------- | ------ |
| active    | 默认选中       | `string` \| `number` | -      |
| vertical  | 是否垂直排列   | `boolean`            | false  |
| className | 单选组类名     | `string`             | -      |
| onChange  | 切换选项时触发 | `function`           | -      |

## 案例

```jsx
import { RadioGroup, Radio } from '@univer/style-universheet';

const Demo = () => {
    return (
        <RadioGroup>
            <Radio></Radio>
            <Radio></Radio>
        </RadioGroup>
    );
};
```

## Radio API

`Radio` 的属性说明如下：

| 属性      | 说明     | 类型                 | 默认值 |
| --------- | -------- | -------------------- | ------ |
| value     | 当前的值 | `string`             | -      |
| label     | 显示的值 | `string`             | -      |
| active    | 是否选中 | `string` \| `number` | -      |
| className | 单选类名 | `string`             | -      |

## 案例

```jsx
import { Radio } from '@univer/style-universheet';

const Demo = () => {
    return <Radio></Radio>;
};
```
