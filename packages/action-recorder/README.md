# @univerjs/action-recorder

[![npm version](https://img.shields.io/npm/v/@univerjs/action-recorder?style=flat-square)](https://npmjs.com/package/@univerjs/action-recorder)
[![license](https://img.shields.io/npm/l/@univerjs/action-recorder?style=flat-square)](https://npmjs.com/package/@univerjs/action-recorder)
[![downloads](https://img.shields.io/npm/dm/@univerjs/action-recorder?style=flat-square)](https://npmjs.com/package/@univerjs/action-recorder)

`@univerjs/action-recorder` records user actions in Univer and can replay them for debugging, demos, or automated workflow reproduction.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/action-recorder` | `UniverActionRecorder` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/action-recorder
# or
npm install @univerjs/action-recorder
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/action-recorder/lib/index.css';
import EnUS from '@univerjs/action-recorder/locale/en-US';
import { UniverActionRecorderPlugin } from '@univerjs/action-recorder';

univer.registerPlugin(UniverActionRecorderPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/action-recorder)
- [GitHub repository](https://github.com/dream-num/univer)

