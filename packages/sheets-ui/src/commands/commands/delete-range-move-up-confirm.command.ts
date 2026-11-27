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

import type { ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    getIntersectRange,
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
    Rectangle,
} from '@univerjs/core';
import {
    DeleteRangeMoveUpCommand,
    getSheetCommandTarget,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';

export const DeleteRangeMoveUpConfirmCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-move-up-confirm',
    handler: async (accessor) => {
        const confirmService = accessor.get(IConfirmService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selection = selectionManagerService.getCurrentSelections();
        if (!selection) return false;

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const skeletonService = accessor.get(SheetSkeletonService);
        if (skeletonService.isDisplayProjectionPending(unitId, subUnitId)) {
            return false;
        }
        const skeleton = skeletonService.getDisplaySkeleton(unitId, subUnitId);
        const isRowFiltered = (row: number) => skeleton?.getRowFiltered(row) ?? worksheet.getRowFiltered(row);
        let range = selectionManagerService.getCurrentLastSelection()?.range;
        if (!range) return false;

        range = { ...range, endRow: worksheet.getRowCount() - 1 };

        for (let i = range.startRow; i <= range.endRow; i++) {
            if (isRowFiltered(i)) {
                await confirmService.confirm({
                    id: DeleteRangeMoveUpConfirmCommand.id,
                    title: { title: localeService.t<LocaleKey>('sheets-ui.filter.confirm.error') },
                    children: { title: localeService.t<LocaleKey>('sheets-ui.filter.confirm.notAllowedToInsertRange') },
                    confirmText: localeService.t<LocaleKey>('sheets-ui.button.confirm'),
                });
                return false;
            }
        }

        const getColLength = (range: IRange) => range.endColumn - range.startColumn;
        const mergeData = worksheet.getMergeData().find((mergeRange) => {
            const interSectedRange = getIntersectRange(mergeRange, range);
            return interSectedRange ? getColLength(mergeRange) > getColLength(interSectedRange) : false;
        });

        if (!mergeData) {
            return commandService.executeCommand(DeleteRangeMoveUpCommand.id);
        }

        const selectedRanges = selection.map(({ range }) => ({ ...range }));
        const projection = skeleton?.getDisplayProjection();
        const result = await confirmService.confirm({
            id: DeleteRangeMoveUpConfirmCommand.id,
            title: { title: localeService.t<LocaleKey>('sheets-ui.merge.confirm.warning') },
            children: { title: localeService.t<LocaleKey>('sheets-ui.merge.confirm.dismantleMergeCellWarning') },
            cancelText: localeService.t<LocaleKey>('sheets-ui.button.cancel'),
            confirmText: localeService.t<LocaleKey>('sheets-ui.button.confirm'),
        });
        if (result) {
            const currentTarget = getSheetCommandTarget(univerInstanceService);
            const currentSelection = selectionManagerService.getCurrentSelections();
            if (currentTarget?.worksheet !== worksheet
                || skeletonService.isDisplayProjectionPending(unitId, subUnitId)
                || skeletonService.getDisplaySkeleton(unitId, subUnitId) !== skeleton
                || skeleton?.getDisplayProjection() !== projection
                || currentSelection.length !== selectedRanges.length
                || currentSelection.some(({ range }, index) => !Rectangle.equals(range, selectedRanges[index]))) {
                return false;
            }
            for (let i = range.startRow; i <= range.endRow; i++) {
                if (isRowFiltered(i)) {
                    return false;
                }
            }
            return commandService.executeCommand(DeleteRangeMoveUpCommand.id);
        }
        return true;
    },
};
