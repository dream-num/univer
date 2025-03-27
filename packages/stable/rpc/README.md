# @univerjs/rpc

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/rpc` | `UniverRpc` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ❌ | ❌ |

## Introduction

When handling some time-intensive tasks, such as formula computation, Univer can offload them to a location outside of the main thread, such as a Web Worker thread. The `@univerjs/rpc` library provides an RPC mechanism that simplifies communication between the main thread and other threads.

For more information, see the [Architecture of Web Worker](https://univer.ai/guides/sheet/architecture/web-worker).

## Usage

### Installation

```shell
# Using npm
npm install @univerjs/rpc

# Using pnpm
pnpm add @univerjs/rpc
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/rpc?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/rpc
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/rpc?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/rpc?style=flat-square
