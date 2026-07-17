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

import type { Nullable } from '../../shared';
import type { BaselineOffset, HorizontalAlign, TextDecoration, TextDirection, VerticalAlign } from '../../types/enum';
import type {
    IBorderData,
    IColorStyle,
    IDocumentBody,
    IDocumentData,
    INumberUnit,
    IParagraphBorder,
    IParagraphStyle,
    ISectionColumnProperties,
    IShading,
    ITabStop,
    ITextDecoration,
    ITextStyle,
    NamedStyleType,
    SpacingRule,
} from '../../types/interfaces';
import { Tools } from '../../shared';
import { generateRandomId } from '../../shared/random-id';
import { BooleanNumber } from '../../types/enum';
import { CustomRangeType } from '../../types/interfaces';
import { createParagraphId } from '../paragraph-id';
import { createSectionId } from '../section-break-id';
import { DocumentDataModel } from './document-data-model';
import { PresetListType } from './preset-list-type';
import { BuildTextUtils, getParagraphContentStartOffsets } from './text-x/build-utils';
import { TextX } from './text-x/text-x';
import { getBodySlice } from './text-x/utils';
import { DataStreamTreeTokenType } from './types';

/** A half-open range in a rich-text document data stream. */
export interface IRichTextRange {
    /** Inclusive offset of the first character. */
    startOffset: number;
    /** Exclusive offset immediately after the last character. */
    endOffset: number;
}

type IMutableRichTextRange = IRichTextRange;

const NON_EDITABLE_RICH_TEXT_TOKENS = new Set<string>(
    Object.values(DataStreamTreeTokenType).filter((token) =>
        token !== DataStreamTreeTokenType.LETTER && token !== DataStreamTreeTokenType.SPACE
    )
);

export function normalizeBody(body: IDocumentBody) {
    if (!body.customRanges) {
        body.customRanges = [];
    }

    if (!body.paragraphs) {
        body.paragraphs = [];
        const existingParagraphIds = new Set<string>();
        for (let i = 0; i < body.dataStream.length; i++) {
            if (body.dataStream[i] === '\r') {
                body.paragraphs.push({ startIndex: i, paragraphId: createParagraphId(existingParagraphIds) });
            }
        }
    }

    if (!body.customBlocks) {
        body.customBlocks = [];
    }

    if (!body.textRuns) {
        body.textRuns = [];
    }

    if (!body.customDecorations) {
        body.customDecorations = [];
    }

    if (!body.sectionBreaks) {
        body.sectionBreaks = [];
        const existingSectionIds = new Set<string>();
        for (let i = 0; i < body.dataStream.length; i++) {
            if (body.dataStream[i] === '\n') {
                body.sectionBreaks.push({ startIndex: i, sectionId: createSectionId(existingSectionIds) });
            }
        }
    }

    if (!body.tables) {
        body.tables = [];
    }

    return body;
}

export function normalizeData(data: IDocumentData) {
    data.body = normalizeBody(data.body ?? { dataStream: '' });

    if (!data.drawingsOrder) {
        data.drawingsOrder = [];
    }

    if (!data.drawings) {
        data.drawings = {};
    }
    if (!data.documentStyle) {
        data.documentStyle = {};
    }

    return data;
}

/**
 * Agent-friendly text style aliases accepted by `RichTextBuilder.span()`.
 *
 * The readable aliases can be combined in one object and apply only to the appended span. Native `ITextStyle` fields
 * remain available for advanced document integrations.
 *
 * @example
 * ```ts
 * const text = univerAPI.newRichText()
 *   .text('Status: ')
 *   .span('Blocked', {
 *     bold: true,
 *     italic: true,
 *     color: '#dc2626',
 *     background: '#fee2e2',
 *   });
 * ```
 */
export interface IRichTextSpanStyle extends ITextStyle {
    /**
     * Agent-friendly alias for `bl`.
     */
    bold?: boolean;
    /**
     * Agent-friendly alias for `it`.
     */
    italic?: boolean;
    /**
     * Agent-friendly alias for `ff`.
     */
    fontFamily?: string;
    /**
     * Agent-friendly alias for `fs`.
     */
    fontSize?: number;
    /**
     * Agent-friendly alias for `cl`. A string is treated as an RGB color.
     */
    color?: string | IColorStyle | null;
    /**
     * Agent-friendly alias for `bg`. A string is treated as an RGB color.
     */
    background?: string | IColorStyle | null;
}

/**
 * Agent-friendly paragraph options accepted by `RichTextBuilder.paragraph()`.
 *
 * Numeric lengths use document points. Pass an `INumberUnit` when another supported unit is required. `lineHeight`
 * behaves as a multiplier with `SpacingRule.AUTO`, and as an absolute document size with `AT_LEAST` or `EXACT`.
 *
 * @example
 * ```ts
 * const text = univerAPI.newRichText()
 *   .paragraph({
 *     align: univerAPI.Enum.HorizontalAlign.LEFT,
 *     lineHeight: 1.4,
 *     lineHeightRule: univerAPI.Enum.SpacingRule.AUTO,
 *     firstLineIndent: 12,
 *     spaceAfter: 6,
 *   })
 *   .text('Agent-friendly paragraph');
 * ```
 */
export interface IRichTextParagraphStyle {
    /** Horizontal paragraph alignment. Use `univerAPI.Enum.HorizontalAlign`. */
    align?: HorizontalAlign;
    /** Line-height multiplier or absolute size, depending on `lineHeightRule`. */
    lineHeight?: number;
    /** Line-height interpretation. Defaults to `SpacingRule.AUTO`. */
    lineHeightRule?: SpacingRule;
    /** First-line indent. A number is interpreted as document points. */
    firstLineIndent?: number | INumberUnit;
    /** Hanging indent. A number is interpreted as document points. */
    hangingIndent?: number | INumberUnit;
    /** Leading-side indent. A number is interpreted as document points. */
    indentStart?: number | INumberUnit;
    /** Trailing-side indent. A number is interpreted as document points. */
    indentEnd?: number | INumberUnit;
    /** Space before the paragraph. A number is interpreted as document points. */
    spaceBefore?: number | INumberUnit;
    /** Space after the paragraph. A number is interpreted as document points. */
    spaceAfter?: number | INumberUnit;
    /** Text direction. Use `univerAPI.Enum.TextDirection`. */
    direction?: TextDirection;
    /** Whether lines may wrap at character boundaries. */
    wordWrap?: boolean;
    /** Keeps all paragraph lines together when pagination applies. */
    keepLines?: boolean;
    /** Keeps this paragraph with the following paragraph when pagination applies. */
    keepNext?: boolean;
}

/**
 * Portable text-container alignment accepted by `RichTextBuilder.align()`.
 *
 * Unlike `paragraph({ align })`, which styles one paragraph, this alignment is a document-level presentation hint that
 * can be consumed consistently by shapes, table cells, and other rich-text hosts.
 */
export interface IRichTextAlignment {
    /** Horizontal alignment for the rich-text block. */
    horizontal?: HorizontalAlign;
    /** Vertical alignment inside the host text container. */
    vertical?: VerticalAlign;
}

export interface IRichTextColumnsOptions {
    /** Number of text-flow columns. Use 1 to clear multi-column layout. */
    count: number;
    /** Spacing between columns in px. Defaults to 0. */
    spacing?: number;
}

/**
 * Agent-friendly options for one paragraph list item.
 *
 * @example
 * ```ts
 * const text = univerAPI.newRichText()
 *   .listItem('Plan', {
 *     type: univerAPI.Enum.PresetListType.ORDER_LIST,
 *     listId: 'agent.release-steps',
 *   })
 *   .listItem('Build', {
 *     type: univerAPI.Enum.PresetListType.ORDER_LIST,
 *     listId: 'agent.release-steps',
 *     level: 1,
 *   });
 * ```
 */
export interface IRichTextListItemOptions {
    /** Preset ordered, unordered, or checklist style. Defaults to `PresetListType.BULLET_LIST`. */
    type?: PresetListType;
    /** Stable list identity. Consecutive compatible items reuse the previous id when omitted. */
    listId?: string;
    /** Zero-based nesting level. Defaults to `0`. */
    level?: number;
    /** Optional paragraph layout for this item. */
    paragraphStyle?: ParagraphStyleBuilder | IRichTextParagraphStyle;
}

function normalizeColorStyle(color: string | IColorStyle | null | undefined): IColorStyle | null | undefined {
    return typeof color === 'string' ? { rgb: color } : color;
}

function normalizeRichTextSpanStyle(style: IRichTextSpanStyle): ITextStyle {
    const {
        bold,
        italic,
        fontFamily,
        fontSize,
        color,
        background,
        ...rawStyle
    } = style;
    const normalized: ITextStyle = { ...rawStyle };

    if (bold !== undefined) {
        normalized.bl = bold ? BooleanNumber.TRUE : BooleanNumber.FALSE;
    }
    if (italic !== undefined) {
        normalized.it = italic ? BooleanNumber.TRUE : BooleanNumber.FALSE;
    }
    if (fontFamily !== undefined) {
        normalized.ff = fontFamily;
    }
    if (fontSize !== undefined) {
        normalized.fs = fontSize;
    }
    if (color !== undefined) {
        normalized.cl = normalizeColorStyle(color);
    }
    if (background !== undefined) {
        normalized.bg = normalizeColorStyle(background);
    }

    return normalized;
}

function normalizeRichTextLength(value: number | INumberUnit | undefined): INumberUnit | undefined {
    return typeof value === 'number' ? { v: value } : value;
}

function normalizeRichTextParagraphStyle(
    style: ParagraphStyleBuilder | IRichTextParagraphStyle | undefined
): IParagraphStyle | undefined {
    if (!style) {
        return undefined;
    }
    if (style instanceof ParagraphStyleBuilder) {
        return style.build();
    }

    return {
        horizontalAlign: style.align,
        lineSpacing: style.lineHeight,
        spacingRule: style.lineHeightRule,
        indentFirstLine: normalizeRichTextLength(style.firstLineIndent),
        hanging: normalizeRichTextLength(style.hangingIndent),
        indentStart: normalizeRichTextLength(style.indentStart),
        indentEnd: normalizeRichTextLength(style.indentEnd),
        spaceAbove: normalizeRichTextLength(style.spaceBefore),
        spaceBelow: normalizeRichTextLength(style.spaceAfter),
        direction: style.direction,
        wordWrap: style.wordWrap === undefined ? undefined : style.wordWrap ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        keepLines: style.keepLines === undefined ? undefined : style.keepLines ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        keepNext: style.keepNext === undefined ? undefined : style.keepNext ? BooleanNumber.TRUE : BooleanNumber.FALSE,
    };
}

function hasRichTextContent(data: IDocumentData): boolean {
    const dataStream = data.body?.dataStream ?? '';
    return dataStream.replace(/\r|\n/g, '').length > 0;
}

/**
 * Represents a read-only font style value object.
 * This class provides access to font style properties without modification capabilities.
 */
export class TextStyleValue {
    protected _style: ITextStyle;

    /**
     * Creates an instance of TextStyleValue.
     * @param {ITextStyle} style style object
     * @returns {TextStyleValue} font style instance
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style);
     * ```
     */
    static create(style: ITextStyle = {}) {
        return new TextStyleValue(style);
    }

    /**
     * Creates a new TextStyleValue instance
     * @param {ITextStyle} style The initial style object
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style);
     * ```
     */
    constructor(style: ITextStyle = {}) {
        this._style = style;
    }

    /**
     * Gets the font family
     * @returns {Nullable<string>} The font family name or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.fontFamily);
     * ```
     */
    get fontFamily(): Nullable<string> {
        return this._style.ff;
    }

    /**
     * Gets the font size in points
     * @returns {number | undefined} The font size or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.fontSize);
     * ```
     */
    get fontSize(): number | undefined {
        return this._style.fs;
    }

    /**
     * Gets whether the text is italic
     * @returns {boolean} True if italic, false otherwise
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.italic);
     * ```
     */
    get italic(): boolean {
        return this._style.it === BooleanNumber.TRUE;
    }

    /**
     * Gets whether the text is bold
     * @returns {boolean} True if bold, false otherwise
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.bold);
     * ```
     */
    get bold(): boolean {
        return this._style.bl === BooleanNumber.TRUE;
    }

    /**
     * Gets the underline decoration
     * @returns {TextDecorationBuilder | undefined} The underline decoration or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.underline);
     * ```
     */
    get underline(): TextDecorationBuilder | undefined {
        return this._style.ul && TextDecorationBuilder.create(this._style.ul);
    }

    /**
     * Gets the bottom border line decoration
     * @returns {TextDecorationBuilder | undefined} The bottom border line decoration or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.bottomBorderLine);
     * ```
     */
    get bottomBorderLine(): TextDecorationBuilder | undefined {
        return this._style.bbl && TextDecorationBuilder.create(this._style.bbl);
    }

    /**
     * Gets the strikethrough decoration
     * @returns {TextDecorationBuilder | undefined} The strikethrough decoration or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.strikethrough);
     * ```
     */
    get strikethrough(): TextDecorationBuilder | undefined {
        return this._style.st && TextDecorationBuilder.create(this._style.st);
    }

    /**
     * Gets the overline decoration
     * @returns {TextDecorationBuilder | undefined} The overline decoration or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.overline);
     * ```
     */
    get overline(): TextDecorationBuilder | undefined {
        return this._style.ol && TextDecorationBuilder.create(this._style.ol);
    }

    /**
     * Gets the background color
     * @returns {Nullable<IColorStyle>} The background color or null/undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.background);
     * ```
     */
    get background(): Nullable<IColorStyle> {
        return this._style.bg;
    }

    /**
     * Gets the border settings
     * @returns {Nullable<IBorderData>} The border settings or null/undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.border);
     * ```
     */
    get border(): Nullable<IBorderData> {
        return this._style.bd;
    }

    /**
     * Gets the text color
     * @returns {Nullable<IColorStyle>} The text color or null/undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.color);
     * ```
     */
    get color(): Nullable<IColorStyle> {
        return this._style.cl;
    }

    /**
     * Gets the vertical alignment (subscript/superscript)
     * @returns {Nullable<BaselineOffset>} The vertical alignment or null/undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.verticalAlign);
     * ```
     */
    get verticalAlign(): Nullable<BaselineOffset> {
        return this._style.va;
    }

    /**
     * Gets the number format pattern
     * @returns {Nullable<{ pattern: string }>} The number format pattern or null/undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.numberFormat);
     * ```
     */
    get numberFormat(): Nullable<{ pattern: string }> {
        return this._style.n;
    }

    /**
     * Creates a copy of this font style as a builder
     * @returns {TextStyleBuilder} A new TextStyleBuilder instance with the same style
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * const copy = style.copy();
     * console.log(copy);
     * ```
     */
    copy(): TextStyleBuilder {
        return TextStyleBuilder.create(Tools.deepClone(this._style));
    }

    /**
     * Gets the raw style object
     * @returns {ITextStyle} The underlying style object
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style.getValue());
     * ```
     */
    getValue(): ITextStyle {
        return { ...this._style };
    }
}

/**
 * Builder class for creating and modifying font styles.
 * Extends TextStyleValue to provide setter methods for all style properties.
 */
export class TextStyleBuilder extends TextStyleValue {
    /**
     * Creates a new TextStyleBuilder instance
     * @param {ITextStyle} style Initial style object
     * @returns {TextStyleBuilder} A new TextStyleBuilder instance
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style);
     * ```
     */
    static override create(style: ITextStyle = {}) {
        return new TextStyleBuilder(style);
    }

    /**
     * Creates a new TextStyleBuilder instance
     * @param {ITextStyle} style The initial style object
     * @example
     * ```ts
     * const style = new TextStyleBuilder({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * console.log(style);
     * ```
     */
    constructor(style: ITextStyle = {}) {
        super(style);
    }

    /**
     * Sets the font family
     * @param {string} family The font family name
     * @returns {TextStyleBuilder} The builder instance for chaining
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * style.setFontFamily('Times New Roman');
     * console.log(style.fontFamily);
     * ```
     */
    setFontFamily(family: string): TextStyleBuilder {
        this._style.ff = family;
        return this;
    }

    /**
     * Sets the font size in points
     * @param {number} size The font size
     * @returns {TextStyleBuilder} The builder instance for chaining
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * style.setFontSize(14);
     * console.log(style.fontSize);
     * ```
     */
    setFontSize(size: number): TextStyleBuilder {
        this._style.fs = size;
        return this;
    }

    /**
     * Sets the italic style
     * @param {boolean} value True to make italic, false otherwise
     * @returns {TextStyleBuilder} The builder instance for chaining
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * style.setItalic(true);
     * console.log(style.italic);
     * ```
     */
    setItalic(value: boolean): TextStyleBuilder {
        this._style.it = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the bold style
     * @param {boolean} value True to make bold, false otherwise
     * @returns {TextStyleBuilder} The builder instance for chaining
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * style.setBold(true);
     * console.log(style.bold);
     * ```
     */
    setBold(value: boolean): TextStyleBuilder {
        this._style.bl = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the underline decoration
     * @param {TextDecorationBuilder} decoration The underline decoration settings
     * @returns {TextStyleBuilder} The builder instance for chaining
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * style.setUnderline({ type: 'single', color: '#FF0000' });
     * console.log(style.underline);
     * ```
     */
    setUnderline(decoration: TextDecorationBuilder): TextStyleBuilder {
        this._style.ul = decoration.build();
        return this;
    }

    /**
     * Sets the bottom border line decoration
     * @param {TextDecorationBuilder} decoration The bottom border line decoration settings
     * @returns {TextStyleBuilder} The builder instance for chaining
     * @example
     * ```ts
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * style.setBottomBorderLine({ type: 'single', color: '#FF0000' });
     * console.log(style.bottomBorderLine);
     * ```
     */
    setBottomBorderLine(decoration: TextDecorationBuilder): TextStyleBuilder {
        this._style.bbl = decoration.build();
        return this;
    }

    /**
     * Sets the strikethrough decoration
     * @param {TextDecorationBuilder} decoration The strikethrough decoration settings
     * @returns {TextStyleBuilder} The builder instance for chaining
     */
    setStrikethrough(decoration: TextDecorationBuilder): TextStyleBuilder {
        this._style.st = decoration.build();
        return this;
    }

    /**
     * Sets the overline decoration
     * @param {TextDecorationBuilder} decoration The overline decoration settings
     * @returns {TextStyleBuilder} The builder instance for chaining
     */
    setOverline(decoration: TextDecorationBuilder): TextStyleBuilder {
        this._style.ol = decoration.build();
        return this;
    }

    /**
     * Sets the background color
     * @param {IColorStyle | null} color The background color or null to remove
     * @returns {TextStyleBuilder} The builder instance for chaining
     */
    setBackground(color: IColorStyle | null): TextStyleBuilder {
        this._style.bg = color;
        return this;
    }

    /**
     * Sets the border settings
     * @param {IBorderData | null} border The border settings or null to remove
     * @returns {TextStyleBuilder} The builder instance for chaining
     */
    setBorder(border: IBorderData | null): TextStyleBuilder {
        this._style.bd = border;
        return this;
    }

    /**
     * Sets the text color
     * @param {IColorStyle | null} color The text color or null to remove
     * @returns {TextStyleBuilder} The builder instance for chaining
     */
    setColor(color: IColorStyle | null): TextStyleBuilder {
        this._style.cl = color;
        return this;
    }

    /**
     * Sets the vertical alignment (subscript/superscript)
     * @param {BaselineOffset | null} offset The vertical alignment or null to remove
     * @returns {TextStyleBuilder} The builder instance for chaining
     */
    setVerticalAlign(offset: BaselineOffset | null): TextStyleBuilder {
        this._style.va = offset;
        return this;
    }

    /**
     * Creates a copy of this font style builder
     * @returns {TextStyleBuilder} A new TextStyleBuilder instance with the same style
     */
    override copy(): TextStyleBuilder {
        return TextStyleBuilder.create(Tools.deepClone(this._style));
    }

    /**
     * Builds and returns the final style object
     * @returns {ITextStyle} The complete style object
     */
    build(): ITextStyle {
        return this.getValue();
    }
}

/**
 * Builder class for creating and modifying text decorations.
 * Provides a fluent interface for setting text decoration properties.
 */
export class TextDecorationBuilder {
    protected _decoration: ITextDecoration;

    /**
     * Creates an instance of TextDecorationBuilder.
     * @param {ITextDecoration} decoration Initial decoration object
     * @returns {TextDecorationBuilder} text decoration builder instance
     * @example
     * ```ts
     * const decoration = TextDecorationBuilder.create({ s: 1, t: TextDecoration.SINGLE });
     * console.log(decoration);
     * ```
     */
    static create(decoration: ITextDecoration = { s: 1 }) {
        return new TextDecorationBuilder(decoration);
    }

    /**
     * Creates a new TextDecorationBuilder instance
     * @param {ITextDecoration} decoration The initial decoration object
     * @example
     * ```ts
     * const decoration = new TextDecorationBuilder({ s: 1, t: TextDecoration.SINGLE });
     * ```
     */
    constructor(decoration: ITextDecoration = { s: 1 }) {
        this._decoration = decoration;
    }

    /**
     * Gets whether the decoration is shown
     * @returns {boolean} True if the decoration is shown
     */
    get show(): boolean {
        return this._decoration.s === BooleanNumber.TRUE;
    }

    /**
     * Gets whether the decoration color follows the font color
     * @returns {boolean} True if the decoration color follows the font color
     */
    get followFontColor(): boolean {
        return this._decoration.c === BooleanNumber.TRUE;
    }

    /**
     * Gets the decoration color
     * @returns {Nullable<IColorStyle>} The decoration color
     */
    get color(): Nullable<IColorStyle> {
        return this._decoration.cl;
    }

    /**
     * Gets the decoration line type
     * @returns {Nullable<TextDecoration>} The decoration line type
     */
    get type(): Nullable<TextDecoration> {
        return this._decoration.t;
    }

    /**
     * Sets whether the decoration is shown
     * @param {boolean} value True to show the decoration
     * @returns {TextDecorationBuilder} The builder instance for chaining
     * @example
     * ```ts
     * decoration.setShow(true);
     * ```
     */
    setShow(value: boolean): TextDecorationBuilder {
        this._decoration.s = value ? 1 : 0;
        return this;
    }

    /**
     * Sets whether the decoration color follows the font color
     * @param {boolean} value True to follow font color
     * @returns {TextDecorationBuilder} The builder instance for chaining
     * @example
     * ```ts
     * decoration.setFollowFontColor(false);
     * ```
     */
    setFollowFontColor(value: boolean): TextDecorationBuilder {
        this._decoration.c = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the decoration color
     * @param {IColorStyle} color The color style
     * @returns {TextDecorationBuilder} The builder instance for chaining
     * @example
     * ```ts
     * decoration.setColor({ rgb: '#FF0000' });
     * ```
     */
    setColor(color: IColorStyle): TextDecorationBuilder {
        this._decoration.cl = color;
        return this;
    }

    /**
     * Sets the decoration line type
     * @param {TextDecoration} type The line type
     * @returns {TextDecorationBuilder} The builder instance for chaining
     * @example
     * ```ts
     * decoration.setLineType(TextDecoration.SINGLE);
     * ```
     */
    setLineType(type: TextDecoration): TextDecorationBuilder {
        this._decoration.t = type;
        return this;
    }

    /**
     * Creates a copy of this text decoration builder
     * @returns {TextDecorationBuilder} A new TextDecorationBuilder instance with the same decoration
     * @example
     * ```ts
     * const copy = decoration.copy();
     * ```
     */
    copy(): TextDecorationBuilder {
        return TextDecorationBuilder.create(Tools.deepClone(this._decoration));
    }

    /**
     * Builds and returns the final decoration object
     * @returns {ITextDecoration} The complete text decoration object
     * @example
     * ```ts
     * const style = decoration.build();
     * ```
     */
    build(): ITextDecoration {
        return { ...this._decoration };
    }
}

export class ParagraphStyleValue {
    protected _style: IParagraphStyle;

    /**
     * Creates a new ParagraphStyleValue instance
     * @param {IParagraphStyle} style The initial style object
     * @returns A new ParagraphStyleValue instance
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * ```
     */
    static create(style: IParagraphStyle = {}) {
        return new ParagraphStyleValue(style);
    }

    constructor(style: IParagraphStyle = {}) {
        this._style = style;
    }

    /**
     * Gets the first line indent
     * @returns {Nullable<INumberUnit>} The first line indent
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.indentFirstLine);
     * ```
     */
    get indentFirstLine(): Nullable<INumberUnit> {
        return this._style.indentFirstLine;
    }

    /**
     * Gets the hanging indent
     * @returns {Nullable<INumberUnit>} The hanging indent
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.hanging);
     * ```
     */
    get hanging(): Nullable<INumberUnit> {
        return this._style.hanging;
    }

    /**
     * Gets the indent start
     * @returns {Nullable<INumberUnit>} The indent start
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.indentStart);
     * ```
     */
    get indentStart(): Nullable<INumberUnit> {
        return this._style.indentStart;
    }

    /**
     * Gets the indent end
     * @returns {Nullable<INumberUnit>} The indent end
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.indentEnd);
     * ```
     */
    get tabStops(): Nullable<ITabStop[]> {
        return this._style.tabStops;
    }

    /**
     * Gets the indent end
     * @returns {Nullable<INumberUnit>} The indent end
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.indentEnd);
     * ```
     */
    get indentEnd(): Nullable<INumberUnit> {
        return this._style.indentEnd;
    }

    /**
     * Gets the text style
     * @returns {Nullable<ITextStyle>} The text style
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.textStyle);
     * ```
     */
    get textStyle(): Nullable<ITextStyle> {
        return this._style.textStyle;
    }

    /**
     * Gets the heading id
     * @returns {Nullable<string>} The heading id
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.headingId);
     * ```
     */
    get headingId(): Nullable<string> {
        return this._style.headingId;
    }

    /**
     * Gets the named style type
     * @returns {Nullable<NamedStyleType>} The named style type
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.namedStyleType);
     * ```
     */
    get namedStyleType(): Nullable<NamedStyleType> {
        return this._style.namedStyleType;
    }

    /**
     * Gets the horizontal align
     * @returns {Nullable<HorizontalAlign>} The horizontal align
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.horizontalAlign);
     * ```
     */
    get horizontalAlign(): Nullable<HorizontalAlign> {
        return this._style.horizontalAlign;
    }

    /**
     * Gets the line spacing
     * @returns {Nullable<number>} The line spacing
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.lineSpacing);
     * ```
     */
    get lineSpacing(): Nullable<number> {
        return this._style.lineSpacing;
    }

    /**
     * Gets the text direction
     * @returns {Nullable<TextDirection>} The text direction
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.direction);
     * ```
     */
    get direction(): Nullable<TextDirection> {
        return this._style.direction;
    }

    /**
     * Gets the spacing rule
     * @returns {Nullable<SpacingRule>} The spacing rule
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.spacingRule);
     * ```
     */
    get spacingRule(): Nullable<SpacingRule> {
        return this._style.spacingRule;
    }

    /**
     * Gets the snap to grid
     * @returns {Nullable<BooleanNumber>} The snap to grid
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.snapToGrid);
     * ```
     */
    get snapToGrid(): Nullable<BooleanNumber> {
        return this._style.snapToGrid;
    }

    /**
     * Gets the space above
     * @returns {Nullable<INumberUnit>} The space above
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.spaceAbove);
     * ```
     */
    get spaceAbove(): Nullable<INumberUnit> {
        return this._style.spaceAbove;
    }

    /**
     * Gets the space below
     * @returns {Nullable<INumberUnit>} The space below
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.spaceBelow);
     * ```
     */
    get spaceBelow(): Nullable<INumberUnit> {
        return this._style.spaceBelow;
    }

    /**
     * Gets the border between
     * @returns {Nullable<IParagraphBorder>} The border between
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.borderBetween);
     * ```
     */
    get borderBetween(): Nullable<IParagraphBorder> {
        return this._style.borderBetween;
    }

    /**
     * Gets the border top
     * @returns {Nullable<IParagraphBorder>} The border top
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.borderTop);
     * ```
     */
    get borderTop(): Nullable<IParagraphBorder> {
        return this._style.borderTop;
    }

    /**
     * Gets the border bottom
     * @returns {Nullable<IParagraphBorder>} The border bottom
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.borderBottom);
     * ```
     */
    get borderBottom(): Nullable<IParagraphBorder> {
        return this._style.borderBottom;
    }

    /**
     * Gets the border left
     * @returns {Nullable<IParagraphBorder>} The border left
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.borderLeft);
     * ```
     */
    get borderLeft(): Nullable<IParagraphBorder> {
        return this._style.borderLeft;
    }

    /**
     * Gets the border right
     * @returns {Nullable<IParagraphBorder>} The border right
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.borderRight);
     * ```
     */
    get borderRight(): Nullable<IParagraphBorder> {
        return this._style.borderRight;
    }

    /**
     * Gets the keep lines
     * @returns {boolean} The keep lines
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.keepLines);
     * ```
     */
    get keepLines(): boolean {
        return this._style.keepLines === BooleanNumber.TRUE;
    }

    /**
     * Gets the keep next
     * @returns {boolean} The keep next
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.keepNext);
     * ```
     */
    get keepNext(): boolean {
        return this._style.keepNext === BooleanNumber.TRUE;
    }

    /**
     * Gets the word wrap
     * @returns {boolean} The word wrap
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.wordWrap);
     * ```
     */
    get wordWrap(): boolean {
        return this._style.wordWrap === BooleanNumber.TRUE;
    }

    /**
     * Gets the widow control
     * @returns {boolean} The widow control
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.widowControl);
     * ```
     */
    get widowControl(): boolean {
        return this._style.widowControl === BooleanNumber.TRUE;
    }

    /**
     * Gets the shading
     * @returns {Nullable<IShading>} The shading
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.shading);
     * ```
     */
    get shading(): Nullable<IShading> {
        return this._style.shading;
    }

    /**
     * Gets the suppress hyphenation
     * @returns {boolean} The suppress hyphenation
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.suppressHyphenation);
     * ```
     */
    get suppressHyphenation(): boolean {
        return this._style.suppressHyphenation === BooleanNumber.TRUE;
    }

    /**
     * Creates a copy of the paragraph style
     * @returns {ParagraphStyleBuilder} The copy
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * ```
     */
    copy(): ParagraphStyleBuilder {
        return ParagraphStyleBuilder.create(Tools.deepClone(this._style));
    }

    /**
     * Gets the value
     * @returns {IParagraphStyle} The value
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * console.log(style.getValue());
     * ```
     */
    getValue(): IParagraphStyle {
        return this._style;
    }
}

/**
 * Paragraph style builder
 */
export class ParagraphStyleBuilder extends ParagraphStyleValue {
    /**
     * Creates a new paragraph style builder
     * @param style The paragraph style
     * @returns A new paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * ```
     */
    static override create(style: IParagraphStyle = {}) {
        return new ParagraphStyleBuilder(style);
    }

    constructor(style: IParagraphStyle = {}) {
        super(style);
    }

    /**
     * Sets the indent first line
     * @param value The indent first line
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setIndentFirstLine(10);
     * ```
     */
    setIndentFirstLine(value: INumberUnit): ParagraphStyleBuilder {
        this._style.indentFirstLine = value;
        return this;
    }

    /**
     * Sets the hanging
     * @param value The hanging
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setHanging(10);
     * ```
     */
    setHanging(value: INumberUnit): ParagraphStyleBuilder {
        this._style.hanging = value;
        return this;
    }

    /**
     * Sets the indent start
     * @param value The indent start
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setIndentStart(10);
     * ```
     */
    setIndentStart(value: INumberUnit): ParagraphStyleBuilder {
        this._style.indentStart = value;
        return this;
    }

    /**
     * Sets the tab stops
     * @param value The tab stops
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setTabStops([{ value: 10 }]);
     * ```
     */
    setTabStops(value: ITabStop[]): ParagraphStyleBuilder {
        this._style.tabStops = value;
        return this;
    }

    /**
     * Sets the indent end
     * @param value The indent end
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setIndentEnd(10);
     * ```
     */
    setIndentEnd(value: INumberUnit): ParagraphStyleBuilder {
        this._style.indentEnd = value;
        return this;
    }

    /**
     * Sets the text style
     * @param value The text style
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setTextStyle({ ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * ```
     */
    setTextStyle(value: ITextStyle): ParagraphStyleBuilder {
        this._style.textStyle = value;
        return this;
    }

    /**
     * Sets the heading id
     * @param value The heading id
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setHeadingId('test');
     * ```
     */
    setHeadingId(value: string): ParagraphStyleBuilder {
        this._style.headingId = value;
        return this;
    }

    /**
     * Sets the named style type
     * @param value The named style type
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setNamedStyleType(NamedStyleType.CHAPTER);
     * ```
     */
    setNamedStyleType(value: NamedStyleType): ParagraphStyleBuilder {
        this._style.namedStyleType = value;
        return this;
    }

    /**
     * Sets the vertical align
     * @param value The vertical align
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setVerticalAlign(VerticalAlign.CENTER);
     * ```
     */
    setHorizontalAlign(value: HorizontalAlign): ParagraphStyleBuilder {
        this._style.horizontalAlign = value;
        return this;
    }

    /**
     * Sets the line spacing
     * @param value The line spacing
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setLineSpacing(10);
     * ```
     */
    setLineSpacing(value: number): ParagraphStyleBuilder {
        this._style.lineSpacing = value;
        return this;
    }

    /**
     * Sets the text direction
     * @param value The text direction
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setTextDirection(TextDirection.RIGHT_TO_LEFT);
     * ```
     */
    setDirection(value: TextDirection): ParagraphStyleBuilder {
        this._style.direction = value;
        return this;
    }

    /**
     * Sets the spacing rule
     * @param value The spacing rule
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setSpacingRule(SpacingRule.AUTO);
     * ```
     */
    setSpacingRule(value: SpacingRule): ParagraphStyleBuilder {
        this._style.spacingRule = value;
        return this;
    }

    /**
     * Sets the snap to grid
     * @param value The snap to grid
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setSnapToGrid(true);
     * ```
     */
    setSnapToGrid(value: boolean): ParagraphStyleBuilder {
        this._style.snapToGrid = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the space above
     * @param value The space above
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setSpaceAbove(10);
     * ```
     */
    setSpaceAbove(value: INumberUnit): ParagraphStyleBuilder {
        this._style.spaceAbove = value;
        return this;
    }

    /**
     * Sets the space below
     * @param value The space below
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setSpaceBelow(10);
     * ```
     */
    setSpaceBelow(value: INumberUnit): ParagraphStyleBuilder {
        this._style.spaceBelow = value;
        return this;
    }

    /**
     * Sets the border between
     * @param {IParagraphBorder} value The border between
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setBorderBetween({ color: 'red', width: 1 });
     * ```
     */
    setBorderBetween(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderBetween = value;
        return this;
    }

    /**
     * Sets the border top
     * @param {IParagraphBorder} value The border top
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setBorderTop({ color: 'red', width: 1 });
     * ```
     */
    setBorderTop(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderTop = value;
        return this;
    }

    /**
     * Sets the border bottom
     * @param {IParagraphBorder} value The border bottom
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setBorderBottom({ color: 'red', width: 1 });
     * ```
     */
    setBorderBottom(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderBottom = value;
        return this;
    }

    /**
     * Sets the border left
     * @param {IParagraphBorder} value The border left
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setBorderLeft({ color: 'red', width: 1 });
     * ```
     */
    setBorderLeft(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderLeft = value;
        return this;
    }

    /**
     * Sets the border right
     * @param {IParagraphBorder} value The border right
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setBorderRight({ color: 'red', width: 1 });
     * ```
     */
    setBorderRight(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderRight = value;
        return this;
    }

    /**
     * Sets the keep lines
     * @param value The keep lines
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setKeepLines(true);
     * ```
     */
    setKeepLines(value: boolean): ParagraphStyleBuilder {
        this._style.keepLines = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the keep next
     * @param value The keep next
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setKeepNext(true);
     * ```
     */
    setKeepNext(value: boolean): ParagraphStyleBuilder {
        this._style.keepNext = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the word wrap
     * @param value The word wrap
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setWordWrap(true);
     * ```
     */
    setWordWrap(value: boolean): ParagraphStyleBuilder {
        this._style.wordWrap = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the widow control
     * @param {boolean} value The widow control value
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setWidowControl(true);
     * ```
     */
    setWidowControl(value: boolean): ParagraphStyleBuilder {
        this._style.widowControl = value ? 1 : 0;
        return this;
    }

    /**
     * Sets the shading style
     * @param {IShading} value The shading configuration
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setShading({ backgroundColor: '#f0f0f0' });
     * ```
     */
    setShading(value: IShading): ParagraphStyleBuilder {
        this._style.shading = value;
        return this;
    }

    /**
     * Sets whether to suppress hyphenation
     * @param {boolean} value The suppress hyphenation value
     * @returns {ParagraphStyleBuilder} The paragraph style builder
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * copy.setSuppressHyphenation(true);
     * ```
     */
    setSuppressHyphenation(value: boolean): ParagraphStyleBuilder {
        this._style.suppressHyphenation = value ? 1 : 0;
        return this;
    }

    /**
     * Creates a copy of the current paragraph style builder
     * @returns {ParagraphStyleBuilder} A new instance of ParagraphStyleBuilder with the same settings
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const copy = style.copy();
     * ```
     */
    override copy(): ParagraphStyleBuilder {
        return ParagraphStyleBuilder.create(Tools.deepClone(this._style));
    }

    /**
     * Builds and returns the final paragraph style configuration
     * @returns {IParagraphStyle} The constructed paragraph style object
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * const finalStyle = style.build();
     * ```
     */
    build(): IParagraphStyle {
        return this.getValue();
    }
}

/**
 * Represents a rich text value
 */
export class RichTextValue {
    protected _data: IDocumentData;

    /**
     * Creates a new RichTextValue instance
     * @param {IDocumentData} data The initial data for the rich text value
     * @returns {RichTextValue} A new RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * ```
     */
    public static create(data: IDocumentData): RichTextValue {
        return new RichTextValue(data);
    }

    /**
     * Creates a new RichTextValue instance
     * @param {IDocumentBody} data The initial data for the rich text value
     * @returns {RichTextValue} A new RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.createByBody({ dataStream: 'Hello World\r\n' });
     * ```
     */
    public static createByBody(data: IDocumentBody): RichTextValue {
        return new RichTextValue({ body: data, id: 'd', documentStyle: {} });
    }

    constructor(data: IDocumentData) {
        if (!data.body) {
            throw new Error('Invalid document data, body is required');
        }
        this._data = normalizeData(data);
    }

    /**
     * Creates a copy of the current RichTextValue instance
     * @returns {RichTextValue} A new instance of RichTextValue with the same data
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const copy = richText.copy();
     * ```
     */
    copy(): RichTextBuilder {
        return RichTextBuilder.create(Tools.deepClone(this._data));
    }

    /**
     * Slices the current RichTextValue instance
     * @param {number} start The start index
     * @param {number} end The end index
     * @returns {RichTextBuilder} A new instance of RichTextBuilder with the sliced data
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const sliced = richText.slice(0, 5);
     * ```
     */
    slice(start: number, end: number): RichTextBuilder {
        const { body, ...ext } = this._data;
        return RichTextBuilder.create({
            ...Tools.deepClone(ext),
            body: getBodySlice(body!, start, end),
        });
    }

    /**
     * Converts the current RichTextValue instance to plain text
     * @returns {string} The plain text representation of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const plainText = richText.toPlainText();
     * ```
     */
    toPlainText(): string {
        return BuildTextUtils.transform.getPlainText(this._data.body?.dataStream ?? '').replaceAll('\r', '\n');
    }

    /**
     * Gets the paragraph style of the current RichTextValue instance
     * @returns {ParagraphStyleValue} The paragraph style of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const style = richText.getParagraphStyle();
     * ```
     */
    getParagraphStyle(): ParagraphStyleValue {
        return ParagraphStyleValue.create(this._data.body?.paragraphs?.[0].paragraphStyle);
    }

    /**
     * Gets the paragraph bullet of the current RichTextValue instance
     * @returns {ParagraphBulletValue} The paragraph bullet of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const bullet = richText.getParagraphBullet();
     * ```
     */
    getParagraphBullet() {
        return this._data.body?.paragraphs?.[0].bullet;
    }

    /**
     * Gets the paragraphs of the current RichTextValue instance
     * @returns {RichTextValue[]} The paragraphs of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const paragraphs = richText.getParagraphs();
     * ```
     */
    getParagraphs(): RichTextValue[] {
        const paragraphs = this._data.body?.paragraphs ?? [];

        let start = 0;
        return paragraphs.map((paragraph) => {
            const sub = this.slice(start, paragraph.startIndex);
            start = paragraph.startIndex;
            return sub;
        });
    }

    /**
     * Gets the text runs of the current RichTextValue instance
     * @returns {TextRunValue[]} The text runs of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const textRuns = richText.getTextRuns();
     * ```
     */
    getTextRuns() {
        return (this._data.body?.textRuns ?? []).map((t) => ({
            ...t,
            ts: t.ts ? TextStyleValue.create(t.ts) : null,
        }));
    }

    /**
     * Gets the links of the current RichTextValue instance
     * @returns {ICustomRange[]} The links of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const links = richText.getLinks();
     * ```
     */
    getLinks() {
        return this._data.body?.customRanges?.filter((r) => r.rangeType === CustomRangeType.HYPERLINK) ?? [];
    }

    /**
     * Gets the data of the current RichTextValue instance
     * @returns {IDocumentData} The data of the current RichTextValue instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const data = richText.getData();
     * ```
     */
    getData(): IDocumentData {
        return this._data;
    }
}

/**
 * Represents a rich text builder
 */
export class RichTextBuilder extends RichTextValue {
    /**
     * Allows optional feature packages to add semantic builder methods.
     * @internal
     */
    static extend(source: typeof RichTextBuilder): void {
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name === 'constructor') {
                return;
            }
            const descriptor = Object.getOwnPropertyDescriptor(source.prototype, name);
            if (descriptor) {
                Object.defineProperty(this.prototype, name, descriptor);
            }
        });
    }

    public static newEmptyData(): IDocumentData {
        return normalizeData({
            id: 'd',
            documentStyle: {},
            drawings: {},
            drawingsOrder: [],
            body: {
                dataStream: '\r\n',
                customBlocks: [],
                customRanges: [],
                paragraphs: [{ startIndex: 0, paragraphId: createParagraphId(new Set()) }],
                textRuns: [],
                tables: [],
                sectionBreaks: [],
            },
        });
    }

    /**
     * Creates a new RichTextBuilder instance
     * @param {IDocumentData} data The initial data for the rich text builder
     * @returns {RichTextBuilder} A new RichTextBuilder instance
     */
    public static override create(data?: IDocumentData): RichTextBuilder {
        return new RichTextBuilder(data ?? RichTextBuilder.newEmptyData());
    }

    private _doc: DocumentDataModel;
    private readonly _trackedRanges = new Set<IMutableRichTextRange>();

    constructor(data: IDocumentData) {
        super(data);
        this._doc = new DocumentDataModel(data);
    }

    /**
     * Returns editable paragraph handles backed by this detached rich-text builder.
     *
     * Paragraph boundaries come from the document model rather than splitting plain text. Each handle stays aligned
     * when text in this builder grows or shrinks, so callers can safely iterate from the first paragraph to the last.
     *
     * @returns Editable paragraphs in document order.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .text('Quarterly Review')
     *   .paragraph()
     *   .text('Revenue increased by 18%.');
     * for (const paragraph of richText.getParagraphs()) {
     *   console.log(paragraph.getText());
     * }
     * ```
     */
    override getParagraphs(): RichTextParagraphBuilder[] {
        const body = this._data.body;
        if (!body) {
            return [];
        }

        const startOffsets = getParagraphContentStartOffsets(body);
        return (body.paragraphs ?? []).map((paragraph) => this._createParagraphBuilder(
            paragraph.paragraphId,
            startOffsets.get(paragraph.startIndex) ?? 0,
            paragraph.startIndex
        ));
    }

    /**
     * Returns editable text-run handles for all paragraph text in this builder.
     *
     * Unlike the read-only value API, this method also returns unstyled gaps. Paragraph and section markers are never
     * exposed as text runs. Prefer `getParagraphs()` when paragraph context matters.
     *
     * @returns Editable text runs in document order.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .text('Status: ')
     *   .span('Ready', { bold: true, color: '#16a34a' });
     * for (const run of richText.getTextRuns()) {
     *   console.log(run.getText(), run.getTextStyle()?.getValue());
     * }
     * ```
     */
    override getTextRuns(): RichTextRunBuilder[] {
        return this.getParagraphs().flatMap((paragraph) => paragraph.getTextRuns());
    }

    /** @internal */
    _createTextRunBuilders(range: IRichTextRange): RichTextRunBuilder[] {
        const body = this._data.body;
        if (!body || range.startOffset >= range.endOffset) {
            return [];
        }

        const boundaries = new Set<number>([range.startOffset, range.endOffset]);
        const addRangeBoundaries = (startOffset: number, endOffset: number) => {
            const start = Math.max(startOffset, range.startOffset);
            const end = Math.min(endOffset, range.endOffset);
            if (start < end) {
                boundaries.add(start);
                boundaries.add(end);
            }
        };

        for (const textRun of body.textRuns ?? []) {
            addRangeBoundaries(textRun.st, textRun.ed);
        }
        for (const customRange of body.customRanges ?? []) {
            addRangeBoundaries(customRange.startIndex, customRange.endIndex + 1);
        }
        for (const decoration of body.customDecorations ?? []) {
            addRangeBoundaries(decoration.startIndex, decoration.endIndex + 1);
        }
        for (let offset = range.startOffset; offset < range.endOffset; offset++) {
            if (NON_EDITABLE_RICH_TEXT_TOKENS.has(body.dataStream[offset])) {
                boundaries.add(offset);
                boundaries.add(offset + 1);
            }
        }

        const offsets = [...boundaries].sort((left, right) => left - right);
        const runs: RichTextRunBuilder[] = [];
        for (let index = 0; index < offsets.length - 1; index++) {
            const startOffset = offsets[index];
            const endOffset = offsets[index + 1];
            if (
                startOffset >= endOffset ||
                (endOffset - startOffset === 1 && NON_EDITABLE_RICH_TEXT_TOKENS.has(body.dataStream[startOffset]))
            ) {
                continue;
            }

            const sourceRun = (body.textRuns ?? []).find((textRun) =>
                textRun.st <= startOffset && textRun.ed >= endOffset
            );
            runs.push(new RichTextRunBuilder(
                this,
                this._trackRange(startOffset, endOffset),
                sourceRun?.ts,
                sourceRun?.sId,
                Boolean(sourceRun)
            ));
        }

        return runs;
    }

    /** @internal */
    _replaceTextRun(
        range: IMutableRichTextRange,
        text: string,
        textStyle: ITextStyle | undefined,
        styleId: string | undefined,
        hasExplicitTextStyle: boolean
    ): void {
        if (
            text.includes(DataStreamTreeTokenType.PARAGRAPH) ||
            text.includes(DataStreamTreeTokenType.SECTION_BREAK)
        ) {
            throw new RangeError('Rich text run replacement cannot contain paragraph or section breaks.');
        }

        const body = this._doc.getBody();
        if (!body) {
            throw new Error('Rich text body is not available.');
        }

        const { startOffset, endOffset } = range;
        if (body.dataStream.slice(startOffset, endOffset) === text) {
            return;
        }

        const sourceBody = getBodySlice(body, startOffset, endOffset);
        const replacementBody: IDocumentBody = { dataStream: text };
        if (text && hasExplicitTextStyle) {
            replacementBody.textRuns = [{
                st: 0,
                ed: text.length,
                sId: styleId,
                ts: Tools.deepClone(textStyle),
            }];
        }
        if (text && sourceBody.customRanges?.length) {
            replacementBody.customRanges = sourceBody.customRanges.map((customRange) => ({
                ...Tools.deepClone(customRange),
                startIndex: 0,
                endIndex: text.length - 1,
            }));
        }
        if (text && sourceBody.customDecorations?.length) {
            replacementBody.customDecorations = sourceBody.customDecorations.map((decoration) => ({
                ...Tools.deepClone(decoration),
                startIndex: 0,
                endIndex: text.length - 1,
            }));
        }

        const textX = BuildTextUtils.selection.replace({
            doc: this._doc,
            selection: {
                startOffset,
                endOffset,
                collapsed: startOffset === endOffset,
            },
            body: replacementBody,
        });
        if (!textX) {
            throw new Error('Replace rich text run failed.');
        }

        TextX.apply(body, textX.serialize());
        this._rebaseTrackedRanges(startOffset, endOffset, text.length);
    }

    private _createParagraphBuilder(paragraphId: string, startOffset: number, endOffset: number): RichTextParagraphBuilder {
        return new RichTextParagraphBuilder(this, paragraphId, this._trackRange(startOffset, endOffset));
    }

    private _trackRange(startOffset: number, endOffset: number): IMutableRichTextRange {
        const range = { startOffset, endOffset };
        this._trackedRanges.add(range);
        return range;
    }

    private _rebaseTrackedRanges(startOffset: number, endOffset: number, replacementLength: number): void {
        const delta = replacementLength - (endOffset - startOffset);
        const mapStart = (offset: number) => {
            if (offset <= startOffset) return offset;
            if (offset >= endOffset) return offset + delta;
            return startOffset;
        };
        const mapEnd = (offset: number) => {
            if (offset <= startOffset) return offset;
            if (offset >= endOffset) return offset + delta;
            return startOffset + replacementLength;
        };

        for (const trackedRange of this._trackedRanges) {
            trackedRange.startOffset = mapStart(trackedRange.startOffset);
            trackedRange.endOffset = mapEnd(trackedRange.endOffset);
        }
    }

    /**
     * Appends plain text to the rich text.
     *
     * This is an agent-friendly alias of `insertText(text)`. Use it when building rich text from left to right for
     * shapes, comments, table cells, and document fragments.
     *
     * @param text Text to append.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .text('Priority: ')
     *   .bold('High')
     *   .text(' ')
     *   .code('P0');
     * ```
     */
    text(text: string): RichTextBuilder {
        return this.insertText(text);
    }

    /**
     * Aligns the rich-text block inside its host container.
     *
     * This is the preferred facade-friendly API for alignment shared by shapes and table cells. It keeps callers away
     * from `IDocumentData.documentStyle.renderConfig`. Use `paragraph({ align })` when individual paragraphs need
     * different horizontal alignment.
     *
     * @param alignment Horizontal and/or vertical container alignment.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const text = univerAPI.newRichText()
     *   .align({
     *     horizontal: univerAPI.Enum.HorizontalAlign.CENTER,
     *     vertical: univerAPI.Enum.VerticalAlign.MIDDLE,
     *   })
     *   .text('Centered text');
     * ```
     */
    align(alignment: IRichTextAlignment): RichTextBuilder {
        const documentStyle = this._data.documentStyle ??= {};
        const renderConfig = documentStyle.renderConfig ??= {};

        if (alignment.horizontal !== undefined) {
            renderConfig.horizontalAlign = alignment.horizontal;
            for (const paragraph of this._data.body?.paragraphs ?? []) {
                paragraph.paragraphStyle = {
                    ...paragraph.paragraphStyle,
                    horizontalAlign: alignment.horizontal,
                };
            }
        }

        if (alignment.vertical !== undefined) {
            renderConfig.verticalAlign = alignment.vertical;
        }

        return this;
    }

    /**
     * Sets the column layout for this rich-text document.
     *
     * Columns are stored in the rich-text document section layout. This creates text-flow columns, not table columns.
     * The host renderer must support rich-text columns for the layout to be visible.
     *
     * @param options The column layout options.
     * @param options.count The number of text columns. Must be a positive integer. Use `1` to clear multi-column layout.
     * @param options.spacing The spacing between columns, in px. Defaults to `0`.
     * @returns The current builder for chaining.
     *
     * @example
     * ```ts
     * const presentation = univerAPI.getActivePresentation();
     * if (!presentation) throw new Error('No active presentation');
     *
     * const slide = presentation.getSlideByIndex(0);
     * if (!slide) throw new Error('The presentation has no slides');
     * const richText = univerAPI.newRichText()
     *   .columns({ count: 2, spacing: 12 })
     *   .text('Column text');
     *
     * const shapeInfo = slide.newShape()
     *   .setRichText(richText)
     *   .setAbsolutePosition(80, 80)
     *   .setSize(360, 160)
     *   .build();
     *
     * slide.insertShape(shapeInfo);
     * ```
     */
    columns(options: IRichTextColumnsOptions): RichTextBuilder {
        if (!Number.isInteger(options.count) || options.count < 1) {
            throw new RangeError('Rich text column count must be a positive integer.');
        }

        const body = this._data.body ??= { dataStream: '\r\n' };
        const sectionBreaks = body.sectionBreaks ??= [];
        if (!sectionBreaks.length) {
            sectionBreaks.push({
                sectionId: createSectionId(new Set()),
                startIndex: Math.max(0, (body.dataStream?.length ?? 0) - 1),
            });
        }

        const spacing = Math.max(0, options.spacing ?? 0);
        const columns: ISectionColumnProperties[] | undefined = options.count === 1
            ? undefined
            : Array.from({ length: options.count }, (_, index) => ({
                width: 0,
                paddingEnd: index === options.count - 1 ? 0 : spacing,
            }));

        for (const sectionBreak of sectionBreaks) {
            if (columns) {
                sectionBreak.columnProperties = columns.map((column) => ({ ...column }));
            } else {
                delete sectionBreak.columnProperties;
            }
        }

        return this;
    }

    /**
     * Appends one text span with explicit style.
     *
     * Prefer this method when combining multiple styles, because the style object is local to the inserted text and does
     * not leak into following calls.
     *
     * @param text Text to append.
     * @param style Text style for this span. Agent-friendly aliases such as `bold`, `italic`, `fontFamily`, `fontSize`,
     * `color`, and `background` are supported alongside native document text style fields.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .text('Status: ')
     *   .span('Important', { bold: true, italic: true, color: '#d92d20' });
     * ```
     */
    span(text: string, style: IRichTextSpanStyle): RichTextBuilder {
        if (!text) {
            return this;
        }

        return this.insertRichText(RichTextValue.create({
            id: 'd',
            documentStyle: {},
            body: {
                dataStream: text,
                textRuns: [{
                    st: 0,
                    ed: text.length,
                    ts: normalizeRichTextSpanStyle(style),
                }],
            },
        }));
    }

    /**
     * Appends bold text.
     *
     * @param text Text to append.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText().text('This is ').bold('important');
     * ```
     */
    bold(text: string): RichTextBuilder {
        return this.span(text, { bold: true });
    }

    /**
     * Appends italic text.
     *
     * @param text Text to append.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText().text('Use ').italic('judgment');
     * ```
     */
    italic(text: string): RichTextBuilder {
        return this.span(text, { italic: true });
    }

    /**
     * Appends inline code-style text.
     *
     * This is intentionally an inline text style, not a block range. Use `paragraph().code('...')` when the code should
     * occupy its own line.
     *
     * @param text Text to append as inline code.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .text('Run ')
     *   .code('pnpm test')
     *   .text(' before submitting.');
     * ```
     */
    code(text: string): RichTextBuilder {
        return this.span(text, {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            background: '#f3f4f6',
        });
    }

    /**
     * Appends one ordered, unordered, or checklist paragraph.
     *
     * Consecutive items with the same `type` automatically share a generated list id. Supply a semantic `listId` when
     * an agent needs stable list identity across regeneration.
     *
     * @param text Plain item text.
     * @param options List type, stable identity, nesting, and optional paragraph layout.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .listItem('Analyze requirements', {
     *     type: univerAPI.Enum.PresetListType.BULLET_LIST,
     *     listId: 'agent.tasks',
     *   })
     *   .listItem('Implement API', {
     *     type: univerAPI.Enum.PresetListType.BULLET_LIST,
     *     listId: 'agent.tasks',
     *     level: 1,
     *   });
     * ```
     */
    listItem(text: string, options: IRichTextListItemOptions = {}): RichTextBuilder {
        const listType = options.type ?? PresetListType.BULLET_LIST;
        const currentParagraph = this._data.body?.paragraphs?.at(-1);
        const currentBullet = currentParagraph?.bullet;
        const listId = options.listId?.trim() ||
            (currentBullet?.listType === listType ? currentBullet.listId : generateRandomId());

        if (hasRichTextContent(this._data)) {
            this.paragraph(options.paragraphStyle);
        } else if (options.paragraphStyle) {
            this.paragraph(options.paragraphStyle);
        }

        const targetParagraph = this._data.body?.paragraphs?.at(-1);
        if (targetParagraph) {
            targetParagraph.bullet = {
                listId,
                listType,
                nestingLevel: Math.max(0, Math.trunc(options.level ?? 0)),
            };
        }

        return this.text(text);
    }

    /**
     * Starts a new paragraph before the next appended content.
     *
     * Calling `paragraph()` on an empty builder is a no-op, so agents can naturally start chains with
     * `newRichText().paragraph().text('Title')` without creating a leading blank paragraph.
     *
     * @param paragraphStyle Optional agent-friendly paragraph options or an advanced paragraph style builder.
     * @returns The current builder for chaining.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .paragraph({ lineHeight: 1.4, firstLineIndent: 16, spaceAfter: 8 })
     *   .text('First paragraph')
     *   .paragraph({ align: univerAPI.Enum.HorizontalAlign.CENTER })
     *   .span('Second paragraph', { bold: true, italic: true });
     * ```
     */
    paragraph(paragraphStyle?: ParagraphStyleBuilder | IRichTextParagraphStyle): RichTextBuilder {
        const nextParagraphStyle = normalizeRichTextParagraphStyle(paragraphStyle);
        if (!hasRichTextContent(this._data)) {
            if (nextParagraphStyle) {
                const firstParagraph = this._data.body?.paragraphs?.[0];
                if (firstParagraph) {
                    firstParagraph.paragraphStyle = nextParagraphStyle;
                }
            }
            return this;
        }

        const currentParagraph = this._data.body?.paragraphs?.at(-1);
        const currentParagraphStyle = Tools.deepClone(currentParagraph?.paragraphStyle);
        const currentParagraphBullet = Tools.deepClone(currentParagraph?.bullet);
        const startIndex = Math.max(0, (this._data.body?.dataStream.length ?? 2) - 2);
        this.insertRichText(startIndex, RichTextValue.create({
            id: 'd',
            documentStyle: {},
            body: {
                dataStream: '\r',
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: createParagraphId(new Set()),
                    paragraphStyle: currentParagraphStyle,
                    bullet: currentParagraphBullet,
                }],
            },
        }));
        const nextParagraph = this._data.body?.paragraphs?.at(-1);
        if (nextParagraphStyle) {
            if (nextParagraph) {
                nextParagraph.paragraphStyle = nextParagraphStyle;
            }
        } else if (nextParagraph) {
            delete nextParagraph.paragraphStyle;
        }
        if (nextParagraph) {
            delete nextParagraph.bullet;
        }

        return this;
    }

    /**
     * Inserts text into the rich text builder at the specified start position
     * @param start The start position of the text to insert
     * @param text The text to insert
     * @param style The style of the text to insert
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.insertText('World');
     * ```
     */
    insertText(text: string, style?: TextStyleBuilder | ITextStyle): RichTextBuilder;
    /**
     * Inserts text into the rich text builder at the specified start position
     * @param start The start position of the text to insert
     * @param text The text to insert
     * @param style The style of the text to insert
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.insertText(5, 'World', { ff: 'Arial', fs: 12 });
     * ```
     */
    insertText(start: number, text: string, style?: TextStyleBuilder | ITextStyle): RichTextBuilder;
    insertText(start: string | number, text?: string | TextStyleBuilder | ITextStyle, style?: TextStyleBuilder | ITextStyle): RichTextBuilder {
        let startIndex = (this._data.body?.dataStream.length ?? 2) - 2;
        let insertText;
        let insertStyle;
        if (typeof start === 'string') {
            insertText = start;
        } else {
            startIndex = Math.min(start, startIndex);
            insertText = text as string;
        }

        if (typeof text === 'object') {
            insertStyle = text instanceof TextStyleBuilder ? text.build() : text;
        } else {
            insertStyle = style instanceof TextStyleBuilder ? style.build() : style;
        }

        if (!insertText) return this;
        const newBody: IDocumentBody = {
            dataStream: insertText,
            textRuns: insertStyle
                ? [
                    {
                        ts: insertStyle,
                        st: startIndex,
                        ed: startIndex + insertText.length,
                    },
                ]
                : [],
        };

        const textX = BuildTextUtils.selection.replace({
            doc: this._doc,
            selection: { startOffset: startIndex, endOffset: startIndex, collapsed: true },
            body: newBody,
        });

        if (!textX) {
            throw new Error('Insert text failed, please check.');
        }

        TextX.apply(this._doc.getBody()!, textX.serialize());
        return this;
    }

    /**
     * Inserts rich text into the rich text builder at the specified start position
     * @param {RichTextValue} richText The rich text to insert
     * @returns {RichTextValue | IDocumentData} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.insertRichText(RichTextValue.create({ body: { dataStream: 'World' } }));
     * ```
     */
    insertRichText(richText: RichTextValue | IDocumentData): RichTextBuilder;
    /**
     *  Inserts rich text into the rich text builder at the specified start position
     * @param {number} start The start position of the text to insert
     * @param { RichTextValue | IDocumentData} richText The rich text to insert
     * @returns {RichTextValue | IDocumentData} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.insertRichText(5, RichTextValue.create({ body: { dataStream: 'World' } }));
     * ```
     */
    insertRichText(start: number, richText: RichTextValue | IDocumentData): RichTextBuilder;
    insertRichText(start: number | RichTextValue | IDocumentData, richText?: RichTextValue | IDocumentData): RichTextBuilder {
        let startIndex = (this._data.body?.dataStream.length ?? 2) - 2;
        let insertText: IDocumentData;
        if (typeof start === 'object') {
            insertText = start instanceof RichTextValue ? start.getData() : start;
        } else {
            startIndex = Math.min(start, startIndex);
            insertText = richText instanceof RichTextValue ? richText.getData() : richText!;
        }

        const textX = BuildTextUtils.selection.replace({
            doc: this._doc,
            selection: { startOffset: startIndex, endOffset: startIndex, collapsed: true },
            body: insertText.body!,
        });

        if (!textX) {
            throw new Error('Insert text failed, please check.');
        }

        TextX.apply(this._doc.getBody()!, textX.serialize());
        return this;
    }

    /**
     * Deletes text from the rich text builder from the end.
     * @param {number} count The number of characters to delete (optional)
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.delete(5);
     * ```
     */
    delete(count: number): RichTextBuilder;
    /**
     * Deletes text from the rich text builder at the specified start position
     * @param {number} start The start position of the text to delete
     * @param {number} [count] The number of characters to delete (optional)
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.delete(5, 5);
     * ```
     */
    delete(start: number, count: number): RichTextBuilder;
    delete(start: number, count?: number): RichTextBuilder {
        // Implementation logic here
        if (count !== undefined) {
            if (!count) return this;
            const actions = BuildTextUtils.selection.delete([{ startOffset: start, endOffset: start + count, collapsed: true }], this._data.body!);
            TextX.apply(this._doc.getBody()!, actions);
        }
        return this;
    }

    /**
     * Sets the style of the text at the specified start and end positions
     * @param {number} start The start position of the text to set the style
     * @param {number} end The end position of the text to set the style
     * @param {TextStyleBuilder | ITextStyle} style The style to set
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.setStyle(5, 10, { ff: 'Arial', fs: 12 });
     * ```
     */
    setStyle(start: number, end: number, style: TextStyleBuilder | ITextStyle): RichTextBuilder {
        const newBody: IDocumentBody = {
            dataStream: '',
            textRuns: [{
                ts: style instanceof TextStyleBuilder ? style.build() : style,
                st: 0,
                ed: end - start,
            }],
        };
        const actions = BuildTextUtils.selection.retain([{ startOffset: start, endOffset: end, collapsed: true }], newBody);
        TextX.apply(this._doc.getBody()!, actions);
        return this;
    }

    /**
     * Sets the link of the text at the specified start and end positions
     * @param {number} start The start position of the text to set the link
     * @param {number} end The end position of the text to set the link
     * @param {string} link The link to set
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.setLink(5, 10, 'https://www.example.com');
     * ```
     */
    setLink(start: number, end: number, link: string): RichTextBuilder {
        const textX = BuildTextUtils.customRange.add({
            rangeType: CustomRangeType.HYPERLINK,
            rangeId: generateRandomId(),
            properties: {
                url: link,
            },
            ranges: [{ startOffset: start, endOffset: end, collapsed: false }],
            body: this._data.body!,
        });
        if (!textX) {
            throw new Error('Insert text failed, please check.');
        }
        TextX.apply(this._doc.getBody()!, textX.serialize());
        return this;
    }

    /**
     * Cancels the link of the text at the specified start and end positions
     * @param {string} linkId The id of the link to cancel
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({
     *      body: {
     *          dataStream: 'Hello World\r\n',
     *          customRanges: [
     *              {
     *                  rangeType: CustomRangeType.HYPERLINK,
     *                  rangeId: 'linkId',
     *                  properties: { url: 'https://www.example.com' },
     *                  startIndex: 0,
     *                  endIndex: 5
     *          }]
     *      }
     * });
     * const newRichText = richText.cancelLink('linkId');
     * ```
     */
    cancelLink(linkId: string): RichTextBuilder;
    /**
     * Cancels the link of the text at the specified start and end positions
     * @param {number} start The start position of the text to cancel the link
     * @param {number} end The end position of the text to cancel the link
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({
     *      body: {
     *          dataStream: 'Hello World\r\n',
     *          customRanges: [
     *              {
     *                  rangeType: CustomRangeType.HYPERLINK,
     *                  rangeId: 'linkId',
     *                  properties: { url: 'https://www.example.com' },
     *                  startIndex: 0,
     *                  endIndex: 5
     *          }]
     *      }
     * });
     * const newRichText = richText.cancelLink(0, 10);
     * ```
     */
    cancelLink(start: number, end: number): RichTextBuilder;
    cancelLink(start: number | string, end?: number): RichTextBuilder {
        if (typeof start === 'string') {
            const textX = BuildTextUtils.customRange.delete({
                rangeId: start,
                documentDataModel: this._doc,
            });
            if (!textX) {
                throw new Error('Insert text failed, please check.');
            }
            TextX.apply(this._doc.getBody()!, textX.serialize());
        } else {
            const slice = this.slice(start as number, end as number);
            slice.getLinks().forEach((l) => {
                const textX = BuildTextUtils.customRange.delete({
                    rangeId: l.rangeId,
                    documentDataModel: this._doc,
                });
                if (!textX) {
                    throw new Error('Insert text failed, please check.');
                }
                TextX.apply(this._doc.getBody()!, textX.serialize());
            });
        }

        return this;
    }

    updateLink(id: string, url: string): RichTextBuilder {
        const current = this._data.body?.customRanges?.find((range) => range.rangeId === id);
        if (!current) {
            throw new Error('Link not found');
        }

        current.properties!.url = url;
        return this;
    }

    /**
     * Inserts a new paragraph to the end
     * @param {ParagraphStyleBuilder} paragraphStyle The style of the paragraph to insert
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.insertParagraph();
     * ```
     */
    insertParagraph(paragraphStyle?: ParagraphStyleBuilder): RichTextBuilder;
    /**
     * Inserts a new paragraph at the specified start position
     * @param {number} start The start position of the paragraph to insert
     * @param {ParagraphStyleBuilder} paragraphStyle The style of the paragraph to insert
     * @returns {RichTextBuilder} The current RichTextBuilder instance
     * @example
     * ```ts
     * const richText = RichTextValue.create({ body: { dataStream: 'Hello World\r\n' } });
     * const newRichText = richText.insertParagraph(5, { ff: 'Arial', fs: 12 });
     * ```
     */
    insertParagraph(start: number, paragraphStyle: ParagraphStyleBuilder): RichTextBuilder;
    insertParagraph(start?: number | ParagraphStyleBuilder, paragraphStyle?: ParagraphStyleBuilder): RichTextBuilder {
        let newBody: IDocumentBody;
        let startIndex: number;
        if (typeof start === 'object') {
            newBody = {
                dataStream: '\r',
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: createParagraphId(new Set()),
                    paragraphStyle: start.build(),
                }],
            };
            startIndex = (this._data.body?.dataStream.length ?? 2) - 2;
        } else {
            startIndex = start!;
            newBody = {
                dataStream: '\r',
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: createParagraphId(new Set()),
                    paragraphStyle: paragraphStyle?.build(),
                }],
            };
        }

        this.insertRichText(startIndex, RichTextValue.create({ body: newBody, id: 'd', documentStyle: {} }));
        return this;
    }

    /**
     * Inserts a new link
     * @param text
     * @param url
     * @returns
     */
    insertLink(text: string, url: string): RichTextBuilder;
    insertLink(start: number, text: string, url: string): RichTextBuilder;
    insertLink(start: number | string, text: string, url?: string): RichTextBuilder {
        let textStr = '';
        let textUrl = '';
        if (typeof start === 'string') {
            textStr = start;
            textUrl = text;
        } else {
            textStr = text;
            textUrl = url!;
        }

        const rich = RichTextBuilder.createByBody({
            dataStream: textStr,
            customRanges: [{
                rangeType: CustomRangeType.HYPERLINK,
                rangeId: generateRandomId(),
                properties: {
                    url: textUrl,
                },
                startIndex: 0,
                endIndex: textStr.length - 1,
            }],
        });

        return typeof start === 'number' ? this.insertRichText(start, rich) : this.insertRichText(rich);
    }
}

/**
 * An editable paragraph handle owned by a detached {@link RichTextBuilder}.
 *
 * The paragraph is resolved by its persisted paragraph id, while its tracked range is rebased after every run edit.
 * This keeps paragraph traversal safe when earlier translated text becomes longer or shorter.
 */
export class RichTextParagraphBuilder extends RichTextValue {
    /** @hideconstructor */
    constructor(
        private readonly _owner: RichTextBuilder,
        private readonly _paragraphId: string,
        private readonly _range: IMutableRichTextRange
    ) {
        super(createParagraphSnapshot(_owner.getData(), _paragraphId, _range));
    }

    /** Returns the persisted paragraph id. */
    getId(): string {
        return this._paragraphId;
    }

    /** Returns the current paragraph range without its trailing paragraph marker. */
    getRange(): IRichTextRange {
        return { ...this._range };
    }

    /**
     * Returns the current paragraph text without its trailing paragraph marker.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText().text('Quarterly Review');
     * const paragraph = richText.getParagraphs()[0];
     * console.log(paragraph.getText());
     * ```
     */
    getText(): string {
        const dataStream = this._owner.getData().body?.dataStream ?? '';
        return dataStream.slice(this._range.startOffset, this._range.endOffset);
    }

    override toPlainText(): string {
        return this.getText();
    }

    /**
     * Returns editable runs that cover all text in this paragraph, including unstyled gaps.
     * @returns Editable text runs in document order.
     */
    override getTextRuns(): RichTextRunBuilder[] {
        return this._owner._createTextRunBuilders(this._range);
    }

    override getParagraphStyle(): ParagraphStyleValue {
        return ParagraphStyleValue.create(this._getParagraph().paragraphStyle);
    }

    override getParagraphBullet() {
        return this._getParagraph().bullet;
    }

    override getLinks() {
        return this.getData().body?.customRanges?.filter((range) => range.rangeType === CustomRangeType.HYPERLINK) ?? [];
    }

    /** Agent-friendly alias of `getParagraphBullet()`. */
    getBullet() {
        return this.getParagraphBullet();
    }

    override getData(): IDocumentData {
        return createParagraphSnapshot(this._owner.getData(), this._paragraphId, this._range);
    }

    override copy(): RichTextBuilder {
        return RichTextBuilder.create(Tools.deepClone(this.getData()));
    }

    private _getParagraph() {
        const paragraph = this._owner.getData().body?.paragraphs?.find((item) => item.paragraphId === this._paragraphId);
        if (!paragraph) {
            throw new Error(`Rich text paragraph "${this._paragraphId}" was not found.`);
        }
        return paragraph;
    }
}

/**
 * An editable text-run handle owned by a detached {@link RichTextBuilder}.
 *
 * Calling {@link setText} replaces only the run text. The builder automatically updates this run, every later run,
 * paragraph indexes, hyperlinks, decorations, and other offset-based document metadata through TextX.
 */
export class RichTextRunBuilder {
    private _active = true;

    /** @hideconstructor */
    constructor(
        private readonly _owner: RichTextBuilder,
        private readonly _range: IMutableRichTextRange,
        private readonly _textStyle: ITextStyle | undefined,
        private readonly _styleId: string | undefined,
        private readonly _hasExplicitTextStyle: boolean
    ) {}

    /** Inclusive start offset, kept for compatibility with existing `getTextRuns()` callers. */
    get st(): number {
        return this._range.startOffset;
    }

    /** Exclusive end offset, automatically updated after text replacement. */
    get ed(): number {
        return this._range.endOffset;
    }

    /** Optional persisted style id. This is not a stable run identity. */
    get sId(): string | undefined {
        return this._styleId;
    }

    /** Existing text-style value property exposed by `getTextRuns()`. */
    get ts(): TextStyleValue | null {
        return this._textStyle ? TextStyleValue.create(this._textStyle) : null;
    }

    /** Returns the current run range. */
    getRange(): IRichTextRange {
        return { ...this._range };
    }

    /** Returns the current run text. */
    getText(): string {
        const dataStream = this._owner.getData().body?.dataStream ?? '';
        return dataStream.slice(this._range.startOffset, this._range.endOffset);
    }

    /** Returns this run's explicit text style, or `null` for an unstyled text segment. */
    getTextStyle(): TextStyleValue | null {
        return this.ts;
    }

    /** Returns whether this segment is backed by an explicit document text run. */
    hasTextStyle(): boolean {
        return this._hasExplicitTextStyle;
    }

    /**
     * Replaces this run's text without changing its style or paragraph structure.
     *
     * Replacement text may be longer or shorter than the original. Offsets are updated automatically, so handles
     * returned in the same `getTextRuns()` call remain safe to use in forward order. Paragraph and section breaks are
     * rejected because a text run cannot create or remove paragraphs.
     *
     * @param text New text for this run.
     * @returns This run handle for chaining. A handle becomes invalid after it is replaced with an empty string.
     * @example
     * ```ts
     * const richText = univerAPI.newRichText()
     *   .span('标题', { bold: true, fontSize: 24 })
     *   .paragraph()
     *   .text('正文内容');
     * const replacements = ['Quarterly Review', 'Revenue increased by 18%.'];
     * let index = 0;
     * for (const run of richText.getTextRuns()) {
     *   const replacement = replacements[index++];
     *   if (replacement !== undefined) run.setText(replacement);
     * }
     * console.log(richText.toPlainText());
     * ```
     */
    setText(text: string): this {
        if (!this._active) {
            throw new Error('Rich text run handle is no longer valid.');
        }
        this._owner._replaceTextRun(
            this._range,
            text,
            this._textStyle,
            this._styleId,
            this._hasExplicitTextStyle
        );
        if (!text) {
            this._active = false;
        }
        return this;
    }
}

function createParagraphSnapshot(
    data: IDocumentData,
    paragraphId: string,
    range: IRichTextRange
): IDocumentData {
    const { body, ...documentData } = data;
    if (!body) {
        throw new Error('Rich text body is not available.');
    }
    const paragraph = body.paragraphs?.find((item) => item.paragraphId === paragraphId);
    if (!paragraph) {
        throw new Error(`Rich text paragraph "${paragraphId}" was not found.`);
    }

    const paragraphBody = getBodySlice(body, range.startOffset, range.endOffset);
    paragraphBody.paragraphs = [{
        ...Tools.deepClone(paragraph),
        startIndex: range.endOffset - range.startOffset,
    }];

    return {
        ...Tools.deepClone(documentData),
        body: paragraphBody,
    };
}
