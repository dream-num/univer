import {
    ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '@univerjs/base-sheets';
import { AddWorksheetMergeCommand } from '@univerjs/base-sheets/commands/commands/add-worksheet-merge.command.js';
import { SetRangeValuesCommand } from '@univerjs/base-sheets/commands/commands/set-range-values.command.js';
import { SetSelectionsOperation } from '@univerjs/base-sheets/commands/operations/selection.operation.js';
import {
    CommandType,
    ICellData,
    ICommand,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IAutoFillCommandParams {
    worksheetId: string;
    workbookId: string;
    applyRange: IRange;
    selectionRange: IRange;
    applyDatas: ICellData[][];
    applyMergeRanges?: IRange[];
}

export const AutoFillCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.auto-fill',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IAutoFillCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const { applyRange, selectionRange, applyDatas, workbookId, worksheetId, applyMergeRanges } = params || {};
        if (!applyRange || !applyDatas || !selectionRange) {
            return false;
        }
        commandService.executeCommand(SetRangeValuesCommand.id, {
            ...params,
            range: applyRange,
            value: applyDatas,
        });

        if (applyMergeRanges) {
            commandService.executeCommand(AddWorksheetMergeCommand.id, {
                selections: applyMergeRanges,
                workbookId,
                worksheetId,
            });
        }

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
            workbookId,
            worksheetId,
        });
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
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const worksheetId = worksheet.getSheetId();
        const { clearRange, selectionRange } = params;

        const clearMutationParams: ISetRangeValuesMutationParams = {
            range: [clearRange],
            worksheetId,
            workbookId,
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
            workbookId,
            worksheetId,
        });

        const result = commandService.syncExecuteCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                URI: workbookId,
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

// Generate cellValue from range and set v/m to null
function generateNullCellValue(range: IRange[]): ObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((r: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = r;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, {
                    v: null,
                    m: null,
                });
            }
        }
    });

    return cellValue.getData();
}
