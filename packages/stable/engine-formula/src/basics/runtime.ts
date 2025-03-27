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

import type { ICellData, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
import type { IArrayFormulaUnitCellType, IRuntimeUnitDataPrimitiveType, IRuntimeUnitDataType } from './common';

import { ObjectMatrix } from '@univerjs/core';

export function convertUnitDataToRuntime(unitData: IArrayFormulaUnitCellType) {
    const arrayFormulaCellData: IRuntimeUnitDataType = {};
    Object.keys(unitData).forEach((unitId) => {
        const sheetData = unitData[unitId];

        if (sheetData == null) {
            return true;
        }

        if (arrayFormulaCellData[unitId] == null) {
            arrayFormulaCellData[unitId] = {};
        }

        Object.keys(sheetData).forEach((sheetId) => {
            const cellData = sheetData[sheetId];

            arrayFormulaCellData[unitId]![sheetId] = new ObjectMatrix(cellData);
        });
    });

    return arrayFormulaCellData;
}

export function convertRuntimeToUnitData(unitData: IRuntimeUnitDataType) {
    const unitPrimitiveData: IRuntimeUnitDataPrimitiveType = {};

    for (const unitId in unitData) {
        const sheetData = unitData[unitId];
        if (sheetData == null) {
            continue;
        }

        if (unitPrimitiveData[unitId] == null) {
            unitPrimitiveData[unitId] = {};
        }

        for (const sheetId in sheetData) {
            const cellData = sheetData[sheetId];
            const primitiveData: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};

            cellData.forValue((row, column, value) => {
                if (primitiveData[row] === undefined) {
                    primitiveData[row] = {};
                }

                primitiveData[row][column] = value;
            });

            unitPrimitiveData[unitId][sheetId] = primitiveData;
        }
    }

    return unitPrimitiveData;
}
