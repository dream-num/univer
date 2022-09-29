---
category: Components
type: General
title: Demo
cover: 'Demo'
---

## Introduction

General demo components, a demo can contain any other components

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
import { Demo } from '@univer/style-universheet';

const ToolBar = () => {
    const containerText = 'demo';
    return (
        <Demo
            onClick={() => {
                this.handleClick();
            }}
        >
            {containerText}
        </Demo>
    );
};
```
