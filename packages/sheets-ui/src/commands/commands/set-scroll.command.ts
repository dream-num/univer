/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { ScrollManagerService } from '../../services/scroll-manager.service';
import { SetScrollOperation } from '../operations/scroll.operation';

export interface IScrollCommandParams {
    offsetX?: number;
    offsetY?: number;
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
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const currentWorkbook = univerInstanceService.getCurrentUniverSheetInstance();
        const currentWorksheet = currentWorkbook.getActiveSheet();
        const scrollManagerService = accessor.get(ScrollManagerService);
        const currentScroll = scrollManagerService.getCurrentScroll();

        if (!currentWorksheet) {
            return false;
        }

        const commandService = accessor.get(ICommandService);

        const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = params;
        const {
            sheetViewStartColumn: currentColumn,
            sheetViewStartRow: currentRow,
            offsetX: currentOffsetX,
            offsetY: currentOffsetY,
        } = currentScroll || {};

        return commandService.executeCommand(SetScrollOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            sheetViewStartRow: sheetViewStartRow ?? currentRow,
            sheetViewStartColumn: sheetViewStartColumn ?? currentColumn,
            offsetX: offsetX ?? currentOffsetX,
            offsetY: offsetY ?? currentOffsetY,
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
