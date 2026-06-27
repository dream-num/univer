# Embed Block Regression Standard

This document defines the regression gate for embed blocks across Univer hosts and child products.

The goal is not only "the block is visible". A case passes only when the block can be activated, edited, opened fullscreen when applicable, use its ribbon and secondary menus, and return to the host without corrupting focus or lifecycle state.

## Scope

The standard covers embed blocks rendered in:

- Docs host
- Sheets host
- Slides host
- Bases host

And child products:

- Sheet
- Doc
- Slide
- Base

Current demos expose 19 cases. The core matrix is 18 cases, plus the extra same-host `sheets-floating-sheet` case.

## Demo Entrypoints

Use the local demo server:

```text
http://local.univer.plus:3013/docs-embed-local/?autorun=false
http://local.univer.plus:3013/sheets-embed-local/?table=tbl-projects&view=view-grid&autorun=false
http://local.univer.plus:3013/slides-embed-local/?autorun=false
http://local.univer.plus:3013/bases-embed-local/?autorun=false
```

The demo helper should be used to isolate a case:

```ts
window.runEmbedDemoCases([embedId], { activate: false });
window.runEmbedDemoCases([embedId], { activate: true });
```

Use `activate: false` for float cases and `activate: true` for tab/list cases.

## Case Matrix

### Docs Host

| Case | Mode | Child | Required checks |
| --- | --- | --- | --- |
| `docs-custom-block-sheet` | float/custom block | Sheet | visible, focus, edit, ribbon/menu, secondary menu |
| `docs-custom-block-base` | float/custom block | Base | visible, focus, edit, ribbon/menu, secondary menu |
| `docs-custom-block-slide` | float/custom block | Slide | visible, focus, edit, ribbon/menu, secondary menu |

### Sheets Host

| Case | Mode | Child | Required checks |
| --- | --- | --- | --- |
| `sheets-floating-doc` | float | Doc | visible, stage2, fullscreen, edit, ribbon/menu, secondary menu |
| `sheets-floating-slide` | float | Slide | visible, stage2, fullscreen, edit, ribbon/menu, secondary menu |
| `sheets-floating-base` | float | Base | visible, stage2, fullscreen, edit, ribbon/menu, secondary menu |
| `sheets-floating-sheet` | float | Sheet | visible preview, stage2, fullscreen, edit, ribbon/menu, secondary menu, re-enter without freeze |
| `sheets-tab-base` | sheet tab | Base | tab activation, ribbon/menu override, edit, secondary menu |
| `sheets-tab-doc` | sheet tab | Doc | tab activation, ribbon/menu override, edit, secondary menu |
| `sheets-tab-slide` | sheet tab | Slide | tab activation, ribbon/menu override, edit, secondary menu |

### Slides Host

| Case | Mode | Child | Required checks |
| --- | --- | --- | --- |
| `slides-floating-sheet` | float | Sheet | visible, stage2, fullscreen, edit, ribbon/menu, secondary menu |
| `slides-floating-base` | float | Base | visible, stage2, fullscreen, edit, ribbon/menu, secondary menu |
| `slides-floating-doc` | float | Doc | visible, stage2, fullscreen, edit, ribbon/menu, secondary menu |
| `slides-page-list-sheet` | page-list tab | Sheet | tab activation, ribbon/menu override, edit, secondary menu |
| `slides-page-list-base` | page-list tab | Base | tab activation, ribbon/menu override, edit, secondary menu |
| `slides-page-list-doc` | page-list tab | Doc | tab activation, ribbon/menu override, edit, secondary menu |

### Bases Host

| Case | Mode | Child | Required checks |
| --- | --- | --- | --- |
| `bases-table-list-sheet` | table-list tab | Sheet | tab activation, ribbon/menu override, edit, secondary menu |
| `bases-table-list-doc` | table-list tab | Doc | tab activation, ribbon/menu override, edit, secondary menu |
| `bases-table-list-slide` | table-list tab | Slide | tab activation, ribbon/menu override, edit, secondary menu |

## Pass Criteria

### 1. Visibility And Placement

A case passes visibility when:

- The expected embed descriptor exists.
- The block is visible in the host surface, or the tab/list entry is visible in the host navigation surface.
- For float cases, the visible block has a non-zero rect.
- For tab/list cases, the host navigation item is visible and the child runtime surface is visible after activation.
- For stage2-only same-host cases such as `sheets-floating-sheet`, inactive state may use a canvas preview, but the preview must be visible and positioned with the host container.
- Scrolling the host does not leave the content and transformer/chrome at different positions.

Fail if:

- Only the placeholder container is visible.
- The block becomes transparent with no readable preview or runtime content.
- The block disappears after focus moves to the child unit.
- The block is rendered on the wrong worksheet/page/table after host tab switching.
- A tab/list case activates the child but leaves the host navigation item visually missing.

### 2. Float Activation And Focus

Float cases must support:

1. Inactive or preview state.
2. Stage1 selection state.
3. Stage2 edit state.
4. Exit stage2.
5. Re-enter stage2.

Expected runtime evidence:

- `window.getEmbedDiagnostics().focusOwner.embedId` matches the case after activation.
- `mountSessions` does not grow unexpectedly after repeated activate/exit cycles.
- No stale child injector is accessed after exit.

Fail if:

- A second entry into stage2 freezes the page.
- Focus remains on the previous child.
- The host ribbon is shown while the child is active.
- The child ribbon is still shown after leaving the block.

### 3. Tab/List Activation And Focus

Tab/list cases are not selected by transformer handles. They are activated through a host navigation entry:

- Sheet host uses workbook sheet tabs.
- Slide host uses the page-list block area.
- Base host uses the table-list block area.

Tab/list cases must support:

1. Creating or restoring the host navigation entry.
2. Activating the tab/list block.
3. Mounting the child runtime surface.
4. Focusing the child product.
5. Applying child ribbon/menu override immediately.
6. Returning focus to the host.
7. Re-activating the same child.
8. Switching to a different embed tab/list entry.
9. Switching back to the original entry.

Expected runtime evidence:

- `window.getEmbedDiagnostics().focusOwner.embedId` matches the active tab/list case.
- `window.getEmbedDiagnostics().menuOverride.embedId` matches the active tab/list case.
- `window.getEmbedDiagnostics().menuOverride.reason` is `tab-active` or the equivalent tab/list activation reason.
- The host navigation selection matches the active embed.
- The child unit is mounted once and retained according to the expected lifecycle policy.
- Leaving the tab/list case clears the override or replaces it with the newly active case.

Fail if:

- Activating a tab/list entry changes the visible page but not the ribbon.
- The ribbon only changes after clicking inside the child surface.
- The previous tab/list child still owns focus after switching entries.
- Switching host worksheet/page/table hides the embed entry permanently.
- Returning to the tab/list entry remounts repeatedly and loses state.
- A disposed child injector handles menu commands after the tab/list case is no longer active.

### 4. Ribbon

The ribbon must follow the active child product.

Expected behavior:

- Sheet child shows sheet ribbon/menu behavior.
- Doc child shows doc ribbon/menu behavior.
- Slide child shows slide ribbon/menu behavior.
- Base child shows base view/table controls.
- Switching between embed cases updates the ribbon without requiring an extra click inside the child.
- Exiting the block restores the host ribbon.
- For tab/list cases, activating the tab/list entry must update the ribbon even before any pointer event inside the child runtime.
- For float cases, entering stage2 must update the ribbon.

Fail if:

- The ribbon remains on the previous child.
- Base fullscreen shows the wrong non-view menu.
- Slide host menus or thumbnails disappear after switching to another block and back.
- The ribbon is only corrected after clicking inside the child runtime.

### 5. Float Fullscreen

Every float block that exposes fullscreen must support:

1. Enter fullscreen.
2. Use ribbon.
3. Open at least one secondary menu.
4. Perform the child product's minimal edit action.
5. Exit fullscreen.
6. Continue interacting with the host.

Fail if:

- Fullscreen hides the bottom sheet tab bar for a sheet child.
- Fullscreen prevents secondary menus from opening.
- The fullscreen close button blocks child menus.
- Exiting fullscreen changes the host anchor size or position unexpectedly.

### 6. Tab/List Host Navigation

Tab/list cases must preserve both host navigation and child interaction.

Required host navigation checks:

| Host | Tab/list surface | Required checks |
| --- | --- | --- |
| Sheets | bottom sheet tabs | embed sheet tabs appear, can be selected, can switch to normal sheets and back, child runtime remains usable |
| Slides | left page list | embed page-list entries appear, can be selected, thumbnails/slide menu remain visible, can switch pages and back |
| Bases | table list | embed table-list entries appear, can be selected, view/table controls remain visible, can switch tables and back |

Required child checks after activation:

- The child ribbon/menu is shown.
- A child secondary menu can open.
- The child minimal edit probe works.
- Scrolling inside the child does not scroll the wrong host surface unless the product intentionally delegates that scroll.
- Returning to the host navigation and selecting another entry does not dispose the active child too early.

Fail if:

- The host tab/list panel disappears.
- The active child covers the host navigation permanently.
- Sheet child fullscreen or tab mode hides the bottom sheet tabs.
- Slide child activation hides thumbnails or slide page navigation.
- Base child activation shows the wrong view menu or loses the view tab.
- The child scroll container cannot scroll because the host intercepts the wheel event.

### 7. Menus And Secondary Panels

Each active child product must open at least one secondary menu or panel.

Recommended menu probes:

| Child | Probe |
| --- | --- |
| Sheet | Font family, format dropdown, insert/menu dropdown, or toolbar popup |
| Doc | Font/style dropdown, insert menu, or text format popup |
| Slide | Play dropdown, insert menu, page/object menu, or toolbar popup |
| Base | View selector, field/menu dropdown, filter, sort, or view configuration panel |

Expected behavior:

- The popup appears above the fullscreen/container layer.
- The popup is clickable.
- Closing the popup leaves the block interactive.
- Popup z-index does not require a global `9999` escape hatch unless documented.

Fail if:

- The popup is inserted but hidden behind the float block.
- The popup appears under the fullscreen backdrop.
- The popup opens on the host product instead of the child product.
- Clicking a menu throws a command-not-registered error.

### 8. Editing

Each child product needs a minimal edit probe.

| Child | Minimal edit probe | Pass condition |
| --- | --- | --- |
| Sheet | Select a cell, type a short value, press Enter | Cell shows the new value and focus remains usable |
| Doc | Enter text editing, insert a short string | Text appears and cursor/editor remains responsive |
| Slide | Select a text shape or insert/edit a simple object | Slide content changes or expected insert UI opens |
| Base | Edit a visible cell/record field or open a view operation | Value changes or operation UI opens without losing focus |

Fail if:

- The block can be selected but child content cannot receive input.
- Keyboard input goes to the host instead of the child.
- Editing succeeds once but fails after exit/re-enter.
- Editing triggers missing child commands, such as unregistered slide insert commands.

### 9. Lifecycle And Stability

Run these lifecycle checks for every case:

1. Activate.
2. Open secondary menu.
3. Edit.
4. Exit.
5. Re-activate.
6. Switch to another host tab/page/sheet/table.
7. Switch back.
8. Scroll the host container.
9. Repeat the activation check.

No case may emit these errors:

```text
InjectorAlreadyDisposedError
command "... " is not registered
Maximum call stack size exceeded
ResizeObserver loop completed with undelivered notifications
Cannot read properties of undefined
Cannot access injector after disposed
```

The exact browser console message may differ, but any error in this family is a regression until investigated.

## Mode-Specific Checklists

### Float Mode Checklist

```text
[ ] Block appears in the host canvas/content surface.
[ ] Transformer appears in stage1 and follows resize/move.
[ ] Transformer is hidden or de-emphasized during active drag if required by UX.
[ ] Content, chrome, transformer, and preview stay aligned during host scroll.
[ ] First click enters stage1 or selects the block.
[ ] Second click or direct activation enters stage2.
[ ] Child ribbon appears in stage2.
[ ] Child secondary menu opens above the block/fullscreen layer.
[ ] Child minimal edit works.
[ ] Fullscreen enters and exits.
[ ] Fullscreen preserves child ribbon, menus, and editing.
[ ] Exit returns to host without losing the block.
[ ] Re-enter stage2 works without freeze.
```

### Tab/List Mode Checklist

```text
[ ] Host navigation entry exists.
[ ] Host navigation entry is selected after activation.
[ ] Child runtime surface is visible after activation.
[ ] Child focusOwner matches the active embed id.
[ ] menuOverride matches the active embed id.
[ ] Ribbon changes to the child product immediately.
[ ] Child secondary menu opens.
[ ] Child minimal edit works.
[ ] Switch to another host tab/page/table works.
[ ] Switch back to the embed tab/list entry works.
[ ] Child state is retained when expected.
[ ] Previous child focus/menu override is cleared or replaced.
[ ] Host navigation remains visible and clickable.
[ ] No disposed injector receives menu or command calls.
```

### Sheet Host Tab Probe

Applies to:

- `sheets-tab-base`
- `sheets-tab-doc`
- `sheets-tab-slide`

Required sequence:

1. Run the case with `activate: true`.
2. Confirm the embed tab exists in the bottom sheet tab bar.
3. Confirm the embed tab is selected.
4. Confirm the child runtime is visible in the sheet content area.
5. Confirm `focusOwner.embedId` equals the case id.
6. Confirm `menuOverride.embedId` equals the case id.
7. Confirm the ribbon matches the child product.
8. Open one child secondary menu.
9. Perform the child minimal edit probe.
10. Click a normal workbook sheet tab.
11. Confirm the host sheet ribbon returns.
12. Click the embed tab again.
13. Confirm the child ribbon returns without an extra click inside the child.
14. Confirm the child can still open a secondary menu and edit.

Fail if:

- Bottom sheet tabs disappear.
- The embed tab selection and `menuOverride` disagree.
- The child surface is visible but the sheet host still owns the ribbon.
- Switching to another worksheet leaves the child menu override active.
- Switching back creates a new child runtime unnecessarily and loses state.

### Slide Host Page-List Probe

Applies to:

- `slides-page-list-sheet`
- `slides-page-list-base`
- `slides-page-list-doc`

Required sequence:

1. Run the case with `activate: true`.
2. Confirm the embed page-list entry exists.
3. Confirm the page-list entry is selected.
4. Confirm slide thumbnails/page navigation remain visible.
5. Confirm the child runtime is visible in the slide content area.
6. Confirm `focusOwner.embedId` equals the case id.
7. Confirm `menuOverride.embedId` equals the case id.
8. Confirm the ribbon matches the child product.
9. Open one child secondary menu.
10. Perform the child minimal edit probe.
11. Select a normal slide/page.
12. Confirm the slide host ribbon and thumbnails remain usable.
13. Select the embed page-list entry again.
14. Confirm child ribbon, menu, and edit still work.

Fail if:

- Slide thumbnails disappear.
- The slide host occupies the full screen until an extra click.
- The child ribbon appears only after clicking inside the child runtime.
- The previous child keeps focus after another page is selected.
- Slide insert/page commands are missing after activation.

### Base Host Table-List Probe

Applies to:

- `bases-table-list-sheet`
- `bases-table-list-doc`
- `bases-table-list-slide`

Required sequence:

1. Run the case with `activate: true`.
2. Confirm the embed table/list entry exists.
3. Confirm the table/list entry is selected.
4. Confirm base table/view navigation remains visible.
5. Confirm the child runtime is visible in the base content area.
6. Confirm `focusOwner.embedId` equals the case id.
7. Confirm `menuOverride.embedId` equals the case id.
8. Confirm the ribbon matches the child product, not the base host.
9. Open one child secondary menu.
10. Perform the child minimal edit probe.
11. Select a normal base table/view.
12. Confirm base host controls return.
13. Select the embed table/list entry again.
14. Confirm child ribbon, menu, and edit still work.

Fail if:

- Base table/list navigation disappears.
- The active child covers base navigation permanently.
- The base host view tab is shown while a non-base child owns focus.
- Returning to a table/list embed accesses a disposed injector.
- Base view controls are visually present but unclickable due to overlay layering.

## Special Cases

### `sheets-floating-sheet`

This is same-host sheet-in-sheet and must be treated as high risk.

Requirements:

- Inactive state may defer runtime mounting, but must show a preview.
- Preview must track host scroll and anchor position.
- Stage2 must mount the child runtime only once.
- Exit stage2 must unmount or deactivate safely.
- A second entry into stage2 must not freeze the sheet host.
- The child sheet must keep its intended initial size. It must not shrink merely because it is embedded.

### `sheet@doc` And `base@doc`

These cases may have document-specific layout behavior.

Requirements:

- Fit-to-width must not break horizontal child scrolling.
- Page layout must remain visible and scrollable.
- Host doc scrolling must not detach the block chrome/menu from the content.

## Recommended Automated Gate

The automated gate should produce one row per case:

```ts
interface EmbedRegressionResult {
    id: string;
    host: 'docs' | 'sheets' | 'slides' | 'bases';
    child: 'sheet' | 'doc' | 'slide' | 'base';
    mode: 'float' | 'tab' | 'custom-block' | 'page-list' | 'table-list';
    visible: boolean;
    activated: boolean;
    focusOwnerCorrect: boolean;
    menuOverrideCorrect?: boolean;
    ribbonCorrect: boolean;
    hostNavigationVisible?: boolean;
    hostNavigationSelected?: boolean;
    fullscreen?: boolean;
    secondaryMenu: boolean;
    edit: boolean;
    exit: boolean;
    reenter: boolean;
    switchAwayBack: boolean;
    scrollStable: boolean;
    consoleErrors: string[];
    screenshot?: string;
}
```

The gate passes only when:

- Every row has `visible === true`.
- Every row has `activated === true`.
- Every row has `focusOwnerCorrect === true`.
- Every row has `ribbonCorrect === true`.
- Every row has `secondaryMenu === true`.
- Every row has `edit === true`.
- Every row has `exit === true`.
- Every row has `reenter === true`.
- Every row has `switchAwayBack === true`.
- Every row has `scrollStable === true`.
- `consoleErrors.length === 0`.
- Every float row with fullscreen support has `fullscreen === true`.
- Every tab/page-list/table-list row has `menuOverrideCorrect === true`.
- Every tab/page-list/table-list row has `hostNavigationVisible === true`.
- Every tab/page-list/table-list row has `hostNavigationSelected === true` after activation.

On failure, capture:

- Screenshot before activation.
- Screenshot after activation.
- Screenshot after menu open.
- Screenshot after edit.
- Console log.
- `window.getEmbedDiagnostics()`.
- `window.getEmbedRuntimeState()`.
- The selected host worksheet/page/table id.
- The active child unit id.

## Manual Smoke Checklist

Use this checklist before merging changes that touch embed, float DOM, ribbon override, fullscreen, drawing DOM, host lifecycle, or child runtime scope.

```text
[ ] All 19 current demo cases were run.
[ ] All core 18 cross-product cases passed.
[ ] Ribbon follows the active child product.
[ ] Float blocks can enter and exit fullscreen.
[ ] Fullscreen menus and secondary panels are clickable.
[ ] Float blocks can enter stage2, exit, and re-enter stage2.
[ ] Tab/list entries are visible in host navigation.
[ ] Tab/list entries activate child focus and child ribbon immediately.
[ ] Tab/list menuOverride is correct for each active case.
[ ] Tab/list entries can switch away and back without remount loops.
[ ] Sheet host bottom tabs remain visible and clickable.
[ ] Slide host thumbnails/page-list remain visible and clickable.
[ ] Base host table/view navigation remains visible and clickable.
[ ] Child editing works for sheet/doc/slide/base.
[ ] Host tab/page/sheet switching does not hide menus or blocks.
[ ] Host scrolling keeps content, chrome, transformer, and preview aligned.
[ ] Child scrolling does not get intercepted by the wrong host container.
[ ] No console errors were emitted.
[ ] `sheets-floating-sheet` was tested separately for re-entry and freeze.
```

## Current Supporting Unit Tests

Relevant focused test commands:

```bash
./node_modules/.bin/vitest run --config packages/sheets-drawing-ui/vitest.config.ts \
  packages/sheets-drawing-ui/src/services/__tests__/canvas-float-dom-manager.service.spec.ts \
  packages/sheets-drawing-ui/src/embed/floating-host \
  packages/sheets-ui/src/embed-floating-anchor.spec.ts \
  packages/sheets-ui/src/embed-host-adapter.spec.ts \
  packages/sheets-ui/src/embed-register.spec.ts

./node_modules/.bin/vitest run --config packages/embed-ui/vitest.config.ts \
  packages/embed-ui/src/services/__tests__/embed-activation.service.spec.ts \
  packages/embed-ui/src/services/__tests__/embed-child-unit-scoped-injector.spec.ts \
  packages/embed-ui/src/services/__tests__/embed-floating-active.service.spec.ts \
  packages/embed-ui/src/services/__tests__/embed-ui-small-services.spec.ts
```

Unit tests do not replace the browser matrix. The browser matrix is required because ribbon ownership, popup z-index, fullscreen layering, nested injectors, and child editing all depend on runtime DOM behavior.
