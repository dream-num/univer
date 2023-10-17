import { CommandType, ICommand, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { ScrollManagerService } from '../../services/scroll-manager.service';
import { SetScrollOperation } from '../operations/scroll.operation';

export interface IScrollCommandParams {
    offsetX: number;
    offsetY: number;
    sheetViewStartRow: number;
    sheetViewStartColumn: number;
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
        const scrollManagerService = accessor.get(ScrollManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const { xSplit, ySplit } = worksheet.getConfig().freeze;
        const currentScroll = scrollManagerService.getCurrentScroll();
        const { offsetX = 0, offsetY = 0 } = params || {};
        const {
            sheetViewStartRow = 0,
            sheetViewStartColumn = 0,
            offsetX: currentOffsetX = 0,
            offsetY: currentOffsetY = 0,
        } = currentScroll || {};

        return commandService.executeCommand(SetScrollOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            sheetViewStartRow: sheetViewStartRow + ySplit,
            sheetViewStartColumn: sheetViewStartColumn + xSplit,
            offsetX: currentOffsetX + offsetX,
            offsetY: currentOffsetY + offsetY,
        });
    },
};

/**
 * This command is used to manage the scroll position of the current view by specifying the cell index of the top left cell
 */
export const ScrollCommand: ICommand<IScrollCommandParams> = {
    id: 'sheet.command.scroll-view',
    type: CommandType.COMMAND,
    handler: async (accessor, params = { sheetViewStartRow: 0, sheetViewStartColumn: 0, offsetX: 0, offsetY: 0 }) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const currentWorkbook = univerInstanceService.getCurrentUniverSheetInstance();
        const currentWorksheet = currentWorkbook.getActiveSheet();

        if (!currentWorksheet) {
            return false;
        }

        const commandService = accessor.get(ICommandService);

        const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = params;

        return commandService.executeCommand(SetScrollOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
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
