# @univerjs/thread-comment

[![npm version](https://img.shields.io/npm/v/@univerjs/thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment)
[![license](https://img.shields.io/npm/l/@univerjs/thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment)
[![downloads](https://img.shields.io/npm/dm/@univerjs/thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment)

`@univerjs/thread-comment` provides shared thread comment models, commands, and services that product-specific comment packages build on.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/thread-comment` | `UniverThreadComment` | No | No | No |

## Installation

```sh
pnpm add @univerjs/thread-comment
# or
npm install @univerjs/thread-comment
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';

univer.registerPlugin(UniverThreadCommentPlugin);
```

## Integration Notes

Product-specific packages such as `@univerjs/sheets-thread-comment` and `@univerjs/docs-thread-comment-ui` build on this shared layer.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/thread-comment)
- [GitHub repository](https://github.com/dream-num/univer)

