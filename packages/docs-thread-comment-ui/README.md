# @univerjs/docs-thread-comment-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)

`@univerjs/docs-thread-comment-ui` adds thread comment UI integration for Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-thread-comment-ui` | `UniverDocsThreadCommentUi` | Yes | No | No |

## Installation

```sh
pnpm add @univerjs/docs-thread-comment-ui
# or
npm install @univerjs/docs-thread-comment-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-thread-comment-ui/lib/index.css';
import { UniverDocsThreadCommentUIPlugin } from '@univerjs/docs-thread-comment-ui';

univer.registerPlugin(UniverDocsThreadCommentUIPlugin);
```

## Integration Notes

Use this package with `@univerjs/thread-comment` and `@univerjs/thread-comment-ui` for shared comment behavior.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
- [GitHub repository](https://github.com/dream-num/univer)

