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

import type { Workbook } from '@univerjs/core';
import { Disposable, ICommandService,
    ILogService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Range,
    Rectangle,
} from '@univerjs/core';
import type { ISheetRangeLocation } from '@univerjs/sheets-ui';

import { type ICellValueCompareFn, ReorderRangeCommand } from '../commands/sheets-reorder.command';
import type { ISortOption } from './interface';


@OnLifecycle(LifecycleStages.Ready, SheetsSortService)
export class SheetsSortService extends Disposable {
    private _compareFns: ICellValueCompareFn[] = [];

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService) {
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
        const mergeCols = mergeDataInRange[0].endColumn - mergeDataInRange[0].startColumn;
        const mergeRows = mergeDataInRange[0].endRow - mergeDataInRange[0].startRow;
        // Every merge-cell should have the same size.
        const sizeCheck = mergeDataInRange.every((merge) => merge.endColumn - merge.startColumn === mergeCols && merge.endRow - merge.startRow === mergeRows);
        if (!sizeCheck) {
            this._logService.warn('[Sort Error]: Different size of merge-cells detected in sort range, sorting aborted.');
            return false;
        }
        Range.foreach(range, (row, col) => {
            const outOfMergeCell = !mergeDataInRange.some((merge) => Rectangle.contains(merge, { startRow: row, startColumn: col, endRow: row, endColumn: col }));
            if (outOfMergeCell) {
                this._logService.warn('[Sort Error]: Different size of merge-cells detected in sort range, sorting aborted.');
                return false;
            }
        });
        return true;
    }


    registerCompareFn(fn: ICellValueCompareFn) {
        this._compareFns.unshift(fn);
    }

    getAllCompareFns(): ICellValueCompareFn[] {
        return this._compareFns;
    }


    applySort(sortOption: ISortOption, unitId: string, subUnitId: string) {
        this._commandService.executeCommand(ReorderRangeCommand.id, {
            orderRules: sortOption.orderRules,
            range: sortOption.range,
            unitId,
            subUnitId,
        });
    }
}
