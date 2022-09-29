---
category: SiderModal
type: 通用
title: SiderModal
subtitle: 右侧弹窗
cover: ''
---

## 介绍

模态框

## SiderModal API

`SiderModal` 的属性说明如下：

| 属性       | 说明         | 类型       | 默认值 |
| ---------- | ------------ | ---------- | ------ |
| title      | 默认选中     | `string`   | -      |
| closeSide  | 是否垂直排列 | `function` | -      |
| footer     | 单选组类名   | `jsx`      | -      |
| pluginName | plugin name  | `string`   | -      |

## 案例

```jsx
import { SiderModal } from '@univer/style-universheet';

const Demo = () => {
    return (
        <SiderModal title="this is demo">
            <>`container`</>
        </SiderModal>
    );
};
```
