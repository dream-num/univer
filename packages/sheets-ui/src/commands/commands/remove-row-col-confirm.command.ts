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

import type { IAccessor, ICommand, IRange, Workbook, Worksheet } from '@univerjs/core';
import type { IRemoveRowColCommandParams } from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';
import { CommandType, ICommandService, IConfirmService, IUndoRedoService, IUniverInstanceService, LocaleService, mergeIntervals, RANGE_TYPE } from '@univerjs/core';
import { followSelectionOperation, getSheetCommandTarget, RemoveColCommand, RemoveRowCommand, SetSelectionsOperation, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { isAllColumnsCovered, isAllRowsCovered } from './utils/selection-utils';

function getTargetRanges(accessor: IAccessor, params?: IRemoveRowColCommandParams): IRange[] {
    if (params?.range) {
        return [params.range];
    }

    return accessor.get(SheetsSelectionsService).getCurrentSelections()?.map((s) => s.range) ?? [];
}

async function removeRangesWithAtomicUndo(
    accessor: IAccessor,
    removeCommandId: string,
    removeRanges: IRange[],
    target: { workbook: Workbook; worksheet: Worksheet; unitId: string; subUnitId: string }
): Promise<boolean> {
    const { workbook, worksheet, unitId, subUnitId } = target;
    const commandService = accessor.get(ICommandService);

    // A single range removal is atomic by itself and keeps its default behavior.
    if (removeRanges.length === 1) {
        return commandService.executeCommand(removeCommandId, { range: removeRanges[0] });
    }

    // Pre-check every range before removing anything, so a rejection (e.g. an interceptor
    // veto) aborts the whole operation before any range is removed.
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    for (const range of removeRanges) {
        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: removeCommandId,
            params: { range, unitId, subUnitId },
        });
        if (!canPerform) {
            return false;
        }
    }

    // Remove the ranges inside an undo redo transaction: the removals batch into a single
    // undo element, and a failure while removing a later range (e.g. a permission check
    // rejecting a protected range) rolls the finished removals back instead of leaving a
    // partial removal behind, without clearing the previous redo history.
    const selections = accessor.get(SheetsSelectionsService).getCurrentSelections()?.map((selection) => ({
        range: { ...selection.range },
        primary: selection.primary ? { ...selection.primary } : null,
        style: selection.style,
    })) ?? [];

    const transaction = accessor.get(IUndoRedoService).__tempUndoRedoTransaction(unitId);

    const rollbackTransaction = () => {
        transaction.rollback();
        // restore the selections the ranges were removed for
        if (selections.length) {
            commandService.syncExecuteCommand(SetSelectionsOperation.id, { unitId, subUnitId, selections });
        }
    };

    try {
        for (const range of removeRanges) {
            // per-range selection updates are suppressed; the selection is set once afterwards
            const result = await commandService.executeCommand(removeCommandId, { range, followSelection: false });
            if (!result) {
                rollbackTransaction();
                return false;
            }
        }
    } catch (error) {
        rollbackTransaction();
        throw error;
    }

    transaction.commit();

    const followSelection = followSelectionOperation(removeRanges[removeRanges.length - 1], workbook, worksheet);
    commandService.syncExecuteCommand(followSelection.id, followSelection.params);

    return true;
}

export const RemoveRowConfirmCommand: ICommand = {
    id: 'sheet.command.remove-row-confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const ranges = getTargetRanges(accessor, params);
        if (!ranges.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const allRowRanges = worksheet.getVisibleRows();

        if (isAllRowsCovered(allRowRanges, ranges)) {
            const confirmService = accessor.get(IConfirmService);
            const localeService = accessor.get(LocaleService);

            await confirmService.confirm({
                id: 'sheet.confirm.remove-row',
                title: {
                    title: localeService.t<LocaleKey>('sheets-ui.info.problem'),
                },
                children: { title: localeService.t<LocaleKey>('sheets-ui.rightClick.deleteAllRowsAlert') },
                cancelText: localeService.t<LocaleKey>('sheets-ui.button.cancel'),
                confirmText: localeService.t<LocaleKey>('sheets-ui.button.confirm'),
            });

            return false;
        }

        // Merge duplicate and overlapping selections, then remove bottom-up so that removing
        // a range does not shift the rows of the ranges that are still to be removed.
        const endColumn = Math.max(worksheet.getMaxColumns() - 1, 0);
        const removeRanges: IRange[] = mergeIntervals(ranges.map((range) => [range.startRow, range.endRow]))
            .reverse()
            .map(([startRow, endRow]) => ({ startRow, endRow, startColumn: 0, endColumn, rangeType: RANGE_TYPE.ROW }));

        return removeRangesWithAtomicUndo(accessor, RemoveRowCommand.id, removeRanges, target);
    },
};

export const RemoveColConfirmCommand: ICommand = {
    id: 'sheet.command.remove-col-confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const ranges = getTargetRanges(accessor, params);
        if (!ranges.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const allColumnRanges = worksheet.getVisibleCols();

        if (isAllColumnsCovered(allColumnRanges, ranges)) {
            const confirmService = accessor.get(IConfirmService);
            const localeService = accessor.get(LocaleService);

            await confirmService.confirm({
                id: 'sheet.confirm.remove-col',
                title: {
                    title: localeService.t<LocaleKey>('sheets-ui.info.problem'),
                },
                children: { title: localeService.t<LocaleKey>('sheets-ui.rightClick.deleteAllColumnsAlert') },
                cancelText: localeService.t<LocaleKey>('sheets-ui.button.cancel'),
                confirmText: localeService.t<LocaleKey>('sheets-ui.button.confirm'),
            });

            return false;
        }

        // Merge duplicate and overlapping selections, then remove right-to-left so that removing
        // a range does not shift the columns of the ranges that are still to be removed.
        const endRow = Math.max(worksheet.getMaxRows() - 1, 0);
        const removeRanges: IRange[] = mergeIntervals(ranges.map((range) => [range.startColumn, range.endColumn]))
            .reverse()
            .map(([startColumn, endColumn]) => ({ startRow: 0, endRow, startColumn, endColumn, rangeType: RANGE_TYPE.COLUMN }));

        return removeRangesWithAtomicUndo(accessor, RemoveColCommand.id, removeRanges, target);
    },
};
