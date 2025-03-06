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

import type { DataValidationStatus, IRange, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IRemoveSheetMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { Disposable, ICommandService, Inject, IUniverInstanceService, ObjectMatrix, Range, UniverInstanceType } from '@univerjs/core';
import { RemoveSheetMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { Subject } from 'rxjs';

export class DataValidationCacheService extends Disposable {
    private _cacheMatrix: Map<string, Map<string, ObjectMatrix<Nullable<DataValidationStatus>>>> = new Map();
    private _dirtyRanges$ = new Subject<{ unitId: string; subUnitId: string; ranges: IRange[]; isSetRange?: boolean }>();

    readonly dirtyRanges$ = this._dirtyRanges$.asObservable();

    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initDirtyRanges();
        this._initSheetRemove();
    }

    private _initDirtyRanges() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetRangeValuesMutation.id) {
                const { cellValue, unitId, subUnitId } = commandInfo.params as ISetRangeValuesMutationParams;
                if (cellValue) {
                    const range = new ObjectMatrix(cellValue).getDataRange();
                    if (range.endRow === -1) return;
                    this.markRangeDirty(unitId, subUnitId, [range], true);
                }
            }
        }));
    }

    private _initSheetRemove() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === RemoveSheetMutation.id) {
                const { unitId, subUnitId } = commandInfo.params as IRemoveSheetMutationParams;
                this._cacheMatrix.get(unitId)?.delete(subUnitId);
            }
        }));

        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((univerInstance) => {
            if (univerInstance.type === UniverInstanceType.UNIVER_SHEET) {
                this._cacheMatrix.delete(univerInstance.getUnitId());
            }
        }));
    }

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

    markRangeDirty(unitId: string, subUnitId: string, ranges: IRange[], isSetRange?: boolean) {
        const cache = this._ensureCache(unitId, subUnitId);
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                cache.setValue(row, col, undefined);
            });
        });

        this._dirtyRanges$.next({ unitId, subUnitId, ranges, isSetRange });
    }

    private _deleteRange(unitId: string, subUnitId: string, ranges: IRange[]) {
        const cache = this._ensureCache(unitId, subUnitId);
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                cache.realDeleteValue(row, col);
            });
        });
        this._dirtyRanges$.next({ unitId, subUnitId, ranges });
    }

    getValue(unitId: string, subUnitId: string, row: number, col: number) {
        const cache = this._ensureCache(unitId, subUnitId);
        return cache.getValue(row, col);
    }
}
