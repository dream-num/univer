/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Direction, ICommand, IRange } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, RANGE_TYPE, Rectangle, Tools } from '@univerjs/core';
import {
    getCellAtRowCol,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { KeyCode } from '@univerjs/ui';

import { ShortcutExperienceService } from '../../services/shortcut-experience.service';
import {
    checkIfShrink,
    expandToContinuousRange,
    expandToNextCell,
    expandToNextGapRange,
    expandToWholeSheet,
    findNextGapRange,
    findNextRange,
    getStartRange,
    shrinkToNextCell,
    shrinkToNextGapRange,
} from './utils/selection-utils';

// TODO@DR-UNIVER: moveStepPage and moveStepEnd implement

export enum JumpOver {
    moveStopeOne,
    moveGap,
    moveStepPage,
    moveStepEnd,
}

export interface IMoveSelectionCommandParams {
    direction: Direction;
    jumpOver?: JumpOver;
    nextStep?: number;
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
        const next =
            jumpOver === JumpOver.moveGap
                ? findNextGapRange(startRange, direction, worksheet)
                : findNextRange(startRange, direction, worksheet);
        const destRange = getCellAtRowCol(next.startRow, next.startColumn, worksheet);

        if (Rectangle.equals(destRange, startRange)) {
            return false;
        }

        // If there are changes to the selection, clear the start position saved by the tab.
        // This function works in conjunction with the enter and tab shortcuts.
        accessor.get(ShortcutExperienceService).remove({
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
            keycode: KeyCode.TAB,
        });

        return accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
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
 * Move selection for enter and tab.
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
        if (!Rectangle.equals(range, primary)) {
            // Handle the situation of moving the active cell within the selection area.
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
            // Handle the regular situation of moving the selection area.
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
            subUnitId: sheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [resultRange],
        });
    },
};

export interface IExpandSelectionCommandParams {
    direction: Direction;
    jumpOver?: JumpOver;
    nextStep?: number;
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
            ? jumpOver === JumpOver.moveGap
                ? expandToNextGapRange(startRange, direction, currentWorksheet)
                : expandToNextCell(startRange, direction, currentWorksheet)
            : jumpOver === JumpOver.moveGap
                ? shrinkToNextGapRange(
                    startRange,
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
            subUnitId: currentWorksheet.getSheetId(),
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
            subUnitId: worksheet.getSheetId(),
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
