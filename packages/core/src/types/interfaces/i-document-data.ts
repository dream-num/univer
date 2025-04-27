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

import type { ISize } from '../../shared/shape';
import type { BooleanNumber, CellValueType, HorizontalAlign, LocaleType, TextDirection, VerticalAlign, WrapStrategy } from '../enum';
import type { IDrawingParam } from './i-drawing';
import type { IMention } from './i-mention';
import type { IColorStyle, IStyleBase } from './i-style-data';

// Attention: all dimensional units, unless otherwise stated, refer to pt，1 pt = 1 / 72 in
/**
 * Properties of document
 */
export interface IDocumentData extends IReferenceSource {
    /** unit ID */
    id: string;
    /** Revision of this document. Would be used in collaborated editing. Starts with zero. */
    rev?: number;
    locale?: LocaleType;
    title?: string;
    body?: IDocumentBody; // Rich text.
    documentStyle: IDocumentStyle;
    settings?: IDocumentSettings;
    // The type of data depends on how the plug-in is defined
    resources?: Array<{ id?: string; name: string; data: string }>;
    disabled?: boolean;
}

export interface IReferenceSource {
    tableSource?: ITables; // Table
    footers?: IFooters;
    headers?: IHeaders;
    lists?: ILists;
    drawings?: IDrawings;
    drawingsOrder?: string[];
    headerFooterDrawingsOrder?: string[];
}

export interface IDocumentSettings {
    zoomRatio?: number;
}

/**
 * Set of headers
 */
export interface IHeaders {
    [headerId: string]: IHeaderData;
}

/**
 * Set of footer
 */
export interface IFooters {
    [footerId: string]: IFooterData;
}

export interface ITables {
    [tableId: string]: ITable;
}

/**
 * Set of lists
 */
export interface ILists {
    [listType: string]: IListData;
}

/**
 * Set of Drawings
 */
export interface IDrawings {
    [drawingId: string]: IDocDrawingBase;
}

/**
 * Set of IStyles
 */
export interface IDocStyles {
    [styleId: string]: IDocStyle;
}

/**
 * Properties of document body
 * Contain three update types: range overlay, range mutual exclusion, and placeholder
 * \v COLUMN_BREAK
 * \f PAGE_BREAK
 * \0 DOCS_END
 * \t TAB
 *
 * Needs to be changed：
 * \r PARAGRAPH
 * \n SECTION_BREAK
 *
 * \b customBlock: Scenarios where customBlock, images, mentions, etc. do not participate in the document flow.
 *
 * Table
 * \x1A table start
 * \x1B table row start
 * \x1C table cell start
 * \x1D table cell end
 * \x1E table row end
 * \x1F table end
 *
 * Special ranges within the document flow:：hyperlinks，field，structured document tags， bookmark，comment
 * \x1F customRange start
 * \x1E customRange end
 */
export interface IDocumentBody {
    dataStream: string;

    textRuns?: ITextRun[]; // textRun style，interaction

    paragraphs?: IParagraph[]; // paragraph

    sectionBreaks?: ISectionBreak[]; // SectionBreak https://support.microsoft.com/en-us/office/insert-a-section-break-eef20fd8-e38c-4ba6-a027-e503bdf8375c

    customBlocks?: ICustomBlock[]; // customBlock user-defined block through plug-in

    tables?: ICustomTable[]; // Table

    // tableOfContents?: { [index: number]: ITableOfContent }; // tableOfContents
    // links?: { [index: number]: IHyperlink }; // links

    customRanges?: ICustomRange[]; // plugin register，implement special logic for streams， hyperlink, field，structured document tags， bookmark，comment

    customDecorations?: ICustomDecoration[];

    /**
     * for copy/paste, data of custom-range and other module
     * it won't save to disk
     */
    payloads?: Record<string, string>;
}

export interface IDocStyle {
    name: string;
    basedOn: string;
    link: string;
    type: DocStyleType;
    textStyle: ITextStyle;
}

export enum DocStyleType {
    character,
    paragraph,
    table,
    numbering,
}

/**
 * Properties of doc footer
 */
export interface IFooterData {
    footerId: string;
    body: IDocumentBody;
}

/**
 * Properties of doc header
 */
export interface IHeaderData {
    headerId: string;
    body: IDocumentBody;
}

/**
 * The properties of a list which describe the look and feel of bullets belonging to paragraphs associated with a list.
 */
export interface IListData {
    listType: string;
    nestingLevel: INestingLevel[];
}

/**
 * Contains properties describing the look and feel of a list bullet at a given level of nesting.
 */
export interface INestingLevel {
    paragraphProperties?: IParagraphStyle;
    bulletAlignment: BulletAlignment; // ordered list support lvlJc
    // The glyph format contains one or more placeholders, and these placeholder are replaced with the appropriate values depending on the glyphType or glyphSymbol. The placeholders follow the pattern %[nestingLevel]. Furthermore, placeholders can have prefixes and suffixes. Thus, the glyph format follows the pattern <prefix>%[nestingLevel]<suffix>. Note that the prefix and suffix are optional and can be arbitrary strings.
    //  <prefix>%[nestingLevel]<suffix>
    glyphFormat: string; // https://developers.google.com/docs/api/reference/rest/v1/documents#nestinglevel，ms word lvlText
    textStyle?: ITextStyle;
    startNumber: number;

    // Union field glyph_kind can be only one of the following:
    glyphType?: ListGlyphType; // ordered list string is to support custom rules https://developers.google.com/docs/api/reference/rest/v1/documents#glyphtype， ms numFmt: GlyphType
    glyphSymbol?: string; // the tag of the unordered list
    // End of list of possible types for union field glyph_kind.
}

/**
 * Follow the space after the list
 */
export enum FollowNumberWithType {
    TAB,
    SPACE,
    NOTHING,
}

/**
 * An enumeration of the supported glyph types.
 */
export enum ListGlyphType {
    BULLET, // The glyph type is unspecified or unsupported.
    NONE, // An empty string.
    DECIMAL, // A number, like 1, 2, or 3.
    DECIMAL_ZERO, // A number where single digit numbers are prefixed with a zero, like 01, 02, or 03. Numbers with more than one digit are not prefixed with a zero.
    UPPER_LETTER, // An uppercase letter, like A, B, or C.
    LOWER_LETTER, // A lowercase letter, like a, b, or c.
    UPPER_ROMAN, // An uppercase Roman numeral, like I, II, or III.
    LOWER_ROMAN, // A lowercase Roman numeral, like i, ii, or iii.

    /**
     * Not yet achieved, aligned with Excel's standards.
     * 17.18.59 ST_NumberFormat (Numbering Format)
     */
    ORDINAL = 8,
    CARDINAL_TEXT = 9,
    ORDINAL_TEXT = 10,
    HEX = 11,
    CHICAGO = 12,
    IDEOGRAPH_DIGITAL = 13,
    JAPANESE_COUNTING = 14,
    AIUEO = 15,
    IROHA = 16,
    DECIMAL_FULL_WIDTH = 17,
    DECIMAL_HALF_WIDTH = 18,
    JAPANESE_LEGAL = 19,
    JAPANESE_DIGITAL_TEN_THOUSAND = 20,
    DECIMAL_ENCLOSED_CIRCLE = 21,
    DECIMAL_FULL_WIDTH2 = 22,
    AIUEO_FULL_WIDTH = 23,
    IROHA_FULL_WIDTH = 24,
    GANADA = 25,
    CHOSUNG = 26,
    DECIMAL_ENCLOSED_FULLSTOP = 27,
    DECIMAL_ENCLOSED_PAREN = 28,
    DECIMAL_ENCLOSED_CIRCLE_CHINESE = 29,
    IDEOGRAPH_ENCLOSED_CIRCLE = 30,
    IDEOGRAPH_TRADITIONAL = 31,
    IDEOGRAPH_ZODIAC = 32,
    IDEOGRAPH_ZODIAC_TRADITIONAL = 33,
    TAIWANESE_COUNTING = 34,
    IDEOGRAPH_LEGAL_TRADITIONAL = 35,
    TAIWANESE_COUNTING_THOUSAND = 36,
    TAIWANESE_DIGITAL = 37,
    CHINESE_COUNTING = 38,
    CHINESE_LEGAL_SIMPLIFIED = 39,
    CHINESE_COUNTING_THOUSAND = 40,
    KOREAN_DIGITAL = 41,
    KOREAN_COUNTING = 42,
    KOREAN_LEGAL = 43,
    KOREAN_DIGITAL2 = 44,
    VIETNAMESE_COUNTING = 45,
    RUSSIAN_LOWER = 46,
    RUSSIAN_UPPER = 47,
    NUMBER_IN_DASH = 48,
    HEBREW1 = 49,
    HEBREW2 = 50,
    ARABIC_ALPHA = 51,
    ARABIC_ABJAD = 52,
    HINDI_VOWELS = 53,
    HINDI_CONSONANTS = 54,
    HINDI_NUMBERS = 55,
    HINDI_COUNTING = 56,
    THAI_LETTERS = 57,
    THAI_NUMBERS = 58,
    THAI_COUNTING = 59,
    CUSTOM = 60,
}

/**
 * The types of alignment for a bullet.
 */
export enum BulletAlignment {
    BULLET_ALIGNMENT_UNSPECIFIED, // The bullet alignment is unspecified.
    START, // bullet is aligned to the start of the space allotted for rendering the bullet. Left-aligned for LTR text, right-aligned otherwise.
    CENTER, // The bullet is aligned to the center of the space allotted for rendering the bullet.
    END, // The bullet is aligned to the end of the space allotted for rendering the bullet. Right-aligned for LTR text, left-aligned otherwise.

    //Not achieved, aligned with Excel's standards.
    BOTH, // The bullet is aligned such that it is equidistant from both the start and end of the space allotted for rendering the bullet.
}

// /**
//  * Properties of block element
//  */
// export interface IBlockElement {
//     blockId: string; // blockId
//     st: number; // startIndex
//     ed: number; // endIndex
//     blockType: BlockType; // blockType
//     // Union field content can be only one of the following:
//     paragraph?: IParagraph; // paragraph
//     table?: ITable; // table
//     sectionBreak?: ISectionBreak; // SectionBreak https://support.microsoft.com/en-us/office/insert-a-section-break-eef20fd8-e38c-4ba6-a027-e503bdf8375c
//     tableOfContents?: IDocumentBody; // tableOfContents
//     customBlock?: ICustomBlock; // customBlock user-defined block through plug-in
// }

export interface IMargin {
    marginTop?: number; // marginTop
    marginBottom?: number; // marginBottom
    marginRight?: number; // marginRight
    marginLeft?: number; // marginLeft
}

export interface ITableOfContent {}

export interface IHyperlink {
    url?: string;
    bookmarkId?: string; // bookmarkId
    headingId?: string; // headingId
}

/**
 * A ParagraphElement that represents a run of text that all has the same styling.
 */
export interface ITextRun {
    // ct?: string; // content
    // len: number;
    st: number;
    ed: number;
    sId?: string; // styleID
    ts?: ITextStyle; // textStyle
    // tab?: BooleanNumber; // if tab，default is false
}

/**
 * Block element, link like, disabled to self nested
 */
export interface ICustomRange<T extends Record<string, any> = Record<string, any>> {
    startIndex: number;
    endIndex: number;
    rangeId: string;
    rangeType: CustomRangeType | number;
    /**
     * display as a whole-entity
     */
    wholeEntity?: boolean;
    /**
     * properties of custom range,
     * for example, hyperlink: `{ url: string }`
     */
    properties?: T;
}

export type IHyperLinkCustomRange = ICustomRange<{ url: string }>;

export type IMentionCustomRange = ICustomRange<IMention>;

export enum CustomRangeType {
    HYPERLINK,
    FIELD, // 17.16 Fields and Hyperlinks
    SDT, // 17.5.2 Structured Document Tags
    BOOKMARK,
    COMMENT,
    CUSTOM,
    MENTION,
    UNI_FORMULA,

    DELTED = 9999,
}

/**
 * Custom Block
 */
export interface ICustomBlock {
    startIndex: number;
    blockType?: BlockType;
    // A unique ID associated with a custom block.
    blockId: string;
}

export enum CustomDecorationType {
    COMMENT,
    DELETED = 9999,
}

export interface ICustomDecoration {
    startIndex: number;
    endIndex: number;
    id: string;
    type: CustomDecorationType;
}

/**
 * Type of block
 */
export enum BlockType {
    DRAWING,
    CUSTOM,
}

export interface IHeaderAndFooterBase {
    defaultHeaderId?: string; // defaultHeaderId or the odd page header id
    defaultFooterId?: string; // defaultFooterId or the odd page footer id
    evenPageHeaderId?: string; // evenPageHeaderId
    evenPageFooterId?: string; // evenPageFooterId
    firstPageHeaderId?: string; // firstPageHeaderId
    firstPageFooterId?: string; // firstPageFooterId
    useFirstPageHeaderFooter?: BooleanNumber; // useFirstPageHeaderFooter
    evenAndOddHeaders?: BooleanNumber; // useEvenPageHeaderFooter,
}

export enum DocumentFlavor {
    UNSPECIFIED,
    TRADITIONAL,
    MODERN,
}

/**
 * Basics properties of doc style
 */
export interface IDocStyleBase extends IMargin {
    pageNumberStart?: number; // pageNumberStart
    pageSize?: ISize; // pageSize

    pageOrient?: PageOrientType;

    documentFlavor?: DocumentFlavor; // DocumentFlavor: TRADITIONAL, MODERN

    marginHeader?: number; // marginHeader
    marginFooter?: number; // marginFooter

    renderConfig?: IDocumentRenderConfig;
}

export interface IDocumentLayout {

    defaultTabStop?: number; // 17.15.1.25 defaultTabStop (Distance Between Automatic Tab Stops)   0.5 in  = 36pt，this value should be converted to the default font size when exporting
    characterSpacingControl?: characterSpacingControlType; // characterSpacingControl 17.18.7 ST_CharacterSpacing (Character-Level Whitespace Compression Settings)，default compressPunctuation
    paragraphLineGapDefault?: number; // paragraphLineGapDefault default line spacing
    spaceWidthEastAsian?: BooleanNumber; // add space between east asian and English

    autoHyphenation?: BooleanNumber; // 17.15.1.10 autoHyphenation (Automatically Hyphenate Document Contents When Displayed)
    consecutiveHyphenLimit?: number; // 17.15.1.22 consecutiveHyphenLimit (Maximum Number of Consecutively Hyphenated Lines)
    doNotHyphenateCaps?: BooleanNumber; // 17.15.1.37 doNotHyphenateCaps (Do Not Hyphenate Words in ALL CAPITAL LETTERS)
    hyphenationZone?: number; // 17.15.1.53 hyphenationZone (Hyphenation Zone)
}

export enum GridType {
    // open xml $17.18.14 ST_DocGrid (Document Grid Types)
    DEFAULT,
    LINES,
    LINES_AND_CHARS,
    SNAP_TO_CHARS,
}

export interface IDocumentStyle extends IDocStyleBase, IDocumentLayout, IHeaderAndFooterBase {
    textStyle?: ITextStyle; // default style for text
}

/**
 * the alignment mode is returned with respect to the offset of the sheet cell,
 * because the document needs to render the layout for cells and
 * support alignment across multiple cells (e.g., horizontal alignment of long text in overflow mode).
 * The alignment mode of the document itself cannot meet this requirement,
 * so an additional renderConfig needs to be added during the rendering of the document component.
 * This means that there are two coexisting alignment modes.
 * In certain cases, such as in an editor, conflicts may arise,
 * requiring only one alignment mode to be retained.
 * By removing the relevant configurations in renderConfig,
 * the alignment mode of the sheet cell can be modified.
 * The alternative alignment mode is applied to paragraphs within the document.
 */
export interface IDocumentRenderConfig {
    // The following are the attributes used for secondary processing of skeleton, generally not related to word
    verticalAlign?: VerticalAlign; // VerticalAlignment, only valid for pages, word does not have this arrangement, used for secondary calculation
    centerAngle?: number; // Page text rotate, only valid for pages, word does not have this arrangement, it is used for secondary calculation
    vertexAngle?: number; // Page text rotate, only valid for pages, word does not have this arrangement, it is used for secondary calculation
    horizontalAlign?: HorizontalAlign; // HorizontalAlignment, only valid for pages, word does not have this arrangement, used for secondary calculations
    isRotateNonEastAsian?: BooleanNumber; // Word is not rotate non-eastAsian
    background?: IColorStyle; // background
    wrapStrategy?: WrapStrategy; // wrap to the next line, for sheet cell
    cellValueType?: CellValueType; // sheet cell type, In a spreadsheet cell, without any alignment settings applied, text should be left-aligned, numbers should be right-aligned, and Boolean values should be center-aligned.
    isRenderStyle?: BooleanNumber; // Whether to render the style(textRuns), used in formula bar editor. the default value is TRUE.
    zeroWidthParagraphBreak?: BooleanNumber; // Whether to render the paragraph \r to zero width. the default value is false.
}

export interface ISectionBreakBase {
    // docGrid (Document Grid), open xml $17.6.5
    charSpace?: number; // charSpace
    linePitch?: number; // linePitch
    gridType?: GridType; // gridType

    columnProperties?: ISectionColumnProperties[]; // columnProperties 17.6.4 cols (Column Definitions)
    columnSeparatorType?: ColumnSeparatorType; // ColumnSeparatorType
    contentDirection?: TextDirection; // contentDirection
    sectionType?: SectionType; // sectionType 17.6.22 type (Section Type)
    // deprecated: The attribute does not exist in Word and should be deprecated.
    sectionTypeNext?: SectionType; // sectionType
    textDirection?: TextDirectionType; // textDirection
}

/**
 * Properties of section break
 */
export interface ISectionBreak extends IDocStyleBase, ISectionBreakBase, IHeaderAndFooterBase {
    startIndex: number;
}

/**
 * Represents how the start of the current section is positioned relative to the previous section.
 */
export enum SectionType {
    SECTION_TYPE_UNSPECIFIED, // The section type is unspecified.
    CONTINUOUS, // The section starts immediately after the last paragraph of the previous section.
    NEXT_PAGE, // The section starts on the next page.
    EVEN_PAGE, // The section starts on the next page.
    ODD_PAGE, // The section starts on the next page.
}

/**
 * The style of column separators between columns.
 */
export enum ColumnSeparatorType {
    COLUMN_SEPARATOR_STYLE_UNSPECIFIED, // An unspecified column separator style.
    NONE, // No column separator lines between columns.
    BETWEEN_EACH_COLUMN, // Renders a column separator line between each column.
}

/**
 * Direction of text
 */
export enum TextDirectionType {
    NORMAL, // Horizontal
    TBRL, // Vertical
    LRTBV, // Rotate Asian characters 270°
}

/**
 * Properties of section column
 */
export interface ISectionColumnProperties {
    width: number;
    paddingEnd: number;
}

export interface IParagraph {
    // elements: IElement[]; // elements
    startIndex: number;
    paragraphStyle?: IParagraphStyle; // paragraphStyle
    bullet?: IBullet; // bullet
    // dIds?: string[]; // drawingIds drawingId
}

// export interface IElementsOrder {
//     elementId: string; // elementId
//     paragraphElementType: ParagraphElementType; // paragraphElementType
// }

// /**
//  * Properties of paragraph
//  */
// export interface IElement {
//     eId: string; // elementId
//     st: number; // startIndex
//     ed: number; // endIndex
//     et: ParagraphElementType; // ParagraphElementType
//     // Union field content can be only one of the following:
//     tr?: ITextRun; // textRun
//     // dr?: IDrawing; // inlineDrawing https://developers.google.com/docs/api/reference/rest/v1/documents#InlineObjectElement
//     // https://developers.google.com/docs/api/reference/rest/v1/documents#AutoText
//     autoText?: {}; // autoText
//     pageBreak?: {}; // pageBreak
//     columnBreak?: {}; // columnBreak
//     footnoteReference?: {}; // footnoteReference
//     horizontalRule?: {}; // horizontalRule
//     equation?: {}; // equation
//     person?: {}; // person
//     richLink?: {}; // richLink
//     custom?: ICustomElement; // custom element
// }

// export interface ICustomElement {
//     size: ISize;
// }

// /**
//  * Types of paragraph element
//  */
export enum ParagraphElementType {
    TEXT_RUN,
    AUTO_TEXT,
    PAGE_BREAK,
    COLUMN_BREAK,
    FOOT_NOTE_REFERENCE,
    HORIZONTAL_RULE,
    EQUATION,
    DRAWING,
    PERSON,
    RICH_LINK,
}

/**
 * Properties of list
 */
export interface IBullet {
    listType: string; // listType orderList or bulletList etc.
    listId: string; // listId
    nestingLevel: number; // nestingLevel
    textStyle?: ITextStyle; // textStyle
}

/**
 * Properties of Drawing
 * 20.4.2.8 inline (Inline DrawingML Object)
 * 20.4.2.15 wrapNone (No Text Wrapping)
 * 20.4.2.16 wrapPolygon (Wrapping Polygon)
 * 20.4.2.17 wrapSquare (Square Wrapping)
 * 20.4.2.18 wrapThrough (Through Wrapping)
 * 20.4.2.19 wrapTight (Tight Wrapping)
 * 20.4.2.20 wrapTopAndBottom (Top and Bottom Wrapping)
 */
export interface IDocDrawingBase extends IDrawingParam {
    drawingId: string;

    title: string;

    description: string;

    // embeddedObjectBorder?: IDocsBorder;

    docTransform: IDocDrawingPosition;

    layoutType: PositionedObjectLayoutType;

    behindDoc?: BooleanNumber; // wrapNone
    start?: number[]; // wrapPolygon
    lineTo?: number[][]; // wrapPolygon
    wrapText?: WrapTextType; // wrapSquare | wrapThrough | wrapTight
    distL?: number; // wrapSquare | wrapThrough | wrapTight
    distR?: number; // wrapSquare | wrapThrough | wrapTight
    distT?: number; // wrapSquare | wrapTopAndBottom
    distB?: number; // wrapSquare | wrapTopAndBottom
}

/**
 * Types of wrap text
 */
export enum WrapTextType {
    BOTH_SIDES,
    LEFT,
    RIGHT,
    LARGEST,
}

/**
 * The possible layouts of a [PositionedObject]
 */
export enum PositionedObjectLayoutType {
    INLINE,
    WRAP_NONE,
    WRAP_POLYGON,
    WRAP_SQUARE,
    WRAP_THROUGH,
    WRAP_TIGHT,
    WRAP_TOP_AND_BOTTOM,
}

/**
 * Properties of a draw object
 */
export interface IDocDrawingPosition {
    size: ISize;
    positionH: IObjectPositionH;
    positionV: IObjectPositionV;
    angle: number;
    // Union field properties can be only one of the following:
    // shapeProperties?: IShapeProperties;
    // chartProperties?: IChartProperties;
    // imageProperties?: IImageProperties;
}

/**
 * ChartProperties
 */
export interface IChartProperties {}

// export enum BulletType {
//     NONE,
//     ORDERED_LIST,
//     UNORDERED_LIST,
// }

/**
 * Properties of text style
 */
export interface ITextStyle extends IStyleBase {
    // bo?: BaselineOffset; // BaselineOffset, sup, sub
    sc?: number; // spacing
    pos?: number; // position
    sa?: number; // scale
}

export interface IIndentStart {
    indentFirstLine?: INumberUnit; // indentFirstLine，17.3.1.12 ind (Paragraph Indentation)
    hanging?: INumberUnit; // hanging，offset of first word except first line
    indentStart?: INumberUnit; // indentStart
    tabStops?: ITabStop[]; // tabStops
    indentEnd?: INumberUnit; // indentEnd
}

/**
 * Properties of paragraph style
 */
export interface IParagraphStyle extends IParagraphProperties {
    // Not achieved, aligned with Excel's standards.
    textStyle?: ITextStyle; // paragraph textStyle
}

export interface IParagraphProperties extends IIndentStart {
    headingId?: string; // headingId
    namedStyleType?: NamedStyleType; // namedStyleType
    horizontalAlign?: HorizontalAlign; // Horizontal alignment
    lineSpacing?: number; // lineSpacing 17.3.1.33 spacing (Spacing Between Lines and Above/Below Paragraph)
    direction?: TextDirection; // direction
    spacingRule?: SpacingRule; // SpacingRule
    snapToGrid?: BooleanNumber; // snapToGrid 17.3.2.34 snapToGrid (Use Document Grid Settings For Inter-Character Spacing)
    spaceAbove?: INumberUnit; // spaceAbove before beforeLines (Spacing Above Paragraph)
    spaceBelow?: INumberUnit; // spaceBelow after afterLines (Spacing Below Paragraph)
    borderBetween?: IParagraphBorder; // borderBetween
    borderTop?: IParagraphBorder; // borderTop
    borderBottom?: IParagraphBorder; // borderBottom
    borderLeft?: IParagraphBorder; // borderLeft
    borderRight?: IParagraphBorder; // borderRight
    keepLines?: BooleanNumber; // 17.3.1.14 keepLines (Keep All Lines On One Page)
    keepNext?: BooleanNumber; // 17.3.1.15 keepNext (Keep Paragraph With Next Paragraph)
    wordWrap?: BooleanNumber; // 17.3.1.45 wordWrap (Allow Line Breaking At Character Level)
    widowControl?: BooleanNumber; // 17.3.1.44 widowControl (Allow First/Last Line to Display on a Separate Page)
    shading?: IShading; // shading
    suppressHyphenation?: BooleanNumber; // 17.3.1.34 suppressAutoHyphens (Suppress Hyphenation for Paragraph)
}

/**
 * Types of name style
 */
export enum NamedStyleType {
    NAMED_STYLE_TYPE_UNSPECIFIED, // The type of named style is unspecified.
    NORMAL_TEXT, // Normal text.
    TITLE, // Title.
    SUBTITLE, // Subtitle.
    HEADING_1, // Heading 1.
    HEADING_2, // Heading 2.
    HEADING_3, // Heading 3.
    HEADING_4, // Heading 4.
    HEADING_5, // Heading 5.
}

// export enum Alignment {
//     ALIGNMENT_UNSPECIFIED, //The paragraph alignment is inherited from the parent.
//     START, //The paragraph is aligned to the start of the line. Left-aligned for LTR text, right-aligned otherwise.
//     CENTER, // The paragraph is centered.
//     END, //The paragraph is aligned to the end of the line. Right-aligned for LTR text, left-aligned otherwise.
//     JUSTIFIED, // The paragraph is justified.
// }

export enum SpacingRule {
    // 17.18.48 ST_LineSpacingRule (Line Spacing Rule)

    /**
     * Specifies that the line spacing of the parent object shall be automatically determined by the size of its contents, with no predetermined minimum or maximum size.
     */
    AUTO,
    /**
     * Specifies that the height of the line shall be at least the value specified, but might be expanded to fit its content as needed.
     */
    AT_LEAST,
    /**
     * Specifies that the height of the line shall be exactly the value specified, regardless of the size of the contents of the contents.
     */
    EXACT,
}

/**
 * Properties of doc border
 */
export interface IDocsBorder {
    color: IColorStyle; // color
    width: number; // width
    dashStyle: DashStyleType; // dashStyle
}

/**
 * Properties of paragraph border
 */
export interface IParagraphBorder extends IDocsBorder {
    padding: number; // padding
}

/**
 * The kinds of dashes with which linear geometry can be rendered.
 */
export enum DashStyleType {
    DASH_STYLE_UNSPECIFIED, // Unspecified dash style.
    SOLID, // Solid line. Corresponds to ECMA-376 ST_PresetLineDashVal value 'solid'. This is the default dash style.
    DOT, // Dotted line. Corresponds to ECMA-376 ST_PresetLineDashVal value 'dot'.
    DASH, // Dashed line. Corresponds to ECMA-376 ST_PresetLineDashVal value 'dash'.
}

/**
 * A tab stop within a paragraph.
 */
export interface ITabStop {
    offset: number; // offset
    alignment: TabStopAlignment; // alignment
}

/**
 * The alignment of the tab stop.
 */
export enum TabStopAlignment {
    TAB_STOP_ALIGNMENT_UNSPECIFIED, // The tab stop alignment is unspecified.
    START, // The tab stop is aligned to the start of the line. This is the default.
    CENTER, // The tab stop is aligned to the center of the line.
    END, // The tab stop is aligned to the end of the line.
}

/**
 * Properties of shading
 */
export interface IShading {
    backgroundColor: IColorStyle; // backgroundColor
}

export interface IDistFromText {
    distT: number; // distance between top text and table.
    distB: number; // distance between bottom text and table.
    distL: number; // distance between left text and table.
    distR: number; // distance between right text and table.
}

export interface ITableAnchor {
    positionH: IObjectPositionH; // horizontal Anchor (Table Horizontal Anchor)
    positionV: IObjectPositionV;
}

export enum TableSizeType {
    UNSPECIFIED,
    SPECIFIED,
}
export interface IWidthInTableSize {
    type: TableSizeType;
    width: INumberUnit;
}

// 17.18.45 ST_JcTable (Table Alignment Type)
export enum TableAlignmentType {
    START,
    CENTER,
    END,
}

// 17.18.87 ST_TblLayoutType (Table Layout Type)
export enum TableLayoutType {
    AUTO_FIT,
    FIXED,
}

export enum TableTextWrapType {
    NONE,
    WRAP,
}

export interface ICustomTable {
    startIndex: number;
    endIndex: number;
    // A unique ID associated with a table.
    tableId: string;
}

/**
 * Properties of table
 */
export interface ITable {
    tableRows: ITableRow[]; // tableRows
    tableColumns: ITableColumn[]; // tableColumns
    align: TableAlignmentType; // 17.4.28 jc (Table Alignment)
    indent: INumberUnit; // left align only. leftIndent
    textWrap: TableTextWrapType; // 17.4.57 tblpPr (Floating Table Positioning)
    position: ITableAnchor; // 17.4.57 tblpPr (Floating Table Positioning)
    dist: IDistFromText; // 17.4.57 tblpPr (Floating Table Positioning)
    size: IWidthInTableSize;
    tableId: string;
    cellMargin?: ITableCellMargin; // cellMargin
    layout?: TableLayoutType; // 17.4.52 tblLayout (Table Layout)
    overlap?: BooleanNumber; // 17.4.56 tblOverlap (Floating Table Allows Other Tables to Overlap)
    description?: string; // 17.4.46 tblDescription (Table Description)
}

// Specifies the meaning of the height specified for this table row
// The meaning of the value of the val attribute is defined based on the value of the hRule
// attribute for this table row as follows:
//  If the value of hRule is auto, then the table row's height should be automatically
// determined based on the height of its contents. The h value is ignored.
//  If the value of hRule is atLeast, then the table row's height should be at least
// the value the h attribute.
//  If the value of hRule is exact, then the table row's height should be exactly the
// value of the h attribute.
export enum TableRowHeightRule {
    AUTO,
    AT_LEAST,
    EXACT,
}

export interface ITableColumn { // 合并拆分列，HTML 合并单元格
    size: IWidthInTableSize;
}

export interface ITableRowSize {
    val: INumberUnit;
    hRule: TableRowHeightRule;
}

/**
 * Properties of row of table
 */
export interface ITableRow {
    tableCells: ITableCell[]; // tableCells
    // If omitted, then the table row shall automatically resize its height to the height required by its contents
    // (the equivalent of an hRule value of auto)
    trHeight: ITableRowSize; // 17.4.80 trHeight (Table Row Height)
    cantSplit?: BooleanNumber; // allowBreakAcrossPages, the default is true.
    isFirstRow?: BooleanNumber; // isFirstRow.
    repeatHeaderRow?: BooleanNumber; // Show header row in different pages. only for the first row.
}

/**
 * Properties of table cell
 */
export interface ITableCell {
    margin?: ITableCellMargin; // margin
    rowSpan?: number; // rowSpan
    columnSpan?: number; // columnSpan
    backgroundColor?: IColorStyle; // backgroundColor
    borderLeft?: ITableCellBorder; // borderLeft
    borderRight?: ITableCellBorder; // borderRight
    borderTop?: ITableCellBorder; // borderTop
    borderBottom?: ITableCellBorder; // borderBottom
    size?: IWidthInTableSize; // size
    tcFitText?: BooleanNumber; // 17.4.67 tcFitText (Fit Text Within Cell)
    // hAlign: use paragraph align to instead.
    vAlign?: VerticalAlignmentType; // 17.4.83 vAlign (Table Cell Vertical Alignment)
}

export interface ITableCellMargin {
    start: INumberUnit; // start
    end: INumberUnit; // end
    top: INumberUnit; // top
    bottom: INumberUnit; // bottom
}

/**
 * Properties of cell border
 */
export interface ITableCellBorder {
    color: IColorStyle; // color
    width?: INumberUnit; // width
    dashStyle?: DashStyleType; // dashStyle
}

// 17.18.101ST_VerticalJc (Vertical Alignment Type)
/**
 * The content alignments for a Shape or TableCell. The supported alignments correspond to predefined text anchoring types from the ECMA-376 standard.
 */
export enum VerticalAlignmentType {
    CONTENT_ALIGNMENT_UNSPECIFIED, // An unspecified content alignment. The content alignment is inherited from the parent if one exists.
    BOTH,
    TOP, // An alignment that aligns the content to the top of the content holder. Corresponds to ECMA-376 ST_TextAnchoringType 't'.
    CENTER, // An alignment that aligns the content to the middle of the content holder. Corresponds to ECMA-376 ST_TextAnchoringType 'ctr'.
    BOTTOM, // An alignment that aligns the content to the bottom of the content holder. Corresponds to ECMA-376 ST_TextAnchoringType 'b'.
}

/**
 * Types of font style
 */
export enum FontStyleType {
    NORMAL = 'normal',
    BOLD = 'bold',
    ITALIC = 'italic',
}

export interface INumberUnit {
    v: number; // value
    u?: NumberUnitType; // unit
}

export interface IObjectPositionH {
    relativeFrom: ObjectRelativeFromH;
    // Union field properties can be only one of the following:
    align?: AlignTypeH;
    posOffset?: number;
    percent?: number;
}

export interface IObjectPositionV {
    relativeFrom: ObjectRelativeFromV;
    // Union field properties can be only one of the following:
    align?: AlignTypeV;
    posOffset?: number;
    percent?: number;
}

// 20.4.3.4 ST_RelFromH (Horizontal Relative Positioning)
export enum ObjectRelativeFromH {
    PAGE,
    COLUMN,
    CHARACTER,
    MARGIN,
    INSIDE_MARGIN,
    OUTSIDE_MARGIN,
    LEFT_MARGIN,
    RIGHT_MARGIN,
}

// 20.4.3.4 ST_RelFromH (Vertical Relative Positioning)
export enum ObjectRelativeFromV {
    PAGE,
    PARAGRAPH,
    LINE,
    MARGIN,
    TOP_MARGIN,
    BOTTOM_MARGIN,
    INSIDE_MARGIN,
    OUTSIDE_MARGIN,
}
export enum NumberUnitType {
    POINT,
    LINE,
    CHARACTER,
    PIXEL,
    PERCENT,
}

// 20.4.3.1 ST_AlignH (Relative Horizontal Alignment Positions)
export enum AlignTypeH {
    CENTER,
    INSIDE,
    LEFT,
    OUTSIDE,
    RIGHT,
    BOTH,
    DISTRIBUTE,
}

// 20.4.3.2 ST_AlignV (Vertical Alignment Definition)
export enum AlignTypeV {
    BOTTOM,
    CENTER,
    INSIDE,
    OUTSIDE,
    TOP,
}

export enum characterSpacingControlType {
    compressPunctuation,
    compressPunctuationAndJapaneseKana,
    doNotCompress,
}

/**
 * Paper orientation, whether it's portrait (vertical) or landscape (horizontal)
 */
export enum PageOrientType {
    PORTRAIT,
    LANDSCAPE,
}

export enum PaperType {
    Letter = 'Letter',
    Tabloid = 'Tabloid',
    Legal = 'Legal',
    Statement = 'Statement',
    Executive = 'Executive',
    Folio = 'Folio',
    A3 = 'A3',
    A4 = 'A4',
    A5 = 'A5',
    B4 = 'B4',
    B5 = 'B5',
}

export const PAPER_TYPES: PaperType[] = [
    PaperType.A3,
    PaperType.A4,
    PaperType.A5,
    PaperType.B4,
    PaperType.B5,
    PaperType.Letter,
    PaperType.Tabloid,
    PaperType.Legal,
    PaperType.Statement,
    PaperType.Executive,
    PaperType.Folio,
];
// #region - tech dept
