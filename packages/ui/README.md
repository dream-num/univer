# @univerjs/ui

[![npm version](https://img.shields.io/npm/v/@univerjs/ui?style=flat-square)](https://npmjs.com/package/@univerjs/ui)
[![license](https://img.shields.io/npm/l/@univerjs/ui?style=flat-square)](https://npmjs.com/package/@univerjs/ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/ui?style=flat-square)](https://npmjs.com/package/@univerjs/ui)

`@univerjs/ui` provides Univer's shared application UI framework, workbench services, menu infrastructure, dialogs, clipboard services, and Facade UI APIs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/ui` | `UniverUi` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/ui
# or
npm install @univerjs/ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/ui/lib/index.css';
import EnUS from '@univerjs/ui/locale/en-US';
import { UniverUIPlugin } from '@univerjs/ui';

univer.registerPlugin(UniverUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverUIPlugin`
- `UniverMobileUIPlugin`

## Format painter

The desktop Start ribbon has one format painter entry. A single click captures a detached
format snapshot for one application; a double click keeps it active until Escape or another
click on the entry. Unsupported targets do not consume the snapshot. The canvas displays a
brush cursor on supported targets and an unavailable cursor elsewhere.

`FormatPainterSessionService` coordinates the local session. Host adapters claim the active
editing context and apply formatting through their domain commands. A higher-priority shape
selection prevents a stale cell selection from becoming the source. Changing the focused
Unit or disposing the source Unit cancels the session. The session itself is not persisted.

The icon-only clear-formatting button below the format painter resets the active domain's
formatting without removing content. Clearing cancels an active brush; each domain applies
the change through its undoable commands.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/ui)
- [GitHub repository](https://github.com/dream-num/univer)
