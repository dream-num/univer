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

## Calculation input and result ownership

Formula capture, load, and execution capabilities are experimental package integration APIs, rather than application or Facade APIs. Keep their declarations available to cooperating engines and validate the exact OSS, Pro, and engine versions together under the [API stability policy](../../docs/API_STABILITY.md).

`IFormulaDataSnapshot` captures ephemeral calculation input, not a persisted Workbook snapshot or a replacement for `IWorkbookData`. It preserves formula values even when the Workbook is edited later. `materialize()` returns an owned, mutable formula DTO and caches it for later reads. `FormulaCurrentConfigService` can defer materialization until `getFormulaData()`; another load, formula-data registration, or disposal replaces that deferred state.

Capture requires an engine to explicitly advertise `supportsFormulaDataSnapshot === true`, provide its execution method, and successfully prepare the input. Otherwise calculation retains the existing complete DTO and `execute()` route. A captured input contains a method and cannot be sent as an RPC payload. Worker and remote adapters retain serializable input unless their protocol explicitly supports another format; do not probe unknown methods through a generic RPC proxy.

Capture shares the ordinary Workbook, Worksheet, and ObjectMatrix traversal, array preparation, and formula-field read order. It does not inspect private model storage or qualify every cell accessor. Ordinary formulas use bounded coordinate/string-reference chunks instead of one DTO cell object each. Shared formulas, unusual values, or unsupported coordinates switch that sheet to ordinary DTO output using the captured entries, without rescanning the source. Base formulas retain their DTO preparation; materialization releases the compact chunks.

Customized formula-model preparation or initially customized output-matrix methods and relevant Object.prototype properties retain the eager route. Output-matrix and DTO prototypes must remain stable during synchronous capture; prototype mutations inside source getters are outside this capability contract. Ordinary source methods and getters remain supported. An optional Proxy classifier can reject a proxied formula model before preparation.

An engine can identify an exact completion whose unit and other-formula results were already emitted through `SetFormulaCalculationResultMutation`, allowing the controller to omit that duplicate result mutation. This requires proof for that completion, not similar values or an earlier completion. Normal completion notifications, array/image/dependency processing, and Sheet/Base/other-formula application acknowledgements still run.

After all required acknowledgements, the session synchronously emits the complete `resultApplied$` payload, then releases its strong reference if that session and result are still current. Duplicate acknowledgements use weak identity bookkeeping. Reentrant listeners must not have their new session overwritten; subscribers retaining a payload own that reference.

Deduplication can reduce the number of result mutations observed by listeners even when cell values are unchanged. Engine-generated array metadata mutations carry `fromFormula: true` and `onlyLocal: true`; consumers must distinguish them from genuine edits without feeding formula output into another calculation. Public Workbook/Worksheet/ObjectMatrix models and persisted snapshot schemas remain unchanged. These controllers and session services are shared by browser and headless integrations.

### Consumer validation

- Compare OSS and Pro values, types, errors, formula text, formats, shared formulas, arrays, circular references, and incremental edits with the cooperating versions.
- Check Pro last-value persistence, external references, and other-formula results; persistence must run once for an applied session.
- Exercise formula replacement/removal, spill growth/shrinkage, blocked spills, undo/redo, and structural edits, checking mutation notifications as well as values.
- Verify delayed, early, duplicate, and reentrant acknowledgements, stopped/failed calculations, disposal, independent instances, worker/RPC fallbacks, and collaboration consumers of mutation options or counts.

Value comparisons alone do not establish notification, worker-protocol, or Pro compatibility. Each supported runtime must satisfy the result-application and event contracts.

## Formula reference compatibility

Reference-form `INDEX` returns `#VALUE!` when its areas span different worksheets or workbooks. References that resolve to the same worksheet remain valid.

Use whole-span quoting for quoted 3D ranges, such as `'Jan:Mar'!B2:C3`. Separately quoted endpoints, such as `'Jan':'Mar'!B2:C3`, return `#NAME?`. Adjust formulas that depend on these invalid forms or their previous incorrect results. Workbook/Worksheet models, persisted snapshots, and mutation formats require no migration.

## Worker usage

On the main thread, import `UniverFormulaEnginePlugin` from `@univerjs/engine-formula`. Set `notExecuteFormula: true` to delegate calculation to the worker.

In the worker entry, import `UniverFormulaEnginePlugin` from `@univerjs/engine-formula/worker`:

```ts
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula/worker';

univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: false });
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/engine-formula)
- [GitHub repository](https://github.com/dream-num/univer)
