# @univerjs/rpc-node

[![npm version](https://img.shields.io/npm/v/@univerjs/rpc-node?style=flat-square)](https://npmjs.com/package/@univerjs/rpc-node)
[![license](https://img.shields.io/npm/l/@univerjs/rpc-node?style=flat-square)](https://npmjs.com/package/@univerjs/rpc-node)
[![downloads](https://img.shields.io/npm/dm/@univerjs/rpc-node?style=flat-square)](https://npmjs.com/package/@univerjs/rpc-node)

`@univerjs/rpc-node` provides the Node.js counterpart for Univer RPC scenarios, allowing main-thread and worker-side plugins to communicate outside the browser.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/rpc-node` | `UniverRpcNode` | No | No | No |

## Installation

```sh
pnpm add @univerjs/rpc-node
# or
npm install @univerjs/rpc-node
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverRPCNodeMainPlugin } from '@univerjs/rpc-node';

univer.registerPlugin(UniverRPCNodeMainPlugin);
```

Exported plugin classes:

- `UniverRPCNodeMainPlugin`
- `UniverRPCNodeWorkerPlugin`

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/rpc-node)
- [GitHub repository](https://github.com/dream-num/univer)

