# DOCX import — known importer/renderer gaps

Tracks DOCX features the importer parses correctly but Univer's renderer can't
fully present yet. Importer-side fidelity tests pin the parsed shape; this file
explains why a regression test passing doesn't always mean the imported doc
looks right on screen.

Update this file when you add a TODO that crosses the importer/renderer boundary.

> **Scope note.** Every gap below is a missing capability in the renderer
> (`@univerjs/engine-render` / `@univerjs/docs-ui`), not something the import
> path introduced. The same limitations apply to documents authored natively in
> Univer — the import flow just surfaces them more often because Word templates
> rely on these features heavily. Fixes belong in the renderer packages; the
> importer is already emitting the right shape.

## Header / footer

### PAGE / NUMPAGES field codes

- **Importer status:** parsed. `parseRunsFromPNode` consumes the
  `fldChar begin → instrText → separate → cached value → fldChar end` sequence,
  drops the cached value, and emits a single-character placeholder run (`text: '1'`)
  carrying `fieldType: 'PAGE' | 'NUMPAGES'`. Assemble persists this as a
  `CustomRangeType.FIELD` customRange with `properties.subtype`.
- **Renderer status:** implemented. `getFontCreateConfig` reads the FIELD
  subtype off the customRange and threads it onto the glyph; `font-and-base-line.ts`
  substitutes the live page number / total pages at paint time using
  `parentPage.pageNumber` and `pages.length`. The footer skeleton is still cached
  per `pageWidth` and shared across body pages — substitution happens during
  `ctx.fillText`, not during layout.
- **Why a "1" placeholder:** layout needs a realistic glyph width. Most footers
  are centered or right-aligned; using "1" keeps width within ±1 digit of the
  rendered value. Documents with 100+ pages will see the centered footer drift
  by roughly the width of one or two digits — acceptable for v1.

### Paragraph `tabStops`

- **Importer status:** parsed. `parsePPr` collects `<w:tabs>` and the
  `clear`/`right`/`center` merge with inherited pStyle tabs (see
  `header-footer-fidelity.test.ts` "right tab at 8844 dxa" case).
- **Renderer status:** not consumed. `shaping.ts` shapes every `<w:tab/>`
  with `getCharSpaceApply(charSpace, defaultTabStop, ...)` — a fixed-width
  tab using the document-level `defaultTabStop`. The per-paragraph
  `tabStops` array on `IParagraphStyle` is never read.
- **Concrete symptom (文书格式.docx header2):** Word puts header text on the
  right edge by writing `<w:jc w:val="left"/>` + a single right-aligned tab
  stop at `pos=8844` + a leading `<w:tab/>` run. Word advances to the right
  tab stop and right-aligns the text against it; Univer renders a
  default-width tab and the text stays at the left margin.
- **Why this is more than parsing:** right-aligned tab stops require a
  back-fill or two-pass layout — the tab glyph's width depends on how wide
  the *following* runs are. Adding it touches shaping (variable-width tab
  glyph), line break (post-shaping width fixup), and the section/paragraph
  config plumbing that hands `tabStops` down to `shaping.ts`. Out of scope
  for an importer-only change.

## Paragraph borders

### Sides other than `bottom` (top / left / right / between)

- **Importer status:** partial. `parsePPr` only consumes `<w:bottom>` and
  `<w:top>` from `<w:pBdr>`; `<w:left>`, `<w:right>`, `<w:between>`, `<w:bar>`
  are dropped. `<w:top>` is parsed into `borderTop` but never makes it past
  the renderer (see below).
- **Renderer status:** bottom-only. `IDocumentSkeletonLine` carries a single
  `borderBottom` slot, and `_drawBorderBottom` paints only that side. The
  4-sided `_drawBorderTop / Left / Right` functions in `document.ts` exist
  but are wired to **table cells**, not paragraphs.
- **Symptom:** a Word paragraph with all four borders ("box") imports as a
  single underline — the bottom side renders, the other three are silently
  dropped.
- **Why this isn't a parser tweak:** even if the importer emitted all four
  sides, there's no skeleton slot to hand them to and no per-paragraph
  painter to draw them. Wiring it up needs:
  1. Importer: parse `w:left` / `w:right` (and surface the already-parsed
     `borderTop`).
  2. Skeleton: add `borderTop / Left / Right` slots on
     `IDocumentSkeletonLine`.
  3. Layout: decide which line carries the side borders (first / last /
     every) and how consecutive same-styled paragraphs merge so vertical
     rules don't double-up at the seam.
  4. Renderer: per-paragraph `_drawBorderTop / Left / Right` honoring line
     padding and the merge rules above.
