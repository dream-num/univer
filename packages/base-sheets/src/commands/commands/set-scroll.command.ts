import { CommandType, ICommand, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { SetScrollOperation, SetScrollRelativeOperation } from '../operations/scroll.operation';

export interface IScrollCommandParams {
    sheetViewStartRow?: number;
    sheetViewStartColumn?: number;
}

export interface ISetScrollRelativeCommandParams {
    offsetX?: number;
    offsetY?: number;
}
/**
 * This command is used to manage the scroll by relative offset
 */
export const SetScrollRelativeCommand: ICommand<ISetScrollRelativeCommandParams> = {
    id: 'sheet.command.set-scroll-relative',
    type: CommandType.COMMAND,
    handler: async (accessor, params = { offsetX: 0, offsetY: 0 }) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SetScrollRelativeOperation.id, params);
    },
};

/**
 * This command is used to manage the scroll position of the current view by specifying the cell index of the top left cell
 */
export const ScrollCommand: ICommand<IScrollCommandParams> = {
    id: 'sheet.command.scroll-view',
    type: CommandType.COMMAND,
    handler: async (accessor, params = { sheetViewStartRow: 0, sheetViewStartColumn: 0 }) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const currentWorkbook = univerInstanceService.getCurrentUniverSheetInstance();
        const currentWorksheet = currentWorkbook.getActiveSheet();

        if (!currentWorksheet) {
            return false;
        }

        const commandService = accessor.get(ICommandService);

        const { sheetViewStartRow, sheetViewStartColumn } = params;

        return commandService.executeCommand(SetScrollOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            sheetViewStartRow,
            sheetViewStartColumn,
        });
    },
};

/**
 * This command is reset the scroll position of the current view to 0 ,0
 */
export const RestScrollCommand: ICommand<{}> = {
    id: 'sheet.command.scroll-view-reset',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const currentWorkbook = univerInstanceService.getCurrentUniverSheetInstance();
        const currentWorksheet = currentWorkbook.getActiveSheet();

        if (!currentWorksheet) {
            return false;
        }

        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(SetScrollOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
        });
    },
};
