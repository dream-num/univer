---
category: Components
type: 通用
title: Layout
subtitle: 布局
cover: ''
---

## 介绍

布局组件，提供一个容器，用于整体界面的结构。常常和`Header`/`Content`/`Footer`/`Sider`/`Container`一起使用。

如果`Layout`第一个子元素包含`Sider`组件，则布局会自动改为横向排列。这是`Layout`区别于其他组件做的一个重要工作。

内部采用 flex 布局，请注意兼容性。

## API

| 属性     | 说明                                  | 类型              | 默认值 |
| -------- | ------------------------------------- | ----------------- | ------ |
| children | 按钮内容或者子节点                    | ComponentChildren | -      |
| style    | 自定义样式，支持原生 style 的所有属性 | {}                | -      |

## 案例

UniverSheet 的整体布局，区分了外左边栏、外右边栏、头部、尾部、内左边栏、右左边栏、中间内容区，简单的表示如下

```jsx
import { Container, Layout, Header, Footer, Content, Sider } from '@univer/style-universheet';

const MainPage = () => {
    return (
        <Container>
            <Layout>
                <Sider>outLeft</Sider>
                <Layout>
                    <Header>Header</Header>
                    <Layout>
                        <Sider>innerLeft</Sider>
                        <Content>Content</Content>
                        <Sider>innerRight</Sider>
                    </Layout>
                    <Footer>Footer</Footer>
                </Layout>
                <Sider>outRight</Sider>
            </Layout>
        </Container>
    );
};
```
