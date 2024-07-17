# @univerjs/sheets-filter-ui

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/sheets-filter-ui` | `UniverSheetsFilterUi` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ⭕️ | ⭕️ |

## Introduction

`@univerjs/sheets-filter-ui` provides a user interface for filtering in sheets.

## Usage

You should use this plugin with the `@univerjs/sheets-filter` package.

```typescript
import '@univerjs/sheets-filter-ui/lib/index.css';

import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

univer.registerPlugin(UniverSheetsFilterPlugin);
univer.registerPlugin(UniverSheetsFilterUIPlugin);
```

### Installation

```shell
# Using npm
npm install @univerjs/sheets-filter-ui

# Using pnpm
pnpm add @univerjs/sheets-filter-ui
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-filter-ui?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-filter-ui
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-filter-ui?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-filter-ui?style=flat-square
