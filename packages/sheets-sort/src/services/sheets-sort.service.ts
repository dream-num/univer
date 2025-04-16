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

import type { IRange, Workbook } from '@univerjs/core';
import type { ISheetRangeLocation } from '@univerjs/sheets';
import type { ISortOption } from './interface';
import {
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    Rectangle,
} from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { type ICellValueCompareFn, SortRangeCommand } from '../commands/commands/sheets-sort.command';
import { isNullValue } from '../controllers/utils';

export class SheetsSortService extends Disposable {
    private _compareFns: ICellValueCompareFn[] = [];

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();
    }

    mergeCheck(location: ISheetRangeLocation) {
        const { unitId, subUnitId, range } = location;
        const sheet = (this._univerInstanceService.getUnit(unitId) as Workbook)?.getSheetBySheetId(subUnitId);
        if (!sheet) {
            return false;
        }
        const mergeDataInRange = sheet.getMergeData().filter((merge) => Rectangle.contains(range, merge));
        if (mergeDataInRange.length === 0) {
            return true;
        }

        return isRangeDividedEqually(range, mergeDataInRange);
    }

    emptyCheck(location: ISheetRangeLocation) {
        const { unitId, subUnitId, range } = location;
        const sheet = (this._univerInstanceService.getUnit(unitId) as Workbook)?.getSheetBySheetId(subUnitId);
        if (!sheet) {
            return false;
        }
        for (let row = range.startRow; row <= range.endRow; row++) {
            for (let col = range.startColumn; col <= range.endColumn; col++) {
                if (!isNullValue(sheet.getCellRaw(row, col))) {
                    return true;
                }
            }
        }
        return false;
    }

    singleCheck(location: ISheetRangeLocation) {
        if (location.range.startRow === location.range.endRow) {
            return false;
        }
        return true;
    }

    formulaCheck(location: ISheetRangeLocation) {
        const { unitId, subUnitId, range } = location;
        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange()?.[unitId]?.[subUnitId];
        for (const row in arrayFormulaRange) {
            const rowData = arrayFormulaRange[Number(row)];
            for (const col in rowData) {
                const arrayFormula = rowData[Number(col)];
                if (arrayFormula && Rectangle.intersects(range, arrayFormula)) {
                    return false;
                }
            }
        }
        return true;
    }

    registerCompareFn(fn: ICellValueCompareFn) {
        this._compareFns.unshift(fn);
    }

    getAllCompareFns(): ICellValueCompareFn[] {
        return this._compareFns;
    }

    applySort(sortOption: ISortOption, unitId?: string, subUnitId?: string) {
        const { unitId: _unitId, subUnitId: _subUnitId } = getSheetCommandTarget(this._univerInstanceService) || {};
        this._commandService.executeCommand(SortRangeCommand.id, {
            orderRules: sortOption.orderRules,
            range: sortOption.range,
            hasTitle: sortOption.hasTitle ?? false,
            unitId: unitId || _unitId,
            subUnitId: subUnitId || _subUnitId,
        });
    }
}

function isRangeDividedEqually(range: IRange, merges: IRange[]): boolean {
    const rangeRows = range.endRow - range.startRow + 1;
    const rangeCols = range.endColumn - range.startColumn + 1;
    let mergeRows: number | null = null;
    let mergeCols: number | null = null;

    const totalArea = rangeRows * rangeCols;
    let totalMergeArea = 0;
    for (const merge of merges) {
        if (merge.startRow >= range.startRow && merge.endRow <= range.endRow && merge.startColumn >= range.startColumn && merge.endColumn <= range.endColumn) {
            const currentMergeRows = merge.endRow - merge.startRow + 1;
            const currentMergeCols = merge.endColumn - merge.startColumn + 1;

            if (mergeRows === null && mergeCols === null) {
                mergeRows = currentMergeRows;
                mergeCols = currentMergeCols;
            } else if (currentMergeRows !== mergeRows || currentMergeCols !== mergeCols) {
                return false;
            }
            totalMergeArea += currentMergeRows * currentMergeCols;
        }
    }

    return totalMergeArea === totalArea;
}
