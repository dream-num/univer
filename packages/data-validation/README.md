# @univerjs/data-validation

[![npm version](https://img.shields.io/npm/v/@univerjs/data-validation?style=flat-square)](https://npmjs.com/package/@univerjs/data-validation)
[![license](https://img.shields.io/npm/l/@univerjs/data-validation?style=flat-square)](https://npmjs.com/package/@univerjs/data-validation)
[![downloads](https://img.shields.io/npm/dm/@univerjs/data-validation?style=flat-square)](https://npmjs.com/package/@univerjs/data-validation)

`@univerjs/data-validation` provides the shared data validation model and rule services used by sheet data validation features.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/data-validation` | `UniverDataValidation` | No | Yes | No | No |

## Installation

```sh
pnpm add @univerjs/data-validation
# or
npm install @univerjs/data-validation
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import DataValidationEnUS from '@univerjs/data-validation/locale/en-US';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(DataValidationEnUS),
    },
});

univer.registerPlugin(UniverDataValidationPlugin);
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/data-validation)
- [GitHub repository](https://github.com/dream-num/univer)
