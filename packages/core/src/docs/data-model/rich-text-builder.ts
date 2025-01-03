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

import type { Nullable } from '../../shared';
import type { BaselineOffset, BooleanNumber, HorizontalAlign, TextDecoration, TextDirection } from '../../types/enum';
import { generateRandomId, Tools } from '../../shared';
import { CustomRangeType, type IBorderData, type IColorStyle, type IDocumentBody, type IDocumentData, type INumberUnit, type IParagraphBorder, type IParagraphStyle, type IShading, type ITabStop, type ITextDecoration, type ITextStyle, type NamedStyleType, type SpacingRule } from '../../types/interfaces';
import { DocumentDataModel } from './document-data-model';
import { BuildTextUtils } from './text-x/build-utils';
import { TextX } from './text-x/text-x';
import { getBodySlice } from './text-x/utils';

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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
     * console.log(style.italic);
     * ```
     */
    get italic(): boolean {
        return this._style.it === 1;
    }

    /**
     * Gets whether the text is bold
     * @returns {boolean} True if bold, false otherwise
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
     * console.log(style.bold);
     * ```
     */
    get bold(): boolean {
        return this._style.bl === 1;
    }

    /**
     * Gets the underline decoration
     * @returns {TextDecorationBuilder | undefined} The underline decoration or undefined
     * @example
     * ```ts
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = new TextStyleBuilder({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = TextStyleBuilder.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
        return this._decoration.s === 1;
    }

    /**
     * Gets whether the decoration color follows the font color
     * @returns {boolean} True if the decoration color follows the font color
     */
    get followFontColor(): boolean {
        return this._decoration.c === 1;
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * console.log(style.keepLines);
     * ```
     */
    get keepLines(): boolean {
        return this._style.keepLines === 1;
    }

    /**
     * Gets the keep next
     * @returns {boolean} The keep next
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * console.log(style.keepNext);
     * ```
     */
    get keepNext(): boolean {
        return this._style.keepNext === 1;
    }

    /**
     * Gets the word wrap
     * @returns {boolean} The word wrap
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * console.log(style.wordWrap);
     * ```
     */
    get wordWrap(): boolean {
        return this._style.wordWrap === 1;
    }

    /**
     * Gets the widow control
     * @returns {boolean} The widow control
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * console.log(style.widowControl);
     * ```
     */
    get widowControl(): boolean {
        return this._style.widowControl === 1;
    }

    /**
     * Gets the shading
     * @returns {Nullable<IShading>} The shading
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * console.log(style.suppressHyphenation);
     * ```
     */
    get suppressHyphenation(): boolean {
        return this._style.suppressHyphenation === 1;
    }

    /**
     * Creates a copy of the paragraph style
     * @returns {ParagraphStyleBuilder} The copy
     * @example
     * ```ts
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * const copy = style.copy();
     * copy.setTextStyle({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
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
     * const style = ParagraphStyleValue.create({ textStyle: { ff: 'Arial', fs: 12, it: 1, bl: 1 } });
     * const copy = style.copy();
     * copy.setWordWrap(true);
     * ```
     */
    setWordWrap(value: boolean): ParagraphStyleBuilder {
        this._style.wordWrap = value ? 1 : 0;
        return this;
    }

    setWidowControl(value: boolean): ParagraphStyleBuilder {
        this._style.widowControl = value ? 1 : 0;
        return this;
    }

    setShading(value: IShading): ParagraphStyleBuilder {
        this._style.shading = value;
        return this;
    }

    setSuppressHyphenation(value: boolean): ParagraphStyleBuilder {
        this._style.suppressHyphenation = value ? 1 : 0;
        return this;
    }

    override copy(): ParagraphStyleBuilder {
        return ParagraphStyleBuilder.create(Tools.deepClone(this._style));
    }

    build(): IParagraphStyle {
        return this.getValue();
    }
}

export class RichTextValue {
    protected _data: IDocumentData;

    public static create(data: IDocumentData): RichTextValue {
        return new RichTextValue(data);
    }

    constructor(data: IDocumentData) {
        if (!data.body) {
            throw new Error('Invalid document data, body is required');
        }
        this._data = data;
    }

    copy(): RichTextBuilder {
        return RichTextBuilder.create(Tools.deepClone(this._data));
    }

    slice(start: number, end: number): RichTextBuilder {
        const { body, ...ext } = this._data;
        return RichTextBuilder.create({
            ...Tools.deepClone(ext),
            body: getBodySlice(body!, start, end),
        });
    }

    toPlainText(): string {
        return BuildTextUtils.transform.getPlainText(this._data.body?.dataStream ?? '');
    }

    getParagraphStyle(): ParagraphStyleValue {
        return ParagraphStyleValue.create(this._data.body?.paragraphs?.[0].paragraphStyle);
    }

    getParagraphBullet() {
        return this._data.body?.paragraphs?.[0].bullet;
    }

    getParagraphs(): RichTextValue[] {
        const paragraphs = this._data.body?.paragraphs ?? [];

        let start = 0;
        return paragraphs.map((paragraph) => {
            const sub = this.slice(start, paragraph.startIndex);
            start = paragraph.startIndex;
            return sub;
        });
    }

    getTextRuns() {
        return (this._data.body?.textRuns ?? []).map((t) => ({
            ...t,
            ts: t.ts ? TextStyleValue.create(t.ts) : null,
        }));
    }

    getLinks() {
        return this._data.body?.customRanges?.filter((r) => r.rangeType === CustomRangeType.HYPERLINK) ?? [];
    }

    getData(): IDocumentData {
        return this._data;
    }
}

export class RichTextBuilder extends RichTextValue {
    public static override create(data: IDocumentData): RichTextBuilder {
        return new RichTextBuilder(data);
    }

    private _doc: DocumentDataModel;

    constructor(data: IDocumentData) {
        super(data);
        this._doc = new DocumentDataModel(data);
    }

    insertText(start: string, style?: TextStyleBuilder): RichTextBuilder;
    insertText(start: number, text: string, style?: TextStyleBuilder): RichTextBuilder;
    insertText(start: string | number, text?: string | TextStyleBuilder, style?: TextStyleBuilder): RichTextBuilder {
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
            insertStyle = text;
        } else {
            insertStyle = style;
        }
        const newBody: IDocumentBody = {
            dataStream: insertText,
            textRuns: insertStyle
                ? [
                    {
                        ts: insertStyle?.build(),
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

    insertRichText(richText: RichTextValue): RichTextBuilder;
    insertRichText(start: number, richText: RichTextValue): RichTextBuilder;
    insertRichText(start: number | RichTextValue, richText?: RichTextValue): RichTextBuilder {
        let startIndex = (this._data.body?.dataStream.length ?? 2) - 2;
        let insertText: IDocumentData;
        if (typeof start === 'object') {
            insertText = start.getData();
        } else {
            startIndex = Math.min(start, startIndex);
            insertText = richText!.getData();
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

    delete(count: number): RichTextBuilder;
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

    setStyle(start: number, end: number, style: TextStyleBuilder): RichTextBuilder {
        const newBody: IDocumentBody = {
            dataStream: '',
            textRuns: [{
                ts: style.build(),
                st: 0,
                ed: end - start,
            }],
        };
        const actions = BuildTextUtils.selection.retain([{ startOffset: start, endOffset: end, collapsed: true }], newBody);
        TextX.apply(this._doc.getBody()!, actions);
        return this;
    }

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

    cancelLink(linkId: string): RichTextBuilder;
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

    insertParagraph(paragraphStyle?: ParagraphStyleBuilder): RichTextBuilder;
    insertParagraph(start: number, paragraphStyle: ParagraphStyleBuilder): RichTextBuilder;
    insertParagraph(start?: number | ParagraphStyleBuilder, paragraphStyle?: ParagraphStyleBuilder): RichTextBuilder {
        let newBody: IDocumentBody;
        let startIndex: number;
        if (typeof start === 'object') {
            newBody = {
                dataStream: '\r',
                paragraphs: [{
                    startIndex: 0,
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
                    paragraphStyle: paragraphStyle?.build(),
                }],
            };
        }

        this.insertRichText(startIndex, RichTextValue.create({ body: newBody, id: 'd', documentStyle: {} }));
        return this;
    }
}
