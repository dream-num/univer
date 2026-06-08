# Remove Sheets Zen Editor Design

Date: 2026-06-08

## Goal

Remove the sheets zen-editor feature and all repository-owned coupling points around it. After this change, the workspace should no longer expose, register, mount, or branch on the sheets zen-editor feature.

This is an intentional breaking removal. The repository will not keep deprecated empty shells for the zen-editor plugin, `IZenZoneService`, `ZenZone`, or `DOCS_ZEN_EDITOR_UNIT_ID_KEY`.

## Current Context

The feature currently spans several layers:

- `packages/sheets-zen-editor` provides the plugin, commands, menu entries, shortcuts, facade APIs, locales, styles, and tests.
- Examples and mockdata depend on and register `@univerjs/sheets-zen-editor`.
- `@univerjs/ui` owns the generic-looking `IZenZoneService`, `DesktopZenZoneService`, and `ZenZone` workbench mount point, but they are only used to host the sheets zen editor.
- `@univerjs/core` exports `DOCS_ZEN_EDITOR_UNIT_ID_KEY` and includes it in `SHEET_EDITOR_UNITS`.
- Multiple business packages branch on zen-editor state or the zen editor document id for menu visibility, popup routing, alert cleanup, dropdown blocking, drawing data, hyperlink behavior, and tests.

## Selected Approach

Use a single cleanup pass that removes the plugin and all in-repository zen-editor coupling points together.

This is preferred over keeping compatibility stubs because the desired outcome is to remove deeply coupled UI and business logic, not leave a disabled concept behind. It is also preferred over a staged partial removal because a half-removed zen-editor would be harder to reason about and easier to accidentally revive.

## Scope

In scope:

- Delete `packages/sheets-zen-editor`.
- Remove all workspace dependencies, imports, facade imports, and plugin registrations for `@univerjs/sheets-zen-editor`.
- Remove `IZenZoneService`, `DesktopZenZoneService`, `ZenZone`, their workbench mount points, DI registrations, tests, and public exports from `@univerjs/ui`.
- Remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from `@univerjs/core` and remove it from `SHEET_EDITOR_UNITS`.
- Remove repository-owned menu visibility checks, popup routes, dropdown blocks, alert cleanup, drawing branches, hyperlink branches, and tests that exist only for zen-editor mode.
- Update `pnpm-lock.yaml` to match the workspace dependency changes.

Out of scope:

- Replacing zen-editor with a new immersive editor.
- Adding compatibility shims for external consumers.
- Refactoring unrelated editor infrastructure, normal cell editing, formula bar editing, or normal document editing.
- Editing historical changelog entries solely because they mention zen-editor.

## Architecture Changes

### Plugin And Package Layer

Remove the `@univerjs/sheets-zen-editor` workspace package entirely. This includes:

- plugin class and config
- open, confirm, and cancel commands
- menu schema and menu item factories
- shortcuts
- facade extensions
- `ZenEditor` React view and styles
- locales
- unit tests, package config, and README

Examples and mockdata should no longer list `@univerjs/sheets-zen-editor` as a dependency and should no longer import its plugin, facade entry, locale files, CSS, or registration code.

### UI Layer

Remove the zen zone host from `@univerjs/ui`:

- Delete the `IZenZoneService` identifier and interface.
- Delete `DesktopZenZoneService`.
- Delete the `ZenZone` component.
- Remove `ZenZone` from desktop and mobile workbenches.
- Remove `IZenZoneService` registration from desktop and mobile UI plugins.
- Remove public exports for the service and component.
- Remove tests that only validate `DesktopZenZoneService`.

The UI package should no longer expose a generic zen-zone concept because the only known repository use is the removed sheets zen editor.

### Core Constants

Remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from `@univerjs/core`.

Keep normal editor ids, including:

- `DOCS_NORMAL_EDITOR_UNIT_ID_KEY`
- `DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY`

Update `SHEET_EDITOR_UNITS` so it contains only the remaining sheet editor document ids.

## Business Coupling Cleanup

### Docs UI And Docs Drawing UI

Remove menu hiding and editor exceptions that specifically exclude or include `DOCS_ZEN_EDITOR_UNIT_ID_KEY`.

Menus such as header/footer, table insertion, text alignment, and image actions should depend only on existing non-zen conditions: current focused unit, document flavor, permissions, ranges, and command state.

Render controllers should treat internal editors through existing generic rules. The zen editor should not receive special handling because its unit id will no longer exist.

### Sheets Hyperlink UI

Remove zen-editor hyperlink behavior:

- zen editor menu ids
- zen editor insert-link toolbar/menu factories
- popup routes that target `DOCS_ZEN_EDITOR_UNIT_ID_KEY`
- source branches for zen editor editing
- temporary hide/show interactions with `IZenZoneService`
- tests whose only purpose is zen editor popup or operation behavior

Keep hyperlink behavior for normal sheet cells, normal cell editor documents, and formula bar editor documents.

### Sheets Popup, Alert, Dropdown, And Comment Packages

Remove subscriptions to `IZenZoneService.visible$` and direct `visible` checks from:

- sheets data validation alert/dropdown logic
- sheets formula alert logic
- sheets note popup logic
- sheets thread comment popup logic
- sheets number format alert logic
- sheets UI dropdown and force-string alert logic

These components should continue to use their existing hover, focus, selection, editor visibility, and popup attachment conditions.

### Sheets Drawing UI And Docs Hyperlink UI

Remove branches that copy, load, initialize, or route data for `DOCS_ZEN_EDITOR_UNIT_ID_KEY`.

Keep branches for remaining editor ids such as normal editor and formula bar editor where they still represent active behavior.

## Data Flow

Before removal, opening the zen editor created a separate document unit, mounted it through the UI zen zone, copied current cell editor data into it, and submitted or discarded the result through zen-editor commands.

After removal:

- There is no zen-editor document unit.
- No workbench overlay is mounted for zen editing.
- Cell editing remains inside the existing sheet editor flow.
- Formula bar editing remains unchanged.
- Business packages no longer receive or react to a zen-mode visible signal.

## Error Handling

The cleanup should remove error paths that only guard zen mode, such as throwing when a dropdown is shown while zen mode is visible.

Existing error behavior for missing popup containers, invalid command targets, permissions, and missing editor state should remain unchanged.

## Testing Strategy

Run a static residual scan and targeted tests after implementation.

Residual scan should confirm no active source or package metadata references remain for:

- `sheets-zen-editor`
- `UniverSheetsZenEditorPlugin`
- `IZenZoneService`
- `DesktopZenZoneService`
- `ZenZone`
- `DOCS_ZEN_EDITOR_UNIT_ID_KEY`
- `zen mode`
- `zen-editor`

Historical references in `CHANGELOG.md` are allowed to remain.

Targeted tests should cover the affected packages when practical:

- `@univerjs/ui`
- `@univerjs/sheets-ui`
- `@univerjs/sheets-hyper-link-ui`
- `@univerjs/sheets-data-validation-ui`
- `@univerjs/sheets-formula-ui`
- `@univerjs/sheets-thread-comment-ui`
- `@univerjs/sheets-note-ui`
- `@univerjs/sheets-numfmt-ui`
- `@univerjs/docs-ui`
- `@univerjs/docs-drawing-ui`
- `@univerjs/sheets-drawing-ui`

At minimum, run type checking for affected workspaces. If runtime is acceptable, run the broader repository typecheck and relevant example build checks.

## Compatibility And Migration Notes

This removal is breaking for external consumers that import or depend on:

- `@univerjs/sheets-zen-editor`
- `@univerjs/sheets-zen-editor/facade`
- `@univerjs/ui` exports for `IZenZoneService`, `DesktopZenZoneService`, or `ZenZone`
- `DOCS_ZEN_EDITOR_UNIT_ID_KEY`
- zen-editor commands, menu ids, shortcuts, or locale keys

Consumers should remove the plugin registration and any zen-editor-specific integrations. There is no replacement API in this design.

## Acceptance Criteria

- `packages/sheets-zen-editor` is gone from the workspace.
- Examples and mockdata no longer depend on or register the sheets zen-editor plugin.
- `@univerjs/ui` no longer contains or exports zen-zone services or components.
- `@univerjs/core` no longer exports `DOCS_ZEN_EDITOR_UNIT_ID_KEY`, and `SHEET_EDITOR_UNITS` only includes remaining editor ids.
- Business packages no longer branch on zen-editor state or the zen-editor unit id.
- Tests no longer assert zen-mode-specific behavior.
- Static scans show no active source or package metadata references to the removed feature, excluding historical changelog entries.
- Targeted tests and type checks for affected packages pass, or any remaining failures are documented with concrete reasons.
