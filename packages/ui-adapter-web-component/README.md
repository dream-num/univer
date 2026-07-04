# @univerjs/ui-adapter-web-component

[![npm version](https://img.shields.io/npm/v/@univerjs/ui-adapter-web-component?style=flat-square)](https://npmjs.com/package/@univerjs/ui-adapter-web-component)
[![license](https://img.shields.io/npm/l/@univerjs/ui-adapter-web-component?style=flat-square)](https://npmjs.com/package/@univerjs/ui-adapter-web-component)
[![downloads](https://img.shields.io/npm/dm/@univerjs/ui-adapter-web-component?style=flat-square)](https://npmjs.com/package/@univerjs/ui-adapter-web-component)

`@univerjs/ui-adapter-web-component` adapts Univer UI services for Web Component integrations.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/ui-adapter-web-component` | `UniverUiAdapterWebComponent` | No | No | No |

## Installation

```sh
pnpm add @univerjs/ui-adapter-web-component
# or
npm install @univerjs/ui-adapter-web-component
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverWebComponentAdapterPlugin } from '@univerjs/ui-adapter-web-component';

univer.registerPlugin(UniverWebComponentAdapterPlugin);
```

Register custom elements with the `web-component` framework option. Runtime props are assigned to the created element as DOM properties, which supports object values such as `data` and `extraProps`.

```ts
class MyPopup extends HTMLElement {
    set data(value) {
        this.textContent = value?.label ?? '';
    }
}

univerAPI.registerComponent('my-popup', MyPopup, { framework: 'web-component' });
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/ui-adapter-web-component)
- [GitHub repository](https://github.com/dream-num/univer)
