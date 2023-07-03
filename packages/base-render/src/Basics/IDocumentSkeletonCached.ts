import {
    BulletAlignment,
    ColumnSeparatorType,
    IDrawing,
    INestingLevel,
    IParagraphStyle,
    ITextStyle,
    IDocumentRenderConfig,
    IIndentStart,
    PageOrientType,
    DataStreamTreeTokenType,
} from '@univerjs/core';

export interface IDocumentSkeletonCached extends ISkeletonResourceReference {
    pages: IDocumentSkeletonPage[];
    left: number;
    top: number;
    st: number; // startIndex 文本开始索引
    ed?: number; // endIndex 文本结束索引
}

export interface ISkeletonResourceReference {
    skeHeaders: Map<string, Map<number, IDocumentSkeletonHeader>>; // id:{ width: IDocumentSkeletonFooter }
    skeFooters: Map<string, Map<number, IDocumentSkeletonFooter>>;
    /* Global cache, does not participate in rendering, only helps skeleton generation */
    skeListLevel?: Map<string, IDocumentSkeletonBullet[]>; // 有序列表缓存，id：{ level: max(width)的bullet }
    drawingAnchor?: Map<number, IDocumentSkeletonDrawingAnchor>; // Anchor point to assist floating element positioning
}

export interface IDocumentSkeletonDrawingAnchor {
    elements: IDocumentSkeletonLine[]; // element: lines, tr
    paragraphIndex: number; // block id
    top: number; // relative height for previous block
}

export interface IDocumentSkeletonHeaderFooterBase {
    lines: IDocumentSkeletonLine[];
    skeDrawings: Map<string, IDocumentSkeletonDrawing>;
    height: number; // footer或header的总长度
    st: number; // startIndex 文本开始索引
    ed: number; // endIndex 文本结束索引
    marginLeft: number;
}

export interface IDocumentSkeletonHeader extends IDocumentSkeletonHeaderFooterBase {
    marginTop: number;
}

export interface IDocumentSkeletonFooter extends IDocumentSkeletonHeaderFooterBase {
    marginBottom: number;
}

export interface IDocumentSkeletonPage {
    sections: IDocumentSkeletonSection[];
    headerId: string;
    footerId: string;
    // page
    pageWidth: number;
    pageHeight: number;
    pageOrient: PageOrientType;

    pageNumber: number; // page页数
    pageNumberStart: number; // page开始页序号
    verticalAlign: Boolean; // 垂直对齐，仅对一页生效
    angle: number; // 旋转角度，仅对一页生效
    width: number; // pageWidth，默认Infinity
    height: number; // pageHeight，默认Infinity
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    breakType: BreakType; // 分页产生的类型
    st: number; // startIndex 文本开始索引
    ed: number; // endIndex 文本结束索引
    skeDrawings: Map<string, IDocumentSkeletonDrawing>;
    renderConfig?: IDocumentRenderConfig;
}

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

    lineHeight: number; // 行总体高度 lineHeight =max(span.fontBoundingBoxAscent + span.fontBoundingBoxDescent, span2.....) + space
    contentHeight: number; // contentHeight 行内容高度，contentHeight,=max(span.fontBoundingBoxAscent + span.fontBoundingBoxDescent, span2.....)
    top: number; // top paragraph(spaceAbove, spaceBelow, lineSpacing*PreLineHeight)
    asc: number; //  =max(span.textMetrics.asc) alphabet对齐，需要校准
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
    paragraphStart: boolean; // Paragraph start 默认false
    paragraphStyleOrigin?: IParagraphStyle; // ParagraphStyleOrigin 段落样式配置

    // dtId: string[]; // drawingTBIds 影响行的元素id集合，会切割divide，影响上下
    // bmt: number; // benchmarkTop， drawing的位置是根据paragraph的位置进行相对定位的，段落跨页后，需要一个校准
    parent?: IDocumentSkeletonColumn;
}

export interface IDocumentSkeletonDivide {
    // divide 分割，为了适配插入对象、图片、表格等，图文混排
    spanGroup: IDocumentSkeletonSpan[]; // spanGroup
    width: number; // width 被分割后的总宽度
    left: number; // left 被对象分割后的偏移位置 | d1 | | d2 |
    paddingLeft: number; // paddingLeft 根据horizonAlign和width计算对齐偏移
    isFull: boolean; // isFull， // 内容是否装满
    st: number; // startIndex
    ed: number; // endIndex
    parent?: IDocumentSkeletonLine;
}

export interface IDocumentSkeletonSpan {
    // word or letter or image or custom
    eId?: string; // elementId, For custom cases
    spanType: SpanType; // SpanType
    streamType: DataStreamTreeTokenType;
    width: number; // cum width
    bBox: IDocumentSkeletonBoundingBox; // bBox: size of Span
    paddingLeft: number; // paddingLeft, adjust text align in span
    left: number; // left
    count?: number; // count, content，default 1
    content?: string; // content
    ts?: ITextStyle; // text style
    fontStyle?: IDocumentSkeletonFontStyle; // fontStyle : ITextStyle convert to canvas font
    parent?: IDocumentSkeletonDivide;
    url?: string; // image url
    featureId?: string; // support interaction for feature ,eg. hyperLine person
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
    objectId: string;
    aLeft: number; // 相对于page的左方
    aTop: number; // 相对于page的上方
    width: number;
    height: number;
    angle: number; // 旋转
    initialState: boolean; // 是否初始化
    drawingOrigin: IDrawing;
}

export interface IDocumentSkeletonFontStyle {
    fontString: string;
    fontSize: number;
    fontFamily: string;
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
    SPAN,
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

export enum SpanType {
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

export enum PageLayoutType {
    VERTICAL,
    HORIZONTAL,
    AUTO,
}
