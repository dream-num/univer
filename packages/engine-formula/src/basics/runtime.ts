import { ObjectMatrix } from '@univerjs/core';

import type { IArrayFormulaUnitCellType, IRuntimeUnitDataType } from './common';

export function convertUnitDataToRuntime(unitData: IArrayFormulaUnitCellType) {
    const arrayFormulaCellData: IRuntimeUnitDataType = {};
    Object.keys(unitData).forEach((unitId) => {
        const sheetData = unitData[unitId];

        if (arrayFormulaCellData[unitId] == null) {
            arrayFormulaCellData[unitId] = {};
        }

        Object.keys(sheetData).forEach((sheetId) => {
            const cellData = sheetData[sheetId];

            arrayFormulaCellData[unitId][sheetId] = new ObjectMatrix(cellData);
        });
    });

    return arrayFormulaCellData;
}
