import { CommandType, ICommand, ICommandService } from '@univerjs/core';

import { SetZoomRatioOperation } from '../operations/set-zoom-ratio.operation';

export interface ISetZoomRatioCommandParams {
    zoomRatio: number;
    workbookId: string;
    worksheetId: string;
}

/**
 * Zoom
 */
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
