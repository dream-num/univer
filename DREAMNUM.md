# dream-num/univer

> The open-source, isomorphic office SDK for building embeddable spreadsheet, document, and presentation experiences in browsers and Node.js.

## Responsibilities

### Owns

- The open-source Univer runtime, plugin system, command and service infrastructure, Facade API, formula engine, and Canvas rendering engine. See the [repository overview](README.md#-what-is-univer).
- Open-source models, editing capabilities, and UI plugins for Sheets, Docs, and Slides, including shared drawing, commenting, validation, formatting, and localization infrastructure. See the [open-source capability boundary](README.md#-open-source-and-pro).
- Browser, Node.js, and Web Worker integration paths, plus React-based UI and Vue 3 and Web Component adapters. See the [compatibility and integration overview](README.md#-compatibility).
- First-party open-source package presets and the examples and test projects used to exercise the SDK. See the [workspace definition](pnpm-workspace.yaml) and [repository guide](README.md#-repository-guide).
- Public API compatibility rules for stable, experimental, internal, and deprecated interfaces. See the [API Stability Policy](docs/API_STABILITY.md).

The repository does not own Univer Pro's commercial collaboration, import/export, server, or enterprise capabilities; those are a separate extension layer described in the [open-source and Pro boundary](README.md#-open-source-and-pro).

## Provides

- `@univerjs/core`, `@univerjs/engine-formula`, and `@univerjs/engine-render` — Core runtime and data models, Facade APIs, formula calculation, and shared rendering. Contract: [package manifests](packages/core/package.json) and [API reference](https://docs.univer.ai/reference/classes/univer).
- `@univerjs/sheets`, `@univerjs/docs`, `@univerjs/slides`, and their UI and feature packages — Composable office models, plugins, and editing interfaces. Contract: [package directory](packages) and [API stability rules](docs/API_STABILITY.md).
- `@univerjs/presets` and `@univerjs/preset-*` — Curated plugin collections for browser and Node.js integrations. Contract: [preset packages](presets/packages) and [preset-mode guide](README.md#-quick-start).
- `@univerjs/ui-adapter-vue3` and `@univerjs/ui-adapter-web-component` — Framework adapters for integrating Univer UI services. Contract: [Vue 3 adapter](packages/ui-adapter-vue3/README.md) and [Web Component adapter](packages/ui-adapter-web-component/README.md).
- `sync-univer` repository-dispatch event — Notifies the separate Univer Pro repository after changes reach `dev`. Contract: [dispatch workflow](.github/workflows/dispatch-sync-univer-pro.yml).

## Depends on

- [`dream-num/univer-icons`](https://github.com/dream-num/univer-icons) — Owns the React icon components and SVG assets consumed by Univer UI packages. Contract: [`@univerjs/ui` manifest](packages/ui/package.json) and [SVG asset dependency](packages/sheets-conditional-formatting/package.json).
- [`jikkai/verso`](https://github.com/jikkai/verso) — Owns the workspace release CLI used to version and tag Univer packages. Contract: [root package manifest](package.json).

## Authoritative sources

- **Product documentation:** [docs.univer.ai](https://docs.univer.ai).
- **API reference:** [Univer Facade API](https://docs.univer.ai/reference/classes/univer).
- **Development guidance:** [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
- **Package contracts:** [`packages/`](packages), [`presets/`](presets), and [API Stability Policy](docs/API_STABILITY.md).
- **Package release source:** [npm release workflow](.github/workflows/release-npm.yml).
- **Security policy:** [SECURITY.md](SECURITY.md).

## Update contract

Update this file in the same change when any of these facts change:

- repository responsibilities or boundaries;
- outgoing cross-repository dependencies;
- public packages, APIs, protocols, events, images, or data contracts;
- deployment source, runbook, or data classification.
