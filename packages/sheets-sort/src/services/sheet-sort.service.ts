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

import type { Nullable, Workbook } from '@univerjs/core';
import { Disposable, ICommandService,
    ILogService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Range,
    Rectangle,
    UniverInstanceType,
} from '@univerjs/core';

import { isSingleCellSelection, SelectionManagerService } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { ISheetRangeLocation } from '@univerjs/sheets-ui';
import { expandToContinuousRange } from '@univerjs/sheets-ui';

import { type ICellValueCompareFn, ReorderRangeCommand, SortType } from '../commands/sheets-reorder.command';
import { EXTEND_TYPE, type ISortOption } from './interface';
import { ISheetsSortUIService } from './sheet-sort-ui.service';

export const ISheetsSortService = createIdentifier<SheetsSortService>('univer.sheets-sort.service');

@OnLifecycle(LifecycleStages.Ready, SheetsSortService)
export class SheetsSortService extends Disposable {
    private _compareFns: ICellValueCompareFn[] = [];

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService,
        @ISheetsSortUIService private readonly _sheetsSortUIService: ISheetsSortUIService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService) {
        super();
    }

    async triggerSortDirectly(asc: boolean) {
        const location = await this._detectSortRange();
        if (!location) {
            return false;
        }

        const mergeCheck = this._mergeCheck(location);
        if (!mergeCheck) {
            return false;
        }
        const primary = this._selectionManagerService.getLast()?.primary;
        if (!primary) {
            return false;
        }
        const sortOption: ISortOption = {
            orderRules: [{
                type: asc ? SortType.ASC : SortType.DESC,
                colIndex: primary.actualColumn,
            }],
            range: location.range,
        };
        this._applySort(sortOption, location.unitId, location.subUnitId);
        return true;
    }

    private _mergeCheck(location: ISheetRangeLocation) {
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
            this._sheetsSortUIService.showMergeError();
            return false;
        }
        Range.foreach(range, (row, col) => {
            const outOfMergeCell = !mergeDataInRange.some((merge) => Rectangle.contains(merge, { startRow: row, startColumn: col, endRow: row, endColumn: col }));
            if (outOfMergeCell) {
                this._logService.warn('[Sort Error]: Different size of merge-cells detected in sort range, sorting aborted.');
                this._sheetsSortUIService.showMergeError();
                return false;
            }
        });
        return true;
    }

    async triggerSortCustomize() {
        const location = await this._detectSortRange();
        if (!location) {
            return false;
        }

        const mergeCheck = this._mergeCheck(location);
        if (!mergeCheck) {
            return false;
        }
        // open customize dialog
        const sortOption: ISortOption = await this._sheetsSortUIService.showCustomSortPanel(location);
        this._applySort(sortOption, location.unitId, location.subUnitId);
        return true;
    }

    registerCompareFn(fn: ICellValueCompareFn) {
        this._compareFns.unshift(fn);
    }

    getAllCompareFns(): ICellValueCompareFn[] {
        return this._compareFns;
    }


    private _applySort(sortOption: ISortOption, unitId: string, subUnitId: string) {
        this._commandService.executeCommand(ReorderRangeCommand.id, {
            orderRules: sortOption.orderRules,
            range: sortOption.range,
            unitId,
            subUnitId,
        });
    }

    private async _detectSortRange(): Promise<Nullable<ISheetRangeLocation >> {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET) as Workbook;
        const worksheet = workbook.getActiveSheet();
        const matrix = worksheet.getCellMatrix();
        // 1. get current selection
        const selection = this._selectionManagerService.getLast();
        if (!selection) {
            return null;
        }
        let range;
        // 2. single cell selection -> detect max range
        if (isSingleCellSelection(selection)) {
            range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
        } else {
        // 3. multi-cell selection -> dialog
            // TODO:@yuhongz add dialog GUI
            const confirmRes = await this._sheetsSortUIService.showExtendConfirm();
            if (confirmRes === EXTEND_TYPE.CANCEL) {
                return null;
            }
            if (confirmRes === EXTEND_TYPE.KEEP) {
                range = selection.range;
            } else {
                range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
            }
        }

        return {
            range,
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
        };
    }
}
