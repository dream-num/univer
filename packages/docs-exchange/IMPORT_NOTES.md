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
- **Renderer status:** not consumed. `grep tabStops packages/engine-render/src/components/docs`
  is empty; the renderer ignores per-paragraph tab stops, so a header that
  relies on a `right` tab to push text to the page edge will render
  left-aligned.

### Table cell border `dashStyle`

See the long block-comment in `assemble.ts` (search for "KNOWN LIMITATION
(Univer 0.16.1 render layer)"). DOCX dotted/dashed borders import correctly
but render as solid lines because `_drawTableCellBordersAndBg` doesn't call
`setLineDash`.
