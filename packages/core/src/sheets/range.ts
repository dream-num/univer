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

import type { IObjectMatrixPrimitiveType, Nullable } from '../shared';
import type { HorizontalAlign, VerticalAlign } from '../types/enum';
import type {
    IBorderData,
    IDocumentBody,
    IDocumentData,
    IStyleBase,
    IStyleData,
    ITextDecoration,
    ITextRotation,
} from '../types/interfaces';
import type { Styles } from './styles';
import type { ICellData, IRange } from './typedef';
import type { Worksheet } from './worksheet';
import { ObjectMatrix, Tools } from '../shared';
import { DEFAULT_STYLES } from '../types/const';
import { BooleanNumber, FontItalic, FontWeight, WrapStrategy } from '../types/enum';
import { RANGE_TYPE } from './typedef';

/**
 * getObjectValues options type
 */
interface IValueOptionsType {
    /**
     * set whether to include style
     */
    isIncludeStyle?: boolean;
}

export interface IRangeDependencies {
    getStyles(): Readonly<Styles>;
}

export function isAllFormatInTextRuns(key: keyof IStyleBase, body: IDocumentBody): BooleanNumber {
    const { textRuns = [] } = body;

    let len = 0;

    for (const textRun of textRuns) {
        const { ts = {}, st, ed } = textRun;

        if (ts[key] == null) {
            return BooleanNumber.FALSE;
        }

        switch (key) {
            case 'bl': // fallthrough
            case 'it': {
                if (ts[key] === BooleanNumber.FALSE) {
                    return BooleanNumber.FALSE;
                }
                break;
            }

            case 'ul': // fallthrough
            case 'st': {
                if (ts[key]!.s === BooleanNumber.FALSE) {
                    return BooleanNumber.FALSE;
                }
                break;
            }

            default:
                throw new Error(`unknown style key: ${key} in IStyleBase`);
        }

        len += ed - st;
    }

    // Ensure textRuns cover all content.
    const index = body.dataStream.indexOf('\r\n');

    return index === len ? BooleanNumber.TRUE : BooleanNumber.FALSE;
}

/**
 * Access and modify spreadsheet ranges.
 *
 * @remarks
 * A range can be a single cell in a sheet or a group of adjacent cells in a sheet.
 *
 * Reference from: https://developers.google.com/apps-script/reference/spreadsheet/range
 *
 * @beta
 */
export class Range {
    private _range: IRange;

    private _worksheet: Worksheet;

    constructor(
        workSheet: Worksheet,
        range: IRange,
        private readonly _deps: IRangeDependencies
    ) {
        this._range = range;
        this._worksheet = workSheet;
    }

    static foreach(range: IRange, action: (row: number, column: number) => void): void {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                action(i, j);
            }
        }
    }

    static transformRange = (range: IRange, worksheet: Worksheet): IRange => {
        const maxColumns = worksheet.getMaxColumns() - 1;
        const maxRows = worksheet.getMaxRows() - 1;

        if (range.rangeType === RANGE_TYPE.ALL) {
            return {
                startColumn: 0,
                startRow: 0,
                endColumn: maxColumns,
                endRow: maxRows,
            };
        }

        if (range.rangeType === RANGE_TYPE.COLUMN) {
            return {
                startRow: 0,
                endRow: maxRows,
                startColumn: range.startColumn,
                endColumn: range.endColumn,
            };
        }

        if (range.rangeType === RANGE_TYPE.ROW) {
            return {
                startColumn: 0,
                endColumn: maxColumns,
                startRow: range.startRow,
                endRow: range.endRow,
            };
        }

        return {
            startColumn: range.startColumn,
            endColumn: Math.min(range.endColumn, maxColumns),
            startRow: range.startRow,
            endRow: Math.min(range.endRow, maxRows),
        };
    };

    /**
     * get current range data
     *
     * @returns current range
     */
    getRangeData(): IRange {
        return this._range;
    }

    /**
     * Returns the value of the top-left cell in the range. The value may be of type Number, Boolean, Date, or String
     * depending on the value of the cell. Empty cells return an empty string.
     * @returns  The value in this cell
     */
    getValue(): Nullable<ICellData> {
        return this.getValues()[0][0];
    }

    /**
     * Returns the rectangular grid of values for this range.
     *
     * Returns a two-dimensional array of values, indexed by row, then by column. The values may be of type Number,
     * Boolean, Date, or String, depending on the value of the cell. Empty cells are represented by an empty string
     * in the array. Remember that while a range index starts at 0, 0, same as the JavaScript array is indexed from [0][0].
     *
     * In web apps, a Date value isn't a legal parameter. getValues() fails to return data to a web app if the range
     * contains a cell with a Date value. Instead, transform all the values retrieved from the sheet to a supported
     * JavaScript primitive like a Number, Boolean, or String.
     *
     * @returns  A two-dimensional array of values.
     */
    getValues(): Array<Array<Nullable<ICellData>>> {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const range: Array<Array<Nullable<ICellData>>> = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: Array<Nullable<ICellData>> = [];

            for (let c = startColumn; c <= endColumn; c++) {
                row.push(this.getMatrix().getValue(r, c) || null);
            }

            range.push(row);
        }
        return range;
    }

    /**
     * get range matrix
     *
     * @returns range matrix
     */
    getMatrix(): ObjectMatrix<Nullable<ICellData>> {
        const { startRow, endRow, startColumn, endColumn } = this._range;

        const sheetMatrix = this._worksheet.getCellMatrix();
        const rangeMatrix = new ObjectMatrix<Nullable<ICellData>>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                rangeMatrix.setValue(r, c, sheetMatrix.getValue(r, c) || null);
            }
        }

        return rangeMatrix;
    }

    /**
     * get range matrix object
     *
     * @returns range matrix object
     */
    getMatrixObject(): ObjectMatrix<ICellData> {
        const { startRow, endRow, startColumn, endColumn } = this._range;

        const sheetMatrix = this._worksheet.getCellMatrix();
        const rangeMatrix = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                rangeMatrix.setValue(r - startRow, c - startColumn, sheetMatrix.getValue(r, c) || {});
            }
        }

        return rangeMatrix;
    }

    /**
     * Returns a string description of the range, in A1 notation.
     *
     * @returns The string description of the range in A1 notation.
     */
    getA1Notation(): string {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        let start;
        let end;
        if (startColumn < endColumn) {
            start = Tools.numToWord(startColumn + 1) + (startRow + 1);
            end = Tools.numToWord(endColumn + 1) + (endRow + 1);
        } else {
            start = Tools.numToWord(endColumn + 1) + (endRow + 1);
            end = Tools.numToWord(startColumn + 1) + (startRow + 1);
        }

        if (start === end) return `${start}`;
        return `${start}:${end}`;
    }

    /**
     * Returns the background color of the top-left cell in the range (for example, '#ffffff').
     *
     * @returns — The color code of the background.
     */
    getBackground(): string {
        return this.getBackgrounds()[0][0];
    }

    /**
     * Returns the background colors of the cells in the range (for example, '#ffffff').
     *
     * @returns  — A two-dimensional array of color codes of the backgrounds.
     */
    getBackgrounds(): string[][] {
        const styles = this._deps.getStyles();
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const rgbColor = styles.getStyleByCell(cell);
                return rgbColor?.bg?.rgb || DEFAULT_STYLES.bg.rgb;
            })
        );
    }

    /**
     * Returns a given cell within a range.
     *
     * The row and column here are relative to the range
     * e.g. "B2:D4", getCell(0,0) in this code returns the cell at B2
     * @returns  — A range containing a single cell at the specified coordinates.
     */
    getCell(row: number, column: number): Range {
        const { startRow, startColumn } = this._range;
        const cell = {
            startRow: startRow + row,
            endRow: startRow + row,
            startColumn: startColumn + column,
            endColumn: startColumn + column,
        };

        return new Range(this._worksheet, cell, this._deps);
    }

    /**
     * Returns the starting column position for this range
     *
     * @returns  — The range's starting column position in the spreadsheet.
     */
    getColumn(): number {
        return this._range.startColumn;
    }

    /**
     * Returns the data of the object structure, and can set whether to bring styles
     */
    getObjectValue(options: IValueOptionsType = {}): Nullable<ICellData> {
        return this.getObjectValues(options)[0][0];
    }

    /**
     * Returns the data of the object structure, and can set whether to bring styles
     *
     * @param options set whether to include style
     * @returns Returns a value in object format
     */
    getObjectValues(options: IValueOptionsType = {}): IObjectMatrixPrimitiveType<Nullable<ICellData>> {
        const { startRow, endRow, startColumn, endColumn } = this._range;

        // get object values from sheet matrix, or use this.getMatrix() create a new matrix then this.getMatrix().getData()
        const values = this._worksheet.getCellMatrix().getFragment(startRow, endRow, startColumn, endColumn).getData();

        if (options.isIncludeStyle) {
            const style = this._deps.getStyles();
            for (let r = 0; r <= endRow - startRow; r++) {
                for (let c = 0; c <= endColumn - startColumn; c++) {
                    // handle null
                    if (values == null || values?.[r]?.[c] == null) {
                        continue;
                    }

                    const s = values[r][c]!.s;

                    // make sure value has style
                    if (s) {
                        values[r][c]!.s = style.get(s);
                    }
                }
            }
        }

        return values;
    }

    /**
     * Returns the font color of the cell in the top-left corner of the range, in CSS notation
     */
    getFontColor(): string {
        return this.getFontColors()[0][0];
    }

    /**
     * Returns the font colors of the cells in the range in CSS notation (such as '#ffffff' or 'white').
     */
    getFontColors(): string[][] {
        const styles = this._deps.getStyles();
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const cellStyle = styles.getStyleByCell(cell);
                return cellStyle?.cl?.rgb || DEFAULT_STYLES.cl.rgb;
            })
        );
    }

    /**
     * Returns the font families of the cells in the range.
     */
    getFontFamilies(): string[][] {
        return this._getStyles('ff') as string[][];
    }

    /**
     * Returns the font family of the cell in the top-left corner of the range.
     */
    getFontFamily(): string {
        return this.getFontFamilies()[0][0];
    }

    /**
     * Returns the underlines of the cells in the range.
     */
    getUnderlines(): ITextDecoration[][] {
        return this._getStyles('ul') as ITextDecoration[][];
    }

    /**
     * Returns the underline of the cells in the range.
     */
    getUnderline(): ITextDecoration {
        const { p } = this.getValue() ?? {};

        if (p && Array.isArray(p.body?.textRuns) && p.body.textRuns.length > 0) {
            return isAllFormatInTextRuns('ul', p.body) === BooleanNumber.TRUE
                ? {
                    s: BooleanNumber.TRUE,
                }
                : {
                    s: BooleanNumber.FALSE,
                };
        }

        return this.getUnderlines()[0][0];
    }

    /**
     * Returns the overlines of the cells in the range.
     */
    getOverlines(): ITextDecoration[][] {
        return this._getStyles('ol') as ITextDecoration[][];
    }

    /**
     * Returns the overline of the cells in the range.
     */
    getOverline(): ITextDecoration {
        return this.getOverlines()[0][0];
    }

    /**
     * Returns the strikeThrough of the cells in the range.
     */
    getStrikeThrough(): ITextDecoration {
        const { p } = this.getValue() ?? {};

        if (p && Array.isArray(p.body?.textRuns) && p.body.textRuns.length > 0) {
            return isAllFormatInTextRuns('st', p.body) === BooleanNumber.TRUE
                ? {
                    s: BooleanNumber.TRUE,
                }
                : {
                    s: BooleanNumber.FALSE,
                };
        }

        return this.getStrikeThroughs()[0][0];
    }

    /**
     * Returns the strikeThroughs of the cells in the range.
     */
    private getStrikeThroughs(): ITextDecoration[][] {
        return this._getStyles('st') as ITextDecoration[][];
    }

    /**
     * Returns the font size in point size of the cell in the top-left corner of the range.
     */
    getFontSize(): number {
        const p = (this.getValue()?.p || {}) as IDocumentData;

        if (p && Array.isArray(p.body?.textRuns) && p.body.textRuns.length > 0) {
            if (p.body.textRuns.some((textRun) => textRun?.ts?.fs != null)) {
                return Math.max(...p.body.textRuns.map((textRun) => textRun?.ts?.fs || 0));
            } else {
                return this.getFontSizes()[0][0];
            }
        }

        return this.getFontSizes()[0][0];
    }

    /**
     * Returns the font sizes of the cells in the range.
     */
    getFontSizes(): number[][] {
        return this._getStyles('fs') as number[][];
    }

    /**
     * Returns the border info of the cells in the range.
     */

    getBorder(): IBorderData {
        return this.getBorders()[0][0];
    }

    getBorders(): IBorderData[][] {
        return this._getStyles('bd') as IBorderData[][];
    }

    /**
     * Returns the font style ('italic' or 'normal') of the cell in the top-left corner of the range.
     */
    getFontStyle(): FontItalic {
        const { p } = this.getValue() ?? {};

        if (p && Array.isArray(p.body?.textRuns) && p.body.textRuns.length > 0) {
            return isAllFormatInTextRuns('it', p.body) === BooleanNumber.TRUE
                ? FontItalic.ITALIC
                : FontItalic.NORMAL;
        }

        return this._getFontStyles()[0][0];
    }

    /**
     * Returns the font styles of the cells in the range.
     */
    private _getFontStyles(): FontItalic[][] {
        return this._getStyles('it') as FontItalic[][];
    }

    /**
     * Returns the font weight (normal/bold) of the cell in the top-left corner of the range.
     * If the cell has rich text, the return value according to the textRuns of the rich text,
     * when all styles of textRuns are bold, it will return FontWeight.BOLD,
     * otherwise return FontWeight.NORMAL.
     */
    getFontWeight(): FontWeight {
        const { p } = this.getValue() ?? {};

        if (p && Array.isArray(p.body?.textRuns) && p.body.textRuns.length > 0) {
            return isAllFormatInTextRuns('bl', p.body) === BooleanNumber.TRUE
                ? FontWeight.BOLD
                : FontWeight.NORMAL;
        }

        return this._getFontWeights()[0][0];
    }

    /**
     * Returns the font weights of the cells in the range.
     */
    private _getFontWeights(): FontWeight[][] {
        return this._getStyles('bl') as FontWeight[][];
    }

    /**
     * Returns the grid ID of the range's parent sheet.
     */
    getGridId(): string {
        return this._worksheet.getSheetId();
    }

    /**
     * Returns the height of the range.
     */
    getHeight(): number {
        const { _range: _rangeData, _worksheet } = this;
        const { startRow, endRow } = _rangeData;
        let h = 0;
        for (let i = 0; i <= endRow - startRow; i++) {
            const hh = _worksheet.getRowHeight(i);
            h += hh;
        }
        return h;
    }

    /**
     *     Returns the horizontal alignment of the text (left/center/right) of the cell in the top-left corner of the range.
     */
    getHorizontalAlignment(): HorizontalAlign {
        return this.getHorizontalAlignments()[0][0];
    }

    /**
     *Returns the horizontal alignments of the cells in the range.
     */
    getHorizontalAlignments(): HorizontalAlign[][] {
        return this._getStyles('ht') as HorizontalAlign[][];
    }

    /**
     * Returns the end column position.
     */
    getLastColumn(): number {
        return this._range.endColumn;
    }

    /**
     *     Returns the end row position.
     */
    getLastRow(): number {
        return this._range.endRow;
    }

    /**
     * Returns the number of columns in this range.
     */
    getNumColumns(): number {
        const { startColumn, endColumn } = this._range;
        return endColumn - startColumn + 1;
    }

    /**
     * Returns the number of rows in this range.
     */
    getNumRows(): number {
        const { startRow, endRow } = this._range;
        return endRow - startRow + 1;
    }

    /**
     * Returns the Rich Text value for the top left cell of the range, or null if the cell value is not text.
     */
    getRichTextValue(): Nullable<IDocumentData | ''> {
        return this.getRichTextValues()[0][0];
    }

    /**
     * Returns the Rich Text values for the cells in the range.
     */
    getRichTextValues(): Array<Array<Nullable<IDocumentData | ''>>> {
        return this.getValues().map((row) => row.map((cell: Nullable<ICellData>) => cell?.p || ''));
    }

    /**
     * Returns the row position for this range.
     */
    getRowIndex(): number {
        return this._range.startRow;
    }

    /**
     * Returns the sheet this range belongs to.
     */
    getSheet(): Worksheet {
        return this._worksheet;
    }

    /**
     * Returns the text direction for the top left cell of the range.
     */
    getTextDirection(): number {
        return this.getTextDirections()[0][0];
    }

    /**
     * Returns the text directions for the cells in the range.
     */
    getTextDirections(): number[][] {
        return this._getStyles('td') as number[][];
    }

    /**
     * Returns the text rotation settings for the top left cell of the range.
     */
    // getTextRotation(): number {
    getTextRotation(): ITextRotation {
        return this.getTextRotations()[0][0];
    }

    /**
     * Returns the text rotation settings for the cells in the range.
     */
    // getTextRotations(): number[][] {
    getTextRotations(): ITextRotation[][] {
        return this._getStyles('tr') as ITextRotation[][];
    }

    /**
     *     Returns the text style for the top left cell of the range.
     */
    getTextStyle(): Nullable<IStyleData> {
        return this.getTextStyles()[0][0];
    }

    /**
     * Returns the text styles for the cells in the range.
     */
    getTextStyles(): Array<Array<Nullable<IStyleData>>> {
        const styles = this._deps.getStyles();
        return this.getValues().map((row) => row.map((cell: Nullable<ICellData>) => styles.getStyleByCell(cell)));
    }

    /**
     * Returns the vertical alignment (top/middle/bottom) of the cell in the top-left corner of the range.
     */
    getVerticalAlignment(): VerticalAlign {
        return this.getVerticalAlignments()[0][0];
    }

    /**
     * Returns the vertical alignments of the cells in the range.
     */
    getVerticalAlignments(): VerticalAlign[][] {
        return this._getStyles('vt') as VerticalAlign[][];
    }

    /**
     * Returns the width of the range in columns.
     */
    getWidth(): number {
        const { _range: _rangeData, _worksheet } = this;
        const { startColumn, endColumn } = _rangeData;
        let w = 0;
        for (let i = 0; i <= endColumn - startColumn; i++) {
            w += _worksheet.getColumnWidth(i);
        }
        return w;
    }

    /**
     * Returns whether the text in the cell wraps.
     */
    getWrap(): BooleanNumber {
        return this.getWrapStrategy() === WrapStrategy.WRAP ? BooleanNumber.TRUE : BooleanNumber.FALSE;
    }

    /**
     * Returns the text wrapping strategies for the cells in the range.
     */
    getWrapStrategies(): WrapStrategy[][] {
        return this._getStyles('tb') as WrapStrategy[][];
    }

    /**
     * Returns the text wrapping strategy for the top left cell of the range.
     */
    getWrapStrategy(): WrapStrategy {
        return this.getWrapStrategies()[0][0];
    }

    forEach(action: (row: number, column: number) => void): void {
        Range.foreach(this._range, action);
    }

    /**
     *
     * @param arg Shorthand for the style that gets
     * @returns style value
     */
    private _getStyles(styleKey: keyof IStyleData): Array<Array<IStyleData[keyof IStyleData]>> {
        const styles = this._deps.getStyles();

        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const style = styles && styles.getStyleByCell(cell);

                return (style && style[styleKey]) || (DEFAULT_STYLES as IStyleData)[styleKey];
            })
        );
    }
}
