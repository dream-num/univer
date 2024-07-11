/**
 * Copyright 2023-present DreamNum Inc.
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
    IDocDrawingBase,
    IDocumentRenderConfig,
    IIndentStart,
    INestingLevel,
    ITextStyle,
    PageOrientType,
} from '@univerjs/core';
import type { BreakPointType } from '../components/docs/layout/line-breaker/break';

export interface IDocumentSkeletonCached extends ISkeletonResourceReference {
    pages: IDocumentSkeletonPage[];
    left: number;
    top: number;
    st: number; // startIndex 文本开始索引
    ed?: number; // endIndex 文本结束索引
}

export interface ISkeletonResourceReference {
    skeHeaders: Map<string, Map<number, IDocumentSkeletonHeaderFooter>>; // id:{ width: IDocumentSkeletonHeaderFooter }
    skeFooters: Map<string, Map<number, IDocumentSkeletonHeaderFooter>>;
    /* Global cache, does not participate in rendering, only helps skeleton generation */
    skeListLevel?: Map<string, IDocumentSkeletonBullet[]>; // 有序列表缓存，id：{ level: max(width)的bullet }
    drawingAnchor?: Map<number, IDocumentSkeletonDrawingAnchor>; // Anchor point to assist floating element positioning
}

export interface IDocumentSkeletonDrawingAnchor {
    elements: IDocumentSkeletonLine[]; // element: lines, tr
    paragraphIndex: number; // block id
    top: number; // relative height for previous block
}

// export interface IDocumentSkeletonHeaderFooterBase {
//     lines: IDocumentSkeletonLine[];
//     skeDrawings: Map<string, IDocumentSkeletonDrawing>;
//     height: number; // footer或header的总长度
//     st: number; // startIndex 文本开始索引
//     ed: number; // endIndex 文本结束索引
//     marginLeft: number;
// }

export interface IDocumentSkeletonPage {
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

    pageNumber: number; // page页数
    pageNumberStart: number; // page开始页序号
    verticalAlign: boolean; // 垂直对齐，仅对一页生效
    angle: number; // 旋转角度，仅对一页生效
    width: number; // actual or content width，default 0
    height: number; // actual or content height, default 0

    breakType: BreakType; // 分页产生的类型
    st: number; // startIndex 文本开始索引
    ed: number; // endIndex 文本结束索引
    skeDrawings: Map<string, IDocumentSkeletonDrawing>;
    renderConfig?: IDocumentRenderConfig;
    parent?: IDocumentSkeletonCached;
}

export interface IDocumentSkeletonHeaderFooter extends IDocumentSkeletonPage {}

export interface IDocumentSkeletonSection {
    columns: IDocumentSkeletonColumn[];
    colCount: number; // column Count 列的数量
    // section坐标系相对于page
    height: number; // 设置的高度， 如果未指定则与pageContentHeight相同 = pageHeight - marginTop - marginBottom
    top: number; // 根据pre height计算下一个section开始位置
    st: number; // startIndex 文本开始索引
    ed: number; // endIndex 文本结束索引
    parent?: IDocumentSkeletonPage;
}

export interface IDocumentSkeletonColumn {
    lines: IDocumentSkeletonLine[];
    // column坐标系相对于section
    left: number;
    width: number; // (columnWidth + spaceWidth) + ... = page.Width
    height?: number; // 实际的高度
    spaceWidth: number;
    separator: ColumnSeparatorType; // 类型
    st: number; // startIndex 文本开始索引
    ed: number; // endIndex 文本结束索引
    drawingLRIds: []; // 影响行列的元素id集合，影响左右
    isFull: boolean; // 内容是否装满
    parent?: IDocumentSkeletonSection;
}

export interface IDocumentSkeletonLine {
    paragraphIndex: number; // ID number associated with block
    type: LineType; // 行的类型，可以是段落或者其他block
    // line坐标系相对于column
    divides: IDocumentSkeletonDivide[]; // divides 受到对象影响，把行切分为N部分
    divideLen: number; // divideLen 被对象分割为多少块

    lineHeight: number; // 行总体高度 lineHeight =max(glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent, glyph2.....) + space
    contentHeight: number; // contentHeight 行内容高度，contentHeight,=max(glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent, glyph2.....)
    top: number; // top paragraph(spaceAbove, spaceBelow, lineSpacing*PreLineHeight)
    asc: number; //  =max(glyph.textMetrics.ba) alphabet 对齐，需要校准
    dsc: number; //  =max(glyph.textMetrics.bd) alphabet 对齐，需要校准
    paddingTop: number; // paddingTop 内容到顶部的距离
    paddingBottom: number; // paddingBottom 内容到底部的距离
    marginTop: number; // marginTop 针对段落的spaceAbove
    marginBottom: number; // marginBottom 针对段落的spaceBlow
    spaceBelowApply: number; // spaceBelowApply 计算后的下间距，只参与计算
    width?: number; // the actual width of a line
    st: number; // startIndex 文本开始索引
    ed: number; // endIndex 文本结束索引

    lineIndex: number; // lineIndex 行号
    bullet?: IDocumentSkeletonBullet; // 无序和有序列表标题
    paragraphStart: boolean; // Paragraph start 默认 false

    // dtId: string[]; // drawingTBIds 影响行的元素id集合，会切割divide，影响上下
    // bmt: number; // benchmarkTop， drawing的位置是根据paragraph的位置进行相对定位的，段落跨页后，需要一个校准
    parent?: IDocumentSkeletonColumn;
}

export interface IDocumentSkeletonDivide {
    // divide 分割，为了适配插入对象、图片、表格等，图文混排
    glyphGroup: IDocumentSkeletonGlyph[]; // glyphGroup
    width: number; // width 被分割后的总宽度
    left: number; // left 被对象分割后的偏移位置 | d1 | | d2 |
    paddingLeft: number; // paddingLeft 根据horizonAlign和width计算对齐偏移
    isFull: boolean; // isFull， // 内容是否装满
    st: number; // startIndex
    ed: number; // endIndex
    breakType?: BreakPointType;
    parent?: IDocumentSkeletonLine;
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

export interface IDocumentSkeletonBullet extends IIndentStart {
    listId: string; // listId
    symbol: string; // symbol 列表的内容
    ts: ITextStyle; // 文字样式
    fontStyle?: IDocumentSkeletonFontStyle; // fontStyle 从ITextStyle转换为canvas font
    startIndexItem: number; // startIndexItem，列表从第几开始
    bBox: IDocumentSkeletonBoundingBox; // bBox 文字的位置信息
    nestingLevel?: INestingLevel;
    bulletAlign?: BulletAlignment;
    bulletType?: boolean; // bulletType false unordered, true ordered;
    // bp: number; // bulletPosition 列表离页边的距离
    // ti: number; // textIndent 内容距列表的距离，取Max(textIndent, followWith+)
    // fw: number; // followWidth 内容距离列表的间隔距离
}

export interface IDocumentSkeletonDrawing {
    drawingId: string;
    aLeft: number; // 相对于 page 的左方
    aTop: number; // 相对于 page 的上方
    width: number;
    height: number;
    angle: number; // 旋转
    initialState: boolean; // 是否初始化
    drawingOrigin: IDocDrawingBase;
    columnLeft: number;
    isPageBreak: boolean;
    lineTop: number;
    lineHeight: number;
    blockAnchorTop: number; // The paragraph top.
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
