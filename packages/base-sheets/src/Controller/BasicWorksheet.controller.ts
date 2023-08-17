import { IAccessor, IDisposable } from '@wendellhu/redi';
import { ICommand, CommandType, ICommandService, ICurrentUniverService, IOptionData, IClearRangeActionData, ClearRangeAction, Command, CommandManager } from '@univerjs/core';

import { ISelectionManager } from '../Services/tokens';
import { SelectionController } from './Selection/SelectionController';
import { SelectionModel } from '../Model/SelectionModel';

export class BasicWorksheetController implements IDisposable {
    constructor(@ICommandService _commandService: ICommandService) {
        _commandService.registerCommand(ClearSelectionContentCommand);
    }

    dispose(): void {}

    onInitialize() {}
}

export const ClearSelectionContentCommand: ICommand = {
    id: 'sheet.clear-selection-content',
    type: CommandType.MUTATION,
    handler: async (accessor: IAccessor, option: IOptionData) => {
        // TODO: these logics should be moved outside of the command?

        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandManager = accessor.get(CommandManager);
        const selectionManager = accessor.get(ISelectionManager);

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

        if (!selections) {
            return false;
        }

        const range = selections[0];
        const options = {
            formatOnly: true,
            contentsOnly: true,
        };
        const setValue: IClearRangeActionData = {
            sheetId: worksheet.getSheetId(),
            actionName: ClearRangeAction.NAME,
            options,
            rangeData: range,
        };

        const command = new Command(
            {
                WorkBookUnit: workbook,
            },
            setValue
        );

        commandManager.invoke(command);

        return true;
    },
};
