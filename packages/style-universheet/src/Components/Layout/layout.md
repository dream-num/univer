---
category: Components
type: General
title: Layout
cover: ''
---

## Introduction

The layout component provides a container for the structure of the overall interface. Often used with `Header`/`Content`/`Footer`/`Sider`/`Container`.

If the first child element of `Layout` contains a `Sider` component, the layout will automatically change to horizontal arrangement. This is an important work done by `Layout` different from other components.

Use flex layout internally, please pay attention to compatibility.

## API

| Property | Description                                                    | Type              | Default |
| -------- | -------------------------------------------------------------- | ----------------- | ------- |
| children | Button content or child nodes                                  | ComponentChildren | -       |
| styles   | Custom styles, it accepts all props which native style support | {}                | -       |

## Case

The overall layout of UniverSheet distinguishes the outer left column, outer right column, head, footer, inner left column, right left column, and middle content area. The simple expression is as follows

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
