# @univerjs/ui

[![npm version](https://img.shields.io/npm/v/@univerjs/ui?style=flat-square)](https://npmjs.com/package/@univerjs/ui)
[![license](https://img.shields.io/npm/l/@univerjs/ui?style=flat-square)](https://npmjs.com/package/@univerjs/ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/ui?style=flat-square)](https://npmjs.com/package/@univerjs/ui)

`@univerjs/ui` provides Univer's shared application UI framework, workbench services, menu infrastructure, dialogs, clipboard services, and Facade UI APIs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/ui` | `UniverUi` | Yes | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/ui
# or
npm install @univerjs/ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/ui/lib/index.css';
import EnUS from '@univerjs/ui/locale/en-US';
import { UniverUIPlugin } from '@univerjs/ui';

univer.registerPlugin(UniverUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverUIPlugin`
- `UniverMobileUIPlugin`

## Integration Notes

- Import `@univerjs/ui/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/ui)
- [GitHub repository](https://github.com/dream-num/univer)
