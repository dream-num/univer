import {
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
    sequenceExecute,
    SheetInterceptorService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import {
    ISetWorksheetRowHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowHeightMutationFactory,
    SetWorksheetRowIsAutoHeightMutation,
    SetWorksheetRowIsAutoHeightMutationFactory,
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
        const rangeType = rowSelections.some(({ range }) => {
            const { startRow, endRow } = range;

            return startRow <= anchorRow && anchorRow <= endRow;
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

        const redoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams = {
            workbookId,
            worksheetId,
            ranges: redoMutationParams.ranges,
            autoHeightInfo: false,
        };

        const undoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams =
            SetWorksheetRowIsAutoHeightMutationFactory(accessor, redoSetIsAutoHeightParams);

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const result = await sequenceExecute(
            [
                {
                    id: SetWorksheetRowHeightMutation.id,
                    params: redoMutationParams,
                },
                {
                    id: SetWorksheetRowIsAutoHeightMutation.id,
                    params: redoSetIsAutoHeightParams,
                },
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo: async () =>
                    (
                        await sequenceExecute(
                            [
                                {
                                    id: SetWorksheetRowHeightMutation.id,
                                    params: undoMutationParams,
                                },
                                {
                                    id: SetWorksheetRowIsAutoHeightMutation.id,
                                    params: undoSetIsAutoHeightParams,
                                },
                            ],
                            commandService
                        )
                    ).result,
                redo: async () =>
                    (
                        await sequenceExecute(
                            [
                                {
                                    id: SetWorksheetRowHeightMutation.id,
                                    params: redoMutationParams,
                                },
                                {
                                    id: SetWorksheetRowIsAutoHeightMutation.id,
                                    params: redoSetIsAutoHeightParams,
                                },
                            ],
                            commandService
                        )
                    ).result,
            });
            return true;
        }

        return false;
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

        const selections = selectionManagerService.getSelectionRanges();
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

        const redoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams = {
            workbookId,
            worksheetId,
            ranges: redoMutationParams.ranges,
            autoHeightInfo: false,
        };

        const undoSetIsAutoHeightParams: ISetWorksheetRowIsAutoHeightMutationParams =
            SetWorksheetRowIsAutoHeightMutationFactory(accessor, redoSetIsAutoHeightParams);

        const result = await sequenceExecute(
            [
                {
                    id: SetWorksheetRowHeightMutation.id,
                    params: redoMutationParams,
                },
                {
                    id: SetWorksheetRowIsAutoHeightMutation.id,
                    params: redoSetIsAutoHeightParams,
                },
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo: async () =>
                    (
                        await sequenceExecute(
                            [
                                {
                                    id: SetWorksheetRowHeightMutation.id,
                                    params: undoMutationParams,
                                },
                                {
                                    id: SetWorksheetRowIsAutoHeightMutation.id,
                                    params: undoSetIsAutoHeightParams,
                                },
                            ],
                            commandService
                        )
                    ).result,
                redo: async () =>
                    (
                        await sequenceExecute(
                            [
                                {
                                    id: SetWorksheetRowHeightMutation.id,
                                    params: redoMutationParams,
                                },
                                {
                                    id: SetWorksheetRowIsAutoHeightMutation.id,
                                    params: redoSetIsAutoHeightParams,
                                },
                            ],
                            commandService
                        )
                    ).result,
            });
            return true;
        }

        return false;
    },
};

export interface ISetRowAutoHeightCommandParams {}

export const SetWorksheetRowIsAutoHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-is-auto-height',
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const ranges = selectionManagerService.getSelectionRanges();
        if (!ranges?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        const redoMutationParams: ISetWorksheetRowIsAutoHeightMutationParams = {
            workbookId,
            worksheetId,
            ranges,
            autoHeightInfo: true, // Hard code first, maybe it will change by the menu item in the future.
        };

        const undoMutationParams: ISetWorksheetRowIsAutoHeightMutationParams =
            SetWorksheetRowIsAutoHeightMutationFactory(accessor, redoMutationParams);

        const setIsAutoHeightResult = commandService.syncExecuteCommand(
            SetWorksheetRowIsAutoHeightMutation.id,
            redoMutationParams
        );

        const { undos, redos } = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetWorksheetRowIsAutoHeightCommand.id,
            params: redoMutationParams,
        });

        const result = sequenceExecute([...redos], commandService);
        if (setIsAutoHeightResult && result.result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo: async () =>
                    (
                        await sequenceExecute(
                            [{ id: SetWorksheetRowIsAutoHeightMutation.id, params: undoMutationParams }, ...undos],
                            commandService
                        )
                    ).result,
                redo: async () =>
                    (
                        await sequenceExecute(
                            [{ id: SetWorksheetRowIsAutoHeightMutation.id, params: redoMutationParams }, ...redos],
                            commandService
                        )
                    ).result,
            });

            return true;
        }

        return false;
    },
};
