import {
    CommandType,
    Direction,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    ISelectionRange,
    Rectangle,
} from '@univerjs/core';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import { SetSelectionsOperation } from '../operations/selection.operation';
import {
    expandToContinuousRange,
    expandToNextCell,
    expandToNextGapCell,
    expandToWholeSheet,
    findNextGapRange,
    findNextRange,
    getRangeAtPosition,
    shrinkToNextCell,
    shrinkToNextGapCell,
} from './utils/selection-util';

// TODO@wzhudev: we also need to handle when the current selection is the whole spreadsheet, whole rows or whole columns

export interface IChangeSelectionCommandParams {
    direction: Direction;
    jumpOver?: boolean;
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

        const selection = selectionManagerService.getLast();
        if (!selection || !params) {
            return false;
        }

        const { direction, jumpOver } = params;
        const startRange = selection.rangeData;
        let destRange = jumpOver
            ? findNextGapRange(startRange, direction, currentWorksheet)
            : findNextRange(startRange, direction, currentWorksheet);

        destRange = getRangeAtPosition(destRange.startRow, destRange.startColumn, currentWorksheet);

        if (Rectangle.equals(destRange, startRange)) {
            return false;
        }

        return commandService.executeCommand(SetSelectionsOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    rangeData: Rectangle.clone(destRange),
                    cellRange: getRangeAtPosition(destRange.startRow, destRange.startColumn, currentWorksheet),
                },
            ],
        });
    },
};

export interface IExpandSelectionCommandParams {
    direction: Direction;

    jumpOver?: boolean;
}

// Though the command's name is "expand-selection", it actually does not expand but shrink the selection.
// That depends on the position of currentCell and the whole selection.
export const ExpandSelectionCommand: ICommand<IExpandSelectionCommandParams> = {
    id: 'sheet.command.expand-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const currentWorkbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const currentWorksheet = currentWorkbook.getActiveSheet();
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);

        const selection = selectionManagerService.getLast();
        if (!selection || !params) {
            return false;
        }

        const startRange = selection.rangeData;
        const cellRange = selection.cellRange;
        if (!cellRange) {
            return false;
        }

        if (cellRange.startRow === -1) {
            // FIXME@DR-Univer
            // It maybe be related to click event handling. Try to click on C10 cell and use shift+arrow to expand selection.
            throw new Error('startRow is -1! @DR-Univer');
        }

        const { jumpOver, direction } = params;
        const isShrink = (function isShrink() {
            switch (direction) {
                case Direction.DOWN:
                    return startRange.startRow < cellRange.startRow;
                case Direction.UP:
                    return startRange.endRow > cellRange.endRow;
                case Direction.LEFT:
                    return startRange.endColumn > cellRange.endColumn;
                case Direction.RIGHT:
                    return startRange.startColumn < cellRange.startColumn;
            }
        })();

        const destRange = !isShrink
            ? jumpOver
                ? expandToNextGapCell(startRange, direction, currentWorksheet)
                : expandToNextCell(startRange, direction, currentWorksheet)
            : jumpOver
            ? shrinkToNextGapCell(startRange, cellRange, direction, currentWorksheet)
            : shrinkToNextCell(startRange, cellRange, direction, currentWorksheet);

        if (Rectangle.equals(destRange, startRange)) {
            return false;
        }

        return commandService.executeCommand(SetSelectionsOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    rangeData: destRange,
                    // cellRange: expand
                    // ? selection.cellRange
                    cellRange, // this remains unchanged
                },
            ],
        });
    },
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
