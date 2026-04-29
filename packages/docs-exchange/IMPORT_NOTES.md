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
  drops the cached value, and emits a single placeholder run with
  `fieldType: 'PAGE' | 'NUMPAGES'` and `text: '{{page}}' | '{{numpages}}'`.
- **Renderer status:** not implemented. Univer's docs renderer has
  `CustomRangeType.FIELD` in core but no consumer in `engine-render` /
  `docs-ui`. The placeholder text will render literally (`{{page}}`).
- **Why parse it anyway:** if the importer kept the cached value, every page
  would show the page number Word last wrote (e.g. always "2") — strictly
  worse than a visible placeholder.

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
