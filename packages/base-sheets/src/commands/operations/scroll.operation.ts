// This file provide operations to change selection of sheets.

import { IRenderManagerService } from '@univerjs/base-render';
import { CommandType, IOperation, IUniverInstanceService } from '@univerjs/core';

import { getSheetObject } from '../../Basics/component-tools';
import { VIEWPORT_KEY } from '../../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { IScrollManagerInsertParam, ScrollManagerService } from '../../services/scroll-manager.service';

export const SetScrollOperation: IOperation<IScrollManagerInsertParam> = {
    id: 'sheet.operation.set-scroll',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const scrollManagerService = accessor.get(ScrollManagerService);
        scrollManagerService.addOrReplaceByParam(params!);
        return true;
    },
};

export interface ISetScrollRelativeOperationParams {
    offsetX?: number;
    offsetY?: number;
}

export const SetScrollRelativeOperation: IOperation<ISetScrollRelativeOperationParams> = {
    id: 'sheet.operation.set-scroll-relative',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const { offsetX = 0, offsetY = 0 } = params || {};
        const currentUniverService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const scene = getSheetObject(currentUniverService, renderManagerService)?.scene;
        if (!scene) {
            return false;
        }
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (!viewport) {
            return false;
        }
        viewport.scrollByOffset(offsetX, offsetY);
        return true;
    },
};
