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

import { ObjectMatrix, Range } from '@univerjs/core';
import type { CellValue, DataValidationStatus, IRange, ISheetDataValidationRule, Nullable } from '@univerjs/core';

export interface IDataValidationResCache {
    value: Nullable<CellValue>;
    status: DataValidationStatus;
    ruleId: string;
    temp?: boolean;
}

export class DataValidationCacheService {
    private _cacheMatrix: Map<string, Map<string, ObjectMatrix<Nullable<IDataValidationResCache>>>> = new Map();

    private _ensureCache(unitId: string, subUnitId: string) {
        let unitMap = this._cacheMatrix.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._cacheMatrix.set(unitId, unitMap);
        }

        let cacheMatrix = unitMap.get(subUnitId);

        if (!cacheMatrix) {
            cacheMatrix = new ObjectMatrix();
            unitMap.set(subUnitId, cacheMatrix);
        }

        return cacheMatrix;
    }

    ensureCache(unitId: string, subUnitId: string) {
        return this._ensureCache(unitId, subUnitId);
    }

    addRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        this.markRangeDirty(unitId, subUnitId, rule.ranges);
    }

    removeRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        this._deleteRange(unitId, subUnitId, rule.ranges);
    }

    updateRuleRanges(unitId: string, subUnitId: string, ruleId: string, newRanges: IRange[], oldRanges: IRange[]) {
        const cache = this._ensureCache(unitId, subUnitId);
        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const item = cache.getValue(row, col);
                item && (item.temp = true);
            });
        });

        newRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const item = cache.getValue(row, col);
                if (item && item.ruleId === ruleId) {
                    item.temp = false;
                } else {
                    cache.setValue(row, col, undefined);
                }
            });
        });

        oldRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const item = cache.getValue(row, col);
                if (item && (item.temp === true)) {
                    cache.realDeleteValue(row, col);
                }
            });
        });
    }

    markRangeDirty(unitId: string, subUnitId: string, ranges: IRange[]) {
        const cache = this._ensureCache(unitId, subUnitId);
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                cache.setValue(row, col, undefined);
            });
        });
    }

    markCellDirty(unitId: string, subUnitId: string, row: number, col: number) {
        const cache = this._ensureCache(unitId, subUnitId);
        cache.setValue(row, col, undefined);
    }

    private _deleteRange(unitId: string, subUnitId: string, ranges: IRange[]) {
        const cache = this._ensureCache(unitId, subUnitId);
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                cache.realDeleteValue(row, col);
            });
        });
    }

    getValue(unitId: string, subUnitId: string, row: number, col: number) {
        const cache = this._ensureCache(unitId, subUnitId);
        return cache.getValue(row, col);
    }

    setValue(unitId: string, subUnitId: string, row: number, col: number, value: IDataValidationResCache) {
        const cache = this._ensureCache(unitId, subUnitId);
        return cache.setValue(row, col, value);
    }
}
