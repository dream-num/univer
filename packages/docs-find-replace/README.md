# @univerjs/docs-find-replace

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/docs-find-replace)
[![license](https://img.shields.io/npm/l/@univerjs/docs-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/docs-find-replace)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/docs-find-replace)

`@univerjs/docs-find-replace` integrates the shared find-and-replace UI with Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-find-replace` | `UniverDocsFindReplace` | No | No | No |

## Installation

```sh
pnpm add @univerjs/docs-find-replace @univerjs/find-replace
# or
npm install @univerjs/docs-find-replace @univerjs/find-replace
```

## Usage

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverDocsFindReplacePlugin } from '@univerjs/docs-find-replace';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import FindReplaceEnUS from '@univerjs/find-replace/locale/en-US';
import '@univerjs/find-replace/lib/index.css';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(FindReplaceEnUS),
    },
});

univer.registerPlugin(UniverFindReplacePlugin);
univer.registerPlugin(UniverDocsFindReplacePlugin);
```

## Integration Notes

Register the shared find-and-replace plugin before the Docs adapter so it can provide the common UI, locale strings, and services. Configure the rest of the Docs plugin stack before adding these two plugins.

Phase one searches and replaces literal text in the current document body, including tables. It excludes headers, footers, comments, drawings, regular expressions, formatting search, special characters, result sidebars, presets, and Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-find-replace)
- [GitHub repository](https://github.com/dream-num/univer)
