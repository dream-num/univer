/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
    /**
     * The index of row in spreadsheet.
     * e.g. if row start 10 at current viewport after freeze, and scroll value is zero, startRow is 0.
     * e.g. if scrolled about 2 rows, now top is 12, then sheetViewStartRow is 2.
     */
    sheetViewStartRow?: number;

    /**
     * Not the index of col in spreadsheet, but index of first column in current viewport.
     * e.g. if col start C at current viewport after freeze, and scroll value is zero, startColumn is 0.
     * e.g. if scrolled about 2 columns, now left is E, then sheetViewStartColumn is 2.
     */
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
        // const { xSplit, ySplit } = target.worksheet.getConfig().freeze;

        return commandService.executeCommand(SetScrollOperation.id, {
            unitId,
            sheetId: subUnitId,

            // why + ySplit? receiver - ySplit in scroll.operation.ts
            // sheetViewStartRow: sheetViewStartRow + ySplit,
            // sheetViewStartColumn: sheetViewStartColumn + xSplit,
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
        const { xSplit, ySplit } = target.worksheet.getConfig().freeze;
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(SetScrollOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            // why + ySplit? receiver - ySplit in scroll.operation.ts
            // sheetViewStartRow: sheetViewStartRow + ySplit,
            // sheetViewStartColumn: sheetViewStartColumn + xSplit,
            sheetViewStartRow: sheetViewStartRow ?? (currentRow ?? 0 + ySplit),
            sheetViewStartColumn: sheetViewStartColumn ?? (currentColumn ?? 0 + xSplit),
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
