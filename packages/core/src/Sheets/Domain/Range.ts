import { SheetContext } from '../../Basics';

import {
    IInsertRangeActionData,
    IClearRangeActionData,
    IAddMergeActionData,
    IRemoveMergeActionData,
    IDeleteRangeActionData,
    ISetRangeDataActionData,
    ISetRangeStyleActionData,
    ISetRangeFormattedValueActionData,
    SetRangeStyleAction,
} from '../Action';

import {
    CommandManager,
    ISheetActionData,
    Command,
    ActionOperationType,
} from '../../Command';

import { DEFAULT_RANGE, DEFAULT_STYLES, ACTION_NAMES } from '../../Const';

import {
    AutoFillSeries,
    BooleanNumber,
    BorderStyleTypes,
    BorderType,
    Dimension,
    Direction,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    TextDirection,
    VerticalAlign,
    WrapStrategy,
    CopyPasteType,
} from '../../Enum';

import {
    IBorderData,
    IBorderStyleData,
    ICellData,
    ICellDataMatrix,
    ICellV,
    IDocumentData,
    IOptionData,
    IRangeData,
    IRangeType,
    IStyleData,
    ITextDecoration,
} from '../../Interfaces';

import {
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
    Tuples,
} from '../../Shared';

import { DropCell } from '../../Shared/DropCell';
import { Worksheet } from './Worksheet';

// type FromProps<T> = T extends ISty
export type PropsFrom<T> = T extends Nullable<infer Props> ? Props : T;

/**
 * getObjectValues options type
 */
type IValueOptionsType = {
    /**
     * set whether to include style
     */
    isIncludeStyle?: boolean;
};

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
    private _commandManager: CommandManager;

    private _context: SheetContext;

    private _rangeData: IRangeData;

    private _worksheet: Worksheet;

    constructor(workSheet: Worksheet, range: IRangeType) {
        this._context = workSheet.getContext();
        this._commandManager = this._context.getCommandManager();

        // Convert the range passed in by the user into a standard format
        // this._rangeData = new TransformTool(
        //     this._context.getWorkBook()
        // ).transformRangeType(range);
        this._rangeData = this._context
            .getWorkBook()
            .transformRangeType(range).rangeData;
        this._worksheet = workSheet;

        // The user entered an invalid range
        if (Object.values(this._rangeData).includes(-1)) {
            console.error('Invalid range,default set index -1');
        }
    }

    static foreach(
        rangeData: IRangeData,
        action: (row: number, column: number) => void
    ): void {
        const { startRow, startColumn, endRow, endColumn } = rangeData;
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
    getRangeData(): IRangeData {
        return this._rangeData;
    }

    /**
     * Returns the value of the top-left cell in the range. The value may be of type Number, Boolean, Date, or String depending on the value of the cell. Empty cells return an empty string.
     * @returns  The value in this cell
     */
    getValue(): Nullable<ICellData> {
        return this.getValues()[0][0];
    }

    /**
     * Returns the rectangular grid of values for this range.
     *
     * Returns a two-dimensional array of values, indexed by row, then by column. The values may be of type Number, Boolean, Date, or String, depending on the value of the cell. Empty cells are represented by an empty string in the array. Remember that while a range index starts at 0, 0, same as the JavaScript array is indexed from [0][0].
     *
     * In web apps, a Date value isn't a legal parameter. getValues() fails to return data to a web app if the range contains a cell with a Date value. Instead, transform all the values retrieved from the sheet to a supported JavaScript primitive like a Number, Boolean, or String.
     *
     * @returns  A two-dimensional array of values.
     */
    getValues(): Array<Array<Nullable<ICellData>>> {
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
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
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

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
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const sheetMatrix = this._worksheet.getCellMatrix();
        const rangeMatrix = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                rangeMatrix.setValue(
                    r - startRow,
                    c - startColumn,
                    sheetMatrix.getValue(r, c) || {}
                );
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
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
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
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const styles = this._context.getWorkBook().getStyles();
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
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const cell = {
            startRow: startRow + row,
            endRow: startRow + row,
            startColumn: startColumn + column,
            endColumn: startColumn + column,
        };

        return new Range(this._worksheet, cell);
    }

    /**
     * Returns the starting column position for this range
     *
     * @returns  — The range's starting column position in the spreadsheet.
     */
    getColumn(): number {
        return this._rangeData.startColumn;
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
    getObjectValues(
        options: IValueOptionsType = {}
    ): ObjectMatrixPrimitiveType<ICellData> {
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // get object values from sheet matrix, or use this.getMatrix() create a new matrix then this.getMatrix().getData()
        const values = this._worksheet
            .getCellMatrix()
            .getFragments(startRow, endRow, startColumn, endColumn)
            .getData();

        if (options.isIncludeStyle) {
            const style = this._context.getWorkBook().getStyles();
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
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const styles = this._context.getWorkBook().getStyles();
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
        const { _rangeData, _worksheet } = this;
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
        return this._rangeData.endColumn;
    }

    /**
     * 	Returns the end row position.
     */
    getLastRow(): number {
        return this._rangeData.endRow;
    }

    /**
     * Returns an array of Range objects representing merged cells that either are fully within the current range, or contain at least one cell in the current range.
     */
    getMergedRanges(): Range[] {
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        return this._worksheet
            .getMerges()
            .getMergedRanges({ startRow, endRow, startColumn, endColumn })
            .map((rangeData) => new Range(this._worksheet, rangeData));
    }

    /**
     * Starting at the cell in the first column and row of the range, returns the next cell in the given direction that is the edge of a contiguous range of cells with data in them or the cell at the edge of the spreadsheet in that direction.
     * @param direction
     * @returns The data region edge cell or the cell at the edge of the spreadsheet.
     */
    getNextDataCell(direction: Direction): Range {
        const { _worksheet } = this;
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const maxRow = _worksheet.getMaxRows();
        const maxColumn = _worksheet.getMaxColumns();
        if (direction === Direction.BOTTOM) {
            for (let i = 0; i < maxRow - startColumn; i++) {
                const value = this._worksheet
                    .getCellMatrix()
                    .getValue(startRow + i, startColumn);
                if (value)
                    _worksheet.getRange(
                        startRow + i,
                        startColumn,
                        startRow + i,
                        startColumn
                    );
            }
            return _worksheet.getRange(maxRow, startColumn, maxRow, startColumn);
        }
        if (direction === Direction.TOP) {
            for (let i = 0; i < startRow; i++) {
                const value = this._worksheet
                    .getCellMatrix()
                    .getValue(startRow - i, startColumn);
                if (value)
                    _worksheet.getRange(
                        startRow - i,
                        startColumn,
                        startRow - i,
                        startRow
                    );
            }
            return _worksheet.getRange(0, startColumn, 0, startColumn);
        }
        if (direction === Direction.RIGHT) {
            for (let i = 0; i < maxColumn - startColumn; i++) {
                const value = this._worksheet
                    .getCellMatrix()
                    .getValue(startRow, startColumn + i);
                if (value)
                    _worksheet.getRange(
                        startRow,
                        startColumn + i,
                        startRow,
                        startColumn + i
                    );
            }
            return _worksheet.getRange(startRow, maxColumn, startRow, maxColumn);
        }
        if (direction === Direction.LEFT) {
            for (let i = 0; i < maxRow - startColumn; i++) {
                const value = this._worksheet
                    .getCellMatrix()
                    .getValue(startRow, startColumn - i);
                if (value)
                    _worksheet.getRange(
                        startRow,
                        startColumn - i,
                        startRow,
                        startColumn - i
                    );
            }
            return _worksheet.getRange(startRow, 0, startRow, 0);
        }
        return _worksheet.getRange(DEFAULT_RANGE);
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
        const { startColumn, endColumn } = this._rangeData;
        return endColumn - startColumn + 1;
    }

    /**
     * Returns the number of rows in this range.
     */
    getNumRows(): number {
        const { startRow, endRow } = this._rangeData;
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
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => cell?.p || '')
        );
    }

    /**
     * Returns the row position for this range.
     */
    getRowIndex(): number {
        return this._rangeData.startRow;
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
    getTextRotation() {
        return this.getTextRotations()[0][0];
    }

    /**
     * Returns the text rotation settings for the cells in the range.
     */
    // getTextRotations(): number[][] {
    getTextRotations() {
        return this._getStyles('tr');
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
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const styles = this._context.getWorkBook().getStyles();
                return styles.getStyleByCell(cell);
            })
        );
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
        const { _rangeData, _worksheet } = this;
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

    // isChecked() {}
    // isEndColumnBounded() {}
    // isEndRowBounded() {}

    /**
     * Returns true if the cells in the current range overlap any merged cells.
     */
    isPartOfMerge(): boolean {
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const data = this._worksheet
            .getMerges()
            .getByRowColumn(startRow, endRow, startColumn, endColumn);
        if (data) {
            return true;
        }

        return false;
    }

    /**
     * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
     *
     * @param color Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
     * @returns This range, for chaining.
     */
    setBackground(color: string): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array

        const colorObj: IStyleData = {
            bg: {
                rgb: color,
            },
        };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            colorObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets a rectangular grid of background colors (must match dimensions of this range). The colors are in CSS notation (such as '#ffffff' or 'white').
     *
     * @param color A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
     * @returns This range, for chaining.
     */
    setBackgrounds(color: string[][]): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const matrix = new ObjectMatrix<IStyleData>();
        for (let r = 0; r < endRow - startRow + 1; r++) {
            for (let c = 0; c < endColumn - startColumn + 1; c++) {
                matrix.setValue(r, c, {
                    bg: {
                        rgb: color[r][c],
                    },
                });
            }
        }
        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: matrix.getData(),
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the background to the given color using RGB values (integers between 0 and 255 inclusive).
     *
     * @param red  	The red value in RGB notation.
     * @param green  The green value in RGB notation.
     * @param blue  The blue value in RGB notation.
     * @returns This range, for chaining.
     */
    setBackgroundRGB(red: number, green: number, blue: number): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const rgbString = `RGB(${red},${green},${blue})`;

        const colorObj: IStyleData = {
            bg: {
                rgb: rgbString,
            },
        };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            colorObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets a rectangular grid of font colors (must match dimensions of this range). The colors are in CSS notation (such as '#ffffff' or 'white').
     *
     * @param colors  A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
     * @returns This range, for chaining.
     */
    setFontColors(colors: string[][]): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const matrix = new ObjectMatrix<IStyleData>();
        for (let r = 0; r < endRow - startRow + 1; r++) {
            for (let c = 0; c < endColumn - startColumn + 1; c++) {
                matrix.setValue(r, c, { cl: { rgb: colors[r][c] } });
            }
        }
        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: matrix.getData(),
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets a rectangular grid of font families (must match dimensions of this range). Examples of font families are "Arial" or "Helvetica".
     *
     * @param fontFamilies  A two-dimensional array of font families; null values reset the font family.
     * @returns This range, for chaining.
     */
    setFontFamilies(fontFamilies: string[][]): Range {
        this._setStyles(fontFamilies, 'ff');
        return this;
    }

    /**
     * Sets the font line style of the given range
     *
     * @param fontLine  The font line style; a null value resets the font line style
     * @returns This range, for chaining.
     */
    setUnderline(fontLine: Nullable<ITextDecoration>): Range {
        this._setStyle(fontLine, 'ul');
        return this;
    }

    /**
     * Sets the font line style of the given range
     *
     * @param fontLine  The font line style; a null value resets the font line style
     * @returns This range, for chaining.
     */
    setOverline(fontLine: Nullable<ITextDecoration>): Range {
        this._setStyle(fontLine, 'ol');
        return this;
    }

    /**
     * Sets a rectangular grid of line styles (must match dimensions of this range).
     *
     * @param fontLine  The font line style; a null value resets the font line style
     * @returns This range, for chaining.
     */
    setStrikeThrough(fontLine: Nullable<ITextDecoration>): Range {
        this._setStyle(fontLine, 'st');
        return this;
    }

    /**
     * Sets the font line style of the given range
     *
     * @param fontLines  A two-dimensional array of font line styles ; null values reset the font line style.
     * @returns This range, for chaining.
     */
    setUnderlines(fontLines: Array<Array<Nullable<ITextDecoration>>>): Range {
        this._setStyles(fontLines, 'ul');
        return this;
    }

    /**
     * Sets the font line style of the given range
     *
     * @param fontLines  A two-dimensional array of font line styles ; null values reset the font line style.
     * @returns This range, for chaining.
     */
    setOverlines(fontLines: Array<Array<Nullable<ITextDecoration>>>): Range {
        this._setStyles(fontLines, 'ol');
        return this;
    }

    /**
     * Sets the font line style of the given range
     *
     * @param fontLines  A two-dimensional array of font line styles ; null values reset the font line style.
     * @returns This range, for chaining.
     */
    setStrikeThroughs(fontLines: Array<Array<Nullable<ITextDecoration>>>): Range {
        this._setStyles(fontLines, 'st');
        return this;
    }

    /**
     * Sets a rectangular grid of font sizes (must match dimensions of this range).
     *
     * @param sizes  A two-dimensional array of sizes.
     * @returns This range, for chaining.
     */
    setFontSizes(sizes: number[][]): Range {
        this._setStyles(sizes, 'fs');
        return this;
    }

    /**
     * Set the font style for the given range ('italic' or 'normal').
     *
     * @param fontStyle  The font style, either 'italic' or 'normal'; a null value resets the font style.
     * @returns This range, for chaining.
     */
    setFontStyle(fontStyle: Nullable<FontItalic>): Range {
        this._setStyle(fontStyle, 'it');
        return this;
    }

    /**
     * Sets a rectangular grid of font styles (must match dimensions of this range).
     *
     * @param fontStyles A two-dimensional array of font styles, either 'italic' or 'normal'; null values reset the font style.
     * @returns This range, for chaining.
     */
    setFontStyles(fontStyles: Array<Array<Nullable<FontItalic>>>): Range {
        this._setStyles(fontStyles, 'it');
        return this;
    }

    /**
     * Set the font weight for the given range (normal/bold).
     *
     * @param fontWeight   The font weight, either 'bold' or 'normal'; a null value resets the font weight.
     * @returns This range, for chaining.
     */
    setFontWeight(fontWeight: Nullable<FontWeight>): Range {
        this._setStyle(fontWeight, 'bl');
        return this;
    }

    /**
     * Sets a rectangular grid of font weights (must match dimensions of this range).
     *
     * @param fontWeights  A two-dimensional array of font weights, either 'bold' or 'normal'; null values reset the font weight.
     * @returns This range, for chaining.
     */
    setFontWeights(fontWeights: Array<Array<Nullable<FontWeight>>>): Range {
        this._setStyles(fontWeights, 'bl');
        return this;
    }

    /**
     * Sets a rectangular grid of horizontal alignments.
     *
     * @param alignments  A two-dimensional array of alignments, either 'left', 'center' or 'normal'; a null value resets the alignment.
     * @returns This range, for chaining.
     */
    setHorizontalAlignments(
        alignments: Array<Array<Nullable<HorizontalAlign>>>
    ): Range {
        this._setStyles(alignments, 'ht');
        return this;
    }

    /**
     * Sets the note to the given value.
     *
     * @param note The note value to set for the range; a null value removes the note.
     * @returns This range, for chaining.
     */
    // setNote(note: string): Range {
    //     const { _rangeData, _context, _commandManager, _worksheet } = this;
    //     const { startRow, startColumn, endRow, endColumn } = _rangeData;
    //     const cellValue = new ObjectMatrix<string>();
    //     for (let r = startRow; r <= endRow; r++) {
    //         for (let c = startColumn; c <= endColumn; c++) {
    //             cellValue.setValue(r, c, note);
    //         }
    //     }
    //     const setValue: ISetRangeNoteActionData = {
    //         sheetId: _worksheet.getSheetId(),
    //         actionName: ACTION_NAMES.SET_RANGE_NOTE_ACTION,
    //         cellNote: cellValue.getData(),
    //         rangeData: this._rangeData,
    //     };
    //     const command = new Command(_context.getWorkBook(), setValue);
    //     _commandManager.invoke(command);

    //     return this;
    // }

    /**
     * Sets the note to the given value.
     *
     * @param notes A two-dimensional array of notes; null values remove the note.
     * @returns This range, for chaining.
     */
    // setNotes(notes: string[][]): Range {
    //     const { _rangeData, _context, _commandManager, _worksheet } = this;

    //     const { startRow, startColumn, endRow, endColumn } = _rangeData;

    //     const cellValue = new ObjectMatrix<string>();
    //     for (let r = 0; r <= endRow - startRow; r++) {
    //         for (let c = 0; c <= endColumn - startColumn; c++) {
    //             cellValue.setValue(r + startRow, c + startColumn, notes[r][c]);
    //         }
    //     }

    //     const setValue: ISetRangeNoteActionData = {
    //         sheetId: _worksheet.getSheetId(),
    //         actionName: ACTION_NAMES.SET_RANGE_NOTE_ACTION,
    //         cellNote: cellValue.getData(),
    //         rangeData: this._rangeData,
    //     };
    //     const command = new Command(_context.getWorkBook(), setValue);
    //     _commandManager.invoke(command);

    //     return this;
    // }

    /**
     * Sets the number or date format to the given formatting string.
     *
     * @param numberFormat 	A number format string.
     * @returns This range, for chaining.
     */
    // setNumberFormat(numberFormat: string): Range {
    //     const { _rangeData, _context, _commandManager, _worksheet } = this;

    //     const { startRow, startColumn, endRow, endColumn } = _rangeData;

    //     const cellValue = new ObjectMatrix<string>();
    //     for (let r = 0; r <= endRow - startRow; r++) {
    //         for (let c = 0; c <= endColumn - startColumn; c++) {
    //             const fm = {
    //                 f: numberFormat,
    //                 t: FormatType.NUMBER,
    //             };
    //             cellValue.setValue(r + startRow, c + startColumn, JSON.stringify(fm));
    //         }
    //     }

    //     const setValue: ISetRangeFormatActionData = {
    //         sheetId: _worksheet.getSheetId(),
    //         actionName: ACTION_NAMES.SET_RANGE_FORMAT_ACTION,
    //         cellFormat: cellValue.getData(),
    //         rangeData: this._rangeData,
    //     };
    //     const command = new Command(_context.getWorkBook(), setValue);
    //     _commandManager.invoke(command);

    //     return this;
    // }

    /**
     * Sets a rectangular grid of number or date formats (must match dimensions of this range).
     *
     * @param numberFormats A two-dimensional array of number formats.
     * @returns This range, for chaining.
     */
    // setNumberFormats(numberFormats: string[][]): Range {
    //     const { _rangeData, _context, _commandManager, _worksheet } = this;

    //     const { startRow, startColumn, endRow, endColumn } = _rangeData;

    //     const cellValue = new ObjectMatrix<string>();
    //     for (let r = 0; r <= endRow - startRow; r++) {
    //         for (let c = 0; c <= endColumn - startColumn; c++) {
    //             const fm = {
    //                 f: numberFormats[r][c],
    //                 t: FormatType.NUMBER,
    //             };
    //             cellValue.setValue(r + startRow, c + startColumn, JSON.stringify(fm));
    //         }
    //     }

    //     const setValue: ISetRangeFormatActionData = {
    //         sheetId: _worksheet.getSheetId(),
    //         actionName: ACTION_NAMES.SET_RANGE_FORMAT_ACTION,
    //         cellFormat: cellValue.getData(),
    //         rangeData: this._rangeData,
    //     };
    //     const command = new Command(_context.getWorkBook(), setValue);
    //     _commandManager.invoke(command);

    //     return this;
    // }

    // setRichTextValue(value) {}
    // setRichTextValues(values) {}
    // setShowHyperlink(showHyperlink) {}

    /**
     * Sets a rectangular grid of text directions.
     *
     * @param directions The desired text directions; if a specified direction is null it is inferred before setting.
     * @returns This range, for chaining.
     */
    setTextDirections(directions: number[][]): Range {
        this._setStyles(directions, 'td');
        return this;
    }

    /**
     * Sets the text rotation settings for the cells in the range.
     *
     * @param degrees The desired angle between the standard orientation and the desired orientation. For left to right text, positive angles are in the counterclockwise direction.
     * @returns This range, for chaining.
     */
    setTextRotation(degrees: Nullable<number>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const styleObj: IStyleData = {
            tr: {
                v: 0,
                a: Number(degrees),
            },
        };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            styleObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets a rectangular grid of text rotations.
     *
     * @param rotations The desired text rotation settings.
     * @returns This range, for chaining.
     */
    setTextRotations(rotations: number[][]): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const matrix = new ObjectMatrix<IStyleData>();
        for (let r = 0; r < endRow - startRow + 1; r++) {
            for (let c = 0; c < endColumn - startColumn + 1; c++) {
                matrix.setValue(r, c, {
                    tr: {
                        v: 0,
                        a: rotations[r][c]!,
                    },
                });
            }
        }
        const a = matrix.getData();
        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: matrix.getData(),
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the text style for the cells in the range.
     *
     * @param style The desired text style.
     * @returns This range, for chaining.
     */
    setTextStyle(style: Nullable<IStyleData>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const stylesObj = { ...style };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            stylesObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets a rectangular grid of text styles.
     *
     * @param styles The desired text styles.
     * @returns This range, for chaining.
     */
    setTextStyles(styles: Array<Array<Nullable<IStyleData>>>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const matrix = new ObjectMatrix<IStyleData>();
        for (let r = 0; r < endRow - startRow + 1; r++) {
            for (let c = 0; c < endColumn - startColumn + 1; c++) {
                matrix.setValue(r, c, { ...styles[r][c] });
            }
        }
        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: matrix.getData(),
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets a rectangular grid of vertical alignments (must match dimensions of this range).
     *
     * @param alignments A two-dimensional array of alignments, either 'top', 'middle' or 'bottom'; a null value resets the alignment.
     * @returns This range, for chaining.
     */
    setVerticalAlignments(alignments: Array<Array<Nullable<VerticalAlign>>>): Range {
        this._setStyles(alignments, 'vt');
        return this;
    }

    /**
     * 	Sets whether or not to stack the text for the cells in the range.
     * @param isVertical Whether or not to stack the text.
     * @returns
     */
    setVerticalText(isVertical: BooleanNumber): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const styleObj = {
            tr: {
                v: isVertical,
                a: 90,
            },
        };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            styleObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Set the cell wrap of the given range
     *
     * @param isWrapEnabled Whether to wrap text or not.
     * @returns This range, for chaining.
     */
    setWrap(isWrapEnabled: BooleanNumber): Range {
        this._setStyle(isWrapEnabled, 'tb');
        return this;
    }

    /**
     * 	Sets a rectangular grid of wrap strategies.
     *
     * @param strategies The desired wrapping strategies.
     * @returns This range, for chaining.
     */
    setWrapStrategies(strategies: Array<Array<Nullable<WrapStrategy>>>): Range {
        this._setStyles(strategies, 'tb');
        return this;
    }

    /**
     * 	Sets a rectangular grid of word wrap policies (must match dimensions of this range).
     *
     * @param isWrapEnabled A two-dimensional array of wrap variables that determine whether to wrap text in a cell or not.
     * @returns This range, for chaining.
     */
    setWraps(isWrapEnabled: BooleanNumber[][]): Range {
        this._setStyles(isWrapEnabled, 'tb');
        return this;
    }

    /**
     * Fills the destinationRange with data based on the data in this range. The new values are also determined by the specified series type. The destination range must contain this range and extend it in only one direction. For example, the following fills A1:A20 with a series of increasing numbers based on the current values in A1:A4:
     *
     * @param destination The range to be auto-filled with values. The destination range should contain this range and extend it in only one direction (upwards, downwards, left, or right).
     * @param series The type of autoFill series that should be used to calculate new values. The effect of this series differs based on the type and amount of source data.
     * @returns This range, for chaining.
     */
    autoFill(destination: Range, series: AutoFillSeries): Range {
        const { _worksheet, _context, _commandManager } = this;
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const {
            startRow: Dsr,
            endRow: Der,
            startColumn: Dsc,
            endColumn: Dec,
        } = destination._rangeData;
        let direction = Direction.BOTTOM;
        let csLen: number = 0;
        let asLen: number = 0;

        // 复制范围
        const copy_str_r = startRow;
        const copy_end_r = endRow;
        const copy_str_c = startColumn;
        const copy_end_c = endColumn;

        // 应用范围
        const apply_str_r = Dsr;
        const apply_end_r = Der;
        const apply_str_c = Dsc;
        const apply_end_c = Dec;

        const matrix = new ObjectMatrix<ICellData>();

        if (apply_str_c === copy_str_c && apply_end_c === copy_end_c) {
            if (apply_end_r > copy_end_r) {
                direction = Direction.BOTTOM;
            } else {
                direction = Direction.TOP;
            }
        } else if (apply_end_c > copy_end_c) {
            direction = Direction.RIGHT;
        } else {
            direction = Direction.LEFT;
        }

        if (direction === Direction.BOTTOM || direction === Direction.TOP) {
            // 列
            csLen = copy_end_r - copy_str_r + 1;
            asLen = apply_end_r - apply_str_r + 1;

            for (let i = 0; i <= endColumn - startColumn; i++) {
                const sourceRange = this.getColumnMatrix(i).toArray();

                const copydata = DropCell.getCopyData(
                    sourceRange,
                    copy_str_r,
                    copy_end_r,
                    copy_str_c,
                    copy_end_c,
                    direction
                );
                copydata.forEach((item) => {
                    const data = DropCell.getApplyData(
                        item,
                        csLen,
                        asLen,
                        series,
                        direction
                    );
                    data.forEach((dataItem, j) => {
                        matrix.setValue(j, i, dataItem);
                    });
                });
            }
        } else if (direction === Direction.RIGHT || direction === Direction.LEFT) {
            asLen = apply_end_c - apply_str_c;
            csLen = copy_end_c - copy_str_c;
            // 行
            for (let i = 0; i <= endRow - startRow; i++) {
                const sourceRange = this.getRowMatrix(i).toArray();

                const copydata = DropCell.getCopyData(
                    sourceRange,
                    copy_str_r,
                    copy_end_r,
                    copy_str_c,
                    copy_end_c,
                    direction
                );
                copydata.forEach((item) => {
                    const data = DropCell.getApplyData(
                        item,
                        csLen,
                        asLen,
                        series,
                        direction
                    );
                });
            }
        }

        const setValue: ISetRangeDataActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue: matrix.getData(),
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);
        return this;
    }

    // TODO
    // autoFillToNeighbor(series: AutoFillSeries) {}

    /**
     * Returns a copy of the range expanded in the four cardinal Directions to cover all adjacent cells with data in them.
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
    getDataRegion(...argument: any): Range {
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
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
                return this._worksheet.getRange(
                    startRow,
                    start,
                    numRows,
                    numColumns
                );
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
                return this._worksheet.getRange(
                    start,
                    startColumn,
                    numRows,
                    numColumns
                );
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
            return this._worksheet.getRange(
                rowStart,
                columnStart,
                numRows,
                numColumns
            );
        }
        return this;
    }

    /**
     * Trims the whitespace (such as spaces, tabs, or new lines) in every cell in this range. Removes all whitespace from the start and end of each cell's text, and reduces any subsequence of remaining whitespace characters to a single space.
     *
     * @returns This range, for chaining.
     */
    trimWhitespace(): Range {
        const { _context, _worksheet, _commandManager } = this;
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const sheetMatrix = this._worksheet.getCellMatrix();
        const regx = /\s+/g;

        const cellValue = new ObjectMatrix<ICellV>();
        for (let r = 0; r <= endRow - startRow; r++) {
            for (let c = 0; c <= endColumn - startColumn; c++) {
                const value = sheetMatrix.getValue(r, c)!.m?.replace(regx, '');
                cellValue.setValue(r + startRow, c + startColumn, value || '');
            }
        }

        const setValue: ISetRangeFormattedValueActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
            cellValue: cellValue.getData(),
            rangeData: this._rangeData,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);

        return this;
    }
    // uncheck

    /**
     * Sets the specified range as the active range, with the top left cell in the range as the current cell.
     *
     * @returns This range, for chaining.
     * @internal
     */
    activate(): Range {
        // const { _context, _commandManager } = this;
        // The user entered an invalid range
        if (this._rangeData?.startRow === -1) {
            console.error('Invalid range,default set startRow -1');
            return this;
        }

        this._worksheet.getSelection().setSelection({ selection: this });

        // This range, for chaining
        return this;
    }

    /**
     * Sets the specified cell as the current cell.
     *
     * If the specified cell is present in an existing range, then that range becomes the active range with the cell as the current cell.
     *
     * If the specified cell is not present in any existing range, then the existing selection is removed and the cell becomes the current cell and the active range.
     *
     * Note: The specified Range must consist of one cell, otherwise it throws an exception.
     *
     * @returns This range, for chaining.
     */
    activateAsCurrentCell(): Range {
        this._worksheet.getSelection().setCurrentCell(this);
        return this;
    }

    /**
     * Whether the current range and the incoming range have an intersection
     *
     * @param range the incoming range
     * @returns Intersect or not
     */
    isIntersection(range: Range): boolean {
        const currentStartRow = this._rangeData.startRow;
        const currentEndRow = this._rangeData.endRow;
        const currentStartColumn = this._rangeData.startColumn;
        const currentEndColumn = this._rangeData.endColumn;

        const incomingStartRow = range.getRangeData().startRow;
        const incomingEndRow = range.getRangeData().endRow;
        const incomingStartColumn = range.getRangeData().startColumn;
        const incomingEndColumn = range.getRangeData().endColumn;

        const zx = Math.abs(
            currentStartColumn +
                currentEndColumn -
                incomingStartColumn -
                incomingEndColumn
        );
        const x =
            Math.abs(currentStartColumn - currentEndColumn) +
            Math.abs(incomingStartColumn - incomingEndColumn);
        const zy = Math.abs(
            currentStartRow + currentEndRow - incomingStartRow - incomingEndRow
        );
        const y =
            Math.abs(currentStartRow - currentEndRow) +
            Math.abs(incomingStartRow - incomingEndRow);
        if (zx <= x && zy <= y) {
            return true;
        }
        return false;
    }

    /**
     * Sets the font color in CSS notation (such as '#ffffff' or 'white').
     *
     * @param color The font color in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
     * @returns
     */
    setFontColor(color: string): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array

        const colorObj: IStyleData = {
            cl: {
                rgb: color,
            },
        };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            colorObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Copies the data from a range of cells to another range of cells. Both the values and formatting are copied.
     *
     * @param destination A destination range to copy to; only the top-left cell position is relevant.
     */
    copyTo(destination: Range): void;

    /**
     * Copies the data from a range of cells to another range of cells..
     *
     * @param destination A destination range to copy to; only the top-left cell position is relevant.
     * @param copyPasteType A type that specifies how the range contents are pasted to the destination.
     * @param transposed Whether the range should be pasted in its transposed orientation.
     */
    copyTo(
        destination: Range,
        copyPasteType: CopyPasteType,
        transposed: boolean
    ): void;

    /**
     * Copies the data from a range of cells to another range of cells. By default both the values and formatting are copied, but this can be overridden using advanced arguments.
     *
     * @param destination A destination range to copy to; only the top-left cell position is relevant.
     * @param options A JavaScript object that specifies advanced parameters, as listed below.
     */
    copyTo(destination: Range, options: IOptionData): void;
    copyTo(...argument: any): void {
        const { _context, _worksheet, _commandManager } = this;
        const destination = argument[0];
        const [value, range] = this._handleCopyRange(this, destination);
        const { startRow, startColumn, endRow, endColumn } = range;

        if (Tuples.checkup(argument, Range, Tuples.BOOLEAN_TYPE)) {
            const copyPasteType = argument[1];
            const transposed = argument[2];

            if (copyPasteType === CopyPasteType.PASTE_NORMAL) {
                const cellValue = new ObjectMatrix<ICellData>();
                value.forEach((row, r) =>
                    row.forEach((cell, c) => {
                        cell = cell as ICellData;
                        cellValue.setValue(
                            r + startRow,
                            c + startColumn,
                            cell || {}
                        );
                    })
                );

                const setValue: ISetRangeDataActionData = {
                    sheetId: _worksheet.getSheetId(),
                    actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                    cellValue: cellValue.getData(),
                };
                const command = new Command(
                    {
                        WorkBookUnit: _context.getWorkBook(),
                    },
                    setValue
                );
                _commandManager.invoke(command);
            } else if (copyPasteType === CopyPasteType.PASTE_FORMAT) {
                const styles = _context.getWorkBook().getStyles();

                const stylesMatrix = new ObjectMatrix<IStyleData>();
                const stylesArray = value.map((row, r) =>
                    row.forEach((cell, c) => {
                        cell = cell as ICellData;
                        stylesMatrix.setValue(
                            r,
                            c,
                            styles.getStyleByCell(cell) || {}
                        );
                    })
                );

                // Organize the style format of the current range into the format of the destination range
                const setStyle: ISetRangeStyleActionData = {
                    sheetId: _worksheet.getSheetId(),
                    actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                    value: stylesMatrix.getData(),
                    rangeData: range,
                };
                const command = new Command(
                    {
                        WorkBookUnit: _context.getWorkBook(),
                    },
                    setStyle
                );
                _commandManager.invoke(command);
            } else if (copyPasteType === CopyPasteType.PASTE_VALUES) {
                const cellValue = new ObjectMatrix<ICellV>();
                value.forEach((row, r) =>
                    row.forEach((cell, c) => {
                        cell = cell as ICellData;
                        cellValue.setValue(
                            r + startRow,
                            c + startColumn,
                            cell?.v || ''
                        );
                    })
                );

                const setValue: ISetRangeFormattedValueActionData = {
                    sheetId: _worksheet.getSheetId(),
                    actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
                    cellValue: cellValue.getData(),
                    rangeData: range,
                };
                const command = new Command(
                    {
                        WorkBookUnit: _context.getWorkBook(),
                    },
                    setValue
                );
                _commandManager.invoke(command);
            } else if (copyPasteType === CopyPasteType.PASTE_COLUMN_WIDTHS) {
                const rangeStartColumn = this._rangeData.startColumn;
                for (let i = 0; i < endColumn - rangeStartColumn; i++) {
                    const width = _worksheet.getColumnWidth(rangeStartColumn + i);
                    _worksheet.setColumnWidth(rangeStartColumn + i, width);
                }
            }
        } else if (Tuples.checkup(argument, Range, Tuples.OBJECT_TYPE)) {
            const options = argument[1];

            const cellValue = new ObjectMatrix<ICellData>();
            value.forEach((row, r) =>
                row.forEach((cell, c) => {
                    cell = cell as ICellData;
                    cellValue.setValue(r + startRow, c + startColumn, cell || {});
                })
            );

            const setValue: ISetRangeDataActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                cellValue: cellValue.getData(),
                options,
            };
            const command = new Command(
                {
                    WorkBookUnit: _context.getWorkBook(),
                },
                setValue
            );
            _commandManager.invoke(command);
        } else if (Tuples.checkup(argument, Range)) {
            const cellValue = new ObjectMatrix<ICellData>();
            value.forEach((row, r) =>
                row.forEach((cell, c) => {
                    cell = cell as ICellData;
                    cellValue.setValue(r + startRow, c + startColumn, cell || {});
                })
            );

            const setValue: ISetRangeDataActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                cellValue: cellValue.getData(),
            };
            const command = new Command(
                {
                    WorkBookUnit: _context.getWorkBook(),
                },
                setValue
            );
            _commandManager.invoke(command);
        }
    }

    /**
     * Copy the formatting of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly. Note that this method copies the formatting only.
     *
     * @param sheetId The unique ID of the sheet within the spreadsheet, irrespective of position.
     * @param startRow  The start row of the target range.
     * @param endRow  The end row of the target range.
     * @param startColumn The first column of the target range.
     * @param endColumn The end column of the target range.
     */
    copyFormatToRange(
        sheetId: string,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number
    ): void;
    /**
     * Copy the formatting of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly. Note that this method copies the formatting only.
     *
     * @param sheet The target sheet.
     * @param startRow  The start row of the target range.
     * @param endRow  The end row of the target range.
     * @param startColumn The first column of the target range.
     * @param endColumn The end column of the target range.
     */
    copyFormatToRange(
        sheet: Worksheet,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number
    ): void;
    copyFormatToRange(...argument: any): void {
        const { _context, _commandManager } = this;

        const startRow = argument[1];
        const endRow = argument[2];
        const startColumn = argument[3];
        const endColumn = argument[4];

        const sheetId = Tools.isAssignableFrom(argument[0], Worksheet)
            ? argument[0].getSheetId()
            : argument[0];

        const [value, range] = this._handleCopyRange(this, {
            startRow,
            endRow,
            startColumn,
            endColumn,
        });

        const styles = _context.getWorkBook().getStyles();

        const stylesMatrix = new ObjectMatrix<IStyleData>();
        value.map((row, r) =>
            row.map((cell, c) => {
                cell = cell as ICellData;
                stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
                return styles.getStyleByCell(cell) || {};
            })
        );

        // Organize the style format of the current range into the format of the destination range
        const setStyle: ISetRangeStyleActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix.getData(),
            rangeData: range,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
    }

    /**
     * Copy the content of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly.For a detailed description of the gridId parameter, see getGridId().
     * @param sheetId The unique ID of the sheet within the spreadsheet, irrespective of position.
     * @param startRow The start row of the target range.
     * @param endRow The end row of the target range.
     * @param startColumn The first column of the target range.
     * @param endColumn The end column of the target range.
     * @returns
     */
    copyValuesToRange(
        sheetId: string,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number
    ): void;
    /**
     * Copy the content of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly.
     * @param sheet The target sheet.
     * @param startRow  The start row of the target range.
     * @param endRow  The end row of the target range.
     * @param startColumn The first column of the target range.
     * @param endColumn The end column of the target range.
     * @returns
     */
    copyValuesToRange(
        sheet: Worksheet,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number
    ): void;
    copyValuesToRange(...argument: any): void {
        const { _context, _commandManager } = this;

        const startRow = argument[1];
        const endRow = argument[2];
        const startColumn = argument[3];
        const endColumn = argument[4];

        const sheetId = Tools.isAssignableFrom(argument[0], Worksheet)
            ? argument[0].getSheetId()
            : argument[0];

        const [value, range] = this._handleCopyRange(this, {
            startRow,
            endRow,
            startColumn,
            endColumn,
        });

        const cellValue = new ObjectMatrix<ICellV>();
        value.forEach((row, r) =>
            row.forEach((cell, c) => {
                cell = cell as ICellData;
                cellValue.setValue(
                    r + range.startRow,
                    c + range.startColumn,
                    cell?.v || ''
                );
            })
        );

        const setValue: ISetRangeFormattedValueActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
            cellValue: cellValue.getData(),
            rangeData: range,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);
    }

    /**
     * Cut and paste (both format and values) from this range to the target range.
     * @param target A target range to copy this range to; only the top-left cell position is relevant.
     * @returns
     */
    moveTo(target: Range): void {
        const { _context, _worksheet, _commandManager, _rangeData } = this;

        // clear current range
        const options = {
            formatOnly: true,
            contentsOnly: true,
            commentsOnly: true,
            validationsOnly: true,
            skipFilteredRows: true,
        };
        const clearValue: IClearRangeActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.CLEAR_RANGE_ACTION,
            options,
            rangeData: _rangeData,
        };

        // get values from this range
        const currentMatrix = this.getMatrix();
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const { startRow: targetStartRow, startColumn: targetStartColumn } =
            target.getRangeData();

        const targetMatrix = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                targetMatrix.setValue(
                    targetStartRow + (r - startRow),
                    targetStartColumn + (c - startColumn),
                    currentMatrix.getValue(r, c) || {}
                );
            }
        }

        const setValue: ISetRangeDataActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue: targetMatrix.getData(),
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            clearValue,
            setValue
        );
        _commandManager.invoke(command);
    }

    /**
     * Returns a new range that is offset from this range by the given number of rows and columns (which can be negative). The new range is the same size as the original range.
     * @param rowOffset The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
     * @param columnOffset 	The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
     * @returns Range — This range, for chaining.
     */
    offset(rowOffset: number, columnOffset: number): Range;

    /**
     * Returns a new range that is relative to the current range, whose upper left point is offset from the current range by the given rows and columns, and with the given height in cells.
     * @param rowOffset The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
     * @param columnOffset The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
     * @param numRows The height in rows of the new range.
     * @returns Range — This range, for chaining.
     */
    offset(rowOffset: number, columnOffset: number, numRows: number): Range;

    /**
     * Returns a new range that is relative to the current range, whose upper left point is offset from the current range by the given rows and columns, and with the given height and width in cells.
     * @param rowOffset The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
     * @param columnOffset The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
     * @param numRows The height in rows of the new range.
     * @param numColumns 	The width in columns of the new range.
     * @returns Range — This range, for chaining.
     */
    offset(
        rowOffset: number,
        columnOffset: number,
        numRows: number,
        numColumns: number
    ): Range;
    offset(...argument: any): Range {
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const rowOffset = argument[0];
        const columnOffset = argument[1];
        const numRows = argument[2];
        const numColumns = argument[3];

        const offset = {
            startRow: startRow + rowOffset,
            endRow: endRow + rowOffset,
            startColumn: startColumn + columnOffset,
            endColumn: endColumn + columnOffset,
        };

        if (Tools.isNumber(numRows)) {
            offset.endRow = offset.startRow + numRows - 1;
        }

        if (Tools.isNumber(numColumns)) {
            offset.endColumn = offset.endColumn + numColumns - 1;
        }

        return new Range(this._worksheet, offset);
    }

    /**
     * Sets the border property with color and/or style. Valid values are true (on), false (off) and null (no change). For color, use Color in CSS notation (such as '#ffffff' or 'white').
     *
     * @param top	true for border, false for none, null for no change.
     * @param left	true for border, false for none, null for no change.
     * @param bottom	true for border, false for none, null for no change.
     * @param right	true for border, false for none, null for no change.
     * @param vertical	true for internal vertical borders, false for none, null for no change.
     * @param horizontal	true for internal horizontal borders, false for none, null for no change.
     * @param color	A color in CSS notation (such as '#ffffff' or 'white'), null for default color (black).
     * @param style	A style for the borders, null for default style (solid).
     * @returns
     */
    setBorder(
        top: Nullable<boolean>,
        left: Nullable<boolean>,
        bottom: Nullable<boolean>,
        right: Nullable<boolean>,
        vertical: Nullable<boolean>,
        horizontal: Nullable<boolean>
    ): Range;
    setBorder(
        top: Nullable<boolean>,
        left: Nullable<boolean>,
        bottom: Nullable<boolean>,
        right: Nullable<boolean>,
        vertical: Nullable<boolean>,
        horizontal: Nullable<boolean>,
        color: string,
        style: BorderStyleTypes
    ): Range;
    setBorder(...argument: any): Range {
        const top = argument[0];
        const left = argument[1];
        const bottom = argument[2];
        const right = argument[3];

        const vertical = argument[4];
        const horizontal = argument[5];

        const color = argument[6] ? argument[6] : 'black';
        const style = argument[7] ? argument[7] : BorderStyleTypes.DASH_DOT;

        const { _context, _worksheet, _commandManager } = this;
        const _workbook = _context.getWorkBook();

        const rangeData = this._rangeData;
        const _sheetId = _worksheet.getSheetId();

        // Cells in the surrounding range may need to clear the border
        const topRangeOut = {
            startRow: rangeData.startRow - 1,
            startColumn: rangeData.startColumn,
            endRow: rangeData.startRow - 1,
            endColumn: rangeData.endColumn,
        };

        const leftRangeOut = {
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn - 1,
            endRow: rangeData.endRow,
            endColumn: rangeData.startColumn - 1,
        };

        const bottomRangeOut = {
            startRow: rangeData.endRow + 1,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow + 1,
            endColumn: rangeData.endColumn,
        };

        const rightRangeOut = {
            startRow: rangeData.startRow,
            startColumn: rangeData.endColumn + 1,
            endRow: rangeData.endRow,
            endColumn: rangeData.endColumn + 1,
        };

        // Cells in the upper, lower, left and right ranges
        const topRange = {
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn,
            endRow: rangeData.startRow,
            endColumn: rangeData.endColumn,
        };

        const leftRange = {
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow,
            endColumn: rangeData.startColumn,
        };

        const bottomRange = {
            startRow: rangeData.endRow,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow,
            endColumn: rangeData.endColumn,
        };

        const rightRange = {
            startRow: rangeData.startRow,
            startColumn: rangeData.endColumn,
            endRow: rangeData.endRow,
            endColumn: rangeData.endColumn,
        };

        const tr = new Range(_worksheet, topRangeOut);
        const lr = new Range(_worksheet, leftRangeOut);
        const br = new Range(_worksheet, bottomRangeOut);
        const rr = new Range(_worksheet, rightRangeOut);
        const t = new Range(_worksheet, topRange);
        const l = new Range(_worksheet, leftRange);
        const b = new Range(_worksheet, bottomRange);
        const r = new Range(_worksheet, rightRange);

        const mtr = new ObjectMatrix<IStyleData>();
        const mlr = new ObjectMatrix<IStyleData>();
        const mbr = new ObjectMatrix<IStyleData>();
        const mrr = new ObjectMatrix<IStyleData>();
        const mcr = new ObjectMatrix<IStyleData>();

        const actions: ISheetActionData[] = [];

        const border: IBorderStyleData = {
            s: style,
            cl: {
                rgb: color,
            },
        };

        if (top === true || top === false) {
            // Probably to the border, there are no surrounding cells
            if (tr.isValid()) {
                // Clear the bottom border of the top range
                tr.forEach((row, column) => {
                    mtr.setValue(row, column, { bd: { b: null } });
                });

                const setBottomData: ISetRangeStyleActionData = {
                    sheetId: _sheetId,
                    actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                    value: mtr.getArrayData(),
                    rangeData: topRangeOut,
                };
                actions.push(setBottomData);
            }

            // first row
            t.forEach((row, column) => {
                // update
                if (top === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { t: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (top === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { t: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        if (bottom === true || bottom === false) {
            // Probably to the border, there are no surrounding cells
            if (br.isValid()) {
                // Clear the top border of the lower range
                br.forEach((row, column) => {
                    mbr.setValue(row, column, { bd: { t: null } });
                });

                const setTopData: ISetRangeStyleActionData = {
                    sheetId: _sheetId,
                    actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                    value: mbr.getArrayData(),
                    rangeData: bottomRangeOut,
                };
                actions.push(setTopData);
            }

            // the last row
            b.forEach((row, column) => {
                // update
                if (bottom === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { b: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (bottom === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { b: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        if (left === true || left === false) {
            // Probably to the border, there are no surrounding cells
            if (lr.isValid()) {
                //  Clear the right border of the left range
                lr.forEach((row, column) => {
                    mlr.setValue(row, column, { bd: { r: null } });
                });

                const setRightData: ISetRangeStyleActionData = {
                    sheetId: _sheetId,
                    actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                    value: mlr.getArrayData(),
                    rangeData: leftRangeOut,
                };
                actions.push(setRightData);
            }

            // first column
            l.forEach((row, column) => {
                // update
                if (left === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { l: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (left === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { l: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        if (right === true || right === false) {
            // Probably to the border, there are no surrounding cells
            if (rr.isValid()) {
                //  Clear the left border of the right range
                rr.forEach((row, column) => {
                    mrr.setValue(row, column, { bd: { l: null } });
                });

                const setLeftData: ISetRangeStyleActionData = {
                    sheetId: _sheetId,
                    actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                    value: mrr.getArrayData(),
                    rangeData: rightRangeOut,
                };
                actions.push(setLeftData);
            }

            // last column
            r.forEach((row, column) => {
                // update
                if (right === true) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { r: Tools.deepClone(border) },
                    });
                    mcr.setValue(row, column, style);
                }
                // delete
                else if (right === false) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { r: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }

        // inner vertical border
        if (vertical === true || vertical === false) {
            // current range
            this.forEach((row, column) => {
                // Set the right border except the last column
                if (column !== rangeData.endColumn) {
                    // update
                    if (vertical === true) {
                        const style = Tools.deepMerge(
                            mcr.getValue(row, column) || {},
                            {
                                bd: { r: Tools.deepClone(border) },
                            }
                        );
                        mcr.setValue(row, column, style);
                    }
                    // delete
                    else if (vertical === false) {
                        const style = Tools.deepMerge(
                            mcr.getValue(row, column) || {},
                            {
                                bd: { r: null },
                            }
                        );
                        mcr.setValue(row, column, style);
                    }
                }

                // Except for the first column, clear the left border
                if (column !== rangeData.startColumn) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { l: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }
        // inner horizontal border
        if (horizontal === true || horizontal === false) {
            // current range
            this.forEach((row, column) => {
                // Except for the last row, set the bottom border
                if (row !== rangeData.endRow) {
                    // update
                    if (horizontal === true) {
                        const style = Tools.deepMerge(
                            mcr.getValue(row, column) || {},
                            {
                                bd: { b: Tools.deepClone(border) },
                            }
                        );
                        mcr.setValue(row, column, style);
                    }
                    // delete
                    else if (horizontal === false) {
                        const style = Tools.deepMerge(
                            mcr.getValue(row, column) || {},
                            {
                                bd: { b: null },
                            }
                        );
                        mcr.setValue(row, column, style);
                    }
                }

                // Except for the first row, clear the top border
                if (row !== rangeData.startRow) {
                    const style = Tools.deepMerge(mcr.getValue(row, column) || {}, {
                        bd: { t: null },
                    });
                    mcr.setValue(row, column, style);
                }
            });
        }

        const setCCData: ISetRangeStyleActionData = {
            sheetId: _sheetId,
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: mcr.getArrayData(),
            rangeData: mcr.getDataRange(),
        };
        actions.push(setCCData);

        const commandCC = new Command(
            {
                WorkBookUnit: _workbook,
            },
            ...actions
        );
        _commandManager.invoke(commandCC);

        return this;
    }

    /**
     * Set Border by tool bar
     * @param type border type
     * @param color color
     * @param style size
     */
    setBorderByType(type: BorderType, color: string, style: BorderStyleTypes) {
        let top = null;
        let left = null;
        let bottom = null;
        let right = null;
        let vertical = null;
        let horizontal = null;

        switch (type) {
            case BorderType.TOP:
                top = true;
                break;
            case BorderType.BOTTOM:
                bottom = true;
                break;
            case BorderType.LEFT:
                left = true;
                break;
            case BorderType.RIGHT:
                right = true;
                break;
            case BorderType.NONE:
                top = false;
                left = false;
                bottom = false;
                right = false;
                vertical = false;
                horizontal = false;
                break;
            case BorderType.ALL:
                top = true;
                left = true;
                bottom = true;
                right = true;
                vertical = true;
                horizontal = true;
                break;
            case BorderType.OUTSIDE:
                top = true;
                left = true;
                bottom = true;
                right = true;
                break;
            case BorderType.INSIDE:
                vertical = true;
                horizontal = true;
                break;
            case BorderType.HORIZONTAL:
                horizontal = true;
                break;
            case BorderType.VERTICAL:
                vertical = true;
                break;

            default:
                break;
        }

        this.setBorder(top, left, bottom, right, vertical, horizontal, color, style);
    }

    /**
     * Sets the font family, such as "Arial" or "Helvetica".
     *
     * @param fontFamily The font family to set; a null value resets the font family.
     * @returns
     */
    setFontFamily(fontFamily: Nullable<string>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const fontFamilyObj: IStyleData = { ff: fontFamily };
        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            fontFamilyObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the font size, with the size being the point size to use.
     *
     * @param size A font size in point size.
     * @returns
     */
    setFontSize(size: number): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const fontSizeObj = { fs: size };
        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            fontSizeObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Set the horizontal (left to right) alignment for the given range (left/center/right).
     *
     * @param alignment The alignment, either 'left', 'center' or 'normal'; a null value resets the alignment.
     * @returns
     */
    setHorizontalAlignment(alignment: Nullable<HorizontalAlign>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const horizontalAlignmentObj = { ht: alignment };
        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            horizontalAlignmentObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
     *
     * @param alignment The alignment, either 'top', 'middle' or 'bottom'; a null value resets the alignment.
     * @returns
     */
    setVerticalAlignment(alignment: Nullable<VerticalAlign>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const verticalAlignmentObj = { vt: alignment };
        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            verticalAlignmentObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
     *
     * @param direction The desired text direction; if null the direction is inferred before setting.
     * @returns
     */
    setTextDirection(direction: Nullable<TextDirection>): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const textDirectionObj: IStyleData = { td: direction };
        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            textDirectionObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the text wrapping strategy for the cells in the range.
     *
     * @param strategy The desired wrapping strategy.
     * @returns
     */
    setWrapStrategy(strategy: WrapStrategy): Range {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const wrapStrategyObj = { tb: strategy };
        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            wrapStrategyObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the value of the range. The value can be numeric, string, boolean or date. If it begins with '=' it is interpreted as a formula.
     * @param value The value for the range.
     * @returns  This range, for chaining.
     */
    setValue(value: ICellV): Range {
        const { _rangeData, _context, _commandManager, _worksheet } = this;
        const { startRow, startColumn, endRow, endColumn } = _rangeData;
        const cellValue = new ObjectMatrix<ICellV>();
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                cellValue.setValue(r, c, value);
            }
        }
        const setValue: ISetRangeFormattedValueActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
            cellValue: cellValue.getData(),
            rangeData: this._rangeData,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Sets a rectangular grid of values (must match dimensions of this range).
     * @param values A two-dimensional array of values.
     * @returns Range — This range, for chaining.
     */
    setValues(values: ICellV[][]): Range;
    setValues(values: ObjectMatrix<ICellV>): Range;
    setValues(...argument: any): Range {
        const { _rangeData, _context, _commandManager, _worksheet } = this;
        const values = argument[0];

        if (Tuples.checkup(argument, Array)) {
            const { startRow, startColumn, endRow, endColumn } = _rangeData;

            const cellValue = new ObjectMatrix<ICellV>();
            for (let r = 0; r <= endRow - startRow; r++) {
                for (let c = 0; c <= endColumn - startColumn; c++) {
                    cellValue.setValue(r + startRow, c + startColumn, values[r][c]);
                }
            }

            const setValue: ISetRangeFormattedValueActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
                cellValue: cellValue.getData(),
                rangeData: this._rangeData,
            };
            const command = new Command(
                {
                    WorkBookUnit: _context.getWorkBook(),
                },
                setValue
            );
            _commandManager.invoke(command);
        } else if (Tuples.checkup(argument, ObjectMatrix)) {
            const setValue: ISetRangeFormattedValueActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
                cellValue: values,
                rangeData: this._rangeData,
            };
            const command = new Command(
                {
                    WorkBookUnit: _context.getWorkBook(),
                },
                setValue
            );
            _commandManager.invoke(command);
        }

        return this;
    }

    /**
     * Sets cell data object for current range
     * @param value Cell data object
     * @returns
     */
    setRangeData(value: ICellData): Range {
        const { _rangeData, _context, _commandManager, _worksheet } = this;
        const { startRow, startColumn } = _rangeData;
        const setValue: ISetRangeDataActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue: {
                [startRow]: {
                    [startColumn]: value,
                },
            },
            // set the operation type for modifying cell data to default (it includes undo)
            operation: ActionOperationType.DEFAULT_ACTION,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Sets a rectangular grid of cell obejct data (must match dimensions of this range).
     * @param values A two-dimensional array of cell object data.
     * @returns Range — This range, for chaining.
     */
    setRangeDatas(values: ICellData[][]): Range;
    setRangeDatas(values: ObjectMatrixPrimitiveType<ICellData>): Range;
    setRangeDatas(...argument: any): Range {
        const { _rangeData, _context, _commandManager, _worksheet } = this;
        const values = argument[0];

        if (Tuples.checkup(argument, Array)) {
            const { startRow, startColumn, endRow, endColumn } = _rangeData;

            const cellValue = new ObjectMatrix<ICellData>();
            for (let r = 0; r <= endRow - startRow; r++) {
                for (let c = 0; c <= endColumn - startColumn; c++) {
                    cellValue.setValue(r + startRow, c + startColumn, values[r][c]);
                }
            }

            const setValue: ISetRangeDataActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                cellValue: cellValue.getData(),
            };
            const command = new Command(
                {
                    WorkBookUnit: _context.getWorkBook(),
                },
                setValue
            );
            _commandManager.invoke(command);
        } else if (Tuples.checkup(argument, Tuples.OBJECT_TYPE)) {
            const setValue: ISetRangeDataActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                cellValue: values,
            };
            const command = new Command(
                {
                    WorkBookUnit: _context.getWorkBook(),
                },
                setValue
            );
            _commandManager.invoke(command);
        }

        return this;
    }

    /**
     * Clears the range of contents, formats, and data validation rules.
     * @returns This range, for chaining.
     */
    clear(): Range;
    /**
     * Clears the range of contents and/or format, as specified with the given advanced options. By default all data is cleared.
     * @param options A JavaScript object that specifies advanced parameters, as listed below.
     * @returns This range, for chaining.
     */
    clear(options: IOptionData): Range;
    clear(...argument: any): Range {
        const { _context, _worksheet, _commandManager, _rangeData } = this;

        // default options
        let options = {
            formatOnly: true,
            contentsOnly: true,
        };
        if (Tuples.checkup(argument, Tuples.OBJECT_TYPE)) {
            options = argument[0];
        }

        const setValue: IClearRangeActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.CLEAR_RANGE_ACTION,
            options,
            rangeData: _rangeData,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Clears formatting for this range.
     *
     * This clears text formatting for the cell or cells in the range, but does not reset any number formatting rules.
     *
     * @returns Range This range, for chaining.
     */
    clearFormat(): Range {
        return this.clear({ formatOnly: true });
    }

    /**
     * Clears the content of the range, leaving the formatting intact.
     *
     * @returns Range This range, for chaining.
     */
    clearContent(): Range {
        return this.clear({ contentsOnly: true });
    }

    /**
     * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
     *
     * solution: Clear the range to be deleted, and then set the new value of the cell content at the bottom using setValue
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     * @returns void
     */
    deleteCells(shiftDimension: Dimension): void {
        const { _rangeData, _context, _commandManager, _worksheet } = this;

        const setValue: IDeleteRangeActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.DELETE_RANGE_ACTION,
            shiftDimension,
            rangeData: _rangeData,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);
    }

    /**
     * Inserts empty cells into this range. The new cells retain any formatting present in the cells previously occupying this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
     * @param  {Dimension} shiftDimension The dimension along which to shift existing data.
     * @returns Range This range, for chaining.
     */
    insertCells(shiftDimension: Dimension): Range;
    insertCells(shiftDimension: Dimension, destination: Range): Range;
    insertCells(...argument: any): Range {
        const shiftDimension = argument[0];
        const destination: Range = argument[1];
        const { _rangeData, _context, _commandManager, _worksheet } = this;
        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        let rangeData = this._rangeData;

        // TODO 1. 补充另一个方向
        // 2. 重载，传入数据，范围根据数据范围变化

        // build blank values
        let cellValue = new ObjectMatrix<ICellData>();
        if (destination) {
            cellValue = destination.getMatrixObject();

            const destinationRangeData = destination.getRangeData();

            rangeData = {
                startRow,
                endRow:
                    startRow +
                    destinationRangeData.endRow -
                    destinationRangeData.startRow,
                startColumn,
                endColumn:
                    startRow +
                    destinationRangeData.endColumn -
                    destinationRangeData.startColumn,
            };
        } else {
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r, c, { m: '', v: '' });
                }
            }
        }

        const insertValue: IInsertRangeActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.INSERT_RANGE_ACTION,
            shiftDimension,
            rangeData,
            cellValue: cellValue.getData(),
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            insertValue
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Merges the cells in the range together into a single block.
     *
     * @returns Range — This range, for chaining.
     */
    merge(): Range {
        const { _worksheet } = this;
        const merges = _worksheet.getMerges();
        merges.add(this._rangeData);
        return this;
    }

    /**
     * Merge the cells in the range across the columns of the range.
     *
     * @returns Range — This range, for chaining.
     */
    mergeAcross(): Range {
        const { _worksheet } = this;
        const _commandManager = _worksheet.getCommandManager();
        const _context = _worksheet.getContext();
        const _sheetId = _worksheet.getSheetId();

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const rectangles = [];

        for (let r = startRow; r <= endRow; r++) {
            const data = {
                startRow: r,
                endRow: r,
                startColumn,
                endColumn,
            };
            rectangles.push(data);
        }
        const dataRowInsert: IAddMergeActionData = {
            actionName: ACTION_NAMES.ADD_MERGE_ACTION,
            sheetId: _sheetId,
            rectangles,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            dataRowInsert
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Merges the cells in the range together.
     *
     * @returns Range — This range, for chaining.
     */
    mergeVertically(): Range {
        const { _worksheet } = this;
        const _commandManager = _worksheet.getCommandManager();
        const _context = _worksheet.getContext();
        const _sheetId = _worksheet.getSheetId();

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;
        const rectangles = [];

        for (let c = startColumn; c <= endColumn; c++) {
            const data = {
                startRow,
                endRow,
                startColumn: c,
                endColumn: c,
            };
            rectangles.push(data);
        }
        const dataRowInsert: IAddMergeActionData = {
            actionName: ACTION_NAMES.ADD_MERGE_ACTION,
            sheetId: _sheetId,
            rectangles,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            dataRowInsert
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Break any multi-column cells in the range into individual cells again.

        Calling this function on a range is equivalent to selecting a range and clicking Format -> Merge -> Unmerge.

        @returns Range — This range, for chaining.
     */
    breakApart(): Range {
        // 您必须选中某个合并范围内的所有单元格才能执行合并或撤消合并。
        const { _worksheet } = this;
        const _commandManager = _worksheet.getCommandManager();
        const _context = _worksheet.getContext();
        const _sheetId = _worksheet.getSheetId();

        const rectangles = this._worksheet
            .getMerges()
            .getMergedRanges(this._rangeData);

        const dataRowInsert: IRemoveMergeActionData = {
            actionName: ACTION_NAMES.REMOVE_MERGE_ACTION,
            sheetId: _sheetId,
            rectangles,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            dataRowInsert
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Removes rows within this range that contain values that are duplicates of values in any previous row. Rows with identical values but different letter cases, formatting, or formulas are considered to be duplicates. This method also removes duplicates rows hidden from view (for example, due to a filter). Content outside of this range isn't removed.
     *
     * @returns Range The resulting range after removing duplicates. The size of the range is reduced by a row for every row removed.
     */
    removeDuplicates(): Range;

    /**
     * Removes rows within this range that contain values in the specified columns that are duplicates of values any previous row. Rows with identical values but different letter cases, formatting, or formulas are considered to be duplicates. This method also removes duplicates rows hidden from view (for example, due to a filter). Content outside of this range isn't removed.
     * @param columnsToCompare The columns to analyze for duplicate values. If no columns are provided then all columns are analyzed for duplicates.
     * @returns Range The resulting range after removing duplicates. The size of the range is reduced by a row for every row removed.
     */
    removeDuplicates(columnsToCompare: number[]): Range;
    removeDuplicates(...argument: any): Range {
        const { _rangeData, _context, _commandManager, _worksheet } = this;
        let columnsToCompare = [];
        // set columns
        if (Array.isArray(argument[0])) {
            columnsToCompare = argument[0];
        }

        const newCellValue = this.getMatrix().getData();

        const rowList: number[][] = [];

        for (let i = 0; i <= _rangeData.endColumn - _rangeData.startColumn; i++) {
            const arr: number[] = [];
            const obj: any = {};

            const column = this.getColumnMatrix(i).getData();
            for (const key in column) {
                // if (column.hasOwnProperty(key)) {
                const value = column[key][i].m;

                if (!obj.hasOwnProperty(value)) {
                    obj[value!] = 1;
                    arr.push(i);
                }
                // }
            }

            rowList.push(arr);
        }

        const newRowList = Array.from(new Set(rowList.flat()));

        const newData: { [key: number]: { [key: number]: ICellData } } = {};

        newRowList.forEach((item, i) => {
            newData[i] = newCellValue[item];
        });

        const removeDatas: ISetRangeDataActionData[] = [
            {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                cellValue: newData,
            },
        ];
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...removeDatas
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * get row matrix
     * @returns
     */
    getRowMatrix(index: number) {
        const { startColumn, endColumn } = this._rangeData;

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
        const { startRow, endRow } = this._rangeData;

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
        Range.foreach(this._rangeData, action);
    }

    /**
     * Randomizes the order of the rows in the given range.
     * TODO：待研究特性
     * 1. 公式内的范围也会变化
     * 2. 并不是所有范围都支持随机处理
     * @returns
     */
    randomize() {
        const { _context, _worksheet, _commandManager, _rangeData } = this;
        const { startRow, startColumn } = _rangeData;
        const cellValue = new ObjectMatrix<ICellData>();

        const value = Tools.randSort(this.getMatrix().toArray());

        value.forEach((row, r) =>
            row.forEach((cell, c) => {
                cell = cell as ICellData;
                cellValue.setValue(r + startRow, c + startColumn, cell || {});
            })
        );

        const setValue: ISetRangeDataActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            cellValue: cellValue.getData(),
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setValue
        );
        _commandManager.invoke(command);
    }

    /**
     * Determine whether a range is legal
     */
    isValid(): boolean {
        if (Object.values(this._rangeData).includes(-1)) {
            return false;
        }
        return true;
    }

    /**
     * en:
     *
     * The process of copying a range to another range is obtained by the following rules
     *
     * [The two-dimensional array composed of the content or format to be assigned] => [Target range]
     *
     * 1. 1 -> 1: 1 => 1
     * 2. N -> 1: N => N
     * 3. 1 -> N: N => N
     * 4. N1 -> N2:
     *     1) N1 <N2: If N2 is a multiple of N1 (X), N1 * X => N2; If not, N1 => N1 (refer to office excel, different from google sheet)
     *     2) N1> N2: N1 => N1
     *
     * The above four cases can be combined and processed as
     *
     * Case 1, 1/2/4-2 merged into N1 => N1
     * Case 2, 3/4-1 merge into N1 * X => N2 or Case 1
     *
     * In the end we only need to judge whether N2 is a multiple of N1
     *
     * zh:
     *
     * 处理复制一个范围到另一个范围，由以下规则得到
     *
     * [将要赋值的内容或者格式组成的二维数组] => [目标范围]
     *
     * 1. 1 -> 1 : 1 => 1
     * 2. N -> 1 : N => N
     * 3. 1 -> N : N => N
     * 4. N1 -> N2 :
     *     1) N1 < N2 : 如果N2是N1的倍数X, N1 * X => N2; 如果不是，N1 => N1(参考office excel，和google sheet不同)
     *     2) N1 > N2 : N1 => N1
     *
     * 上面四种情况，可以合并处理为
     * 情况一， 1/2/4-2合并为 N1 => N1
     * 情况二， 3/4-1合并为 N1 * X => N2 或者情况一
     *
     * 最终我们只需要判断N2是否是N1的倍数
     *
     */
    private _handleCopyRange(
        originRange: Range,
        destinationRange: IRangeData
    ): [ICellDataMatrix, IRangeData];
    private _handleCopyRange(
        originRange: Range,
        destinationRange: Range
    ): [ICellDataMatrix, IRangeData];
    private _handleCopyRange(...argument: any): [ICellDataMatrix, IRangeData] {
        const originRange = argument[0];
        let destinationRange = argument[1];
        destinationRange = Tuples.checkup(argument, Range, Range)
            ? destinationRange.getRangeData()
            : destinationRange;

        const cellData = originRange._worksheet.getCellMatrix();
        const { startRow, endRow, startColumn, endColumn } =
            originRange.getRangeData();
        let {
            startRow: dStartRow,
            endRow: dEndRow,
            startColumn: dStartColumn,
            endColumn: dEndColumn,
        } = destinationRange;

        const originRows = endRow - startRow + 1;
        const originColumns = endColumn - startColumn + 1;
        const destinationRows = dEndRow - dStartRow + 1;
        const destinationColumns = dEndColumn - dStartColumn + 1;

        let value: ICellDataMatrix = [];
        let range: IRangeData;

        // judge whether N2 is a multiple of N1
        if (
            destinationRows % originRows === 0 &&
            destinationColumns % originColumns === 0
        ) {
            /**
             * A1,B1  =>  A1,B1,C1,D1
             * A2,B2      A2,B2,C2,D2
             *            A3,B3,C3,D3
             *            A4,B4,C4,D4
             */
            for (let r = 0; r < destinationRows; r++) {
                const row = [];
                for (let c = 0; c < destinationColumns; c++) {
                    // Retrieve the corresponding cell data from the original range, {} as a fallback
                    const cell =
                        cellData.getValue(
                            (r + startRow) % originRows,
                            (c + startColumn) % originColumns
                        ) || {};
                    row.push(cell);
                }
                value.push(row);
            }

            range = destinationRange;
        } else {
            value = cellData
                .getFragments(startRow, endRow, startColumn, endColumn)
                .getData();

            // Extend the destination to the same size as the original range
            dEndRow += originRows - destinationRows;
            dEndColumn += originColumns - destinationColumns;

            range = {
                startRow: dStartRow,
                endRow: dEndRow,
                startColumn: dStartColumn,
                endColumn: dEndColumn,
            };
        }

        return [value, range];
    }

    /**
     *
     * @param arg Shorthand for the style that gets
     * @returns style value
     */
    private _getStyles<K>(
        arg: keyof IStyleData
    ): Array<Array<IStyleData[keyof IStyleData]>> {
        return this.getValues().map((row) =>
            row.map((cell: Nullable<ICellData>) => {
                const styles = this._context.getWorkBook().getStyles();

                // const style = getStyle(styles, cell);
                const style = styles && styles.getStyleByCell(cell);
                return (style && style[arg]) || DEFAULT_STYLES[arg];
            })
        );
    }

    // isStartColumnBounded() {}
    // isStartRowBounded() {}

    private _setStyle(
        value: Nullable<string | number | ITextDecoration>,
        type: string
    ) {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        // string converted to a two-dimensional array
        const styleObj = { [type]: value };

        const stylesMatrix = Tools.fillObjectMatrix(
            endRow - startRow + 1,
            endColumn - startColumn + 1,
            styleObj
        );

        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: SetRangeStyleAction.NAME,
            value: stylesMatrix,
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    private _setStyles(
        values: Array<Array<Nullable<string | number | ITextDecoration>>>,
        type: string
    ) {
        const { _context, _worksheet, _commandManager } = this;

        const { startRow, endRow, startColumn, endColumn } = this._rangeData;

        const matrix = new ObjectMatrix<IStyleData>();
        for (let r = 0; r < endRow - startRow + 1; r++) {
            for (let c = 0; c < endColumn - startColumn + 1; c++) {
                matrix.setValue(r, c, { [type]: values[r][c] });
            }
        }
        const setStyle: ISetRangeStyleActionData = {
            sheetId: _worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
            value: matrix.getData(),
            rangeData: this._rangeData,
        };

        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            setStyle
        );
        _commandManager.invoke(command);
        return this;
    }

    // /**
    //  * Applies a default row banding theme to the range. By default, the banding has header and no footer color.
    //  */
    // applyRowBanding(): Nullable<Banding>;

    // /**
    //  * Applies a specified row banding theme to the range. By default, the banding has header and no footer color.
    //  * @param bandingTheme
    //  */
    // applyRowBanding(bandingTheme: BandingTheme | IBandingProperties): Nullable<Banding>;

    // /**
    //  * Applies a specified row banding theme to the range with specified header and footer settings.
    //  * @param bandingTheme
    //  * @param showHeader
    //  * @param showFooter
    //  */
    // applyRowBanding(
    //     bandingTheme: BandingTheme | IBandingProperties,
    //     showHeader: boolean,
    //     showFooter: boolean
    // ): Nullable<Banding>;
    // applyRowBanding(...argument: any): Nullable<Banding> {

    //     // default argument
    //     const bandedRangeId = 'banded-range-' + Tools.generateRandomId(6);
    //     const rangeData = this.getRangeData()
    //     let rowProperties:IBanding = {
    //         bandingTheme:argument[0] || BandingTheme.LIGHT_GRAY,
    //         showHeader:argument[1] || true,
    //         showFooter:argument[2] || false,
    //     }

    //     const { _context, _commandManager } = this;
    //     // Check whether the incoming range has been set to alternate colors
    //     const bandings = this.getSheet().getBandings();
    //     const isIntersection =
    //         bandings &&
    //         bandings.find((banding: Banding) =>
    //             banding.getRange().isIntersection(this)
    //         );
    //     if (isIntersection) {
    //         console.error(
    //             'You cannot add alternating background colors to a range that already has alternating background colors.'
    //         );
    //         return
    //     }

    //     // Organize action data
    //     const actionData: IAddBandingActionData = {
    //         actionName: ACTION_NAMES.ADD_BANDING_ACTION,
    //         bandedRange:{
    //             bandedRangeId,
    //             rangeData,
    //             rowProperties
    //         },
    //         sheetId: this.getSheet().getSheetId(),
    //     };

    //     // Execute action
    //     const command = new Command(_context.getWorkBook(), actionData);
    //     _commandManager.invoke(command);

    //     return this.getSheet().getBandingById(bandedRangeId)
    // }
    // /**
    //  * Applies a default row banding theme to the range. By default, the banding has header and no footer color.
    //  */
    // applyRowBanding(): Nullable<Banding>;

    // /**
    //  * Applies a specified row banding theme to the range. By default, the banding has header and no footer color.
    //  * @param bandingTheme
    //  */
    // applyRowBanding(
    //     bandingTheme: BandingTheme | IBandingProperties
    // ): Nullable<Banding>;

    // /**
    //  * Applies a specified row banding theme to the range with specified header and footer settings.
    //  * @param bandingTheme
    //  * @param showHeader
    //  * @param showFooter
    //  */
    // applyRowBanding(
    //     bandingTheme: BandingTheme | IBandingProperties,
    //     showHeader: boolean,
    //     showFooter: boolean
    // ): Nullable<Banding>;
    // applyRowBanding(...argument: any): Nullable<Banding> {
    //     // default argument
    //     const bandedRangeId = 'banded-range-' + Tools.generateRandomId(6);
    //     const rangeData = this.getRangeData();
    //     let rowProperties: IBanding = {
    //         bandingTheme: argument[0] || BandingTheme.LIGHT_GRAY,
    //         showHeader: argument[1] || true,
    //         showFooter: argument[2] || false,
    //     };

    //     const { _worksheet } = this;
    //     // Check whether the incoming range has been set to alternate colors
    //     const bandedRanges = _worksheet.getConfig().bandedRanges;
    //     const isIntersection =
    //         bandedRanges &&
    //         bandedRanges.find((bandedRange: IBandedRange) =>
    //             _worksheet.getRange(bandedRange.rangeData).isIntersection(this)
    //         );
    //     if (isIntersection) {
    //         console.error(
    //             'You cannot add alternating background colors to a range that already has alternating background colors.'
    //         );
    //         return;
    //     }

    //     return new Banding(this._worksheet).addRowBanding({
    //         bandedRangeId,
    //         rangeData,
    //         rowProperties,
    //     });
    // }

    /**
     * Creates a filter applied to the range. There can be at most one filter in a sheet.
     * @returns The new filter.
     */
    // createFilter(): Filter {
    //     return new Filter(this);
    // }
}

// Alternating Colors =  bandingIns,  range.applyRowBanding()  bandingIns.setRowBanding(XXX)  // bandingIns.remove(id)
