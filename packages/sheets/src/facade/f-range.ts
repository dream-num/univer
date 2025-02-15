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

import type { BorderStyleTypes, BorderType, CellValue, CustomData, ICellData, IColorStyle, IDocumentData, IObjectMatrixPrimitiveType, IRange, IStyleData, ITextDecoration, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISetBorderBasicCommandParams, ISetHorizontalTextAlignCommandParams, ISetRangeValuesCommandParams, ISetStyleCommandParams, ISetTextWrapCommandParams, ISetVerticalTextAlignCommandParams, IStyleTypeValue, SplitDelimiterEnum } from '@univerjs/sheets';
import type { FHorizontalAlignment, FVerticalAlignment } from './utils';
import { BooleanNumber, Dimension, ICommandService, Inject, Injector, Rectangle, RichTextValue, TextStyleValue, WrapStrategy } from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { FormulaDataModel, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { addMergeCellsUtil, DeleteWorksheetRangeThemeStyleCommand, getAddMergeMutationRangeByType, RemoveWorksheetMergeCommand, SetBorderBasicCommand, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand, SetWorksheetRangeThemeStyleCommand, SheetRangeThemeService, SplitTextToColumnsCommand } from '@univerjs/sheets';
import { FWorkbook } from './f-workbook';
import { covertCellValue, covertCellValues, transformCoreHorizontalAlignment, transformCoreVerticalAlignment, transformFacadeHorizontalAlignment, transformFacadeVerticalAlignment } from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

/**
 * Represents a range of cells in a sheet. You can call methods on this Facade API object
 * to read contents or manipulate the range.
 *
 * @hideconstructor
 */
export class FRange extends FBaseInitialable {
    constructor(
        protected readonly _workbook: Workbook,
        protected readonly _worksheet: Worksheet,
        protected readonly _range: IRange,
        @Inject(Injector) protected override readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(FormulaDataModel) protected readonly _formulaDataModel: FormulaDataModel
    ) {
        super(_injector);
    }

    /**
     * Get the unit ID of the current workbook
     * @returns {string} The unit ID of the workbook
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getUnitId());
     * ```
     */
    getUnitId(): string {
        return this._workbook.getUnitId();
    }

    /**
     * Gets the name of the worksheet
     * @returns {string} The name of the worksheet
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getSheetName());
     * ```
     */
    getSheetName(): string {
        return this._worksheet.getName();
    }

    /**
     * Gets the ID of the worksheet
     * @returns {string} The ID of the worksheet
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getSheetId());
     * ```
     */
    getSheetId(): string {
        return this._worksheet.getSheetId();
    }

    /**
     * Gets the area where the statement is applied
     * @returns {IRange} The area where the statement is applied
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * const range = fRange.getRange();
     * const { startRow, startColumn, endRow, endColumn } = range;
     * console.log(range);
     * ```
     */
    getRange(): IRange {
        return this._range;
    }

    /**
     * Gets the starting row number of the applied area
     * @returns {number} The starting row number of the area
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getRow());
     * ```
     */
    getRow(): number {
        return this._range.startRow;
    }

    /**
     * Gets the starting column number of the applied area
     * @returns {number} The starting column number of the area
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getColumn());
     * ```
     */
    getColumn(): number {
        return this._range.startColumn;
    }

    /**
     * Gets the width of the applied area
     * @returns {number} The width of the area
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getWidth());
     * ```
     */
    getWidth(): number {
        return this._range.endColumn - this._range.startColumn + 1;
    }

    /**
     * Gets the height of the applied area
     * @returns {number} The height of the area
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getHeight());
     * ```
     */
    getHeight(): number {
        return this._range.endRow - this._range.startRow + 1;
    }

    /**
     * Return range whether this range is merged
     * @returns {boolean} if true is merged
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.isMerged());
     * // merge cells A1:B2
     * fRange.merge();
     * console.log(fRange.isMerged());
     * ```
     */
    isMerged(): boolean {
        const { startColumn, startRow, endColumn, endRow } = this._range;
        const mergedCells = this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn);
        return mergedCells.some((range) => Rectangle.equals(range, this._range));
    }

    /**
     * Return first cell style data in this range
     * @returns {IStyleData | null} The cell style data
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellStyleData());
     * ```
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
     * Return first cell style in this range
     * @returns {TextStyleValue | null} The cell style
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellStyle());
     * ```
     */
    getCellStyle(): TextStyleValue | null {
        const data = this.getCellStyleData();
        return data ? TextStyleValue.create(data) : null;
    }

    /**
     * Returns the cell styles for the cells in the range.
     * @returns {Array<Array<TextStyleValue | null>>} A two-dimensional array of cell styles.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellStyles());
     * ```
     */
    getCellStyles(): Array<Array<TextStyleValue | null>> {
        const cells = this.getCellDatas();
        const styles = this._workbook.getStyles();
        return cells.map((row) => row.map((cell) => {
            if (!cell) return null;
            const style = styles.getStyleByCell(cell);
            return style ? TextStyleValue.create(style) : null;
        }));
    }

    /**
     * Return first cell value in this range
     * @returns {CellValue | null} The cell value
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValue());
     *
     * // set the first cell value to 123
     * fRange.setValueForCell(123);
     * console.log(fRange.getValue()); // 123
     * ```
     */
    getValue(): CellValue | null;

    /**
     * Return first cell value in this range
     * @param {boolean} includeRichText Should the returns of this func to include rich text
     * @returns {CellValue | RichTextValue | null} The cell value
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValue(true));
     *
     * // set the first cell value to 123
     * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } })
     *   .setStyle(0, 1, { bl: 1, cl: { rgb: '#c81e1e' } })
     *   .setStyle(6, 7, { bl: 1, cl: { rgb: '#c81e1e' } });
     * fRange.setRichTextValueForCell(richText);
     * console.log(fRange.getValue(true).toPlainText()); // Hello World
     * ```
     */
    getValue(includeRichText: true): Nullable<CellValue | RichTextValue>;
    getValue(includeRichText?: boolean): Nullable<CellValue | RichTextValue> {
        if (includeRichText) {
            return this.getValueAndRichTextValue();
        }

        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
    }

    /**
     * Returns the cell values for the cells in the range.
     * @returns {Nullable<CellValue>[][]} A two-dimensional array of cell values.
     * @example
     * ```ts
     * // Get plain values
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValues());
     * ```
     */
    getValues(): Nullable<CellValue>[][];

    /**
     * Returns the cell values for the cells in the range.
     * @param {boolean} includeRichText Should the returns of this func to include rich text
     * @returns {Nullable<RichTextValue | CellValue>[][]} A two-dimensional array of cell values.
     * @example
     * ```ts
     * // Get values with rich text if available
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValues(true));
     * ```
     */
    getValues(includeRichText: true): (Nullable<RichTextValue | CellValue>)[][];
    getValues(includeRichText?: true): (Nullable<RichTextValue | CellValue>)[][] {
        if (includeRichText) {
            return this.getValueAndRichTextValues();
        }

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
     * Return first cell model data in this range
     * @returns {ICellData | null} The cell model data
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellData());
     * ```
     */
    getCellData(): ICellData | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn) ?? null;
    }

    /**
     * Alias for getCellDataGrid.
     * @returns {Nullable<ICellData>[][]} A two-dimensional array of cell data.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellDatas());
     * ```
     */
    getCellDatas(): Nullable<ICellData>[][] {
        return this.getCellDataGrid();
    }

    /**
     * Returns the cell data for the cells in the range.
     * @returns {Nullable<ICellData>[][]} A two-dimensional array of cell data.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellDataGrid());
     * ```
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
     * Returns the rich text value for the cell at the start of this range.
     * @returns {Nullable<RichTextValue>} The rich text value
     * @internal
     * @beta
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getRichTextValue());
     * ```
     */
    private getRichTextValue(): Nullable<RichTextValue> {
        const data = this.getCellData();
        if (data?.p) {
            return new RichTextValue(data.p);
        }

        return null;
    }

    /**
     * Returns the rich text value for the cells in the range.
     * @returns {Nullable<RichTextValue>[][]} A two-dimensional array of RichTextValue objects.
     * @internal
     * @beta
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getRichTextValues());
     * ```
     */
    private getRichTextValues(): Nullable<RichTextValue>[][] {
        const dataGrid = this.getCellDataGrid();
        return dataGrid.map((row) => row.map((data) => data?.p ? new RichTextValue(data.p) : null));
    }

    /**
     * Returns the value and rich text value for the cell at the start of this range.
     * @returns {Nullable<CellValue | RichTextValue>} The value and rich text value
     * @internal
     * @beta
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValueAndRichTextValue());
     * ```
     */
    private getValueAndRichTextValue(): Nullable<CellValue | RichTextValue> {
        const cell = this.getCellData();
        return cell?.p ? new RichTextValue(cell.p) : cell?.v;
    }

    /**
     * Returns the value and rich text value for the cells in the range.
     * @returns {Nullable<CellValue | RichTextValue>[][]} A two-dimensional array of value and rich text value
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValueAndRichTextValues());
     * ```
     */
    getValueAndRichTextValues(): Nullable<CellValue | RichTextValue>[][] {
        const dataGrid = this.getCellDatas();
        return dataGrid.map((row) => row.map((data) => data?.p ? new RichTextValue(data.p) : data?.v));
    }

    /**
     * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
     * @returns {string[][]} A two-dimensional array of formulas in string format.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getFormulas());
     * ```
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

    /**
     * Returns true if the cell wrap is enabled for the top left cell of the range.
     * @returns {boolean} True if the cell wrap is enabled
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getWrap());
     * ```
     */
    getWrap(): boolean {
        return this._worksheet.getRange(this._range).getWrap() === BooleanNumber.TRUE;
    }

    /**
     * Returns the text wrapping strategy for the top left cell of the range.
     * @returns {WrapStrategy} The text wrapping strategy
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getWrapStrategy());
     * ```
     */
    getWrapStrategy(): WrapStrategy {
        return this._worksheet.getRange(this._range).getWrapStrategy();
    }

    /**
     * Returns the horizontal alignment for the top left cell of the range.
     * @returns {string} The horizontal alignment
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getHorizontalAlignment());
     * ```
     */
    getHorizontalAlignment(): string {
        return transformCoreHorizontalAlignment(this._worksheet.getRange(this._range).getHorizontalAlignment());
    }

    /**
     * Returns the vertical alignment for the top left cell of the range.
     * @returns {string} The vertical alignment
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getVerticalAlignment());
     * ```
     */
    getVerticalAlignment(): string {
        return transformCoreVerticalAlignment(this._worksheet.getRange(this._range).getVerticalAlignment());
    }

    /**
     * Set custom meta data for first cell in current range.
     * @param {CustomData} data The custom meta data
     * @returns {FRange} This range, for chaining
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setCustomMetaData({ key: 'value' });
     * console.log(fRange.getCustomMetaData());
     * ```
     */
    setCustomMetaData(data: CustomData): FRange {
        return this.setValue({
            custom: data,
        });
    }

    /**
     * Set custom meta data for current range.
     * @param {CustomData[][]} datas The custom meta data
     * @returns {FRange} This range, for chaining
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setCustomMetaDatas([
     *   [{ key: 'value' }, { key: 'value2' }],
     *   [{ key: 'value3' }, { key: 'value4' }],
     * ]);
     * console.log(fRange.getCustomMetaDatas());
     * ```
     */
    setCustomMetaDatas(datas: CustomData[][]): FRange {
        return this.setValues(datas.map((row) => row.map((data) => ({ custom: data }))));
    }

    /**
     * Returns the custom meta data for the cell at the start of this range.
     * @returns {CustomData | null} The custom meta data
     * @example
     * ```
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCustomMetaData());
     * ```
     */
    getCustomMetaData(): CustomData | null {
        const cell = this.getCellData();
        return cell?.custom ?? null;
    }

    /**
     * Returns the custom meta data for the cells in the range.
     * @returns {CustomData[][]} A two-dimensional array of custom meta data
     * @example
     * ```
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCustomMetaDatas());
     * ```
     */
    getCustomMetaDatas(): Nullable<CustomData>[][] {
        const dataGrid = this.getCellDataGrid();
        return dataGrid.map((row) => row.map((data) => data?.custom ?? null));
    }

    /**
     * Sets basic border properties for the current range.
     * @param {BorderType} type The type of border to apply
     * @param {BorderStyleTypes} style The border style
     * @param {string} [color] Optional border color in CSS notation
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setBorder(univerAPI.Enum.BorderType.ALL, univerAPI.Enum.BorderStyleTypes.THIN, '#ff0000');
     * ```
     */
    setBorder(type: BorderType, style: BorderStyleTypes, color?: string): FRange {
        this._commandService.syncExecuteCommand(SetBorderBasicCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [this._range],
            value: {
                type,
                style,
                color,
            },
        } as ISetBorderBasicCommandParams);
        return this;
    }

    // #region editing

    /**
     * Set background color for current range.
     * @param {string} color The background color
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setBackgroundColor('red');
     * ```
     */
    setBackgroundColor(color: string): FRange {
        this._commandService.syncExecuteCommand(SetStyleCommand.id, {
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
        return this;
    }

    /**
     * Set background color for current range.
     * @param {string} color The background color
     * @returns {FRange} This range, for chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setBackground('red');
     * ```
     */
    setBackground(color: string): FRange {
        this.setBackgroundColor(color);
        return this;
    }

    /**
     * Sets the value of the range.
     * @param {CellValue | ICellData} value The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
     * @returns {FRange} This range, for chaining
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('B2');
     * fRange.setValue(123);
     *
     * // or
     * fRange.setValue({ v: 234, s: { bg: { rgb: '#ff0000' } } });
     * ```
     */
    setValue(value: CellValue | ICellData): FRange {
        const realValue = covertCellValue(value);

        if (!realValue) {
            throw new Error('Invalid value');
        }

        this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });

        return this;
    }

    /**
     * Set new value for current cell, first cell in this range.
     * @param {CellValue | ICellData} value  The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
     * @returns {FRange} This range, for chaining
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValueForCell(123);
     *
     * // or
     * fRange.setValueForCell({ v: 234, s: { bg: { rgb: '#ff0000' } } });
     * ```
     */
    setValueForCell(value: CellValue | ICellData): FRange {
        const realValue = covertCellValue(value);

        if (!realValue) {
            throw new Error('Invalid value');
        }

        this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: {
                startColumn: this._range.startColumn,
                startRow: this._range.startRow,
                endColumn: this._range.startColumn,
                endRow: this._range.startRow,
            },
            value: realValue,
        });

        return this;
    }

    /**
     * Set the rich text value for the cell at the start of this range.
     * @param {RichTextValue | IDocumentData} value The rich text value
     * @returns {FRange} The range
     * @example
     * ```
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValue(true));
     *
     * // set the first cell value to 123
     * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } })
     *   .setStyle(0, 1, { bl: 1, cl: { rgb: '#c81e1e' } })
     *   .setStyle(6, 7, { bl: 1, cl: { rgb: '#c81e1e' } });
     * fRange.setRichTextValueForCell(richText);
     * console.log(fRange.getValue(true).toPlainText()); // Hello World
     * ```
     */
    setRichTextValueForCell(value: RichTextValue | IDocumentData): FRange {
        const p = value instanceof RichTextValue ? value.getData() : value;
        const params: ISetRangeValuesCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: {
                startColumn: this._range.startColumn,
                startRow: this._range.startRow,
                endColumn: this._range.startColumn,
                endRow: this._range.startRow,
            },
            value: { p },
        };
        this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
        return this;
    }

    /**
     * Set the rich text value for the cells in the range.
     * @param {RichTextValue[][]} values The rich text value
     * @returns {FRange} The range
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getValue(true));
     *
     * // set the first cell value to 123
     * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } })
     *   .setStyle(0, 1, { bl: 1, cl: { rgb: '#c81e1e' } })
     *   .setStyle(6, 7, { bl: 1, cl: { rgb: '#c81e1e' } });
     * fRange.setRichTextValues([
     *   [richText, richText],
     *   [null, null]
     * ]);
     * console.log(fRange.getValue(true).toPlainText()); // Hello World
     * ```
     */
    setRichTextValues(values: (RichTextValue | IDocumentData)[][]): FRange {
        const cellDatas = values.map((row) => row.map((item) => item && { p: item instanceof RichTextValue ? item.getData() : item }));
        const realValue = covertCellValues(cellDatas, this._range);

        const params: ISetRangeValuesCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        };
        this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
        return this;
    }

    /**
     * Set the cell wrap of the given range.
     * Cells with wrap enabled (the default) resize to display their full content. Cells with wrap disabled display as much as possible in the cell without resizing or running to multiple lines.
     * @param {boolean} isWrapEnabled Whether to enable wrap
     * @returns {FRange} this range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setWrap(true);
     * console.log(fRange.getWrap());
     * ```
     */
    setWrap(isWrapEnabled: boolean): FRange {
        this._commandService.syncExecuteCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: isWrapEnabled ? WrapStrategy.WRAP : WrapStrategy.UNSPECIFIED,
        } as ISetTextWrapCommandParams);

        return this;
    }

    /**
     * Sets the text wrapping strategy for the cells in the range.
     * @param {WrapStrategy} strategy The text wrapping strategy
     * @returns {FRange} this range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setWrapStrategy(univerAPI.Enum.WrapStrategy.WRAP);
     * console.log(fRange.getWrapStrategy());
     * ```
     */
    setWrapStrategy(strategy: WrapStrategy): FRange {
        this._commandService.syncExecuteCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: strategy,
        } as ISetTextWrapCommandParams);

        return this;
    }

    /**
     * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
     * @param {"top" | "middle" | "bottom"} alignment The vertical alignment
     * @returns {FRange} this range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setVerticalAlignment('top');
     * ```
     */
    setVerticalAlignment(alignment: FVerticalAlignment): FRange {
        this._commandService.syncExecuteCommand(SetVerticalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeVerticalAlignment(alignment),
        } as ISetVerticalTextAlignCommandParams);

        return this;
    }

    /**
     * Set the horizontal (left to right) alignment for the given range (left/center/right).
     * @param {"left" | "center" | "normal"} alignment The horizontal alignment
     * @returns {FRange} this range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setHorizontalAlignment('left');
     * ```
     */
    setHorizontalAlignment(alignment: FHorizontalAlignment): FRange {
        this._commandService.syncExecuteCommand(SetHorizontalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeHorizontalAlignment(alignment),
        } as ISetHorizontalTextAlignCommandParams);

        return this;
    }

    /**
     * Sets a different value for each cell in the range. The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats. If a value begins with `=`, it is interpreted as a formula.
     * @param {CellValue[][] | IObjectMatrixPrimitiveType<CellValue> | ICellData[][] | IObjectMatrixPrimitiveType<ICellData>} value The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   [1, { v: 2, s: { bg: { rgb: '#ff0000' } } }],
     *   [3, 4]
     * ]);
     * ```
     */
    setValues(
        value:
            | CellValue[][]
            | IObjectMatrixPrimitiveType<CellValue>
            | ICellData[][]
            | IObjectMatrixPrimitiveType<ICellData>
    ): FRange {
        const realValue = covertCellValues(value, this._range);

        this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });

        return this;
    }

    /**
     * Sets the font weight for the given range (normal/bold),
     * @param {FontWeight|null} fontWeight The font weight, either 'normal' or 'bold'; a null value resets the font weight.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFontWeight('bold');
     * ```
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font style for the given range ('italic' or 'normal').
     * @param {FontStyle|null} fontStyle The font style, either 'italic' or 'normal'; a null value resets the font style.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFontStyle('italic');
     * ```
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font line style of the given range ('underline', 'line-through', or 'none').
     * @param {FontLine|null} fontLine The font line style, either 'underline', 'line-through', or 'none'; a null value resets the font line style.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFontLine('underline');
     * ```
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
     * @param {ITextDecoration|null} value The font underline style of the given ITextDecoration; a null value resets the font underline style
     * @returns {void}
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font strikethrough style of the given ITextDecoration
     * @param {ITextDecoration|null} value The font strikethrough style of the given ITextDecoration; a null value resets the font strikethrough style
     * @returns {void}
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font family, such as "Arial" or "Helvetica".
     * @param {string|null} fontFamily The font family to set; a null value resets the font family.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFontFamily('Arial');
     * ```
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font size, with the size being the point size to use.
     * @param {number|null} size A font size in point size. A null value resets the font size.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFontSize(24);
     * ```
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font color in CSS notation (such as '#ffffff' or 'white').
     * @param {string|null} color The font color in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFontColor('#ff0000');
     * ```
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

        this._commandService.syncExecuteCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    // #endregion editing

    //#region Merge cell

    /**
     * Merge cells in a range into one merged cell
     * @param {boolean} [defaultMerge] - If true, only the value in the upper left cell is retained.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.merge();
     * console.log(fRange.isMerged());
     * ```
     */
    merge(defaultMerge: boolean = true): FRange {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        addMergeCellsUtil(this._injector, unitId, subUnitId, [this._range], defaultMerge);

        return this;
    }

    /**
     * Merges cells in a range horizontally.
     * @param {boolean} [defaultMerge] - If true, only the value in the upper left cell is retained.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * // Assume the active sheet is a new sheet with no merged cells.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.mergeAcross();
     * // There will be two merged cells. A1:B1 and A2:B2.
     * const mergeData = fWorksheet.getMergeData();
     * mergeData.forEach((item) => {
     *   console.log(item.getA1Notation());
     * });
     * ```
     */
    mergeAcross(defaultMerge: boolean = true): FRange {
        const ranges = getAddMergeMutationRangeByType([this._range], Dimension.ROWS);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        addMergeCellsUtil(this._injector, unitId, subUnitId, ranges, defaultMerge);

        return this;
    }

    /**
     * Merges cells in a range vertically.
     * @param {boolean} [defaultMerge] - If true, only the value in the upper left cell is retained.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * // Assume the active sheet is a new sheet with no merged cells.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.mergeVertically();
     * // There will be two merged cells. A1:A2 and B1:B2.
     * const mergeData = fWorksheet.getMergeData();
     * mergeData.forEach((item) => {
     *   console.log(item.getA1Notation());
     * });
     * ```
     */
    mergeVertically(defaultMerge: boolean = true): FRange {
        const ranges = getAddMergeMutationRangeByType([this._range], Dimension.COLUMNS);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        addMergeCellsUtil(this._injector, unitId, subUnitId, ranges, defaultMerge);

        return this;
    }

    /**
     * Returns true if cells in the current range overlap a merged cell.
     * @returns {boolean} is overlap with a merged cell
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.merge();
     * const anchor = fWorksheet.getRange('A1');
     * console.log(anchor.isPartOfMerge()); // true
     * ```
     */
    isPartOfMerge(): boolean {
        const { startRow, startColumn, endRow, endColumn } = this._range;
        return this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn).length > 0;
    }

    /**
     * Break all horizontally- or vertically-merged cells contained within the range list into individual cells again.
     * @returns {FRange} This range, for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.merge();
     * const anchor = fWorksheet.getRange('A1');
     * console.log(anchor.isPartOfMerge()); // true
     * fRange.breakApart();
     * console.log(anchor.isPartOfMerge()); // false
     * ```
     */
    breakApart(): FRange {
        this._commandService.syncExecuteCommand(RemoveWorksheetMergeCommand.id, { ranges: [this._range] });
        return this;
    }

    //#endregion

    /**
     * Iterate cells in this range. Merged cells will be respected.
     * @param {Function} callback the callback function to be called for each cell in the range
     * @param {number} callback.row the row number of the cell
     * @param {number} callback.col the column number of the cell
     * @param {ICellData} callback.cell the cell data
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.forEach((row, col, cell) => {
     *   console.log(row, col, cell);
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
     * @param {boolean} [withSheet] - If true, the sheet name is included in the A1 notation.
     * @returns {string} The A1 notation of the range.
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getA1Notation()); // A1:B2
     * ```
     */
    getA1Notation(withSheet?: boolean): string {
        return withSheet ? serializeRangeWithSheet(this._worksheet.getName(), this._range) : serializeRange(this._range);
    }

    /**
     * Sets the specified range as the active range, with the top left cell in the range as the current cell.
     * @returns {FRange}  This range, for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.activate(); // the active cell will be A1
     * ```
     */
    activate(): FRange {
        const fWorkbook = this._injector.createInstance(FWorkbook, this._workbook);
        fWorkbook.setActiveRange(this);
        return this;
    }

    /**
     * Sets the specified cell as the current cell.
     * If the specified cell is present in an existing range, then that range becomes the active range with the cell as the current cell.
     * If the specified cell is not part of an existing range, then a new range is created with the cell as the active range and the current cell.
     * @returns {FRange}  This range, for chaining.
     * @description If the range is not a single cell, an error will be thrown.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.activate();
     * const cell = fWorksheet.getRange('B2');
     * cell.activateAsCurrentCell(); // the active cell will be B2
     * console.log(fWorksheet.getActiveRange().getA1Notation()); // B2
     * ```
     */
    activateAsCurrentCell(): FRange {
        const mergeInfo = this._worksheet.getMergedCell(this._range.startRow, this._range.startColumn);
        // the range is a merge cell or single cell
        const valid = (mergeInfo && Rectangle.equals(mergeInfo, this._range)) ||
            (!mergeInfo && this._range.startRow === this._range.endRow && this._range.startColumn === this._range.endColumn);

        if (valid) {
            return this.activate();
        } else {
            throw new Error('The range is not a single cell');
        }
    }

    /**
     * Splits a column of text into multiple columns based on an auto-detected delimiter.
     * @param {boolean} [treatMultipleDelimitersAsOne] Whether to treat multiple continuous delimiters as one. The default value is false.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // A1:A3 has following values:
     * //  A      | B | C
     * //  1,2,3  |   |
     * //  4,,5,6 |   |
     * const fRange = fWorksheet.getRange('A1:A3');
     * fRange.setValues([
     *   ['A', 'B', 'C'],
     *   ['1,2,3', null, null],
     *   ['4,,5,6', null, null]
     * ]);
     *
     * // After calling splitTextToColumns(true), the range will be:
     * //  A |   |
     * //  1 | 2 | 3
     * //  4 | 5 | 6
     * fRange.splitTextToColumns(true);
     *
     * // After calling splitTextToColumns(false), the range will be:
     * //  A |   |   |
     * //  1 | 2 | 3 |
     * //  4 |   | 5 | 6
     * fRange.splitTextToColumns(false);
     * ```
     */
    splitTextToColumns(treatMultipleDelimitersAsOne?: boolean): void;
    /**
     * Splits a column of text into multiple columns based on a specified delimiter.
     * @param {boolean} [treatMultipleDelimitersAsOne] Whether to treat multiple continuous delimiters as one. The default value is false.
     * @param {SplitDelimiterEnum} [delimiter] The delimiter to use to split the text. The default delimiter is Tab(1)、Comma(2)、Semicolon(4)、Space(8)、Custom(16).A delimiter like 6 (SplitDelimiterEnum.Comma|SplitDelimiterEnum.Semicolon) means using Comma and Semicolon to split the text.
     * @example Show how to split text to columns with combined delimiter. The bit operations are used to combine the delimiters.
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // A1:A3 has following values:
     * //     A   | B | C
     * //  1;;2;3 |   |
     * //  1;,2;3 |   |
     * const fRange = fWorksheet.getRange('A1:A3');
     * fRange.setValues([
     *   ['A', 'B', 'C'],
     *   ['1;;2;3', null, null],
     *   ['1;,2;3', null, null]
     * ]);
     *
     * // After calling splitTextToColumns(false, univerAPI.Enum.SplitDelimiterType.Semicolon|univerAPI.Enum.SplitDelimiterType.Comma), the range will be:
     * //  A |   |   |
     * //  1 |   | 2 | 3
     * //  1 |   | 2 | 3
     * fRange.splitTextToColumns(false, univerAPI.Enum.SplitDelimiterType.Semicolon|univerAPI.Enum.SplitDelimiterType.Comma);
     *
     * // After calling splitTextToColumns(true, univerAPI.Enum.SplitDelimiterType.Semicolon|univerAPI.Enum.SplitDelimiterType.Comma), the range will be:
     * //  A |   |
     * //  1 | 2 | 3
     * //  1 | 2 | 3
     * fRange.splitTextToColumns(true, univerAPI.Enum.SplitDelimiterType.Semicolon|univerAPI.Enum.SplitDelimiterType.Comma);
     * ```
     */
    splitTextToColumns(treatMultipleDelimitersAsOne?: boolean, delimiter?: SplitDelimiterEnum): void;
    /**
     * Splits a column of text into multiple columns based on a custom specified delimiter.
     * @param {boolean} [treatMultipleDelimitersAsOne] Whether to treat multiple continuous delimiters as one. The default value is false.
     * @param {SplitDelimiterEnum} [delimiter] The delimiter to use to split the text. The default delimiter is Tab(1)、Comma(2)、Semicolon(4)、Space(8)、Custom(16).A delimiter like 6 (SplitDelimiterEnum.Comma|SplitDelimiterEnum.Semicolon) means using Comma and Semicolon to split the text.
     * @param {string} [customDelimiter] The custom delimiter to split the text. An error will be thrown if custom delimiter is set but the customDelimiter is not a character.
     * @example Show how to split text to columns with custom delimiter
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // A1:A3 has following values:
     * //     A   | B | C
     * //  1#2#3  |   |
     * //  4##5#6 |   |
     * const fRange = fWorksheet.getRange('A1:A3');
     * fRange.setValues([
     *   ['A', 'B', 'C'],
     *   ['1#2#3', null, null],
     *   ['4##5#6', null, null]
     * ]);
     *
     * // After calling splitTextToColumns(false, univerAPI.Enum.SplitDelimiterType.Custom, '#'), the range will be:
     * //  A |   |   |
     * //  1 | 2 | 3 |
     * //  4 |   | 5 | 6
     * fRange.splitTextToColumns(false, univerAPI.Enum.SplitDelimiterType.Custom, '#');
     *
     * // After calling splitTextToColumns(true, univerAPI.Enum.SplitDelimiterType.Custom, '#'), the range will be:
     * //  A |   |
     * //  1 | 2 | 3
     * //  4 | 5 | 6
     * fRange.splitTextToColumns(true, univerAPI.Enum.SplitDelimiterType.Custom, '#');
     * ```
     */
    splitTextToColumns(treatMultipleDelimitersAsOne?: boolean, delimiter?: SplitDelimiterEnum, customDelimiter?: string): void {
        this._commandService.syncExecuteCommand(SplitTextToColumnsCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            delimiter,
            customDelimiter,
            treatMultipleDelimitersAsOne,
        });
    }

    /**
     * Set the theme style for the range.
     * @param {string|undefined} themeName The name of the theme style to apply.If a undefined value is passed, the theme style will be removed if it exist.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:E20');
     * fRange.useThemeStyle('default');
     * ```
     */
    useThemeStyle(themeName: string | undefined): void {
        if (themeName === null || themeName === undefined) {
            const usedThemeName = this.getUsedThemeStyle();
            if (usedThemeName) {
                this.removeThemeStyle(usedThemeName);
            }
        } else {
            this._commandService.syncExecuteCommand(SetWorksheetRangeThemeStyleCommand.id, {
                unitId: this._workbook.getUnitId(),
                subUnitId: this._worksheet.getSheetId(),
                range: this._range,
                themeName,
            });
        }
    }

    /**
     * Remove the theme style for the range.
     * @param {string} themeName The name of the theme style to remove.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:E20');
     * fRange.removeThemeStyle('default');
     * ```
     */
    removeThemeStyle(themeName: string): void {
        this._commandService.syncExecuteCommand(DeleteWorksheetRangeThemeStyleCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            themeName,
        });
    }

    /**
     * Gets the theme style applied to the range.
     * @returns {string | undefined} The name of the theme style applied to the range or not exist.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:E20');
     * console.log(fRange.getUsedThemeStyle()); // undefined
     * fRange.useThemeStyle('default');
     * console.log(fRange.getUsedThemeStyle()); // 'default'
     * ```
     */
    getUsedThemeStyle(): string | undefined {
        return this._injector.get(SheetRangeThemeService).getAppliedRangeThemeStyle({
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
        });
    }
}
