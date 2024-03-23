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

import type { IMutationInfo, IRange } from '@univerjs/core';
import { ObjectMatrix, Tools } from '@univerjs/core';
import type { IFormulaData } from '@univerjs/engine-formula';

export enum FormulaReferenceMoveType {
    MoveRange, // range
    MoveRows, // move rows
    MoveCols, // move columns
    InsertRow, // row
    InsertColumn, // column
    RemoveRow, // row
    RemoveColumn, // column
    DeleteMoveLeft, // range
    DeleteMoveUp, // range
    InsertMoveDown, // range
    InsertMoveRight, // range
    SetName,
    RemoveSheet,
}

export interface IFormulaReferenceMoveParam {
    type: FormulaReferenceMoveType;
    unitId: string;
    sheetId: string;
    range?: IRange;
    from?: IRange;
    to?: IRange;
    sheetName?: string;
}

/**
 * For different Command operations, it may be necessary to perform traversal in reverse or in forward order, so first determine the type of Command and then perform traversal.
 * @param oldFormulaData
 * @param newFormulaData
 * @param formulaReferenceMoveParam
 * @returns
 */
export function refRangeFormula(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam) {
    const type = formulaReferenceMoveParam.type;

    if (type === FormulaReferenceMoveType.SetName) {
        // TODO
    } else if (type === FormulaReferenceMoveType.RemoveSheet) {
        // TODO
    } else if (type === FormulaReferenceMoveType.MoveRange) {
        // TODO
    } else if (type === FormulaReferenceMoveType.MoveRows) {
        // TODO
    } else if (type === FormulaReferenceMoveType.MoveCols) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertRow) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertColumn) {
        return handleInsertCol(oldFormulaData, newFormulaData, formulaReferenceMoveParam);
    } else if (type === FormulaReferenceMoveType.RemoveRow) {
        // TODO
    } else if (type === FormulaReferenceMoveType.RemoveColumn) {
        // TODO
    } else if (type === FormulaReferenceMoveType.DeleteMoveLeft) {
        // TODO
    } else if (type === FormulaReferenceMoveType.DeleteMoveUp) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertMoveDown) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertMoveRight) {
        // TODO
    }
}

function handleInsertCol(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam) {
    const redos: IMutationInfo[] = [];
    const undos: IMutationInfo[] = [];

    const { type, unitId, sheetId, range, from, to } = formulaReferenceMoveParam;

    if (!Tools.isDefine(oldFormulaData)) {
        return {
            redos,
            undos,
        };
    }

    const formulaDataKeys = Object.keys(oldFormulaData);

    if (formulaDataKeys.length === 0) {
        return {
            redos,
            undos,
        };
    }

    for (const unitId of formulaDataKeys) {
        const sheetData = oldFormulaData[unitId];

        if (sheetData == null) {
            continue;
        }

        const sheetDataKeys = Object.keys(sheetData);
        for (const sheetId of sheetDataKeys) {
            const matrixData = new ObjectMatrix(sheetData[sheetId]);

            matrixData.forValue((row, column, formulaDataItem) => {
                if (!formulaDataItem) return true;

                const { f: formulaString, x, y, si } = formulaDataItem;
            });
        }
    }

    return {
        redos,
        undos,
    };
}
