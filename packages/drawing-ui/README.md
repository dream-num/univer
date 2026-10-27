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

For collaborative Sheets, Docs and Slides, configure `ole.getLink` on `UniverDrawingPlugin`. The existing Pro `UniverExchangeClientPlugin` installs `ole.convertOffice`, `ole.convertToOnline` and the exact-Unit collaboration check; it preserves application-provided callbacks. Conversion keeps stage progress on the source page. The host's normal drawing mutation commands save only `{ unitId, type }` on the original drawing. After that reference is saved, a persistent completion notification offers an Open action. A new tab opens only when the user clicks Open, either in that notification or in the drawing toolbar. The original attachment is retained.

`ole.getLink(unitId, type)` synchronously resolves a relative or absolute HTTP(S) URL on every Open action, including the completion notification. It is not called during conversion. There is no default application route. Without this callback, online actions stay hidden; preview and download follow their own capabilities. Legacy stored `url` fields are ignored, so changing the configured domain or route does not require rewriting existing online references.

Common Drawing UI owns the toolbar, preview dialog and temporary viewer lifecycle. The existing `@univerjs/sheets-drawing-ui`, `@univerjs/docs-drawing-ui` and `@univerjs-pro/slides-ui` modules supply their own read-only renderers. Cross-type preview requires the target product UI module, styles and locale resources to be loaded: a Sheet-only application must also load the Doc UI module to preview Word attachments. Module loading registers a stateless renderer without creating a target Unit or requiring another OLE plugin registration. If no renderer or application override is available, Preview is disabled with a localized explanation before reading or converting the attachment; Download remains available. Applications may override `ole.previewOffice` or `ole.createOfficePreview`. See the [integration guide](../drawing/docs/ole-attachments.md).

Keep the source page open until reference saving completes. Closing the host stops local polling and progress UI; it does not delete an online Unit already created by the server. Applications own durable task recovery. A failed reference save can be retried in the same session without converting the attachment again.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/drawing-ui)
- [GitHub repository](https://github.com/dream-num/univer)
