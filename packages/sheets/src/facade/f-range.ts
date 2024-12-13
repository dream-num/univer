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

import type { CellValue, ICellData, IColorStyle, IObjectMatrixPrimitiveType, IRange, IStyleData, ITextDecoration, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISetHorizontalTextAlignCommandParams, ISetStyleCommandParams, ISetTextWrapCommandParams, ISetVerticalTextAlignCommandParams, IStyleTypeValue } from '@univerjs/sheets';
import type { FHorizontalAlignment, FVerticalAlignment } from './utils';
import { BooleanNumber, Dimension, FBase, ICommandService, Inject, Injector, Rectangle, Tools, WrapStrategy } from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { addMergeCellsUtil, getAddMergeMutationRangeByType, RemoveWorksheetMergeCommand, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import { covertCellValue, covertCellValues, transformCoreHorizontalAlignment, transformCoreVerticalAlignment, transformFacadeHorizontalAlignment, transformFacadeVerticalAlignment } from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

export class FRange extends FBase {
    constructor(
        protected readonly _workbook: Workbook,
        protected readonly _worksheet: Worksheet,
        protected readonly _range: IRange,
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(FormulaDataModel) protected readonly _formulaDataModel: FormulaDataModel
    ) {
        super();
    }

    /**
     * Get the unit ID of the current workbook
     *
     * @return The unit ID of the workbook
     */
    getUnitId(): string {
        return this._workbook.getUnitId();
    }

    /**
     * Gets the name of the worksheet
     *
     * @return The name of the worksheet
     */
    getSheetName(): string {
        return this._worksheet.getName();
    }

    /**
     * Gets the area where the statement is applied
     *
     * @return The area where the statement is applied
     */
    getRange(): IRange {
        return this._range;
    }

    /**
     * Gets the starting row number of the applied area
     *
     * @return The starting row number of the area
     */
    getRow(): number {
        return this._range.startRow;
    }

    /**
     * Gets the starting column number of the applied area
     *
     * @return The starting column number of the area
     */
    getColumn(): number {
        return this._range.startColumn;
    }

    /**
     * Gets the width of the applied area
     *
     * @return The width of the area
     */
    getWidth(): number {
        return this._range.endColumn - this._range.startColumn + 1;
    }

    /**
     * Gets the height of the applied area
     *
     * @return The height of the area
     */
    getHeight(): number {
        return this._range.endRow - this._range.startRow + 1;
    }

    /**
     * Return first cell model data in this range
     * @returns The cell model data
     */
    getCellData(): ICellData | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn) ?? null;
    }

    /**
     * Return range whether this range is merged
     * @returns if true is merged
     */
    isMerged(): boolean {
        const { startColumn, startRow, endColumn, endRow } = this._range;
        const mergedCells = this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn);
        return mergedCells.some((range) => Rectangle.equals(range, this._range));
    }

    /**
     * Return first cell style data in this range
     * @returns The cell style data
     */
    getCellStyleData(): IStyleData | null {
        const cell = this.getCellData();
        const styles = this._workbook.getStyles();
        if (cell && styles) {
            return styles.getStyleByCell(cell) ?? null;
        }

        return null;
    }

    /**
     * Returns the value of the cell at the start of this range.
     * @returns The value of the cell.
     */
    getValue(): CellValue | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
    }

    /**
     * Returns the rectangular grid of values for this range.
     * Returns a two-dimensional array of values, indexed by row, then by column.
     * @returns A two-dimensional array of values.
     */
    getValues(): Nullable<CellValue>[][] {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const range: Array<Array<Nullable<CellValue>>> = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: Array<Nullable<CellValue>> = [];

            for (let c = startColumn; c <= endColumn; c++) {
                row.push(this._worksheet.getCell(r, c)?.v ?? null);
            }

            range.push(row);
        }
        return range;
    }

    /**
     * Returns the cell data for the cells in the range.
     * @returns A two-dimensional array of cell data.
     */
    getCellDataGrid(): Nullable<ICellData>[][] {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const range: Nullable<ICellData>[][] = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: Nullable<ICellData>[] = [];
            for (let c = startColumn; c <= endColumn; c++) {
                row.push(this._worksheet.getCellRaw(r, c));
            }
            range.push(row);
        }
        return range;
    }

    /**
     * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
     * @returns A two-dimensional array of formulas in string format.
     */
    getFormulas(): string[][] {
        const formulas: string[][] = [];

        const { startRow, endRow, startColumn, endColumn } = this._range;
        const sheetId = this._worksheet.getSheetId();
        const unitId = this._workbook.getUnitId();

        for (let row = startRow; row <= endRow; row++) {
            const rowFormulas: string[] = [];

            for (let col = startColumn; col <= endColumn; col++) {
                const formulaString = this._formulaDataModel.getFormulaStringByCell(row, col, sheetId, unitId);
                rowFormulas.push(formulaString || '');
            }

            formulas.push(rowFormulas);
        }

        return formulas;
    }

    getWrap(): boolean {
        return this._worksheet.getRange(this._range).getWrap() === BooleanNumber.TRUE;
    }

    getWrapStrategy(): WrapStrategy {
        return this._worksheet.getRange(this._range).getWrapStrategy();
    }

    getHorizontalAlignment(): string {
        return transformCoreHorizontalAlignment(this._worksheet.getRange(this._range).getHorizontalAlignment());
    }

    getVerticalAlignment(): string {
        return transformCoreVerticalAlignment(this._worksheet.getRange(this._range).getVerticalAlignment());
    }

    // #region editing

    setBackgroundColor(color: string): Promise<boolean> {
        return this._commandService.executeCommand(SetStyleCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style: {
                type: 'bg',
                value: {
                    rgb: color,
                },
            },
        } as ISetStyleCommandParams<IColorStyle>);
    }

    /**
     * The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
     * @param value
     */
    setValue(value: CellValue | ICellData): Promise<boolean> {
        const realValue = covertCellValue(value);

        if (!realValue) {
            throw new Error('Invalid value');
        }

        return this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Set the cell wrap of the given range.
     * Cells with wrap enabled (the default) resize to display their full content. Cells with wrap disabled display as much as possible in the cell without resizing or running to multiple lines.
     */
    setWrap(isWrapEnabled: boolean): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: isWrapEnabled ? WrapStrategy.WRAP : WrapStrategy.UNSPECIFIED,
        } as ISetTextWrapCommandParams);
    }

    /**
     * Sets the text wrapping strategy for the cells in the range.
     */
    setWrapStrategy(strategy: WrapStrategy): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: strategy,
        } as ISetTextWrapCommandParams);
    }

    /**
     * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
     */
    setVerticalAlignment(alignment: FVerticalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetVerticalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeVerticalAlignment(alignment),
        } as ISetVerticalTextAlignCommandParams);
    }

    /**
     * Set the horizontal (left to right) alignment for the given range (left/center/right).
     */
    setHorizontalAlignment(alignment: FHorizontalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetHorizontalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeHorizontalAlignment(alignment),
        } as ISetHorizontalTextAlignCommandParams);
    }

    /**
     * Sets a different value for each cell in the range. The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats. If a value begins with `=`, it is interpreted as a formula.
     * @param value
     */
    setValues(
        value:
            | CellValue[][]
            | IObjectMatrixPrimitiveType<CellValue>
            | ICellData[][]
            | IObjectMatrixPrimitiveType<ICellData>
    ): Promise<boolean> {
        const realValue = covertCellValues(value, this._range);

        return this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Sets the font weight for the given range (normal/bold),
     * @param fontWeight The font weight, either 'normal' or 'bold'; a null value resets the font weight.
     */
    setFontWeight(fontWeight: FontWeight | null): this {
        let value: BooleanNumber | null;
        if (fontWeight === 'bold') {
            value = BooleanNumber.TRUE;
        } else if (fontWeight === 'normal') {
            value = BooleanNumber.FALSE;
        } else if (fontWeight === null) {
            value = null;
        } else {
            throw new Error('Invalid fontWeight');
        }

        const style: IStyleTypeValue<BooleanNumber | null> = {
            type: 'bl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font style for the given range ('italic' or 'normal').
     * @param fontStyle The font style, either 'italic' or 'normal'; a null value resets the font style.
     */
    setFontStyle(fontStyle: FontStyle | null): this {
        let value: BooleanNumber | null;
        if (fontStyle === 'italic') {
            value = BooleanNumber.TRUE;
        } else if (fontStyle === 'normal') {
            value = BooleanNumber.FALSE;
        } else if (fontStyle === null) {
            value = null;
        } else {
            throw new Error('Invalid fontStyle');
        }

        const style: IStyleTypeValue<BooleanNumber | null> = {
            type: 'it',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font line style of the given range ('underline', 'line-through', or 'none').
     * @param fontLine The font line style, either 'underline', 'line-through', or 'none'; a null value resets the font line style.
     */
    setFontLine(fontLine: FontLine | null): this {
        if (fontLine === 'underline') {
            this._setFontUnderline({
                s: BooleanNumber.TRUE,
            });
        } else if (fontLine === 'line-through') {
            this._setFontStrikethrough({
                s: BooleanNumber.TRUE,
            });
        } else if (fontLine === 'none') {
            this._setFontUnderline({
                s: BooleanNumber.FALSE,
            });
            this._setFontStrikethrough({
                s: BooleanNumber.FALSE,
            });
        } else if (fontLine === null) {
            this._setFontUnderline(null);
            this._setFontStrikethrough(null);
        } else {
            throw new Error('Invalid fontLine');
        }
        return this;
    }

    /**
     * Sets the font underline style of the given ITextDecoration
     */
    private _setFontUnderline(value: ITextDecoration | null): void {
        const style: IStyleTypeValue<ITextDecoration | null> = {
            type: 'ul',
            value,
        };
        const setStyleParams: ISetStyleCommandParams<ITextDecoration | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font strikethrough style of the given ITextDecoration
     */
    private _setFontStrikethrough(value: ITextDecoration | null): void {
        const style: IStyleTypeValue<ITextDecoration | null> = {
            type: 'st',
            value,
        };
        const setStyleParams: ISetStyleCommandParams<ITextDecoration | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font family, such as "Arial" or "Helvetica".
     * @param fontFamily The font family to set; a null value resets the font family.
     */
    setFontFamily(fontFamily: string | null): this {
        const style: IStyleTypeValue<string | null> = {
            type: 'ff',
            value: fontFamily,
        };
        const setStyleParams: ISetStyleCommandParams<string | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font size, with the size being the point size to use.
     * @param size A font size in point size. A null value resets the font size.
     */
    setFontSize(size: number | null): this {
        const style: IStyleTypeValue<number | null> = {
            type: 'fs',
            value: size,
        };
        const setStyleParams: ISetStyleCommandParams<number | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font color in CSS notation (such as '#ffffff' or 'white').
     * @param color The font color in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
     */
    setFontColor(color: string | null): this {
        const value: IColorStyle | null = color === null ? null : { rgb: color };
        const style: IStyleTypeValue<IColorStyle | null> = {
            type: 'cl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<IColorStyle | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    // #endregion editing

    //#region Merge cell

    /**
     * Merge cells in a range into one merged cell
     *
     * @param [defaultMerge] - If true, only the value in the upper left cell is retained.
     *
     * @returns This range, for chaining
     */
    async merge(defaultMerge: boolean = true): Promise<FRange> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        await addMergeCellsUtil(this._injector, unitId, subUnitId, [this._range], defaultMerge);

        return this;
    }

    /**
     * Merges cells in a range horizontally.
     *
     * @param [defaultMerge] - If true, only the value in the upper left cell is retained.
     *
     * @returns This range, for chaining
     */
    async mergeAcross(defaultMerge: boolean = true): Promise<FRange> {
        const ranges = getAddMergeMutationRangeByType([this._range], Dimension.ROWS);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        await addMergeCellsUtil(this._injector, unitId, subUnitId, ranges, defaultMerge);

        return this;
    }

    /**
     * Merges cells in a range vertically.
     *
     * @param [defaultMerge] - If true, only the value in the upper left cell is retained.
     *
     * @returns This range, for chaining
     */
    async mergeVertically(defaultMerge: boolean = true): Promise<FRange> {
        const ranges = getAddMergeMutationRangeByType([this._range], Dimension.COLUMNS);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        await addMergeCellsUtil(this._injector, unitId, subUnitId, ranges, defaultMerge);

        return this;
    }

    /**
     * Returns true if cells in the current range overlap a merged cell.
     * @returns {boolean} is overlap with a merged cell
     */
    isPartOfMerge(): boolean {
        const { startRow, startColumn, endRow, endColumn } = this._range;
        return this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn).length > 0;
    }

    /**
     * Break all horizontally- or vertically-merged cells contained within the range list into individual cells again.
     * @returns This range, for chaining
     */
    breakApart(): FRange {
        this._commandService.executeCommand(RemoveWorksheetMergeCommand.id, { ranges: [this._range] });
        return this;
    }

    //#endregion

    /**
     * Iterate cells in this range. Merged cells will be respected.
     * @param callback the callback function to be called for each cell in the range
     * @param {number} callback.row the row number of the cell
     * @param {number} callback.col the column number of the cell
     * @param {ICellData} callback.cell the cell data
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.forEach((row, col, cell) => {
     *    console.log(row, col, cell);
     * });
     * ```
     */
    forEach(callback: (row: number, col: number, cell: ICellData) => void): void {
        // Iterate each cell in this range.
        const { startColumn, startRow, endColumn, endRow } = this._range;
        this._worksheet
            .getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn)
            .forValue((row, col, value) => {
                callback(row, col, value);
            });
    }

    /**
     * Returns a string description of the range, in A1 notation.
     * @returns {string} The A1 notation of the range.
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getA1Notation()); // A1:B2
     * ```
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
}
