# @univerjs/engine-formula

[![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula?style=flat-square)](https://npmjs.com/package/@univerjs/engine-formula)
[![license](https://img.shields.io/npm/l/@univerjs/engine-formula?style=flat-square)](https://npmjs.com/package/@univerjs/engine-formula)
[![downloads](https://img.shields.io/npm/dm/@univerjs/engine-formula?style=flat-square)](https://npmjs.com/package/@univerjs/engine-formula)

`@univerjs/engine-formula` is Univer's formula runtime. It parses formulas, registers functions and descriptions, manages dependencies, calculates results, and exposes shared formula editor helpers.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/engine-formula` | `UniverEngineFormula` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/engine-formula
# or
npm install @univerjs/engine-formula
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';

univer.registerPlugin(UniverFormulaEnginePlugin);
```

## Formula cache ownership

The formula plugin registers one `FormulaCacheService` per Univer injector. Parsed ASTs and expanded lexer trees belong to that instance. Range arrays and comparison indexes belong to a calculation context that is released on completion, failure, reset, or disposal. Closing a workbook invalidates only that workbook's entries. Disposing one Univer does not clear another instance's caches.

Custom DI test beds that assemble the formula engine must register `FormulaCacheService` alongside the existing services. Standalone `LexerTreeBuilder` calls remain supported without an owner and parse without the expanded-tree cache. Custom runtime implementations may omit the optional calculation-cache hooks; references then compute without caching.

`FORMULA_REF_TO_ARRAY_CACHE` and `CELL_INVERTED_INDEX_CACHE` remain exported for compatibility but are deprecated and no longer control engine calculations. Integrations that used these globals to invalidate the engine must use the owning runtime's `clearArrayObjectCache()` and `clearInvertedIndexCache()` hooks instead. Facade usage, workbook IDs, snapshots, and collaboration changesets are unchanged.

## Formula reference compatibility

Reference-form `INDEX` returns `#VALUE!` when its areas span different worksheets or workbooks. References that resolve to the same worksheet remain valid.

Use whole-span quoting for quoted 3D ranges, such as `'Jan:Mar'!B2:C3`. Separately quoted endpoints, such as `'Jan':'Mar'!B2:C3`, return `#NAME?`. Adjust formulas that depend on these invalid forms or their previous incorrect results. Workbook/Worksheet models, persisted snapshots, and mutation formats require no migration.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/engine-formula)
- [GitHub repository](https://github.com/dream-num/univer)
