# @univerjs/thread-comment-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment-ui)
[![license](https://img.shields.io/npm/l/@univerjs/thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment-ui)

`@univerjs/thread-comment-ui` provides common thread comment UI components and services shared by Docs and Sheets integrations.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/thread-comment-ui` | `UniverThreadCommentUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/thread-comment-ui
# or
npm install @univerjs/thread-comment-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/thread-comment-ui/lib/index.css';
import EnUS from '@univerjs/thread-comment-ui/locale/en-US';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';

univer.registerPlugin(UniverThreadCommentUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

Product-specific packages such as `@univerjs/sheets-thread-comment-ui` and `@univerjs/docs-thread-comment-ui` build on this shared UI layer.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/thread-comment-ui)
- [GitHub repository](https://github.com/dream-num/univer)

