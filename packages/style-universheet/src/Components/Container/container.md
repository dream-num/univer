---
category: Components
type: General
title: Container
cover: 'Container'
---

## Introduction

General container components, a container can contain any other components

## API

The properties of the device are described as follows:

| Property  | Description                         | Type                        | Default Value |
| --------- | ----------------------------------- | --------------------------- | ------------- |
| onClick   | Callback when the button is clicked | `(e: MouseEvent) => void`   | -             |
| children  | Button content or child nodes       | `ComponentChildren`         | -             |
| className | Class name                          | `string`                    | -             |
| styles    | Custom css central style object     | `JSX.CSSProperties`         | -             |
| ref       | preact refs reference               | `RefObject<HTMLDivElement>` | -             |

## Case

```jsx
import { Container } from '@univer/style-universheet';

const ToolBar = () => {
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
