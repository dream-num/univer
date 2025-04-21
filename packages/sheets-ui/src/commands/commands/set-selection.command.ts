/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ICommand, IMutationInfo, IRange } from '@univerjs/core';
import type {
    ISetSelectionsOperationParams,
} from '@univerjs/sheets';
import { CommandType, Direction, ICommandService, IUniverInstanceService, RANGE_TYPE, Rectangle, sequenceExecute, Tools } from '@univerjs/core';

import { IRenderManagerService } from '@univerjs/engine-render';
import {
    expandToContinuousRange,
    getCellAtRowCol,
    getSelectionsService,
    getSheetCommandTarget,
    SelectionMoveType,
    SetSelectionsOperation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { KeyCode } from '@univerjs/ui';
import { SelectAllService } from '../../services/select-all/select-all.service';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { ShortcutExperienceService } from '../../services/shortcut-experience.service';
import {
    checkIfShrink,
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
    extra?: string;
    fromCurrentSelection?: boolean;
}

export interface IMoveSelectionEnterAndTabCommandParams {
    direction: Direction;
    keycode: KeyCode;
    extra?: string;
    fromCurrentSelection?: boolean;
}

/**
 * Move selection (Mainly by keyboard arrow keys, For Tab and Enter key, check @MoveSelectionEnterAndTabCommand)
 */
export const MoveSelectionCommand: ICommand<IMoveSelectionCommandParams> = {
    id: 'sheet.command.move-selection',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { workbook, worksheet } = target;
        const selection = getSelectionsService(accessor, params.fromCurrentSelection).getCurrentLastSelection();
        if (!selection) {
            return false;
        }

        const { direction, jumpOver, extra } = params;
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
        const unitId = workbook.getUnitId();
        // If there are changes to the selection, clear the start position saved by the tab.
        // This function works in conjunction with the enter and tab shortcuts.
        accessor.get(ShortcutExperienceService).remove({
            unitId,
            sheetId: worksheet.getSheetId(),
            keycode: KeyCode.TAB,
        });

        const selections = [
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
        ];
        const rs = accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            selections,
            type: SelectionMoveType.MOVE_END,
            extra,
            reveal: true,
        } as ISetSelectionsOperationParams);
        return rs;
    },
};

/**
 * Move selection for enter and tab.
 */
export const MoveSelectionEnterAndTabCommand: ICommand<IMoveSelectionEnterAndTabCommandParams> = {
    id: 'sheet.command.move-selection-enter-tab',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { workbook, worksheet } = target;
        const selectionsService = getSelectionsService(accessor);
        const { direction, keycode } = params;
        const isReverse = direction === Direction.LEFT || direction === Direction.UP;

        const selections = selectionsService.getCurrentSelections().concat();
        const currentSelectionIndex = selections.findIndex((s) => s.primary);
        const selection = selections[currentSelectionIndex];
        if (!selection) {
            return false;
        }
        // for shift tab or shift enter, the direction should be reversed. so we need find the previous selection.
        const delta = isReverse ? -1 : 1;
        const nextSelection = currentSelectionIndex + delta !== selections.length ? selections[currentSelectionIndex + delta] : selections[0];
        const nextSelectionIndex = selections.findIndex((s) => s === nextSelection);

        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();
        if (!selection) {
            return false;
        }

        const { range } = selection;
        const primary = selection.primary!;
        let startRange = getStartRange(range, primary, direction);
        const shortcutExperienceService = accessor.get(ShortcutExperienceService);

        const shortcutExperienceParam = shortcutExperienceService.getCurrentBySearch({
            unitId,
            sheetId,
            keycode: KeyCode.TAB,
        });

        let resultRange;

        const { startRow, endRow, startColumn, endColumn } = range;

        // for the last cell in the selection, the next cell should be the next selection's start cell.
        const isLastCell = isReverse ? primary.startRow === startRow && primary.startColumn === startColumn : primary.endRow === endRow && primary.endColumn === endColumn;
        // not single cell should be handled by the move-selection active cell
        if (!Rectangle.equals(range, primary)) {
            // Handle the situation of moving the active cell within the selection area.
            shortcutExperienceService.remove({
                unitId,
                sheetId,
                keycode: KeyCode.TAB,
            });

            const newPrimary = Tools.deepClone(primary);

            const next = isLastCell
                ? nextSelection.range :
                findNextRange(
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

            const useLeftTopAsDest = isLastCell && isReverse;
            const destRange = useLeftTopAsDest ? getCellAtRowCol(next.endRow, next.endColumn, worksheet) : getCellAtRowCol(next.startRow, next.startColumn, worksheet);

            resultRange = {
                range: isLastCell ? nextSelection.range : Rectangle.clone(range),
                primary: {
                    startRow: destRange.startRow,
                    startColumn: destRange.startColumn,
                    endRow: destRange.endRow,
                    endColumn: destRange.endColumn,
                    actualRow: useLeftTopAsDest ? destRange.startRow : next.startRow,
                    actualColumn: useLeftTopAsDest ? destRange.startColumn : next.startColumn,
                    isMerged: destRange.isMerged,
                    isMergedMainCell:
                        destRange.startRow === next.startRow && destRange.startColumn === next.startColumn,
                },
                style: isLastCell ? nextSelection.style : selection.style,
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

        if (isLastCell) {
            selections[currentSelectionIndex].primary = null;
            selections[nextSelectionIndex] = resultRange;
            selectionsService.setSelections(unitId, sheetId, [], SelectionMoveType.MOVE_END);
        } else {
            selections[currentSelectionIndex] = resultRange;
        }

        const rs = accessor.get(ICommandService).executeCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: sheetId,
            type: SelectionMoveType.MOVE_END,
            selections,
            reveal: true,
            extra: params.extra,
        });
        const renderManagerService = accessor.get(IRenderManagerService);
        const selectionService = renderManagerService.getRenderById(unitId)?.with(ISheetSelectionRenderService);
        selectionService?.refreshSelectionMoveEnd();
        return rs;
    },
};

export interface IExpandSelectionCommandParams {
    direction: Direction;
    jumpOver?: JumpOver;
    nextStep?: number;
    extra?: string;
}

// Though the command's name is "expand-selection", it actually does not expand but shrink the selection.
// That depends on the position of currentCell and the whole selection.
export const ExpandSelectionCommand: ICommand<IExpandSelectionCommandParams> = {
    id: 'sheet.command.expand-selection',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;

        const selection = getSelectionsService(accessor).getCurrentLastSelection();
        if (!selection) return false;

        const { range: startRange, primary } = selection;
        const { jumpOver, direction, extra } = params;

        const isShrink = checkIfShrink(selection, direction, worksheet);
        const destRange = !isShrink
            ? jumpOver === JumpOver.moveGap
                ? expandToNextGapRange(startRange, direction, worksheet)
                : expandToNextCell(startRange, direction, worksheet)
            : jumpOver === JumpOver.moveGap
                ? shrinkToNextGapRange(
                    startRange,
                    { ...Rectangle.clone(primary), rangeType: RANGE_TYPE.NORMAL },
                    direction,
                    worksheet
                )
                : shrinkToNextCell(startRange, direction, worksheet);
        destRange.rangeType = selection.range.rangeType;

        if (Rectangle.equals(destRange, startRange)) {
            return false;
        }

        return accessor.get(ICommandService).syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId,
            type: SelectionMoveType.MOVE_END,
            selections: [
                {
                    range: destRange,
                    primary, // this remains unchanged
                },
            ],
            extra,
            reveal: true,
        });
    },
};

export interface ISelectAllCommandParams {
    expandToGapFirst?: boolean;
    loop?: boolean;
}

/**
 * This command expand selection to all neighbor ranges. If there are no neighbor ranges. Select the whole sheet.
 */
export const SelectAllCommand: ICommand<ISelectAllCommandParams> = {
    id: 'sheet.command.select-all',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params = { expandToGapFirst: true, loop: false }) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;
        const selection = getSelectionsService(accessor).getCurrentLastSelection();
        if (!selection) return false;

        const selectAllService = accessor.get(SelectAllService);

        const { worksheet, unitId, subUnitId } = target;
        const id = `${unitId}|${subUnitId}`;
        if (id !== selectAllService.selectedRangeWorksheet) {
            selectAllService.rangesStack = [];
            selectAllService.selectedRangeWorksheet = id;
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

        if (!selectAllService.rangesStack.some((s) => Rectangle.equals(s, range))) {
            selectAllService.rangesStack = [];
            selectAllService.rangesStack.push(range);
        }

        let destRange: IRange;

        // determined what kind of adjustment it should get
        if (isWholeSheetSelected) {
            if (loop) {
                const currentSelectionIndex = selectAllService.rangesStack.findIndex((s) => Rectangle.equals(s, range));
                if (currentSelectionIndex !== selectAllService.rangesStack.length - 1) {
                    return false;
                }

                destRange = selectAllService.rangesStack[0];
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

        if (!selectAllService.rangesStack.some((s) => Rectangle.equals(s, destRange))) {
            selectAllService.rangesStack.push(destRange);
        }

        const redos: IMutationInfo[] = [];

        redos.push({
            id: SetSelectionsOperation.id,
            params: {
                unitId,
                subUnitId,
                reveal: true,
                selections: [
                    {
                        range: destRange,
                        primary, // this remains unchanged
                    },
                ],
            },
        });

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptor = sheetInterceptorService.onCommandExecute({
            id: SelectAllCommand.id,
            params: { range },
        });

        if (interceptor.redos.length) {
            redos.push(...interceptor.redos);
        }

        const commandService = accessor.get(ICommandService);
        sequenceExecute(redos, commandService);

        return true;
    },
};
