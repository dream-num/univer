# @univerjs/thread-comment

[![npm version](https://img.shields.io/npm/v/@univerjs/thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment)
[![license](https://img.shields.io/npm/l/@univerjs/thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment)
[![downloads](https://img.shields.io/npm/dm/@univerjs/thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/thread-comment)

`@univerjs/thread-comment` provides shared thread comment models, commands, and services that product-specific comment packages build on.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/thread-comment` | `UniverThreadComment` | No | No | Yes |

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
import '@univerjs/thread-comment/facade';

univer.registerPlugin(UniverThreadCommentPlugin);

const openComments = univerAPI.getComments({
  authorIds: ['review-agent'],
  anchorKinds: [univerAPI.Enum.ThreadCommentAnchorKind.SLIDE_ELEMENT],
  resolved: false,
});
```

All commentable targets use stable IDs and a shared query vocabulary:

| Product target | Product Facade | `ThreadCommentAnchorKind` |
| --- | --- | --- |
| Sheet cell | `FRange.addCommentAsync()` | `SHEET_CELL` |
| Sheet image, chart, or Shape | element `createCommentAsync()` | `SHEET_DRAWING` |
| Document text range | `FDocumentTextRange.createCommentAsync()` | `DOC_TEXT_RANGE` |
| Document image, chart, or Shape | element `createCommentAsync()` | `DOC_DRAWING` |
| Slide Shape, text, image, chart, table, or group | `FPageElement.createCommentAsync()` or `FSlide.createElementCommentAsync()` | `SLIDE_ELEMENT` |
| Slide free position | `FSlide.createPositionCommentAsync()` | `SLIDE_POSITION` |
| Board Shape, text, image, chart, table, connector, mind map, or ink | `FBoard.createElementCommentAsync()` | `BOARD_ELEMENT` |
| Board free position | `FBoard.createPositionCommentAsync()` | `BOARD_POSITION` |
| Base record in Grid, Kanban, Gallery, Calendar, or Gantt | `FBaseTableRecord.createCommentAsync()` | `BASE_RECORD` |

Product Facades create and locate anchored threads. Use the shared Facade for thread lifecycle operations:

```ts
const record = univerAPI.getActiveBase()?.getTables()[0]?.getRecords()[0];
const [thread] = record ? await record.listCommentsAsync() : [];
if (thread) {
  await univerAPI.replyCommentAsync({
    unitId: thread.unitId,
    subUnitId: thread.subUnitId,
    threadId: thread.threadId,
    content: 'Verified.',
    id: 'review-record-1-reply',
  });
  await univerAPI.resolveCommentAsync({
    unitId: thread.unitId,
    subUnitId: thread.subUnitId,
    commentId: thread.root.id,
  });
}
```

`personId` defaults to the current identity in `UserManagerService`. Agent and human identities intentionally share that user-management boundary.

## Integration Notes

Product-specific packages such as `@univerjs/sheets-thread-comment` and `@univerjs/docs-thread-comment-ui` build on this shared layer.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/thread-comment)
- [GitHub repository](https://github.com/dream-num/univer)

