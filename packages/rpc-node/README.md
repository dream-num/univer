# @univerjs/rpc-node

[![npm version](https://img.shields.io/npm/v/@univerjs/rpc-node?style=flat-square)](https://npmjs.com/package/@univerjs/rpc-node)
[![license](https://img.shields.io/npm/l/@univerjs/rpc-node?style=flat-square)](https://npmjs.com/package/@univerjs/rpc-node)
[![downloads](https://img.shields.io/npm/dm/@univerjs/rpc-node?style=flat-square)](https://npmjs.com/package/@univerjs/rpc-node)

`@univerjs/rpc-node` provides the Node.js counterpart for Univer RPC scenarios, allowing main-thread and worker-side plugins to communicate outside the browser.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/rpc-node` | `UniverRpcNode` | No | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/rpc-node
# or
npm install @univerjs/rpc-node
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { fileURLToPath } from 'node:url';
import { UniverRPCNodeMainPlugin } from '@univerjs/rpc-node';

const workerSrc = fileURLToPath(new URL('./worker.js', import.meta.url));
univer.registerPlugin(UniverRPCNodeMainPlugin, { workerSrc });
```

Main-thread plugin classes:

- `UniverRPCNodeMainPlugin`

### Worker usage

On the main thread, import `UniverRPCNodeMainPlugin` from `@univerjs/rpc-node`. Set `workerSrc` to the worker module path.

In the worker entry, import `UniverRPCNodeWorkerPlugin` from `@univerjs/rpc-node/worker`:

```ts
import { UniverRPCNodeWorkerPlugin } from '@univerjs/rpc-node/worker';

univer.registerPlugin(UniverRPCNodeWorkerPlugin);
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/rpc-node)
- [GitHub repository](https://github.com/dream-num/univer)
