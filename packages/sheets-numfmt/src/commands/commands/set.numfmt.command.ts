import type { ICommand, IMutationInfo } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import type {
    FormatType,
    IRemoveNumfmtMutationParams,
    ISetCellsNumfmt,
    ISetNumfmtMutationParams,
} from '@univerjs/sheets';
import {
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    transformCellsToRange,
} from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetNumfmtCommandParams {
    values: Array<{ pattern?: string; row: number; col: number; type?: FormatType }>;
}

export const SetNumfmtCommand: ICommand<ISetNumfmtCommandParams> = {
    id: 'sheet.command.numfmt.set.numfmt',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const worksheetId = worksheet.getSheetId();
        const setCells = params.values.filter((value) => !!value.pattern) as ISetCellsNumfmt;
        const removeCells = params.values.filter((value) => !value.pattern);
        const setRedos = transformCellsToRange(workbookId, worksheetId, setCells);
        const removeRedos: IRemoveNumfmtMutationParams = {
            workbookId,
            worksheetId,
            ranges: removeCells.map((cell) => ({
                startColumn: cell.col,
                startRow: cell.row,
                endColumn: cell.col,
                endRow: cell.row,
            })),
        };
        const redos: Array<IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams>> = [];
        const undos: Array<IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams>> = [];
        if (setCells.length) {
            redos.push({
                id: SetNumfmtMutation.id,
                params: setRedos,
            });
            const undo = factorySetNumfmtUndoMutation(accessor, setRedos);
            undos.push(...undo);
        }
        if (removeCells.length) {
            redos.push({
                id: RemoveNumfmtMutation.id,
                params: removeRedos,
            });
            const undo = factoryRemoveNumfmtUndoMutation(accessor, removeRedos);
            undos.push(...undo);
        }

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }
        return result;
    },
};
