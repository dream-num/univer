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
    isICellData,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    sequenceExecute,
    Tools,
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
    SelectionManagerService,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SheetInterceptorService,
    SheetPermissionService,
} from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

import { checkCellContentInRanges, getClearContentMutationParamsForRanges } from '../../common/utils';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { SetFormatPainterOperation } from '../operations/set-format-painter.operation';

export interface ISetFormatPainterCommandParams {
    status: FormatPainterStatus;
}

export const SetInfiniteFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-infinite-format-painter',
    handler: async (accessor: IAccessor) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        const status = formatPainterService.getStatus();
        let newStatus: FormatPainterStatus;
        if (status !== FormatPainterStatus.OFF) {
            newStatus = FormatPainterStatus.OFF;
        } else {
            newStatus = FormatPainterStatus.INFINITE;
        }
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(SetFormatPainterOperation.id, { status: newStatus });
    },
};

export const SetOnceFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-once-format-painter',
    handler: async (accessor: IAccessor) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        const status = formatPainterService.getStatus();
        let newStatus: FormatPainterStatus;
        if (status !== FormatPainterStatus.OFF) {
            newStatus = FormatPainterStatus.OFF;
        } else {
            newStatus = FormatPainterStatus.ONCE;
        }
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SetFormatPainterOperation.id, { status: newStatus });
    },
};

export interface IApplyFormatPainterCommandParams {
    subUnitId: string;
    unitId: string;
    styleRange: IRange;
    styleValues: ICellData[][];
    mergeRanges: IRange[];
}

export const ApplyFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.apply-format-painter',
    handler: async (accessor: IAccessor, params: IApplyFormatPainterCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const sheetPermissionService = accessor.get(SheetPermissionService);

        const {
            styleValues: value,
            styleRange: range,
            mergeRanges,
            unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
        } = params;

        if (!sheetPermissionService.getSheetEditable(unitId, subUnitId)) {
            return false;
        }

        const currentSelections = range ? [range] : selectionManagerService.getSelectionRanges();
        if (!currentSelections || !currentSelections.length) {
            return false;
        }

        const cellValue = new ObjectMatrix<ICellData>();
        let realCellValue: IObjectMatrixPrimitiveType<ICellData> | undefined;

        if (Tools.isArray(value)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = currentSelections[i];

                for (let r = 0; r <= endRow - startRow; r++) {
                    for (let c = 0; c <= endColumn - startColumn; c++) {
                        cellValue.setValue(r + startRow, c + startColumn, value[r][c]);
                    }
                }
            }
        } else if (isICellData(value)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn } = currentSelections[i];

                cellValue.setValue(startRow, startColumn, value);
            }
        } else {
            realCellValue = value as IObjectMatrixPrimitiveType<ICellData>;
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: realCellValue ?? cellValue.getMatrix(),
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        const setValueMutationResult = commandService.syncExecuteCommand(
            SetRangeValuesMutation.id,
            setRangeValuesMutationParams
        );

        const { undos: interceptorUndos, redos: interceptorRedos } = sheetInterceptorService.onCommandExecute({
            id: SetRangeValuesCommand.id,
            params: { ...setRangeValuesMutationParams, range: currentSelections },
        });

        // handle merge
        const ranges = getAddMergeMutationRangeByType(mergeRanges);
        const worksheet = univerInstanceService.getUniverSheetInstance(unitId)!.getSheetBySheetId(subUnitId)!;

        const mergeRedos: IMutationInfo[] = [];
        const mergeUndos: IMutationInfo[] = [];

        // First we should check if there are values in the going-to-be-merged cells.
        const willRemoveSomeCell = checkCellContentInRanges(worksheet, ranges);

        // prepare redo mutations
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        mergeRedos.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
        mergeRedos.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });

        // prepare undo mutations
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);
        mergeUndos.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        mergeUndos.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // add set range values mutations to undo redo mutations
        if (willRemoveSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, unitId, worksheet, ranges);
            mergeRedos.unshift(...data.redos);
            mergeUndos.push(...data.undos);
        }

        const result = await sequenceExecute([...interceptorRedos, ...mergeRedos], commandService);

        if (setValueMutationResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams },
                    ...interceptorUndos,
                    ...mergeUndos,
                ],
                redoMutations: [
                    { id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams },
                    ...interceptorRedos,
                    ...mergeRedos,
                ],
            });

            return true;
        }

        return false;
    },
};
