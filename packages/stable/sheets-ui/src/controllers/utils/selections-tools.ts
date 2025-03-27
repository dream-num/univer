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

import type { IAccessor, Nullable, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { IUniverInstanceService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import { MERGE_CELL_INTERCEPTOR_CHECK, MergeCellController, RangeProtectionRuleModel, SheetsSelectionsService } from '@univerjs/sheets';
import { combineLatest, map, of, switchMap } from 'rxjs';

export function getSheetSelectionsDisabled$(accessor: IAccessor) {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const mergeCellController = accessor.get(MergeCellController);

    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    return combineLatest([
        selectionManagerService.selectionMoveEnd$,
        workbook$.pipe(map((workbook) => workbook?.getUnitId() ?? '')),
        workbook$.pipe(switchMap((workbook) => workbook?.activeSheet$ ?? of(null))),
    ]).pipe(
        map(([selection, unitId, sheet]) => {
            if (!sheet) return false;
            if (!selection || selection.length === 0) return false;
            const subUnitId = sheet.getSheetId();

            const selectionRanges = selection.map((sel) => sel.range);
            const disableResByInterceptor = mergeCellController.interceptor.fetchThroughInterceptors(MERGE_CELL_INTERCEPTOR_CHECK)(false, selectionRanges);

            if (disableResByInterceptor) {
                return true;
            }

            const subUnitRuleRange = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId)
                .map((rule) => rule.ranges)
                .flat();

            if (selection.length < 2) {
                const range = selection[0].range;
                const rangeIsOverlap = subUnitRuleRange.some((ruleRange) => {
                    return Rectangle.intersects(ruleRange, range) && !Rectangle.contains(ruleRange, range);
                });
                return rangeIsOverlap;
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

/**
 * Detect if this row is selected
 * @param selections
 * @param rowIndex
 * @returns boolean
 */
export function isThisRowSelected(
    selections: Readonly<ISelectionWithStyle[]>,
    rowIndex: number
): boolean {
    return !!matchedSelectionByRowColIndex(selections, rowIndex, RANGE_TYPE.ROW);
}

/**
 * Detect if this col is selected
 * @param selections
 * @param colIndex
 * @returns boolean
 */
export function isThisColSelected(
    selections: Readonly<ISelectionWithStyle[]>,
    colIndex: number
): boolean {
    return !!matchedSelectionByRowColIndex(selections, colIndex, RANGE_TYPE.COLUMN);
}

/**
 * Detect this row/col is in selections.
 * @param selections
 * @param indexOfRowCol
 * @param rowOrCol
 * @returns boolean
 */
export function matchedSelectionByRowColIndex(
    selections: Readonly<ISelectionWithStyle[]>,
    indexOfRowCol: number,
    rowOrCol: RANGE_TYPE.ROW | RANGE_TYPE.COLUMN
): Nullable<ISelectionWithStyle> {
    const matchSelectionData = selections.find((sel) => {
        const range = sel.range;
        const { startRow: startRowOfCurrSel, endRow: endRowOfCurrSel, startColumn: startColumnOfCurrSel, endColumn: endColumnOfCurrSel, rangeType: rangeTypeOfCurrSelection } = range;

        if (rangeTypeOfCurrSelection === RANGE_TYPE.ALL || rangeTypeOfCurrSelection === RANGE_TYPE.NORMAL) return false;

        if (rangeTypeOfCurrSelection === rowOrCol) {
            if (rowOrCol === RANGE_TYPE.COLUMN && startColumnOfCurrSel <= indexOfRowCol && indexOfRowCol <= endColumnOfCurrSel) {
                return true;
            }
            if (rowOrCol === RANGE_TYPE.ROW && startRowOfCurrSel <= indexOfRowCol && indexOfRowCol <= endRowOfCurrSel) {
                return true;
            }
        }
        return false;
    });

    return matchSelectionData;
}
