# @univerjs/sheets-note-ui

| Package | Description | Version | License | Downloads | Continuous Integration | Coverage |
|---------|-------------|---------|----------|-----------|----------------------|----------|
| `@univerjs/sheets-note-ui` | `UniverSheetsNote` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ⭕️ | ⭕️ |

## Introduction

`@univerjs/sheets-note-ui` provides the note/annotation function of Univer Sheets.

## Usage

### Installation

```shell
npm install @univerjs/sheets-note-ui
```

or

```shell
pnpm add @univerjs/sheets-note-ui
```

### Example

```ts
import { UniverSheetsNotePlugin, INoteMentionDataService} from '@univerjs/sheets-note-ui';

// Register the plugin
univer.registerPlugin(UniverSheetsNotePlugin);
```

[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-note-ui?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-note-ui
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-note-ui?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-note-ui?style=flat-square
