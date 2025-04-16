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

import type { IAccessor, ICellData, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IConditionFormattingRule } from '../type';
import { LRUMap } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export enum CalculateEmitStatus {

    preComputingStart = 'preComputingStart',
    preComputing = 'preComputing',
    preComputingEnd = 'preComputingEnd',
    preComputingError = 'preComputingError',

}
export interface IContext {
    unitId: string;
    subUnitId: string;
    workbook: Workbook;
    worksheet: Worksheet;
    accessor: IAccessor;
    rule: IConditionFormattingRule;
    getCellValue: (row: number, col: number,) => ICellData;
    limit: number;
}
/**
 * Processing Main Path Calculation Logic
 */
export abstract class BaseCalculateUnit<C = any, S = any> {
    /**
     * 3nd-level cache
     */
    private _cache: LRUMap<string, Nullable<S>>;

    protected _preComputingStatus$ = new BehaviorSubject<CalculateEmitStatus>(CalculateEmitStatus.preComputingStart);
    public preComputingStatus$ = this._preComputingStatus$.asObservable().pipe(distinctUntilChanged());
    /**
     * 2nd-level cache
     */
    private _preComputingCache: Nullable<C>;
    private _rule: IConditionFormattingRule;

    constructor(private _context: IContext) {
        this._cache = new LRUMap(_context.limit);
        this._rule = _context.rule;
        this._preComputingCache = null;
        this._initClearCacheListener();
    }

    public setCacheLength(length: number) {
        this._cache.limit = length;
    }

    public clearCache() {
        this._cache.clear();
    }

    public resetPreComputingCache() {
        this._preComputingStatus$.next(CalculateEmitStatus.preComputingStart);
        this._preComputingCache = null;
    }

    public updateRule(rule: IConditionFormattingRule) {
        this._rule = rule;
        this.resetPreComputingCache();
    }

    public getCell(row: number, col: number) {
        const key = this._createKey(row, col);

        if (this._preComputingStatus$.getValue() === CalculateEmitStatus.preComputing) {
            // If the pre-calculation is not yet complete, return the previous result directly.
            return this._cache.get(key);
        }
        let preComputingResult = this.getPreComputingResult(row, col);
        if (preComputingResult === null) {
            this._preComputingStatus$.next(CalculateEmitStatus.preComputingStart);
            this.preComputing(row, col, this._getContext());
            preComputingResult = this.getPreComputingResult(row, col);

            if (preComputingResult === null) {
                // If the calculation is not yet complete, return the previous cache.
                return this._cache.get(key);
            }
        }

        this._preComputingStatus$.next(CalculateEmitStatus.preComputingEnd);

        if (this._cache.has(key)) {
            return this._cache.get(key);
        }
        const result = this.getCellResult(row, col, preComputingResult, this._getContext());
        if (result !== null) {
            this._setCache(row, col, result);
        }
        return result;
    }
    // If a null value is set, it indicates that caching is not required.
    abstract preComputing(row: number, col: number, context: IContext): void;

    /**
     * If a null value is returned, it indicates that caching is not required.
     */
    protected abstract getCellResult(row: number, col: number, preComputingResult: Nullable<C>, context: IContext): Nullable<S>;

    protected setPreComputingCache(v: C) {
        this._preComputingCache = v;
    }

    protected getPreComputingResult(_row: number, _col: number) {
        return this._preComputingCache;
    }

    private _createKey(row: number, col: number) {
        return `${row}_${col}`;
    }

    private _setCache(row: number, col: number, v: Nullable<S>) {
        const key = this._createKey(row, col);
        this._cache.set(key, v);
    }

    private _getContext() {
        return { ...this._context, rule: this._rule };
    }

    private _initClearCacheListener() {
        this.preComputingStatus$.subscribe((e) => {
            if (e === CalculateEmitStatus.preComputingEnd) {
                this.clearCache();
            }
        });
    }
}
