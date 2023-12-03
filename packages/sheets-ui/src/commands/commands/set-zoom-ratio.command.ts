import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { SHEET_ZOOM_RANGE } from '../../common/keys';
import { SetZoomRatioOperation } from '../operations/set-zoom-ratio.operation';

export interface ISetZoomRatioCommandParams {
    zoomRatio: number;
    workbookId: string;
    worksheetId: string;
}
export interface IChangeZoomRatioCommandParams {
    reset?: boolean;
    delta: number;
}

/**
 * Zoom
 */

export const ChangeZoomRatioCommand: ICommand<IChangeZoomRatioCommandParams> = {
    id: 'sheet.command.change-zoom-ratio',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const { delta, reset } = params;
        const workbook = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        let zoom = reset ? 100 : Math.round((worksheet.getConfig().zoomRatio + delta) * 100);
        zoom = Math.max(SHEET_ZOOM_RANGE[0], zoom);
        zoom = Math.min(SHEET_ZOOM_RANGE[1], zoom);
        const zoomRatio = zoom / 100;

        return accessor.get(ICommandService).executeCommand(SetZoomRatioOperation.id, {
            workbookId,
            worksheetId,
            zoomRatio,
        });
    },
};

export const SetZoomRatioCommand: ICommand<ISetZoomRatioCommandParams> = {
    id: 'sheet.command.set-zoom-ratio',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const { workbookId, worksheetId, zoomRatio } = params;

        return accessor.get(ICommandService).executeCommand(SetZoomRatioOperation.id, {
            workbookId,
            worksheetId,
            zoomRatio,
        });
    },
};
