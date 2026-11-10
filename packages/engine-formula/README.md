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

Registering, replacing, or unregistering a function invalidates its cached ASTs and expanded lexer trees using the parser's function-name normalization. Cached unknown-function errors are refreshed for names with whitespace, supported Excel prefixes, and aliases as well as ordinary names.

`FormulaCacheService` is internal and is not exported from the package root. Integrations and cross-package test fixtures initialize formula dependencies through `UniverFormulaEnginePlugin` or the corresponding Pro plugin, which registers the owning cache service. `Lexer` owns expanded-tree cache lookup and invalidation. `LexerTreeBuilder` has no service dependency and always builds a fresh tree. Standalone and editor callers can construct it directly. Custom runtime implementations may omit the optional calculation-cache hooks; references then compute without caching.

Range-array and comparison-index invalidation uses the owning runtime's `clearArrayObjectCache()` and `clearInvertedIndexCache()` hooks. The obsolete `FORMULA_REF_TO_ARRAY_CACHE` and `CELL_INVERTED_INDEX_CACHE` globals are removed. Facade usage, workbook IDs, snapshots, and collaboration changesets are unchanged.

## Calculation input and result ownership

Formula capture, load, and execution capabilities are internal interfaces shared by cooperating calculation engines, not application or Facade APIs. Their exports and type declarations remain available for cross-package integration; this does not make them stable public extension points. Validate the exact OSS, Pro, and engine versions together under the [API stability policy](../../docs/API_STABILITY.md).

`IFormulaDataSnapshot` captures ephemeral calculation input, not a persisted Workbook snapshot or a replacement for `IWorkbookData`. It preserves formula values even when the Workbook is edited later. `materialize()` returns an owned, mutable formula DTO and caches it for later reads. `FormulaCurrentConfigService` can defer materialization until `getFormulaData()`; another load, formula-data registration, or disposal replaces that deferred state.

Capture requires an engine to explicitly advertise `supportsFormulaDataSnapshot === true`, provide its execution method, and successfully prepare the input. Otherwise calculation retains the existing complete DTO and `execute()` route. A captured input contains a method and cannot be sent as an RPC payload. Worker and remote adapters retain serializable input unless their protocol explicitly supports another format; do not probe unknown methods through a generic RPC proxy.

Capture shares the ordinary Workbook, Worksheet, and ObjectMatrix traversal, array preparation, and formula-field read order. It does not inspect private model storage or qualify every cell accessor. Ordinary formulas use bounded coordinate/string-reference chunks instead of one DTO cell object each. Shared formulas, unusual values, or unsupported coordinates switch that sheet to ordinary DTO output using the captured entries, without rescanning the source. Base formulas retain their DTO preparation; materialization releases the compact chunks.

`IFormulaRuntimeService.beginCircularReferences()` preserves and validates previous cycle records for incremental Web/Pro calculation. An engine supplying the complete current cycle set can pass `true` to start an empty pending set without reading the formula DTO. Recording and completion still copy diagnostics, and stopped calculations do not replace the published set. An empty completed set clears resolved cycles; UI alerts and `FWorkbook.getCircularReferences()` continue to consume the published records.

Customized formula-model preparation or initially customized output-matrix methods and relevant Object.prototype properties retain the eager route. Output-matrix and DTO prototypes must remain stable during synchronous capture; prototype mutations inside source getters are outside this capability contract. Ordinary source methods and getters remain supported. An optional Proxy classifier can reject a proxied formula model before preparation.

`FormulaResultService` is the shared batch writer for Web, Pro, and native engines. It submits array/image/dependency metadata and cell results through the existing mutations. Web/Pro release calculation contexts after materializing results and before awaiting model application. Engines await the writer before publishing completion; `CalculateController` publishes the terminal notification without submitting results again. Native engines may submit intermediate dependency passes so feature callbacks reading Workbook values see the current pass. A completion remains an `IAllRuntimeData` snapshot; it is not a request to replay its values.

Custom calculation-service implementations must use the writer for their batches before emitting completion. Subclasses calling the base `CalculateFormulaService` constructor must inject and pass `FormulaResultService`. Upgrade cooperating OSS, Pro, and native Wrapper integrations together; no result-ownership capability probe or extra mutation field is required.

Delayed or absent application acknowledgements never cause an automatic duplicate submission. An integration that rejects delivery must retain and explicitly reapply its result through the shared writer; recalculation is not delivery retry because native output can omit unchanged cached cells. A thrown writer command rejects `execute()` and releases runtime data without announcing successful completion. Low-level callers must handle execution failures as well as completion events.

After all required acknowledgements, the session synchronously emits the complete `resultApplied$` payload, then releases its strong reference if that session and result are still current. Duplicate acknowledgements use weak identity bookkeeping. Reentrant listeners must not have their new session overwritten; subscribers retaining a payload own that reference.

Completion no longer adds a duplicate result mutation, including for arrays, multiple worksheets, other-formula grids, and pending acknowledgements. Result mutations carry `applyFormulaCalculationResult: true`. Engine-generated array metadata mutations carry `fromFormula: true` and `onlyLocal: true`; consumers must distinguish them from genuine edits without feeding formula output into another calculation. Public Workbook/Worksheet/ObjectMatrix models and persisted snapshot schemas remain unchanged. These controllers and session services are shared by browser and headless integrations.

### Consumer validation

- Compare OSS and Pro values, types, errors, formula text, formats, shared formulas, arrays, circular references, and incremental edits with the cooperating versions.
- Check Pro last-value persistence, external references, and other-formula results; persistence must run once for each applied result batch.
- Exercise formula replacement/removal, spill growth/shrinkage, blocked spills, undo/redo, and structural edits, checking mutation notifications as well as values.
- Verify delayed, early, duplicate, and reentrant acknowledgements, stopped/failed calculations, disposal, independent instances, worker/RPC fallbacks, and collaboration consumers of mutation options or counts.

Value comparisons alone do not establish notification, worker-protocol, or Pro compatibility. Each supported runtime must satisfy the result-application and event contracts.

## Formula reference compatibility

Formula reads convert rich-text paragraph separators to Excel's LF line breaks.
Saved rich-text documents and CRLF in plain string values remain unchanged. This
also corrects `LEN` and `SEARCH` over rich-text references; recalculate existing
formula caches to refresh affected results. Public models and mutations are unchanged.

`PV` uses integer compounding for whole periods with an absolute value no greater
than 2,147,483,647, taking the reciprocal for negative periods. This preserves the
factor before cancellation in small loan balances. Fractional and larger periods
retain floating exponentiation. Last digits may change; formulas,
Workbook models and snapshots require no migration. Pro and native integrations
must use the matching correction. XIRR retains its current numerical precision;
its result can differ from Excel's earlier stopping point.

Reference-form `INDEX` returns `#VALUE!` when its areas span different worksheets or workbooks. References that resolve to the same worksheet remain valid.

Use whole-span quoting for quoted 3D ranges, such as `'Jan:Mar'!B2:C3`. Separately quoted endpoints, such as `'Jan':'Mar'!B2:C3` and the Excel-saved `Jan:'Mar'!B2:C3` form, return `#NAME?` for both single-cell and rectangular references. Ordinary ranges such as `Jan!B2:'Jan'!C3` remain supported. Adjust formulas that depend on these invalid forms or their previous incorrect results. Workbook/Worksheet models, persisted snapshots, and mutation formats require no migration.

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
