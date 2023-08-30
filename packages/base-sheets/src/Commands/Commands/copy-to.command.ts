import {
    CommandType,
    ICellData,
    ICellDataMatrix,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IOptionData,
    IRangeData,
    IStyleData,
    IUndoRedoService,
    Nullable,
    ObjectMatrix,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';



export interface ICopyToCommandParams {
    workbookId: string;
    worksheetId: string;
    originRange: IRangeData;
    destinationRange: IRangeData;
    options?: IOptionData | 
}

export const CopyFormatToRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-to',
    handler: async (accessor: IAccessor, params: ICopyToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

     

        const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
            range: [range],
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            value: stylesMatrix.getData(),
        };

        const undoMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(accessor, setRangeStyleMutationParams);
        const result = commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetRangeStyleMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};

