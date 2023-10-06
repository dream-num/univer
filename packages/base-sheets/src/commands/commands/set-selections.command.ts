import {
    CommandType,
    Direction,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRange,
    RANGE_TYPE,
    Rectangle,
} from '@univerjs/core';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import { SetSelectionsOperation } from '../operations/selection.operation';
import {
    checkIfShrink,
    expandToContinuousRange,
    expandToNextCell,
    expandToNextGapRange,
    expandToWholeSheet,
    findNextGapRange,
    findNextRange,
    getCellAtRowCol,
    getStartRange,
    shrinkToNextCell,
    shrinkToNextGapRange,
} from './utils/selection-util';

// TODO@wzhudev: we also need to handle when the current selection is the whole spreadsheet, whole rows or whole columns

export interface IMoveSelectionCommandParams {
    direction: Direction;
    jumpOver?: boolean;
}

/**
 * Move selection
 */
export const MoveSelectionCommand: ICommand<IMoveSelectionCommandParams> = {
    id: 'sheet.command.move-selection',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const workbook = accessor.get(ICurrentUniverService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const { direction, jumpOver } = params;
        const { range, primary } = selection;
        const startRange = getStartRange(range, primary, direction);

        // the start range is from the primary selection range
        const next = jumpOver
            ? findNextGapRange(startRange, direction, worksheet)
            : findNextRange(startRange, direction, worksheet);
        const destRange = getCellAtRowCol(next.startRow, next.startColumn, worksheet);

        if (Rectangle.equals(destRange, startRange)) {
            return false;
        }

        return accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    range: Rectangle.clone(destRange),
                    primary: {
                        startRow: destRange.startRow,
                        startColumn: destRange.startColumn,
                        endRow: destRange.endRow,
                        endColumn: destRange.endColumn,
                        actualRow: next.startRow,
                        actualColumn: next.startColumn,
                        isMerged: destRange.isMerged,
                        isMergedMainCell:
                            destRange.startRow === next.startRow && destRange.startColumn === next.startColumn,
                    },
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
        if (!params) {
            return false;
        }

        const currentWorkbook = accessor.get(ICurrentUniverService).getCurrentUniverSheetInstance();
        const currentWorksheet = currentWorkbook.getActiveSheet();

        const selection = accessor.get(SelectionManagerService).getLast();
        if (!selection) {
            return false;
        }

        const { range: startRange, primary } = selection;
        const { jumpOver, direction } = params;

        const isShrink = checkIfShrink(selection, direction, currentWorksheet);

        const destRange = !isShrink
            ? jumpOver
                ? expandToNextGapRange(startRange, direction, currentWorksheet)
                : expandToNextCell(startRange, direction, currentWorksheet)
            : jumpOver
            ? shrinkToNextGapRange(
                  startRange,
                  // TODO: should fix on SelectionManagerService's side
                  { ...Rectangle.clone(primary), rangeType: RANGE_TYPE.NORMAL },
                  direction,
                  currentWorksheet
              )
            : shrinkToNextCell(startRange, direction, currentWorksheet);

        if (Rectangle.equals(destRange, startRange)) {
            return false;
        }

        return accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId: currentWorkbook.getUnitId(),
            sheetId: currentWorksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    range: destRange,
                    primary, // this remains unchanged
                },
            ],
        });
    },
};

export interface ISelectAllCommandParams {
    expandToGapFirst?: boolean;
    loop?: boolean;
}

let RANGES_STACK: IRange[] = [];

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
        const selection = accessor.get(SelectionManagerService).getLast();
        const workbook = accessor.get(ICurrentUniverService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        if (!selection || !worksheet) {
            return false;
        }

        const id = `${workbook.getUnitId()}|${worksheet.getSheetId()}`;
        if (id !== SELECTED_RANGE_WORKSHEET) {
            RANGES_STACK = [];
            SELECTED_RANGE_WORKSHEET = id;
        }

        const maxRow = worksheet.getMaxRows();
        const maxCol = worksheet.getMaxColumns();
        const { expandToGapFirst, loop } = params;
        const { range, primary } = selection;
        const isWholeSheetSelected =
            range.endColumn === maxCol - 1 &&
            range.endRow === maxRow - 1 &&
            range.startRow === 0 &&
            range.startColumn === 0;

        if (!RANGES_STACK.some((s) => Rectangle.equals(s, range))) {
            RANGES_STACK = [];
            RANGES_STACK.push(range);
        }

        let destRange: IRange;

        // determined what kind of adjustment it should get
        if (isWholeSheetSelected) {
            if (loop) {
                const currentSelectionIndex = RANGES_STACK.findIndex((s) => Rectangle.equals(s, range));
                if (currentSelectionIndex !== RANGES_STACK.length - 1) {
                    return false;
                }

                destRange = RANGES_STACK[0];
            } else {
                return false;
            }
        } else if (expandToGapFirst) {
            destRange = expandToContinuousRange(range, { left: true, right: true, up: true, down: true }, worksheet);
            if (Rectangle.equals(destRange, range)) {
                // already to gaps
                destRange = expandToWholeSheet(worksheet);
            }
        } else {
            destRange = expandToWholeSheet(worksheet);
        }

        if (!RANGES_STACK.some((s) => Rectangle.equals(s, destRange))) {
            RANGES_STACK.push(destRange);
        }

        return accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [
                {
                    range: destRange,
                    primary, // this remains unchanged
                },
            ],
        });
    },
};
