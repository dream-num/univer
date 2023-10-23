import { SelectionManagerService, SetCopySelectionsOperation } from '@univerjs/base-sheets';
import { COPY_SELECTION_PLUGIN_NAME } from '@univerjs/base-sheets/services/selection-manager.service.js';
import { CommandType, ICommand, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { SetFormatPainterOperation } from '../operations/set-format-painter.operation';

export interface ISetFormatPainterCommandParams {
    status: FormatPainterStatus;
}

export const SetInfiniteFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-infinite-format-painter',
    handler: async (accessor: IAccessor) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        const status = formatPainterService.getStatus();
        let newStatus: FormatPainterStatus;
        if (status !== FormatPainterStatus.OFF) {
            newStatus = FormatPainterStatus.OFF;
        } else {
            newStatus = FormatPainterStatus.INFINITE;
        }
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SetCopySelectionCommand.id, {
            show: newStatus === FormatPainterStatus.INFINITE,
        });

        return commandService.executeCommand(SetFormatPainterOperation.id, { status: newStatus });
    },
};

export const SetOnceFormatPainterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-once-format-painter',
    handler: async (accessor: IAccessor) => {
        const formatPainterService = accessor.get(IFormatPainterService);
        const status = formatPainterService.getStatus();
        let newStatus: FormatPainterStatus;
        if (status !== FormatPainterStatus.OFF) {
            newStatus = FormatPainterStatus.OFF;
        } else {
            newStatus = FormatPainterStatus.ONCE;
        }
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SetCopySelectionCommand.id, {
            show: newStatus === FormatPainterStatus.ONCE,
        });
        return commandService.executeCommand(SetFormatPainterOperation.id, { status: newStatus });
    },
};

export interface ISetCopySelectionCommandParams {
    show?: boolean;
}

export const SetCopySelectionCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-copy-selection',
    handler: async (accessor: IAccessor, params: ISetCopySelectionCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentService = accessor.get(IUniverInstanceService);
        const workbookId = currentService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        let setSelectionsParam;
        if (params.show) {
            const selectionManagerService = accessor.get(SelectionManagerService);
            const selections = selectionManagerService.getSelections();
            if (!selections || selections.length === 0) {
                return false;
            }
            const { range, primary, style } = selections[0];
            setSelectionsParam = {
                workbookId,
                worksheetId,
                pluginName: COPY_SELECTION_PLUGIN_NAME,
                selections: [{ range, primary, style: null }],
            };
        } else {
            setSelectionsParam = {
                workbookId,
                worksheetId,
                pluginName: COPY_SELECTION_PLUGIN_NAME,
                selections: [],
            };
        }

        return commandService.executeCommand(SetCopySelectionsOperation.id, setSelectionsParam);
    },
};
