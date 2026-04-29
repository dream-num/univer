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

import type { IUniverTextStyle } from '../types';
import type { RFontsAttrs } from './parse-run';
import type {
    ParsedCell,
    ParsedCellBorders,
    ParsedCellMargin,
    ParsedParagraphStyle,
    ParsedTableBorders,
} from './types';
import type { XmlNode } from './xml';
import { dxaToPx } from '../units';
import { parsePPr } from './parse-paragraph-style';
import { extractRFonts, parseRPr } from './parse-run';
import { findChild, findChildren, nodeAttrs, nodeChildren, nodeName, xmlParser } from './xml';

export interface NamedStyle {
    basedOn?: string;
    pPr?: ParsedParagraphStyle;
    rPr?: IUniverTextStyle;
    rFonts?: RFontsAttrs;
}

/**
 * Subset of <w:style w:type="table"> we honor when resolving inheritance.
 * Mirrors fields we already surface from inline tbl/tr/tc — anything Univer
 * doesn't render is intentionally dropped here.
 *
 * TODO(unsupported): <w:tblStylePr> conditional formatting (firstRow/lastRow/
 * firstCol/lastCol/band1Horz/band2Horz/band1Vert/band2Vert/neCell/nwCell/
 * seCell/swCell/wholeTable). Handling these requires <w:tblLook> evaluation
 * to know which buckets to apply per row/col, plus per-position merging during
 * parseTable. Phase 3 deferred.
 */
export interface NamedTableStyle {
    basedOn?: string;
  /** Default cell padding from <w:tblPr><w:tblCellMar>. */
    cellMargin?: ParsedCellMargin;
  /** Default borders/shading from <w:tblPr>. */
    borders?: ParsedTableBorders;
    shadingFill?: string;
  /** Per-cell defaults from <w:tcPr> directly under <w:style> (apply to all cells). */
    cellBorders?: ParsedCellBorders;
    cellShadingFill?: string;
    cellVAlign?: ParsedCell['vAlign'];
    cellMargin_tcPr?: ParsedCellMargin;
  /** Run defaults from <w:rPr> directly under <w:style> (apply to all cell text). */
    rPr?: IUniverTextStyle;
    rFonts?: RFontsAttrs;
}

export interface ResolvedStyle {
    pPr?: ParsedParagraphStyle;
    rPr?: IUniverTextStyle;
    rFonts?: RFontsAttrs;
}

export interface ResolvedTableStyle {
    cellMargin?: ParsedCellMargin;
    borders?: ParsedTableBorders;
    shadingFill?: string;
    cellBorders?: ParsedCellBorders;
    cellShadingFill?: string;
    cellVAlign?: ParsedCell['vAlign'];
    cellMargin_tcPr?: ParsedCellMargin;
    rPr?: IUniverTextStyle;
    rFonts?: RFontsAttrs;
}

export interface StylesIndex {
    docDefaults: { pPr?: ParsedParagraphStyle; rPr?: IUniverTextStyle; rFonts?: RFontsAttrs };
    paragraphStyles: Map<string, NamedStyle>;
    characterStyles: Map<string, NamedStyle>;
    tableStyles: Map<string, NamedTableStyle>;
    resolvePStyle(styleId: string | undefined): ResolvedStyle;
    resolveRStyle(styleId: string | undefined): IUniverTextStyle | undefined;
    resolveRFonts(styleId: string | undefined): RFontsAttrs | undefined;
    resolveTableStyle(styleId: string | undefined): ResolvedTableStyle;
}

const EMPTY_INDEX: StylesIndex = {
    docDefaults: {},
    paragraphStyles: new Map(),
    characterStyles: new Map(),
    tableStyles: new Map(),
    resolvePStyle: () => ({}),
    resolveRStyle: () => undefined,
    resolveRFonts: () => undefined,
    resolveTableStyle: () => ({}),
};

function mergePPr(
    parent: ParsedParagraphStyle | undefined,
    child: ParsedParagraphStyle | undefined
): ParsedParagraphStyle | undefined {
    if (!parent) return child;
    if (!child) return parent;
    const merged: ParsedParagraphStyle = { ...parent, ...child };
    if (parent.tabStops || child.tabStops || child.tabStopsClear) {
        const cleared = new Set(child.tabStopsClear ?? []);
        const byOffset = new Map<number, { offset: number; alignment: number }>();
        for (const stop of parent.tabStops ?? []) {
            if (!cleared.has(stop.offset)) byOffset.set(stop.offset, stop);
        }
        for (const stop of child.tabStops ?? []) byOffset.set(stop.offset, stop);
        const finalStops = [...byOffset.values()].sort((a, b) => a.offset - b.offset);
        if (finalStops.length > 0) merged.tabStops = finalStops;
        else delete merged.tabStops;
        delete merged.tabStopsClear;
    }
    return merged;
}

function mergeRPr(
    parent: IUniverTextStyle | undefined,
    child: IUniverTextStyle | undefined
): IUniverTextStyle | undefined {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function mergeRFonts(parent: RFontsAttrs | undefined, child: RFontsAttrs | undefined): RFontsAttrs | undefined {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function parseDocDefaults(stylesRoot: XmlNode): {
    pPr?: ParsedParagraphStyle;
    rPr?: IUniverTextStyle;
    rFonts?: RFontsAttrs;
} {
    const out: { pPr?: ParsedParagraphStyle; rPr?: IUniverTextStyle; rFonts?: RFontsAttrs } = {};
    const docDefaults = findChild(stylesRoot, 'w:docDefaults');
    if (!docDefaults) return out;
    const rPrDefault = findChild(docDefaults, 'w:rPrDefault');
    if (rPrDefault) {
        const rPr = findChild(rPrDefault, 'w:rPr');
        const parsed = parseRPr(rPr);
        if (parsed) out.rPr = parsed;
        const rfonts = extractRFonts(rPr);
        if (rfonts) out.rFonts = rfonts;
    }
    const pPrDefault = findChild(docDefaults, 'w:pPrDefault');
    if (pPrDefault) {
        const pPr = findChild(pPrDefault, 'w:pPr');
        const parsed = parsePPr(pPr);
        if (parsed) out.pPr = parsed;
    }
    return out;
}

function parseNamedStyle(styleNode: XmlNode): NamedStyle {
    const basedOnNode = findChild(styleNode, 'w:basedOn');
    const basedOn = basedOnNode ? (nodeAttrs(basedOnNode)['@_w:val'] as string | undefined) : undefined;
    const pPr = findChild(styleNode, 'w:pPr');
    const rPr = findChild(styleNode, 'w:rPr');
    const out: NamedStyle = {};
    if (basedOn) out.basedOn = basedOn;
    const parsedPPr = parsePPr(pPr);
    if (parsedPPr) out.pPr = parsedPPr;
    const parsedRPr = parseRPr(rPr);
    if (parsedRPr) out.rPr = parsedRPr;
    const rfonts = extractRFonts(rPr);
    if (rfonts) out.rFonts = rfonts;
    return out;
}

// Forward-declared to avoid a parse-table.ts circular import at module load.
// We re-implement the small parsers locally rather than reaching into parse-table.ts.
function parseBorderInline(node: XmlNode) {
    const a = nodeAttrs(node);
    const out: { val?: string; color?: string; sizeEighths?: number } = {};
    const val = a['@_w:val'] as string | undefined;
    if (val) out.val = val;
    const color = a['@_w:color'] as string | undefined;
    if (color) out.color = color;
    const sz = Number(a['@_w:sz']);
    if (!Number.isNaN(sz)) out.sizeEighths = sz;
    return out;
}

function parseBorderSetInline(node: XmlNode, includeInside: boolean): ParsedTableBorders {
    const out: ParsedTableBorders = {};
    for (const child of nodeChildren(node)) {
        const name = nodeName(child);
        switch (name) {
            case 'w:top':
                out.top = parseBorderInline(child);
                break;
            case 'w:bottom':
                out.bottom = parseBorderInline(child);
                break;
            case 'w:left':
            case 'w:start':
                out.left = parseBorderInline(child);
                break;
            case 'w:right':
            case 'w:end':
                out.right = parseBorderInline(child);
                break;
            case 'w:insideH':
                if (includeInside) out.insideH = parseBorderInline(child);
                break;
            case 'w:insideV':
                if (includeInside) out.insideV = parseBorderInline(child);
                break;
        }
    }
    return out;
}

function parseMarginsInline(node: XmlNode): ParsedCellMargin | undefined {
    const out: ParsedCellMargin = {};
    for (const child of nodeChildren(node)) {
        const name = nodeName(child);
        const a = nodeAttrs(child);
        const w = Number(a['@_w:w']);
        if (Number.isNaN(w)) continue;
        const px = dxaToPx(w);
        if (name === 'w:top') out.top = px;
        else if (name === 'w:bottom') out.bottom = px;
        else if (name === 'w:start' || name === 'w:left') out.start = px;
        else if (name === 'w:end' || name === 'w:right') out.end = px;
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function parseShdFillInline(shd: XmlNode): string | undefined {
    const fill = nodeAttrs(shd)['@_w:fill'] as string | undefined;
    if (!fill || fill === 'auto') return undefined;
    return fill;
}

function parseNamedTableStyle(styleNode: XmlNode): NamedTableStyle {
    const out: NamedTableStyle = {};
    const basedOnNode = findChild(styleNode, 'w:basedOn');
    const basedOn = basedOnNode ? (nodeAttrs(basedOnNode)['@_w:val'] as string | undefined) : undefined;
    if (basedOn) out.basedOn = basedOn;

  // <w:rPr> directly under <w:style w:type="table"> applies to all cell text.
    const rPr = findChild(styleNode, 'w:rPr');
    const parsedRPr = parseRPr(rPr);
    if (parsedRPr) out.rPr = parsedRPr;
    const rfonts = extractRFonts(rPr);
    if (rfonts) out.rFonts = rfonts;

  // <w:tblPr> — table-level defaults (borders/shading/cellMar)
    const tblPr = findChild(styleNode, 'w:tblPr');
    if (tblPr) {
        const tblBorders = findChild(tblPr, 'w:tblBorders');
        if (tblBorders) out.borders = parseBorderSetInline(tblBorders, true);
        const shd = findChild(tblPr, 'w:shd');
        if (shd) {
            const fill = parseShdFillInline(shd);
            if (fill) out.shadingFill = fill;
        }
        const tblCellMar = findChild(tblPr, 'w:tblCellMar');
        if (tblCellMar) {
            const m = parseMarginsInline(tblCellMar);
            if (m) out.cellMargin = m;
        }
    }

  // <w:tcPr> — per-cell defaults (apply to every cell in tables using this style).
    const tcPr = findChild(styleNode, 'w:tcPr');
    if (tcPr) {
        const tcBorders = findChild(tcPr, 'w:tcBorders');
        if (tcBorders) out.cellBorders = parseBorderSetInline(tcBorders, false) as ParsedCellBorders;
        const shd = findChild(tcPr, 'w:shd');
        if (shd) {
            const fill = parseShdFillInline(shd);
            if (fill) out.cellShadingFill = fill;
        }
        const vAlign = findChild(tcPr, 'w:vAlign');
        if (vAlign) {
            const v = nodeAttrs(vAlign)['@_w:val'] as string | undefined;
            if (v === 'top' || v === 'center' || v === 'bottom') out.cellVAlign = v;
        }
        const tcMar = findChild(tcPr, 'w:tcMar');
        if (tcMar) {
            const m = parseMarginsInline(tcMar);
            if (m) out.cellMargin_tcPr = m;
        }
    }

  // <w:trPr> directly under table style: not surfaced. Univer ITableRow has cantSplit/repeatHeaderRow,
  // but it's vanishingly rare to set those at the style level (they're per-row in practice).
  // TODO(unsupported): <w:trPr> at table-style level (cantSplit/tblHeader/trHeight defaults).

    return out;
}

function mergeBorders(parent: ParsedTableBorders | undefined, child: ParsedTableBorders | undefined) {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function mergeCellBorders(parent: ParsedCellBorders | undefined, child: ParsedCellBorders | undefined) {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function mergeMargin(parent: ParsedCellMargin | undefined, child: ParsedCellMargin | undefined) {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function resolveTableChain(styleId: string | undefined, styles: Map<string, NamedTableStyle>): ResolvedTableStyle {
    if (!styleId) return {};
    const chain: NamedTableStyle[] = [];
    const seen = new Set<string>();
    let cur: string | undefined = styleId;
    while (cur && !seen.has(cur)) {
        seen.add(cur);
        const s = styles.get(cur);
        if (!s) break;
        chain.push(s);
        cur = s.basedOn;
    }
    let out: ResolvedTableStyle = {};
  // Walk root → leaf so leaf wins.
    for (let i = chain.length - 1; i >= 0; i--) {
        const s = chain[i];
        out = {
            borders: mergeBorders(out.borders, s.borders),
            shadingFill: s.shadingFill ?? out.shadingFill,
            cellMargin: mergeMargin(out.cellMargin, s.cellMargin),
            cellBorders: mergeCellBorders(out.cellBorders, s.cellBorders),
            cellShadingFill: s.cellShadingFill ?? out.cellShadingFill,
            cellVAlign: s.cellVAlign ?? out.cellVAlign,
            cellMargin_tcPr: mergeMargin(out.cellMargin_tcPr, s.cellMargin_tcPr),
            rPr: mergeRPr(out.rPr, s.rPr),
            rFonts: mergeRFonts(out.rFonts, s.rFonts),
        };
    }
    return out;
}

/**
 * Walk basedOn chain from the root parent down to the given styleId, merging
 * each level's pPr/rPr/rFonts on top of the previous. Returns the fully-resolved style.
 *
 * Cycle protection: tracks visited styleIds; bails on revisit.
 */
function resolveChain(styleId: string | undefined, styles: Map<string, NamedStyle>): ResolvedStyle {
    if (!styleId) return {};
    const chain: NamedStyle[] = [];
    const seen = new Set<string>();
    let cur: string | undefined = styleId;
    while (cur && !seen.has(cur)) {
        seen.add(cur);
        const style = styles.get(cur);
        if (!style) break;
        chain.push(style);
        cur = style.basedOn;
    }
    let pPr: ParsedParagraphStyle | undefined;
    let rPr: IUniverTextStyle | undefined;
    let rFonts: RFontsAttrs | undefined;
    for (let i = chain.length - 1; i >= 0; i--) {
        pPr = mergePPr(pPr, chain[i].pPr);
        rPr = mergeRPr(rPr, chain[i].rPr);
        rFonts = mergeRFonts(rFonts, chain[i].rFonts);
    }
    const out: ResolvedStyle = {};
    if (pPr) out.pPr = pPr;
    if (rPr) out.rPr = rPr;
    if (rFonts) out.rFonts = rFonts;
    return out;
}

export function parseStyles(stylesXml: string | undefined): StylesIndex {
    if (!stylesXml) return EMPTY_INDEX;

    let parsed: XmlNode[];
    try {
        parsed = xmlParser.parse(stylesXml) as XmlNode[];
    } catch {
        return EMPTY_INDEX;
    }

    const root = parsed.find((n) => nodeName(n) === 'w:styles');
    if (!root) return EMPTY_INDEX;

    const docDefaults = parseDocDefaults(root);
    const paragraphStyles = new Map<string, NamedStyle>();
    const characterStyles = new Map<string, NamedStyle>();
    const tableStyles = new Map<string, NamedTableStyle>();

    for (const styleNode of findChildren(root, 'w:style')) {
        const attrs = nodeAttrs(styleNode);
        const type = attrs['@_w:type'] as string | undefined;
        const styleId = attrs['@_w:styleId'] as string | undefined;
        if (!styleId) continue;
        if (type === 'paragraph') paragraphStyles.set(styleId, parseNamedStyle(styleNode));
        else if (type === 'character') characterStyles.set(styleId, parseNamedStyle(styleNode));
        else if (type === 'table') tableStyles.set(styleId, parseNamedTableStyle(styleNode));
    // TODO(unsupported): w:type="numbering" — list-only style entry, currently ignored
    }

    return {
        docDefaults,
        paragraphStyles,
        characterStyles,
        tableStyles,
        resolvePStyle: (id) => resolveChain(id, paragraphStyles),
        resolveRStyle: (id) => resolveChain(id, characterStyles).rPr,
        resolveRFonts: (id) => resolveChain(id, characterStyles).rFonts,
        resolveTableStyle: (id) => resolveTableChain(id, tableStyles),
    };
}
