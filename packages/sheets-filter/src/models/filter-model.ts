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

import { Disposable, mergeSets, Rectangle, Tools } from '@univerjs/core';
import type { CellValue, IAutoFilter, ICustomFilter, ICustomFilters, IFilterColumn, IRange, Nullable, Worksheet } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { Observable } from 'rxjs';
import { getCustomFilterFn } from './custom-filters';

const EMPTY = () => new Set<number>();

/**
 * This is the in-memory model of filter.
 */
export class FilterModel extends Disposable {
    private readonly _filteredOutRows$ = new BehaviorSubject<Readonly<Set<number>>>(EMPTY());
    /** An observable value. A set of filtered out rows. */
    readonly filteredOutRows$: Observable<Readonly<Set<number>>> = this._filteredOutRows$.asObservable();
    get filteredOutRows() { return this._filteredOutRows$.getValue(); }

    // TODO: we may need to update which cols have criteria rather than simple boolean

    private readonly _hasCriteria$ = new BehaviorSubject<boolean>(false);
    readonly hasCriteria$: Observable<boolean> = this._hasCriteria$.asObservable();

    private _filterColumnByOffset = new Map<number, FilterColumn>();

    private _alreadyFilteredOutRows = EMPTY();

    private _range: Nullable<IRange>;

    constructor(
        public readonly unitId: string,
        public readonly subUnitId: string,
        private readonly _worksheet: Worksheet
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._filteredOutRows$.complete();
        this._hasCriteria$.complete();
    }

    /**
     * Serialize this filter model to the JSON format representation.
     */
    serialize(): IAutoFilter {
        const result: IAutoFilter = {
            ref: Rectangle.clone(this._range!),
            filterColumns: this._getAllFilterColumns(true)
                .sort(([offset1], [offset2]) => offset1 - offset2)
                .map(([_, filterColumn]) => filterColumn.serialize()),
        };

        if (this._alreadyFilteredOutRows) {
            result.cachedFilteredOut = Array.from(this._alreadyFilteredOutRows).sort();
        }

        return result;
    }

    /**
     * Deserialize auto filter info to construct a `FilterModel` object.
     * @param unitId workbook id
     * @param subUnitId worksheet id
     * @param worksheet the Worksheet object
     * @param autoFilter auto filter data
     */
    static deserialize(
        unitId: string,
        subUnitId: string,
        worksheet: Worksheet,
        autoFilter: IAutoFilter
    ): FilterModel {
        const filterModel = new FilterModel(unitId, subUnitId, worksheet);
        filterModel._dump(autoFilter);

        return filterModel;
    }

    private _dump(autoFilter: IAutoFilter) {
        this.setRange(autoFilter.ref);
        autoFilter.filterColumns?.forEach((filterColumn) => this._setCriteriaWithoutReCalc(filterColumn.colId, filterColumn));

        if (autoFilter.cachedFilteredOut) {
            this._alreadyFilteredOutRows = new Set(autoFilter.cachedFilteredOut);
            this._emit();
        }

        this._emitHasCriteria();
    }

    isRowFiltered(row: number): boolean {
        return this._alreadyFilteredOutRows.has(row);
    }

    getRange(): IRange {
        if (!this._range) {
            throw new Error('[FilterModel] could not get range before a range is set!');
        }

        return this._range;
    }

    /**
     * Set range of the filter model, this would remove some `IFilterColumn`
     * if the new range not overlaps the old range.
     */
    setRange(range: IRange): void {
        this._range = range;

        // TODO@wzhudev: maybe we should remove the FilterColumn that is not in the new range!
        // TODO@wzhudev: when a column in the range is deleted, we may need to change some FilterColumns' offset

        // set range for each FilterColumn
        this._getAllFilterColumns(true)
            .forEach(([colOffset, filterColumn]) => {
                filterColumn.setRangeAndOffset({
                    startRow: range.startRow + 1,
                    endRow: range.endRow,
                    startColumn: range.startColumn + colOffset,
                    endColumn: range.startColumn + colOffset,
                }, colOffset);
            });
    }

    /**
     * Set or remove filter criteria on a specific row.
     */
    setCriteria(col: number, criteria: Nullable<IFilterColumn>, reCalc = false): void {
        if (!this._range) {
            throw new Error('[FilterModel] could not set criteria before a range is set!');
        }

        if (!criteria) {
            this._removeCriteria(col);
            this._rebuildAlreadyFilteredOutRowsWithCache();
            this._emit();
            this._emitHasCriteria();
            return;
        }

        this._setCriteriaWithoutReCalc(col, criteria);
        if (reCalc) {
            this._rebuildAlreadyFilteredOutRowsWithCache();
            this._reCalcWithNoCacheColumns();
            this._emit();
            this._emitHasCriteria();
        }
    }

    getAllFilterColumns(): [number, FilterColumn][] {
        return this._getAllFilterColumns(true);
    }

    getFilterColumn(offset: number): Nullable<FilterColumn> {
        return this._filterColumnByOffset.get(offset) ?? null;
    }

    reCalc(): void {
        this._reCalcAllColumns();
        this._emit();
    }

    private _getAllFilterColumns(): FilterColumn[];
    private _getAllFilterColumns(withColOffset: true): [number, FilterColumn][];
    private _getAllFilterColumns(withColOffset = false): [number, FilterColumn][] | FilterColumn[] {
        const columns = Array.from(this._filterColumnByOffset.entries());
        if (withColOffset) {
            return columns;
        }

        return columns.map(([_, filterColumn]) => filterColumn);
    }

    private _reCalcAllColumns(): void {
        this._alreadyFilteredOutRows = EMPTY();
        this._getAllFilterColumns().forEach((filterColumn) => filterColumn.__clearCache());
        this._reCalcWithNoCacheColumns();
    }

    private _setCriteriaWithoutReCalc(col: number, criteria: IFilterColumn): void {
        const range = this._range;
        if (!range) {
            throw new Error('[FilterModel] could not set criteria before a range is set!');
        }

        const { startColumn, endColumn } = range;
        if (col > endColumn - startColumn || col < 0) {
            throw new Error(`[FilterModel] could not set criteria on column ${col} which is out of range!`);
        }

        let filterColumn: FilterColumn;
        if (this._filterColumnByOffset.has(col)) {
            filterColumn = this._filterColumnByOffset.get(col)!;
        } else {
            filterColumn = new FilterColumn(
                this.unitId,
                this.subUnitId,
                this._worksheet,
                criteria,
                { getAlreadyFilteredOutRows: () => this._alreadyFilteredOutRows }
            );
            filterColumn.setRangeAndOffset(range, col);

            this._filterColumnByOffset.set(col, filterColumn);
        }

        filterColumn.setCriteria(criteria);
    }

    private _removeCriteria(col: number): void {
        const filterColumn = this._filterColumnByOffset.get(col);
        if (filterColumn) {
            filterColumn.dispose();
            this._filterColumnByOffset.delete(col);
        }
    }

    private _emit(): void {
        this._filteredOutRows$.next(this._alreadyFilteredOutRows);
    }

    private _emitHasCriteria(): void {
        this._hasCriteria$.next(this._filterColumnByOffset.size > 0);
    }

    private _rebuildAlreadyFilteredOutRowsWithCache(): void {
        const newFilteredOutRows = this._getAllFilterColumns()
            .filter((filterColumn) => filterColumn.hasCache())
            .reduce((acc, filterColumn) => {
                return mergeSets(acc, filterColumn.filteredOutRows!);
            }, new Set<number>());

        this._alreadyFilteredOutRows = newFilteredOutRows;
    }

    private _reCalcWithNoCacheColumns(): void {
        const noCacheFilteredOutRows = this._getAllFilterColumns().filter((filterColumn) => !filterColumn.hasCache());
        for (const filterColumn of noCacheFilteredOutRows) {
            const filteredRows = filterColumn.reCalc();
            if (filteredRows) {
                this._alreadyFilteredOutRows = mergeSets(this._alreadyFilteredOutRows, filteredRows);
            }
        }
    }
}

interface IFilterColumnContext {
    getAlreadyFilteredOutRows(): Set<number>;
}

/**
 * This is the filter criteria on a specific column.
 */
export class FilterColumn extends Disposable {
    private _filteredOutRows: Nullable<Set<number>> = null;
    get filteredOutRows(): Readonly<Nullable<Set<number>>> { return this._filteredOutRows; }

    /** Cache the filter function.  */
    private _filterFn: Nullable<FilterFn> = null;

    private _range: Nullable<IRange> = null;
    private _columnOffset: number = 0;

    constructor(
        public readonly unitId: string,
        public readonly subUnitId: string,
        private readonly _worksheet: Worksheet,

        /**
         * A `FilterColumn` instance should not be created without a filter criteria.
         */
        private _criteria: IFilterColumn,
        private readonly _filterColumnContext: IFilterColumnContext
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._filteredOutRows = null;
    }

    /**
     * @internal
     */
    __clearCache(): void {
        this._filteredOutRows = null;
    }

    serialize(): IFilterColumn {
        if (!this._criteria) {
            throw new Error('[FilterColumn]: could not serialize without a filter column!');
        }

        return Tools.deepClone({
            ...this._criteria,
            colId: this._columnOffset,
        });
    }

    hasCache(): boolean {
        return this._filteredOutRows !== null;
    }

    // The first row should be omitted!
    setRangeAndOffset(range: IRange, offset: number): void {
        this._range = range;
        this._columnOffset = offset;
    }

    setCriteria(criteria: IFilterColumn): void {
        this._criteria = criteria;
        this._generateFilterFn();

        // clear cache
        this._filteredOutRows = null;
    }

    getColumnData(): Readonly<IFilterColumn> {
        return Tools.deepClone(this._criteria);
    }

    /**
     * Trigger new calculation on this `FilterModel` instance.
     *
     * @external DO NOT EVER call this method from `FilterColumn` itself. The whole process heavily relies on
     * `filteredOutByOthers`, and it is more comprehensible if we let `FilterModel` take full control over the process.
     */
    reCalc(): Readonly<Nullable<Set<number>>> {
        if (!this._filterFn) {
            throw new Error('[FilterColumn] cannot calculate without a filter fn!');
        }

        if (!this._range) {
            throw new Error('[FilterColumn] cannot calculate without a range!');
        }

        if (typeof this._columnOffset !== 'number') {
            throw new TypeError('[FilterColumn] cannot calculate without a column offset!');
        }

        const column = this._range.startColumn + this._columnOffset;
        const iterateRange: IRange = { startColumn: column, endColumn: column, startRow: this._range.startRow + 1, endRow: this._range.endRow };
        const filteredOutRows = new Set<number>();
        const filteredOutByOthers = this._filterColumnContext.getAlreadyFilteredOutRows();

        for (const range of this._worksheet.iterateByColumn(iterateRange, false)) {
            const row = range.row;

            // if this row is already filtered out by others, we don't need to check it again
            if (filteredOutByOthers.has(row)) {
                continue;
            }

            // TODO@wzhudev: there are multiple details, listed as follows:
            // 1. merged cells
            // 2. boolean values
            // 3. dropdown values from data validation
            // 4. rich text values
            const value = this._worksheet.getCell(row, column)?.v;
            if (!this._filterFn(value)) {
                filteredOutRows.add(row);
            }
        }

        this._filteredOutRows = filteredOutRows;
        return this._filteredOutRows;
    }

    private _generateFilterFn(): void {
        if (!this._criteria) {
            return;
        }

        this._filterFn = generateFilterFn(this._criteria);
    }
}

/**
 * Filter function is a close function which received a cell's content and determine this value is considered as
 * "matched" and the corresponding row would not be filtered out.
 */
export type FilterFn = (value: Nullable<CellValue>) => boolean;

/**
 * This functions take a `IFilterColumn` as input and return a function that can be used to filter rows.
 * @param column
 * @returns the filter function that takes the cell's value and return a boolean.
 */
export function generateFilterFn(column: IFilterColumn): FilterFn {
    if (column.filters) {
        return filterByValuesFnFactory(column.filters);
    }

    if (column.customFilters) {
        return customFilterFnFactory(column.customFilters);
    }

    throw new Error('[FilterModel]: other types of filters are not supported yet.');
}

function filterByValuesFnFactory(values: string[]): FilterFn {
    const valuesSet = new Set(values);

    return (value) => {
        if (value === undefined) {
            return false;
        }

        return valuesSet.has(typeof value === 'string' ? value : `${value}`);
    };
}

function customFilterFnFactory(customFilters: ICustomFilters): FilterFn {
    const customFilterFns: FilterFn[] = customFilters.customFilters.map((filter) => generateCustomFilterFn(filter));
    if (isCompoundCustomFilter(customFilterFns)) {
        if (customFilters.and) {
            return AND(customFilterFns);
        }

        return OR(customFilterFns);
    }

    return customFilterFns[0];
}

function AND(filterFns: [FilterFn, FilterFn]): FilterFn {
    const [fn1, fn2] = filterFns;
    return (value) => fn1(value) && fn2(value);
}

function OR(filterFns: [FilterFn, FilterFn]): FilterFn {
    const [fn1, fn2] = filterFns;
    return (value) => fn1(value) || fn2(value);
}

function isCompoundCustomFilter(filter: FilterFn[]): filter is [FilterFn, FilterFn] {
    return filter.length === 2;
}

function generateCustomFilterFn(filter: ICustomFilter): FilterFn {
    const compare = filter.val;
    const customFilterFn = getCustomFilterFn(filter.operator);
    return (value) => customFilterFn.fn(value, compare);
}
