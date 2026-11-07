# Formula Runtime Memory Capabilities

This note describes optional capabilities used between cooperating formula engines and the OSS calculation pipeline. They are for package integration, rather than application code or Facade extensions. Follow the [API stability policy](./API_STABILITY.md) and validate the exact OSS, Pro, and engine versions used together.

## Calculation Input and Persisted Snapshots

`IFormulaDataSnapshot` is ephemeral calculation input. It captures formula values at the point where the controller would otherwise construct the complete formula DTO. It is not a Workbook snapshot, a saved document format, or a replacement for `IWorkbookData`.

`materialize()` returns an owned, mutable formula DTO and caches that DTO for subsequent reads. Capturing input must preserve the formula values for that calculation even if a later edit changes the Workbook. Loading a captured input into `FormulaCurrentConfigService` defers DTO construction until `getFormulaData()` needs it. Loading another dataset, registering formula data, or disposing the service replaces that deferred state.

The capture, load, and execution capability APIs are experimental package integration points. Their declarations must remain available to cooperating packages; they are not removed from declarations as internal-only implementation details. Internal deferred-state bookkeeping does not provide an application API.

## Explicit Opt-In and Fallback

The controller uses the captured-input path only when an engine explicitly advertises `supportsFormulaDataSnapshot === true`, provides an execution method, and successfully prepares a snapshot. Unsupported model shapes return no snapshot and use the existing complete formula DTO and `execute()` path. Engines that do not implement these capabilities retain that path.

The optimized capture requires supported ordinary model instances and data. It must not bypass custom methods, accessors, Proxies, shared-formula preparation, or array metadata handling by assuming that every Workbook has the same implementation.

These capabilities are for cooperating in-process services. A snapshot contains a method and is not an RPC payload. Worker and remote adapters must use the existing serializable input unless their protocol explicitly supports an alternative. A generic RPC proxy is not evidence that an optional method exists on the remote service: do not invoke an unknown remote method as a capability probe.

## Result Emission, Application, and Ownership

A cooperating engine can identify an exact completion whose unit and other-formula results have already been emitted through `SetFormulaCalculationResultMutation`. The controller can then omit the equivalent completion-time result mutation. The proof belongs to the engine and the exact completion object; similar values, an earlier completion, or calculation completion alone are insufficient.

This check concerns emission. It does not acknowledge model application, replace normal completion notifications, or skip array metadata, image, and dependency-tree processing. Sheet, Base, and other-formula application acknowledgements still determine when the calculation session has applied its result.

After all required application acknowledgements, the session emits `resultApplied$` with the complete result. Once synchronous delivery finishes, it releases its strong reference to that result when the same session and result are still current. Weak identity bookkeeping handles duplicate acknowledgements without retaining the completed payload. Reentrant listeners can start another session; releasing the previous result must not overwrite the new session's state. Subscribers that need the payload later own the references they retain.

## Observable Mutation Behavior

Result deduplication can reduce the number of result mutations observed by command listeners. A listener can receive one application where it previously observed both an engine-emitted result and an equivalent completion-time result. This is an observable integration change even when cell values remain identical.

Engine-generated array metadata mutations carry `fromFormula: true` with `onlyLocal: true`. Consumers that distinguish user edits from formula output must handle these options consistently. They must still process genuine edits and avoid feeding formula output back into another calculation unnecessarily.

The public Workbook, Worksheet, and ObjectMatrix implementations and persisted snapshot schemas are unchanged by these OSS capabilities. Formula controllers and session services are shared by browser and headless integrations, so editing and mutation consumers still require compatibility checks.

## Consumer Acceptance

Validate cooperating package versions together before enabling these capabilities:

- Compare the existing OSS engine and the new OSS pipeline for values, types, errors, formula text, formats, shared formulas, arrays, circular references, and incremental edits.
- Exercise Pro calculation and last-value persistence with the new OSS services, including external references and other-formula results. Confirm that persistence runs once for an applied session.
- Exercise ordinary edits, formula replacement and removal, array spill growth and shrinkage, blocked spills, undo/redo, and structural edits. Check both values and expected mutation notifications.
- Verify delayed, early, duplicate, and reentrant acknowledgements, stopped calculations, disposal, and independent runtime instances.
- Verify worker and remote fallbacks without sending a snapshot method or calling an unsupported remote capability. Check collaboration and result consumers that inspect mutation options or counts.

Passing value comparisons alone does not establish notification, worker-protocol, or Pro compatibility. Optional method signatures preserve the legacy route, but each supported runtime must also satisfy its result-application and event contracts.
