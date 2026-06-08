# Remove Sheets Zen Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the sheets zen-editor package and every in-repository zen-editor coupling point.

**Architecture:** Delete the dedicated sheets zen-editor workspace package, then remove the UI zen-zone host, the core zen-editor document id, and all business branches that depended on either. Keep normal cell editing, formula bar editing, and normal document editing unchanged.

**Tech Stack:** TypeScript, React, RxJS, pnpm workspaces, Vitest, Turbo, Univer package scripts.

---

## File Structure

Delete:

- `packages/sheets-zen-editor/`
- `packages/ui/src/services/zen-zone/`
- `packages/ui/src/views/components/zen-zone/ZenZone.tsx`

Modify:

- `examples/package.json`
- `common/mockdata/package.json`
- `examples/src/sheets/main.ts`
- `examples/src/sheets-no-worker/main.ts`
- `examples/src/sheets-multi-units/main.ts`
- `examples/src/sheets-webcomponent/main.tsx`
- `examples/src/theme-customizer/components/univer-preview.tsx`
- `packages/ui/src/plugin.ts`
- `packages/ui/src/mobile-plugin.ts`
- `packages/ui/src/views/workbench/Workbench.tsx`
- `packages/ui/src/views/mobile-workbench/MobileWorkbench.tsx`
- `packages/ui/src/index.ts`
- `packages/ui/src/services/__tests__/misc-services.spec.ts`
- `packages/core/src/common/const.ts`
- `packages/core/src/types/const/const.ts`
- `packages/docs-ui/src/menu/menu.ts`
- `packages/docs-ui/src/controllers/render-controllers/doc-contextmenu.render-controller.ts`
- `packages/docs-ui/src/controllers/render-controllers/doc-resize.render-controller.ts`
- `packages/docs-drawing-ui/src/menu/image.menu.ts`
- `packages/docs-drawing-ui/src/controllers/render-controllers/doc-drawing-transform-update.controller.ts`
- `packages/docs-hyper-link-ui/src/controllers/render-controllers/hyper-link-event.render-controller.ts`
- `packages/sheets-ui/src/services/cell-dropdown-manager.service.ts`
- `packages/sheets-ui/src/services/__tests__/cell-dropdown-manager.service.spec.ts`
- `packages/sheets-ui/src/controllers/force-string-alert-render.controller.ts`
- `packages/sheets-data-validation-ui/src/controllers/dv-alert.controller.ts`
- `packages/sheets-data-validation-ui/src/controllers/__tests__/dv-alert.controller.spec.ts`
- `packages/sheets-data-validation-ui/src/services/dropdown-manager.service.ts`
- `packages/sheets-formula-ui/src/controllers/formula-alert-render.controller.ts`
- `packages/sheets-formula-ui/src/controllers/__tests__/formula-alert-render.controller.spec.ts`
- `packages/sheets-note-ui/src/services/sheets-note-popup.service.ts`
- `packages/sheets-thread-comment-ui/src/services/sheets-thread-comment-popup.service.ts`
- `packages/sheets-thread-comment-ui/src/services/__tests__/sheets-thread-comment-popup.service.spec.ts`
- `packages/sheets-thread-comment-ui/src/__tests__/create-thread-comment-ui-test-bed.ts`
- `packages/sheets-numfmt-ui/src/controllers/numfmt-alert-render.controller.ts`
- `packages/sheets-drawing-ui/src/controllers/sheet-cell-image-copy-paste.controller.ts`
- `packages/sheets-drawing-ui/src/controllers/sheet-cell-image.controller.ts`
- `packages/sheets-hyper-link-ui/src/menu/menu.ts`
- `packages/sheets-hyper-link-ui/src/commands/operations/popup.operations.ts`
- `packages/sheets-hyper-link-ui/src/commands/operations/__tests__/popup.operations.spec.ts`
- `packages/sheets-hyper-link-ui/src/services/popup.service.ts`
- `packages/sheets-hyper-link-ui/src/services/__tests__/popup.service.spec.ts`
- `packages/sheets-hyper-link-ui/src/controllers/popup.controller.ts`
- `packages/sheets-hyper-link-ui/src/views/CellLinkEdit/index.tsx`
- `packages/sheets-hyper-link-ui/src/views/CellLinkPopup/index.tsx`
- `pnpm-lock.yaml`

Do not edit `CHANGELOG.md` for historical references.

---

### Task 1: Remove Package Registration And Example Imports

**Files:**

- Delete: `packages/sheets-zen-editor/`
- Modify: `examples/package.json`
- Modify: `common/mockdata/package.json`
- Modify: `examples/src/sheets/main.ts`
- Modify: `examples/src/sheets-no-worker/main.ts`
- Modify: `examples/src/sheets-multi-units/main.ts`
- Modify: `examples/src/sheets-webcomponent/main.tsx`
- Modify: `examples/src/theme-customizer/components/univer-preview.tsx`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Remove example and mockdata dependencies**

Edit `examples/package.json` and delete this dependency entry:

```json
"@univerjs/sheets-zen-editor": "workspace:*",
```

Edit `common/mockdata/package.json` and delete this dependency entry:

```json
"@univerjs/sheets-zen-editor": "workspace:*",
```

- [ ] **Step 2: Remove zen-editor imports and registrations from examples**

In `examples/src/sheets/main.ts`, remove:

```ts
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import '@univerjs/sheets-zen-editor/facade';
```

Then remove this plugin entry from the registration list:

```ts
[UniverSheetsZenEditorPlugin],
```

In `examples/src/sheets-no-worker/main.ts`, remove:

```ts
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import '@univerjs/sheets-zen-editor/facade';
```

Then remove:

```ts
univer.registerPlugin(UniverSheetsZenEditorPlugin);
```

In `examples/src/sheets-multi-units/main.ts`, remove:

```ts
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import '@univerjs/sheets-zen-editor/facade';
```

Then remove:

```ts
univer.registerPlugin(UniverSheetsZenEditorPlugin);
```

In `examples/src/sheets-webcomponent/main.tsx`, remove:

```ts
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
```

Then remove:

```ts
// zen editor plugin
univer.registerPlugin(UniverSheetsZenEditorPlugin);
```

In `examples/src/theme-customizer/components/univer-preview.tsx`, remove:

```ts
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
```

Then remove this plugin entry:

```ts
[UniverSheetsZenEditorPlugin],
```

- [ ] **Step 3: Delete the package directory**

Run:

```bash
rm -rf packages/sheets-zen-editor
```

Expected: `test -d packages/sheets-zen-editor` exits non-zero.

- [ ] **Step 4: Update lockfile**

Run:

```bash
pnpm install --lockfile-only
```

Expected: command exits 0 and removes `packages/sheets-zen-editor` and `@univerjs/sheets-zen-editor` importers from `pnpm-lock.yaml`.

- [ ] **Step 5: Verify package removal**

Run:

```bash
rg -n "@univerjs/sheets-zen-editor|UniverSheetsZenEditorPlugin|sheets-zen-editor/facade" examples common/mockdata pnpm-lock.yaml package.json pnpm-workspace.yaml
```

Expected: no matches.

- [ ] **Step 6: Commit package removal**

Run:

```bash
git add examples common/mockdata pnpm-lock.yaml packages/sheets-zen-editor
git commit -m "refactor: remove sheets zen editor package"
```

Expected: commit succeeds.

---

### Task 2: Remove UI ZenZone Infrastructure

**Files:**

- Delete: `packages/ui/src/services/zen-zone/zen-zone.service.ts`
- Delete: `packages/ui/src/services/zen-zone/desktop-zen-zone.service.ts`
- Delete: `packages/ui/src/views/components/zen-zone/ZenZone.tsx`
- Modify: `packages/ui/src/plugin.ts`
- Modify: `packages/ui/src/mobile-plugin.ts`
- Modify: `packages/ui/src/views/workbench/Workbench.tsx`
- Modify: `packages/ui/src/views/mobile-workbench/MobileWorkbench.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/services/__tests__/misc-services.spec.ts`

- [ ] **Step 1: Remove service imports and DI from desktop UI plugin**

In `packages/ui/src/plugin.ts`, remove:

```ts
import { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
import { IZenZoneService } from './services/zen-zone/zen-zone.service';
```

Then remove this dependency entry from `registerDependencies`:

```ts
[IZenZoneService, { useClass: DesktopZenZoneService, lazy: true }],
```

- [ ] **Step 2: Remove service imports and DI from mobile UI plugin**

In `packages/ui/src/mobile-plugin.ts`, remove:

```ts
import { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
import { IZenZoneService } from './services/zen-zone/zen-zone.service';
```

Then remove this dependency entry from `registerDependencies`:

```ts
[IZenZoneService, { useClass: DesktopZenZoneService, lazy: true }],
```

- [ ] **Step 3: Remove workbench mounts**

In `packages/ui/src/views/workbench/Workbench.tsx`, remove:

```tsx
import { ZenZone } from '../components/zen-zone/ZenZone';
```

Then remove:

```tsx
<ZenZone />
```

In `packages/ui/src/views/mobile-workbench/MobileWorkbench.tsx`, remove:

```tsx
import { ZenZone } from '../components/zen-zone/ZenZone';
```

Then remove:

```tsx
<ZenZone />
```

- [ ] **Step 4: Remove public exports**

In `packages/ui/src/index.ts`, remove:

```ts
export { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
export { IZenZoneService } from './services/zen-zone/zen-zone.service';
export { ZenZone } from './views/components/zen-zone/ZenZone';
```

- [ ] **Step 5: Remove ZenZone service tests**

In `packages/ui/src/services/__tests__/misc-services.spec.ts`, remove:

```ts
import { DesktopZenZoneService } from '../zen-zone/desktop-zen-zone.service';
```

Delete every test case that instantiates `new DesktopZenZoneService(...)` or calls `.set('zen-editor', ...)`, `.open()`, `.close()`, `.hide()`, or `.show()` on that service. Keep unrelated misc service tests intact.

- [ ] **Step 6: Delete UI zen-zone files**

Run:

```bash
rm -rf packages/ui/src/services/zen-zone packages/ui/src/views/components/zen-zone/ZenZone.tsx
```

Expected: `rg -n "IZenZoneService|DesktopZenZoneService|ZenZone" packages/ui/src` returns no matches.

- [ ] **Step 7: Verify UI package**

Run:

```bash
pnpm --filter @univerjs/ui test
pnpm --filter @univerjs/ui typecheck
```

Expected: both commands exit 0.

- [ ] **Step 8: Commit UI cleanup**

Run:

```bash
git add packages/ui
git commit -m "refactor: remove ui zen zone host"
```

Expected: commit succeeds.

---

### Task 3: Remove Core Zen Editor Unit Id

**Files:**

- Modify: `packages/core/src/common/const.ts`
- Modify: `packages/core/src/types/const/const.ts`

- [ ] **Step 1: Remove the core constant**

In `packages/core/src/common/const.ts`, remove:

```ts
export const DOCS_ZEN_EDITOR_UNIT_ID_KEY = `${PREFIX}ZEN_EDITOR`;
```

- [ ] **Step 2: Update sheet editor units**

In `packages/core/src/types/const/const.ts`, change the import from:

```ts
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY } from '../../common/const';
```

to:

```ts
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '../../common/const';
```

Change:

```ts
export const SHEET_EDITOR_UNITS = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];
```

to:

```ts
export const SHEET_EDITOR_UNITS = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];
```

- [ ] **Step 3: Verify core**

Run:

```bash
pnpm --filter @univerjs/core test
pnpm --filter @univerjs/core typecheck
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit core cleanup**

Run:

```bash
git add packages/core
git commit -m "refactor: remove zen editor unit id"
```

Expected: commit succeeds.

---

### Task 4: Remove Simple ZenZone Consumers

**Files:**

- Modify: `packages/sheets-ui/src/services/cell-dropdown-manager.service.ts`
- Modify: `packages/sheets-ui/src/services/__tests__/cell-dropdown-manager.service.spec.ts`
- Modify: `packages/sheets-ui/src/controllers/force-string-alert-render.controller.ts`
- Modify: `packages/sheets-data-validation-ui/src/controllers/dv-alert.controller.ts`
- Modify: `packages/sheets-data-validation-ui/src/controllers/__tests__/dv-alert.controller.spec.ts`
- Modify: `packages/sheets-data-validation-ui/src/services/dropdown-manager.service.ts`
- Modify: `packages/sheets-formula-ui/src/controllers/formula-alert-render.controller.ts`
- Modify: `packages/sheets-formula-ui/src/controllers/__tests__/formula-alert-render.controller.spec.ts`
- Modify: `packages/sheets-note-ui/src/services/sheets-note-popup.service.ts`
- Modify: `packages/sheets-thread-comment-ui/src/services/sheets-thread-comment-popup.service.ts`
- Modify: `packages/sheets-thread-comment-ui/src/services/__tests__/sheets-thread-comment-popup.service.spec.ts`
- Modify: `packages/sheets-thread-comment-ui/src/__tests__/create-thread-comment-ui-test-bed.ts`
- Modify: `packages/sheets-numfmt-ui/src/controllers/numfmt-alert-render.controller.ts`

- [ ] **Step 1: Remove dropdown hard block in sheets-ui**

In `packages/sheets-ui/src/services/cell-dropdown-manager.service.ts`, change:

```ts
import { ComponentManager, IZenZoneService } from '@univerjs/ui';
```

to:

```ts
import { ComponentManager } from '@univerjs/ui';
```

Remove the constructor parameter:

```ts
@IZenZoneService private readonly _zenZoneService: IZenZoneService,
```

Remove this guard from `showDropdown`:

```ts
if (this._zenZoneService.visible) {
    throw new Error('[SheetCellDropdownManagerService]: cannot show dropdown when zen mode is visible');
}
```

In `packages/sheets-ui/src/services/__tests__/cell-dropdown-manager.service.spec.ts`, remove the test case named:

```ts
it('throws when zen mode is visible or popup cannot be attached', () => {
```

Replace it with a test that only verifies the remaining attach failure behavior:

```ts
it('throws when popup cannot be attached', () => {
    const service = new SheetCellDropdownManagerService(
        { attachPopupToCell: vi.fn(() => null) } as any,
        { getRenderById: vi.fn(() => null) } as any,
        { register: vi.fn(() => ({ dispose: vi.fn() })) } as any
    );

    expect(() => service.showDropdown(createParam())).toThrowError('cannot show dropdown');
});
```

Also update the earlier `new SheetCellDropdownManagerService(...)` call in this test file by deleting the second constructor argument `{ visible: false } as any`, because the production service no longer receives `IZenZoneService`.

- [ ] **Step 2: Remove alert cleanup subscriptions**

In each controller below, remove `IZenZoneService` from imports, remove the constructor injection, remove `_initZenService()` calls, and delete the private method that subscribes to `visible$`:

```ts
packages/sheets-ui/src/controllers/force-string-alert-render.controller.ts
packages/sheets-data-validation-ui/src/controllers/dv-alert.controller.ts
packages/sheets-formula-ui/src/controllers/formula-alert-render.controller.ts
packages/sheets-numfmt-ui/src/controllers/numfmt-alert-render.controller.ts
```

The resulting constructors should not mention `IZenZoneService`, and the remaining initialization should continue to call the existing hover/focus/selection setup methods.

- [ ] **Step 3: Remove data-validation dropdown ZenZone dependency**

In `packages/sheets-data-validation-ui/src/services/dropdown-manager.service.ts`, change:

```ts
import { IZenZoneService, KeyCode } from '@univerjs/ui';
```

to:

```ts
import { KeyCode } from '@univerjs/ui';
```

Remove the constructor parameter:

```ts
@IZenZoneService private readonly _zenZoneService: IZenZoneService,
```

Remove the subscription block:

```ts
this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
    if (visible) {
        this.hideDropdown();
    }
}));
```

- [ ] **Step 4: Remove note and thread-comment popup ZenZone dependencies**

In `packages/sheets-note-ui/src/services/sheets-note-popup.service.ts` and `packages/sheets-thread-comment-ui/src/services/sheets-thread-comment-popup.service.ts`, remove `IZenZoneService` imports, constructor injections, `_initZenVisible()` calls, `_initZenVisible()` methods, and guards like:

```ts
if (this._zenZoneService.visible) {
    return;
}
```

Popup display should continue to depend on the existing popup state and attachment logic.

- [ ] **Step 5: Update tests that mention zen mode**

In `packages/sheets-data-validation-ui/src/controllers/__tests__/dv-alert.controller.spec.ts`, rename the zen-mode test description from:

```ts
it('shows an alert for invalid hovered cells and clears it when repeated or zen mode opens', async () => {
```

to:

```ts
it('shows an alert for invalid hovered cells and clears it for repeated hovers', async () => {
```

Delete only the part of the test that toggles a zen visible subject or asserts zen-mode clearing.

In `packages/sheets-formula-ui/src/controllers/__tests__/formula-alert-render.controller.spec.ts`, rename:

```ts
it('shows formula alerts for hovered cells and hides them for repeated hovers or zen mode', async () => {
```

to:

```ts
it('shows formula alerts for hovered cells and hides them for repeated hovers', async () => {
```

Delete only the zen visible setup and assertions.

In `packages/sheets-thread-comment-ui/src/services/__tests__/sheets-thread-comment-popup.service.spec.ts`, delete the test named:

```ts
it('hides the popup when zen mode becomes visible', () => {
```

In `packages/sheets-thread-comment-ui/src/__tests__/create-thread-comment-ui-test-bed.ts`, remove:

```ts
import { IZenZoneService } from '@univerjs/ui';
```

and remove the test-bed dependency registration:

```ts
[IZenZoneService, { useValue: zenZoneService as unknown as IZenZoneService }],
```

Also remove the local `zenZoneService` mock object if it is no longer used.

- [ ] **Step 6: Verify simple consumers**

Run:

```bash
pnpm --filter @univerjs/sheets-ui test
pnpm --filter @univerjs/sheets-ui typecheck
pnpm --filter @univerjs/sheets-data-validation-ui test
pnpm --filter @univerjs/sheets-data-validation-ui typecheck
pnpm --filter @univerjs/sheets-formula-ui test
pnpm --filter @univerjs/sheets-formula-ui typecheck
pnpm --filter @univerjs/sheets-thread-comment-ui test
pnpm --filter @univerjs/sheets-note-ui test
pnpm --filter @univerjs/sheets-numfmt-ui test
pnpm --filter @univerjs/sheets-numfmt-ui typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit simple consumer cleanup**

Run:

```bash
git add packages/sheets-ui packages/sheets-data-validation-ui packages/sheets-formula-ui packages/sheets-thread-comment-ui packages/sheets-note-ui packages/sheets-numfmt-ui
git commit -m "refactor: remove zen mode popup guards"
```

Expected: commit succeeds.

---

### Task 5: Remove Docs And Drawing Zen Unit Branches

**Files:**

- Modify: `packages/docs-ui/src/menu/menu.ts`
- Modify: `packages/docs-ui/src/controllers/render-controllers/doc-contextmenu.render-controller.ts`
- Modify: `packages/docs-ui/src/controllers/render-controllers/doc-resize.render-controller.ts`
- Modify: `packages/docs-drawing-ui/src/menu/image.menu.ts`
- Modify: `packages/docs-drawing-ui/src/controllers/render-controllers/doc-drawing-transform-update.controller.ts`
- Modify: `packages/docs-hyper-link-ui/src/controllers/render-controllers/hyper-link-event.render-controller.ts`
- Modify: `packages/sheets-drawing-ui/src/controllers/sheet-cell-image-copy-paste.controller.ts`
- Modify: `packages/sheets-drawing-ui/src/controllers/sheet-cell-image.controller.ts`

- [ ] **Step 1: Remove docs menu hide-unit arguments**

In `packages/docs-ui/src/menu/menu.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from the import list.

Replace every call like:

```ts
getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY)
```

with:

```ts
getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC)
```

Preserve the other observable in combined menu rules. For example, `HeaderFooterMenuItemFactory` should keep:

```ts
hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getHeaderFooterMenuHiddenObservable(accessor), (one, two) => {
    return one || two;
}),
```

and `TableMenuFactory` should keep:

```ts
hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getInsertTableHiddenObservable(accessor), (one, two) => {
    return one || two;
}),
```

Remove the comment:

```ts
// Do not show header footer menu and insert table at zen mode.
```

- [ ] **Step 2: Remove docs render-controller zen exceptions**

In `packages/docs-ui/src/controllers/render-controllers/doc-contextmenu.render-controller.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and remove branches that compare a unit id to it. Keep normal editor and internal editor behavior intact.

In `packages/docs-ui/src/controllers/render-controllers/doc-resize.render-controller.ts`, change:

```ts
import { Disposable, DOCS_ZEN_EDITOR_UNIT_ID_KEY, fromEventSubject, Inject, isInternalEditorID } from '@univerjs/core';
```

to:

```ts
import { Disposable, fromEventSubject, Inject, isInternalEditorID } from '@univerjs/core';
```

Then change:

```ts
if (isInternalEditorID(unitId) && unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) return this;
```

to:

```ts
if (isInternalEditorID(unitId)) return this;
```

- [ ] **Step 3: Remove docs drawing zen menu and transform branches**

In `packages/docs-drawing-ui/src/menu/image.menu.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and replace:

```ts
getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY)
```

with:

```ts
getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC)
```

In `packages/docs-drawing-ui/src/controllers/render-controllers/doc-drawing-transform-update.controller.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and change:

```ts
if (this._editorService.isEditor(unitId) && unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
```

to:

```ts
if (this._editorService.isEditor(unitId)) {
```

- [ ] **Step 4: Remove docs hyperlink zen branch**

In `packages/docs-hyper-link-ui/src/controllers/render-controllers/hyper-link-event.render-controller.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and change:

```ts
if (this._context.unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY || this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
```

to:

```ts
if (this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
```

- [ ] **Step 5: Remove sheets drawing zen branches**

In `packages/sheets-drawing-ui/src/controllers/sheet-cell-image-copy-paste.controller.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and remove this guard:

```ts
if (docUnitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
```

Replace the block with the code that previously executed inside the guard, so all remaining editor doc ids follow the non-zen path.

In `packages/sheets-drawing-ui/src/controllers/sheet-cell-image.controller.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and delete:

```ts
if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
    this._drawingManagerService.removeDrawingDataForUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    this._docDrawingController.loadDrawingDataForUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    this._drawingManagerService.initializeNotification(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
}
```

- [ ] **Step 6: Verify docs and drawing packages**

Run:

```bash
pnpm --filter @univerjs/docs-ui test
pnpm --filter @univerjs/docs-ui typecheck
pnpm --filter @univerjs/docs-drawing-ui test
pnpm --filter @univerjs/docs-drawing-ui typecheck
pnpm --filter @univerjs/docs-hyper-link-ui test
pnpm --filter @univerjs/sheets-drawing-ui test
pnpm --filter @univerjs/sheets-drawing-ui typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit docs and drawing cleanup**

Run:

```bash
git add packages/docs-ui packages/docs-drawing-ui packages/docs-hyper-link-ui packages/sheets-drawing-ui
git commit -m "refactor: remove zen editor doc branches"
```

Expected: commit succeeds.

---

### Task 6: Remove Sheets Hyperlink Zen Editor Flow

**Files:**

- Modify: `packages/sheets-hyper-link-ui/src/menu/menu.ts`
- Modify: `packages/sheets-hyper-link-ui/src/commands/operations/popup.operations.ts`
- Modify: `packages/sheets-hyper-link-ui/src/commands/operations/__tests__/popup.operations.spec.ts`
- Modify: `packages/sheets-hyper-link-ui/src/services/popup.service.ts`
- Modify: `packages/sheets-hyper-link-ui/src/services/__tests__/popup.service.spec.ts`
- Modify: `packages/sheets-hyper-link-ui/src/controllers/popup.controller.ts`
- Modify: `packages/sheets-hyper-link-ui/src/views/CellLinkEdit/index.tsx`
- Modify: `packages/sheets-hyper-link-ui/src/views/CellLinkPopup/index.tsx`

- [ ] **Step 1: Remove zen-specific menu factories**

In `packages/sheets-hyper-link-ui/src/menu/menu.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports.

Change `getEditingLinkDisable$` from:

```ts
const getEditingLinkDisable$ = (accessor: IAccessor, unitId = DOCS_ZEN_EDITOR_UNIT_ID_KEY) => {
```

to:

```ts
const getEditingLinkDisable$ = (accessor: IAccessor, unitId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY) => {
```

Delete:

```ts
export const genZenEditorMenuId = (id: string) => `${id}-zen-editor`;
```

Delete the exported factory:

```ts
export const zenEditorInsertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        ...linkMenu,
        id: genZenEditorMenuId(linkMenu.commandId),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        disabled$: getEditingLinkDisable$(accessor),
    } as IMenuItem;
};
```

Delete the exported factory:

```ts
export const zenEditorInsertLinkMenuToolbarFactory = (accessor: IAccessor) => {
    return {
        ...linkToolbarMenu,
        id: genZenEditorMenuId(linkToolbarMenu.commandId),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        disabled$: getEditingLinkDisable$(accessor),
    };
};
```

Keep `insertLinkMenuFactory`, `insertLinkMenuToolbarFactory`, and `InsertLinkShortcut`.

- [ ] **Step 2: Remove zen source selection from popup operation**

In `packages/sheets-hyper-link-ui/src/commands/operations/popup.operations.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports.

Change:

```ts
const isZenEditor = univerInstanceService.getFocusedUnit()?.getUnitId() === DOCS_ZEN_EDITOR_UNIT_ID_KEY;
```

and:

```ts
type: isZenEditor ?
    HyperLinkEditSourceType.ZEN_EDITOR :
    HyperLinkEditSourceType.SHEET,
```

to:

```ts
type: HyperLinkEditSourceType.SHEET,
```

Update `packages/sheets-hyper-link-ui/src/commands/operations/__tests__/popup.operations.spec.ts` by removing the import of `DOCS_ZEN_EDITOR_UNIT_ID_KEY` and deleting the assertion that calls:

```ts
InsertHyperLinkOperation.handler(createInsertAccessor(false, DOCS_ZEN_EDITOR_UNIT_ID_KEY))
```

- [ ] **Step 3: Remove ZenZone and zen document routing from popup service**

In `packages/sheets-hyper-link-ui/src/services/popup.service.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` and `IZenZoneService` from imports and remove the constructor parameter:

```ts
@IZenZoneService private readonly _zenZoneService: IZenZoneService
```

Delete the guard:

```ts
if (location.type !== HyperLinkEditSourceType.ZEN_EDITOR && this._zenZoneService.visible) {
    return;
}
```

Delete branches that fetch or mutate:

```ts
DOCS_ZEN_EDITOR_UNIT_ID_KEY
```

Keep the existing `HyperLinkEditSourceType.EDITING` branch and the existing sheet branch. After this edit, `startAddEditing` should have exactly two branches: `type === HyperLinkEditSourceType.EDITING` and the final sheet branch. `startEditing` should also have exactly two branches: `type === HyperLinkEditSourceType.EDITING` and the final sheet branch.

- [ ] **Step 4: Remove zen rendering branch from popup controller**

In `packages/sheets-hyper-link-ui/src/controllers/popup.controller.ts`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` and `IZenZoneService` from imports and remove the constructor injection:

```ts
@IZenZoneService private readonly _zenZoneService: IZenZoneService
```

Delete the `visible$` subscription that reacts to zen mode. Remove render lookup code that exists only for the zen editor:

```ts
const render = id === DOCS_ZEN_EDITOR_UNIT_ID_KEY ? this._renderManagerService.getRenderById(id) : null;
```

The file should not contain any `DOCS_ZEN_EDITOR_UNIT_ID_KEY` comparison after this step.

- [ ] **Step 5: Remove zen behavior from CellLinkEdit**

In `packages/sheets-hyper-link-ui/src/views/CellLinkEdit/index.tsx`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` from imports and remove `IZenZoneService` from the `@univerjs/ui` import.

Delete:

```ts
const zenZoneService = useDependency(IZenZoneService);
```

Replace render selection logic like:

```ts
const render = location.type === HyperLinkEditSourceType.ZEN_EDITOR ?
    renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY) :
    renderManagerService.getRenderById(location.unitId);
```

with:

```ts
const render = renderManagerService.getRenderById(location.unitId);
```

Delete interactions that call:

```ts
zenZoneService.hide();
zenZoneService.show();
```

Delete selection refresh logic that targets:

```ts
DOCS_ZEN_EDITOR_UNIT_ID_KEY
```

Keep the existing link-edit form behavior for sheet and normal editor sources.

- [ ] **Step 6: Remove zen behavior from CellLinkPopup**

In `packages/sheets-hyper-link-ui/src/views/CellLinkPopup/index.tsx`, remove `DOCS_ZEN_EDITOR_UNIT_ID_KEY` and `IZenZoneService` from imports.

Delete:

```ts
const zenZoneService = useDependency(IZenZoneService);
```

Delete:

```ts
if (zenZoneService.visible) {
```

Remove the enclosing zen-mode branch and keep the non-zen click behavior that opens or edits links from the current popup location. Remove document access that targets:

```ts
DOCS_ZEN_EDITOR_UNIT_ID_KEY
```

- [ ] **Step 7: Update popup service tests**

In `packages/sheets-hyper-link-ui/src/services/__tests__/popup.service.spec.ts`, remove imports and mock behavior for `DOCS_ZEN_EDITOR_UNIT_ID_KEY`.

Rename:

```ts
it('routes popups by source type and blocks sheet popups while zen mode is visible', () => {
```

to:

```ts
it('routes popups by source type', () => {
```

Delete assertions that expect service calls with:

```ts
DOCS_ZEN_EDITOR_UNIT_ID_KEY
```

Keep assertions for sheet popup routing and normal document editor routing.

- [ ] **Step 8: Verify sheets hyperlink UI**

Run:

```bash
pnpm --filter @univerjs/sheets-hyper-link-ui test
pnpm --filter @univerjs/sheets-hyper-link-ui typecheck
```

Expected: both commands exit 0.

- [ ] **Step 9: Commit hyperlink cleanup**

Run:

```bash
git add packages/sheets-hyper-link-ui
git commit -m "refactor: remove zen editor hyperlink flow"
```

Expected: commit succeeds.

---

### Task 7: Final Residual Scan And Repository Verification

**Files:**

- Modify only files with remaining active zen-editor references found by the scans below.

- [ ] **Step 1: Run active-source residual scan**

Run:

```bash
rg -n "sheets-zen-editor|UniverSheetsZenEditorPlugin|IZenZoneService|DesktopZenZoneService|DOCS_ZEN_EDITOR_UNIT_ID_KEY|zen mode|zen-editor|ZenZone" packages examples common/mockdata package.json pnpm-workspace.yaml pnpm-lock.yaml --glob '!packages/sheets-zen-editor/**'
```

Expected: no matches.

This command intentionally excludes `CHANGELOG.md`; expected output is empty. If output is not empty, remove every reported active-source or package metadata reference before continuing.

- [ ] **Step 2: Run TypeScript checks for affected workspaces**

Run:

```bash
pnpm --filter @univerjs/core typecheck
pnpm --filter @univerjs/ui typecheck
pnpm --filter @univerjs/sheets-ui typecheck
pnpm --filter @univerjs/sheets-hyper-link-ui typecheck
pnpm --filter @univerjs/sheets-data-validation-ui typecheck
pnpm --filter @univerjs/sheets-formula-ui typecheck
pnpm --filter @univerjs/sheets-numfmt-ui typecheck
pnpm --filter @univerjs/docs-ui typecheck
pnpm --filter @univerjs/docs-drawing-ui typecheck
pnpm --filter @univerjs/sheets-drawing-ui typecheck
pnpm --filter univer-examples typecheck
```

Expected: every command exits 0.

- [ ] **Step 3: Run targeted tests**

Run:

```bash
pnpm --filter @univerjs/core test
pnpm --filter @univerjs/ui test
pnpm --filter @univerjs/sheets-ui test
pnpm --filter @univerjs/sheets-hyper-link-ui test
pnpm --filter @univerjs/sheets-data-validation-ui test
pnpm --filter @univerjs/sheets-formula-ui test
pnpm --filter @univerjs/sheets-thread-comment-ui test
pnpm --filter @univerjs/sheets-note-ui test
pnpm --filter @univerjs/sheets-numfmt-ui test
pnpm --filter @univerjs/docs-ui test
pnpm --filter @univerjs/docs-drawing-ui test
pnpm --filter @univerjs/sheets-drawing-ui test
```

Expected: every command exits 0.

- [ ] **Step 4: Run example build check**

Run:

```bash
pnpm --filter univer-examples build:demo
```

Expected: command exits 0 and no bundle output references `@univerjs/sheets-zen-editor`.

- [ ] **Step 5: Run full lint on changed files**

Run:

```bash
pnpm lint
```

Expected: command exits 0.

- [ ] **Step 6: Commit final cleanup if needed**

When residual fixes were made after prior task commits, run:

```bash
git add packages examples common/mockdata pnpm-lock.yaml
git commit -m "chore: finish zen editor removal"
```

Expected: commit succeeds. When no residual fixes were needed, `git status --short` is clean and this commit step is skipped.

---

## Completion Criteria

- `packages/sheets-zen-editor` does not exist.
- `pnpm-lock.yaml` has no `@univerjs/sheets-zen-editor` importer.
- Active source and package metadata have no matches for removed zen-editor identifiers.
- Normal cell editor and formula bar editor ids remain in `SHEET_EDITOR_UNITS`.
- Affected package tests and typechecks pass.
- Example typecheck and demo build pass.
- The final worktree is clean after the planned commits.
