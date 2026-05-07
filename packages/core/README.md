# @univerjs/core

[![npm version](https://img.shields.io/npm/v/@univerjs/core?style=flat-square)](https://npmjs.com/package/@univerjs/core)
[![license](https://img.shields.io/npm/l/@univerjs/core?style=flat-square)](https://npmjs.com/package/@univerjs/core)
[![downloads](https://img.shields.io/npm/dm/@univerjs/core?style=flat-square)](https://npmjs.com/package/@univerjs/core)

`@univerjs/core` is the foundation of Univer. It provides the Univer runtime, dependency injection, command and mutation services, data models, configuration, localization, and the shared Facade entry point used by higher-level packages.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/core` | `UniverCore` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/core
# or
npm install @univerjs/core
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { LocaleType, Univer } from '@univerjs/core';

const univer = new Univer({
    locale: LocaleType.EN_US,
});
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/core)
- [GitHub repository](https://github.com/dream-num/univer)

