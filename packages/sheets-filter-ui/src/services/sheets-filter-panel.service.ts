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

import type { IRange, Nullable } from '@univerjs/core';
import { Disposable, extractPureTextFromCell, ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { FilterColumn, FilterModel, IFilterColumn } from '@univerjs/sheets-filter';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, map, merge, of, ReplaySubject, shareReplay, startWith, Subject, throttleTime } from 'rxjs';
import { RefRangeService } from '@univerjs/sheets';

import type { FilterOperator, IFilterConditionFormParams, IFilterConditionItem } from '../models/conditions';
import { FilterConditionItems } from '../models/conditions';
import type { ISetSheetsFilterCriteriaCommandParams } from '../commands/sheets-filter.command';
import { SetSheetsFilterCriteriaCommand } from '../commands/sheets-filter.command';
import { statisticFilterByValueItems } from '../models/utils';

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
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService
    ) {
        super();
    }

    override dispose(): void {
        this._filterBy$.complete();
        this._filterByModel$.complete();
        this._hasCriteria$.complete();
    }

    setupCol(filterModel: FilterModel, col: number): boolean {
        this.terminate();

        this._filterModel = filterModel;
        this._col$.next(col);

        // We use filter type that (if) has been set on the column as the default filter type.
        const filterColumn = filterModel.getFilterColumn(col);
        if (filterColumn) {
            const info = filterColumn.getColumnData();
            if (info.customFilters) {
                this._hasCriteria$.next(true);
                return this._setupByConditions(filterModel, col);
            }

            if (info.filters) {
                this._hasCriteria$.next(true);
                return this._setupByValues(filterModel, col);
            }

            // Use value values by default.
            this._hasCriteria$.next(false);
            return this._setupByValues(filterModel, col);
        }

        // By default we filter by values.
        this._hasCriteria$.next(false);
        return this._setupByValues(filterModel, col);
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

    private _setupByValues(filterModel: FilterModel, col: number): boolean {
        this._disposePreviousModel();

        const range = filterModel.getRange();
        if (range.startRow === range.endRow) return false;

        const model = ByValuesModel.fromFilterColumn(
            this._injector,
            filterModel,
            col
        );

        this.filterByModel = model;
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
    static fromFilterColumn(injector: Injector, filterModel: FilterModel, col: number): ByValuesModel {
        const univerInstanceService = injector.get(IUniverInstanceService);
        const localeService = injector.get(LocaleService);

        const { unitId, subUnitId } = filterModel;
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) throw new Error(`[ByValuesModel]: Workbook not found for filter model with unitId: ${unitId}!`);

        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) throw new Error(`[ByValuesModel]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);

        const range = filterModel.getRange();
        const column = col;
        const filters = filterModel.getFilterColumn(col)?.getColumnData().filters;
        const blankChecked = !!(filters && filters.blank);

        // the first row is filter header and should be added to options
        const iterateRange: IRange = { ...range, startRow: range.startRow + 1, startColumn: column, endColumn: column };
        const items: IFilterByValueItem[] = [];
        const itemsByKey: Record<string, IFilterByValueItem> = {};
        const alreadyChecked = new Set(filters?.filters);
        const filteredOutRowsByOtherColumns = filterModel.getFilteredOutRowsExceptCol(col);

        let index = 0;
        let emptyCount = 0;
        for (const cell of worksheet.iterateByColumn(iterateRange, false, false)) { // iterate and do not skip empty cells
            const { row, rowSpan = 1 } = cell;

            let rowIndex = 0;
            while (rowIndex < rowSpan) {
                const targetRow = row + rowIndex;

                if (filteredOutRowsByOtherColumns.has(targetRow)) {
                    rowIndex++;
                    continue;
                }

                const value = cell?.value ? extractPureTextFromCell(cell.value) : '';
                if (!value) {
                    emptyCount += 1;
                    rowIndex += rowSpan;
                    continue;
                }

                if (!itemsByKey[value]) {
                    const item: IFilterByValueItem = {
                        value,
                        checked: alreadyChecked.size ? alreadyChecked.has(value) : !blankChecked,
                        count: 1,
                        index,
                        isEmpty: false,
                    };

                    itemsByKey[value] = item;
                    items.push(item);
                } else {
                    itemsByKey[value].count++;
                }
                rowIndex++;
            }

            index++;
        }

        const initialBlankChecked = filters ? blankChecked : true;
        if (emptyCount > 0) {
            const item: IFilterByValueItem = {
                value: localeService.t('sheets-filter.panel.empty'),
                checked: initialBlankChecked,
                count: emptyCount,
                index,
                isEmpty: true,
            };

            items.push(item);
        }

        return injector.createInstance(ByValuesModel, filterModel, col, items);
    }

    private readonly _rawFilterItems$: BehaviorSubject<IFilterByValueItem[]>;
    readonly rawFilterItems$: Observable<IFilterByValueItem[]>;
    get rawFilterItems(): IFilterByValueItem[] { return this._rawFilterItems$.getValue(); }

    readonly filterItems$: Observable<IFilterByValueItem[]>;
    private _filterItems: IFilterByValueItem[] = [];
    get filterItems() { return this._filterItems; }

    readonly canApply$: Observable<boolean>;

    private readonly _manuallyUpdateFilterItems$: Subject<IFilterByValueItem[]>;

    private readonly _searchString$: BehaviorSubject<string>;
    readonly searchString$: Observable<string>;

    constructor(
        private readonly _filterModel: FilterModel,
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

        const noChecked = checked === 0;
        const allChecked = statistics.checked === rawFilterItems.length;

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

            const nonEmptyItems = checkedItems.filter((item) => !item.isEmpty);
            if (nonEmptyItems.length > 0) {
                criteria.filters = { filters: nonEmptyItems.map((item) => item.value) };
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
