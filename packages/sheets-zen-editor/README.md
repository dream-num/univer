# @univerjs/sheets-zen-editor

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-zen-editor)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-zen-editor?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-zen-editor)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-zen-editor?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-zen-editor)

`@univerjs/sheets-zen-editor` adds the zen editor experience for immersive cell editing in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-zen-editor` | `UniverSheetsZenEditor` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-zen-editor
# or
npm install @univerjs/sheets-zen-editor
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-zen-editor/lib/index.css';
import EnUS from '@univerjs/sheets-zen-editor/locale/en-US';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';

univer.registerPlugin(UniverSheetsZenEditorPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Package Dependencies

Important Univer dependencies: `@univerjs/core`, `@univerjs/design`, `@univerjs/docs`, `@univerjs/docs-ui`, `@univerjs/engine-render`, `@univerjs/icons`, `@univerjs/sheets`, `@univerjs/sheets-ui`, `@univerjs/ui`.
Peer dependencies: `react`, `rxjs`.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-zen-editor)
- [GitHub repository](https://github.com/dream-num/univer)

