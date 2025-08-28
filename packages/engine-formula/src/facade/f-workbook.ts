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

import type { IGridRange } from '@univerjs/core';
import type { ErrorType } from '@univerjs/engine-formula';
import { isFormulaId, isFormulaString, Tools } from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { FWorkbook } from '@univerjs/sheets/facade';

/** Interface for sheet formula errors */
interface ISheetFormulaError {
    /** sheet name */
    sheetName: string;

    /** cell position (e.g., "A1") */
    cell: string;

    /** formula string (e.g., "=SUM(A1:B10)") */
    formula: string;

    /** error type, refer to ErrorType enum */
    errorType: ErrorType;
}

/**
 * @ignore
 */
export interface IFWorkbookEngineFormulaMixin {
    /**
     * Get all formula errors in the workbook
     * @returns {ISheetFormulaError[]} Array of formula errors
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const errors = fWorkbook.getAllFormulaError();
     * console.log('Formula errors:', errors);
     * ```
     */
    getAllFormulaError(): ISheetFormulaError[];

    /**
     * Get formula errors in a specific range
     * @param {IRange} range The range to check for formula errors
     * @returns {unknown[]} Array of formula errors in the range
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const gridRange = {sheetId: fWorksheet.getSheetId(), range:{ startRow: 0, startColumn: 0, endRow: 10, endColumn: 10 }};
     * const errors = fWorkbook.getFormulaErrorByRange(gridRange);
     * console.log('Formula errors in range:', errors);
     * ```
     */
    getFormulaErrorByRange(range: IGridRange): ISheetFormulaError[];
}

export class FWorkbookEngineFormulaMixin extends FWorkbook implements IFWorkbookEngineFormulaMixin {
    override getAllFormulaError(): ISheetFormulaError[] {
        const errors: ISheetFormulaError[] = [];
        const workbook = this._workbook;
        const unitId = workbook.getUnitId();

        // Get all worksheets in the workbook
        const worksheets = workbook.getSheets();
        const arrayFormula = this._injector.get(FormulaDataModel).getArrayFormulaCellData();

        worksheets.forEach((worksheet) => {
            const sheetName = worksheet.getName();
            const sheetId = worksheet.getSheetId();
            const cellMatrix = worksheet.getCellMatrix();
            const arrayFormulaSheet = arrayFormula?.[unitId]?.[sheetId] || {};

            // Traverse all cells in the worksheet
            cellMatrix.forValue((row, column, cell) => {
                if (!cell) return;

                const { f, si, v } = cell;
                const arrayFormulaCellData = arrayFormulaSheet?.[row]?.[column];

                // Check if cell has a formula
                const hasFormula = isFormulaString(f) || isFormulaId(si);
                if (!hasFormula) return;

                // Check if the cell value is an error
                if (v && typeof v === 'object' && v !== null && 'errorType' in v) {
                    const cellAddress = this._getCellAddress(row, column);
                    const formulaString = f || '';

                    errors.push({
                        sheetName,
                        cell: cellAddress,
                        formula: formulaString,
                        errorType: (v as { errorType: ErrorType }).errorType,
                    });
                }
            });
        });

        return errors;
    }

    override getFormulaErrorByRange(range: IGridRange): ISheetFormulaError[] {
        const errors: ISheetFormulaError[] = [];
        const workbook = this._workbook;

        // Get the specific worksheet
        const worksheet = workbook.getSheetBySheetId(range.sheetId);
        if (!worksheet) return errors;

        const sheetName = worksheet.getName();
        const cellMatrix = worksheet.getCellMatrix();
        const { startRow, endRow, startColumn, endColumn } = range.range;

        // Traverse cells in the specified range
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                const cell = cellMatrix.getValue(row, column);
                if (!cell) continue;

                const { f, si, v } = cell;

                // Check if cell has a formula
                const hasFormula = isFormulaString(f) || isFormulaId(si);
                if (!hasFormula) continue;

                // Check if the cell value is an error
                if (v && typeof v === 'object' && v !== null && 'errorType' in v) {
                    const cellAddress = this._getCellAddress(row, column);
                    const formulaString = f || '';

                    errors.push({
                        sheetName,
                        cell: cellAddress,
                        formula: formulaString,
                        errorType: (v as { errorType: ErrorType }).errorType,
                    });
                }
            }
        }

        return errors;
    }

    /**
     * Convert row and column indices to cell address (e.g., A1, B2)
     * @private
     */
    private _getCellAddress(row: number, column: number): string {
        return `${Tools.chatAtABC(column)}${row + 1}`;
    }
}

FWorkbook.extend(FWorkbookEngineFormulaMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookEngineFormulaMixin { }
}
