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

/* eslint-disable max-lines-per-function */

import type { IAccessor, ICommand, IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '@univerjs/sheets';
import {
    CommandType,
    Dimension,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    sequenceExecute,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddMergeRedoSelectionsOperationFactory,
    AddMergeUndoMutationFactory,
    AddMergeUndoSelectionsOperationFactory,
    AddWorksheetMergeMutation,
    getAddMergeMutationRangeByType,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { IConfirmService } from '@univerjs/ui';

import { checkCellContentInRanges, getClearContentMutationParamsForRanges } from '../../common/utils';
import { getMergeableSelectionsByType, MergeType } from './utils/selection-utils';

export interface IAddMergeCommandParams {
    value?: Dimension.ROWS | Dimension.COLUMNS;
    selections: IRange[];
    unitId: string;
    subUnitId: string;
    defaultMerge?: boolean;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',

    handler: async (accessor: IAccessor, params: IAddMergeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const confirmService = accessor.get(IConfirmService);
        const localeService = accessor.get(LocaleService);

        const unitId = params.unitId;
        const subUnitId = params.subUnitId;
        const selections = params.selections;
        const ranges = getAddMergeMutationRangeByType(selections, params.value);
        const worksheet = univerInstanceService.getUniverSheetInstance(unitId)!.getSheetBySheetId(subUnitId)!;

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // First we should check if there are values in the going-to-be-merged cells.
        const willClearSomeCell = checkCellContentInRanges(worksheet, ranges);
        if (willClearSomeCell && !params.defaultMerge) {
            const result = await confirmService.confirm({
                id: 'merge.confirm.add-worksheet-merge',
                title: {
                    title: 'merge.confirm.title',
                },
                cancelText: localeService.t('merge.confirm.cancel'),
                confirmText: localeService.t('merge.confirm.confirm'),
            });

            if (!result) {
                return false;
            }
        }

        // prepare redo mutations
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: Tools.deepClone(ranges),
        };
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: Tools.deepClone(ranges),
        };

        // prepare undo mutations
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);

        // params should be the merged cells to be deleted accurately, rather than the selection
        if (undoRemoveMergeMutationParams.ranges.length > 0) {
            redoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });
        }

        redoMutations.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });
        undoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        if (undoRemoveMergeMutationParams.ranges.length > 0) {
            undoMutations.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });
        }

        // add set range values mutations to undo redo mutations
        if (willClearSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, unitId, worksheet, ranges);
            redoMutations.unshift(...data.redos);
            undoMutations.push(...data.undos);
        }

        const addMergeRedoSelectionsMutation = AddMergeRedoSelectionsOperationFactory(accessor, params, ranges);
        addMergeRedoSelectionsMutation && redoMutations.push(addMergeRedoSelectionsMutation);

        const addMergeUndoSelectionsMutation = AddMergeUndoSelectionsOperationFactory(accessor, params);
        addMergeUndoSelectionsMutation && undoMutations.push(addMergeUndoSelectionsMutation);

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptor = sheetInterceptorService.onCommandExecute({
            id: AddWorksheetMergeCommand.id,
            params: { unitId, subUnitId, ranges },
        });

        redoMutations.push(...interceptor.redos);
        undoMutations.push(...interceptor.undos);

        const result = sequenceExecute(redoMutations, commandService);
        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });
            return true;
        }
        return false;
    },
};

export const AddWorksheetMergeAllCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-all',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        const mergeableSelections = getMergeableSelectionsByType(MergeType.MergeAll, selections);
        if (!mergeableSelections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            selections: mergeableSelections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeVerticalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-vertical',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        const mergeableSelections = getMergeableSelectionsByType(MergeType.MergeVertical, selections);
        if (!mergeableSelections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.COLUMNS,
            selections: mergeableSelections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeHorizontalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-horizontal',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        const mergeableSelections = getMergeableSelectionsByType(MergeType.MergeHorizontal, selections);
        if (!mergeableSelections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = workSheet.getSheetId();
        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.ROWS,
            selections: mergeableSelections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};
