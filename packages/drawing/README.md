# @univerjs/drawing

[![npm version](https://img.shields.io/npm/v/@univerjs/drawing?style=flat-square)](https://npmjs.com/package/@univerjs/drawing)
[![license](https://img.shields.io/npm/l/@univerjs/drawing?style=flat-square)](https://npmjs.com/package/@univerjs/drawing)
[![downloads](https://img.shields.io/npm/dm/@univerjs/drawing?style=flat-square)](https://npmjs.com/package/@univerjs/drawing)

`@univerjs/drawing` provides the shared drawing data model, services, and commands used by Docs, Sheets, and other drawing-enabled surfaces.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/drawing` | `UniverDrawing` | No | No | No |

## Installation

```sh
pnpm add @univerjs/drawing
# or
npm install @univerjs/drawing
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverDrawingPlugin } from '@univerjs/drawing';

univer.registerPlugin(UniverDrawingPlugin);
```

## OLE online references

An OLE drawing retains its `oleAttachmentId`, which identifies the original attachment's resource record. After explicit online conversion, `oleOnlineUnit` stores only the new Unit's `unitId` and `type`; it does not store a URL or embed the converted Unit's snapshot.

Configure `ole.getLink(unitId, type)` on `UniverDrawingPlugin` to resolve the application's current URL on each explicit Open action. There is no default application route. The existing Pro `UniverExchangeClientPlugin` supplies conversion callbacks without adding a separate OLE plugin or owning navigation. Legacy stored `url` fields remain unchanged and are ignored when opening. See the [OLE integration guide](./docs/ole-attachments.md) for configuration and transport boundaries.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/drawing)
- [GitHub repository](https://github.com/dream-num/univer)
