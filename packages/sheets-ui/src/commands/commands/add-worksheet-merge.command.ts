import type { ICommand, IMutationInfo, IRange, Worksheet } from '@univerjs/core';
import {
    CommandType,
    Dimension,
    ICellData,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    sequenceExecute,
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
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '@univerjs/sheets';
import { IConfirmService } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

export interface IAddMergeCommandParams {
    value?: Dimension.ROWS | Dimension.COLUMNS;
    selections: IRange[];
    workbookId: string;
    worksheetId: string;
}

function checkCellContentInRanges(worksheet: Worksheet, ranges: IRange[]): boolean {
    return ranges.some((range) => checkCellContentInRange(worksheet, range));
}

function checkCellContentInRange(worksheet: Worksheet, range: IRange): boolean {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

    let someCellGoingToBeRemoved = false;
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn) && worksheet.cellHasValue(cellData)) {
            someCellGoingToBeRemoved = true;
            return false;
        }
    });
    return someCellGoingToBeRemoved;
}

function getClearContentMutationParamsForRanges(
    accessor: IAccessor,
    workbookId: string,
    worksheet: Worksheet,
    ranges: IRange[]
): {
    undos: IMutationInfo[];
    redos: IMutationInfo[];
} {
    const undos: IMutationInfo[] = [];
    const redos: IMutationInfo[] = [];

    const worksheetId = worksheet.getSheetId();

    // Use the following file as a reference.
    // packages/sheets/src/commands/commands/clear-selection-all.command.ts
    // packages/sheets/src/commands/mutations/set-range-values.mutation.ts
    ranges.forEach((range) => {
        const redoMatrix = getClearContentMutationParamForRange(worksheet, range);
        const redoMutationParams: ISetRangeValuesMutationParams = {
            workbookId,
            worksheetId,
            cellValue: redoMatrix.getData(),
        };
        const undoMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            redoMutationParams
        );

        undos.push({ id: SetRangeValuesMutation.id, params: undoMutationParams });
        redos.push({ id: SetRangeValuesMutation.id, params: redoMutationParams });
    });

    return {
        undos,
        redos,
    };
}

function getClearContentMutationParamForRange(worksheet: Worksheet, range: IRange): ObjectMatrix<ICellData> {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);
    const redoMatrix = new ObjectMatrix<ICellData>();
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn)) {
            redoMatrix.setValue(row, col, null);
        }
    });

    return redoMatrix;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IAddMergeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const confirmService = accessor.get(IConfirmService);

        const workbookId = params.workbookId;
        const worksheetId = params.worksheetId;
        const selections = params.selections;
        const ranges = getAddMergeMutationRangeByType(selections, params.value);
        const worksheet = univerInstanceService.getUniverSheetInstance(workbookId)!.getSheetBySheetId(worksheetId)!;

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // First we should check if there are values in the going-to-be-merged cells.
        const willClearSomeCell = checkCellContentInRanges(worksheet, ranges);
        if (willClearSomeCell) {
            const result = await confirmService.confirm({
                id: 'sheet.confirm.add-worksheet-merge',
                title: {
                    value: 'sheet.confirm.add-worksheet-merge.title',
                },
            });

            if (!result) {
                return false;
            }
        }

        // prepare redo mutations
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        redoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
        redoMutations.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });

        // prepare undo mutations
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);
        undoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        undoMutations.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // add set range values mutations to undo redo mutations
        if (willClearSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, workbookId, worksheet, ranges);
            redoMutations.unshift(...data.redos);
            undoMutations.push(...data.undos);
        }

        const result = sequenceExecute(redoMutations, commandService);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
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
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            selections,
            workbookId,
            worksheetId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeVerticalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-vertical',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.COLUMNS,
            selections,
            workbookId,
            worksheetId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeHorizontalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-horizontal',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = workSheet.getSheetId();
        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.ROWS,
            selections,
            workbookId,
            worksheetId,
        } as IAddMergeCommandParams);
    },
};
