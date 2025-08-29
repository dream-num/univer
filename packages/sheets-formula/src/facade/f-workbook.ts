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

import type { ISheetFormulaError } from '@univerjs/engine-formula';
import { extractFormulaError, FormulaDataModel } from '@univerjs/engine-formula';
import { FWorkbook } from '@univerjs/sheets/facade';

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

                const arrayFormulaCellData = arrayFormulaSheet?.[row]?.[column];
                const errorType = extractFormulaError(cell, !!arrayFormulaCellData);

                // Check if the cell value is an error
                if (errorType) {
                    errors.push({
                        sheetName,
                        row,
                        column,
                        formula: cell.f || '',
                        errorType,
                    });
                }
            });
        });

        return errors;
    }
}

FWorkbook.extend(FWorkbookEngineFormulaMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookEngineFormulaMixin { }
}
