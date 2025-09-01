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
import { FRange } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFRangeEngineFormulaMixin {
    /**
     * Get formula errors in the current range
     * @returns {ISheetFormulaError[]} Array of formula errors in the range
     * @example
     * ```typescript
     * const range = univerAPI.getActiveWorkbook()
     *   .getActiveSheet()
     *   .getRange('A1:B10');
     * const errors = range.getFormulaError();
     * console.log('Formula errors in range:', errors);
     * ```
     */
    getFormulaError(): ISheetFormulaError[];
}

/**
 * @ignore
 */
export class FRangeEngineFormulaMixin extends FRange implements IFRangeEngineFormulaMixin {
    override getFormulaError(): ISheetFormulaError[] {
        const errors: ISheetFormulaError[] = [];
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const sheetName = this._worksheet.getName();
        const worksheet = this._workbook.getSheetBySheetId(sheetId);

        if (!worksheet) return errors;

        const arrayFormula = this._injector.get(FormulaDataModel).getArrayFormulaCellData();
        const arrayFormulaSheet = arrayFormula?.[unitId]?.[sheetId] || {};

        const cellMatrix = worksheet.getCellMatrix();
        const { startRow, endRow, startColumn, endColumn } = this._range;

        // Traverse cells in the current range
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                const cell = cellMatrix.getValue(row, column);
                if (!cell) continue;

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
            }
        }

        return errors;
    }
}

FRange.extend(FRangeEngineFormulaMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeEngineFormulaMixin {}
}
