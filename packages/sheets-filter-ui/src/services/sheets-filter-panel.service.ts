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

import type { ICustomFilters, IRange, Worksheet } from '@univerjs/core';
import { Disposable, extractPureTextFromCell, IUniverInstanceService } from '@univerjs/core';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { FilterModel } from '@univerjs/sheets-filter';
import { createIdentifier, Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

enum FilterByValueUpdateMode {
    CONFIRM,
    AUTO,
}

enum FilterBy {
    VALUES,
    CONDITIONS,
    COLOR,
}

export interface IFilterByValueItem {
    value: string;
    checked: boolean;
}

export interface ISheetsFilterPanelService {
    /**
     * Set up the panel to change the filter condition on a specific column.
     * @param filterModel the filter model we will be working on
     * @param col
     * @returns if the filter condition is set up successfully
     */
    setUpFilterConditionOfCol(filterModel: FilterModel, col: number): boolean;

    /**
     * Terminate the filter panel without applying changes.
     */
    terminate(): boolean;
}
export const ISheetsFilterPanelService = createIdentifier<ISheetsFilterPanelService>('sheets-filter-ui.sheets-filter-panel.service');

/**
 * This service controls the state of the filter panel.
 */
export class SheetsFilterPanelService extends Disposable {
    private readonly _filterBy$ = new BehaviorSubject<FilterBy>(FilterBy.VALUES);
    readonly filterBy$ = this._filterBy$.asObservable();

    private readonly _filterByValues$ = new BehaviorSubject<IFilterByValueItem[]>([]);
    readonly filterByValues$ = this._filterByValues$.asObservable();

    constructor(
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    override dispose(): void {
        this._filterBy$.complete();
        this._filterByValues$.complete();
    }

    setupCol(filterModel: FilterModel, col: number): boolean {
        // We use filter type that (if) has been set on the column as the default filter type.
        const filterColumn = filterModel.getFilterColumn(col);
        if (filterColumn) {
            const info = filterColumn.getColumnInfo();
            if (info.customFilters) {
                return this._setupByConditions(filterModel, col, info.customFilters);
            }

            return this._setupByValues(filterModel, col, info.customFilters);
        }

        // By default we filter by values.
        return this._setupByValues(filterModel, col);
    };

    terminate(): boolean {
        return true;
    }

    private _setupByValues(filterModel: FilterModel, col: number, filters?: string[]): boolean {
        this._filterBy$.next(FilterBy.VALUES);

        const range = filterModel.getRange();
        const column = range.startColumn + col;
        const iterateRange: IRange = { ...range, startColumn: column, endColumn: column };

        const items: IFilterByValueItem[] = [];

        // we write the iteration twice to avoid the overhead of accessing the `alreadyChecked` set if there is no
        // already checked values
        const worksheet = this._getWorksheetForFilterModel(filterModel);

        const alreadyChecked = new Set(filters);
        const alreadySeen = new Set<string>();
        if (alreadyChecked.size) {
            // TODO@wzhudev: we would take merged cells into account later
            for (const cell of worksheet.iterateByRow(iterateRange)) {
                const value = extractPureTextFromCell(cell.value) ?? ''; // use empty string as default value
                if (!alreadySeen.has(value)) {
                    alreadySeen.add(value);
                    items.push({ value, checked: alreadyChecked.has(value) });
                }
            }
        } else {
            for (const cell of worksheet.iterateByColumn(iterateRange)) {
                const value = extractPureTextFromCell(cell.value) ?? ''; // use empty string as default value
                if (!alreadySeen.has(value)) {
                    alreadySeen.add(value);
                    items.push({ value, checked: true });
                }
            }
        }

        this._filterByValues$.next(items);
        return true;
    }

    private _setupByConditions(filterModel: FilterModel, col: number, conditions: ICustomFilters): boolean {
        this._filterBy$.next(FilterBy.CONDITIONS);

        return true;
    }

    private _getWorksheetForFilterModel(filterModel: FilterModel): Worksheet {
        const { unitId, subUnitId } = filterModel;
        const worksheet = this._univerInstanceService.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`[SheetsFilterPanelService]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);
        }

        return worksheet;
    }
}
