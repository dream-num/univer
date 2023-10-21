import {
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import {
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowHeightMutationParams,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowHeightMutationFactory,
} from '../mutations/set-worksheet-row-height.mutation';

export interface IDeltaRowHeightCommand {
    anchorRow: number;
    deltaY: number;
}

export const DeltaRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delta-row-height',
    handler: async (accessor: IAccessor, params: IDeltaRowHeightCommand) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        if (!selections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const { anchorRow, deltaY } = params;
        const anchorRowHeight = worksheet.getRowHeight(anchorRow);
        const destRowHeight = anchorRowHeight + deltaY;

        const rowSelections = selections.filter((s) => s.range.rangeType === RANGE_TYPE.ROW);
        const rangeType = rowSelections.some((s) => {
            const r = s.range;
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
                ranges: rowSelections.map((s) => Rectangle.clone(s.range)),
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

export interface ISetRowAutoHeightCommandParams {}

export const SetRowAutoHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-auto-height',
    handler: async (accessor: IAccessor, params?: ISetRowAutoHeightCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetSkeletonService = accessor.get(SheetSkeletonManagerService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const { skeleton } = sheetSkeletonService.getCurrent()!;
        const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(selections);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheetId = workbook.getActiveSheet().getSheetId();

        console.log(selections, workbookId, worksheetId);

        const redoMutationParams: ISetWorksheetRowAutoHeightMutationParams = {
            worksheetId,
            workbookId,
            rowsAutoHeightInfo,
        };

        // const undoMutationParams: ISetWorksheetRowAutoHeightMutationParams = SetWorksheetRowHeightMutationFactory(
        //     accessor,
        //     redoMutationParams
        // );

        const result = commandService.executeCommand(SetWorksheetRowAutoHeightMutation.id, redoMutationParams);
        console.log(result);
        // if (result) {
        //     undoRedoService.pushUndoRedo({
        //         URI: workbookId,
        //         undo() {
        //             return commandService.executeCommand(SetWorksheetRowHeightMutation.id, undoMutationParams);
        //         },
        //         redo() {
        //             return commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
        //         },
        //     });

        //     return true;
        // }
        return true;
    },
};

export interface ISetRowHeightCommandParams {
    value: number;
}
export const SetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-height',
    handler: async (accessor: IAccessor, params: ISetRowHeightCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
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
