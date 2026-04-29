# Unit contract: OOXML → Univer

This package converts between two unrelated unit systems. Mixing them up is
the root cause of every page-size / line-spacing / font-size regression we've
hit so far. **Read this before touching any numeric field.**

## OOXML side (source)

Defined by ECMA-376 §17 — these are physical and never change.

| Unit            | Definition                  | Used by                                      |
| --------------- | --------------------------- | -------------------------------------------- |
| `dxa`           | 1/20 of a point             | `w:pgSz/@w`, `w:pgMar/@*`, `w:spacing/@*`, `w:ind/@*`, `w:tblW`, `w:gridCol/@w`, `w:trHeight/@val`, `w:tcMar/@*`, `w:docGrid/@linePitch` |
| `hp` (half-pt)  | 1/2 of a point              | `w:sz`, `w:szCs` (font size)                 |
| `pct`           | percent (varies by element) | `w:tblW/@w` when `@type="pct"`               |
| `EMU`           | 1/914400 of an inch         | `wp:extent`, drawing positions               |
| line multiplier | unitless (240 = 1.0×)       | `w:line` when `w:lineRule="auto"`            |

## Univer side (target)

Univer's document data model uses **CSS pixels at 96 DPI** for almost all
numeric fields. The few exceptions are explicitly enumerated below.

`px = pt / 0.75 = pt × 96/72`. So `dxa / 15 = dxa / 20 / 0.75 = px`.

### Fields that are CSS px (NOT pt)

| Path                                          | Unit | Notes                                     |
| --------------------------------------------- | ---- | ----------------------------------------- |
| `documentStyle.pageSize.{width,height}`       | px   | A4 = 793.7 × 1122.7 px                    |
| `documentStyle.margin{Top,Bottom,Left,Right,Header,Footer}` | px |                            |
| `body.sectionBreaks[].linePitch`              | px   | Default 15.6 px ≈ 12pt                    |
| `body.sectionBreaks[].charSpace`              | px   | Untested in current docs                  |
| `paragraphStyle.spaceAbove.v`                 | px   | `INumberUnit.v` is px                     |
| `paragraphStyle.spaceBelow.v`                 | px   |                                           |
| `paragraphStyle.lineSpacing` (when `spacingRule = AT_LEAST or EXACT`) | px | Absolute line height |
| `paragraphStyle.indentStart.v`                | px   |                                           |
| `paragraphStyle.indentEnd.v`                  | px   |                                           |
| `paragraphStyle.indentFirstLine.v`            | px   |                                           |
| `paragraphStyle.hanging.v`                    | px   |                                           |
| `tables[].rows[].height` (`trHeight.val.v`)   | px   | From `w:trHeight` via `dxaToPx`           |
| `tables[].columnWidths[]` (`tableColumns[].size.width.v`) | px | From `w:gridCol/@w` via `dxaToPx` |
| `tables[].cellMargin.{start,end,top,bottom}.v` | px  | From `w:tcMar`/`w:tblCellMar` via `dxaToPx` |
| `tables[].indent.v`                           | px   | From `w:tblInd` via `dxaToPx`             |
| `tables[].size.width.v` (preferred table width) | px | From `w:tblW dxa` via `dxaToPx`           |
| `tables[].rows[].tableCells[].size.width.v` (preferred cell width) | px | From `w:tcW dxa` via `dxaToPx` |

### Fields that are pt (NOT px)

These exist because the renderer applies `ptToPixel()` to them at draw time —
do not pre-convert to px in this package or you'll double-convert.

| Path                       | Unit    | Notes                                     |
| -------------------------- | ------- | ----------------------------------------- |
| `textRuns[].ts.fs`         | pt      | From `w:sz` (half-pt) → `hpToPt`. Common values: 11, 12, 16. |

### Unitless fields

| Path                                                 | Notes                            |
| ---------------------------------------------------- | -------------------------------- |
| `paragraphStyle.lineSpacing` (when `spacingRule = AUTO`) | multiplier (1.0, 1.5, 2.0…) |
| `paragraphStyle.snapToGrid`                          | BooleanNumber (default TRUE)     |
| `documentStyle.gridType`                             | enum                             |

## Helpers

Use [`utils/units.ts`](./src/utils/units.ts):

- `dxaToPx(dxa)` — for any field marked **px** above sourced from a dxa attribute.
- `hpToPx(hp)`   — for `textRuns[].ts.fs` from `w:sz`.
- `dxaToPt(dxa)` / `hpToPt(hp)` — only when the downstream field is documented
  as pt (currently table-related fields; pending audit).

A one-line `dxa / 15` is just as correct as `dxaToPx(dxa)`, but the helper
form makes every conversion grep-able when the next contract bug appears.

## Known unaudited fields

Edit at your own risk; outputs are currently in pt and may be wrong if Univer
expects px:

- `parse-styles.ts` named-table-style cell margin defaults — fields use `dxaToPx` now,
  but tblStylePr conditional formatting is not applied yet (orthogonal issue)
- Table cell border `width.v` (`w:sz`/8 → pt). Renderer doesn't currently consume
  dashStyle/width for table cell borders — see assemble.ts comment.
- Any `w:position`, `w:kern` on character properties (not yet parsed)
- Tab stop positions (not yet parsed)
