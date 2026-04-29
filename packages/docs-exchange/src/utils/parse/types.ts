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

export interface ParsedRun {
    text: string;
    style?: IUniverTextStyle;
    hyperlink?: { url: string };
    drawingId?: string;
  /**
   * OOXML field code semantics preserved past the importer (e.g. "PAGE", "NUMPAGES").
   * When set, `text` is the placeholder the renderer should substitute at paint time —
   * NOT the cached value Word wrote between <w:fldChar separate/> and <w:fldChar end/>.
   * Renderer support is tracked separately; importer just guarantees the cached value
   * doesn't leak through as static text (would freeze the page number forever).
   */
    fieldType?: 'PAGE' | 'NUMPAGES';
}

export interface ParsedBullet {
    numId: string;
    ilvl: number;
}

export interface ParsedParagraphStyle {
    horizontalAlign?: number;
    namedStyleType?: number;
  /** Line spacing: AUTO multiplier (1.0 = single) or pt for AT_LEAST/EXACT. */
    lineSpacing?: number;
  /** 0=AUTO, 1=AT_LEAST, 2=EXACT — matches Univer's SpacingRule. */
    spacingRule?: number;
  /** Space-before in pt. */
    spaceAbove?: { v: number };
  /** Space-after in pt. */
    spaceBelow?: { v: number };
  /** Left/start indentation in pt. */
    indentStart?: { v: number };
  /** Right/end indentation in pt. */
    indentEnd?: { v: number };
  /** First-line indentation in pt (mutually exclusive with hanging in OOXML). */
    indentFirstLine?: { v: number };
  /** Hanging indentation in pt. */
    hanging?: { v: number };
    borderTop?: { color?: { rgb: string }; width?: number; dashStyle?: number; padding?: number };
    borderBottom?: {
        color?: { rgb: string };
        width?: number;
        dashStyle?: number;
        padding?: number;
    };
  /**
   * Tab stops from <w:tabs>. `offset` is CSS px (dxa / 15). `alignment` mirrors
   * Univer's TabStopAlignment enum (1=START, 2=CENTER, 3=END). Sorted by offset
   * ascending. Already merged with inheritance (w:val="clear" entries removed).
   */
    tabStops?: Array<{ offset: number; alignment: number }>;
  /**
   * Positions (CSS px) that the inline <w:tabs> wants to clear from inherited
   * pStyle tab stops. Used only as an intermediate during the pStyle → inline
   * merge; consumers see it stripped (only `tabStops` is meaningful externally).
   */
    tabStopsClear?: number[];
}

export interface ParsedParagraph {
    runs: ParsedRun[];
    bullet?: ParsedBullet;
    style?: ParsedParagraphStyle;
}

export interface ParsedBorder {
  /** RGB hex like "#67A589", or "auto" for theme/inherit. */
    color?: string;
  /** Border width in 1/8 pt (DOCX w:sz unit). Convert to pt via /8 at assemble time. */
    sizeEighths?: number;
  /**
   * ECMA-376 ST_Border value: "single","double","dotted","dashed","none","nil","wave",... 17 total.
   * Univer only supports SOLID/DOT/DASH; everything else maps to SOLID at assemble time.
   * "nil" / "none" → border explicitly removed (different from absent = inherit).
   */
    val?: string;
}

export interface ParsedCellBorders {
    top?: ParsedBorder;
    bottom?: ParsedBorder;
    left?: ParsedBorder;
    right?: ParsedBorder;
  // TODO(unsupported): tcBorders insideH/insideV/tl2br/tr2bl — Univer ITableCell has no diagonal/inside borders
}

export interface ParsedTableBorders extends ParsedCellBorders {
  /** Default for horizontal borders BETWEEN rows. Used when a cell side touches another cell. */
    insideH?: ParsedBorder;
  /** Default for vertical borders BETWEEN columns. */
    insideV?: ParsedBorder;
}

export interface ParsedCellMargin {
  /** All four in CSS px (dxa / 15). */
    top?: number;
    bottom?: number;
    start?: number;
    end?: number;
}

export interface ParsedCell {
    paragraphs: ParsedParagraph[];
    rowSpan?: number;
    columnSpan?: number;
  /** Vertical-merge state straight from DOCX before assemble computes rowSpan. */
    vMerge?: 'restart' | 'continue';
  /** Background fill from <w:tcPr><w:shd w:fill="RRGGBB">. "auto" / "FFFFFF" preserved as-is. */
    shadingFill?: string;
  /** Per-side borders from <w:tcPr><w:tcBorders>. */
    borders?: ParsedCellBorders;
  /** Vertical alignment from <w:tcPr><w:vAlign>: "top"|"center"|"bottom". */
    vAlign?: 'top' | 'center' | 'bottom';
  /** Cell padding from <w:tcPr><w:tcMar>, in CSS px. */
    margin?: ParsedCellMargin;
  /** Preferred cell width from <w:tcPr><w:tcW>, in CSS px (dxa / 15). Overrides tblGrid for this cell. */
    preferredWidthPx?: number;
  // TODO(unsupported): <w:tcFitText>, <w:noWrap>, <w:hideMark>, <w:textDirection>, <w:cellDel/Ins/Merge> — Univer ITableCell only has tcFitText (we could wire it up later)
}

export interface ParsedTable {
    rows: ParsedCell[][];
  /** Column widths in CSS px (dxa / 15). */
    columnWidths?: number[];
  /** Row heights in CSS px, parallel to `rows`. undefined entry = AUTO. */
    rowHeights?: ({ v: number; rule: 'auto' | 'atLeast' | 'exact' } | undefined)[];
  /** Per-row "keep on one page" from <w:trPr><w:cantSplit>. */
    rowCantSplit?: boolean[];
  /** Per-row "repeat as header on each page" from <w:trPr><w:tblHeader>. */
    rowIsHeader?: boolean[];
  /** Default cell shading from <w:tblPr><w:shd w:fill>. */
    shadingFill?: string;
  /** Default borders from <w:tblPr><w:tblBorders>. Cell-level borders override. */
    borders?: ParsedTableBorders;
  /** Default cell padding from <w:tblPr><w:tblCellMar>, in CSS px. */
    cellMargin?: ParsedCellMargin;
  /** Table-level horizontal alignment from <w:tblPr><w:jc>: "start"|"center"|"end". */
    align?: 'start' | 'center' | 'end';
  /** Table-level left indent from <w:tblPr><w:tblInd>, in CSS px. */
    indentPx?: number;
  /** Table layout algorithm from <w:tblPr><w:tblLayout w:type=>: "fixed" | "autofit". */
    layout?: 'fixed' | 'autofit';
  /** Total preferred table width from <w:tblPr><w:tblW>, in CSS px (only when type=dxa). */
    preferredWidthPx?: number;
  /** Style id from <w:tblPr><w:tblStyle w:val>. Resolved against styles.xml at assemble time. */
    styleRef?: string;
  // TODO(unsupported): <w:tblPr><w:tblpPr> floating-table positioning, <w:tblOverlap>, <w:tblCaption>, <w:tblDescription> — Univer ITable has position/overlap/description but we don't surface them yet
  // TODO(unsupported): <w:tblPrEx> per-row table-property override — would shadow ParsedTable fields for one row only
  // TODO(unsupported): <w:tblLook> conditional-formatting toggle — controls which tblStylePr buckets apply (firstRow/lastRow/firstCol/lastCol/band1Horz/band2Horz)
  // TODO(unsupported): <w:tblStylePr> conditional formatting (firstRow/lastRow/firstCol/lastCol/band1Horz/...) — needs tblStyle parsing first (Phase 3)
}

export type DocumentChild = { kind: 'paragraph'; paragraph: ParsedParagraph } | { kind: 'table'; table: ParsedTable };

export interface ParsedDrawing {
    drawingId: string;
    mediaPath: string;
    mimeType: string;
  /** Full data URL (e.g. "data:image/png;base64,...") ready to assign to ISimpleDrawing.source */
    dataUrl: string;
  /** Pixel width parsed from <wp:extent cx>, EMU÷9525 */
    widthPx?: number;
    heightPx?: number;
}

/** Shared relationship type used across parse modules */
export interface ParsedRelationship {
    type: 'hyperlink' | 'image' | 'other';
    target: string;
}

export interface ParsedNumberingLevel {
    ilvl: number;
    format: string;
    text: string;
    start: number;
  /** Per-level indent from <w:lvl><w:pPr><w:ind>, in pt. */
    indentStart?: { v: number };
    hanging?: { v: number };
    indentFirstLine?: { v: number };
}

export interface ParsedNumberingDef {
    numId: string;
    abstractNumId: string;
    levels: ParsedNumberingLevel[];
    isCheckbox?: boolean;
  /** Stable Univer list type derived from level format/glyph. */
    listType: 'ORDER_LIST' | 'BULLET_LIST' | 'CHECK_LIST';
}

export interface OoxmlBundle {
    documentXml: string;
    numberingXml?: string;
    stylesXml?: string;
    themeXml?: string;
    relsXml?: string;
  /** word/settings.xml — for evenAndOddHeaders, etc. */
    settingsXml?: string;
    media?: Map<string, Uint8Array>;
  /** Header xml files keyed by stem ("header1", "header2", ...). */
    headers?: Map<string, string>;
  /** Footer xml files keyed by stem. */
    footers?: Map<string, string>;
  /** Per-header rels xml content keyed by stem ("header1" → contents of word/_rels/header1.xml.rels). */
    headerRels?: Map<string, string>;
  /** Per-footer rels xml content keyed by stem. */
    footerRels?: Map<string, string>;
}
