# @univerjs/drawing-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/drawing-ui)
[![license](https://img.shields.io/npm/l/@univerjs/drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/drawing-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/drawing-ui)

`@univerjs/drawing-ui` provides common drawing UI services and components that document- or sheet-specific drawing packages build on.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/drawing-ui` | `UniverDrawingUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/drawing-ui
# or
npm install @univerjs/drawing-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/drawing-ui/lib/index.css';
import EnUS from '@univerjs/drawing-ui/locale/en-US';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';

univer.registerPlugin(UniverDrawingUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## OLE online conversion

For collaborative Sheets, Docs and Slides, the host can enable explicit OLE conversion through `ole.convertToOnline` and `ole.getLink`. Conversion keeps stage progress on the source page. The host's normal drawing mutation commands save only `{ unitId, type }` on the original drawing. After that reference is saved, a persistent completion notification offers an Open action. A new tab opens only when the user clicks Open, either in that notification or in the drawing toolbar. The original attachment is retained.

`ole.getLink(unitId, type)` synchronously resolves a relative or absolute HTTP(S) URL on every Open action, including the completion notification. It is not called during conversion. There is no default application route; without this callback, online actions stay hidden while preview and download remain available. Legacy stored `url` fields are ignored, so changing the configured domain or route does not require rewriting existing online references.

Keep the source page open until reference saving completes. Closing the host stops local polling and progress UI; it does not delete an online Unit already created by the server. Applications own durable task recovery. A failed reference save can be retried in the same session without converting the attachment again.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/drawing-ui)
- [GitHub repository](https://github.com/dream-num/univer)
