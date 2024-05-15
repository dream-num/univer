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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import { Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    UniverInstanceType,
} from '@univerjs/core';

import { isSingleCellSelection, SelectionManagerService } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { ISheetRangeLocation } from '@univerjs/sheets-ui';
import { expandToContinuousRange } from '@univerjs/sheets-ui';

import { type ICellValueCompareFn, type IOrderRule, ReorderRangeCommand, SortType } from '../commands/sheets-reorder.command';

export const SHEET_FILTER_SNAPSHOT_ID = 'SHEET_FILTER_PLUGIN';

export interface ISortOption {
    range: IRange;
    orderRules: IOrderRule[];
}

export const ISheetsSortService = createIdentifier<SheetsSortService>('univer.sheets-sort.service');

/**
 * This service is responsible for managing filter models, especially their lifecycle.
 */
@OnLifecycle(LifecycleStages.Ready, SheetsSortService)
export class SheetsSortService extends Disposable {
    private _compareFns: ICellValueCompareFn[] = [];
    // private readonly _filterModels = new Map<string, Map<string, FilterModel>>();

    // private readonly _loadedUnitId$ = new BehaviorSubject<Nullable<string>>(null);
    // readonly loadedUnitId$ = this._loadedUnitId$.asObservable();

    // private readonly _activeFilterModel$ = new BehaviorSubject<Nullable<FilterModel>>(null);
    // /** An observable value emitting the current Workbook's active Worksheet's filter model (if there is one). */
    // readonly activeFilterModel$ = this._activeFilterModel$.asObservable();
    // /** The current Workbook's active Worksheet's filter model (if there is one). */
    // get activeFilterModel(): Nullable<FilterModel> { return this._activeFilterModel$.getValue(); }

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService) {
        super();
    }

    async triggerSortDirectly(asc: boolean) {
        const location = await this.detectSortRange();
        if (!location) {
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

    async triggerSortCustomize() {
        const location = await this.detectSortRange();
        if (!location) {
            return false;
        }
        // open customize dialog
        const sortOption: ISortOption = await this._openCustomizeDialog(location);
        this._applySort(sortOption, location.unitId, location.subUnitId);
    }

    registerCompareFn(fn: ICellValueCompareFn) {
        this._compareFns.unshift(fn);
    }

    getAllCompareFns(): ICellValueCompareFn[] {
        return this._compareFns;
    }

    private _openCustomizeDialog(location: ISheetRangeLocation): ISortOption | PromiseLike<ISortOption> {
        // TODO: @yuhongz a panel to set rules.
        return {
            range: location.range,
            //  mock temporary.
            orderRules: [{ type: SortType.ASC, colIndex: location.range.startColumn }, { type: SortType.DESC, colIndex: location.range.endColumn }],
        };

        // throw new Error('Method not implemented.');
    }


    private _applySort(sortOption: ISortOption, unitId: string, subUnitId: string) {
        this._commandService.executeCommand(ReorderRangeCommand.id, {
            orderRules: sortOption.orderRules,
            range: sortOption.range,
            unitId,
            sheetId: subUnitId,
        });
    }

    private async detectSortRange(): Promise<Nullable<ISheetRangeLocation >> {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET) as Workbook;
        const worksheet = workbook.getActiveSheet();
        const matrix = worksheet.getCellMatrix();
        // 1. get current selection
        const selection = this._selectionManagerService.getLast();
        if (!selection) {
            return null;
        }
        let range;
        // 2. single cell selection -> detection max range
        if (isSingleCellSelection(selection)) {
            range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
        } else {
        // 3. multi-cell selection -> dialog
            // TODO:@yuhongz add dialog GUI
            const dialogRes = await Promise.resolve(true);
            if (dialogRes) {
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
