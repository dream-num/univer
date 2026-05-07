# @univerjs/uniscript

[![npm version](https://img.shields.io/npm/v/@univerjs/uniscript?style=flat-square)](https://npmjs.com/package/@univerjs/uniscript)
[![license](https://img.shields.io/npm/l/@univerjs/uniscript?style=flat-square)](https://npmjs.com/package/@univerjs/uniscript)
[![downloads](https://img.shields.io/npm/dm/@univerjs/uniscript?style=flat-square)](https://npmjs.com/package/@univerjs/uniscript)

`@univerjs/uniscript` provides a Monaco-based code editor for writing scripts that operate on Univer data structures through the Facade API.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/uniscript` | `UniverUniscript` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/uniscript
# or
npm install @univerjs/uniscript
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/uniscript/lib/index.css';
import EnUS from '@univerjs/uniscript/locale/en-US';
import { UniverUniscriptPlugin } from '@univerjs/uniscript';

univer.registerPlugin(UniverUniscriptPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Package Dependencies

Important Univer dependencies: `@univerjs/core`, `@univerjs/design`, `@univerjs/sheets`, `@univerjs/sheets-ui`, `@univerjs/ui`.
Peer dependencies: `react`, `rxjs`.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/uniscript)
- [GitHub repository](https://github.com/dream-num/univer)

