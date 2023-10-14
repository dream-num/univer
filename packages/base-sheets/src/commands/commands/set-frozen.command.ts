import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IUndoRedoService,
    RANGE_TYPE,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ScrollManagerService } from '../../services/scroll-manager.service';
import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetFrozenMutationParams,
    SetFrozenMutation,
    SetFrozenMutationFactory,
} from '../mutations/set-frozen.mutation';

interface ISetFrozenCommandParams {
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
}

export const SetSelectionFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selection-frozen',
    handler: async (accessor: IAccessor) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        if (!selections) {
            return false;
        }
        const currentSelection = selections[selections?.length - 1];
        const { range } = currentSelection;
        const scrollManagerService = accessor.get(ScrollManagerService);
        const { sheetViewStartRow = 0, sheetViewStartColumn = 0 } = scrollManagerService.getCurrentScroll() || {};
        let startRow;
        let startColumn;
        let ySplit;
        let xSplit;
        const { startRow: selectRow, startColumn: selectColumn, rangeType } = range;
        // Frozen to Row
        if (rangeType === RANGE_TYPE.ROW) {
            startRow = selectRow;
            ySplit = selectRow - sheetViewStartRow;
            startColumn = -1;
            xSplit = 0;
            // Frozen to Column
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            startRow = -1;
            ySplit = 0;
            startColumn = selectColumn;
            xSplit = selectColumn - sheetViewStartColumn;
            // Frozen to Range
        } else if (rangeType === RANGE_TYPE.NORMAL) {
            startRow = selectRow;
            ySplit = selectRow - sheetViewStartRow;
            startColumn = selectColumn;
            xSplit = selectColumn - sheetViewStartColumn;
            // Unexpected value
        } else {
            return false;
        }
        const redoMutationParams: ISetFrozenMutationParams = {
            workbookId,
            worksheetId,
            startRow,
            startColumn,
            xSplit,
            ySplit,
        };
        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);

        const result = commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetFrozenMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};

export const SetFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen',
    handler: async (accessor: IAccessor, params: ISetFrozenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetFrozenMutationParams = {
            workbookId,
            worksheetId,
            ...params,
        };

        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetFrozenMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetFrozenMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
