# @univerjs/preset-sheets-filter

[![npm version](https://img.shields.io/npm/v/@univerjs/preset-sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/preset-sheets-filter)
[![license](https://img.shields.io/npm/l/@univerjs/preset-sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/preset-sheets-filter)
[![downloads](https://img.shields.io/npm/dm/@univerjs/preset-sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/preset-sheets-filter)

`@univerjs/preset-sheets-filter` provides a preset for filter functionality in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/preset-sheets-filter` | — | Yes | Yes | No | Yes |

## Installation

```sh
pnpm add @univerjs/preset-sheets-filter
# or
npm install @univerjs/preset-sheets-filter
```

## Usage

```ts
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';

// Use with createUniver:
// createUniver({ presets: [UniverSheetsFilterPreset()] });
```

### Worker usage

On the main thread, import `UniverSheetsFilterPreset` from `@univerjs/preset-sheets-filter`. Configure `workerURL` on `UniverSheetsCorePreset`.

In the worker entry, import `UniverSheetsFilterWorkerPreset` from `@univerjs/preset-sheets-filter/worker`:

```ts
import { UniverSheetsCoreWorkerPreset } from '@univerjs/preset-sheets-core/worker';
import { UniverSheetsFilterWorkerPreset } from '@univerjs/preset-sheets-filter/worker';
import { createUniver } from '@univerjs/presets';

createUniver({ presets: [UniverSheetsCoreWorkerPreset(), UniverSheetsFilterWorkerPreset()] });
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/preset-sheets-filter)
- [GitHub repository](https://github.com/dream-num/univer)
