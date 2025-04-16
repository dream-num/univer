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

import type { AbsoluteRefType, BorderStyleTypes, BorderType, CellValue, CustomData, ICellData, IColorStyle, IDocumentData, IObjectMatrixPrimitiveType, IRange, IStyleData, ITextDecoration, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISetBorderBasicCommandParams, ISetHorizontalTextAlignCommandParams, ISetRangeValuesCommandParams, ISetSelectionsOperationParams, ISetStyleCommandParams, ISetTextRotationCommandParams, ISetTextWrapCommandParams, ISetVerticalTextAlignCommandParams, IStyleTypeValue, SplitDelimiterEnum } from '@univerjs/sheets';
import type { IFacadeClearOptions } from './f-worksheet';
import type { FHorizontalAlignment, FVerticalAlignment } from './utils';
import { BooleanNumber, DEFAULT_STYLES, Dimension, ICommandService, Inject, Injector, isNullCell, Rectangle, RichTextValue, TextStyleValue, WrapStrategy } from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { FormulaDataModel, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { addMergeCellsUtil, ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, DeleteWorksheetRangeThemeStyleCommand, getAddMergeMutationRangeByType, getPrimaryForRange, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, RemoveWorksheetMergeCommand, SetBorderBasicCommand, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetSelectionsOperation, SetStyleCommand, SetTextRotationCommand, SetTextWrapCommand, SetVerticalTextAlignCommand, SetWorksheetRangeThemeStyleCommand, SheetRangeThemeService, SplitTextToColumnsCommand } from '@univerjs/sheets';
import { FWorkbook } from './f-workbook';
import { covertCellValue, covertCellValues, transformCoreHorizontalAlignment, transformCoreVerticalAlignment, transformFacadeHorizontalAlignment, transformFacadeVerticalAlignment } from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

/**
 * The type of the style to get.
 *
 * - `row`: get composed style of row, col and default worksheet style. Row style has the highest priority, then col style.
 * - `col`: get composed style of col, row and default worksheet style. Col style has the highest priority, then row style.
 * - `cell`: get style of cell without merging row style, col style and default worksheet style.
 */
export type GetStyleType = 'row' | 'col' | 'cell';

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
     * Gets the starting row index of the range. index starts at 0.
     * @returns {number} The starting row index of the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getRow()); // 0
     * ```
     */
    getRow(): number {
        return this._range.startRow;
    }

    /**
     * Gets the ending row index of the range. index starts at 0.
     * @returns {number} The ending row index of the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getLastRow()); // 1
     * ```
     */
    getLastRow(): number {
        return this._range.endRow;
    }

    /**
     * Gets the starting column index of the range. index starts at 0.
     * @returns {number} The starting column index of the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getColumn()); // 0
     * ```
     */
    getColumn(): number {
        return this._range.startColumn;
    }

    /**
     * Gets the ending column index of the range. index starts at 0.
     * @returns {number} The ending column index of the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getLastColumn()); // 1
     * ```
     */
    getLastColumn(): number {
        return this._range.endColumn;
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
     * Return first cell style data in this range. Please note that if there are row styles, col styles and (or)
     * worksheet style, they will be merged into the cell style. You can use `type` to specify the type of the style to get.
     *
     * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
     * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
     * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
     * Default is 'row'.
     *
     * @returns {IStyleData | null} The cell style data
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellStyleData());
     * ```
     */
    getCellStyleData(type: GetStyleType = 'row'): IStyleData | null {
        if (type !== 'cell') {
            return this._worksheet.getComposedCellStyle(this._range.startRow, this._range.startColumn, type === 'row');
        }

        return this._worksheet.getCellStyle(this._range.startRow, this._range.startColumn) as IStyleData | null;
    }

    /**
     * Get the font family of the cell.
     *
     * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
     * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
     * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
     * Default is 'row'.
     *
     * @returns {string | null} The font family of the cell
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getFontFamily());
     * ```
     */
    getFontFamily(type: GetStyleType = 'row'): string | null {
        return this.getCellStyleData(type)?.ff ?? null;
    }

    /**
     * Get the font size of the cell.
     *
     * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
     * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
     * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
     * Default is 'row'.
     *
     * @returns {number | null} The font size of the cell
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getFontSize());
     * ```
     */
    getFontSize(type: GetStyleType = 'row'): number | null {
        return this.getCellStyleData(type)?.fs ?? null;
    }

    /**
     * Return first cell style in this range.
     *
     * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
     * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
     * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
     * Default is 'row'.
     *
     * @returns {TextStyleValue | null} The cell style
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellStyle());
     * ```
     */
    getCellStyle(type: GetStyleType = 'row'): TextStyleValue | null {
        const data = this.getCellStyleData(type);
        return data ? TextStyleValue.create(data) : null;
    }

    /**
     * Returns the cell styles for the cells in the range.
     *
     * @param {GetStyleType} type - The type of the style to get. 'row' means get the composed style of row, col and
     * default worksheet style. 'col' means get the composed style of col, row and default worksheet style.
     * 'cell' means get the style of cell without merging row style, col style and default worksheet style.
     * Default is 'row'.
     *
     * @returns {Array<Array<TextStyleValue | null>>} A two-dimensional array of cell styles.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getCellStyles());
     * ```
     */
    getCellStyles(type: GetStyleType = 'row'): Array<Array<TextStyleValue | null>> {
        const cells = this.getCellDatas();
        return cells.map((row, rowIndex) => row.map((cell, colIndex) => {
            if (!cell) return null;
            const style = type !== 'cell'
                // NOTE: this has potential performance issue. Because in the implementation of getComposedCellStyle,
                // it will get default worksheet style, row styles and col styles, which can be cached.
                ? this._worksheet.getComposedCellStyle(rowIndex + this._range.startRow, colIndex + this._range.startColumn, type === 'row')
                : this._worksheet.getCellStyle(rowIndex + this._range.startRow, colIndex + this._range.startColumn);
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
     * Returns the raw value of the top-left cell in the range. Empty cells return `null`.
     * @returns {Nullable<CellValue>} The raw value of the cell. Returns `null` if the cell is empty.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValueForCell({
     *   v: 0.2,
     *   s: {
     *     n: {
     *       pattern: '0%',
     *     },
     *   },
     * });
     * console.log(fRange.getRawValue()); // 0.2
     * ```
     */
    getRawValue(): Nullable<CellValue> {
        const cell = this._worksheet.getCellMatrix().getValue(this._range.startRow, this._range.startColumn);
        if (cell?.p && cell.p.body?.dataStream) return cell.p.body.dataStream;
        if (cell?.v) return cell.v;
        return null;
    }

    /**
     * Returns the displayed value of the top-left cell in the range. The value is a String. Empty cells return an empty string.
     * @returns {string} The displayed value of the cell. Returns an empty string if the cell is empty.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValueForCell({
     *   v: 0.2,
     *   s: {
     *     n: {
     *       pattern: '0%',
     *     },
     *   },
     * });
     * console.log(fRange.getDisplayValue()); // 20%
     * ```
     */
    getDisplayValue(): string {
        const cell = this._worksheet.getCell(this._range.startRow, this._range.startColumn);
        if (cell?.p && cell.p.body?.dataStream) return cell.p.body.dataStream;
        if (cell?.v) return String(cell.v);
        return '';
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
     * Returns a two-dimensional array of the range raw values. Empty cells return `null`.
     * @returns {Array<Array<Nullable<CellValue>>>} The raw value of the cell. Returns `null` if the cell is empty.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   [
     *     {
     *       v: 0.2,
     *       s: {
     *         n: {
     *           pattern: '0%',
     *         },
     *       },
     *     },
     *     {
     *       v: 45658,
     *       s: {
     *         n: {
     *           pattern: 'yyyy-mm-dd',
     *         },
     *       },
     *     }
     *   ],
     *   [
     *     {
     *       v: 1234.567,
     *       s: {
     *         n: {
     *           pattern: '#,##0.00',
     *         }
     *       }
     *     },
     *     null,
     *   ],
     * ]);
     * console.log(fRange.getRawValues()); // [[0.2, 45658], [1234.567, null]]
     * ```
     */
    getRawValues(): Array<Array<Nullable<CellValue>>> {
        const cellMatrix = this._worksheet.getCellMatrix();
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const values: Array<Array<Nullable<CellValue>>> = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: Array<Nullable<CellValue>> = [];

            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellMatrix.getValue(r, c);
                if (cell?.p && cell.p.body?.dataStream) {
                    row.push(cell.p.body.dataStream);
                } else if (cell?.v) {
                    row.push(cell.v);
                } else {
                    row.push(null);
                }
            }

            values.push(row);
        }

        return values;
    }

    /**
     * Returns a two-dimensional array of the range displayed values. Empty cells return an empty string.
     * @returns {string[][]} A two-dimensional array of values.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   [
     *     {
     *       v: 0.2,
     *       s: {
     *         n: {
     *           pattern: '0%',
     *         },
     *       },
     *     },
     *     {
     *       v: 45658,
     *       s: {
     *         n: {
     *           pattern: 'yyyy-mm-dd',
     *         },
     *       },
     *     }
     *   ],
     *   [
     *     {
     *       v: 1234.567,
     *       s: {
     *         n: {
     *           pattern: '#,##0.00',
     *         }
     *       }
     *     },
     *     null,
     *   ],
     * ]);
     * console.log(fRange.getDisplayValues()); // [['20%', '2025-01-01'], ['1,234.57', '']]
     * ```
     */
    getDisplayValues(): string[][] {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const values: string[][] = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: string[] = [];

            for (let c = startColumn; c <= endColumn; c++) {
                const cell = this._worksheet.getCell(r, c);

                if (cell?.p && cell.p.body?.dataStream) {
                    row.push(cell.p.body.dataStream);
                } else if (cell?.v) {
                    row.push(String(cell.v));
                } else {
                    row.push('');
                }
            }

            values.push(row);
        }

        return values;
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
     * Returns the formula (A1 notation) of the top-left cell in the range, or an empty string if the cell is empty or doesn't contain a formula.
     * @returns {string} The formula for the cell.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getFormula());
     * ```
     */
    getFormula(): string {
        return this._formulaDataModel.getFormulaStringByCell(
            this._range.startRow,
            this._range.startColumn,
            this._worksheet.getSheetId(),
            this._workbook.getUnitId()
        ) ?? '';
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
     * Gets whether text wrapping is enabled for top-left cell in the range.
     * @returns {boolean} whether text wrapping is enabled for the cell.
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
     * Gets whether text wrapping is enabled for cells in the range.
     * @returns {boolean[][]} A two-dimensional array of whether text wrapping is enabled for each cell in the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getWraps());
     */
    getWraps(): boolean[][] {
        const cells = this.getCellDatas();
        const styles = this._workbook.getStyles();
        return cells.map((row) => row.map((cell) => styles.getStyleByCell(cell)?.tb === WrapStrategy.WRAP));
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
     * Returns the horizontal alignment of the text (left/center/right) of the top-left cell in the range.
     * @returns {string} The horizontal alignment of the text in the cell.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getHorizontalAlignment());
     * ```
     */
    getHorizontalAlignment(): string {
        const coreHorizontalAlignment = this._worksheet.getRange(this._range).getHorizontalAlignment();
        return transformCoreHorizontalAlignment(coreHorizontalAlignment);
    }

    /**
     * Returns the horizontal alignments of the cells in the range.
     * @returns {string[][]} A two-dimensional array of horizontal alignments of text associated with cells in the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getHorizontalAlignments());
     * ```
     */
    getHorizontalAlignments(): string[][] {
        const coreHorizontalAlignments = this._worksheet.getRange(this._range).getHorizontalAlignments();
        return coreHorizontalAlignments.map((row) => row.map((alignment) => transformCoreHorizontalAlignment(alignment)));
    }

    /**
     * Returns the vertical alignment (top/middle/bottom) of the top-left cell in the range.
     * @returns {string} The vertical alignment of the text in the cell.
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
     * Returns the vertical alignments of the cells in the range.
     * @returns {string[][]} A two-dimensional array of vertical alignments of text associated with cells in the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getVerticalAlignments());
     * ```
     */
    getVerticalAlignments(): string[][] {
        const coreVerticalAlignments = this._worksheet.getRange(this._range).getVerticalAlignments();
        return coreVerticalAlignments.map((row) => row.map((alignment) => transformCoreVerticalAlignment(alignment)));
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
     * Returns the background color of the top-left cell in the range.
     * @returns {string} The color code of the background.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getBackground());
     * ```
     */
    getBackground(): string {
        const style = this.getCellStyle();
        return style?.background?.rgb ?? DEFAULT_STYLES.bg.rgb;
    }

    /**
     * Returns the background colors of the cells in the range.
     * @returns {string[][]} A two-dimensional array of color codes of the backgrounds.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getBackgrounds());
     * ```
     */
    getBackgrounds(): string[][] {
        const styles = this.getCellStyles();
        return styles.map((row) => row.map((style) => style?.background?.rgb ?? DEFAULT_STYLES.bg.rgb));
    }

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
     * Set rotation for text in current range.
     * @param {number} rotation - The rotation angle in degrees
     * @returns This range, for chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setTextRotation(45);
     * ```
     */
    setTextRotation(rotation: number): FRange {
        this._commandService.syncExecuteCommand(SetTextRotationCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: rotation,
        } as ISetTextRotationCommandParams);
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
     * // Set A1 cell value to rich text
     * const richText = univerAPI.newRichText()
     *   .insertText('Hello World')
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
     * // Set A1:B2 cell value to rich text
     * const richText = univerAPI.newRichText()
     *   .insertText('Hello World')
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
     * @param {AbsoluteRefType} [startAbsoluteRefType] - The absolute reference type for the start cell.
     * @param {AbsoluteRefType} [endAbsoluteRefType] - The absolute reference type for the end cell.
     * @returns {string} The A1 notation of the range.
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // By default, the A1 notation is returned without the sheet name and without absolute reference types.
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getA1Notation()); // A1:B2
     *
     * // By setting withSheet to true, the sheet name is included in the A1 notation.
     * fWorksheet.setName('Sheet1');
     * console.log(fRange.getA1Notation(true)); // Sheet1!A1:B2
     *
     * // By setting startAbsoluteRefType, the absolute reference type for the start cell is included in the A1 notation.
     * console.log(fRange.getA1Notation(false, univerAPI.Enum.AbsoluteRefType.ROW)); // A$1:B2
     * console.log(fRange.getA1Notation(false, univerAPI.Enum.AbsoluteRefType.COLUMN)); // $A1:B2
     * console.log(fRange.getA1Notation(false, univerAPI.Enum.AbsoluteRefType.ALL)); // $A$1:B2
     *
     * // By setting endAbsoluteRefType, the absolute reference type for the end cell is included in the A1 notation.
     * console.log(fRange.getA1Notation(false, null, univerAPI.Enum.AbsoluteRefType.ROW)); // A1:B$2
     * console.log(fRange.getA1Notation(false, null, univerAPI.Enum.AbsoluteRefType.COLUMN)); // A1:$B2
     * console.log(fRange.getA1Notation(false, null, univerAPI.Enum.AbsoluteRefType.ALL)); // A1:$B$2
     *
     * // By setting all parameters example
     * console.log(fRange.getA1Notation(true, univerAPI.Enum.AbsoluteRefType.ALL, univerAPI.Enum.AbsoluteRefType.ALL)); // Sheet1!$A$1:$B$2
     * ```
     */
    getA1Notation(withSheet?: boolean, startAbsoluteRefType?: AbsoluteRefType, endAbsoluteRefType?: AbsoluteRefType): string {
        const range = {
            ...this._range,
            startAbsoluteRefType,
            endAbsoluteRefType,
        };

        return withSheet ? serializeRangeWithSheet(this._worksheet.getName(), range) : serializeRange(range);
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
     *
     * // Set the range A1:B2 as the active range, default active cell is A1
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.activate();
     * console.log(fWorksheet.getActiveRange().getA1Notation()); // A1:B2
     * console.log(fWorksheet.getActiveCell().getA1Notation()); // A1
     *
     * // Set the cell B2 as the active cell
     * // Because B2 is in the active range A1:B2, the active range will not change, and the active cell will be changed to B2
     * const cell = fWorksheet.getRange('B2');
     * cell.activateAsCurrentCell();
     * console.log(fWorksheet.getActiveRange().getA1Notation()); // A1:B2
     * console.log(fWorksheet.getActiveCell().getA1Notation()); // B2
     *
     * // Set the cell C3 as the active cell
     * // Because C3 is not in the active range A1:B2, a new active range C3:C3 will be created, and the active cell will be changed to C3
     * const cell2 = fWorksheet.getRange('C3');
     * cell2.activateAsCurrentCell();
     * console.log(fWorksheet.getActiveRange().getA1Notation()); // C3:C3
     * console.log(fWorksheet.getActiveCell().getA1Notation()); // C3
     * ```
     */
    activateAsCurrentCell(): FRange {
        const mergeInfo = this._worksheet.getMergedCell(this._range.startRow, this._range.startColumn);
        // the range is a merge cell or single cell
        const valid = (mergeInfo && Rectangle.equals(mergeInfo, this._range)) ||
            (!mergeInfo && this._range.startRow === this._range.endRow && this._range.startColumn === this._range.endColumn);

        if (valid) {
            const fWorkbook = this._injector.createInstance(FWorkbook, this._workbook);
            const activeRange = fWorkbook.getActiveRange();

            if (!activeRange || activeRange.getUnitId() !== this.getUnitId() || activeRange.getSheetId() !== this.getSheetId()) {
                return this.activate();
            }

            if (Rectangle.contains(activeRange.getRange(), this._range)) {
                const setSelectionOperationParams: ISetSelectionsOperationParams = {
                    unitId: this.getUnitId(),
                    subUnitId: this.getSheetId(),
                    selections: [
                        {
                            range: activeRange.getRange(),
                            primary: getPrimaryForRange(this.getRange(), this._worksheet),
                            style: null,
                        },
                    ],
                };

                this._commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);

                return this;
            }

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
     * //    A    |
     * //  1,2,3  |
     * //  4,,5,6 |
     * const fRange = fWorksheet.getRange('A1:A3');
     * fRange.setValues([
     *   ['A'],
     *   ['1,2,3'],
     *   ['4,,5,6']
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
     * //     A   |
     * //  1;;2;3 |
     * //  1;,2;3 |
     * const fRange = fWorksheet.getRange('A1:A3');
     * fRange.setValues([
     *   ['A'],
     *   ['1;;2;3'],
     *   ['1;,2;3']
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
     * //     A   |
     * //  1#2#3  |
     * //  4##5#6 |
     * const fRange = fWorksheet.getRange('A1:A3');
     * fRange.setValues([
     *   ['A'],
     *   ['1#2#3'],
     *   ['4##5#6']
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

    /**
     * Clears content and formatting information of the range. Or Optionally clears only the contents or only the formatting.
     * @param {IFacadeClearOptions} [options] - Options for clearing the range. If not provided, the contents and formatting are cleared both.
     * @param {boolean} [options.contentsOnly] - If true, the contents of the range are cleared. If false, the contents and formatting are cleared. Default is false.
     * @param {boolean} [options.formatOnly] - If true, the formatting of the range is cleared. If false, the contents and formatting are cleared. Default is false.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange('A1:D10');
     *
     * // clear the content and format of the range A1:D10
     * fRange.clear();
     *
     * // clear the content only of the range A1:D10
     * fRange.clear({ contentsOnly: true });
     * ```
     */
    clear(options?: IFacadeClearOptions): FRange {
        if (options && options.contentsOnly && !options.formatOnly) {
            return this.clearContent();
        }

        if (options && options.formatOnly && !options.contentsOnly) {
            return this.clearFormat();
        }

        this._commandService.syncExecuteCommand(ClearSelectionAllCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [this._range],
            options,
        });
        return this;
    }

    /**
     * Clears content of the range, while preserving formatting information.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange('A1:D10');
     *
     * // clear the content only of the range A1:D10
     * fRange.clearContent();
     * ```
     */
    clearContent(): FRange {
        this._commandService.syncExecuteCommand(ClearSelectionContentCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [this._range],
        });
        return this;
    }

    /**
     * Clears formatting information of the range, while preserving contents.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorkSheet = fWorkbook.getActiveSheet();
     * const fRange = fWorkSheet.getRange('A1:D10');
     * // clear the format only of the range A1:D10
     * fRange.clearFormat();
     * ```
     */
    clearFormat(): FRange {
        this._commandService.syncExecuteCommand(ClearSelectionFormatCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [this._range],
        });
        return this;
    }

    /**
     * Inserts empty cells into this range. Existing data in the sheet along the provided dimension is shifted away from the inserted range.
     * @param {Dimension} shiftDimension - The dimension along which to shift existing data.
     * @example
     * ```ts
     * // Assume the active sheet empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const values = [
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     * ];
     *
     * // Set the range A1:D5 with some values, the range A1:D5 will be:
     * // 1 | 2 | 3 | 4
     * // 2 | 3 | 4 | 5
     * // 3 | 4 | 5 | 6
     * // 4 | 5 | 6 | 7
     * // 5 | 6 | 7 | 8
     * const fRange = fWorksheet.getRange('A1:D5');
     * fRange.setValues(values);
     * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
     *
     * // Insert the empty cells into the range A1:B2 along the columns dimension, the range A1:D5 will be:
     * //   |   | 1 | 2
     * //   |   | 2 | 3
     * // 3 | 4 | 5 | 6
     * // 4 | 5 | 6 | 7
     * // 5 | 6 | 7 | 8
     * const fRange2 = fWorksheet.getRange('A1:B2');
     * fRange2.insertCells(univerAPI.Enum.Dimension.COLUMNS);
     * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[null, null, 1, 2], [null, null, 2, 3], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
     *
     * // Set the range A1:D5 values again, the range A1:D5 will be:
     * // 1 | 2 | 3 | 4
     * // 2 | 3 | 4 | 5
     * // 3 | 4 | 5 | 6
     * // 4 | 5 | 6 | 7
     * // 5 | 6 | 7 | 8
     * fRange.setValues(values);
     *
     * // Insert the empty cells into the range A1:B2 along the rows dimension, the range A1:D5 will be:
     * //   |   | 3 | 4
     * //   |   | 4 | 5
     * // 1 | 2 | 5 | 6
     * // 2 | 3 | 6 | 7
     * // 3 | 4 | 7 | 8
     * const fRange3 = fWorksheet.getRange('A1:B2');
     * fRange3.insertCells(univerAPI.Enum.Dimension.ROWS);
     * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[null, null, 3, 4], [null, null, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7], [3, 4, 7, 8]]
     * ```
     */
    insertCells(shiftDimension: Dimension): void {
        if (shiftDimension === Dimension.ROWS) {
            this._commandService.executeCommand(InsertRangeMoveDownCommand.id, {
                range: this._range,
            });
        } else {
            this._commandService.executeCommand(InsertRangeMoveRightCommand.id, {
                range: this._range,
            });
        }
    }

    /**
     * Deletes this range of cells. Existing data in the sheet along the provided dimension is shifted towards the deleted range.
     * @param {Dimension} shiftDimension - The dimension along which to shift existing data.
     * @example
     * ```ts
     * // Assume the active sheet empty sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const values = [
     *   [1, 2, 3, 4],
     *   [2, 3, 4, 5],
     *   [3, 4, 5, 6],
     *   [4, 5, 6, 7],
     *   [5, 6, 7, 8],
     * ];
     *
     * // Set the range A1:D5 with some values, the range A1:D5 will be:
     * // 1 | 2 | 3 | 4
     * // 2 | 3 | 4 | 5
     * // 3 | 4 | 5 | 6
     * // 4 | 5 | 6 | 7
     * // 5 | 6 | 7 | 8
     * const fRange = fWorksheet.getRange('A1:D5');
     * fRange.setValues(values);
     * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
     *
     * // Delete the range A1:B2 along the columns dimension, the range A1:D5 will be:
     * // 3 | 4 |   |
     * // 4 | 5 |   |
     * // 3 | 4 | 5 | 6
     * // 4 | 5 | 6 | 7
     * // 5 | 6 | 7 | 8
     * const fRange2 = fWorksheet.getRange('A1:B2');
     * fRange2.deleteCells(univerAPI.Enum.Dimension.COLUMNS);
     * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[3, 4, null, null], [4, 5, null, null], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8]]
     *
     * // Set the range A1:D5 values again, the range A1:D5 will be:
     * // 1 | 2 | 3 | 4
     * // 2 | 3 | 4 | 5
     * // 3 | 4 | 5 | 6
     * // 4 | 5 | 6 | 7
     * // 5 | 6 | 7 | 8
     * fRange.setValues(values);
     *
     * // Delete the range A1:B2 along the rows dimension, the range A1:D5 will be:
     * // 3 | 4 | 3 | 4
     * // 4 | 5 | 4 | 5
     * // 5 | 6 | 5 | 6
     * //   |   | 6 | 7
     * //   |   | 7 | 8
     * const fRange3 = fWorksheet.getRange('A1:B2');
     * fRange3.deleteCells(univerAPI.Enum.Dimension.ROWS);
     * console.log(fWorksheet.getRange('A1:D5').getValues()); // [[3, 4, 3, 4], [4, 5, 4, 5], [5, 6, 5, 6], [null, null, 6, 7], [null, null, 7, 8]]
     * ```
     */
    deleteCells(shiftDimension: Dimension): void {
        if (shiftDimension === Dimension.ROWS) {
            this._commandService.executeCommand(DeleteRangeMoveUpCommand.id, {
                range: this._range,
            });
        } else {
            this._commandService.executeCommand(DeleteRangeMoveLeftCommand.id, {
                range: this._range,
            });
        }
    }

    /**
     * Returns a copy of the range expanded `Direction.UP` and `Direction.DOWN` if the specified dimension is `Dimension.ROWS`, or `Direction.NEXT` and `Direction.PREVIOUS` if the dimension is `Dimension.COLUMNS`.
     * The expansion of the range is based on detecting data next to the range that is organized like a table.
     * The expanded range covers all adjacent cells with data in them along the specified dimension including the table boundaries.
     * If the original range is surrounded by empty cells along the specified dimension, the range itself is returned.
     * @param {Dimension} [dimension] - The dimension along which to expand the range. If not provided, the range will be expanded in both dimensions.
     * @returns {FRange} The range's data region or a range covering each column or each row spanned by the original range.
     * @example
     * ```ts
     * // Assume the active sheet is a new sheet with no data.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the range A1:D4 with some values, the range A1:D4 will be:
     * //  |     |     |
     * //  |     | 100 |
     * //  | 100 |     | 100
     * //  |     | 100 |
     * fWorksheet.getRange('C2').setValue(100);
     * fWorksheet.getRange('B3').setValue(100);
     * fWorksheet.getRange('D3').setValue(100);
     * fWorksheet.getRange('C4').setValue(100);
     *
     * // Get C3 data region along the rows dimension, the range will be C2:D4
     * const range = fWorksheet.getRange('C3').getDataRegion(univerAPI.Enum.Dimension.ROWS);
     * console.log(range.getA1Notation()); // C2:C4
     *
     * // Get C3 data region along the columns dimension, the range will be B3:D3
     * const range2 = fWorksheet.getRange('C3').getDataRegion(univerAPI.Enum.Dimension.COLUMNS);
     * console.log(range2.getA1Notation()); // B3:D3
     *
     * // Get C3 data region along the both dimension, the range will be B2:D4
     * const range3 = fWorksheet.getRange('C3').getDataRegion();
     * console.log(range3.getA1Notation()); // B2:D4
     * ```
     */
    // eslint-disable-next-line complexity
    getDataRegion(dimension?: Dimension): FRange {
        const { startRow, startColumn, endRow, endColumn } = this._range;
        const maxRows = this._worksheet.getMaxRows();
        const maxColumns = this._worksheet.getMaxColumns();
        const cellMatrix = this._worksheet.getCellMatrix();

        // If the original range is surrounded by empty cells along the specified dimension, the range itself is returned.
        let newStartRow = startRow;
        let newStartColumn = startColumn;
        let newEndRow = endRow;
        let newEndColumn = endColumn;

        // Four directions or dimension rows
        if (dimension !== Dimension.COLUMNS) {
            let topRowHasValue = false;
            let bottomRowHasValue = false;

            for (let c = startColumn; c <= endColumn; c++) {
                if (startRow > 0 && !isNullCell(cellMatrix.getValue(startRow - 1, c))) {
                    topRowHasValue = true;
                }

                if (endRow < maxRows - 1 && !isNullCell(cellMatrix.getValue(endRow + 1, c))) {
                    bottomRowHasValue = true;
                }

                if (topRowHasValue && bottomRowHasValue) {
                    break;
                }
            }

            if (topRowHasValue) {
                newStartRow = startRow - 1;
            }

            if (bottomRowHasValue) {
                newEndRow = endRow + 1;
            }
        }

        // Four directions or dimension columns
        if (dimension !== Dimension.ROWS) {
            let leftColumnHasValue = false;
            let rightColumnHasValue = false;

            for (let r = startRow; r <= endRow; r++) {
                if (startColumn > 0 && !isNullCell(cellMatrix.getValue(r, startColumn - 1))) {
                    leftColumnHasValue = true;
                }

                if (endColumn < maxColumns - 1 && !isNullCell(cellMatrix.getValue(r, endColumn + 1))) {
                    rightColumnHasValue = true;
                }

                if (leftColumnHasValue && rightColumnHasValue) {
                    break;
                }
            }

            if (leftColumnHasValue) {
                newStartColumn = startColumn - 1;
            }

            if (rightColumnHasValue) {
                newEndColumn = endColumn + 1;
            }
        }

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, {
            startRow: newStartRow,
            startColumn: newStartColumn,
            endRow: newEndRow,
            endColumn: newEndColumn,
        });
    }

    /**
     * Returns true if the range is totally blank.
     * @returns {boolean} true if the range is blank; false otherwise.
     * @example
     * ```ts
     * // Assume the active sheet is a new sheet with no data.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.isBlank()); // true
     *
     * // Set the range A1:B2 with some values
     * fRange.setValueForCell(123);
     * console.log(fRange.isBlank()); // false
     * ```
     */
    isBlank(): boolean {
        const cellMatrix = this._worksheet.getCellMatrix();
        const { startRow, startColumn, endRow, endColumn } = this._range;

        let isBlank = true;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (!isNullCell(cellMatrix.getValue(r, c))) {
                    isBlank = false;
                    break;
                }
            }

            if (!isBlank) {
                break;
            }
        }

        return isBlank;
    }

    /**
     * Returns a new range that is offset from this range by the given number of rows and columns (which can be negative).
     * The new range is the same size as the original range.
     * @param {number} rowOffset - The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
     * @param {number} columnOffset - The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
     * @returns {FRange} The new range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getA1Notation()); // A1:B2
     *
     * // Offset the range by 1 row and 1 column
     * const newRange = fRange.offset(1, 1);
     * console.log(newRange.getA1Notation()); // B2:C3
     * ```
     */
    offset(rowOffset: number, columnOffset: number): FRange;
    /**
     * Returns a new range that is relative to the current range, whose upper left point is offset from the current range by the given rows and columns, and with the given height in cells.
     * @param {number} rowOffset - The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
     * @param {number} columnOffset - The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
     * @param {number} numRows - The height in rows of the new range.
     * @returns {FRange} The new range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getA1Notation()); // A1:B2
     *
     * // Offset the range by 1 row and 1 column, and set the height of the new range to 3
     * const newRange = fRange.offset(1, 1, 3);
     * console.log(newRange.getA1Notation()); // B2:C4
     * ```
     */
    offset(rowOffset: number, columnOffset: number, numRows: number): FRange;
    /**
     * Returns a new range that is relative to the current range, whose upper left point is offset from the current range by the given rows and columns, and with the given height and width in cells.
     * @param {number} rowOffset - The number of rows down from the range's top-left cell; negative values represent rows up from the range's top-left cell.
     * @param {number} columnOffset - The number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell.
     * @param {number} numRows - The height in rows of the new range.
     * @param {number} numColumns - The width in columns of the new range.
     * @returns {FRange} The new range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getA1Notation()); // A1:B2
     *
     * // Offset the range by 1 row and 1 column, and set the height of the new range to 3 and the width to 3
     * const newRange = fRange.offset(1, 1, 3, 3);
     * console.log(newRange.getA1Notation()); // B2:D4
     * ```
     */
    offset(rowOffset: number, columnOffset: number, numRows?: number, numColumns?: number): FRange {
        const { startRow, startColumn, endRow, endColumn } = this._range;

        const newStartRow = startRow + rowOffset;
        const newStartColumn = startColumn + columnOffset;
        const newEndRow = numRows ? newStartRow + numRows - 1 : endRow + rowOffset;
        const newEndColumn = numColumns ? newStartColumn + numColumns - 1 : endColumn + columnOffset;

        if (newStartRow < 0 || newStartColumn < 0 || newEndRow < 0 || newEndColumn < 0) {
            throw new Error('The row or column index is out of range');
        }

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, {
            startRow: newStartRow,
            startColumn: newStartColumn,
            endRow: newEndRow,
            endColumn: newEndColumn,
        });
    }

    /**
     * Updates the formula for this range. The given formula must be in A1 notation.
     * @param {string} formula - A string representing the formula to set for the cell.
     * @returns {FRange} This range instance for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1');
     * fRange.setFormula('=SUM(A2:A5)');
     * console.log(fRange.getFormula()); // '=SUM(A2:A5)'
     * ```
     */
    setFormula(formula: string): FRange {
        return this.setValue({
            f: formula,
        });
    }

    /**
     * Sets a rectangular grid of formulas (must match dimensions of this range). The given formulas must be in A1 notation.
     * @param {string[][]} formulas - A two-dimensional string array of formulas.
     * @returns {FRange} This range instance for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setFormulas([
     *   ['=SUM(A2:A5)', '=SUM(B2:B5)'],
     *   ['=SUM(A6:A9)', '=SUM(B6:B9)'],
     * ]);
     * console.log(fRange.getFormulas()); // [['=SUM(A2:A5)', '=SUM(B2:B5)'], ['=SUM(A6:A9)', '=SUM(B6:B9)']]
     * ```
     */
    setFormulas(formulas: string[][]): FRange {
        return this.setValues(formulas.map((row) => row.map((formula) => ({ f: formula }))));
    }
}
