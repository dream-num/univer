# API Stability Policy

This document defines how Univer treats public APIs, experimental APIs, internal APIs, deprecations, and breaking changes.

Univer is currently pre-1.0, so the project can still make breaking changes when they are needed for architecture, correctness, or long-term maintainability. Even in pre-1.0 releases, the project should make API risk visible before users depend on it.

## Stability Levels

### Stable

Stable APIs are intended for application and plugin developers.

An API is stable when it is exported from a public package entry point and is documented in the generated API reference, package README, guide, or examples without an experimental warning.

Examples include:

- Public package entry points such as `@univerjs/core`, `@univerjs/sheets`, and `@univerjs/presets`.
- Documented Facade APIs such as workbook, worksheet, range, formula, and document APIs.
- Public plugin classes, configuration types, commands, and service interfaces documented for extension authors.

Stable APIs should not be removed or changed incompatibly without a deprecation path.

### Experimental

Experimental APIs are usable, but their behavior, names, parameters, or package location may change.

An API is experimental when any of the following is true:

- It is documented as experimental, alpha, beta, preview, or under active development.
- It belongs to a product surface that is explicitly marked as under active development.
- It is exposed for early integration feedback before the project has committed to its final shape.

Experimental APIs should include a short note in docs or JSDoc that explains the instability. Breaking changes to experimental APIs should still be called out in release notes when they affect users.

### Internal

Internal APIs are implementation details and are not covered by compatibility guarantees.

An API should be treated as internal when it is:

- Not documented for application or plugin authors.
- Located under implementation folders such as controllers, render controllers, models, views, utilities, or test helpers without a public export contract.
- Exported only to support package composition inside the monorepo.
- Marked `@internal`, `@private`, or described as implementation-only.

Avoid depending on internal APIs in user applications. If an internal API is needed for real integrations, open an issue or discussion so it can be promoted to a public API intentionally.

### Deprecated

Deprecated APIs are still available for compatibility, but users should migrate away from them.

When deprecating an API:

1. Mark it with `@deprecated` in JSDoc and link to the replacement when one exists.
2. Log a deprecation warning through `ILogService` when runtime usage can be detected without excessive noise.
3. Add migration guidance in the relevant guide, README, or release notes when the API is broadly used.

Deprecated stable APIs should remain available until the next major release unless the API is unsafe, broken, or impossible to preserve. In pre-1.0 releases, removals may happen in a minor release, but they should be documented as breaking changes.

## Breaking Changes

A change is breaking when it requires users to modify application code, plugin code, build configuration, package versions, persisted data assumptions, or runtime integration behavior.

Breaking changes should be documented in the changelog or release notes with:

- The affected package or feature area.
- What changed.
- Why the change was necessary.
- The migration path or replacement API.

Pull requests that introduce breaking changes should include a `BREAKING CHANGE:` section in the PR description.

## Package Version Alignment

Keep all `@univerjs/*` packages on the same version. If an application uses Univer Pro packages, keep all `@univerjs-pro/*` packages aligned with the matching Univer release line as well.

Mixing package versions can bypass compatibility checks and produce runtime failures, especially around plugin registration, Facade API composition, locales, commands, and shared data models.

## Public API Checklist

Before exposing a new public API, confirm that:

- The API has a clear owner package and entry point.
- The name follows the repository naming convention.
- The API works in the intended runtime: browser, Node.js, worker, or shared.
- Facade APIs are registered by the correct package or preset.
- The API has tests for expected behavior and at least one usage example or reference entry.
- Experimental status is explicitly documented if the design is not final.

## User Expectations

Users can rely on documented stable APIs as the preferred integration surface. Users should expect experimental APIs to evolve and internal APIs to change without notice.

If the documentation and package exports disagree, treat the documentation as the intended public contract and report the mismatch.
