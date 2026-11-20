# @univerjs/docs

[![npm version](https://img.shields.io/npm/v/@univerjs/docs?style=flat-square)](https://npmjs.com/package/@univerjs/docs)
[![license](https://img.shields.io/npm/l/@univerjs/docs?style=flat-square)](https://npmjs.com/package/@univerjs/docs)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs?style=flat-square)](https://npmjs.com/package/@univerjs/docs)

`@univerjs/docs` provides the document data model and core rich-text operations for Univer Docs, independent of the UI layer.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/docs` | `UniverDocs` | No | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/docs
# or
npm install @univerjs/docs
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverDocsPlugin } from '@univerjs/docs';

univer.registerPlugin(UniverDocsPlugin);
```

### Worker usage

On the main thread, import `UniverDocsLayoutWorkerPlugin` from `@univerjs/docs`. Register it alongside `UniverDocsPlugin` and set `workerFactory` to a function that creates the layout worker.

In the worker entry, import `UniverDocsWorkerPlugin` from `@univerjs/docs/worker`:

```ts
import { UniverDocsWorkerPlugin } from '@univerjs/docs/worker';

univer.registerPlugin(UniverDocsWorkerPlugin);
```

## Integration Notes

- Import `@univerjs/docs/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs)
- [GitHub repository](https://github.com/dream-num/univer)
