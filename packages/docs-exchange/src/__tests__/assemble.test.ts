/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { DocumentChild, ParsedNumberingDef } from '../utils/parse/types';
import { describe, expect, it } from 'vitest';
import { assembleDocument } from '../utils/parse/assemble';

describe('assembleDocument', () => {
    it('joins simple paragraphs with \\r and ends with \\n', () => {
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'Hi' }] } },
            { kind: 'paragraph', paragraph: { runs: [{ text: 'Bye' }] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        expect(doc.body!.dataStream).toBe('Hi\rBye\r\n');
    });

    it('records textRun st/ed at global offsets', () => {
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'AB', style: { bl: 1 } }, { text: 'CD' }] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const runs = doc.body!.textRuns!;
        expect(runs[0]).toMatchObject({ st: 0, ed: 2, ts: { bl: 1 } });
    });

    it('records paragraph startIndex at \\r position', () => {
        const children: DocumentChild[] = [{ kind: 'paragraph', paragraph: { runs: [{ text: 'Hi' }] } }];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const paragraphs = (doc.body as { paragraphs: { startIndex: number }[] }).paragraphs;
        expect(paragraphs[0].startIndex).toBe(2);
    });

    it('emits hyperlink as customRange rangeType=0', () => {
        const rels = new Map([['rId1', { type: 'hyperlink' as const, target: 'https://x.com' }]]);
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'click', hyperlink: { url: 'rId1' } }] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels, media: new Map() });
        const ranges = (
            doc.body as unknown as {
                customRanges: Array<{ startIndex: number; endIndex: number; rangeType: number; properties: { url: string } }>;
            }
        ).customRanges;
        expect(ranges[0]).toMatchObject({ startIndex: 0, endIndex: 4, rangeType: 0, properties: { url: 'https://x.com' } });
    });

    it('emits PAGE/NUMPAGES fieldType as CustomRangeType.FIELD customRange', async () => {
        const { CustomRangeType } = await import('@univerjs/core');
        const children: DocumentChild[] = [
            {
                kind: 'paragraph',
                paragraph: {
                    runs: [
                        { text: '1', fieldType: 'PAGE' },
                        { text: ' / ' },
                        { text: '1', fieldType: 'NUMPAGES' },
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const ranges = (
            doc.body as unknown as {
                customRanges: Array<{ startIndex: number; endIndex: number; rangeType: number; properties: { subtype: string } }>;
            }
        ).customRanges;
    // Two FIELD ranges, one per placeholder, both rangeType=FIELD with subtype recorded.
        expect(ranges).toHaveLength(2);
        expect(ranges[0]).toMatchObject({ rangeType: CustomRangeType.FIELD, properties: { subtype: 'PAGE' } });
        expect(ranges[1]).toMatchObject({ rangeType: CustomRangeType.FIELD, properties: { subtype: 'NUMPAGES' } });
    // Range covers exactly the placeholder text in dataStream.
        const ds = doc.body!.dataStream!;
        expect(ds.slice(ranges[0].startIndex, ranges[0].endIndex + 1)).toBe('1');
        expect(ds.slice(ranges[1].startIndex, ranges[1].endIndex + 1)).toBe('1');
    });

    it('attaches numbering as bullet via numId lookup; bullet.listType matches lists map key', () => {
        const numbering = new Map([
            [
                '1',
                {
                    numId: '1',
                    abstractNumId: '0',
                    listType: 'ORDER_LIST' as const,
                    levels: [{ ilvl: 0, format: 'decimal', text: '%1.', start: 1 }],
                    isCheckbox: false,
                },
            ],
        ]);
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'item' }], bullet: { numId: '1', ilvl: 0 } } },
        ];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const paragraphs = (
            doc.body as { paragraphs: Array<{ bullet?: { listType: string; listId: string; nestingLevel: number } }> }
        ).paragraphs;
    // bullet.listType must equal the lists map key (numId), NOT the preset name
    // "ORDER_LIST". Otherwise Univer treats it as a preset and ignores our nestingLevel.
        expect(paragraphs[0].bullet?.listType).toBe('1');
        expect(paragraphs[0].bullet?.listId).toBe('1');
        expect(paragraphs[0].bullet?.nestingLevel).toBe(0);
        expect((doc as unknown as { lists?: Record<string, unknown> }).lists?.['1']).toBeDefined();
    });

    it('does NOT emit a paragraph entry for the trailing \\n', () => {
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'A' }] } },
            { kind: 'paragraph', paragraph: { runs: [{ text: 'B' }] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        expect((doc.body as { paragraphs: unknown[] }).paragraphs.length).toBe(2);
        expect(doc.body!.dataStream!.endsWith('\n')).toBe(true);
    });

    it('table region startIndex/endIndex point to TABLE_START/TABLE_END control chars', async () => {
        const { DataStreamTreeTokenType } = await import('@univerjs/core');
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const tables = (doc.body as { tables: Array<{ startIndex: number; endIndex: number }> }).tables;
        const ds = doc.body!.dataStream!;
        expect(ds[tables[0].startIndex]).toBe(DataStreamTreeTokenType.TABLE_START);
        expect(ds[tables[0].endIndex]).toBe(DataStreamTreeTokenType.TABLE_END);
    });

    it('preserves hyperlink and style inside a table cell', () => {
        const rels = new Map([['rId1', { type: 'hyperlink' as const, target: 'https://x.com' }]]);
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [[{ paragraphs: [{ runs: [{ text: 'click', style: { bl: 1 }, hyperlink: { url: 'rId1' } }] }] }]],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels, media: new Map() });
        const ranges = (doc.body as { customRanges?: Array<{ properties?: { url?: string } }> }).customRanges;
        expect(ranges?.[0]?.properties?.url).toBe('https://x.com');
        expect(doc.body!.textRuns?.some((r: { ts?: { bl?: number } }) => r.ts?.bl === 1)).toBe(true);
    });

  // ── New boundary tests ──────────────────────────────────────────────────────

    it('empty children array → dataStream is "\\n", paragraphs length 0', () => {
        const doc = assembleDocument([], { numbering: new Map(), rels: new Map(), media: new Map() });
        expect(doc.body!.dataStream).toBe('\n');
        expect((doc.body as { paragraphs: unknown[] }).paragraphs.length).toBe(0);
    });

    it('only-table document does not crash and dataStream contains TABLE_START..TABLE_END..\\n', async () => {
        const { DataStreamTreeTokenType } = await import('@univerjs/core');
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'T' }] }] }]] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const ds = doc.body!.dataStream!;
        expect(ds.includes(DataStreamTreeTokenType.TABLE_START)).toBe(true);
        expect(ds.includes(DataStreamTreeTokenType.TABLE_END)).toBe(true);
        expect(ds.endsWith('\n')).toBe(true);
    });

    it('bullet inside table cell paragraph → cell paragraph has bullet, lists map has entry', () => {
        const numbering = new Map([
            [
                '3',
        {
            numId: '3',
            abstractNumId: '0',
            listType: 'BULLET_LIST' as const,
            levels: [{ ilvl: 0, format: 'bullet', text: '•', start: 1 }],
        } satisfies ParsedNumberingDef,
            ],
        ]);
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: { rows: [[{ paragraphs: [{ runs: [{ text: 'item' }], bullet: { numId: '3', ilvl: 0 } }] }]] },
            },
        ];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const paragraphs = (doc.body as { paragraphs: Array<{ bullet?: { listType: string } }> }).paragraphs;
        const hasBulletParagraph = paragraphs.some((p) => p.bullet?.listType === '3');
        expect(hasBulletParagraph).toBe(true);
        expect((doc as unknown as { lists?: Record<string, unknown> }).lists?.['3']).toBeDefined();
    });

    it('multi-list: same listType different numId → two entries in lists, two different listId on paragraphs', () => {
        const def1: ParsedNumberingDef = {
            numId: '1',
            abstractNumId: '0',
            listType: 'ORDER_LIST',
            levels: [{ ilvl: 0, format: 'decimal', text: '%1.', start: 1 }],
        };
        const def2: ParsedNumberingDef = {
            numId: '2',
            abstractNumId: '1',
            listType: 'ORDER_LIST',
            levels: [{ ilvl: 0, format: 'decimal', text: '%1.', start: 5 }],
        };
        const numbering = new Map([
            ['1', def1],
            ['2', def2],
        ]);
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'a' }], bullet: { numId: '1', ilvl: 0 } } },
            { kind: 'paragraph', paragraph: { runs: [{ text: 'b' }], bullet: { numId: '2', ilvl: 0 } } },
        ];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const lists = (doc as unknown as { lists?: Record<string, unknown> }).lists ?? {};
        expect(Object.keys(lists)).toHaveLength(2);
        expect(lists['1']).toBeDefined();
        expect(lists['2']).toBeDefined();
        const paragraphs = (doc.body as { paragraphs: Array<{ bullet?: { listId: string } }> }).paragraphs;
        expect(paragraphs[0].bullet?.listId).toBe('1');
        expect(paragraphs[1].bullet?.listId).toBe('2');
    });

    it('hyperlink rels missing → no customRange emitted, no throw', () => {
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'link', hyperlink: { url: 'rIdMissing' } }] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const ranges = (doc.body as { customRanges?: unknown[] }).customRanges;
        expect(ranges === undefined || ranges.length === 0).toBe(true);
    });

  // ── Table ITable shape: required fields Univer expects ────────────────────

    it('tableSource entry has all required ITable fields (align, indent, textWrap, position, dist, size, cellMargin)', () => {
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]], columnWidths: [3000] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const tables = (doc.body as { tables: Array<{ tableId: string }> }).tables;
        const tableId = tables[0].tableId;
        const src = (doc as unknown as { tableSource: Record<string, Record<string, unknown>> }).tableSource[tableId];
    // Univer requires: align, indent, textWrap, position, dist, size, cellMargin (used in default), tableRows, tableColumns, tableId.
    // Without these, doc-skeleton silently fails to lay out the table → it disappears in the renderer.
        expect(src.align).toBe(0); // TableAlignmentType.START
        expect(src.indent).toEqual({ v: 0 });
        expect(src.textWrap).toBe(0); // TableTextWrapType.NONE
        expect(src.position).toMatchObject({
            positionH: { relativeFrom: 0, posOffset: 0 },
            positionV: { relativeFrom: 0, posOffset: 0 },
        });
        expect(src.dist).toEqual({ distB: 0, distL: 0, distR: 0, distT: 0 });
        expect(src.size).toMatchObject({ type: 0, width: { v: expect.any(Number) } }); // UNSPECIFIED is what Univer's getEmptyTable uses
        expect(src.cellMargin).toMatchObject({ start: { v: 10 }, end: { v: 10 }, top: { v: 5 }, bottom: { v: 5 } });
        expect(src.tableId).toBe(tableId);
    });

    it('table cells default to non-empty margin so Univer can lay out cell content', () => {
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const tableId = (doc.body as { tables: Array<{ tableId: string }> }).tables[0].tableId;
        const src = (
            doc as unknown as {
                tableSource: Record<string, { tableRows: Array<{ tableCells: Array<Record<string, unknown>> }> }>;
            }
        ).tableSource[tableId];
        const cell = src.tableRows[0].tableCells[0];
    // Cells must carry a margin so cell layout has nonzero padding.
        expect(cell.margin).toMatchObject({ start: { v: 10 }, end: { v: 10 }, top: { v: 5 }, bottom: { v: 5 } });
    });

    it('tableColumns is populated even when columnWidths is missing (split equally across cells of first row)', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            { paragraphs: [{ runs: [{ text: 'A' }] }] },
                            { paragraphs: [{ runs: [{ text: 'B' }] }] },
                            { paragraphs: [{ runs: [{ text: 'C' }] }] },
                        ],
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const tableId = (doc.body as { tables: Array<{ tableId: string }> }).tables[0].tableId;
        const src = (
            doc as unknown as { tableSource: Record<string, { tableColumns: Array<{ size: { width: { v: number } } }> }> }
        ).tableSource[tableId];
        expect(src.tableColumns.length).toBe(3);
    // Width must be > 0 — zero-width columns produce a 0×0 table that doesn't render.
        expect(src.tableColumns[0].size.width.v).toBeGreaterThan(0);
    });

    it('tableColumns widths are passed through from columnWidths (already in CSS px)', () => {
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]], columnWidths: [200] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const tableId = (doc.body as { tables: Array<{ tableId: string }> }).tables[0].tableId;
        const src = (
            doc as unknown as { tableSource: Record<string, { tableColumns: Array<{ size: { width: { v: number } } }> }> }
        ).tableSource[tableId];
        expect(src.tableColumns[0].size.width.v).toBe(200); // already px, no conversion
    });

  // ── Table cell SECTION_BREAK requirement (Univer view-model) ─────────────
  //
  // Univer's view-model parses each cell with a sectionBreak terminator. If a
  // cell ends with only PARAGRAPH (\r) and no SECTION_BREAK (\n) before
  // TABLE_CELL_END, the cell node has no children and view-model construction
  // throws when computing the cell's index range — the table silently fails
  // to render.

    it('table cell ends with \\r\\n (PARAGRAPH then SECTION_BREAK) before TABLE_CELL_END', async () => {
        const { DataStreamTreeTokenType } = await import('@univerjs/core');
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const ds = doc.body!.dataStream!;
        const cellEndIdx = ds.indexOf(DataStreamTreeTokenType.TABLE_CELL_END);
        expect(ds.charCodeAt(cellEndIdx - 1)).toBe(10); // \n SECTION_BREAK
        expect(ds.charCodeAt(cellEndIdx - 2)).toBe(13); // \r PARAGRAPH
    });

    it('body.sectionBreaks contains an entry per table cell pointing to the cell newline', async () => {
        const { DataStreamTreeTokenType } = await import('@univerjs/core');
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [{ paragraphs: [{ runs: [{ text: 'A' }] }] }, { paragraphs: [{ runs: [{ text: 'B' }] }] }],
                        [{ paragraphs: [{ runs: [{ text: 'C' }] }] }, { paragraphs: [{ runs: [{ text: 'D' }] }] }],
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const breaks = (doc.body as { sectionBreaks?: Array<{ startIndex: number }> }).sectionBreaks ?? [];
        const ds = doc.body!.dataStream!;
    // Expect at least one sectionBreak per cell (4 cells) plus optionally the trailing doc break.
        const cellBreakPositions = breaks
            .map((b) => b.startIndex)
            .filter((i) => ds.charCodeAt(i) === 10 && i < ds.lastIndexOf(DataStreamTreeTokenType.TABLE_END));
        expect(cellBreakPositions.length).toBe(4);
        for (const pos of cellBreakPositions) {
            expect(ds.charCodeAt(pos)).toBe(10); // \n at recorded position
            expect(ds.charCodeAt(pos + 1)).toBe(0x1D); // followed by TABLE_CELL_END
        }
    });

    it('paragraph startIndex inside a cell still points to \\r (not \\n)', async () => {
        const children: DocumentChild[] = [
            { kind: 'table', table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const ds = doc.body!.dataStream!;
        const ps = (doc.body as { paragraphs: Array<{ startIndex: number }> }).paragraphs;
    // The paragraph entry inside the cell must point at the \r, not the new \n.
        const cellParagraph = ps.find((p) => ds.charCodeAt(p.startIndex) === 13);
        expect(cellParagraph).toBeDefined();
    });

    it('OOXML numFmt → ListGlyphType: lowerLetter→5, lowerRoman→7, upperLetter→4, upperRoman→6, decimalZero→3', () => {
        const numbering = new Map<string, ParsedNumberingDef>([
            [
                '10',
                {
                    numId: '10',
                    abstractNumId: '0',
                    listType: 'ORDER_LIST',
                    levels: [
                        { ilvl: 0, format: 'decimal', text: '%1.', start: 1 },
                        { ilvl: 1, format: 'lowerLetter', text: '%2)', start: 1 },
                        { ilvl: 2, format: 'lowerRoman', text: '%3.', start: 1 },
                        { ilvl: 3, format: 'upperLetter', text: '%4.', start: 1 },
                        { ilvl: 4, format: 'upperRoman', text: '%5.', start: 1 },
                        { ilvl: 5, format: 'decimalZero', text: '%6.', start: 1 },
                    ],
                },
            ],
        ]);
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'x' }], bullet: { numId: '10', ilvl: 0 } } },
        ];
        const doc = assembleDocument(children, { numbering, rels: new Map(), media: new Map() });
        const lists =
            (doc as unknown as { lists?: Record<string, { nestingLevel: Array<{ glyphType: number }> }> }).lists ?? {};
        const levels = lists['10']?.nestingLevel ?? [];
        expect(levels[0]?.glyphType).toBe(2); // DECIMAL
        expect(levels[1]?.glyphType).toBe(5); // LOWER_LETTER
        expect(levels[2]?.glyphType).toBe(7); // LOWER_ROMAN
        expect(levels[3]?.glyphType).toBe(4); // UPPER_LETTER
        expect(levels[4]?.glyphType).toBe(6); // UPPER_ROMAN
        expect(levels[5]?.glyphType).toBe(3); // DECIMAL_ZERO
    });
});

describe('assembleDocument: table styling → Univer ITable', () => {
    function getTableSrc(doc: ReturnType<typeof assembleDocument>) {
        const tableId = (doc.body as { tables: Array<{ tableId: string }> }).tables[0].tableId;
        return (doc as unknown as { tableSource: Record<string, Record<string, unknown>> }).tableSource[tableId];
    }

    it('cell.shadingFill → ITableCell.backgroundColor', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: { rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }], shadingFill: 'CAE0D6' }]] },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const src = getTableSrc(doc) as { tableRows: Array<{ tableCells: Array<{ backgroundColor?: { rgb: string } }> }> };
        expect(src.tableRows[0].tableCells[0].backgroundColor).toEqual({ rgb: '#CAE0D6' });
    });

    it('cell.borders → ITableCell.borderTop/Bottom/Left/Right with width pt + dashStyle enum', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            {
                                paragraphs: [{ runs: [{ text: 'X' }] }],
                                borders: {
                                    top: { val: 'single', sizeEighths: 4, color: '67A589' }, // 4/8 = 0.5pt
                                    bottom: { val: 'dotted', sizeEighths: 8, color: '000000' }, // DashStyleType.DOT = 2
                                    left: { val: 'dashed', sizeEighths: 8, color: 'FF0000' }, // DashStyleType.DASH = 3
                                    right: { val: 'nil' }, // explicit no border → omit
                                },
                            },
                        ],
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cell = (
            getTableSrc(doc) as {
                tableRows: Array<{
                    tableCells: Array<{
                        borderTop?: { color: { rgb: string }; width?: { v: number }; dashStyle?: number };
                        borderBottom?: { color: { rgb: string }; width?: { v: number }; dashStyle?: number };
                        borderLeft?: { color: { rgb: string }; width?: { v: number }; dashStyle?: number };
                        borderRight?: unknown;
                    }>;
                }>;
            }
        ).tableRows[0].tableCells[0];
        expect(cell.borderTop).toEqual({ color: { rgb: '#67A589' }, width: { v: 0.5 }, dashStyle: 1 });
        expect(cell.borderBottom?.dashStyle).toBe(2); // DOT
        expect(cell.borderLeft?.dashStyle).toBe(3); // DASH
        expect(cell.borderRight).toBeUndefined(); // nil → no border emitted
    });

    it('cell.borders dotDash/dotDotDash → DashStyleType DOT_DASH(4) / DOT_DOT_DASH(5)', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            {
                                paragraphs: [{ runs: [{ text: 'X' }] }],
                                borders: {
                                    top: { val: 'dotDash', sizeEighths: 4, color: '000000' },
                                    bottom: { val: 'dotDotDash', sizeEighths: 4, color: '000000' },
                                },
                            },
                        ],
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cell = (
            getTableSrc(doc) as {
                tableRows: Array<{
                    tableCells: Array<{
                        borderTop?: { dashStyle?: number };
                        borderBottom?: { dashStyle?: number };
                    }>;
                }>;
            }
        ).tableRows[0].tableCells[0];
        expect(cell.borderTop?.dashStyle).toBe(4); // DOT_DASH
        expect(cell.borderBottom?.dashStyle).toBe(5); // DOT_DOT_DASH
    });

    it('cell.vAlign → ITableCell.vAlign (top=2, center=3, bottom=4)', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            { paragraphs: [{ runs: [{ text: 'a' }] }], vAlign: 'top' },
                            { paragraphs: [{ runs: [{ text: 'b' }] }], vAlign: 'center' },
                            { paragraphs: [{ runs: [{ text: 'c' }] }], vAlign: 'bottom' },
                        ],
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cells = (getTableSrc(doc) as { tableRows: Array<{ tableCells: Array<{ vAlign?: number }> }> }).tableRows[0].tableCells;
        expect(cells[0].vAlign).toBe(2); // VerticalAlignmentType.TOP
        expect(cells[1].vAlign).toBe(3); // CENTER
        expect(cells[2].vAlign).toBe(4); // BOTTOM
    });

    it('cell.margin overrides default and cell.preferredWidthPx → ITableCell.size', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            {
                                paragraphs: [{ runs: [{ text: 'X' }] }],
                                margin: { top: 2, bottom: 2, start: 4, end: 4 },
                                preferredWidthPx: 100,
                            },
                        ],
                    ],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cell = (
            getTableSrc(doc) as {
                tableRows: Array<{
                    tableCells: Array<{
                        margin: { start: { v: number }; end: { v: number }; top: { v: number }; bottom: { v: number } };
                        size?: { type: number; width: { v: number } };
                    }>;
                }>;
            }
        ).tableRows[0].tableCells[0];
        expect(cell.margin).toEqual({ start: { v: 4 }, end: { v: 4 }, top: { v: 2 }, bottom: { v: 2 } });
        expect(cell.size).toEqual({ type: 1, width: { v: 100 } }); // 100 px, SPECIFIED
    });

    it('table.borders insideH/V are applied to interior cell sides when cell side is absent', () => {
    // 2x2 table, table-level insideH=dotted, insideV=dotted, no cell-level borders.
    // Expected: top-left cell has border-right (insideV) and border-bottom (insideH); border-top/left absent.
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            { paragraphs: [{ runs: [{ text: 'A' }] }] },
                            { paragraphs: [{ runs: [{ text: 'B' }] }] },
                        ],
                        [
                            { paragraphs: [{ runs: [{ text: 'C' }] }] },
                            { paragraphs: [{ runs: [{ text: 'D' }] }] },
                        ],
                    ],
                    borders: {
                        insideH: { val: 'dotted', sizeEighths: 4, color: '67A589' },
                        insideV: { val: 'dotted', sizeEighths: 4, color: '67A589' },
                    },
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cells = (
            getTableSrc(doc) as {
                tableRows: Array<{
                    tableCells: Array<{
                        borderTop?: { dashStyle: number };
                        borderBottom?: { dashStyle: number };
                        borderLeft?: { dashStyle: number };
                        borderRight?: { dashStyle: number };
                    }>;
                }>;
            }
        ).tableRows;
    // Top-left cell [0][0]: gets bottom (insideH) + right (insideV)
        expect(cells[0].tableCells[0].borderBottom?.dashStyle).toBe(2);
        expect(cells[0].tableCells[0].borderRight?.dashStyle).toBe(2);
        expect(cells[0].tableCells[0].borderTop).toBeUndefined();
        expect(cells[0].tableCells[0].borderLeft).toBeUndefined();
    // Bottom-right cell [1][1]: gets top (insideH) + left (insideV)
        expect(cells[1].tableCells[1].borderTop?.dashStyle).toBe(2);
        expect(cells[1].tableCells[1].borderLeft?.dashStyle).toBe(2);
        expect(cells[1].tableCells[1].borderBottom).toBeUndefined();
        expect(cells[1].tableCells[1].borderRight).toBeUndefined();
    });

    it('table.borders perimeter (top/bottom/left/right) applies to outermost cell sides', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]],
                    borders: {
                        top: { val: 'single', sizeEighths: 4, color: '000000' },
                        bottom: { val: 'single', sizeEighths: 4, color: '000000' },
                        left: { val: 'single', sizeEighths: 4, color: '000000' },
                        right: { val: 'single', sizeEighths: 4, color: '000000' },
                    },
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cell = (
            getTableSrc(doc) as {
                tableRows: Array<{
                    tableCells: Array<{
                        borderTop?: unknown;
                        borderBottom?: unknown;
                        borderLeft?: unknown;
                        borderRight?: unknown;
                    }>;
                }>;
            }
        ).tableRows[0].tableCells[0];
        expect(cell.borderTop).toBeDefined();
        expect(cell.borderBottom).toBeDefined();
        expect(cell.borderLeft).toBeDefined();
        expect(cell.borderRight).toBeDefined();
    });

    it('cell-level border wins over table-level inside borders', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            {
                                paragraphs: [{ runs: [{ text: 'A' }] }],
                                borders: { right: { val: 'single', sizeEighths: 8, color: 'FF0000' } },
                            },
                            { paragraphs: [{ runs: [{ text: 'B' }] }] },
                        ],
                    ],
                    borders: { insideV: { val: 'dotted', sizeEighths: 4, color: '67A589' } },
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cell0 = (
            getTableSrc(doc) as {
                tableRows: Array<{ tableCells: Array<{ borderRight?: { color: { rgb: string }; dashStyle: number } }> }>;
            }
        ).tableRows[0].tableCells[0];
        expect(cell0.borderRight?.color).toEqual({ rgb: '#FF0000' });
        expect(cell0.borderRight?.dashStyle).toBe(1); // SOLID, not DOT from table.insideV
    });

    it('table.shadingFill flows down to cells lacking own shading; cell shading wins', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [
                        [
                            { paragraphs: [{ runs: [{ text: 'A' }] }] }, // no own shading → inherits
                            { paragraphs: [{ runs: [{ text: 'B' }] }], shadingFill: 'FF0000' }, // own wins
                        ],
                    ],
                    shadingFill: 'EEEEEE',
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const cells = (
            getTableSrc(doc) as { tableRows: Array<{ tableCells: Array<{ backgroundColor?: { rgb: string } }> }> }
        ).tableRows[0].tableCells;
        expect(cells[0].backgroundColor).toEqual({ rgb: '#EEEEEE' });
        expect(cells[1].backgroundColor).toEqual({ rgb: '#FF0000' });
    });

    it('table.cellMargin overrides the global default for cells without own margin', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]],
                    cellMargin: { top: 3, bottom: 3, start: 6, end: 6 },
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const src = getTableSrc(doc) as {
            cellMargin: { start: { v: number }; end: { v: number }; top: { v: number }; bottom: { v: number } };
            tableRows: Array<{
                tableCells: Array<{
                    margin: { start: { v: number }; end: { v: number }; top: { v: number }; bottom: { v: number } };
                }>;
            }>;
        };
        expect(src.cellMargin).toEqual({ start: { v: 6 }, end: { v: 6 }, top: { v: 3 }, bottom: { v: 3 } });
        expect(src.tableRows[0].tableCells[0].margin).toEqual({
            start: { v: 6 },
            end: { v: 6 },
            top: { v: 3 },
            bottom: { v: 3 },
        });
    });

    it('table.align/indentPx/layout/preferredWidthPx flow to ITable', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [[{ paragraphs: [{ runs: [{ text: 'X' }] }] }]],
                    align: 'center',
                    indentPx: 16,
                    layout: 'fixed',
                    preferredWidthPx: 600,
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const src = getTableSrc(doc) as {
            align: number;
            indent: { v: number };
            layout?: number;
            size: { type: number; width: { v: number } };
        };
        expect(src.align).toBe(1); // TableAlignmentType.CENTER
        expect(src.indent).toEqual({ v: 16 });
        expect(src.layout).toBe(1); // TableLayoutType.FIXED
        expect(src.size).toEqual({ type: 1, width: { v: 600 } }); // 600 px, SPECIFIED
    });

    it('row.trHeight and row.cantSplit/repeatHeaderRow flow to ITableRow', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [[{ paragraphs: [{ runs: [{ text: 'A' }] }] }], [{ paragraphs: [{ runs: [{ text: 'B' }] }] }]],
                    rowHeights: [{ v: 40, rule: 'exact' }, undefined],
                    rowCantSplit: [true, false],
                    rowIsHeader: [true, false],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        const rows = (
            getTableSrc(doc) as {
                tableRows: Array<{
                    trHeight: { val: { v: number }; hRule: number };
                    cantSplit?: number;
                    repeatHeaderRow?: number;
                }>;
            }
        ).tableRows;
        expect(rows[0].trHeight).toEqual({ val: { v: 40 }, hRule: 2 }); // EXACT
        expect(rows[0].cantSplit).toBe(1); // BooleanNumber.TRUE
        expect(rows[0].repeatHeaderRow).toBe(1);
        expect(rows[1].trHeight).toEqual({ val: { v: 0 }, hRule: 0 });
        expect(rows[1].cantSplit).toBeFalsy();
        expect(rows[1].repeatHeaderRow).toBeFalsy();
    });
});

// ── Inline `<w:pPr><w:sectPr>` → mid-stream SECTION_BREAK + per-section break entry ──

describe('assembleDocument — inline sectionBreakAfter', () => {
    it('emits \\r\\n at the section-terminating paragraph and pushes a sectionBreak entry at the \\n index', () => {
        const children: DocumentChild[] = [
            {
                kind: 'paragraph',
                paragraph: {
                    runs: [{ text: 'A' }],
                    sectionBreakAfter: {
                        documentStyle: { pageOrient: 1, pageSize: { width: 1122.5, height: 793.7 } },
                        sectionBreakDefaults: {},
                        headerRefs: {},
                        footerRefs: {},
                        titlePage: true,
                        sectionTypeRaw: 'continuous',
                        resolvedHeaderIds: { default: 'header2' },
                        resolvedFooterIds: { default: 'footer2' },
                    },
                },
            },
            { kind: 'paragraph', paragraph: { runs: [{ text: 'B' }] } },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        // dataStream is "A\r\nB\r\n" — A=0, \r=1, \n=2, B=3, \r=4, \n=5
        expect(doc.body!.dataStream).toBe('A\r\nB\r\n');
        const breaks = doc.body!.sectionBreaks!;
        expect(breaks.length).toBe(2);
        // First break is the inline one at the '\n' after paragraph A.
        const inline = breaks.find((b) => b.startIndex === 2)!;
        expect(inline).toBeDefined();
        expect(inline.defaultHeaderId).toBe('header2');
        expect(inline.defaultFooterId).toBe('footer2');
        expect(inline.useFirstPageHeaderFooter).toBe(1); // BooleanNumber.TRUE
        expect(inline.sectionType).toBe(1); // SectionType.CONTINUOUS
        expect(inline.pageOrient).toBe(1);
        // Second break is the doc-end synthesized one at dataStream.length - 1 = 5.
        const tail = breaks.find((b) => b.startIndex === 5)!;
        expect(tail).toBeDefined();
        expect(tail.defaultHeaderId).toBeUndefined();
    });

    it('strips sectionBreakAfter from cell paragraphs (illegal in OOXML, but defensive)', () => {
        const children: DocumentChild[] = [
            {
                kind: 'table',
                table: {
                    rows: [[{
                        paragraphs: [{
                            runs: [{ text: 'cell' }],
                            sectionBreakAfter: {
                                documentStyle: {},
                                sectionBreakDefaults: {},
                                headerRefs: {},
                                footerRefs: {},
                                titlePage: false,
                                resolvedHeaderIds: { default: 'shouldNotLeak' },
                            },
                        }],
                    }]],
                },
            },
        ];
        const doc = assembleDocument(children, { numbering: new Map(), rels: new Map(), media: new Map() });
        // No sectionBreak entry should carry the leaked headerId — only cell terminator + doc end.
        for (const sb of doc.body!.sectionBreaks!) {
            expect(sb.defaultHeaderId).toBeUndefined();
        }
    });

    it('applies bodyEndSection to the synthesized doc-end break', () => {
        const children: DocumentChild[] = [
            { kind: 'paragraph', paragraph: { runs: [{ text: 'X' }] } },
        ];
        const doc = assembleDocument(children, {
            numbering: new Map(),
            rels: new Map(),
            media: new Map(),
            bodyEndSection: {
                documentStyle: { pageSize: { width: 800, height: 1100 } },
                sectionBreakDefaults: { linePitch: 20.8, gridType: 1 },
                headerRefs: {},
                footerRefs: {},
                titlePage: false,
                resolvedHeaderIds: { default: 'tailHeader' },
            },
        });
        const tail = doc.body!.sectionBreaks!.find((b) => b.startIndex === doc.body!.dataStream.length - 1)!;
        expect(tail.defaultHeaderId).toBe('tailHeader');
        expect(tail.pageSize).toEqual({ width: 800, height: 1100 });
    });

    it('default-fill for sectionBreakDefaults does NOT clobber inline sectPr fields', () => {
        const children: DocumentChild[] = [
            {
                kind: 'paragraph',
                paragraph: {
                    runs: [{ text: 'A' }],
                    sectionBreakAfter: {
                        documentStyle: {},
                        sectionBreakDefaults: { linePitch: 30, gridType: 2 }, // section-local
                        headerRefs: {},
                        footerRefs: {},
                        titlePage: false,
                    },
                },
            },
            { kind: 'paragraph', paragraph: { runs: [{ text: 'B' }] } },
        ];
        const doc = assembleDocument(children, {
            numbering: new Map(),
            rels: new Map(),
            media: new Map(),
            sectionBreakDefaults: { linePitch: 15.6, gridType: 1 }, // doc-level fallback
        });
        const inline = doc.body!.sectionBreaks!.find((b) => b.startIndex === 2)!;
        // inline values must win over doc-level defaults.
        expect(inline.linePitch).toBe(30);
        expect(inline.gridType).toBe(2);
        // Doc-end break has no own values → gets the doc-level defaults.
        const tail = doc.body!.sectionBreaks!.find((b) => b.startIndex === doc.body!.dataStream.length - 1)!;
        expect(tail.linePitch).toBe(15.6);
        expect(tail.gridType).toBe(1);
    });
});
