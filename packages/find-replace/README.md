# @univerjs/find-replace

[![npm version](https://img.shields.io/npm/v/@univerjs/find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/find-replace)
[![license](https://img.shields.io/npm/l/@univerjs/find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/find-replace)
[![downloads](https://img.shields.io/npm/dm/@univerjs/find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/find-replace)

`@univerjs/find-replace` provides shared find and replace services and UI infrastructure that product-specific packages can extend.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/find-replace` | `UniverFindReplace` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/find-replace
# or
npm install @univerjs/find-replace
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/find-replace/lib/index.css';
import EnUS from '@univerjs/find-replace/locale/en-US';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';

univer.registerPlugin(UniverFindReplacePlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/find-replace)
- [GitHub repository](https://github.com/dream-num/univer)

