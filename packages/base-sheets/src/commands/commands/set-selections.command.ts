import {
    CommandType,
    Direction,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    ILogService,
    ISelectionRange,
    Rectangle,
} from '@univerjs/core';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { expandToContinuousRange, expandToWholeSheet } from './utils/selection-util';

export interface IChangeSelectionCommandParams {
    direction: Direction;
    toEnd?: boolean;
}

export const ChangeSelectionCommand: ICommand<IChangeSelectionCommandParams> = {
    id: 'sheet.command.change-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const currentWorkbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const currentWorksheet = currentWorkbook.getActiveSheet();
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length || params == null) {
            return false;
        }

        const { direction } = params;
        const originSelection = selections[selections.length - 1];
        const destRange: ISelectionRange = { ...originSelection };

        // FIXME: some error here. The selection does not know if there is a span cell.
        switch (direction) {
            case Direction.UP:
                destRange.startRow = Math.max(0, originSelection.startRow - 1);
                destRange.endRow = destRange.startRow;
                break;
            case Direction.DOWN:
                destRange.startRow = Math.min(originSelection.endRow + 1, currentWorksheet.getRowCount() - 1);
                destRange.endRow = destRange.startRow;
                break;
            case Direction.LEFT:
                destRange.startColumn = Math.max(0, originSelection.startColumn - 1);
                destRange.endColumn = destRange.startColumn;
                break;
            case Direction.RIGHT:
                destRange.startColumn = Math.min(originSelection.endColumn + 1, currentWorksheet.getColumnCount() - 1);
                destRange.endColumn = destRange.startColumn;
                break;
            default:
                break;
        }

        // TODO: deal with `toEnd` parameter here

        return commandService.executeCommand(SetSelectionsOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    rangeData: destRange,
                    cellRange: {
                        row: destRange.startRow,
                        column: destRange.startColumn,
                        isMerged: false,
                        isMergedMainCell: false,
                        startRow: destRange.startRow,
                        startColumn: destRange.startColumn,
                        endRow: destRange.endRow,
                        endColumn: destRange.endColumn,
                    },
                },
            ],
        });
    },
};

export interface IExpandSelectionCommandParams {
    direction: Direction;
    toEnd?: boolean;
}

export const ExpandSelectionCommand: ICommand<IExpandSelectionCommandParams> = {
    id: 'sheet.command.expand-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => true,
};

export interface ISelectAllCommandParams {
    expandToGapFirst?: boolean;
    loop?: boolean; // TODO: if we want to implement this loop feature we must record the first range
    // NOTE: google sheet would not support loop when you switch a worksheet
}

const RANGES_STACK: ISelectionRange[] = [];

let SELECTED_RANGE_WORKSHEET = '';

/**
 * This command expand selection to all neighbor ranges. If there are no neighbor ranges. Select the whole sheet.
 */
export const SelectAllCommand: ICommand<ISelectAllCommandParams> = {
    id: 'sheet.command.select-all',
    type: CommandType.COMMAND,
    onDisposed() {
        RANGES_STACK.length = 0;
    },
    handler: async (accessor, params = { expandToGapFirst: true, loop: false }) => {
        const selectionManager = accessor.get(SelectionManagerService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const logService = accessor.get(ILogService);

        const currentSelection = selectionManager.getLast();
        const currentWorkbook = currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook();
        const currentWorksheet = currentWorkbook.getActiveSheet();

        if (!currentSelection || !currentWorksheet) {
            return false;
        }

        const id = `${currentWorkbook.getUnitId()}|${currentWorksheet.getSheetId()}`;
        if (id !== SELECTED_RANGE_WORKSHEET) {
            RANGES_STACK.length = 0;
            SELECTED_RANGE_WORKSHEET = id;
        }

        const commandService = accessor.get(ICommandService);
        const maxRow = currentWorksheet.getMaxRows();
        const maxCol = currentWorksheet.getMaxColumns();
        const { expandToGapFirst, loop } = params;
        const currentRange = currentSelection.rangeData;
        const isWholeSheetSelected =
            currentRange.endColumn === maxCol - 1 &&
            currentRange.endRow === maxRow - 1 &&
            currentRange.startRow === 0 &&
            currentRange.startColumn === 0;

        if (!RANGES_STACK.some((s) => Rectangle.equals(s, currentRange))) {
            RANGES_STACK.length = 0;
            RANGES_STACK.push(currentRange);
        }

        let destRange: ISelectionRange;

        if (isWholeSheetSelected) {
            if (loop) {
                const currentSelectionIndex = RANGES_STACK.findIndex((s) => Rectangle.equals(s, currentRange));
                if (currentSelectionIndex !== RANGES_STACK.length - 1) {
                    return false;
                }

                destRange = RANGES_STACK[0];
            } else {
                return false;
            }
        } else if (expandToGapFirst) {
            destRange = expandToContinuousRange(
                currentRange,
                { left: true, right: true, up: true, down: true },
                currentWorksheet
            );

            if (Rectangle.equals(destRange, currentRange)) {
                destRange = expandToWholeSheet(currentWorksheet);
            }
        } else {
            destRange = expandToWholeSheet(currentWorksheet);
        }

        if (!RANGES_STACK.some((s) => Rectangle.equals(s, destRange))) {
            RANGES_STACK.push(destRange);
        }

        return commandService.executeCommand(SetSelectionsOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    rangeData: destRange,
                    cellRange: {
                        row: destRange.startRow,
                        column: destRange.startColumn,
                        isMerged: false,
                        isMergedMainCell: false,
                        startRow: destRange.startRow,
                        startColumn: destRange.startColumn,
                        endRow: destRange.endRow,
                        endColumn: destRange.endColumn,
                    },
                },
            ],
        });
    },
};
