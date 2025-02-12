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

import type { ICellData, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import type { IFormulaDataItem, IFormulaIdMap } from '../../basics/common';
import { cellToRange, isFormulaId, isFormulaString, Rectangle } from '@univerjs/core';

// eslint-disable-next-line complexity
export function updateFormulaDataByCellValue(sheetFormulaDataMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>, newSheetFormulaDataMatrix: ObjectMatrix<IFormulaDataItem | null>, formulaIdMap: { [formulaId: string]: IFormulaIdMap }, deleteFormulaIdMap: Map<string, string | IFormulaIdMap>, r: number, c: number, cell: Nullable<ICellData>) {
    const formulaString = cell?.f || '';
    const formulaId = cell?.si || '';

    const checkFormulaString = isFormulaString(formulaString);
    const checkFormulaId = isFormulaId(formulaId);

    const currentFormulaInfo = sheetFormulaDataMatrix.getValue(r, c);
    const f = currentFormulaInfo?.f || '';
    const si = currentFormulaInfo?.si || '';

    // Any data update may destroy the original correspondence between f and si, and the relationship between f and si needs to be re-bound.
    function clearFormulaData() {
        // The id that needs to be offset
        // When the cell containing the formulas f and si is deleted, f and si lose their association, and f needs to be moved to the next cell containing the same si.
        if (isFormulaString(f) && isFormulaId(si)) {
            const updatedFormula = formulaIdMap?.[si]?.f;

            // The formula may have been updated. For example, when you delete a column referenced by a formula, it will become #REF and cannot take the original value.
            if (updatedFormula) {
                deleteFormulaIdMap.set(si, updatedFormula);
            } else {
                deleteFormulaIdMap.set(si, f);
            }
        }
    }

    if (checkFormulaString && checkFormulaId) {
        if (si !== formulaId) {
            clearFormulaData();
        }

        sheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
            si: formulaId,
        });

        formulaIdMap[formulaId] = { f: formulaString, r, c };

        newSheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
            si: formulaId,
        });
    } else if (checkFormulaString && !checkFormulaId) {
        if (f !== formulaString) {
            clearFormulaData();
        }

        sheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
        });
        newSheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
        });
    } else if (!checkFormulaString && checkFormulaId) {
        if (si !== formulaId) {
            clearFormulaData();
        }
        sheetFormulaDataMatrix.setValue(r, c, {
            f: '',
            si: formulaId,
        });
    } else if (!checkFormulaString && !checkFormulaId && sheetFormulaDataMatrix.getValue(r, c)) {
        clearFormulaData();

        sheetFormulaDataMatrix.realDeleteValue(r, c);
        newSheetFormulaDataMatrix.setValue(r, c, null);
    }
}

export function clearArrayFormulaCellDataByCell(arrayFormulaRangeMatrix: ObjectMatrix<IRange>, arrayFormulaCellDataMatrix: ObjectMatrix<Nullable<ICellData>>, r: number, c: number) {
    const arrayFormulaRangeValue = arrayFormulaRangeMatrix?.getValue(r, c);
    if (arrayFormulaRangeValue == null) {
        return true;
    }

    const intersection: IRange[] = [];
    arrayFormulaRangeMatrix.forValue((rangeRow, rangeCol, range) => {
        // skip the current range
        if (rangeRow === r && rangeCol === c) {
            return;
        }

        if (Rectangle.intersects(range, arrayFormulaRangeValue)) {
            intersection.push(range);
        }
    });

    const { startRow, startColumn, endRow, endColumn } = arrayFormulaRangeValue;

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startColumn; col <= endColumn; col++) {
            let isOverlapping = false;
            const currentCell = cellToRange(row, col);

            // Check if the cell is part of any other range in arrayFormulaRangeMatrix
            intersection.some((range) => {
                if (Rectangle.contains(range, currentCell)) {
                    isOverlapping = true;
                    return true;
                }
                return false;
            });

            // If the cell is not part of any other range, delete its value
            if (!isOverlapping) {
                arrayFormulaCellDataMatrix.realDeleteValue(row, col);
            }
        }
    }
}
