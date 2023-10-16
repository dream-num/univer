import {
    CommandType,
    ICellData,
    ICommand,
    ICommandInfo,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Rectangle,
    sequenceExecute,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import {
    ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '../mutations/set-range-values.mutation';

/**
 * The command to clear all in current selected ranges.
 */
export const ClearSelectionAllCommand: ICommand = {
    id: 'sheet.command.clear-selection-all',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const worksheetId = worksheet.getSheetId();
        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const sequenceExecuteList: Array<ICommandInfo<object>> = [];
        const sequenceExecuteUndoList: Array<ICommandInfo<object>> = [];

        // clear style and content
        const clearMutationParams: ISetRangeValuesMutationParams = {
            range: selections,
            worksheetId,
            workbookId,
            cellValue: generateNullCellValue(selections),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        sequenceExecuteList.push({
            id: SetRangeValuesMutation.id,
            params: clearMutationParams,
        });
        sequenceExecuteUndoList.push({
            id: SetRangeValuesMutation.id,
            params: undoClearMutationParams,
        });

        // remove merged cells
        let hasMerge = false;
        const mergeData = worksheet.getConfig().mergeData;
        selections.forEach((selection) => {
            mergeData.forEach((merge) => {
                if (Rectangle.intersects(selection, merge)) {
                    hasMerge = true;
                }
            });
        });

        if (hasMerge) {
            const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                workbookId,
                worksheetId,
                ranges: selections,
            };
            const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                accessor,
                removeMergeParams
            );

            sequenceExecuteList.push({
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            });
            sequenceExecuteUndoList.push({
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            });
        }

        const result = await sequenceExecute(sequenceExecuteList, commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                URI: workbookId,
                undo: async () => (await sequenceExecute(sequenceExecuteUndoList, commandService)).result,
                redo: async () => (await sequenceExecute(sequenceExecuteList, commandService)).result,
            });

            return true;
        }

        return false;
    },
};

// Generate cellValue from range and set null
function generateNullCellValue(range: IRange[]): ObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, null);
            }
        }
    });

    return cellValue.getData();
}
