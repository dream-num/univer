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

import type { IRange, Nullable, Worksheet } from '@univerjs/core';
import { Disposable, extractPureTextFromCell, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { FilterColumn, FilterModel } from '@univerjs/sheets-filter';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
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
    get filterBy(): FilterBy { return this._filterBy$.getValue(); }

    private readonly _filterByValues$ = new BehaviorSubject<IFilterByValueItem[]>([]);
    readonly filterByValues$ = this._filterByValues$.asObservable();

    private readonly _filterByModel$ = new ReplaySubject<Nullable<ByConditionsModel | ByValuesModel>>(1);
    readonly filterByModel$ = this._filterByModel$.asObservable();
    private _filterByModel: Nullable<ByConditionsModel | ByValuesModel> = null;

    private _filterModel: Nullable<FilterModel> = null;
    private _col = -1;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
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
        this._filterModel = filterModel;
        this._col = col;

        // We use filter type that (if) has been set on the column as the default filter type.
        const filterColumn = filterModel.getFilterColumn(col);
        if (filterColumn) {
            const info = filterColumn.getColumnData();
            if (info.customFilters) {
                return this._setupByConditions(filterModel, col);
            }

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
        return true;
    }

    private _setupByValues(filterModel: FilterModel, col: number, filters?: string[]): boolean {
        this._disposePreviousModel();

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
                const value = cell?.value ? extractPureTextFromCell(cell.value) : '';
                if (!alreadySeen.has(value)) {
                    alreadySeen.add(value);
                    items.push({ value, checked: alreadyChecked.has(value) });
                }
            }
        } else {
            for (const cell of worksheet.iterateByColumn(iterateRange)) {
                const value = cell?.value ? extractPureTextFromCell(cell.value) : '';
                if (!alreadySeen.has(value)) {
                    alreadySeen.add(value);
                    items.push({ value, checked: true });
                }
            }
        }

        this._filterByValues$.next(items);
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

    private _getWorksheetForFilterModel(filterModel: FilterModel): Worksheet {
        const { unitId, subUnitId } = filterModel;
        const worksheet = this._univerInstanceService.getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`[SheetsFilterPanelService]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);
        }

        return worksheet;
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
     * @param filterColumn the target filter column
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
            const conditionItem = FilterConditionItems.testMappingParams(newParams as IFilterConditionFormParams);
            this._conditionItem$.next(conditionItem);
        }

        this._filterConditionFormParams$.next(newParams as IFilterConditionFormParams);
    }
}

export class ByValuesModel extends Disposable {
    // TODO@yuhongz
    async apply(): Promise<boolean> {
        return false;
    }
}
