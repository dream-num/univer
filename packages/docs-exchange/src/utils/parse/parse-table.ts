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

import type { DrawingInfo } from './parse-drawing';
import type { StylesIndex } from './parse-styles';
import type { ThemeFonts } from './parse-theme';
import type {
    ParsedBorder,
    ParsedCell,
    ParsedCellBorders,
    ParsedCellMargin,
    ParsedTable,
    ParsedTableBorders,
} from './types';
import type { XmlNode } from './xml';
import { dxaToPx } from '../units';
import { parseParagraph } from './parse-paragraph';
import { findChild, findChildren, nodeAttrs, nodeChildren, nodeName } from './xml';

// TODO(unsupported): nested tables — inner <w:tbl> inside <w:tc> are silently dropped (only <w:p> children parsed)
// TODO(unsupported): <w:sdt> structured-document-tags wrapping cells/rows — current code only matches direct <w:tr>/<w:tc>; SDT-wrapped rows are skipped
// TODO(unsupported): <w:tblPrEx> per-row table-property override — would shadow ParsedTable fields for one row
// TODO(unsupported): <w:tblPr><w:tblpPr> floating-table positioning, <w:tblOverlap> — Univer ITable supports position/overlap but we don't surface them
// TODO(unsupported): <w:tblPr><w:tblCaption>, <w:tblDescription> — Univer ITable.description exists but not wired

function parseBorder(node: XmlNode): ParsedBorder {
    const a = nodeAttrs(node);
    const out: ParsedBorder = {};
    const val = a['@_w:val'] as string | undefined;
    if (val) out.val = val;
    const color = a['@_w:color'] as string | undefined;
    if (color) out.color = color;
    const sz = Number(a['@_w:sz']);
    if (!Number.isNaN(sz)) out.sizeEighths = sz;
  // TODO(unsupported): <w:bdr> w:space (offset from text), w:shadow, w:frame, w:themeColor/themeTint/themeShade
    return out;
}

function parseBorderSet<T extends ParsedCellBorders>(node: XmlNode, includeInside: boolean): T {
    const out = {} as T;
    for (const child of nodeChildren(node)) {
        const name = nodeName(child);
        switch (name) {
            case 'w:top':
                (out as ParsedCellBorders).top = parseBorder(child);
                break;
            case 'w:bottom':
                (out as ParsedCellBorders).bottom = parseBorder(child);
                break;
            case 'w:left':
            case 'w:start':
                (out as ParsedCellBorders).left = parseBorder(child);
                break;
            case 'w:right':
            case 'w:end':
                (out as ParsedCellBorders).right = parseBorder(child);
                break;
            case 'w:insideH':
                if (includeInside) (out as ParsedTableBorders).insideH = parseBorder(child);
                break;
            case 'w:insideV':
                if (includeInside) (out as ParsedTableBorders).insideV = parseBorder(child);
                break;
      // TODO(unsupported): tcBorders <w:tl2br>, <w:tr2bl> diagonal borders — Univer ITableCell has no diagonal slot
        }
    }
    return out;
}

function parseShdFill(shd: XmlNode): string | undefined {
    const fill = nodeAttrs(shd)['@_w:fill'] as string | undefined;
    if (!fill || fill === 'auto') return undefined;
    return fill;
  // TODO(unsupported): <w:shd> w:val (shading pattern: pct10/pct20/diagStripe/...), w:color (foreground stipple), themeFill/themeFillTint/themeFillShade
}

function parseMargins(node: XmlNode): ParsedCellMargin | undefined {
    const out: ParsedCellMargin = {};
    for (const child of nodeChildren(node)) {
        const name = nodeName(child);
        const a = nodeAttrs(child);
        const w = Number(a['@_w:w']);
        if (Number.isNaN(w)) continue;
    // TODO(unsupported): w:type="pct" / "nil" / "auto" — only dxa is honored; other unit types fall through as dxa
        const px = dxaToPx(w);
        if (name === 'w:top') out.top = px;
        else if (name === 'w:bottom') out.bottom = px;
        else if (name === 'w:start' || name === 'w:left') out.start = px;
        else if (name === 'w:end' || name === 'w:right') out.end = px;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function parseCellPr(tcPr: XmlNode, cell: ParsedCell): void {
    for (const child of nodeChildren(tcPr)) {
        const name = nodeName(child);
        const a = nodeAttrs(child);
        switch (name) {
            case 'w:gridSpan': {
                const v = Number(a['@_w:val']);
                if (!Number.isNaN(v) && v > 1) cell.columnSpan = v;
                break;
            }
            case 'w:vMerge': {
                const v = a['@_w:val'] as string | undefined;
                cell.vMerge = v === 'restart' ? 'restart' : 'continue';
                break;
            }
            case 'w:shd': {
                const fill = parseShdFill(child);
                if (fill) cell.shadingFill = fill;
                break;
            }
            case 'w:tcBorders':
                cell.borders = parseBorderSet<ParsedCellBorders>(child, false);
                break;
            case 'w:vAlign': {
                const v = a['@_w:val'] as string | undefined;
                if (v === 'top' || v === 'center' || v === 'bottom') cell.vAlign = v;
        // TODO(unsupported): vAlign "both" (justify) — Univer VerticalAlignmentType.BOTH exists but Word never emits it; safe to ignore
                break;
            }
            case 'w:tcMar': {
                const m = parseMargins(child);
                if (m) cell.margin = m;
                break;
            }
            case 'w:tcW': {
                const type = a['@_w:type'] as string | undefined;
                const w = Number(a['@_w:w']);
        // TODO(unsupported): w:type="pct" (percent), "auto", "nil" — only "dxa" preserved as preferredWidthPx
                if (type === 'dxa' && !Number.isNaN(w)) cell.preferredWidthPx = dxaToPx(w);
                break;
            }
      // TODO(unsupported): <w:tcFitText> (Univer has tcFitText), <w:noWrap>, <w:hideMark>, <w:textDirection>,
      //                    <w:cellDel>/<w:cellIns>/<w:cellMerge> revision marks
        }
    }
}

function parseTblPr(tblPr: XmlNode, t: ParsedTable): void {
    for (const child of nodeChildren(tblPr)) {
        const name = nodeName(child);
        const a = nodeAttrs(child);
        switch (name) {
            case 'w:tblStyle': {
                const v = a['@_w:val'] as string | undefined;
                if (v) t.styleRef = v;
        // TODO(unsupported): styleRef is captured but tblStyle inheritance + <w:tblStylePr> conditional formatting
        //                    (firstRow/lastRow/firstCol/lastCol/band1Horz/band2Horz/...) not yet applied — Phase 3.
        //                    <w:tblLook> conditional-formatting toggle is also ignored (Phase 3).
                break;
            }
            case 'w:tblBorders':
                t.borders = parseBorderSet<ParsedTableBorders>(child, true);
                break;
            case 'w:shd': {
                const fill = parseShdFill(child);
                if (fill) t.shadingFill = fill;
                break;
            }
            case 'w:tblCellMar': {
                const m = parseMargins(child);
                if (m) t.cellMargin = m;
                break;
            }
            case 'w:jc': {
                const v = a['@_w:val'] as string | undefined;
                if (v === 'start' || v === 'left') t.align = 'start';
                else if (v === 'center') t.align = 'center';
                else if (v === 'end' || v === 'right') t.align = 'end';
                break;
            }
            case 'w:tblInd': {
                const type = a['@_w:type'] as string | undefined;
                const w = Number(a['@_w:w']);
        // TODO(unsupported): w:type="pct"/"auto"/"nil" — only dxa converted to px
                if ((type === undefined || type === 'dxa') && !Number.isNaN(w)) t.indentPx = dxaToPx(w);
                break;
            }
            case 'w:tblLayout': {
                const v = a['@_w:type'] as string | undefined;
                if (v === 'fixed') t.layout = 'fixed';
                else if (v === 'autofit') t.layout = 'autofit';
                break;
            }
            case 'w:tblW': {
                const type = a['@_w:type'] as string | undefined;
                const w = Number(a['@_w:w']);
        // TODO(unsupported): w:type="auto" (use tblGrid sum), "pct", "nil" — only dxa surfaced
                if (type === 'dxa' && !Number.isNaN(w)) t.preferredWidthPx = dxaToPx(w);
                break;
            }
      // TODO(unsupported): <w:bidiVisual> RTL, <w:tblpPr> floating positioning, <w:tblOverlap>,
      //                    <w:tblCaption>, <w:tblDescription>, <w:tblLook>
        }
    }
}

// Shallow merge for inherited table-level fields; child (inline) attributes
// override parent (style) attributes.
function mergeBordersInherit<T extends ParsedCellBorders>(parent: T | undefined, child: T | undefined): T | undefined {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function mergeMarginInherit(
    parent: ParsedCellMargin | undefined,
    child: ParsedCellMargin | undefined
): ParsedCellMargin | undefined {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function parseRowPr(trPr: XmlNode): {
    height?: { v: number; rule: 'auto' | 'atLeast' | 'exact' };
    cantSplit?: boolean;
    isHeader?: boolean;
} {
    const out: ReturnType<typeof parseRowPr> = {};
    for (const child of nodeChildren(trPr)) {
        const name = nodeName(child);
        const a = nodeAttrs(child);
        switch (name) {
            case 'w:trHeight': {
                const v = Number(a['@_w:val']);
                if (Number.isNaN(v)) break;
                const rule = a['@_w:hRule'] as string | undefined;
        // ECMA-376 §17.4.81: omitted hRule defaults to "atLeast", not "auto".
                let mapped: 'auto' | 'atLeast' | 'exact' = 'atLeast';
                if (rule === 'auto') mapped = 'auto';
                else if (rule === 'exact') mapped = 'exact';
                out.height = { v: dxaToPx(v), rule: mapped };
                break;
            }
            case 'w:cantSplit':
                out.cantSplit = true;
                break;
            case 'w:tblHeader':
                out.isHeader = true;
                break;
      // TODO(unsupported): <w:trPr><w:jc> row alignment (Univer ITableRow has no row-jc; would map to per-cell?),
      //                    <w:hidden>, <w:divId>, <w:gridBefore>/<w:gridAfter>/<w:wBefore>/<w:wAfter>,
      //                    <w:trPrChange> revisions
        }
    }
    return out;
}

export function parseTable(
    tblNode: Record<string, unknown>,
    drawingsOut?: Map<string, DrawingInfo>,
    styles?: StylesIndex,
    themeFonts?: ThemeFonts
): ParsedTable {
    const result: ParsedTable = { rows: [] };

    const tblPr = findChild(tblNode, 'w:tblPr');
    if (tblPr) parseTblPr(tblPr, result);

  // Apply tblStyle inheritance: resolve the named style chain (with basedOn) and
  // merge its tblPr/tcPr defaults UNDER the inline values we already parsed.
  // Inline always wins per ECMA-376 §17.7.6 simplified hierarchy
  // (docDefaults < tblStyle (chain) < direct inline). tblStylePr conditional
  // formatting is intentionally not applied — see TODO(unsupported) in parse-styles.ts.
    const resolvedStyle = styles?.resolveTableStyle(result.styleRef);
    if (resolvedStyle) {
        if (resolvedStyle.borders) {
            result.borders = mergeBordersInherit(resolvedStyle.borders, result.borders);
        }
        if (result.shadingFill === undefined && resolvedStyle.shadingFill) {
            result.shadingFill = resolvedStyle.shadingFill;
        }
        if (resolvedStyle.cellMargin) {
            result.cellMargin = mergeMarginInherit(resolvedStyle.cellMargin, result.cellMargin);
        }
    // tcPr defaults from table style become per-cell defaults baked at parse time
    // — we apply them to each cell below where the cell didn't write its own value.
    }
  // Stash style-derived per-cell defaults so we can apply them to each cell after parsing.
    const styleCellDefaults = resolvedStyle
        ? {
            borders: resolvedStyle.cellBorders,
            shadingFill: resolvedStyle.cellShadingFill,
            vAlign: resolvedStyle.cellVAlign,
            margin: resolvedStyle.cellMargin_tcPr,
        }
        : undefined;

    const rawRows: ParsedCell[][] = [];
    const rowHeights: ({ v: number; rule: 'auto' | 'atLeast' | 'exact' } | undefined)[] = [];
    const rowCantSplit: boolean[] = [];
    const rowIsHeader: boolean[] = [];

    for (const child of nodeChildren(tblNode)) {
        if (nodeName(child) !== 'w:tr') continue;

        const trPr = findChild(child, 'w:trPr');
        const rowPr = trPr ? parseRowPr(trPr) : {};
        rowHeights.push(rowPr.height);
        rowCantSplit.push(rowPr.cantSplit ?? false);
        rowIsHeader.push(rowPr.isHeader ?? false);

        const cells: ParsedCell[] = [];
        for (const tc of nodeChildren(child)) {
            if (nodeName(tc) !== 'w:tc') continue;

            const paragraphs = nodeChildren(tc)
                .filter((c) => nodeName(c) === 'w:p')
                .map((p) => parseParagraph(p, drawingsOut, styles, themeFonts));

            const cell: ParsedCell = { paragraphs };
            const tcPr = findChild(tc, 'w:tcPr');
            if (tcPr) parseCellPr(tcPr, cell);

      // Inherit table-style tcPr defaults UNDER any inline values the cell wrote.
      // Inline always wins; style fills the gaps.
            if (styleCellDefaults) {
                if (styleCellDefaults.borders) {
                    cell.borders = mergeBordersInherit(styleCellDefaults.borders, cell.borders);
                }
                if (cell.shadingFill === undefined && styleCellDefaults.shadingFill) {
                    cell.shadingFill = styleCellDefaults.shadingFill;
                }
                if (cell.vAlign === undefined && styleCellDefaults.vAlign) {
                    cell.vAlign = styleCellDefaults.vAlign;
                }
                if (styleCellDefaults.margin) {
                    cell.margin = mergeMarginInherit(styleCellDefaults.margin, cell.margin);
                }
            }

            cells.push(cell);
        }
        if (cells.length > 0) rawRows.push(cells);
    }

  // Pass 2: compute rowSpan for vMerge=restart cells by counting subsequent
  // continue cells in the same column position (column index = sum of preceding columnSpans).
    for (let r = 0; r < rawRows.length; r++) {
        let colCursor = 0;
        for (const cell of rawRows[r]) {
            if (cell.vMerge === 'restart') {
                const startCol = colCursor;
                let span = 1;
                for (let r2 = r + 1; r2 < rawRows.length; r2++) {
                    let c2 = 0;
                    let matched: ParsedCell | undefined;
                    for (const c of rawRows[r2]) {
                        if (c2 === startCol) {
                            matched = c;
                            break;
                        }
                        c2 += c.columnSpan ?? 1;
                    }
                    if (matched && matched.vMerge === 'continue') span++;
                    else break;
                }
                if (span > 1) cell.rowSpan = span;
            }
            colCursor += cell.columnSpan ?? 1;
        }
    }

    result.rows = rawRows;

    const grid = findChild(tblNode, 'w:tblGrid');
    if (grid) {
        const cols = findChildren(grid, 'w:gridCol');
        result.columnWidths = cols.map((c) => {
            const w = Number(nodeAttrs(c)['@_w:w']);
            return Number.isNaN(w) ? 0 : dxaToPx(w);
        });
    }

    if (rowHeights.some((h) => h !== undefined)) result.rowHeights = rowHeights;
    if (rowCantSplit.some(Boolean)) result.rowCantSplit = rowCantSplit;
    if (rowIsHeader.some(Boolean)) result.rowIsHeader = rowIsHeader;

    return result;
}
