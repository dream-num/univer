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

import type { IFilterColumn, IRange, Nullable } from '@univerjs/core';
import { Disposable, extractPureTextFromCell, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { FilterColumn, FilterModel } from '@univerjs/sheets-filter';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, map, merge, ReplaySubject, shareReplay, startWith, Subject, throttleTime } from 'rxjs';
import { RefRangeService } from '@univerjs/sheets';
import type { FilterOperator, IFilterConditionFormParams, IFilterConditionItem } from '../models/conditions';
import { FilterConditionItems } from '../models/conditions';
import type { ISetSheetsFilterCriteriaCommandParams } from '../commands/sheets-filter.command';
import { SetSheetsFilterCriteriaCommand } from '../commands/sheets-filter.command';

export enum FilterBy {
    VALUES,
    CONDITIONS,
}

export interface IFilterByValueItem {
    value: string;
    checked: boolean;
    count: number;
    index: number;
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

export type FilterByModel = ByConditionsModel | ByValuesModel;

/**
 * This service controls the state of the filter panel. There should be only one instance of the filter panel
 * at one time.
 */
export class SheetsFilterPanelService extends Disposable {
    private readonly _filterBy$ = new BehaviorSubject<FilterBy>(FilterBy.VALUES);
    readonly filterBy$ = this._filterBy$.asObservable();
    get filterBy(): FilterBy { return this._filterBy$.getValue(); }

    private readonly _filterByModel$ = new ReplaySubject<Nullable<FilterByModel>>(1);
    readonly filterByModel$ = this._filterByModel$.asObservable();
    private _filterByModel: Nullable<FilterByModel> = null;
    public get filterByModel(): Nullable<FilterByModel> { return this._filterByModel; }

    private _filterModel: Nullable<FilterModel> = null;
    private _col = -1;

    private _filterColumnAliveListener: Nullable<IDisposable> = null;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService
    ) {
        super();
    }

    override dispose(): void {
        this._filterBy$.complete();
        this._filterByModel$.complete();
    }

    setupCol(filterModel: FilterModel, col: number): boolean {
        this.terminate();

        this._filterModel = filterModel;
        this._col = col;

        // TODO@wzhudev: should setup listener so that

        // We use filter type that (if) has been set on the column as the default filter type.
        const filterColumn = filterModel.getFilterColumn(col);
        if (filterColumn) {
            const info = filterColumn.getColumnData();
            if (info.customFilters) {
                return this._setupByConditions(filterModel, col);
            }

            // TODO: when there's only one value filter and it's not empty, we should use FilterByCondition
            return this._setupByValues(filterModel, col);
        }

        // By default we filter by values.
        return this._setupByValues(filterModel, col);
    };

    changeFilterBy(filterBy: FilterBy): boolean {
        if (!this._filterModel || this._col === -1) {
            return false;
        }

        if (filterBy === FilterBy.VALUES) {
            return this._setupByValues(this._filterModel, this._col);
        } else {
            return this._setupByConditions(this._filterModel, this._col);
        }
    }

    terminate(): boolean {
        this._filterColumnAliveListener?.dispose();
        this._filterColumnAliveListener = null;

        this._filterModel = null;
        this._col = -1;

        return true;
    }

    /**
     * This method should be called when setting up on a column. It keeps
     * use RefService to determine if the FilterColumn no longer lives.
     */
    private _registerColumnStatusListener(filterModel: FilterModel, col: number): void {
        const filterRange = filterModel.getRange();
        const columnHeaderRange: IRange = {
            startColumn: filterRange.startColumn + col,
            startRow: filterRange.startRow,
            endRow: filterRange.startRow,
            endColumn: filterRange.startColumn + col,
        };
    }

    private _setupByValues(filterModel: FilterModel, col: number): boolean {
        this._disposePreviousModel();

        const model = ByValuesModel.fromFilterColumn(
            this._injector,
            filterModel,
            col
        );

        this._filterByModel$.next(model);
        this._filterByModel = model;
        this._filterBy$.next(FilterBy.VALUES);

        return true;
    }

    private _setupByConditions(filterModel: FilterModel, col: number): boolean {
        this._disposePreviousModel();

        const model = ByConditionsModel.fromFilterColumn(
            this._injector,
            filterModel,
            col,
            filterModel.getFilterColumn(col)
        );

        this._filterByModel$.next(model);
        this._filterByModel = model;
        this._filterBy$.next(FilterBy.CONDITIONS);

        return true;
    }

    private _disposePreviousModel(): void {
        this._filterByModel?.dispose();
        this._filterByModel$.next(null);
        this._filterByModel = null;
    }
}

/**
 * This model would be used to control the "Filter By Conditions" panel. It should be reconstructed in the following
 * situations:
 *
 * 1. The target `FilterColumn` object is changed
 * 2. User toggles "Filter By"
 */
export class ByConditionsModel extends Disposable {
    private readonly _conditionItem$: BehaviorSubject<IFilterConditionItem>;
    readonly conditionItem$: Observable<IFilterConditionItem>;
    get conditionItem(): IFilterConditionItem { return this._conditionItem$.getValue(); }

    private readonly _filterConditionFormParams$: BehaviorSubject<IFilterConditionFormParams>;
    readonly filterConditionFormParams$: Observable<IFilterConditionFormParams>;
    get filterConditionFormParams(): IFilterConditionFormParams { return this._filterConditionFormParams$.getValue(); }

    /**
     * Create a model with targeting filter column. If there is not a filter column, the model would be created with
     * default values.
     *
     * @param injector
     * @param filterModel
     * @param col
     * @param filterColumn
     *
     * @returns the model to control the panel's state
     */
    static fromFilterColumn(injector: Injector, filterModel: FilterModel, col: number, filterColumn?: Nullable<FilterColumn>): ByConditionsModel {
        const [conditionItem, conditionParams] = FilterConditionItems.testMappingFilterColumn(filterColumn?.getColumnData());
        const model = injector.createInstance(ByConditionsModel, filterModel, col, conditionItem, conditionParams);
        return model;
    }

    // This model should not be constructed directly.
    constructor(
        private readonly _filterModel: FilterModel,
        // TODO@wzhudev: this may change!
        public _col: number,
        conditionItem: IFilterConditionItem,
        conditionParams: IFilterConditionFormParams,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._conditionItem$ = new BehaviorSubject<IFilterConditionItem>(conditionItem);
        this.conditionItem$ = this._conditionItem$.asObservable();

        this._filterConditionFormParams$ = new BehaviorSubject(conditionParams);
        this.filterConditionFormParams$ = this._filterConditionFormParams$.asObservable();
    }

    override dispose(): void {
        super.dispose();

        this._conditionItem$.complete();
        this._filterConditionFormParams$.complete();
    }

    /**
     * Apply the filter condition to the target filter column.
     */
    async apply(): Promise<boolean> {
        if (this._disposed) {
            return false;
        }

        const filterColumn = FilterConditionItems.mapToFilterColumn(this.conditionItem, this.filterConditionFormParams);
        return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._filterModel.unitId,
            subUnitId: this._filterModel.subUnitId,
            col: this._col,
            criteria: filterColumn,
        } as ISetSheetsFilterCriteriaCommandParams);
    }

    /**
     * This method would be called when user changes the primary condition. The model would load the corresponding
     * `IFilterConditionFormParams` and load default condition form params.
     */
    onPrimaryConditionChange(operator: FilterOperator): void {
        const conditionItem = FilterConditionItems.ALL_CONDITIONS.find((item) => item.operator === operator);
        if (!conditionItem) {
            throw new Error(`[ByConditionsModel]: condition item not found for operator: ${operator}!`);
        }

        this._conditionItem$.next(conditionItem);
        this._filterConditionFormParams$.next(FilterConditionItems.getInitialFormParams(operator));
    }

    /**
     * This method would be called when user changes the primary conditions, the input values or "AND" "OR" ratio.
     * If the primary conditions or the ratio is changed, the method would load the corresponding `IFilterCondition`.
     *
     * When the panel call this method, it only has to pass the changed keys.
     *
     * @param params
     */
    onConditionFormChange(params: Partial<Omit<IFilterConditionFormParams, 'and'> & { and: boolean }>): void {
        const newParams = { ...this.filterConditionFormParams, ...params };
        if (newParams.and !== true) {
            delete newParams.and;
        }

        if (typeof params.and !== 'undefined' || typeof params.operator1 !== 'undefined' || typeof params.operator2 !== 'undefined') {
            const conditionItem = FilterConditionItems.testMappingParams(newParams as IFilterConditionFormParams, this.conditionItem.numOfParameters);
            this._conditionItem$.next(conditionItem);
        }

        this._filterConditionFormParams$.next(newParams as IFilterConditionFormParams);
    }
}

/**
 * This model would be used to control the "Filter By Values" panel. It should be reconstructed in the following
 * situations:
 *
 * 1. The target `FilterColumn` object is changed
 * 2. User toggles "Filter By"
 */
export class ByValuesModel extends Disposable {
    /**
     * Create a model with targeting filter column. If there is not a filter column, the model would be created with
     * default values.
     *
     * @param injector
     * @param filterModel
     * @param col
     *
     * @returns the model to control the panel's state
     */
    static fromFilterColumn(injector: Injector, filterModel: FilterModel, col: number): ByValuesModel {
        const univerInstanceService = injector.get(IUniverInstanceService);
        const { unitId, subUnitId } = filterModel;
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            throw new Error(`[ByValuesModel]: Workbook not found for filter model with unitId: ${unitId}!`);
        }

        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`[ByValuesModel]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);
        }

        const range = filterModel.getRange();
        const column = range.startColumn + col;
        const filters = filterModel.getFilterColumn(col)?.getColumnData().filters || [];
        const iterateRange: IRange = { ...range, startColumn: column, endColumn: column };

        // we write the iteration twice to avoid the overhead of accessing the `alreadyChecked` set if there is no
        // already checked values
        const items: IFilterByValueItem[] = [];
        const itemsByKey: Record<string, IFilterByValueItem> = {};
        const alreadyChecked = new Set(filters);

        // TODO@wzhudev: we would take merged cells into account later

        let index = 0;
        if (alreadyChecked.size) {
            for (const cell of worksheet.iterateByRow(iterateRange)) {
                const value = cell?.value ? extractPureTextFromCell(cell.value) : '';
                if (!itemsByKey[value]) {
                    const item: IFilterByValueItem = { value, checked: alreadyChecked.has(value), count: 1, index };
                    itemsByKey[value] = item;
                    items.push(item);
                } else {
                    itemsByKey[value].count++;
                }

                index++;
            }
        } else {
            for (const cell of worksheet.iterateByColumn(iterateRange)) {
                const value = cell?.value ? extractPureTextFromCell(cell.value) : '';
                if (!itemsByKey[value]) {
                    const item: IFilterByValueItem = { value, checked: false, count: 1, index };
                    itemsByKey[value] = item;
                    items.push(item);
                } else {
                    itemsByKey[value].count++;
                }

                index++;
            }
        }

        const model = injector.createInstance(ByValuesModel, filterModel, col, items);
        return model;
    }

    private readonly _rawFilterItems$: BehaviorSubject<IFilterByValueItem[]>;
    readonly rawFilterItems$: Observable<IFilterByValueItem[]>;
    get rawFilterItems(): IFilterByValueItem[] { return this._rawFilterItems$.getValue(); }

    readonly filterItems$: Observable<IFilterByValueItem[]>;
    private _filterItems: IFilterByValueItem[] = [];
    private readonly _manuallyUpdateFilterItems$: Subject<IFilterByValueItem[]>;

    get filterItems() { return this._filterItems; }

    private readonly _searchString$: BehaviorSubject<string>;
    readonly searchString$: Observable<string>;

    constructor(
        private readonly _filterModel: FilterModel,
        // TODO@wzhudev: this may get change from outside!
        public col: number,
        /**
         * Filter items would remain unchanged after we create them,
         * though data may change after.
         */
        items: IFilterByValueItem[],
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._searchString$ = new BehaviorSubject<string>('');
        this.searchString$ = this._searchString$.asObservable();

        this._rawFilterItems$ = new BehaviorSubject<IFilterByValueItem[]>(items);
        this.rawFilterItems$ = this._rawFilterItems$.asObservable();

        this._manuallyUpdateFilterItems$ = new Subject<IFilterByValueItem[]>();

        this.filterItems$ = merge(
            combineLatest([
                this._searchString$.pipe(
                    throttleTime(500, undefined, { leading: true, trailing: true }),
                    startWith(void 0)
                ),
                this._rawFilterItems$,
            ]).pipe(
                map(([searchString, items]) => {
                    if (!searchString) return items;

                    const lowerSearchString = searchString.toLowerCase();
                    const searchKeyWords = lowerSearchString.split(/\s+/).filter((s) => !!s);
                    return items.filter((item) => {
                        const loweredItemValue = item.value.toLowerCase();
                        return searchKeyWords.some((keyword) => loweredItemValue.includes(keyword));
                    });
                })
            ),
            this._manuallyUpdateFilterItems$
        ).pipe(shareReplay(1));

        this.disposeWithMe(this.filterItems$.subscribe((items) => this._filterItems = items));
    }

    override dispose(): void {
        this._rawFilterItems$.complete();
        this._searchString$.complete();
    }

    setSearchString(str: string): void {
        this._searchString$.next(str);
    }

    /**
     * Toggle a filter item.
     */
    onFilterCheckToggled(item: IFilterByValueItem, checked: boolean): void {
        const items = this._filterItems.slice();
        const changedItem = items.find((i) => i.index === item.index);
        changedItem!.checked = checked;
        this._manuallyUpdateFilterItems(items);
    }

    onFilterOnly(item: IFilterByValueItem) {
        const items = this._filterItems.slice();
        items.forEach((i) => i.checked = i.index === item.index);
        this._manuallyUpdateFilterItems(items);
    }

    onCheckAllToggled(checked: boolean): void {
        const items = this._filterItems.slice();
        items.forEach((i) => i.checked = checked);
        this._manuallyUpdateFilterItems(items);
    }

    private _manuallyUpdateFilterItems(items: IFilterByValueItem[]): void {
        this._manuallyUpdateFilterItems$.next(items);
    }

    // expose method here to let the panel change filter items

    /**
     * Apply the filter condition to the target filter column.
     */
    async apply(): Promise<boolean> {
        if (this._disposed) {
            return false;
        }

        const criteria: IFilterColumn = {
            colId: this.col,
            filters: this._filterItems.filter((item) => item.checked).map((item) => item.value),
        };

        return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._filterModel.unitId,
            subUnitId: this._filterModel.subUnitId,
            col: this.col,
            criteria,
        } as ISetSheetsFilterCriteriaCommandParams);
    }
}
