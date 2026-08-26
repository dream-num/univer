# @univerjs/docs-thread-comment

`@univerjs/docs-thread-comment` provides model commands and Facade APIs for comments anchored to fixed document text ranges. It has no UI or rendering dependency and can be used in Node environments.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-thread-comment` | `UniverDocsThreadComment` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/docs-thread-comment
# or
npm install @univerjs/docs-thread-comment
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverDocsThreadCommentPlugin } from '@univerjs/docs-thread-comment';
import '@univerjs/docs-thread-comment/facade';

univer.registerPlugin(UniverDocsThreadCommentPlugin);

const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
await range?.createCommentAsync('Verify this introduction.', { id: 'review-intro' });
```

Use `@univerjs/docs-thread-comment-ui` separately when menus, canvas decorations, or the shared side panel are required.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-thread-comment)
- [GitHub repository](https://github.com/dream-num/univer)
