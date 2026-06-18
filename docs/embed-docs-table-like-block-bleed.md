# Docs Table-like Embed Block Bleed Spec

## Background

When Sheets or Bases is embedded as a floating/custom block in Docs, the block should behave like a Docs table instead of a normal fixed-width DOM card. The default visual position aligns with the Docs body text, but wide table-like content can bleed horizontally toward the document viewport so users can inspect more columns without changing the page content width.

This spec applies only to table-like child products embedded in a Docs host:

- `sheet@doc` in float/custom-block mode.
- `base@doc` in float/custom-block mode.

It does not apply to `doc@doc`, `slide@doc`, tab-mode embeds, or floating embeds in Sheets/Slides/Bases hosts. Those products keep their own fit-to-width, fixed-ratio, or product-specific viewport policies.

## Goals

- Match the mental model of Docs table overflow.
- Keep the normal block left edge aligned with the Docs body text.
- Allow horizontal bleed only when content is wider than the Docs body content width.
- Size the Docs block height from the embedded table's actual content height.
- Keep table headers and table-local menus reachable while scrolling.
- Keep the behavior product-driven: Sheets and Bases provide content dimensions; Docs host owns line layout, bleed boundary, and scroll containment.

## Non-goals

- Do not change resource protocol or embed descriptor shape.
- Do not persist transient scroll offsets in embed resources.
- Do not make every Docs custom block bleed. Only table-like child products opt in.
- Do not replace the child product's own menu or command implementation.

## Layout Model

### Width

The Docs line layout receives an authoritative child content width from the embed content-size provider.

For Sheets:

- Width is based on the active worksheet used range.
- Include row header width unless the row header is hidden.
- Include visible columns from column `0` through `dataRange.endColumn`.
- Fall back to worksheet column count only when data range is unavailable.

For Bases:

- Width is based on the active table/view snapshot.
- Include row header width.
- Include visible field widths.
- Include the add-field affordance column.

At rest, the block is positioned at the same left edge as normal Docs body content. The block does not consume page width beyond the Docs body width during document layout.

### Horizontal Bleed

The live embedded viewport can bleed horizontally inside the Docs visual/clipping viewport:

- Right boundary: at most `viewportRight - 10px`.
- Left boundary while scrolled: at most `viewportLeft + 10px`.
- Default state: left edge remains aligned to the Docs body text.
- If child content width is less than or equal to available body width, no horizontal overflow is needed.
- If child content width exceeds available body width, the visible viewport extends to the right bleed boundary first.
- Any remaining width is reachable by horizontal scrolling.
- During horizontal scroll, the rendered table content can move left and visually break the body text boundary, but it must not pass the left bleed boundary.

The host computes bleed against the nearest clipping ancestor. If no clipping ancestor exists, the browser viewport is used.

### Height

The Docs block height is driven by the child product's actual content height.

For Sheets:

- Height is based on the active worksheet used range.
- Include column header height unless hidden.
- Include visible rows from row `0` through `dataRange.endRow`.
- Fall back to worksheet row count only when data range is unavailable.

For Bases:

- Height is based on the active table/view snapshot.
- Include grid header height.
- Include visible record rows with the current view row height.
- Include add-record row and summary/footer row.

The default block has no vertical scrollbar. If the measured content height exceeds the maximum allowed table-like embed height, clamp the viewport height and enable vertical scrolling.

The maximum height should be derived from the Docs visual viewport height, not the page content width. This keeps very large tables inspectable without forcing a single Docs page line to become unbounded.

## Scrolling

Table-like Docs embeds own wheel scrolling while the pointer is inside the block, including inactive and non-editing states.

- Horizontal trackpad delta scrolls horizontally when horizontal overflow exists.
- `Shift + wheel` maps vertical wheel delta to horizontal scroll.
- Vertical wheel scrolls the embedded table only when vertical overflow exists.
- If the embedded table cannot scroll in the wheel direction, the event should fall through to Docs scroll chaining.
- `Ctrl/meta + wheel` is reserved for browser/host zoom and must not be captured by the embed block.

Scroll state is runtime view state. It can be cached by the preview/runtime service, but it is not written into the embed resource.

## Sticky Regions

When vertical scrolling is enabled:

- Sheets column headers remain sticky at the top of the embed viewport.
- Sheets frozen rows/columns should remain sticky if the child renderer supports them inside the embed runtime.
- Bases view/menu/header regions remain sticky at the top of the embed viewport.
- Bases row headers or record index affordances remain aligned with the scrolled body.

If sticky frozen regions require product-specific canvas/runtime support, the child product owns that implementation. The Docs host only provides the viewport and scroll container.

## Ownership

### Docs Host

Docs host owns:

- Custom block line layout.
- Body-text alignment.
- Bleed boundary calculation.
- Scroll containment and scroll chaining.
- Triggering Docs line relayout when child content size changes.

Docs host must not hard-code Sheets or Bases command/menu logic.

### Child Product

Sheets and Bases own:

- Authoritative content width and height measurement.
- Product rendering inside the embed runtime.
- Sticky headers and frozen regions inside their own runtime.
- Product menus and commands.
- Runtime state such as active cell, active view, selection, and edit state.

### Embed UI

`@univerjs/embed-ui` owns:

- Generic float/custom-block mounting.
- Runtime slots for content, canvas, overlay, and popup roots.
- Stage activation and passive wheel handoff.
- Fullscreen lifecycle and remounting.
- Generic menu contribution registration, without product-specific command lists.

## Runtime Flow

1. Host loads embed descriptors from `@univerjs/embed` resource.
2. Child product registers an `EmbedContentSizeProvider`.
3. Docs custom block renderer requests content size from the provider through the embed content-size registry.
4. Docs skeleton/layout uses the measured height and width for line layout.
5. The DOM runtime computes the bleed viewport from the actual Docs clipping bounds.
6. The child runtime is mounted inside the bleed-aware viewport.
7. Wheel events scroll the embedded viewport when possible and otherwise chain back to Docs.
8. Child mutations that affect content size schedule a Docs relayout.

## Acceptance Criteria

- `sheet@doc` and `base@doc` align with Docs body text when not horizontally scrolled.
- Wide `sheet@doc` and `base@doc` can bleed right to `viewportRight - 10px`.
- Wide `sheet@doc` and `base@doc` can scroll left until the content reaches `viewportLeft + 10px`.
- Normal Docs content width is not expanded by the embedded table.
- `sheet@doc` height matches visible used-range rows by default.
- `base@doc` height matches visible records by default.
- Large table-like embeds clamp to Docs viewport height and scroll internally.
- Wheel/trackpad scrolling works before the block enters editing/active stage.
- Host scrolling still works when the embedded viewport cannot consume the wheel delta.
- Menus, popups, editors, and overlays render in the embed runtime popup/overlay slots and are not clipped by the wrong host container.

## Current Implementation Notes

- `docs-ui/src/embed-docs-custom-block-bleed.ts` computes the bleed viewport.
- `docs-ui/src/embed-docs-custom-block-scroll.ts` handles table-like live viewport wheel scrolling.
- `docs-ui/src/embed-docs-custom-block-renderer.tsx` wires bleed CSS variables and passive wheel behavior.
- `sheets-ui/src/embed-content-size.ts` measures active worksheet used range for Sheets child blocks.
- `bases-ui/src/embed-content-size.ts` measures table/view snapshot dimensions for Bases child blocks.

## Open Items

- Confirm the maximum table-like block height constant against product design.
- Verify sticky frozen rows/columns for embedded Sheets once the child runtime is mounted in a Docs scroll container.
- Verify Bases view header stickiness across grid/list/calendar/gallery views.
- Add browser-level regression coverage for scroll chaining and bleed limits.
