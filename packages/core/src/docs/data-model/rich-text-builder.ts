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
import type { BaselineOffset, BooleanNumber, HorizontalAlign, TextDirection } from '../../types/enum';
import type { IBorderData, IColorStyle, IDocumentData, INumberUnit, IParagraphBorder, IParagraphStyle, IShading, ITabStop, ITextDecoration, ITextStyle, NamedStyleType, SpacingRule } from '../../types/interfaces';
import { Tools } from '../../shared';
import { BuildTextUtils } from './text-x/build-utils';
import { getBodySlice } from './text-x/utils';

export class FontStyleValue {
    protected _style: ITextStyle;

    /**
     * Creates an instance of FontStyleValue.
     * @param {ITextStyle} style style object
     * @returns {FontStyleValue} font style instance
     * @example
     * ```ts
     * const style = FontStyleValue.create({ ff: 'Arial', fs: 12, it: 1, bl: 1 });
     * console.log(style);
     * ```
     */
    static create(style: ITextStyle = {}) {
        return new FontStyleValue(style);
    }

    constructor(style: ITextStyle = {}) {
        this._style = style;
    }

    get fontFamily(): Nullable<string> {
        return this._style.ff;
    }

    get fontSize(): number | undefined {
        return this._style.fs;
    }

    get italic(): boolean {
        return this._style.it === 1;
    }

    get bold(): boolean {
        return this._style.bl === 1;
    }

    get underline(): ITextDecoration | undefined {
        return this._style.ul;
    }

    get bottomBorderLine(): ITextDecoration | undefined {
        return this._style.bbl;
    }

    get strikethrough(): ITextDecoration | undefined {
        return this._style.st;
    }

    get overline(): ITextDecoration | undefined {
        return this._style.ol;
    }

    get background(): Nullable<IColorStyle> {
        return this._style.bg;
    }

    get border(): Nullable<IBorderData> {
        return this._style.bd;
    }

    get color(): Nullable<IColorStyle> {
        return this._style.cl;
    }

    get verticalAlign(): Nullable<BaselineOffset> {
        return this._style.va;
    }

    get numberFormat(): Nullable<{ pattern: string }> {
        return this._style.n;
    }

    copy(): FontStyleBuilder {
        return FontStyleBuilder.create(Tools.deepClone(this._style));
    }

    getValue(): ITextStyle {
        return { ...this._style };
    }
}

export class FontStyleBuilder extends FontStyleValue {
    static override create(style: ITextStyle = {}) {
        return new FontStyleBuilder(style);
    }

    constructor(style: ITextStyle = {}) {
        super(style);
    }

    setFontFamily(family: string): FontStyleBuilder {
        this._style.ff = family;
        return this;
    }

    setFontSize(size: number): FontStyleBuilder {
        this._style.fs = size;
        return this;
    }

    setItalic(value: boolean): FontStyleBuilder {
        this._style.it = value ? 1 : 0;
        return this;
    }

    setBold(value: boolean): FontStyleBuilder {
        this._style.bl = value ? 1 : 0;
        return this;
    }

    setUnderline(decoration: ITextDecoration): FontStyleBuilder {
        this._style.ul = decoration;
        return this;
    }

    setBottomBorderLine(decoration: ITextDecoration): FontStyleBuilder {
        this._style.bbl = decoration;
        return this;
    }

    setStrikethrough(decoration: ITextDecoration): FontStyleBuilder {
        this._style.st = decoration;
        return this;
    }

    setOverline(decoration: ITextDecoration): FontStyleBuilder {
        this._style.ol = decoration;
        return this;
    }

    setBackground(color: IColorStyle | null): FontStyleBuilder {
        this._style.bg = color;
        return this;
    }

    setBorder(border: IBorderData | null): FontStyleBuilder {
        this._style.bd = border;
        return this;
    }

    setColor(color: IColorStyle | null): FontStyleBuilder {
        this._style.cl = color;
        return this;
    }

    setVerticalAlign(offset: BaselineOffset | null): FontStyleBuilder {
        this._style.va = offset;
        return this;
    }

    setNumberFormat(pattern: string | null): FontStyleBuilder {
        this._style.n = pattern ? { pattern } : null;
        return this;
    }

    override copy(): FontStyleBuilder {
        return FontStyleBuilder.create(Tools.deepClone(this._style));
    }

    build(): ITextStyle {
        return this.getValue();
    }
}

export class ParagraphStyleValue {
    protected _style: IParagraphStyle;

    static create(style: IParagraphStyle = {}) {
        return new ParagraphStyleValue(style);
    }

    constructor(style: IParagraphStyle = {}) {
        this._style = style;
    }

    // Getters for indent properties
    get indentFirstLine(): Nullable<INumberUnit> {
        return this._style.indentFirstLine;
    }

    get hanging(): Nullable<INumberUnit> {
        return this._style.hanging;
    }

    get indentStart(): Nullable<INumberUnit> {
        return this._style.indentStart;
    }

    get tabStops(): Nullable<ITabStop[]> {
        return this._style.tabStops;
    }

    get indentEnd(): Nullable<INumberUnit> {
        return this._style.indentEnd;
    }

    // Getters for paragraph style properties
    get textStyle(): Nullable<ITextStyle> {
        return this._style.textStyle;
    }

    get headingId(): Nullable<string> {
        return this._style.headingId;
    }

    get namedStyleType(): Nullable<NamedStyleType> {
        return this._style.namedStyleType;
    }

    get horizontalAlign(): Nullable<HorizontalAlign> {
        return this._style.horizontalAlign;
    }

    get lineSpacing(): Nullable<number> {
        return this._style.lineSpacing;
    }

    get direction(): Nullable<TextDirection> {
        return this._style.direction;
    }

    get spacingRule(): Nullable<SpacingRule> {
        return this._style.spacingRule;
    }

    get snapToGrid(): Nullable<BooleanNumber> {
        return this._style.snapToGrid;
    }

    get spaceAbove(): Nullable<INumberUnit> {
        return this._style.spaceAbove;
    }

    get spaceBelow(): Nullable<INumberUnit> {
        return this._style.spaceBelow;
    }

    get borderBetween(): Nullable<IParagraphBorder> {
        return this._style.borderBetween;
    }

    get borderTop(): Nullable<IParagraphBorder> {
        return this._style.borderTop;
    }

    get borderBottom(): Nullable<IParagraphBorder> {
        return this._style.borderBottom;
    }

    get borderLeft(): Nullable<IParagraphBorder> {
        return this._style.borderLeft;
    }

    get borderRight(): Nullable<IParagraphBorder> {
        return this._style.borderRight;
    }

    get keepLines(): boolean {
        return this._style.keepLines === 1;
    }

    get keepNext(): boolean {
        return this._style.keepNext === 1;
    }

    get wordWrap(): boolean {
        return this._style.wordWrap === 1;
    }

    get widowControl(): boolean {
        return this._style.widowControl === 1;
    }

    get shading(): Nullable<IShading> {
        return this._style.shading;
    }

    get suppressHyphenation(): boolean {
        return this._style.suppressHyphenation === 1;
    }

    copy(): ParagraphStyleBuilder {
        return ParagraphStyleBuilder.create(Tools.deepClone(this._style));
    }

    getValue(): IParagraphStyle {
        return { ...this._style };
    }
}

export class ParagraphStyleBuilder extends ParagraphStyleValue {
    static override create(style: IParagraphStyle = {}) {
        return new ParagraphStyleBuilder(style);
    }

    constructor(style: IParagraphStyle = {}) {
        super(style);
    }

    // Setters for indent properties
    setIndentFirstLine(value: INumberUnit): ParagraphStyleBuilder {
        this._style.indentFirstLine = value;
        return this;
    }

    setHanging(value: INumberUnit): ParagraphStyleBuilder {
        this._style.hanging = value;
        return this;
    }

    setIndentStart(value: INumberUnit): ParagraphStyleBuilder {
        this._style.indentStart = value;
        return this;
    }

    setTabStops(value: ITabStop[]): ParagraphStyleBuilder {
        this._style.tabStops = value;
        return this;
    }

    setIndentEnd(value: INumberUnit): ParagraphStyleBuilder {
        this._style.indentEnd = value;
        return this;
    }

    // Setters for paragraph style properties
    setTextStyle(value: ITextStyle): ParagraphStyleBuilder {
        this._style.textStyle = value;
        return this;
    }

    setHeadingId(value: string): ParagraphStyleBuilder {
        this._style.headingId = value;
        return this;
    }

    setNamedStyleType(value: NamedStyleType): ParagraphStyleBuilder {
        this._style.namedStyleType = value;
        return this;
    }

    setHorizontalAlign(value: HorizontalAlign): ParagraphStyleBuilder {
        this._style.horizontalAlign = value;
        return this;
    }

    setLineSpacing(value: number): ParagraphStyleBuilder {
        this._style.lineSpacing = value;
        return this;
    }

    setDirection(value: TextDirection): ParagraphStyleBuilder {
        this._style.direction = value;
        return this;
    }

    setSpacingRule(value: SpacingRule): ParagraphStyleBuilder {
        this._style.spacingRule = value;
        return this;
    }

    setSnapToGrid(value: boolean): ParagraphStyleBuilder {
        this._style.snapToGrid = value ? 1 : 0;
        return this;
    }

    setSpaceAbove(value: INumberUnit): ParagraphStyleBuilder {
        this._style.spaceAbove = value;
        return this;
    }

    setSpaceBelow(value: INumberUnit): ParagraphStyleBuilder {
        this._style.spaceBelow = value;
        return this;
    }

    setBorderBetween(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderBetween = value;
        return this;
    }

    setBorderTop(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderTop = value;
        return this;
    }

    setBorderBottom(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderBottom = value;
        return this;
    }

    setBorderLeft(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderLeft = value;
        return this;
    }

    setBorderRight(value: IParagraphBorder): ParagraphStyleBuilder {
        this._style.borderRight = value;
        return this;
    }

    setKeepLines(value: boolean): ParagraphStyleBuilder {
        this._style.keepLines = value ? 1 : 0;
        return this;
    }

    setKeepNext(value: boolean): ParagraphStyleBuilder {
        this._style.keepNext = value ? 1 : 0;
        return this;
    }

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
        this._data = data;
    }

    slice(start: number, end: number): RichTextValue {
        const { body, ...ext } = this._data;
        return RichTextValue.create({
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
            ts: t.ts ? FontStyleValue.create(t.ts) : null,
        }));
    }

    getLinks() {}
}

export class RichTextBuilder extends RichTextValue {
    public static override create(data: IDocumentData): RichTextBuilder {
        return new RichTextBuilder(data);
    }

    constructor(data: IDocumentData) {
        super(data);
    }

    insertText(start: string, style?: FontStyleBuilder): RichTextBuilder;
    insertText(start: number, text: string, style?: FontStyleBuilder): RichTextBuilder;
    insertText(start: string | number, text?: string | FontStyleBuilder, style?: FontStyleBuilder): RichTextBuilder {
        // Implementation logic here
        return this;
    }

    delete(count: number): RichTextBuilder;
    delete(start: number, count: number): RichTextBuilder;
    delete(start: number, count?: number): RichTextBuilder {
        // Implementation logic here
        return this;
    }

    setStyle(start: number, end: number, style: FontStyleBuilder): RichTextBuilder {
        // Implementation logic here
        return this;
    }

    setLink(start: number, end: number, link: string): RichTextBuilder {
        // Implementation logic here
        return this;
    }

    cancelLink(linkId: string): RichTextBuilder;
    cancelLink(start: number, end: number): RichTextBuilder;
    cancelLink(start: number | string, end?: number): RichTextBuilder {
        // Implementation logic here
        return this;
    }

    insertParagraph(start?: number): RichTextBuilder {
        // Implementation logic here
        return this;
    }

    copy(): RichTextBuilder {
        return RichTextBuilder.create(Tools.deepClone(this._data));
    }

    override slice(start: number, end: number): RichTextBuilder {
        const { body, ...ext } = this._data;
        return RichTextBuilder.create({
            ...Tools.deepClone(ext),
            body: getBodySlice(body!, start, end),
        });
    }
}
