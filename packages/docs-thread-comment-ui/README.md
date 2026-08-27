# @univerjs/docs-thread-comment-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)

`@univerjs/docs-thread-comment-ui` adds thread comment UI integration for Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-thread-comment-ui` | `UniverDocsThreadCommentUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/docs-thread-comment @univerjs/docs-thread-comment-ui @univerjs/thread-comment-ui
# or
npm install @univerjs/docs-thread-comment @univerjs/docs-thread-comment-ui @univerjs/thread-comment-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import '@univerjs/docs-thread-comment/facade';
import { UniverDocsThreadCommentUIPlugin } from '@univerjs/docs-thread-comment-ui';
import DocsThreadCommentUIEnUS from '@univerjs/docs-thread-comment-ui/locale/en-US';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import ThreadCommentUIEnUS from '@univerjs/thread-comment-ui/locale/en-US';
import '@univerjs/docs-thread-comment-ui/lib/index.css';
import '@univerjs/thread-comment-ui/lib/index.css';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(DocsThreadCommentUIEnUS, ThreadCommentUIEnUS),
    },
});

univer.registerPlugin(UniverThreadCommentUIPlugin);
univer.registerPlugin(UniverDocsThreadCommentUIPlugin);

const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
await range?.createCommentAsync('Verify this introduction.', { id: 'review-intro' });
```

## Integration Notes

Register the shared thread-comment UI plugin before the Docs adapter. Use `@univerjs/docs-thread-comment` for headless model commands and Facade APIs; this UI package adds menus, rendering, and the shared side panel. The underlying `@univerjs/thread-comment` plugin is registered automatically as a dependency.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-thread-comment-ui)
- [GitHub repository](https://github.com/dream-num/univer)
