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

import type { ICellData, ICommandInfo, IMutationCommonParams, Nullable } from '@univerjs/core';
import { isFormulaId, isFormulaString, ObjectMatrix, UndoCommand } from '@univerjs/core';
import type { IArrayFormulaRangeType, IArrayFormulaUnitCellType, IFormulaData } from '@univerjs/engine-formula';
import {
    type IMoveColumnsMutationParams,
    type IMoveRangeMutationParams,
    type IMoveRowsMutationParams,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
} from '@univerjs/sheets';

import { moveRangeUpdateFormulaData } from './offset-formula-data';

export function handleRedoUndoMutation(
    command: ICommandInfo,
    formulaData: IFormulaData,
    arrayFormulaRange: IArrayFormulaRangeType,
    arrayFormulaCellData: IArrayFormulaUnitCellType
) {
    const { id } = command;
    switch (id) {
        case MoveRangeMutation.id:
            handleRedoUndoMoveRange(
                command as ICommandInfo<IMoveRangeMutationParams>,
                formulaData,
                arrayFormulaRange,
                arrayFormulaCellData
            );
            break;
        case MoveRowsMutation.id:
            handleRedoUndoMoveRows(
                command as ICommandInfo<IMoveRowsMutationParams>,
                formulaData,
                arrayFormulaRange,
                arrayFormulaCellData
            );
            break;
        case MoveColsMutation.id:
            handleRedoUndoMoveCols(
                command as ICommandInfo<IMoveColumnsMutationParams>,
                formulaData,
                arrayFormulaRange,
                arrayFormulaCellData
            );
            break;
    }
}

export function handleRedoUndoMoveRange(
    command: ICommandInfo<IMoveRangeMutationParams>,
    formulaData: IFormulaData,
    arrayFormulaRange: IArrayFormulaRangeType,
    arrayFormulaCellData: IArrayFormulaUnitCellType
) {
    const { params } = command;
    if (!params) return;

    const { unitId } = params;
    let { from, to } = params;

    if ((command.params as IMutationCommonParams).trigger === UndoCommand.id) {
        from = params.to;
        to = params.from;
    }

    const { subUnitId: fromSubUnitId, value: fromValue } = from;
    const { subUnitId: toSubUnitId, value: toValue } = to;

    const fromValueMatrix = new ObjectMatrix(fromValue);
    const toValueMatrix = new ObjectMatrix(toValue);

    setRedoUndoMoveRangeFormulaData(fromValueMatrix, formulaData, unitId, fromSubUnitId);
    setRedoUndoMoveRangeFormulaData(toValueMatrix, formulaData, unitId, toSubUnitId);
    setRedoUndoMoveRangeArrayFormulaData(
        fromValueMatrix,
        toValueMatrix,
        arrayFormulaRange,
        arrayFormulaCellData,
        unitId,
        fromSubUnitId,
        toSubUnitId
    );
}

function setRedoUndoMoveRangeFormulaData(
    valueMatrix: ObjectMatrix<Nullable<ICellData>>,
    formulaData: IFormulaData,
    unitId: string,
    subUnitId: string
) {
    if (!formulaData[unitId]) {
        formulaData[unitId] = {};
    }

    valueMatrix.forValue((r, c, newVal) => {
        if (!formulaData[unitId]![subUnitId][r]) {
            formulaData[unitId]![subUnitId][r] = {};
        }

        if (!newVal) {
            delete formulaData[unitId]![subUnitId][r][c];
            return;
        }

        const formulaString = newVal?.f || '';
        const formulaId = newVal?.si || '';

        const checkFormulaString = isFormulaString(formulaString);
        const checkFormulaId = isFormulaId(formulaId);

        if (checkFormulaString && checkFormulaId) {
            formulaData[unitId]![subUnitId][r][c] = {
                f: formulaString,
                si: formulaId,
            };
        } else if (checkFormulaString && !checkFormulaId) {
            formulaData[unitId]![subUnitId][r][c] = {
                f: formulaString,
            };
        } else if (!checkFormulaString && checkFormulaId) {
            formulaData[unitId]![subUnitId][r][c] = {
                f: '',
                si: formulaId,
            };
        } else if (!checkFormulaString && !checkFormulaId) {
            delete formulaData[unitId]![subUnitId][r][c];
        }
    });
}

function setRedoUndoMoveRangeArrayFormulaData(
    fromValueMatrix: ObjectMatrix<Nullable<ICellData>>,
    toValueMatrix: ObjectMatrix<Nullable<ICellData>>,
    arrayFormulaRange: IArrayFormulaRangeType,
    arrayFormulaCellData: IArrayFormulaUnitCellType,
    unitId: string,
    fromSubUnitId: string,
    toSubUnitId: string
) {
    const fromArrayFormulaCellDataMatrix = new ObjectMatrix(arrayFormulaCellData?.[unitId]?.[fromSubUnitId] ?? {});
    const toArrayFormulaCellDataMatrix = new ObjectMatrix(arrayFormulaCellData?.[unitId]?.[toSubUnitId] ?? {});
    const fromArrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange?.[unitId]?.[fromSubUnitId] ?? {});
    const toArrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange?.[unitId]?.[toSubUnitId] ?? {});

    // We need set toValueMatrix value to fromValueMatrix value
    const fromRange = fromValueMatrix.getDataRange();
    const toRange = toValueMatrix.getDataRange();

    // update arrayFormulaCellData
    moveRangeUpdateFormulaData(
        fromRange,
        toRange,
        fromArrayFormulaCellDataMatrix,
        toArrayFormulaCellDataMatrix,
        fromArrayFormulaRangeMatrix
    );

    // update arrayFormulaRange
    moveRangeUpdateFormulaData(fromRange, toRange, fromArrayFormulaRangeMatrix, toArrayFormulaRangeMatrix);
}

// TODO@Dushusir: move rows and move cols
function handleRedoUndoMoveRows(
    command: ICommandInfo<IMoveRowsMutationParams>,
    formulaData: IFormulaData,
    arrayFormulaRange: IArrayFormulaRangeType,
    arrayFormulaCellData: IArrayFormulaUnitCellType
) {}

function handleRedoUndoMoveCols(
    command: ICommandInfo<IMoveColumnsMutationParams>,
    formulaData: IFormulaData,
    arrayFormulaRange: IArrayFormulaRangeType,
    arrayFormulaCellData: IArrayFormulaUnitCellType
) {}
