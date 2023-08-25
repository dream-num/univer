import { IAccessor } from '@wendellhu/redi';
import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';

import { ISelectionManager } from '../../Services/tokens';
import { SelectionController } from '../../Controller/Selection/SelectionController';
import { SelectionModel } from '../../Model/SelectionModel';

export interface ISetFontFamilyParams {
    fontFamily: string;
}

/**
 * Set new font family for currently selected cells
 */
export const SetFontFamilyCommand: ICommand<ISetFontFamilyParams> = {
    id: 'sheet.command.set-font-family',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const selectionManager = accessor.gett(ISelectionManager);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        const controls = selectionManager.getCurrentControls();
        const selections = controls?.map((control: SelectionController) => {
            const model: SelectionModel = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });

        const

        // FIXME: 为什么之前有些 command 支持的多 selection 有的不支持？

        return true;
    },
};
