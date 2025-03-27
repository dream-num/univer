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

import type { IDisposable, IRange, Nullable } from '@univerjs/core';
import type { FilterColumn, FilterModel, IFilterColumn, ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import type { Observable } from 'rxjs';
import type { FilterOperator, IFilterConditionFormParams, IFilterConditionItem } from '../models/conditions';
import { createIdentifier, Disposable, ICommandService, Inject, Injector, IUniverInstanceService, LocaleService, Quantity, Tools } from '@univerjs/core';
import { RefRangeService } from '@univerjs/sheets';
import { SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';

import { BehaviorSubject, combineLatest, map, merge, of, ReplaySubject, shareReplay, startWith, Subject, throttleTime } from 'rxjs';
import { FilterConditionItems } from '../models/conditions';
import { statisticFilterByValueItems } from '../models/utils';
import { getFilterTreeByValueItems, ISheetsGenerateFilterValuesService } from '../worker/generate-filter-values.service';
import { areAllLeafNodesChecked, findObjectByKey, searchTree, updateLeafNodesCheckedStatus } from './util';

export enum FilterBy {
    VALUES,
    CONDITIONS,
}

export interface IFilterByValueItem {
    value: string;
    checked: boolean;
    count: number;
    index: number;

    /**
     * This property indicates that this is a special item which maps to empty strings or empty cells.
     */
    isEmpty: boolean;
}

export interface IFilterByValueWithTreeItem {
    title: string;
    key: string;
    count: number;
    checked: boolean;
    leaf: boolean;
    originValues?: Set<string>;
    children?: IFilterByValueWithTreeItem[];
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

export interface IFilterByModel extends IDisposable {
    canApply$: Observable<boolean>;

    deltaCol(offset: number): void;

    clear(): Promise<boolean>;
    apply(): Promise<boolean>;
}

/**
 * This service controls the state of the filter panel. There should be only one instance of the filter panel
 * at one time.
 */
export class SheetsFilterPanelService extends Disposable {
    private readonly _filterBy$ = new BehaviorSubject<FilterBy>(FilterBy.VALUES);
    readonly filterBy$ = this._filterBy$.asObservable();
    get filterBy(): FilterBy { return this._filterBy$.getValue(); }

    private readonly _filterByModel$ = new ReplaySubject<Nullable<IFilterByModel>>(1);
    readonly filterByModel$ = this._filterByModel$.asObservable();
    private _filterByModel: Nullable<IFilterByModel> = null;
    get filterByModel(): Nullable<IFilterByModel> { return this._filterByModel; }
    private set filterByModel(model: Nullable<IFilterByModel>) {
        this._filterByModel = model;
        this._filterByModel$.next(model);
    }

    private readonly _hasCriteria$ = new BehaviorSubject<boolean>(false);
    readonly hasCriteria$ = this._hasCriteria$.asObservable();

    private _filterModel: Nullable<FilterModel> = null;
    get filterModel() { return this._filterModel; }

    private readonly _col$ = new BehaviorSubject<number>(-1);
    readonly col$ = this._col$.asObservable();
    get col(): number { return this._col$.getValue(); }

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService
    ) {
        super();
    }

    override dispose(): void {
        this._filterBy$.complete();
        this._filterByModel$.complete();
        this._hasCriteria$.complete();
    }

    setupCol(filterModel: FilterModel, col: number): void {
        this.terminate();

        this._filterModel = filterModel;
        this._col$.next(col);

        // We use filter type that (if) has been set on the column as the default filter type.
        const filterColumn = filterModel.getFilterColumn(col);
        if (filterColumn) {
            const info = filterColumn.getColumnData();
            if (info.customFilters) {
                this._hasCriteria$.next(true);
                this._setupByConditions(filterModel, col);
                return;
            }

            if (info.filters) {
                this._hasCriteria$.next(true);
                this._setupByValues(filterModel, col);
                return;
            }

            // Use value values by default.
            this._hasCriteria$.next(false);
            this._setupByValues(filterModel, col);
            return;
        }

        // By default we filter by values.
        this._hasCriteria$.next(false);
        this._setupByValues(filterModel, col);
    };

    changeFilterBy(filterBy: FilterBy): boolean {
        if (!this._filterModel || this.col === -1) {
            return false;
        }

        if (filterBy === FilterBy.VALUES) {
            this._setupByValues(this._filterModel, this.col);
        } else {
            this._setupByConditions(this._filterModel, this.col);
        }

        return true;
    }

    terminate(): boolean {
        this._filterModel = null;
        this._col$.next(-1);

        this._disposeFilterHeaderChangeListener();
        return true;
    }

    private _filterHeaderListener: Nullable<IDisposable> = null;
    private _disposeFilterHeaderChangeListener(): void {
        this._filterHeaderListener?.dispose();
        this._filterHeaderListener = null;
    }

    private _listenToFilterHeaderChange(filterModel: FilterModel, col: number): void {
        this._disposeFilterHeaderChangeListener();

        const unitId = filterModel.unitId;
        const subUnitId = filterModel.subUnitId;
        const filterRange = filterModel.getRange();
        const columnHeaderRange: IRange = {
            startColumn: col,
            startRow: filterRange.startRow,
            endRow: filterRange.startRow,
            endColumn: col,
        };

        this._filterHeaderListener = this._refRangeService.watchRange(unitId, subUnitId, columnHeaderRange, (before, after) => {
            if (!after) {
                // If the range collapsed, the column header must be deleted.
                this.terminate();
            } else {
                const offset = after.startColumn - before.startColumn;
                if (offset !== 0) {
                    this._filterByModel!.deltaCol(offset);
                }
            }
        });
    }

    private async _setupByValues(filterModel: FilterModel, col: number): Promise<boolean> {
        this._disposePreviousModel();

        const range = filterModel.getRange();
        if (range.startRow === range.endRow) return false;

        const filterByModel = await ByValuesModel.fromFilterColumn(
            this._injector,
            filterModel,
            col
        );

        this.filterByModel = filterByModel;
        this._filterBy$.next(FilterBy.VALUES);

        this._listenToFilterHeaderChange(filterModel, col);
        return true;
    }

    private _setupByConditions(filterModel: FilterModel, col: number): boolean {
        this._disposePreviousModel();

        const range = filterModel.getRange();
        if (range.startRow === range.endRow) return false;

        const model = ByConditionsModel.fromFilterColumn(
            this._injector,
            filterModel,
            col,
            filterModel.getFilterColumn(col)
        );

        this.filterByModel = model;
        this._filterBy$.next(FilterBy.CONDITIONS);

        this._listenToFilterHeaderChange(filterModel, col);

        return true;
    }

    private _disposePreviousModel(): void {
        this._filterByModel?.dispose();
        this.filterByModel = null;
    }
}

// #region ByConditionsModel

/**
 * This model would be used to control the "Filter By Conditions" panel. It should be reconstructed in the following
 * situations:
 *
 * 1. The target `FilterColumn` object is changed
 * 2. User toggles "Filter By"
 */
export class ByConditionsModel extends Disposable implements IFilterByModel {
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

    canApply$: Observable<boolean> = of(true);

    private readonly _conditionItem$: BehaviorSubject<IFilterConditionItem>;
    readonly conditionItem$: Observable<IFilterConditionItem>;
    get conditionItem(): IFilterConditionItem { return this._conditionItem$.getValue(); }

    private readonly _filterConditionFormParams$: BehaviorSubject<IFilterConditionFormParams>;
    readonly filterConditionFormParams$: Observable<IFilterConditionFormParams>;
    get filterConditionFormParams(): IFilterConditionFormParams { return this._filterConditionFormParams$.getValue(); }

    constructor(
        private readonly _filterModel: FilterModel,
        public col: number,
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

    deltaCol(offset: number): void {
        this.col += offset;
    }

    clear(): Promise<boolean> {
        if (this._disposed) return Promise.resolve(false);

        return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._filterModel.unitId,
            subUnitId: this._filterModel.subUnitId,
            col: this.col,
            criteria: null,
        } as ISetSheetsFilterCriteriaCommandParams);
    }

    /**
     * Apply the filter condition to the target filter column.
     */
    async apply(): Promise<boolean> {
        if (this._disposed) return false;

        const filterColumn = FilterConditionItems.mapToFilterColumn(this.conditionItem, this.filterConditionFormParams);
        return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._filterModel.unitId,
            subUnitId: this._filterModel.subUnitId,
            col: this.col,
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

// #endregion

// #region - ByValuesModel

/**
 * This model would be used to control the "Filter By Values" panel. It should be reconstructed in the following
 * situations:
 *
 * 1. The target `FilterColumn` object is changed
 * 2. User toggles "Filter By"
 */
export class ByValuesModel extends Disposable implements IFilterByModel {
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
    static async fromFilterColumn(injector: Injector, filterModel: FilterModel, col: number): Promise<ByValuesModel> {
        const univerInstanceService = injector.get(IUniverInstanceService);
        const localeService = injector.get(LocaleService);
        const generateFilterValuesService = injector.get(ISheetsGenerateFilterValuesService, Quantity.OPTIONAL);

        const { unitId, subUnitId } = filterModel;
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) throw new Error(`[ByValuesModel]: Workbook not found for filter model with unitId: ${unitId}!`);

        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) throw new Error(`[ByValuesModel]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);

        const range = filterModel.getRange();
        const column = col;
        const filters = filterModel.getFilterColumn(col)?.getColumnData().filters;
        const alreadyChecked = new Set(filters?.filters);
        const blankChecked = !!(filters && filters.blank);
        const filteredOutRowsByOtherColumns = filterModel.getFilteredOutRowsExceptCol(col);
        const iterateRange: IRange = { ...range, startRow: range.startRow + 1, startColumn: column, endColumn: column };

        let items: IFilterByValueWithTreeItem[];
        let cache: Map<string, string[]> | undefined;
        if (generateFilterValuesService) {
            const res = await generateFilterValuesService.getFilterValues({
                unitId,
                subUnitId,
                filteredOutRowsByOtherColumns: Array.from(filteredOutRowsByOtherColumns),
                filters: !!filters,
                blankChecked,
                iterateRange,
                alreadyChecked: Array.from(alreadyChecked),
            });
            items = res.filterTreeItems;
            cache = res.filterTreeMapCache;
        } else {
            // the first row is filter header and should be added to options
            const res = getFilterTreeByValueItems(!!filters, localeService, iterateRange, worksheet, filteredOutRowsByOtherColumns, alreadyChecked, blankChecked, workbook.getStyles());
            items = res.filterTreeItems;
            cache = res.filterTreeMapCache;
        }

        return injector.createInstance(ByValuesModel, filterModel, col, items, cache);
    }

    private readonly _rawFilterItems$: BehaviorSubject<IFilterByValueWithTreeItem[]>;
    readonly rawFilterItems$: Observable<IFilterByValueWithTreeItem[]>;
    get rawFilterItems(): IFilterByValueWithTreeItem[] { return this._rawFilterItems$.getValue(); }

    readonly filterItems$: Observable<IFilterByValueWithTreeItem[]>;
    private _filterItems: IFilterByValueWithTreeItem[] = [];
    get filterItems() { return this._filterItems; }

    private _treeMapCache: Map<string, string[]>;
    get treeMapCache() { return this._treeMapCache; }

    readonly canApply$: Observable<boolean>;

    private readonly _manuallyUpdateFilterItems$: Subject<IFilterByValueWithTreeItem[]>;

    private readonly _searchString$: BehaviorSubject<string>;
    readonly searchString$: Observable<string>;

    constructor(
        private readonly _filterModel: FilterModel,
        public col: number,
        /**
         * Filter items would remain unchanged after we create them,
         * though data may change after.
         */
        items: IFilterByValueWithTreeItem[],
        cache: Map<string, string[]>,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._treeMapCache = cache;
        this._searchString$ = new BehaviorSubject<string>('');
        this.searchString$ = this._searchString$.asObservable();

        this._rawFilterItems$ = new BehaviorSubject<IFilterByValueWithTreeItem[]>(items);
        this.rawFilterItems$ = this._rawFilterItems$.asObservable();

        this._manuallyUpdateFilterItems$ = new Subject<IFilterByValueWithTreeItem[]>();

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
                    return searchTree(items, searchKeyWords);
                })
            ),
            this._manuallyUpdateFilterItems$
        ).pipe(shareReplay(1));

        this.canApply$ = this.filterItems$.pipe(map((items) => {
            const stat = statisticFilterByValueItems(items);
            return stat.checked > 0;
        }));

        this.disposeWithMe(this.filterItems$.subscribe((items) => this._filterItems = items));
    }

    override dispose(): void {
        this._rawFilterItems$.complete();
        this._searchString$.complete();
    }

    deltaCol(offset: number): void {
        this.col += offset;
    }

    setSearchString(str: string): void {
        this._searchString$.next(str);
    }

    onCheckAllToggled(checked: boolean) {
        const items = Tools.deepClone(this._filterItems);
        items.forEach((item) => updateLeafNodesCheckedStatus(item, checked));
        this._manuallyUpdateFilterItems(items);
    }

    /**
     * Toggle a filter item.
     */
    onFilterCheckToggled(item: IFilterByValueWithTreeItem): void {
        const items = Tools.deepClone(this._filterItems);
        const changedItem = findObjectByKey(items, item.key);
        if (!changedItem) {
            return;
        }
        const allLeafChecked = areAllLeafNodesChecked(changedItem);
        updateLeafNodesCheckedStatus(changedItem, !allLeafChecked);
        this._manuallyUpdateFilterItems(items);
    }

    onFilterOnly(itemKeys: string[]) {
        const items = Tools.deepClone(this._filterItems);
        items.forEach((item) => updateLeafNodesCheckedStatus(item, false));
        itemKeys.forEach((key) => {
            const changedItem = findObjectByKey(items, key);
            if (changedItem) {
                updateLeafNodesCheckedStatus(changedItem, true);
            }
        });
        this._manuallyUpdateFilterItems(items);
    }

    private _manuallyUpdateFilterItems(items: IFilterByValueWithTreeItem[]): void {
        this._manuallyUpdateFilterItems$.next(items);
    }

    // expose method here to let the panel change filter items

    // #region ByValuesModel apply methods
    clear(): Promise<boolean> {
        if (this._disposed) return Promise.resolve(false);

        return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._filterModel.unitId,
            subUnitId: this._filterModel.subUnitId,
            col: this.col,
            criteria: null,
        } as ISetSheetsFilterCriteriaCommandParams);
    }

    /**
     * Apply the filter condition to the target filter column.
     */
    async apply(): Promise<boolean> {
        if (this._disposed) {
            return false;
        }

        const statistics = statisticFilterByValueItems(this._filterItems);
        const { checked, checkedItems } = statistics;
        const rawFilterItems = this.rawFilterItems;
        let rawFilterCount = 0;
        for (const item of rawFilterItems) {
            rawFilterCount += item.count;
        }

        const noChecked = checked === 0;
        const allChecked = statistics.checked === rawFilterCount;

        const criteria: IFilterColumn = { colId: this.col };
        if (noChecked) {
            throw new Error('[ByValuesModel]: no checked items!');
        } else if (allChecked) {
            return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: this._filterModel.unitId,
                subUnitId: this._filterModel.subUnitId,
                col: this.col,
                criteria: null,
            } as ISetSheetsFilterCriteriaCommandParams);
        } else {
            criteria.filters = {};

            const nonEmptyItems = checkedItems.filter((item) => item.key !== 'empty');
            if (nonEmptyItems.length > 0) {
                criteria.filters = {
                    filters: nonEmptyItems.flatMap((item) => item.originValues ? Array.from(item.originValues) : [item.title]),
                };
            }

            const hasEmpty = nonEmptyItems.length !== checkedItems.length;
            if (hasEmpty) {
                criteria.filters.blank = true;
            }
        }

        return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId: this._filterModel.unitId,
            subUnitId: this._filterModel.subUnitId,
            col: this.col,
            criteria,
        } as ISetSheetsFilterCriteriaCommandParams);
    }

    // #endregion
}

// #endregion
