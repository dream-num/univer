---
category: Components
type: 通用
title: Container
subtitle: 容器
cover: ''
---

## 介绍

通用容器组件，一个容器内可以包含任何其他组件

## API

容器的属性说明如下：

| 属性      | 说明                  | 类型                        | 默认值 |
| --------- | --------------------- | --------------------------- | ------ |
| onClick   | 点击按钮时的回调      | `(e: MouseEvent) => void`   | -      |
| children  | 按钮内容或者子节点    | `ComponentChildren`         | -      |
| className | 类名                  | `string`                    | -      |
| styles    | 自定义 css 央样式对象 | `JSX.CSSProperties`         | -      |
| ref       | preact refs 引用      | `RefObject<HTMLDivElement>` | -      |

## 案例

```jsx
import { Container } from '@univerjs/style-univer';

const Toolbar = () => {
    const containerText = 'container';
    return (
        <Container
            onClick={() => {
                this.handleClick();
            }}
        >
            {containerText}
        </Container>
    );
};
```
