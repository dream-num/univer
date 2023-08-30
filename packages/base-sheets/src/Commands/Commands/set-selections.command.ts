import { SetSelectionsOperation } from '@Commands/Operations/selection.operation';
import { CommandType, Direction, ICommand, ICommandService, ICurrentUniverService, IRangeData } from '@univerjs/core';

import { ISelectionManager } from '../../Services/tokens';

export interface IChangeSelectionCommandParams {
    direction: Direction;
    toEnd?: boolean;
}

export const ChangeSelectionCommand: ICommand<IChangeSelectionCommandParams> = {
    id: 'sheet.command.change-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const currentWorksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);

        const selections = selectionManager.getCurrentSelections();
        if (!selections.length) {
            return false;
        }

        const { direction } = params;
        const originSelection = selections[selections.length - 1];
        const destRange: IRangeData = { ...originSelection };

        // FIXME: some error here. The selection does not know if there is a span cell.
        switch (direction) {
            case Direction.UP:
                destRange.startRow = Math.max(0, originSelection.startRow - 1);
                destRange.endRow = destRange.startRow;
                break;
            case Direction.DOWN:
                destRange.startRow = Math.min(originSelection.endRow + 1, currentWorksheet.getRowCount() - 1);
                destRange.endRow = destRange.startRow;
                break;
            case Direction.LEFT:
                destRange.startColumn = Math.max(0, originSelection.startColumn - 1);
                destRange.endColumn = destRange.startColumn;
                break;
            case Direction.RIGHT:
                destRange.startColumn = Math.min(originSelection.endColumn + 1, currentWorksheet.getColumnCount() - 1);
                destRange.endColumn = destRange.startColumn;
                break;
            default:
                break;
        }

        // TODO: deal with `toEnd` parameter here

        commandService.executeCommand(SetSelectionsOperation.id, {
            sheetId: currentWorksheet.getSheetId(),
            selections: [
                {
                    selection: destRange,
                },
            ],
        });

        return true;
    },
};

export interface IExpandSelectionCommandParams {
    direction: Direction;
    toEnd?: boolean;
}

export const ExpandSelectionCommand: ICommand<IExpandSelectionCommandParams> = {
    id: 'sheet.command.expand-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => true,
};