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

import type { IAccessor, ICommand, IRange, ISelectionCell } from '@univerjs/core';
import type { IRemoveRowColCommandParams, ISelectionWithStyle } from '@univerjs/sheets';
import {
    CommandType,
    Direction,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
} from '@univerjs/core';
import {
    getPrimaryForRange,
    getSheetCommandTarget,
    InsertColCommand,
    InsertRowCommand,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from './remove-row-col-confirm.command';
import { isAllColumnsCovered, isAllRowsCovered } from './utils/selection-utils';

interface IIndexRange {
    start: number;
    end: number;
}

type TRowOrColType = RANGE_TYPE.ROW | RANGE_TYPE.COLUMN;

function _mergeContinuousRanges(ranges: IIndexRange[]): IIndexRange[] {
    if (ranges.length === 0) {
        return [];
    }

    const sorted = ranges
        .map((range) => ({
            start: Math.min(range.start, range.end),
            end: Math.max(range.start, range.end),
        }))
        .sort((a, b) => a.start - b.start);

    const merged: IIndexRange[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const last = merged[merged.length - 1];

        if (current.start <= last.end + 1) {
            last.end = Math.max(last.end, current.end);
        } else {
            merged.push(current);
        }
    }

    return merged;
}

function _getSelectionType(selections: readonly ISelectionWithStyle[]): TRowOrColType | null {
    if (selections.length === 0) {
        return null;
    }

    let type: TRowOrColType | null = null;

    for (const selection of selections) {
        const rangeType = selection.range.rangeType;
        if (rangeType !== RANGE_TYPE.ROW && rangeType !== RANGE_TYPE.COLUMN) {
            return null;
        }

        if (type == null) {
            type = rangeType;
            continue;
        }

        if (type !== rangeType) {
            return null;
        }
    }

    return type;
}

function _getActiveSelectionIndex(selections: readonly ISelectionWithStyle[]): number {
    let activeSelectionIndex = -1;
    for (let i = 0; i < selections.length; i++) {
        if (selections[i].primary) {
            activeSelectionIndex = i;
        }
    }

    return activeSelectionIndex;
}

function _getActivePrimaryCell(
    selections: readonly ISelectionWithStyle[],
    worksheetRowCount: number,
    worksheetColumnCount: number
): ISelectionCell | null {
    const activeSelectionIndex = _getActiveSelectionIndex(selections);
    if (activeSelectionIndex !== -1 && selections[activeSelectionIndex].primary) {
        return { ...selections[activeSelectionIndex].primary };
    }

    if (selections.length === 0) {
        return null;
    }

    const lastRange = selections[selections.length - 1].range;
    const safeRow = Number.isNaN(lastRange.startRow) ? 0 : Math.min(Math.max(lastRange.startRow, 0), worksheetRowCount - 1);
    const safeColumn = Number.isNaN(lastRange.startColumn) ? 0 : Math.min(Math.max(lastRange.startColumn, 0), worksheetColumnCount - 1);

    return {
        startRow: safeRow,
        endRow: safeRow,
        startColumn: safeColumn,
        endColumn: safeColumn,
        actualRow: safeRow,
        actualColumn: safeColumn,
        isMerged: false,
        isMergedMainCell: false,
        rangeType: RANGE_TYPE.NORMAL,
    };
}

function _toSingleCellSelection(primary: ISelectionCell, worksheetRowCount: number, worksheetColumnCount: number): ISelectionWithStyle {
    const maxRow = Math.max(worksheetRowCount - 1, 0);
    const maxColumn = Math.max(worksheetColumnCount - 1, 0);
    const actualRow = Math.min(Math.max(primary.actualRow, 0), maxRow);
    const actualColumn = Math.min(Math.max(primary.actualColumn, 0), maxColumn);

    const range = {
        startRow: actualRow,
        endRow: actualRow,
        startColumn: actualColumn,
        endColumn: actualColumn,
        rangeType: RANGE_TYPE.NORMAL,
    };
    const normalizedPrimary = {
        ...range,
        actualRow,
        actualColumn,
        isMerged: false,
        isMergedMainCell: false,
    };

    return {
        range,
        primary: normalizedPrimary,
        style: null,
    };
}

function _getRangeStartIndex(range: IRange, type: TRowOrColType): number {
    return type === RANGE_TYPE.ROW ? range.startRow : range.startColumn;
}

function _getRangeEndIndex(range: IRange, type: TRowOrColType): number {
    return type === RANGE_TYPE.ROW ? range.endRow : range.endColumn;
}

function _getRangeLength(range: IRange, type: TRowOrColType): number {
    const start = Math.min(_getRangeStartIndex(range, type), _getRangeEndIndex(range, type));
    const end = Math.max(_getRangeStartIndex(range, type), _getRangeEndIndex(range, type));
    return end - start + 1;
}

function _isSameRangeByType(a: IRange, b: IRange, type: TRowOrColType): boolean {
    return _getRangeStartIndex(a, type) === _getRangeStartIndex(b, type) && _getRangeEndIndex(a, type) === _getRangeEndIndex(b, type);
}

function _toTypedRange(start: number, end: number, type: TRowOrColType, maxRow: number, maxColumn: number): IRange {
    if (type === RANGE_TYPE.ROW) {
        return {
            startRow: start,
            endRow: end,
            startColumn: 0,
            endColumn: maxColumn,
            rangeType: RANGE_TYPE.ROW,
        };
    }

    return {
        startRow: 0,
        endRow: maxRow,
        startColumn: start,
        endColumn: end,
        rangeType: RANGE_TYPE.COLUMN,
    };
}

function _clampByType(index: number, type: TRowOrColType, rowCount: number, columnCount: number): number {
    const maxIndex = type === RANGE_TYPE.ROW ? Math.max(rowCount - 1, 0) : Math.max(columnCount - 1, 0);
    return Math.min(Math.max(index, 0), maxIndex);
}

function _normalizeRanges(
    ranges: readonly IRange[],
    type: TRowOrColType,
    rowCount: number,
    columnCount: number
): IRange[] {
    const maxRow = Math.max(rowCount - 1, 0);
    const maxColumn = Math.max(columnCount - 1, 0);

    const normalizedIndexRanges = ranges
        .map((range) => {
            const start = _clampByType(_getRangeStartIndex(range, type), type, rowCount, columnCount);
            const end = _clampByType(_getRangeEndIndex(range, type), type, rowCount, columnCount);
            return {
                start: Math.min(start, end),
                end: Math.max(start, end),
            };
        })
        .filter((range) => range.start <= range.end);

    const mergedRanges = _mergeContinuousRanges(normalizedIndexRanges);
    return mergedRanges.map((range) => _toTypedRange(range.start, range.end, type, maxRow, maxColumn));
}

function _updateRangesAfterInsert(
    ranges: readonly IRange[],
    insertedRange: IRange,
    type: TRowOrColType,
    rowCount: number,
    columnCount: number
): IRange[] {
    const insertedStart = _getRangeStartIndex(insertedRange, type);
    const insertedLength = _getRangeLength(insertedRange, type);

    const nextRanges = ranges.map((range) => {
        if (_isSameRangeByType(range, insertedRange, type)) {
            return range;
        }

        const start = _getRangeStartIndex(range, type);
        const end = _getRangeEndIndex(range, type);
        if (start < insertedStart) {
            return range;
        }

        return _toTypedRange(start + insertedLength, end + insertedLength, type, rowCount - 1, columnCount - 1);
    });

    return _normalizeRanges(nextRanges, type, rowCount, columnCount);
}

function _updateRangesAfterDelete(
    ranges: readonly IRange[],
    removedRange: IRange,
    type: TRowOrColType,
    rowCount: number,
    columnCount: number
): IRange[] {
    const removedEnd = _getRangeEndIndex(removedRange, type);
    const removedLength = _getRangeLength(removedRange, type);

    const nextRanges = ranges.map((range) => {
        if (_isSameRangeByType(range, removedRange, type)) {
            return range;
        }

        const start = _getRangeStartIndex(range, type);
        const end = _getRangeEndIndex(range, type);

        if (start > removedEnd) {
            return _toTypedRange(start - removedLength, end - removedLength, type, rowCount - 1, columnCount - 1);
        }

        return range;
    });

    return _normalizeRanges(nextRanges, type, rowCount, columnCount);
}

function _toPrimaryByType(
    type: TRowOrColType,
    index: number,
    anchor: ISelectionCell,
    rowCount: number,
    columnCount: number
): ISelectionCell {
    const row = type === RANGE_TYPE.ROW
        ? _clampByType(index, RANGE_TYPE.ROW, rowCount, columnCount)
        : _clampByType(anchor.actualRow, RANGE_TYPE.ROW, rowCount, columnCount);
    const column = type === RANGE_TYPE.COLUMN
        ? _clampByType(index, RANGE_TYPE.COLUMN, rowCount, columnCount)
        : _clampByType(anchor.actualColumn, RANGE_TYPE.COLUMN, rowCount, columnCount);

    return {
        startRow: row,
        endRow: row,
        startColumn: column,
        endColumn: column,
        actualRow: row,
        actualColumn: column,
        isMerged: false,
        isMergedMainCell: false,
        rangeType: RANGE_TYPE.NORMAL,
    };
}

function _updatePrimaryAfterInsert(
    primary: ISelectionCell,
    insertedRange: IRange,
    type: TRowOrColType,
    rowCount: number,
    columnCount: number
): ISelectionCell {
    const index = type === RANGE_TYPE.ROW ? primary.actualRow : primary.actualColumn;
    const insertedStart = _getRangeStartIndex(insertedRange, type);
    const insertedEnd = _getRangeEndIndex(insertedRange, type);
    const insertedLength = _getRangeLength(insertedRange, type);

    if (index >= insertedStart && index <= insertedEnd) {
        return _toPrimaryByType(type, index, primary, rowCount, columnCount);
    }

    if (index > insertedEnd) {
        return _toPrimaryByType(type, index + insertedLength, primary, rowCount, columnCount);
    }

    return _toPrimaryByType(type, index, primary, rowCount, columnCount);
}

function _updatePrimaryAfterDelete(
    primary: ISelectionCell,
    removedRange: IRange,
    type: TRowOrColType,
    rowCount: number,
    columnCount: number
): ISelectionCell {
    const index = type === RANGE_TYPE.ROW ? primary.actualRow : primary.actualColumn;
    const removedStart = _getRangeStartIndex(removedRange, type);
    const removedEnd = _getRangeEndIndex(removedRange, type);
    const removedLength = _getRangeLength(removedRange, type);

    if (index < removedStart) {
        return _toPrimaryByType(type, index, primary, rowCount, columnCount);
    }

    if (index > removedEnd) {
        return _toPrimaryByType(type, index - removedLength, primary, rowCount, columnCount);
    }

    return _toPrimaryByType(type, removedStart, primary, rowCount, columnCount);
}

function _findSelectionIndexForPrimary(
    ranges: readonly IRange[],
    primary: ISelectionCell,
    type: TRowOrColType
): number {
    const index = type === RANGE_TYPE.ROW ? primary.actualRow : primary.actualColumn;
    return ranges.findIndex((range) => {
        const start = _getRangeStartIndex(range, type);
        const end = _getRangeEndIndex(range, type);
        return index >= start && index <= end;
    });
}

function _toRowColSelections(
    ranges: readonly IRange[],
    primary: ISelectionCell | null,
    worksheetRowCount: number,
    worksheetColumnCount: number,
    type: TRowOrColType
): ISelectionWithStyle[] {
    if (ranges.length === 0) {
        return [];
    }

    const activePrimary = primary ?? _getActivePrimaryCell(
        ranges.map((range) => ({ range, primary: null, style: null })),
        worksheetRowCount,
        worksheetColumnCount
    );
    if (!activePrimary) {
        return [];
    }

    const activeSelectionIndex = _findSelectionIndexForPrimary(ranges, activePrimary, type);
    const fallbackSelectionIndex = ranges.length - 1;
    const selectionIndex = activeSelectionIndex === -1 ? fallbackSelectionIndex : activeSelectionIndex;
    const targetRange = ranges[selectionIndex];
    const start = _getRangeStartIndex(targetRange, type);
    const end = _getRangeEndIndex(targetRange, type);
    const targetIndex = type === RANGE_TYPE.ROW
        ? _clampByType(activePrimary.actualRow, RANGE_TYPE.ROW, worksheetRowCount, worksheetColumnCount)
        : _clampByType(activePrimary.actualColumn, RANGE_TYPE.COLUMN, worksheetRowCount, worksheetColumnCount);
    const clampedIndex = Math.min(Math.max(targetIndex, start), end);
    const selectionPrimary = _toPrimaryByType(type, clampedIndex, activePrimary, worksheetRowCount, worksheetColumnCount);

    return ranges.map((range, index) => ({
        range,
        primary: index === selectionIndex ? selectionPrimary : null,
        style: null,
    }));
}

function _restoreRowColSelections(
    commandService: ICommandService,
    unitId: string,
    subUnitId: string,
    worksheetRowCount: number,
    worksheetColumnCount: number,
    ranges: readonly IRange[],
    primary: ISelectionCell | null,
    type: TRowOrColType
): boolean {
    const selections = _toRowColSelections(ranges, primary, worksheetRowCount, worksheetColumnCount, type);
    if (selections.length === 0) {
        return false;
    }

    return commandService.syncExecuteCommand(SetSelectionsOperation.id, {
        unitId,
        subUnitId,
        selections,
        reveal: true,
    });
}

function _getMergedRanges(
    selections: readonly ISelectionWithStyle[],
    type: TRowOrColType,
    maxRow: number,
    maxColumn: number
): IRange[] {
    const indexRanges = selections.map((selection) => {
        const { range } = selection;
        return type === RANGE_TYPE.ROW
            ? { start: range.startRow, end: range.endRow }
            : { start: range.startColumn, end: range.endColumn };
    });

    const mergedRanges = _mergeContinuousRanges(indexRanges);

    if (type === RANGE_TYPE.ROW) {
        return mergedRanges.map((range) => ({
            startRow: range.start,
            endRow: range.end,
            startColumn: 0,
            endColumn: maxColumn,
            rangeType: RANGE_TYPE.ROW,
        }));
    }

    return mergedRanges.map((range) => ({
        startRow: 0,
        endRow: maxRow,
        startColumn: range.start,
        endColumn: range.end,
        rangeType: RANGE_TYPE.COLUMN,
    }));
}

function _toEntireRangeOfVisibleRows(allRowRanges: IRange[], maxColumn: number): IRange | null {
    if (allRowRanges.length === 0) {
        return null;
    }

    const startRow = Math.min(...allRowRanges.map((range) => range.startRow));
    const endRow = Math.max(...allRowRanges.map((range) => range.endRow));

    return {
        startRow,
        endRow,
        startColumn: 0,
        endColumn: maxColumn,
        rangeType: RANGE_TYPE.ROW,
    };
}

function _toEntireRangeOfVisibleColumns(allColumnRanges: IRange[], maxRow: number): IRange | null {
    if (allColumnRanges.length === 0) {
        return null;
    }

    const startColumn = Math.min(...allColumnRanges.map((range) => range.startColumn));
    const endColumn = Math.max(...allColumnRanges.map((range) => range.endColumn));

    return {
        startRow: 0,
        endRow: maxRow,
        startColumn,
        endColumn,
        rangeType: RANGE_TYPE.COLUMN,
    };
}

export const SelectColumnsByShortcutCommand: ICommand = {
    id: 'sheet.command.select-columns-by-shortcut',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) {
            return false;
        }

        const { worksheet, unitId, subUnitId } = target;
        const selectionsService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const selections = selectionsService.getCurrentSelections();
        const selectionType = _getSelectionType(selections);

        if (selections.length === 0) {
            return false;
        }

        if (selectionType === RANGE_TYPE.COLUMN) {
            const activePrimary = _getActivePrimaryCell(selections, worksheet.getRowCount(), worksheet.getColumnCount());
            if (!activePrimary) {
                return false;
            }

            return commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                unitId,
                subUnitId,
                selections: [_toSingleCellSelection(activePrimary, worksheet.getRowCount(), worksheet.getColumnCount())],
                reveal: true,
            });
        }

        const activeSelectionIndex = _getActiveSelectionIndex(selections);
        const nextSelections = selections.map((selection, index) => {
            const { range } = selection;
            const nextRange: IRange = {
                startRow: 0,
                endRow: worksheet.getRowCount() - 1,
                startColumn: Math.min(range.startColumn, range.endColumn),
                endColumn: Math.max(range.startColumn, range.endColumn),
                rangeType: RANGE_TYPE.COLUMN,
            };

            return {
                range: nextRange,
                primary: activeSelectionIndex === index && selection.primary ? { ...selection.primary } : null,
                style: selection.style ?? null,
            };
        });

        if (activeSelectionIndex === -1 && nextSelections.length > 0) {
            const lastSelectionIndex = nextSelections.length - 1;
            nextSelections[lastSelectionIndex].primary = getPrimaryForRange(nextSelections[lastSelectionIndex].range, worksheet);
        }

        return commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId,
            selections: nextSelections,
            reveal: true,
        });
    },
};

export const SelectRowsByShortcutCommand: ICommand = {
    id: 'sheet.command.select-rows-by-shortcut',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) {
            return false;
        }

        const { worksheet, unitId, subUnitId } = target;
        const selectionsService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const selections = selectionsService.getCurrentSelections();
        const selectionType = _getSelectionType(selections);

        if (selections.length === 0) {
            return false;
        }

        if (selectionType === RANGE_TYPE.ROW) {
            const activePrimary = _getActivePrimaryCell(selections, worksheet.getRowCount(), worksheet.getColumnCount());
            if (!activePrimary) {
                return false;
            }

            return commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                unitId,
                subUnitId,
                selections: [_toSingleCellSelection(activePrimary, worksheet.getRowCount(), worksheet.getColumnCount())],
                reveal: true,
            });
        }

        const activeSelectionIndex = _getActiveSelectionIndex(selections);
        const nextSelections = selections.map((selection, index) => {
            const { range } = selection;
            const nextRange: IRange = {
                startRow: Math.min(range.startRow, range.endRow),
                endRow: Math.max(range.startRow, range.endRow),
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1,
                rangeType: RANGE_TYPE.ROW,
            };

            return {
                range: nextRange,
                primary: activeSelectionIndex === index && selection.primary ? { ...selection.primary } : null,
                style: selection.style ?? null,
            };
        });

        if (activeSelectionIndex === -1 && nextSelections.length > 0) {
            const lastSelectionIndex = nextSelections.length - 1;
            nextSelections[lastSelectionIndex].primary = getPrimaryForRange(nextSelections[lastSelectionIndex].range, worksheet);
        }

        return commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId,
            selections: nextSelections,
            reveal: true,
        });
    },
};

export const InsertSelectedRowsOrColsByShortcutCommand: ICommand = {
    id: 'sheet.command.insert-selected-rows-cols-by-shortcut',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) {
            return false;
        }

        const { worksheet, unitId, subUnitId } = target;
        const selectionsService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selections = selectionsService.getCurrentSelections();
        let activePrimary = _getActivePrimaryCell(selections, worksheet.getRowCount(), worksheet.getColumnCount());
        const selectionType = _getSelectionType(selections);

        if (selectionType == null) {
            return false;
        }

        const mergedRanges = _getMergedRanges(
            selections,
            selectionType,
            worksheet.getRowCount() - 1,
            worksheet.getColumnCount() - 1
        );

        if (mergedRanges.length === 0) {
            return false;
        }

        let nextRanges = [...mergedRanges];
        const rangesToOperate = [...mergedRanges].reverse();
        const batchingHandle = undoRedoService.__tempBatchingUndoRedo(unitId);

        try {
            for (const range of rangesToOperate) {
                const isRow = selectionType === RANGE_TYPE.ROW;
                const result = await commandService.executeCommand(isRow ? InsertRowCommand.id : InsertColCommand.id, {
                    unitId,
                    subUnitId,
                    direction: isRow ? Direction.UP : Direction.LEFT,
                    range,
                });

                if (!result) {
                    return false;
                }

                nextRanges = _updateRangesAfterInsert(nextRanges, range, selectionType, worksheet.getRowCount(), worksheet.getColumnCount());
                if (activePrimary) {
                    activePrimary = _updatePrimaryAfterInsert(activePrimary, range, selectionType, worksheet.getRowCount(), worksheet.getColumnCount());
                }
            }

            if (!_restoreRowColSelections(
                commandService,
                unitId,
                subUnitId,
                worksheet.getRowCount(),
                worksheet.getColumnCount(),
                nextRanges,
                activePrimary,
                selectionType
            )) {
                return false;
            }
        } finally {
            batchingHandle.dispose();
        }

        return true;
    },
};

export const DeleteSelectedRowsOrColsByShortcutCommand: ICommand = {
    id: 'sheet.command.delete-selected-rows-cols-by-shortcut',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;
        const { worksheet, unitId, subUnitId } = target;
        const selectionsService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selections = selectionsService.getCurrentSelections();
        let activePrimary = _getActivePrimaryCell(selections, worksheet.getRowCount(), worksheet.getColumnCount());
        const selectionType = _getSelectionType(selections);
        if (selectionType == null) return false;
        const mergedRanges = _getMergedRanges(
            selections,
            selectionType,
            worksheet.getRowCount() - 1,
            worksheet.getColumnCount() - 1
        );
        if (mergedRanges.length === 0) return false;
        const allRowRanges = worksheet.getVisibleRows();
        const allColumnRanges = worksheet.getVisibleCols();
        const isAllCovered = selectionType === RANGE_TYPE.ROW
            ? isAllRowsCovered(allRowRanges, mergedRanges)
            : isAllColumnsCovered(allColumnRanges, mergedRanges);
        if (isAllCovered) {
            const fullRange = selectionType === RANGE_TYPE.ROW
                ? _toEntireRangeOfVisibleRows(allRowRanges, worksheet.getColumnCount() - 1)
                : _toEntireRangeOfVisibleColumns(allColumnRanges, worksheet.getRowCount() - 1);
            if (fullRange) {
                const params: IRemoveRowColCommandParams = { range: fullRange };
                await commandService.executeCommand(
                    selectionType === RANGE_TYPE.ROW ? RemoveRowConfirmCommand.id : RemoveColConfirmCommand.id,
                    params
                );
            }
            return false;
        }
        let nextRanges = [...mergedRanges];
        const rangesToOperate = [...mergedRanges].reverse();
        const batchingHandle = undoRedoService.__tempBatchingUndoRedo(unitId);
        try {
            for (const range of rangesToOperate) {
                const params: IRemoveRowColCommandParams = { range };
                const result = await commandService.executeCommand(
                    selectionType === RANGE_TYPE.ROW ? RemoveRowConfirmCommand.id : RemoveColConfirmCommand.id,
                    params
                );

                if (!result) {
                    return false;
                }

                nextRanges = _updateRangesAfterDelete(nextRanges, range, selectionType, worksheet.getRowCount(), worksheet.getColumnCount());
                if (activePrimary) {
                    activePrimary = _updatePrimaryAfterDelete(activePrimary, range, selectionType, worksheet.getRowCount(), worksheet.getColumnCount());
                }
            }
            if (!_restoreRowColSelections(
                commandService,
                unitId,
                subUnitId,
                worksheet.getRowCount(),
                worksheet.getColumnCount(),
                nextRanges,
                activePrimary,
                selectionType
            )) {
                return false;
            }
        } finally {
            batchingHandle.dispose();
        }
        return true;
    },
};
