import {
    CommandType,
    ICommand,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    Nullable,
    RANGE_TYPE,
    sequenceExecute,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetColHiddenMutationParams,
    ISetColVisibleMutationParams,
    SetColHiddenMutation,
    SetColHiddenUndoMutationFactory,
    SetColVisibleMutation,
    SetColVisibleUndoMutationFactory,
} from '../mutations/set-col-visible.mutation';
import { ISetSelectionsOperationParams, SetSelectionsOperation } from '../operations/selection.operation';
import { getPrimaryForRange } from './utils/selection-util';

export interface ISetSpecificColsVisibleCommandParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetSpecificColsVisibleCommand: ICommand<ISetSpecificColsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible-on-cols',
    handler: async (accessor, params: ISetSpecificColsVisibleCommandParams) => {
        const { workbookId, worksheetId, ranges } = params;

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getUniverSheetInstance(workbookId)!
            .getSheetBySheetId(worksheetId)!;

        const redoMutationParams: ISetColVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoMutationParams = SetColVisibleUndoMutationFactory(accessor, redoMutationParams);
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: ranges.map((r) => ({ range: r, primary: getPrimaryForRange(r, worksheet), style: null })),
        };
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                { id: SetColVisibleMutation.id, params: redoMutationParams },
                { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
            ],
            commandService
        );

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                async undo() {
                    return sequenceExecute(
                        [
                            { id: SetColHiddenMutation.id, params: undoMutationParams },
                            { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                        ],
                        commandService
                    ).result;
                },

                async redo() {
                    return sequenceExecute(
                        [
                            { id: SetColVisibleMutation.id, params: redoMutationParams },
                            { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                        ],
                        commandService
                    ).result;
                },
            });

            return true;
        }
        return true;
    },
};

export const SetSelectedColsVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selected-cols-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
        if (!ranges?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        // `ranges` would not overlap each other, so `hiddenRanges` would not overlap each other either
        const hiddenRanges = ranges.map((r) => worksheet.getHiddenCols(r.startColumn, r.endColumn)).flat();

        return accessor
            .get(ICommandService)
            .executeCommand<ISetSpecificColsVisibleCommandParams>(SetSpecificColsVisibleCommand.id, {
                workbookId,
                worksheetId,
                ranges: hiddenRanges,
            });
    },
};

export const SetColHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-hidden',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
        if (!ranges?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const redoMutationParams: ISetColHiddenMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: ranges.map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                { id: SetColHiddenMutation.id, params: redoMutationParams },
                { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
            ],
            commandService
        );
        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            const undoMutationParams = SetColHiddenUndoMutationFactory(accessor, redoMutationParams);
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                async undo() {
                    return sequenceExecute(
                        [
                            { id: SetColVisibleMutation.id, params: undoMutationParams },
                            { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                        ],
                        commandService
                    ).result;
                },
                async redo() {
                    return sequenceExecute(
                        [
                            { id: SetColHiddenMutation.id, params: redoMutationParams },
                            { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                        ],
                        commandService
                    ).result;
                },
            });
            return true;
        }

        return false;
    },
};

/**
 * Get the selections after hiding cols.
 *
 * @param worksheet the worksheet the command invoked on
 * @param ranges cols to be hidden
 */
function getSelectionsAfterHiding(ranges: IRange[]): IRange[] {
    const merged = mergeSelections(ranges);
    // TODO@wzhudev: actually we should dedupe selections here
    return merged.map((range) => {
        // prefer the left selection
        // we don't have to check if range.endColumn === lastColumn because this would be
        // forbidden in handler of SetColHiddenCommand
        const column = range.startColumn === 0 ? range.endColumn + 1 : range.startColumn - 1;
        return {
            ...range,
            startColumn: column,
            endColumn: column,
        };
    });
}

function mergeSelections(ranges: IRange[]): IRange[] {
    const merged: IRange[] = [];
    let current: Nullable<IRange>;
    ranges
        .sort((a, b) => a.startColumn - b.startColumn)
        .forEach((range) => {
            if (!current) {
                current = range;
                return;
            }

            if (current.endColumn === range.startColumn - 1) {
                current.endColumn = range.endColumn;
            } else {
                merged.push(current);
                current = range;
            }
        });
    merged.push(current!);
    return merged;
}
