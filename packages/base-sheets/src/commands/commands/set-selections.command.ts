import { KeyCode } from '@univerjs/base-ui';
import {
    CommandType,
    Direction,
    ICommand,
    ICommandService,
    IRange,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
    Tools,
} from '@univerjs/core';

import {
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
} from '../../services/selection/selection-manager.service';
import { ShortcutExperienceService } from '../../services/shortcut-experience.service';
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

        const workbook = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
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

        // If there are changes to the selection, clear the start position saved by the tab. This function works in conjunction with the enter and tab shortcuts.
        accessor.get(ShortcutExperienceService).remove({
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            keycode: KeyCode.TAB,
        });

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

export interface IMoveSelectionEnterAndTabCommandParams {
    direction: Direction;
    keycode: KeyCode;
}

/**
 * Move selection for enter and tab
 */
export const MoveSelectionEnterAndTabCommand: ICommand<IMoveSelectionEnterAndTabCommandParams> = {
    id: 'sheet.command.move-selection-enter-tab',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const workbook = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const selection = accessor.get(SelectionManagerService).getLast();
        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();
        if (!selection) {
            return false;
        }

        const { direction, keycode } = params;
        const { range, primary } = selection;
        let startRange = getStartRange(range, primary, direction);
        const shortcutExperienceService = accessor.get(ShortcutExperienceService);

        const shortcutExperienceParam = shortcutExperienceService.getCurrentBySearch({
            unitId,
            sheetId,
            keycode: KeyCode.TAB,
        });

        let resultRange;
        const { startRow, endRow, startColumn, endColumn } = range;
        if (startRow < endRow || startColumn < endColumn) {
            shortcutExperienceService.remove({
                unitId,
                sheetId,
                keycode: KeyCode.TAB,
            });

            const newPrimary = Tools.deepClone(primary);

            const next = findNextRange(
                {
                    startRow: newPrimary.startRow,
                    startColumn: newPrimary.startColumn,
                    endRow: newPrimary.endRow,
                    endColumn: newPrimary.endColumn,
                },
                direction,
                worksheet,
                {
                    startRow,
                    endRow,
                    startColumn,
                    endColumn,
                }
            );

            const destRange = getCellAtRowCol(next.startRow, next.startColumn, worksheet);

            resultRange = {
                range: Rectangle.clone(range),
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
            };
        } else {
            if (keycode === KeyCode.TAB) {
                if (shortcutExperienceParam == null) {
                    shortcutExperienceService.addOrUpdate({
                        unitId,
                        sheetId,
                        keycode: KeyCode.TAB,
                        selection,
                    });
                }
            } else {
                const selectionRemain = shortcutExperienceParam?.selection;

                if (selectionRemain != null) {
                    const { range, primary } = selectionRemain;
                    startRange = getStartRange(range, primary, direction);
                }

                shortcutExperienceService.remove({
                    unitId,
                    sheetId,
                    keycode: KeyCode.TAB,
                });
            }

            // the start range is from the primary selection range
            const next = findNextRange(startRange, direction, worksheet);
            const destRange = getCellAtRowCol(next.startRow, next.startColumn, worksheet);

            if (Rectangle.equals(destRange, startRange)) {
                return false;
            }

            resultRange = {
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
            };
        }

        return accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId,
            sheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [resultRange],
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

        const currentWorkbook = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
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
        const workbook = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
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
