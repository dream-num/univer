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

import type { IAccessor, Workbook } from '@univerjs/core';
import { IUniverInstanceService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { MERGE_CELL_INTERCEPTOR_CHECK, MergeCellController, RangeProtectionRuleModel, SheetsSelectionsService } from '@univerjs/sheets';
import { combineLatest, map } from 'rxjs';

export function getSheetSelectionsDisabled$(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();

    const mergeCellController = accessor.get(MergeCellController);

    return combineLatest([
        selectionManagerService.selectionMoveEnd$,
        workbook.activeSheet$,
    ]).pipe(
        map(([selection, sheet]) => {
            if (!sheet) return false;
            if (!selection || selection.length === 0) return false;
            const subUnitId = sheet.getSheetId();

            const selectionRanges = selection.map((sel) => sel.range);
            const withPivot = mergeCellController.interceptor.fetchThroughInterceptors(MERGE_CELL_INTERCEPTOR_CHECK)(false, selectionRanges);

            if (withPivot) {
                return true;
            }

            const subUnitRuleRange = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId)
                .map((rule) => rule.ranges).flat();

            if (selection.length < 2) {
                const range = selection[0].range;
                const hasLap = subUnitRuleRange.some((ruleRange) => {
                    return Rectangle.intersects(ruleRange, range) && !Rectangle.contains(ruleRange, range);
                });
                return hasLap;
            }

            for (let i = 0; i < selection.length; i++) {
                for (let j = i + 1; j < selection.length; j++) {
                    if (Rectangle.intersects(selection[i].range, selection[j].range)) {
                        return true;
                    }
                }
            }
            return false;
        })
    );
}

export function checkInHeaderRanges(
    selections: Readonly<ISelectionWithStyle[]>,
    num: number,
    rType: RANGE_TYPE.ROW | RANGE_TYPE.COLUMN
): false | ISelectionWithStyle {
    const matchSelectionData = selections.find((sel) => {
        const range = sel.range;
        const { startRow, endRow, startColumn, endColumn, rangeType } = range;

        if (rangeType === RANGE_TYPE.ALL || rangeType === RANGE_TYPE.NORMAL) return false;

        if (rType === RANGE_TYPE.COLUMN && RANGE_TYPE.COLUMN === rangeType) {
            return num >= startColumn && num <= endColumn;
        }

        return rangeType === RANGE_TYPE.ROW && num >= startRow && num <= endRow;
    });

    return matchSelectionData ?? false;
}
