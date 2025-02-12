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

import type { IRange } from '@univerjs/core';
import type { IArrayFormulaRangeType, IArrayFormulaUnitCellType, IFormulaData } from '@univerjs/engine-formula';

export interface IRefRangeWithPosition {
    row: number;
    column: number;
    range: IRange;
}

export function checkFormulaDataNull(formulaData: IFormulaData, unitId: string, sheetId: string) {
    if (formulaData == null || formulaData[unitId] == null || formulaData[unitId]?.[sheetId] == null) {
        return true;
    }

    return false;
}

export function removeFormulaData(formulaData: IFormulaData | IArrayFormulaRangeType | IArrayFormulaUnitCellType, unitId: string, sheetId?: string) {
    if (sheetId) {
        if (formulaData && formulaData[unitId] && formulaData[unitId]?.[sheetId]) {
            delete formulaData[unitId]![sheetId];
            return {
                [unitId]: {
                    [sheetId]: null,
                },
            };
        }
    } else {
        if (formulaData && formulaData[unitId]) {
            delete formulaData[unitId];
            return {
                [unitId]: null,
            };
        }
    }
}
