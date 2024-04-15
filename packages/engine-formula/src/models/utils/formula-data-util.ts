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

import type { ICellData, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import { isFormulaId, isFormulaString } from '@univerjs/core';
import type { IFormulaDataItem } from '../../basics/common';

export interface IFormulaIdMap {
    f: string;
    r: number;
    c: number;
}

export function updateFormulaDataByCellValue(sheetFormulaDataMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>, newSheetFormulaDataMatrix: ObjectMatrix<IFormulaDataItem | null>, formulaIdMap: Map<string, IFormulaIdMap>, deleteFormulaIdMap: Map<string, string | IFormulaIdMap>, r: number, c: number, cell: Nullable<ICellData>) {
    const formulaString = cell?.f || '';
    const formulaId = cell?.si || '';

    const checkFormulaString = isFormulaString(formulaString);
    const checkFormulaId = isFormulaId(formulaId);

    if (checkFormulaString && checkFormulaId) {
        sheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
            si: formulaId,
        });

        formulaIdMap.set(formulaId, { f: formulaString, r, c });

        newSheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
            si: formulaId,
        });
    } else if (checkFormulaString && !checkFormulaId) {
        sheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
        });
        newSheetFormulaDataMatrix.setValue(r, c, {
            f: formulaString,
        });
    } else if (!checkFormulaString && checkFormulaId) {
        sheetFormulaDataMatrix.setValue(r, c, {
            f: '',
            si: formulaId,
        });
    } else if (!checkFormulaString && !checkFormulaId && sheetFormulaDataMatrix.getValue(r, c)) {
        const currentFormulaInfo = sheetFormulaDataMatrix.getValue(r, c);
        const f = currentFormulaInfo?.f || '';
        const si = currentFormulaInfo?.si || '';

        // The id that needs to be offset
        // When the cell containing the formulas f and si is deleted, f and si lose their association, and f needs to be moved to the next cell containing the same si.
        if (isFormulaString(f) && isFormulaId(si)) {
            deleteFormulaIdMap.set(si, f);
        }

        sheetFormulaDataMatrix.realDeleteValue(r, c);
        newSheetFormulaDataMatrix.setValue(r, c, null);
    }
}

export function clearArrayFormulaCellDataByCell(arrayFormulaRangeMatrix: ObjectMatrix<IRange>, arrayFormulaCellDataMatrix: ObjectMatrix<Nullable<ICellData>>, r: number, c: number) {
    const arrayFormulaRangeValue = arrayFormulaRangeMatrix?.getValue(r, c);
    if (arrayFormulaRangeValue == null) {
        return true;
    }

    const { startRow, startColumn, endRow, endColumn } = arrayFormulaRangeValue;
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            arrayFormulaCellDataMatrix.realDeleteValue(r, c);
        }
    }
}
