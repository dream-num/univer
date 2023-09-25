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
import {
    expandToContinuousRange,
    expandToNextGapCell,
    expandToWholeSheet,
    findNextGapCell,
} from './utils/selection-util';

export interface IChangeSelectionCommandParams {
    direction: Direction;
    toNextGap?: boolean;
    expand?: boolean;
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

        const { direction, toNextGap, expand } = params;
        const startRange = selections[selections.length - 1];

        let destRange: ISelectionRange = { ...startRange };

        if (!toNextGap) {
            // navigation must be within the worksheet's range
            switch (direction) {
                case Direction.UP:
                    destRange.startRow = Math.max(0, startRange.startRow - 1);
                    destRange.endRow = destRange.startRow;
                    break;
                case Direction.DOWN:
                    destRange.startRow = Math.min(startRange.endRow + 1, currentWorksheet.getRowCount() - 1);
                    destRange.endRow = destRange.startRow;
                    break;
                case Direction.LEFT:
                    destRange.startColumn = Math.max(0, startRange.startColumn - 1);
                    destRange.endColumn = destRange.startColumn;
                    break;
                case Direction.RIGHT:
                    destRange.startColumn = Math.min(startRange.endColumn + 1, currentWorksheet.getColumnCount() - 1);
                    destRange.endColumn = destRange.startColumn;
                    break;
                default:
                    break;
            }

            // deal with merged cells
            currentWorksheet
                .getMatrixWithMergedCells(
                    destRange.startRow,
                    destRange.startColumn,
                    destRange.startRow,
                    destRange.startColumn
                )
                .forValue((row, col, value) => {
                    destRange.startRow = row;
                    destRange.startColumn = col;
                    destRange.endRow = row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0);
                    destRange.endColumn = col + (value.colSpan !== undefined ? value.colSpan - 1 : 0);
                });
        } else if (!expand) {
            destRange = findNextGapCell(destRange, direction, currentWorksheet);
        } else {
            destRange = expandToNextGapCell(destRange, direction, currentWorksheet);
            console.log('debug expand to:', destRange);
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

export interface IExpandSelectionCommandParams {
    direction: Direction;
    toNextGap?: boolean;
    expand?: boolean;
}

export const ExpandSelectionCommand: ICommand<IExpandSelectionCommandParams> = {
    id: 'sheet.command.expand-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => true,
};

export interface ISelectAllCommandParams {
    expandToGapFirst?: boolean;
    loop?: boolean;
}

let RANGES_STACK: ISelectionRange[] = [];

let SELECTED_RANGE_WORKSHEET = '';

/**
 * This command expand selection to all neighbor ranges. If there are no neighbor ranges. Select the whole sheet.
 */
export const SelectAllCommand: ICommand<ISelectAllCommandParams> = {
    id: 'sheet.command.select-all',
    type: CommandType.COMMAND,
    onDispose() {
        RANGES_STACK = [];
        SELECTED_RANGE_WORKSHEET = '';
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
            RANGES_STACK = [];
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
            RANGES_STACK = [];
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
