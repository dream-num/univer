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

import type { IAccessor, ICommand, IMutationInfo, Nullable } from '@univerjs/core';
import type {
    FormatType,
    IRemoveNumfmtMutationParams,
    ISetCellsNumfmt,
    ISetNumfmtMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import { CellValueType, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, ObjectMatrix, sequenceExecute } from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import {
    checkCellValueType,
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    getSheetCommandTarget,
    rangeMerge,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesMutation,
    transformCellsToRange,
} from '@univerjs/sheets';

export interface ISetNumfmtCommandParams {
    unitId?: string;
    subUnitId?: string;
    values: Array<{ pattern?: string; row: number; col: number; type?: FormatType }>;
}

export const SetNumfmtCommand: ICommand<ISetNumfmtCommandParams> = {
    id: 'sheet.command.numfmt.set.numfmt',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;
        const setCells = params.values.filter((value) => !!value.pattern) as ISetCellsNumfmt;
        const removeCells = params.values.filter((value) => !value.pattern);
        const setRedos = transformCellsToRange(unitId, subUnitId, setCells);
        const removeRedos: IRemoveNumfmtMutationParams = {
            unitId,
            subUnitId,
            ranges: removeCells.map((cell) => ({
                startColumn: cell.col,
                startRow: cell.row,
                endColumn: cell.col,
                endRow: cell.row,
            })),
        };
        const redos: Array<IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams | ISetRangeValuesMutationParams>> = [];
        const undos: Array<IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams | ISetRangeValuesMutationParams>> = [];
        if (setCells.length) {
            const setCellTypeObj = setCells.reduce((pre, cur) => {
                if (isTextFormat(cur.pattern)) {
                    pre.setValue(cur.row, cur.col, { t: CellValueType.STRING });
                }
                const cell = worksheet.getCellRaw(cur.row, cur.col);
                if (cell) {
                    const type = checkCellValueType(cell.v);
                    if (type !== cell.t) {
                        pre.setValue(cur.row, cur.col, { t: type });
                    }
                }
                return pre;
            }, new ObjectMatrix<{ t: Nullable<CellValueType> }>()).getMatrix();

            const undoSetCellTypeObj = new ObjectMatrix<{ t: Nullable<CellValueType> }>();
            new ObjectMatrix<{ t: Nullable<CellValueType> }>(setCellTypeObj).forValue((row, col) => {
                const cell = worksheet.getCellRaw(row, col);
                if (cell) {
                    undoSetCellTypeObj.setValue(row, col, { t: cell.t });
                } else {
                    undoSetCellTypeObj.setValue(row, col, { t: undefined });
                }
            });
            Object.keys(setRedos.values).forEach((key) => {
                const v = setRedos.values[key];
                v.ranges = rangeMerge(v.ranges);
            });
            redos.push({
                id: SetNumfmtMutation.id,
                params: setRedos,
            });
            const undo = factorySetNumfmtUndoMutation(accessor, setRedos);
            undos.push(...undo);
        }

        if (removeCells.length) {
            removeRedos.ranges = rangeMerge(removeRedos.ranges);

            const setCellTypeObj = removeCells.reduce((pre, cur) => {
                const cell = worksheet.getCellRaw(cur.row, cur.col);
                if (cell) {
                    const type = checkCellValueType(cell.v);
                    if (type !== cell.t) {
                        pre.setValue(cur.row, cur.col, { t: type });
                    }
                }
                return pre;
            }, new ObjectMatrix<{ t: Nullable<CellValueType> }>()).getMatrix();

            const undoSetCellTypeObj = new ObjectMatrix<{ t: Nullable<CellValueType> }>();
            new ObjectMatrix<{ t: Nullable<CellValueType> }>(setCellTypeObj).forValue((row, col) => {
                const cell = worksheet.getCellRaw(row, col);
                if (cell) {
                    undoSetCellTypeObj.setValue(row, col, { t: cell.t });
                } else {
                    undoSetCellTypeObj.setValue(row, col, { t: undefined });
                }
            });

            redos.push({
                id: RemoveNumfmtMutation.id,
                params: removeRedos,
            }, {
                id: SetRangeValuesMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    cellValue: setCellTypeObj,
                },
            });
            const undo = factoryRemoveNumfmtUndoMutation(accessor, removeRedos);

            undos.push({
                id: SetRangeValuesMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    cellValue: undoSetCellTypeObj.getMatrix(),
                },
            }, ...undo);
        }

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }
        return result;
    },
};
