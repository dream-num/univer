# @univerjs/sheets-thread-comment-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-thread-comment-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment-ui)

`@univerjs/sheets-thread-comment-ui` adds thread comment UI integration for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-thread-comment-ui` | `UniverSheetsThreadCommentUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-thread-comment-ui @univerjs/thread-comment-ui
# or
npm install @univerjs/sheets-thread-comment-ui @univerjs/thread-comment-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import SheetsThreadCommentUIEnUS from '@univerjs/sheets-thread-comment-ui/locale/en-US';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import ThreadCommentUIEnUS from '@univerjs/thread-comment-ui/locale/en-US';
import '@univerjs/sheets-thread-comment-ui/lib/index.css';
import '@univerjs/thread-comment-ui/lib/index.css';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(SheetsThreadCommentUIEnUS, ThreadCommentUIEnUS),
    },
});

univer.registerPlugin(UniverThreadCommentUIPlugin);
univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-thread-comment-ui)
- [GitHub repository](https://github.com/dream-num/univer)
