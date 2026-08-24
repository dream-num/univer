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
pnpm add @univerjs/docs-thread-comment @univerjs/docs-thread-comment-ui
# or
npm install @univerjs/docs-thread-comment @univerjs/docs-thread-comment-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-thread-comment-ui/lib/index.css';
import '@univerjs/docs-thread-comment/facade';
import { UniverDocsThreadCommentUIPlugin } from '@univerjs/docs-thread-comment-ui';

univer.registerPlugin(UniverDocsThreadCommentUIPlugin);

const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
await range?.createCommentAsync('Verify this introduction.', { id: 'review-intro' });
```

## Integration Notes

Use `@univerjs/docs-thread-comment` for headless model commands and Facade APIs. This UI package adds menus, rendering, and the shared side panel.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
- [GitHub repository](https://github.com/dream-num/univer)

