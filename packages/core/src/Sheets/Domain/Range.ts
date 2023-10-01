import { Nullable, ObjectMatrix, ObjectMatrixPrimitiveType, Tools } from '../../Shared';
import { DEFAULT_STYLES } from '../../Types/Const';
import {
    BooleanNumber,
    Dimension,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    VerticalAlign,
    WrapStrategy,
} from '../../Types/Enum';
import {
    IBorderData,
    ICellData,
    IDocumentData,
    IRange,
    IStyleData,
    ITextDecoration,
    ITextRotation,
} from '../../Types/Interfaces';
import { Styles } from './Styles';
import type { Worksheet } from './Worksheet';

/**
 * getObjectValues options type
 */
type IValueOptionsType = {
    /**
     * set whether to include style
     */
    isIncludeStyle?: boolean;
};

export interface IRangeDependencies {
    getStyles(): Readonly<Styles>;
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
    getMatrix(): ObjectMatrix<ICellData> {
        const { startRow, endRow, startColumn, endColumn } = this._range;

        const sheetMatrix = this._worksheet.getCellMatrix();
        const rangeMatrix = new ObjectMatrix<ICellData>();

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
     * Returns the displayed value of the top-left cell in the range. The value is a String. The displayed value takes into account date, time and currency formatting formatting, including formats applied automatically by the spreadsheet's Locale setting. Empty cells return an empty string.
     *
     * @returns  The displayed value in this cell.
     */
    getDisplayValue(): string | IDocumentData {
        const value = this.getValue();
        if (value && value.p) {
            return value.p;
        }
        if (value && value.m) {
            return value.m;
        }
        return '';
    }

    /**
     * Returns the rectangular grid of values for this range.
     *
     * Returns a two-dimensional array of displayed values, indexed by row, then by column. The values are String objects. The displayed value takes into account date, time and currency formatting, including formats applied automatically by the spreadsheet's Locale setting. Empty cells are represented by an empty string in the array. Remember that while a range index starts at 0, 0, same as the JavaScript array is indexed from [0][0].
     *
     * @returns  — A two-dimensional array of values.
     */
    getDisplayValues(): Array<Array<string | IDocumentData>> {
        return this.getValues().map((row) =>
            row.map((value: Nullable<ICellData>) => {
                if (value && value.p) {
                    return value.p;
                }
                if (value && value.m) {
                    return value.m;
                }
                return '';
            })
        );
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
                let rgbColor: string = DEFAULT_STYLES.bg?.rgb!;
                rgbColor = styles.getStyleByCell(cell)?.bg?.rgb!;
                return rgbColor;
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
        const { startRow, endRow, startColumn, endColumn } = this._range;
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
    getObjectValue(options: IValueOptionsType = {}): ICellData {
        return this.getObjectValues(options)[0][0];
    }

    /**
     * Returns the data of the object structure, and can set whether to bring styles
     *
     * @param options set whether to include style
     * @returns Returns a value in object format
     */
    getObjectValues(options: IValueOptionsType = {}): ObjectMatrixPrimitiveType<ICellData> {
        const { startRow, endRow, startColumn, endColumn } = this._range;

        // get object values from sheet matrix, or use this.getMatrix() create a new matrix then this.getMatrix().getData()
        const values = this._worksheet.getCellMatrix().getFragments(startRow, endRow, startColumn, endColumn).getData();

        if (options.isIncludeStyle) {
            const style = this._deps.getStyles();
            for (let r = 0; r <= endRow - startRow; r++) {
                for (let c = 0; c <= endColumn - startColumn; c++) {
                    // handle null
                    if (!values[r][c]) continue;

                    const s = values[r][c].s;

                    // make sure value has style
                    if (s) {
                        values[r][c].s = style.get(s);
                    }
                }
            }
        }

        return values;
    }

    /**
     * Notify other Components
     * TODO: 待触发更新测试
     */
    // notifyUpdated() {
    //     this._context.onAfterChangeRangeDataObservable.notifyObservers(
    //         this._worksheet
    //     );
    // }

    /**
     * Returns the font color of the cell in the top-left corner of the range, in CSS notation
     */
    getFontColor(): Nullable<string> {
        return this.getFontColors()[0][0];
    }

    /**
     * Returns the font colors of the cells in the range in CSS notation (such as '#ffffff' or 'white').
     */
    getFontColors(): Array<Array<Nullable<string>>> {
        const styles = this._deps.getStyles();
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const cellStyle = styles.getStyleByCell(cell);
                return cellStyle?.cl?.rgb || DEFAULT_STYLES.cl?.rgb;
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
     * 	Returns the font family of the cell in the top-left corner of the range.
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
     * Returns the strikeThroughs of the cells in the range.
     */
    getStrikeThroughs(): ITextDecoration[][] {
        return this._getStyles('st') as ITextDecoration[][];
    }

    /**
     * Returns the strikeThrough of the cells in the range.
     */
    getStrikeThrough(): ITextDecoration {
        return this.getStrikeThroughs()[0][0];
    }

    /**
     * Returns the font size in point size of the cell in the top-left corner of the range.
     */
    getFontSize(): number {
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
        return this.getFontStyles()[0][0];
    }

    /**
     * Returns the font styles of the cells in the range.
     */
    getFontStyles(): FontItalic[][] {
        return this._getStyles('it') as FontItalic[][];
    }

    /**
     * Returns the font weight (normal/bold) of the cell in the top-left corner of the range.
     */
    getFontWeight(): FontWeight {
        return this.getFontWeights()[0][0];
    }

    /**
     * Returns the font weights of the cells in the range.
     */
    getFontWeights(): FontWeight[][] {
        return this._getStyles('bl') as FontWeight[][];
    }

    /**
     * Returns the formula (A1 notation) for the top-left cell of the range, or an empty string if the cell is empty or doesn't contain a formula.
     */
    // getFormula(): string {
    //     return this.getFormulas()[0][0];
    // }

    /**
     * Returns the formulas (A1 notation) for the cells in the range.
     */
    // getFormulas(): string[][] {
    //     return this.getValues().map((row) =>
    //         row.map((cell: Nullable<ICellData>) => cell?.f || '')
    //     );
    // }

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
     * 	Returns the horizontal alignment of the text (left/center/right) of the cell in the top-left corner of the range.
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
     * 	Returns the end row position.
     */
    getLastRow(): number {
        return this._range.endRow;
    }

    /**
     * 	Returns the note associated with the given range.
     */
    // getNote(): string {
    //     return this.getNotes()[0][0];
    // }

    /**
     * 	Returns the notes associated with the cells in the range.
     */
    // getNotes(): string[][] {
    //     return this.getValues().map((row) =>
    //         row.map((cell: Nullable<ICellData>) => cell?.n || '')
    //     );
    // }

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
     * Get the number or date formatting of the top-left cell of the given range.
     */
    // getNumberFormat(): string {
    //     return this.getNumberFormats()[0][0];
    // }

    /**
     * Returns the number or date formats for the cells in the range.
     */
    // getNumberFormats(): string[][] {
    //     return this.getValues().map((row) =>
    //         row.map((cell: Nullable<ICellData>) => cell?.fm?.f || '')
    //     );
    // }

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
     * 	Returns the text style for the top left cell of the range.
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
        return this.getWraps()[0][0];
    }

    /**
     * Returns whether the text in the cells wrap.
     */
    getWraps(): BooleanNumber[][] {
        return this._getStyles('tb') as BooleanNumber[][];
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

    /**
     * Returns true if the range is totally blank.
     */
    isBlank(): boolean {
        const data = this.getValues();
        return data.some((items) => items.some((item) => item?.m === ''));
    }

    /**
     * Returns a copy of the range expanded in the four cardinal Directions to cover all adjacent cells
     * with data in them.
     *
     * @returns This range, for chaining.
     */
    getDataRegion(): Range;
    /**
     * Returns a copy of the range expanded Direction.UP and Direction.DOWN if the specified dimension is Dimension.ROWS, or Direction.NEXT and Direction.PREVIOUS if the dimension is Dimension.COLUMNS.
     *
     * @returns This range, for chaining.
     */
    getDataRegion(dimension: Dimension): Range;
    // eslint-disable-next-line max-lines-per-function
    getDataRegion(...argument: any): Range {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        let numRows: number;
        let numColumns: number;

        const data = this._worksheet.getCellMatrix();
        if (Tools.isNumber(argument[0])) {
            const dimension = argument[0];

            if (dimension === Dimension.COLUMNS) {
                let start: number = startRow;
                let end: number = startRow;
                const rowMax = this._worksheet.getRowCount();
                for (let i = 1; i < startRow; i++) {
                    const element = data.getValue(startRow - i, startColumn);
                    if (!element) {
                        start = startRow - i + 1;
                        break;
                    }
                }
                const j = 0;
                while (j < rowMax - startRow) {
                    const element = data.getValue(startRow + j, startColumn);
                    if (!element) {
                        end = startRow - j - 1;
                        break;
                    }
                }

                numColumns = start - end;
                numRows = 0;
                return this._worksheet.getRange(startRow, start, numRows, numColumns);
            }
            if (dimension === Dimension.ROWS) {
                let start: number = startRow;
                let end: number = startRow;
                const colMax = this._worksheet.getColumnCount();
                for (let i = 1; i < startRow; i++) {
                    const element = data.getValue(startRow, startColumn - i);
                    if (!element) {
                        start = startRow - i + 1;
                        break;
                    }
                }
                const j = 0;
                while (j < colMax - startColumn) {
                    const element = data.getValue(startRow, startColumn + j);
                    if (!element) {
                        end = startRow - j - 1;
                        break;
                    }
                }

                numColumns = 0;
                numRows = start - end;
                return this._worksheet.getRange(start, startColumn, numRows, numColumns);
            }
        } else {
            let rowStart: number = startRow;
            let rowEnd: number = startRow;
            const rowMax = this._worksheet.getRowCount();
            for (let i = 1; i < startRow; i++) {
                const element = data.getValue(startRow - i, startColumn);
                if (!element) {
                    rowStart = startRow - i + 1;
                    break;
                }
            }
            const rj = 0;
            while (rj < rowMax - startRow) {
                const element = data.getValue(startRow + rj, startColumn);
                if (!element) {
                    rowEnd = startRow - rj - 1;
                    break;
                }
            }

            let columnStart: number = startRow;
            let columnEnd: number = startRow;
            const colMax = this._worksheet.getColumnCount();
            for (let i = 1; i < startRow; i++) {
                const element = data.getValue(startRow, startColumn - i);
                if (!element) {
                    columnStart = startRow - i + 1;
                    break;
                }
            }
            const cj = 0;
            while (cj < colMax - startColumn) {
                const element = data.getValue(startRow, startColumn + cj);
                if (!element) {
                    columnEnd = startRow - cj - 1;
                    break;
                }
            }

            numColumns = columnStart - columnEnd;
            numColumns = rowStart - rowEnd;
            numRows = startRow;
            return this._worksheet.getRange(rowStart, columnStart, numRows, numColumns);
        }
        return this;
    }

    /**
     * Whether the current range and the incoming range have an intersection
     *
     * @param range the incoming range
     * @returns Intersect or not
     */
    isIntersection(range: Range): boolean {
        const currentStartRow = this._range.startRow;
        const currentEndRow = this._range.endRow;
        const currentStartColumn = this._range.startColumn;
        const currentEndColumn = this._range.endColumn;

        const incomingStartRow = range.getRangeData().startRow;
        const incomingEndRow = range.getRangeData().endRow;
        const incomingStartColumn = range.getRangeData().startColumn;
        const incomingEndColumn = range.getRangeData().endColumn;

        const zx = Math.abs(currentStartColumn + currentEndColumn - incomingStartColumn - incomingEndColumn);
        const x = Math.abs(currentStartColumn - currentEndColumn) + Math.abs(incomingStartColumn - incomingEndColumn);
        const zy = Math.abs(currentStartRow + currentEndRow - incomingStartRow - incomingEndRow);
        const y = Math.abs(currentStartRow - currentEndRow) + Math.abs(incomingStartRow - incomingEndRow);
        if (zx <= x && zy <= y) {
            return true;
        }
        return false;
    }

    /**
     * get row matrix
     * @returns
     */
    getRowMatrix(index: number) {
        const { startColumn, endColumn } = this._range;

        const sheetMatrix = this._worksheet.getCellMatrix();
        const rangeMatrix = new ObjectMatrix<ICellData>();

        for (let r = index; r <= index; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                rangeMatrix.setValue(r, c, sheetMatrix.getValue(r, c) || {});
            }
        }

        return rangeMatrix;
    }

    /**
     * get column matrix
     * @returns
     */
    getColumnMatrix(index: number) {
        const { startRow, endRow } = this._range;

        const sheetMatrix = this._worksheet.getCellMatrix();
        const rangeMatrix = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = index; c <= index; c++) {
                rangeMatrix.setValue(r, c, sheetMatrix.getValue(r, c) || {});
            }
        }

        return rangeMatrix;
    }

    forEach(action: (row: number, column: number) => void): void {
        Range.foreach(this._range, action);
    }

    /**
     * Determine whether a range is legal
     */
    isValid(): boolean {
        if (Object.values(this._range).includes(-1)) {
            return false;
        }
        return true;
    }

    // FIXME@wzhudev: 内部调用这个 API 的时候需要先

    /**
     *
     * @param arg Shorthand for the style that gets
     * @returns style value
     */
    private _getStyles(arg: keyof IStyleData): Array<Array<IStyleData[keyof IStyleData]>> {
        const styles = this._deps.getStyles();
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const style = styles && styles.getStyleByCell(cell);
                return (style && style[arg]) || DEFAULT_STYLES[arg];
            })
        );
    }
}
