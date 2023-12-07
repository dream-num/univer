import type { ICellData, ICommand, IMutationInfo, IRange, ObjectMatrixPrimitiveType } from '@univerjs/core';
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
    INTERCEPTOR_POINT,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SheetInterceptorService,
} from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { SetFormatPainterOperation } from '../operations/set-format-painter.operation';
import { checkCellContentInRanges, getClearContentMutationParamsForRanges } from './add-worksheet-merge.command';

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
    worksheetId: string;
    workbookId: string;
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
        const {
            styleValues: value,
            styleRange: range,
            mergeRanges,
            workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
        } = params;

        const currentSelections = range ? [range] : selectionManagerService.getSelectionRanges();
        if (!currentSelections || !currentSelections.length) {
            return false;
        }

        const cellValue = new ObjectMatrix<ICellData>();
        let realCellValue: ObjectMatrixPrimitiveType<ICellData> | undefined;

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
            realCellValue = value as ObjectMatrixPrimitiveType<ICellData>;
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            worksheetId,
            workbookId,
            cellValue: realCellValue ?? cellValue.getMatrix(),
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        if (
            !sheetInterceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.PERMISSION)(null, {
                id: SetRangeValuesCommand.id,
                params: setRangeValuesMutationParams,
            })
        ) {
            return false;
        }

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
        const worksheet = univerInstanceService.getUniverSheetInstance(workbookId)!.getSheetBySheetId(worksheetId)!;

        const mergeRedos: IMutationInfo[] = [];
        const mergeUndos: IMutationInfo[] = [];

        // First we should check if there are values in the going-to-be-merged cells.
        const willRemoveSomeCell = checkCellContentInRanges(worksheet, ranges);

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
        mergeRedos.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
        mergeRedos.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });

        // prepare undo mutations
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);
        mergeUndos.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        mergeUndos.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // add set range values mutations to undo redo mutations
        if (willRemoveSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, workbookId, worksheet, ranges);
            mergeRedos.unshift(...data.redos);
            mergeUndos.push(...data.undos);
        }

        const result = await sequenceExecute([...interceptorRedos, ...mergeRedos], commandService);

        if (setValueMutationResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
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
