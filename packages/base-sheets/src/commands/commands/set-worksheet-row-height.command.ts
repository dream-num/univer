import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IUndoRedoService,
    RANGE_TYPE,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetWorksheetRowHeightMutationParams,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowHeightMutationFactory,
} from '../mutations/set-worksheet-row-height.mutation';

export interface IDeltaWorksheetRowHeightCommand {
    anchorRow: number;
    deltaY: number;
}

export const DeltaWorksheetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command-delta-worksheet-row-height',
    handler: async (accessor: IAccessor, params: IDeltaWorksheetRowHeightCommand) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const { anchorRow, deltaY } = params;
        const anchorRowHeight = worksheet.getRowHeight(anchorRow);
        const destRowHeight = anchorRowHeight + deltaY;

        const rowSelections = selections.filter((r) => r.rangeType === RANGE_TYPE.ROW);
        const rangeType = rowSelections.some((r) => {
            if (r.startRow <= anchorRow && anchorRow <= r.endRow) {
                return true;
            }

            return false;
        })
            ? RANGE_TYPE.ROW
            : RANGE_TYPE.NORMAL;

        let redoMutationParams: ISetWorksheetRowHeightMutationParams;
        if (rangeType === RANGE_TYPE.ROW) {
            redoMutationParams = {
                worksheetId,
                workbookId,
                ranges: rowSelections,
                rowHeight: destRowHeight,
            };
        } else {
            redoMutationParams = {
                worksheetId,
                workbookId,
                rowHeight: destRowHeight,
                ranges: [
                    {
                        startRow: anchorRow,
                        endRow: anchorRow,
                        startColumn: 0,
                        endColumn: worksheet.getMaxColumns() - 1,
                    },
                ],
            };
        }
        const undoMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(
            accessor,
            redoMutationParams
        );

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const result = commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
                },
            });

            return true;
        }

        return true;
    },
};

export interface SetWorksheetRowHeightCommandParams {
    value: number;
}
export const SetWorksheetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-height',
    handler: async (accessor: IAccessor, params: SetWorksheetRowHeightCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) return false;

        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const workbookId = workbook.getUnitId();
        const worksheetId = workbook.getActiveSheet().getSheetId();

        const redoMutationParams: ISetWorksheetRowHeightMutationParams = {
            worksheetId,
            workbookId,
            ranges: selections,
            rowHeight: params.value,
        };
        const undoMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(
            accessor,
            redoMutationParams
        );

        const result = commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
