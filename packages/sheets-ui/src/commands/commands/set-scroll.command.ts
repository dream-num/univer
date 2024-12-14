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

import type { ICommand, IRange, Nullable } from '@univerjs/core';
import type { IScrollState } from '../../services/scroll-manager.service';

import { CommandType, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { SheetsScrollRenderController } from '../../controllers/render-controllers/scroll.render-controller';
import { SheetScrollManagerService } from '../../services/scroll-manager.service';
import { SetScrollOperation } from '../operations/scroll.operation';

export interface ISetScrollRelativeCommandParams {
    offsetX?: number;
    offsetY?: number;
}

export interface IScrollCommandParams {
    offsetX?: number;
    offsetY?: number;
    sheetViewStartRow?: number;
    sheetViewStartColumn?: number;
}

/**
 * This command is used to manage the scroll by relative offset
 * Usually triggered by wheel event.
 * NOT same as ScrollCommand, which is usually triggered by scrollbar.
 */
export const SetScrollRelativeCommand: ICommand<ISetScrollRelativeCommandParams> = {
    id: 'sheet.command.set-scroll-relative',
    type: CommandType.COMMAND,
    // offsetXY derived from mouse wheel event
    // this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY });
    handler: async (accessor, params: ISetScrollRelativeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerSrv = accessor.get(IRenderManagerService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const scrollManagerService = renderManagerSrv.getRenderById(unitId)!.with(SheetScrollManagerService);
        const currentScroll = scrollManagerService.getCurrentScrollState();
        const { offsetX = 0, offsetY = 0 } = params || {};
        const {
            sheetViewStartRow = 0,
            sheetViewStartColumn = 0,
            offsetX: currentOffsetX = 0,
            offsetY: currentOffsetY = 0,
        } = currentScroll || {};
        // the receiver is scroll.operation.ts
        return commandService.executeCommand(SetScrollOperation.id, {
            unitId,
            sheetId: subUnitId,
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX: currentOffsetX + offsetX, // currentOffsetX + offsetX may be negative or over max
            offsetY: currentOffsetY + offsetY,
        });
    },
};

/**
 * This command is used to manage the scroll position of the current view by specifying the cell index of the top left cell
 * Usually triggered by dragging scroll bar and click scroll track or moving selection range.
 * NOT same as SetScrollRelativeCommand which usually trigger by wheelevent.
 */
export const ScrollCommand: ICommand<IScrollCommandParams> = {
    id: 'sheet.command.scroll-view',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerSrv = accessor.get(IRenderManagerService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet, unitId } = target;
        const scrollManagerService = renderManagerSrv.getRenderById(unitId)!.with(SheetScrollManagerService);
        const currentScroll: Readonly<Nullable<IScrollState>> = scrollManagerService.getCurrentScrollState();

        if (!worksheet) {
            return false;
        }

        const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = params;
        const {
            sheetViewStartColumn: currentColumn,
            sheetViewStartRow: currentRow,
            offsetX: currentOffsetX,
            offsetY: currentOffsetY,
        } = currentScroll || {};

        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(SetScrollOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            sheetViewStartRow: sheetViewStartRow ?? (currentRow ?? 0),
            sheetViewStartColumn: sheetViewStartColumn ?? (currentColumn ?? 0),
            offsetX: offsetX ?? currentOffsetX,
            offsetY: offsetY ?? currentOffsetY,
        });
    },
};

export interface IScrollToCellCommandParams {
    range: IRange;
    forceTop?: boolean;
    forceLeft?: boolean;
}

/**
 * The command is used to scroll to the specific cell if the target cell is not in the viewport.
 */
export const ScrollToCellCommand: ICommand<IScrollToCellCommandParams> = {
    id: 'sheet.command.scroll-to-cell',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const instanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const scrollController = renderManagerService
            .getRenderById(instanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)!.getUnitId())!
            .with(SheetsScrollRenderController);
        return scrollController.scrollToRange(params!.range, params!.forceTop, params!.forceLeft);
    },
};

/**
 * This command is reset the scroll position of the current view to 0, 0
 */
export const ResetScrollCommand: ICommand = {
    id: 'sheet.command.scroll-view-reset',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { subUnitId, unitId } = target;
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SetScrollOperation.id, {
            unitId,
            sheetId: subUnitId,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
        });
    },
};
