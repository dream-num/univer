# API Stability Policy

This document explains which Univer APIs are intended for integrations, how to assess compatibility when upgrading, and how contributors should communicate API changes.

## Releases and Compatibility

Starting with 1.0, Univer follows [Semantic Versioning](https://semver.org/) for stable public APIs:

| Release | Compatibility expectation |
| --- | --- |
| Patch (`x.y.Z`) | Backward-compatible bug fixes. |
| Minor (`x.Y.0`) | Backward-compatible features and deprecations. Existing stable APIs remain functional throughout the same major version. |
| Major (`X.0.0`) | May introduce incompatible changes after advance notice and migration guidance. |

When replacing a stable API, announce its deprecation in a minor release, keep the existing API working for a transition period, and provide a migration path before making an incompatible change in a major release. The deprecation notice should state the planned removal version. For example, an API deprecated in `1.4.0` remains usable in later `1.x` releases; its announced removal can take place in `2.0.0` after the compatibility period.

Read the [release notes](https://github.com/dream-num/univer/releases) and migration guidance for every release between your installed version and the target version. Check the API documentation against the version you install; the `dev` branch and current documentation may include APIs that are not in that release.

Prerelease builds are for testing upcoming changes. Validate them separately before adopting them in production.

## Major Version Maintenance

After a major version leaves active maintenance, it receives security updates for one year. This security-only period does not include new features or ordinary bug fixes. Publish the end of active maintenance and the end of the security-update period so users can plan their upgrades.

The one-year period starts when active maintenance ends, not when the major version was first released. After that period, the major version no longer receives security updates; migrate to an actively maintained major version.

## Stability Levels

### Stable

Stable APIs are the intended integration surface for application and plugin developers. They must be available through a published package entry point and documented for external use, without an experimental or internal designation.

Prefer:

- Documented Facade methods, events, enums, and data types for application code.
- Documented preset factories, plugin classes, and configuration types for initialization.
- Documented commands, service interfaces, and extension points when building plugins or integrations that need lower-level access.

An export, a generated API reference entry, or usage in repository examples does not by itself establish a stable contract. Packages also export implementation details so other Univer packages can use them. An explicit `@internal`, `@private`, or experimental designation takes precedence over where a symbol is exported or listed.

Stable APIs preserve documented compatibility across patch and minor releases. Incompatible changes require a major release and the advance notice and migration guidance described under [Deprecated](#deprecated) and [Breaking Changes](#breaking-changes).

### Experimental

APIs explicitly marked experimental, alpha, beta, or preview are outside the stable API compatibility guarantee. They may change their names, signatures, behavior, or package location, or be removed. This status can apply to an individual API or to a feature whose documentation explicitly marks it as experimental.

Document that status in JSDoc or the relevant guide before users adopt the API. Include user-facing breaking changes in release notes even when the affected API is experimental.

### Internal

Internal APIs are implementation details and have no compatibility commitment. These include members marked `@internal` or `@private`, undocumented services and commands, private instance fields, and exports used only for composition between Univer packages.

Source folder names alone do not determine stability: a documented service can be public, while a symbol exported at the package root can still be internal. Likewise, a TypeScript `public` member is not necessarily a supported extension point.

Do not depend on internal controller or renderer behavior, command payloads, DOM structure, or CSS class names unless they are explicitly documented as integration contracts. If an integration needs an internal capability, [open an issue](https://github.com/dream-num/univer/issues) to discuss a public API.

### Deprecated

Deprecation is a migration notice, not a separate stability level. A deprecated stable API remains functional in the current major release while users migrate to its replacement. It must not be removed or changed incompatibly in a patch or minor release.

When deprecating an API:

1. Add `@deprecated` in JSDoc, with a `{@link}` to its replacement or an explanation if none exists.
2. Use `ILogService.deprecate` for runtime warnings when usage can be detected without excessive noise. Type-only APIs need documentation rather than a runtime warning.
3. Announce the deprecation, migration steps, and planned removal version in the relevant guide and release notes before removing the API. Give users a compatibility period to migrate.
4. Remove or incompatibly replace a stable API only in a major release, after that notice and compatibility period. Treat this as a breaking change even when the old API was already deprecated.

## Package Entry Points and Facade APIs

Use the documented entry points of the installed package:

| Purpose | Examples |
| --- | --- |
| Core, plugins, and presets | `@univerjs/core`, `@univerjs/sheets`, `@univerjs/presets`, `@univerjs/preset-sheets-core` |
| Facade APIs and extensions | `@univerjs/core/facade`, `@univerjs/sheets/facade` |
| Locales | `@univerjs/sheets/locale/en-US`, `@univerjs/preset-sheets-core/locales/en-US` |
| Worker entry points | `@univerjs/preset-sheets-core/worker` |
| Stylesheets | `@univerjs/preset-sheets-core/lib/index.css` |

Only use subpaths documented and shipped by the package in question. Wildcard exports do not make every reachable file a supported API. Avoid imports into `src`, implementation directories, or individual compiled modules; documented assets such as `lib/index.css` are intentional entry points.

Facade extensions belong to their feature packages. In a plugin-based integration, register the required plugins and load their `/facade` entries. Presets load the Facade extensions for their included features; they do not enable every API in Univer. A type-only import does not load an extension at runtime, and importing a Facade entry does not register the underlying plugin.

API availability also depends on the runtime and configuration. Browser, worker, and Node.js integrations must use plugins that support that environment. Public API status does not make a UI-dependent API available in a headless runtime.

If documentation and installed exports disagree, check the documented version and required plugins first, then report the mismatch. Do not work around it by importing an internal source path.

## Breaking Changes

A change is breaking when an existing supported integration must change its application code, plugin code, build configuration, package setup, or handling of persisted data to keep working. This includes changes to:

- Imports, package entry points, exported names, or required plugins.
- Parameters, return types, event payloads, configuration options, or documented defaults and behavior.
- Runtime requirements, package formats, or required peer dependencies.
- Snapshot schemas, serialized plugin resources, or client/server interactions relied on by an integration.

For stable public contracts, schedule these changes for a major release. A patch or minor release must preserve existing supported usage, including when introducing a replacement API.

Pull requests that introduce breaking changes must include a `BREAKING CHANGE:` section describing the affected APIs or packages, the reason for the change, and the migration. Include before/after usage when callers need to change code. If no replacement exists, say so explicitly.

Carry this information into the release notes and update affected guides and examples. Changes to persisted data must explain whether existing data needs migration and how it is handled; users should not have to infer that from a type change.

## Package Version Alignment

Keep the `@univerjs/*` SDK packages that participate in a coordinated release on the same exact version, including presets and their plugins. Use the matching coordinated release of `@univerjs-pro/*` packages when adding Pro features.

Independently versioned packages, such as `@univerjs/icons` and `@univerjs/icons-svg`, follow the compatible versions declared in package manifests rather than the SDK version. Follow feature-specific deployment guidance for backend services; SDK package alignment alone does not establish server compatibility.

Mixing SDK versions can cause failures in plugin registration, Facade composition, commands, locales, and shared data models. Upgrade the coordinated packages together and verify the versions actually resolved in the lockfile.

## Upgrade and Contribution Checks

Before upgrading an application:

1. Review intervening release notes and migrate affected imports, API calls, configuration, and services.
2. Align coordinated package versions and confirm that required plugins, Facade extensions, locales, and styles are loaded.
3. Run type checks and integration tests in the runtimes you deploy. Exercise the features you use, including editing, events, undo/redo, saving and reloading existing documents, and import/export or collaboration where applicable.

Before adding or changing a public API:

- Identify its owner package, published entry point, required plugins, and supported runtimes.
- Follow the [naming convention](./NAMING_CONVENTION.md) and [Facade contribution guide](./CONTRIBUTING-FACADE.md) where applicable.
- Document its behavior and stability status, and provide a usage example.
- Add tests that protect the public behavior or regression, and update affected callers and examples.
- Document breaking changes and migrations using the requirements above.
