---
category: Modal
type: 通用
title: Modal
subtitle: 模态框
cover: ''
---

## 介绍

模态框

## API

模态框的属性说明如下：

| 属性      | 说明                                 | 类型     | 默认值 |
| --------- | ------------------------------------ | -------- | ------ |
| title     | 模态框标题                           | string   | -      |
| width     | 模态框宽度                           | number   | 500px  |
| className | 模态框类名                           | string   | -      |
| isDrag    | 模态框是否可以拖动                   | boolean  | false  |
| visible   | 模态框是否可见                       | boolean  | false  |
| mask      | 模态框遮罩                           | boolean  | true   |
| footer    | 模态框是否显示底部                   | boolean  | false  |
| onCancel  | 点击遮罩层或右上角叉或取消按钮的回调 | function | -      |

## 案例

```jsx
import { Modal } from '@univerjs/style-univer';

const Demo = () => {
    return (
        <Modal visible={false} title="this is mode" width={500} className="className" isDrag={true} mask={false} footer={false} onCancel={() => {}}>
            {}
        </Modal>
    );
};
```
