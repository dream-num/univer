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
    BulletAlignment,
    ColumnSeparatorType,
    DataStreamTreeTokenType,
    IColorStyle,
    IColumnGroup,
    IDocDrawingBase,
    IDocumentRenderConfig,
    INestingLevel,
    IParagraph,
    IParagraphBorder,
    IParagraphProperties,
    ITable,
    ITableRow,
    ITextStyle,
    PageOrientType,
} from '@univerjs/core';
import type { BreakPointType } from '../components/docs/layout/line-breaker/break';

export interface IDocumentSkeletonCached extends ISkeletonResourceReference {
    pages: IDocumentSkeletonPage[];
    left: number;
    top: number;
    st: number; // startIndex
    ed?: number; // endIndex
    parent?: unknown;
}

export interface IParagraphList {
    bullet: IDocumentSkeletonBullet;
    paragraph: IParagraph;
}

export interface ISkeletonResourceReference {
    skeHeaders: Map<string, Map<number, IDocumentSkeletonHeaderFooter>>; // id:{ width: IDocumentSkeletonHeaderFooter }
    skeFooters: Map<string, Map<number, IDocumentSkeletonHeaderFooter>>;
    /* Global cache, does not participate in rendering, only helps skeleton generation */
    skeListLevel?: Map<string, IParagraphList[][]>; // ordered list cache, id: { level: max(width) bullet }
    drawingAnchor?: Map<string, Map<number, IDocumentSkeletonDrawingAnchor>>; // Anchor point to assist floating element positioning
}

export interface IDocumentSkeletonDrawingAnchor {
    elements: IDocumentSkeletonLine[]; // element: lines, tr
    paragraphIndex: number; // block id
    top: number; // relative height for previous block
}

// export interface IDocumentSkeletonHeaderFooterBase {
//     lines: IDocumentSkeletonLine[];
//     skeDrawings: Map<string, IDocumentSkeletonDrawing>;
//     height: number; // total length of footer or header
//     st: number; // startIndex
//     ed: number; // endIndex
//     marginLeft: number;
// }

export enum DocumentSkeletonPageType {
    BODY,
    HEADER,
    FOOTER,
    CELL,
};

export interface IDocumentSkeletonPage {
    /** Stable id of the document section that owns this body page. */
    sectionId?: string;
    sections: IDocumentSkeletonSection[];
    headerId: string;
    footerId: string;
    // page
    pageWidth: number; // default Infinity, The current page width follows the snapshot configuration, determined jointly by documentStyle and sectionBreak, representing the static limit for each page, unrelated to the actual content's text width.
    pageHeight: number; // default Infinity, The current page's height follows the snapshot configuration, jointly determined by documentStyle and sectionBreak, representing the static limit for each page, unrelated to the total height of the actual content's text.
    pageOrient: PageOrientType; // Paper orientation, whether it's portrait (vertical) or landscape (horizontal)
    marginLeft: number; // The current page's padding, used to accommodate column title space, follows the snapshot configuration, jointly determined by documentStyle and sectionBreak. It represents the static limit for each page, which may vary per page.
    marginRight: number;
    originMarginTop: number; // The margin top in document style config, used to draw margin identifier.
    marginTop: number;
    originMarginBottom: number; // The margin bottom in document style config, used to draw margin identifier.
    marginBottom: number;

    left: number; // Only use for cell.

    pageNumber: number; // page number
    pageNumberStart: number; // start page number
    verticalAlign: boolean; // vertical align, only effective for one page
    angle: number; // rotation angle, only effective for one page
    width: number; // actual or content width，default 0
    height: number; // actual or content height, default 0

    breakType: BreakType; // type of page break
    st: number; // startIndex
    ed: number; // endIndex
    skeDrawings: Map<string, IDocumentSkeletonDrawing>;
    skeTables: Map<string, IDocumentSkeletonTable>; // table skeletons in the page
    skeColumnGroups: Map<string, IDocumentSkeletonColumnGroup>; // column group skeletons in the page
    segmentId: string; // header/footer id if header/footer, empty string if body page
    type: DocumentSkeletonPageType; // page type: header, footer, body, or cell
    renderConfig?: IDocumentRenderConfig;
    parent?: IDocumentSkeletonCached | IDocumentSkeletonRow;
}

export interface IDocumentSkeletonHeaderFooter extends IDocumentSkeletonPage {}

export interface IDocumentSkeletonSection {
    columns: IDocumentSkeletonColumn[];
    colCount: number; // column count
    // section coordinate system relative to page
    height: number; // set height, if not specified, same as pageContentHeight = pageHeight - marginTop - marginBottom
    top: number; // calculate next section start position based on previous height
    st: number; // startIndex
    ed: number; // endIndex
    parent?: IDocumentSkeletonPage;
}

export interface IDocumentSkeletonTable {
    rows: IDocumentSkeletonRow[];
    width: number; // calculate table width based on table settings or column widths
    height: number; // calculate total table height based on row count and row height
    top: number; // calculate table top based on the paragraph it belongs to
    left: number; // calculate left value based on outer container width, align, and indent
    st: number; // startIndex
    ed: number; // endIndex
    tableId: string; // table id
    tableSource: ITable;
    parent?: IDocumentSkeletonPage;
}

export interface IDocumentSkeletonRow {
    cells: IDocumentSkeletonPage[];
    index: number; // row index
    height: number; // actual height
    top: number; // top relative to table top edge
    st: number; // startIndex
    ed: number; // endIndex
    rowSource: ITableRow;
    parent?: IDocumentSkeletonTable;
    isRepeatRow: boolean; // whether it is a repeated header row
}

export interface IDocumentSkeletonColumnGroup {
    columns: IDocumentSkeletonColumnGroupColumn[];
    width: number;
    height: number;
    top: number;
    left: number;
    st: number;
    ed: number;
    columnGroupId: string;
    columnGroupSource: IColumnGroup;
    parent?: IDocumentSkeletonPage;
}

export interface IDocumentSkeletonColumnGroupColumn {
    columnId: string;
    left: number;
    top: number;
    width: number;
    height: number;
    st: number;
    ed: number;
    page: IDocumentSkeletonPage;
    parent?: IDocumentSkeletonColumnGroup;
}

export interface IDocumentSkeletonColumn {
    lines: IDocumentSkeletonLine[];
    // column coordinate system relative to section
    left: number;
    width: number; // (columnWidth + spaceWidth) + ... = page.Width
    height?: number; // actual height
    spaceWidth: number;
    separator: ColumnSeparatorType; // type
    st: number; // startIndex
    ed: number; // endIndex
    drawingLRIds: []; // element ids affecting rows and columns, left and right
    isFull: boolean; // whether content is full
    parent?: IDocumentSkeletonSection;
}

export interface IDocumentSkeletonLine {
    paragraphIndex: number; // ID number associated with block
    type: LineType; // line type, can be paragraph or other block
    // line coordinate system relative to column
    divides: IDocumentSkeletonDivide[]; // divides affected by objects, splitting line into N parts
    divideLen: number; // number of parts divided by objects
    lineHeight: number; // total line height lineHeight = max(glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent, glyph2.....) + space
    contentHeight: number; // line content height, contentHeight = max(glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent, glyph2.....)
    top: number; // top paragraph(spaceAbove, spaceBelow, lineSpacing*PreLineHeight)
    asc: number; // =max(glyph.textMetrics.ba) alphabet alignment, needs calibration
    dsc: number; // =max(glyph.textMetrics.bd) alphabet alignment, needs calibration
    paddingTop: number; // paddingTop distance from content to top
    paddingBottom: number; // paddingBottom distance from content to bottom
    marginTop: number; // marginTop paragraph spaceAbove
    marginBottom: number; // marginBottom paragraph spaceBelow
    spaceBelowApply: number; // spaceBelowApply calculated bottom spacing, only for calculation
    st: number; // startIndex
    ed: number; // endIndex
    lineIndex: number; // lineIndex
    paragraphStart: boolean; // Paragraph start, default false
    isBehindTable: boolean; // In DataStream, if paragraph contains table, the first line isBehindTable is true and tableId is not empty, mainly used to calculate st\ed.
    tableId: string; // tableId if paragraph contains table, tableId is not empty, mainly used to calculate st\ed.

    borderBottom?: IParagraphBorder; // borderBottom
    backgroundColor?: IColorStyle; // backgroundColor
    bullet?: IDocumentSkeletonBullet; // unordered and ordered list bullet
    width?: number; // the actual width of a line
    // dtId: string[]; // drawingTBIds element ids affecting rows, splitting divides, affecting top and bottom
    // bmt: number; // benchmarkTop, drawing position is relative to paragraph position, after paragraph crosses page, a calibration is needed
    parent?: IDocumentSkeletonColumn;
}

export interface IDocumentSkeletonDivide {
    // divide: Used to adapt to inserted objects, images, tables, etc., for mixed text and graphics layout
    glyphGroup: IDocumentSkeletonGlyph[]; // glyphGroup
    width: number; // width: Total width after division
    left: number; // left: Offset position after division by objects | d1 | | d2 |
    paddingLeft: number; // paddingLeft: Alignment offset calculated based on horizonAlign and width
    isFull: boolean; // isFull: Whether content is full
    st: number; // startIndex
    ed: number; // endIndex
    breakType?: BreakPointType;
    parent?: IDocumentSkeletonLine;
    glyphGroupWidth?: number; // glyphGroupWidth: Total width of glyphGroup, pre-calculated to avoid recalculation each time
}

export interface IAdjustability {
    // The left and right strechability
    stretchability: [number, number];
    // The left and right shrinkability
    shrinkability: [number, number];
}

export interface IDocumentSkeletonGlyph {
    // word or letter or image or custom
    glyphId?: string; // elementId, For custom cases
    glyphType: GlyphType; // GlyphType
    streamType: DataStreamTreeTokenType;
    width: number; // cum width
    bBox: IDocumentSkeletonBoundingBox; // bBox: size of glyph
    xOffset: number; // xOffset, adjust text align in glyph
    left: number; // left
    count: number; // count, content length，default 1
    content: string; // content
    raw: string;
    adjustability: IAdjustability; // The adjustability of the glyph.
    isJustifiable: boolean; // Whether this glyph is justifiable for CJK scripts.
    ts?: ITextStyle; // text style
    fontStyle?: IDocumentSkeletonFontStyle; // fontStyle : ITextStyle convert to canvas font
    parent?: IDocumentSkeletonDivide;
    url?: string; // image url
    featureId?: string; // support interaction for feature ,eg. hyperLine person
    drawingId?: string; // drawing.drawingId
}

export interface IDocumentSkeletonBullet {
    listId: string; // listId
    symbol: string; // symbol list content
    ts: ITextStyle; // text style
    fontStyle?: IDocumentSkeletonFontStyle; // fontStyle converted from ITextStyle to canvas font
    startIndexItem: number; // startIndexItem, list start index
    // bBox: IDocumentSkeletonBoundingBox; // bBox text position information
    nestingLevel?: INestingLevel;
    bulletAlign?: BulletAlignment;
    bulletType?: boolean; // bulletType false unordered, true ordered;
    paragraphProperties?: IParagraphProperties;
    // bp: number; // bulletPosition distance from list to page edge
    // ti: number; // textIndent distance from content to list, take Max(textIndent, followWith+)
    // fw: number; // followWidth spacing distance from content to list
}

export interface IDocumentSkeletonDrawing {
    drawingId: string;
    aLeft: number; // relative to page left
    aTop: number; // relative to page top
    width: number;
    height: number;
    angle: number; // rotation
    initialState: boolean; // whether initialized
    drawingOrigin: IDocDrawingBase;
    columnLeft: number;
    isPageBreak: boolean;
    lineTop: number;
    lineHeight: number;
    blockAnchorTop: number; // The paragraph top.
    customBlockRenderViewport?: {
        bleedLeft?: number;
        bleedWidth?: number;
        contentHeight?: number;
        contentWidth?: number;
        height?: number;
        viewportHeight?: number;
    };
}

export interface IDocumentSkeletonFontStyle {
    fontString: string;
    fontSize: number;
    originFontSize: number;
    fontFamily: string;
    fontCache: string;
}

export interface IDocumentSkeletonBoundingBox {
    width: number; // width
    ba: number; // boundingBoxAscent
    bd: number; // boundingBoxDescent
    aba: number; // actualBoundingBoxAscent
    abd: number; // actualBoundingBoxDescent
    sp: number; // strikeoutPosition
    sbr: number; // subscriptSizeRatio
    sbo: number; // subscriptOffset
    spr: number; // superscriptSizeRatio
    spo: number; // superscriptOffset
}

export enum SkeletonType {
    GLYPH,
    DIVIDE,
    LINE,
    COLUMN,
    SECTION,
    PAGE,
    DRAWING,
    BULLET,
    HEADER,
    FOOTER,
    ALL,
}

export enum BreakType {
    SECTION,
    PAGE,
    COLUMN,
}

export enum LineType {
    PARAGRAPH,
    BLOCK,
}

export enum GlyphType {
    LETTER,
    WORD,
    LIST,
    PLACEHOLDER,
    TAB,
    IMAGE,
    AT,
    MATH,
    MULTI_LINE,
    CUSTOM,
}

/**
 * Determining the text layout, whether it's vertical or horizontal,
 * data storage is primarily horizontal,
 * and vertical layout is supported through rendering and drawing.
 */
export enum PageLayoutType {
    VERTICAL,
    HORIZONTAL,
    AUTO,
}
