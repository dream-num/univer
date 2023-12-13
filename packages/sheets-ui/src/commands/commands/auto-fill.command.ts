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

import type { ICellData, ICommand, IMutationInfo, IObjectMatrixPrimitiveType, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    RANGE_TYPE,
} from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    getAddMergeMutationRangeByType,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetSelectionsOperation,
    transformRefStyleFromCells,
} from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

export interface IAutoFillCommandParams {
    subUnitId?: string;
    unitId?: string;
    applyRange: IRange;
    selectionRange: IRange;
    applyDatas: ICellData[][];
    extendMutations: { undo: IMutationInfo[]; redo: IMutationInfo[] };
    applyMergeRanges?: IRange[];
}

export const AutoFillCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.auto-fill',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IAutoFillCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const {
            applyRange,
            selectionRange,
            applyDatas,
            unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
            applyMergeRanges,
        } = params || {};
        if (!applyRange || !applyDatas || !selectionRange) {
            return false;
        }

        // set range value
        const cellValue = new ObjectMatrix<ICellData>();
        const { startRow, startColumn, endRow, endColumn } = applyRange;

        for (let r = 0; r <= endRow - startRow; r++) {
            for (let c = 0; c <= endColumn - startColumn; c++) {
                cellValue.setValue(r + startRow, c + startColumn, applyDatas[r][c]);
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            ...transformRefStyleFromCells(cellValue.getMatrix()),
        };

        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        const setRangeResult = commandService.syncExecuteCommand(
            SetRangeValuesMutation.id,
            setRangeValuesMutationParams
        );

        // set selection
        const selectionResult = commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            selections: [
                {
                    primary: {
                        ...selectionRange,
                        endColumn: selectionRange.startColumn,
                        endRow: selectionRange.startRow,
                    },
                    range: {
                        ...selectionRange,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                },
            ],
            unitId,
            subUnitId,
        });

        const undoSeq: IMutationInfo[] = [{ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams }];
        const redoSeq: IMutationInfo[] = [{ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams }];

        let removeMergeResult = true;
        let addMergeResult = true;

        // add worksheet merge
        if (applyMergeRanges?.length) {
            const ranges = getAddMergeMutationRangeByType(applyMergeRanges);
            const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
                unitId,
                subUnitId,
                ranges,
            };
            const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                accessor,
                removeMergeMutationParams
            );
            removeMergeResult = commandService.syncExecuteCommand(
                RemoveWorksheetMergeMutation.id,
                removeMergeMutationParams
            );
            const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
                unitId,
                subUnitId,
                ranges,
            };
            const undoRemoveMutationParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                accessor,
                addMergeMutationParams
            );
            addMergeResult = commandService.syncExecuteCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

            undoSeq.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });
            undoSeq.push({ id: RemoveWorksheetMergeMutation.id, params: undoRemoveMutationParams });
            redoSeq.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
            redoSeq.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });
        }

        // deal with extend mutations by hooks
        const { undo, redo } = params?.extendMutations;
        const extendResult = redo.every((item: IMutationInfo) =>
            commandService.syncExecuteCommand(item.id, item.params)
        );
        undo.forEach((item: IMutationInfo) => {
            undoSeq.push(item);
        });
        redo.forEach((item: IMutationInfo) => {
            redoSeq.push(item);
        });

        if (setRangeResult && removeMergeResult && addMergeResult && selectionResult && extendResult) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undoSeq,
                redoMutations: redoSeq,
            });

            return true;
        }
        return true;
    },
};

export interface IAutoClearContentCommand {
    clearRange: IRange;
    selectionRange: IRange;
}

export const AutoClearContentCommand: ICommand = {
    id: 'sheet.command.auto-clear-content',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IAutoClearContentCommand) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const subUnitId = worksheet.getSheetId();
        const { clearRange, selectionRange } = params;

        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellValue([clearRange]),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );
        commandService.executeCommand(SetSelectionsOperation.id, {
            selections: [
                {
                    primary: {
                        ...selectionRange,
                    },
                    range: {
                        ...selectionRange,
                    },
                },
            ],
            unitId,
            subUnitId,
        });

        const result = commandService.syncExecuteCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                unitID: unitId,
                undoMutations: [{ id: SetRangeValuesMutation.id, params: undoClearMutationParams }],
                redoMutations: [{ id: SetRangeValuesMutation.id, params: clearMutationParams }],
                undo() {
                    return commandService.syncExecuteCommand(SetRangeValuesMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.syncExecuteCommand(SetRangeValuesMutation.id, clearMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};

// Generate cellValue from range and set v/p/f/si to null
function generateNullCellValue(range: IRange[]): IObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((r: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = r;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, {
                    v: null,
                    p: null,
                    f: null,
                    si: null,
                });
            }
        }
    });

    return cellValue.getData();
}
