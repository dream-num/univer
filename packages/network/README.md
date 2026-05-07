# @univerjs/network

[![npm version](https://img.shields.io/npm/v/@univerjs/network?style=flat-square)](https://npmjs.com/package/@univerjs/network)
[![license](https://img.shields.io/npm/l/@univerjs/network?style=flat-square)](https://npmjs.com/package/@univerjs/network)
[![downloads](https://img.shields.io/npm/dm/@univerjs/network?style=flat-square)](https://npmjs.com/package/@univerjs/network)

`@univerjs/network` provides basic network service abstractions for Univer runtimes, especially collaboration-oriented integrations.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/network` | `UniverNetwork` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/network
# or
npm install @univerjs/network
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverNetworkPlugin } from '@univerjs/network';

univer.registerPlugin(UniverNetworkPlugin);
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/network)
- [GitHub repository](https://github.com/dream-num/univer)

