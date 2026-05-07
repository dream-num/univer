# @univerjs/rpc

[![npm version](https://img.shields.io/npm/v/@univerjs/rpc?style=flat-square)](https://npmjs.com/package/@univerjs/rpc)
[![license](https://img.shields.io/npm/l/@univerjs/rpc?style=flat-square)](https://npmjs.com/package/@univerjs/rpc)
[![downloads](https://img.shields.io/npm/dm/@univerjs/rpc?style=flat-square)](https://npmjs.com/package/@univerjs/rpc)

`@univerjs/rpc` provides a browser-friendly RPC layer for communicating between the main thread and workers or other message-based runtimes.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/rpc` | `UniverRpc` | No | No | No |

## Installation

```sh
pnpm add @univerjs/rpc
# or
npm install @univerjs/rpc
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';

univer.registerPlugin(UniverRPCMainThreadPlugin);
```

Exported plugin classes:

- `UniverRPCMainThreadPlugin`
- `UniverRPCWorkerThreadPlugin`

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/rpc)
- [GitHub repository](https://github.com/dream-num/univer)

