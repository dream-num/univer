# @univerjs/engine-formula

[![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula?style=flat-square)](https://npmjs.com/package/@univerjs/engine-formula)
[![license](https://img.shields.io/npm/l/@univerjs/engine-formula?style=flat-square)](https://npmjs.com/package/@univerjs/engine-formula)
[![downloads](https://img.shields.io/npm/dm/@univerjs/engine-formula?style=flat-square)](https://npmjs.com/package/@univerjs/engine-formula)

`@univerjs/engine-formula` is Univer's formula runtime. It parses formulas, registers functions and descriptions, manages dependencies, calculates results, and exposes shared formula editor helpers.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/engine-formula` | `UniverEngineFormula` | No | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/engine-formula
# or
npm install @univerjs/engine-formula
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';

univer.registerPlugin(UniverFormulaEnginePlugin);
```

### Worker usage

On the main thread, import `UniverFormulaEnginePlugin` from `@univerjs/engine-formula`. Set `notExecuteFormula: true` to delegate calculation to the worker.

In the worker entry, import `UniverFormulaEnginePlugin` from `@univerjs/engine-formula/worker`:

```ts
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula/worker';

univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: false });
```

## Integration Notes

- Load the locale resources from `@univerjs/engine-formula/locale/<language>` for each language enabled by your application.
- Import `@univerjs/engine-formula/facade` when using this package through Univer Facade APIs.
- Custom calculation engines must await `FormulaResultService` before emitting completion. Subclasses of `CalculateFormulaService` must pass this service to the base constructor.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/engine-formula)
- [GitHub repository](https://github.com/dream-num/univer)
