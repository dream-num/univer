import {
    CommandType,
    ICellV,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import {
    ISetRangeFormattedValueMutationParams,
    SetRangeFormattedValueMutation,
    SetRangeFormattedValueUndoMutationFactory,
} from '../mutations/set-range-formatted-value.mutation';

/**
 * The command to trim whitespace.
 */
export const TrimWhitespaceCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.trim-whitespace',

    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) return false;

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const worksheet = univerInstanceService.getUniverSheetInstance(workbookId)?.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        const sheetMatrix = worksheet.getCellMatrix();
        const cellValue = new ObjectMatrix<ICellV>();

        for (let i = 0; i < selections.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = selections[i];
            const regx = /\s+/g;
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    const value = sheetMatrix.getValue(r, c)!.m?.replace(regx, '');
                    cellValue.setValue(r, c, value || '');
                }
            }
        }

        const setRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams = {
            range: selections,
            worksheetId,
            workbookId,
            value: cellValue.getData(),
        };

        const undoSetRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams =
            SetRangeFormattedValueUndoMutationFactory(accessor, setRangeFormattedValueMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(
            SetRangeFormattedValueMutation.id,
            setRangeFormattedValueMutationParams
        );
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(
                        SetRangeFormattedValueMutation.id,
                        undoSetRangeFormattedValueMutationParams
                    );
                },
                redo() {
                    return commandService.executeCommand(
                        SetRangeFormattedValueMutation.id,
                        setRangeFormattedValueMutationParams
                    );
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
