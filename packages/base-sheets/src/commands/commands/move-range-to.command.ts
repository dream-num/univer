import {
    CommandType,
    ICellData,
    ICommand,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import {
    ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '../mutations/set-range-values.mutation';

export interface IMoveRangeToCommandParams {
    destinationRange: IRange;
}

export const MoveRangeToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-range-to',
    handler: async (accessor: IAccessor, params: IMoveRangeToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const originRange = selectionManagerService.getSelectionRanges()?.[0];
        if (!originRange) {
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const clearMutationParams: ISetRangeValuesMutationParams = {
            range: [originRange],
            worksheetId,
            workbookId,
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        const clearResult = commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);

        const sheetMatrix = worksheet.getCellMatrix();
        const { startRow, endRow, startColumn, endColumn } = originRange;
        const { startRow: targetStartRow, startColumn: targetStartColumn } = params.destinationRange;

        const targetMatrix = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                targetMatrix.setValue(
                    targetStartRow + (r - startRow),
                    targetStartColumn + (c - startColumn),
                    sheetMatrix.getValue(r, c) || {}
                );
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            range: [params.destinationRange],
            worksheetId,
            workbookId,
            cellValue: targetMatrix.getData(),
        };

        const undoMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        const result = commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);

        if (clearResult && result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            SetRangeValuesMutation.id,
                            undoClearMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(SetRangeValuesMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(
                            SetRangeValuesMutation.id,
                            clearMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(
                                SetRangeValuesMutation.id,
                                setRangeValuesMutationParams
                            );
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
