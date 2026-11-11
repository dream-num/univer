# @univerjs/presets

[![npm version](https://img.shields.io/npm/v/@univerjs/presets?style=flat-square)](https://npmjs.com/package/@univerjs/presets)
[![license](https://img.shields.io/npm/l/@univerjs/presets?style=flat-square)](https://npmjs.com/package/@univerjs/presets)
[![downloads](https://img.shields.io/npm/dm/@univerjs/presets?style=flat-square)](https://npmjs.com/package/@univerjs/presets)

`@univerjs/presets` provides `createUniver` to compose plugin presets and return a Univer instance with its Facade API.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/presets` | — | No | No | No | No |

## Installation

```sh
pnpm add @univerjs/presets
# or
npm install @univerjs/presets
```

## Usage

Install `@univerjs/preset-sheets-core` for this example and provide an HTML element with the ID `app`.

```ts
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import SheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import { createUniver, LocaleType } from '@univerjs/presets';
import '@univerjs/preset-sheets-core/lib/index.css';

const { univerAPI } = createUniver({
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: SheetsCoreEnUS },
    presets: [UniverSheetsCorePreset({ container: 'app' })],
});

univerAPI.createWorkbook({ name: 'Workbook' });
```

## Integration Notes

- Install the presets needed by your document type and merge their locale resources for each enabled language.
- Import styles from the selected presets. This composition package has no stylesheet or independent Facade/Worker subpath.
- Register each plugin through either a preset or the `plugins` option; do not register the same plugin through both.

## Resources

- [Documentation](https://docs.univer.ai/guides/sheets/getting-started/installation)
- [NPM package](https://npmjs.com/package/@univerjs/presets)
- [GitHub repository](https://github.com/dream-num/univer)
