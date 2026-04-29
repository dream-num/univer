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

import type {
    IBullet,
    ICustomBlock,
    ICustomRange,
    ICustomTable,
    IDocumentBody,
    IDocumentData,
    IDocumentStyle,
    IListData,
    IParagraph,
    ISectionBreak,
    ITextRun,
} from '@univerjs/core';
import type { DrawingInfo } from './parse-drawing';
import type { DocumentChild, ParsedBorder, ParsedCellBorders, ParsedCellMargin, ParsedNumberingDef, ParsedParagraph, ParsedRelationship, ParsedTable } from './types';
import { DataStreamTreeTokenType, generateRandomId } from '@univerjs/core';
import { buildDrawing } from './parse-drawing';

const uuidv4 = () => generateRandomId();

const { TABLE_START, TABLE_ROW_START, TABLE_CELL_START, TABLE_CELL_END, TABLE_ROW_END, TABLE_END } =
    DataStreamTreeTokenType;

export interface AssembleContext {
    numbering: Map<string, ParsedNumberingDef>;
    rels: Map<string, ParsedRelationship>;
    media: Map<string, Uint8Array>;
    drawingInfoMap?: Map<string, DrawingInfo>;
    documentStyle?: IDocumentStyle;
  /** Fields merged onto every body.sectionBreaks[] entry (linePitch, gridType from w:docGrid). */
    sectionBreakDefaults?: Partial<ISectionBreak>;
}

interface Accumulator {
    data: string;
    textRuns: ITextRun[];
    paragraphs: IParagraph[];
    sectionBreaks: Array<Partial<ISectionBreak> & { startIndex: number }>;
    tables: ICustomTable[];
    customRanges: ICustomRange<{ url: string }>[];
    customBlocks: ICustomBlock[];
    drawings: Record<string, unknown>;
    tableSource: Record<string, unknown>;
  /** Keyed by numId. */
    listsUsed: Map<string, ParsedNumberingDef>;
}

function emitRun(run: ParsedParagraph['runs'][number], acc: Accumulator, ctx: AssembleContext) {
    const runStart = acc.data.length;

    if (run.drawingId && ctx.drawingInfoMap) {
        const info = ctx.drawingInfoMap.get(run.drawingId);
        if (info) {
            const drawing = buildDrawing(run.drawingId, info, ctx.rels, ctx.media);
            if (drawing) {
                acc.data += '\b';
                acc.customBlocks.push({ startIndex: runStart, blockId: run.drawingId });
                acc.drawings[run.drawingId] = drawing;
            }
            return;
        }
    }

    acc.data += run.text;
    const runEnd = acc.data.length;

    if (run.style) {
        acc.textRuns.push({ st: runStart, ed: runEnd, ts: run.style });
    }

    if (run.hyperlink) {
        const real = ctx.rels.get(run.hyperlink.url);
        if (!real || real.type !== 'hyperlink') {
            console.warn('[ieport-docx] Hyperlink rel missing or wrong type:', run.hyperlink.url);
        } else {
            acc.customRanges.push({
                startIndex: runStart,
                endIndex: runEnd - 1,
                rangeType: 0,
                rangeId: uuidv4(),
                properties: { url: real.target },
            });
        }
    }
}

function emitParagraph(p: ParsedParagraph, acc: Accumulator, ctx: AssembleContext) {
    for (const run of p.runs) emitRun(run, acc, ctx);

    const paraEnd = acc.data.length;
    acc.data += '\r';

    let bullet: { listType: string; listId: string; nestingLevel: number } | undefined;
    let numberingLevel: ParsedNumberingDef['levels'][number] | undefined;
    if (p.bullet) {
        const def = ctx.numbering.get(p.bullet.numId);
        if (def) {
            acc.listsUsed.set(p.bullet.numId, def);
            numberingLevel = def.levels[p.bullet.ilvl] ?? def.levels[def.levels.length - 1];
            bullet = {
                listType: p.bullet.numId,
                listId: p.bullet.numId,
                nestingLevel: p.bullet.ilvl,
            };
        }
    }

  // ECMA-376 §17.9.23: numbering pPr is the base; inline w:ind overrides per-attribute,
  // not as a whole. When a list paragraph writes only w:left (no w:hanging), it intends
  // to override left while keeping the numbering's hanging. After Word→Univer hanging
  // translation, that means: re-derive Univer.indentStart from inline-left minus the
  // numbering's hanging, and inherit the numbering's hanging.
    let style = p.style;
    if (numberingLevel && style && style.indentStart && style.hanging === undefined && numberingLevel.hanging) {
        const inlineLeft = style.indentStart.v + 0; // inline left == indentStart since no hanging was set
        const numberingHanging = numberingLevel.hanging.v;
        style = {
            ...style,
            indentStart: { v: Math.max(0, inlineLeft - numberingHanging) },
            hanging: { v: numberingHanging },
        };
    }

    const entry: IParagraph = { startIndex: paraEnd };
    if (bullet) entry.bullet = bullet as IBullet;
    if (style) {
    // tabStopsClear is an internal merge artifact (see parse-paragraph mergePPr);
    // it has no place on Univer's IParagraphStyle. Strip before emit.
        if (style.tabStopsClear) {
            const { tabStopsClear: _, ...rest } = style;
            entry.paragraphStyle = rest as IParagraph['paragraphStyle'];
        } else {
            entry.paragraphStyle = style as IParagraph['paragraphStyle'];
        }
    }
    acc.paragraphs.push(entry);
}

// ── Table styling helpers ────────────────────────────────────────────────────
//
// DOCX → Univer mapping notes:
// - Univer's DashStyleType only supports SOLID(1)/DOT(2)/DASH(3). DOCX has 17
//   ST_Border values; we collapse the rest to SOLID. nil/none → omit border
//   (different from absent → inherit).
// - DOCX <w:sz> is in 1/8 pt; Univer ITableCellBorder.width is INumberUnit pt.
// - DOCX color "auto" means "theme/automatic", which we render as black.
//   TODO(unsupported): theme color resolution for borders/shading (themeColor / themeTint / themeShade).
//
// KNOWN LIMITATION (Univer 0.16.1 render layer): ITableCellBorder.dashStyle is
// part of the data model but NOT consumed by the renderer. _drawTableCellBordersAndBg
// in @univerjs/engine-render only reads color.rgb and calls B2() which does
// beginPath/moveTo/lineTo/stroke without any setLineDash. Result: all table cell
// borders render as solid lines regardless of the dashStyle we emit, so dotted/
// dashed DOCX borders look solid in Univer today. We still emit the correct
// dashStyle so the document model is right and dashed borders will show up
// automatically once Univer wires the field through to setLineDash.
// (Paragraph borderBottom and sheet cell borders DO honor dashStyle — only
// table cell borders are missing.)

const DOCX_BORDER_TO_UNIVER_DASH: Record<string, number> = {
    single: 1, // SOLID
    thick: 1,
    double: 1, // TODO(unsupported): Univer has no DOUBLE; collapses to SOLID
    triple: 1, // TODO(unsupported): collapse to SOLID
    thinThickSmallGap: 1,
    thickThinSmallGap: 1,
    thinThickThinSmallGap: 1,
    thinThickMediumGap: 1,
    thickThinMediumGap: 1,
    thinThickThinMediumGap: 1,
    thinThickLargeGap: 1,
    thickThinLargeGap: 1,
    thinThickThinLargeGap: 1,
    wave: 1, // TODO(unsupported): wave/doubleWave collapse to SOLID
    doubleWave: 1,
    dashSmallGap: 3, // DASH
    dashed: 3,
    dotDash: 3,
    dotDotDash: 3,
    dotted: 2, // DOT
  // TODO(unsupported): 3D border styles (threeDEmboss/threeDEngrave/inset/outset) — collapse to SOLID
};

function borderToUniver(b: ParsedBorder | undefined):
  | { color: { rgb: string }; width?: { v: number }; dashStyle?: number }
  | undefined {
    if (!b) return undefined;
  // val "nil"/"none" means "explicitly no border" — we drop the entry so
  // table-level inside borders also don't bleed through (caller checks for
  // explicit nil before falling back to inherited table-level borders).
    if (b.val === 'nil' || b.val === 'none') return undefined;
    const rgb = b.color && b.color !== 'auto' ? `#${b.color.toUpperCase()}` : '#000000';
    const dashStyle = b.val ? (DOCX_BORDER_TO_UNIVER_DASH[b.val] ?? 1) : 1;
    const out: { color: { rgb: string }; width?: { v: number }; dashStyle?: number } = {
        color: { rgb },
        dashStyle,
    };
    if (b.sizeEighths !== undefined) out.width = { v: b.sizeEighths / 8 };
    return out;
}

/** Whether parsed cell explicitly wrote `nil`/`none` for this side (kills inheritance). */
function isExplicitNoBorder(b: ParsedBorder | undefined): boolean {
    return b !== undefined && (b.val === 'nil' || b.val === 'none');
}

function marginToUniver(m: ParsedCellMargin | undefined, fallback: {
    start: number;
    end: number;
    top: number;
    bottom: number;
}) {
    return {
        start: { v: m?.start ?? fallback.start },
        end: { v: m?.end ?? fallback.end },
        top: { v: m?.top ?? fallback.top },
        bottom: { v: m?.bottom ?? fallback.bottom },
    };
}

const ALIGN_TO_UNIVER: Record<NonNullable<ParsedTable['align']>, number> = {
    start: 0, // TableAlignmentType.START
    center: 1,
    end: 2,
};

const VALIGN_TO_UNIVER: Record<NonNullable<import('./types').ParsedCell['vAlign']>, number> = {
    top: 2, // VerticalAlignmentType.TOP
    center: 3,
    bottom: 4,
};

const ROW_HEIGHT_RULE_TO_UNIVER: Record<'auto' | 'atLeast' | 'exact', number> = {
    auto: 0, // TableRowHeightRule.AUTO
    atLeast: 1,
    exact: 2,
};

/**
 * Resolve a cell's effective border for one side.
 *
 * Precedence (per ECMA-376 §17.4.39 simplified, ignoring tblStyle for now):
 *   1. Cell wrote `val=nil/none` → no border (inheritance killed).
 *   2. Cell wrote a real border → use it.
 *   3. Side is on the table perimeter → use table.borders.{top|bottom|left|right}.
 *   4. Side is between two cells → use table.borders.insideH or insideV.
 *
 * TODO(unsupported): proper border-conflict resolution between adjacent cells
 * (when two cells both write a side that meets, ECMA-376 picks the heavier/darker
 * one). Univer doesn't render shared edges, so the visual difference is minor.
 */
function resolveCellBorder(
    side: 'top' | 'bottom' | 'left' | 'right',
    cellBorders: ParsedCellBorders | undefined,
    tableBorders: ParsedTable['borders'],
    isPerimeter: boolean
): ParsedBorder | undefined {
    const own = cellBorders?.[side];
    if (isExplicitNoBorder(own)) return undefined;
    if (own) return own;
    if (!tableBorders) return undefined;
    if (isPerimeter) return tableBorders[side];
  // Interior side: insideH for top/bottom, insideV for left/right
    if (side === 'top' || side === 'bottom') return tableBorders.insideH;
    return tableBorders.insideV;
}

function emitTable(t: ParsedTable, acc: Accumulator, ctx: AssembleContext) {
    const tableId = `tbl_${uuidv4()}`;
    const start = acc.data.length;
    acc.data += TABLE_START;

    for (const row of t.rows) {
        acc.data += TABLE_ROW_START;
        for (const cell of row) {
            acc.data += TABLE_CELL_START;
            for (const p of cell.paragraphs) {
                emitParagraph(p, acc, ctx);
            }
      // Univer's view-model expects each cell to end with a SECTION_BREAK
      // after the last paragraph's PARAGRAPH (\r). Without the \n, the cell
      // node ends up with no children and view-model construction fails,
      // causing the table to silently drop from the rendered document.
            acc.sectionBreaks.push({ startIndex: acc.data.length });
            acc.data += '\n';
            acc.data += TABLE_CELL_END;
        }
        acc.data += TABLE_ROW_END;
    }
    acc.data += TABLE_END;
    const end = acc.data.length - 1;
    acc.tables.push({ startIndex: start, endIndex: end, tableId });

  // Defaults required by Univer (see getEmptyTable in docs-ui). Without the
  // align/indent/textWrap/position/dist/size/cellMargin block, doc-skeleton
  // silently fails to lay out the table → it disappears in the renderer.
  // Values are CSS px (Univer's INumberUnit convention — see UNITS.md).
    const defaultMargin = { start: 10, end: 10, top: 5, bottom: 5 };
    const tableCellMargin = marginToUniver(t.cellMargin, defaultMargin);

  // Column widths: prefer tblGrid (already px); otherwise split a default body width.
  // 451 px ≈ A4 minus typical 1" margins (was 451 pt before unit unification).
    const colCount = Math.max(0, ...t.rows.map((r) => r.reduce((n, c) => n + (c.columnSpan ?? 1), 0)));
    const fallbackWidth = colCount > 0 ? 601 / colCount : 0;
    const colSizes: number[] =
        t.columnWidths && t.columnWidths.length > 0
            ? t.columnWidths
            : new Array(colCount).fill(fallbackWidth);
    const totalWidth = colSizes.reduce((a, b) => a + b, 0);
    const tableSize =
        t.preferredWidthPx !== undefined
            ? { type: 1, width: { v: t.preferredWidthPx } } // SPECIFIED when w:tblW dxa explicit
            : { type: 0, width: { v: totalWidth } }; // UNSPECIFIED matches Univer's getEmptyTable

    const rowCount = t.rows.length;

    acc.tableSource[tableId] = {
        tableId,
        tableRows: t.rows.map((row, ri) => {
            const colCountInRow = row.reduce((n, c) => n + (c.columnSpan ?? 1), 0);
            let colCursor = 0;
            const tableCells = row.map((c) => {
                const colStart = colCursor;
                const colEnd = colCursor + (c.columnSpan ?? 1) - 1;
                colCursor += c.columnSpan ?? 1;

                const cellEntry: Record<string, unknown> = {
          // Cell margin: cell-level overrides table-level, table-level overrides global default.
                    margin: marginToUniver(c.margin, {
                        start: t.cellMargin?.start ?? defaultMargin.start,
                        end: t.cellMargin?.end ?? defaultMargin.end,
                        top: t.cellMargin?.top ?? defaultMargin.top,
                        bottom: t.cellMargin?.bottom ?? defaultMargin.bottom,
                    }),
                };
                if (c.rowSpan !== undefined) cellEntry.rowSpan = c.rowSpan;
                if (c.columnSpan !== undefined) cellEntry.columnSpan = c.columnSpan;

        // Background: cell shading wins, falls back to table-level default.
                const fill = c.shadingFill ?? t.shadingFill;
                if (fill && fill !== 'auto') cellEntry.backgroundColor = { rgb: `#${fill.toUpperCase()}` };

        // Borders: per-side resolution against table perimeter / inside borders.
        // Note: rowSpan continuation isn't perimeter-aware (e.g. a merged cell
        // crossing the bottom row treats its bottom as interior). Word's actual
        // perimeter detection accounts for vMerge — we do the simple geometric
        // check here; misalignment shows up only on vertically merged cells
        // touching the table edge.
                const sides: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];
                const isPerimeter: Record<typeof sides[number], boolean> = {
                    top: ri === 0,
                    bottom: ri + (c.rowSpan ?? 1) - 1 === rowCount - 1,
                    left: colStart === 0,
                    right: colEnd === colCountInRow - 1,
                };
                for (const side of sides) {
                    const resolved = resolveCellBorder(side, c.borders, t.borders, isPerimeter[side]);
                    const u = borderToUniver(resolved);
                    if (u) {
                        const key = `border${side[0].toUpperCase()}${side.slice(1)}`;
                        cellEntry[key] = u;
                    }
                }

                if (c.vAlign) cellEntry.vAlign = VALIGN_TO_UNIVER[c.vAlign];
                if (c.preferredWidthPx !== undefined) {
                    cellEntry.size = { type: 1, width: { v: c.preferredWidthPx } }; // SPECIFIED
                }

                return cellEntry;
            });

            const trHeight =
                t.rowHeights?.[ri] !== undefined
                    ? { val: { v: t.rowHeights[ri]!.v }, hRule: ROW_HEIGHT_RULE_TO_UNIVER[t.rowHeights[ri]!.rule] }
                    : { val: { v: 0 }, hRule: 0 };

            const rowEntry: Record<string, unknown> = { tableCells, trHeight };
            if (t.rowCantSplit?.[ri]) rowEntry.cantSplit = 1; // BooleanNumber.TRUE
            if (t.rowIsHeader?.[ri]) rowEntry.repeatHeaderRow = 1;
            return rowEntry;
        }),
        tableColumns: colSizes.map((w) => ({
            size: { type: 1, width: { v: w } }, // TableSizeType.SPECIFIED
        })),
        align: t.align ? ALIGN_TO_UNIVER[t.align] : 0,
        indent: { v: t.indentPx ?? 0 },
        textWrap: 0, // TableTextWrapType.NONE — TODO(unsupported): <w:tblpPr> floating tables map to WRAP
        position: {
            positionH: { relativeFrom: 0, posOffset: 0 }, // ObjectRelativeFromH.PAGE
            positionV: { relativeFrom: 0, posOffset: 0 }, // ObjectRelativeFromV.PAGE
      // TODO(unsupported): <w:tblpPr> tblpX/tblpY/tblpXSpec/tblpYSpec/horzAnchor/vertAnchor → ITableAnchor
        },
        dist: { distB: 0, distL: 0, distR: 0, distT: 0 },
    // TODO(unsupported): <w:tblpPr> leftFromText/rightFromText/topFromText/bottomFromText → IDistFromText
        cellMargin: tableCellMargin,
        size: tableSize,
        ...(t.layout ? { layout: t.layout === 'fixed' ? 1 : 0 } : {}), // TableLayoutType.FIXED=1, AUTO_FIT=0
    };
}

export function assembleDocument(children: DocumentChild[], ctx: AssembleContext): IDocumentData {
    const acc: Accumulator = {
        data: '',
        textRuns: [],
        paragraphs: [],
        sectionBreaks: [],
        tables: [],
        customRanges: [],
        customBlocks: [],
        drawings: {},
        tableSource: {},
        listsUsed: new Map(),
    };

    for (const child of children) {
        if (child.kind === 'paragraph') emitParagraph(child.paragraph, acc, ctx);
        else emitTable(child.table, acc, ctx);
    }

    acc.data += '\n';

  // Map OOXML w:numFmt → Univer ListGlyphType.
  // 0=BULLET, 2=DECIMAL, 3=DECIMAL_ZERO, 4=UPPER_LETTER, 5=LOWER_LETTER,
  // 6=UPPER_ROMAN, 7=LOWER_ROMAN. Anything unrecognized falls back to DECIMAL
  // for ordered lists (the safe default — produces 1, 2, 3 …).
    const numFmtToGlyphType = (format: string): number => {
        switch (format) {
            case 'bullet':
                return 0;
            case 'decimal':
                return 2;
            case 'decimalZero':
                return 3;
            case 'upperLetter':
                return 4;
            case 'lowerLetter':
                return 5;
            case 'upperRoman':
                return 6;
            case 'lowerRoman':
                return 7;
            default:
                return 2;
        }
    };

    const lists: Record<string, IListData> = {};
    for (const [numId, def] of acc.listsUsed) {
        lists[numId] = {
            listType: def.listType,
            nestingLevel: def.levels.map((l) => {
                const props: { indentStart?: { v: number }; hanging?: { v: number }; indentFirstLine?: { v: number } } = {};
                if (l.indentStart) props.indentStart = l.indentStart;
                if (l.hanging) props.hanging = l.hanging;
                if (l.indentFirstLine) props.indentFirstLine = l.indentFirstLine;
                const entry: IListData['nestingLevel'][number] = {
                    bulletAlignment: 0,
                    glyphFormat: l.text,
          // Univer's bullet renderer treats startNumber as an OFFSET added to the previous
          // item's startIndexItem (which defaults to 1 for the first item). So an OOXML
          // start=1 ("begin counting from 1") maps to Univer startNumber=0, otherwise the
          // first item renders as 2.
                    startNumber: Math.max(0, l.start - 1),
                    glyphType: numFmtToGlyphType(l.format),
                };
                if (Object.keys(props).length > 0) {
                    entry.paragraphProperties = props as IListData['nestingLevel'][number]['paragraphProperties'];
                }
                return entry;
            }),
        };
    }

    const body: IDocumentBody = {
        dataStream: acc.data,
        textRuns: acc.textRuns,
        paragraphs: acc.paragraphs,
    };
    if (acc.tables.length > 0) body.tables = acc.tables;

  // Univer's view-model looks up sectionBreak by `startIndex === sectionNode.endIndex`,
  // and the top-level section's endIndex is `dataStream.length - 1`. Without a break
  // sitting at that exact index, the renderer falls back to DEFAULT_SECTION_BREAK
  // (linePitch=15.6, gridType=LINES) and per-section <w:docGrid> values are lost —
  // even when other breaks exist mid-stream (e.g. table cell terminators).
    const docEndIndex = Math.max(0, acc.data.length - 1);
    if (!acc.sectionBreaks.some((sb) => sb.startIndex === docEndIndex)) {
        acc.sectionBreaks.push({ startIndex: docEndIndex });
    }
    if (ctx.sectionBreakDefaults && Object.keys(ctx.sectionBreakDefaults).length > 0) {
        for (const sb of acc.sectionBreaks) {
            Object.assign(sb, ctx.sectionBreakDefaults, { startIndex: sb.startIndex });
        }
    }
    body.sectionBreaks = acc.sectionBreaks;
    if (acc.customRanges.length > 0) body.customRanges = acc.customRanges;
    if (acc.customBlocks.length > 0) body.customBlocks = acc.customBlocks;

    const docData: IDocumentData = {
        id: uuidv4(),
        documentStyle: ctx.documentStyle ?? {},
        body,
    };
    if (Object.keys(acc.tableSource).length > 0) docData.tableSource = acc.tableSource as IDocumentData['tableSource'];
    if (Object.keys(acc.drawings).length > 0) docData.drawings = acc.drawings as IDocumentData['drawings'];
    if (Object.keys(lists).length > 0) docData.lists = lists;

    return docData;
}
