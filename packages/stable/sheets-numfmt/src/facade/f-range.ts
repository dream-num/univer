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

import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import { SetNumfmtCommand } from '@univerjs/sheets-numfmt';
import { FRange } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFRangeSheetsNumfmtMixin {
    // TODO@wzhudev: should separate numfmt package to two

    /**
     * Set the number format of the range.
     * @param {string} pattern - The number format pattern.
     * @returns {FRange} The FRange instance for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the number format of the A1 cell to '#,##0.00'.
     * const fRange = fWorksheet.getRange('A1');
     * fRange.setValue(1234.567).setNumberFormat('#,##0.00');
     * console.log(fRange.getDisplayValue()); // 1,234.57
     * ```
     */
    setNumberFormat(pattern: string): FRange;

    /**
     * Sets a rectangular grid of number formats (must match dimensions of this range).
     * @param {string[][]} patterns - A two-dimensional array of number formats.
     * @returns {FRange} The FRange instance for chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Set the number formats of the A1:B2 range.
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   [1234.567, 0.1234],
     *   [45658, 0.9876]
     * ]).setNumberFormats([
     *   ['#,##0.00', '0.00%'],
     *   ['yyyy-MM-DD', '']
     * ]);
     * console.log(fRange.getDisplayValues()); // [['1,234.57', '12.34%'], ['2025-01-01', 0.9876]]
     * ```
     */
    setNumberFormats(patterns: string[][]): FRange;

    /**
     * Get the number formatting of the top-left cell of the given range. Empty cells return an empty string.
     * @returns {string} The number format of the top-left cell of the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Get the number format of the top-left cell of the A1:B2 range.
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getNumberFormat());
     * ```
     */
    getNumberFormat(): string;

    /**
     * Returns the number formats for the cells in the range.
     * @returns {string[][]} A two-dimensional array of number formats.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Get the number formats of the A1:B2 range.
     * const fRange = fWorksheet.getRange('A1:B2');
     * console.log(fRange.getNumberFormats());
     * ```
     */
    getNumberFormats(): string[][];
}

export class FRangeLegacy extends FRange implements IFRangeSheetsNumfmtMixin {
    override setNumberFormat(pattern: string): FRange {
        // TODO@Gggpound: the API should support other types of parameters
        const values: ISetNumfmtCommandParams['values'] = [];

        // Add number format info to the `values` array.
        this.forEach((row, col) => values.push({ row, col, pattern }));
        this._commandService.syncExecuteCommand(SetNumfmtCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            values,
        } as ISetNumfmtCommandParams);

        return this;
    }

    override setNumberFormats(patterns: string[][]): FRange {
        const values: ISetNumfmtCommandParams['values'] = [];

        // Add number format info to the `values` array.
        this.forEach((row, col) => {
            const pattern = patterns[row]?.[col];
            values.push({ row, col, pattern });
        });
        this._commandService.syncExecuteCommand(SetNumfmtCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            values,
        } as ISetNumfmtCommandParams);

        return this;
    }

    override getNumberFormat(): string {
        const style = this.getCellStyle();
        return style?.numberFormat?.pattern ?? '';
    }

    override getNumberFormats(): string[][] {
        const styles = this.getCellStyles();
        return styles.map((row) => row.map((cellStyle) => cellStyle?.numberFormat?.pattern ?? ''));
    }
}

FRange.extend(FRangeLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetsNumfmtMixin { }
}
