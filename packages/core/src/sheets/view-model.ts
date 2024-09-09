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

import { filter, merge, of, switchMap } from 'rxjs';
import type { IDisposable } from '../common/di';
import { UniverInstanceType } from '../common/unit';
import { CommandType } from '../services/command/command.service';

import { Disposable, toDisposable } from '../shared/lifecycle';
import { fromCallback } from '../shared/rxjs';
import type { Nullable } from '../shared/types';
import type { ICellData, ICellDataForSheetInterceptor } from './typedef';
import { Workbook } from './workbook';

/**
 * @internal
 */
export interface ICellContentInterceptor {
    getCell: (row: number, col: number) => Nullable<ICellDataForSheetInterceptor>;
}

export interface IRowFilteredInterceptor {}

export interface IRowVisibleInterceptor {}

export interface IColVisibleInterceptor {}

export interface ISheetViewModel {
    registerCellContentInterceptor: (interceptor: ICellContentInterceptor) => IDisposable;
    registerRowFilteredInterceptor: (interceptor: IRowFilteredInterceptor) => IDisposable;
    registerRowVisibleInterceptor: (interceptor: IRowVisibleInterceptor) => IDisposable;
    registerColVisibleInterceptor: (interceptor: IColVisibleInterceptor) => IDisposable;

    getCell: (row: number, col: number) => Nullable<ICellDataForSheetInterceptor>;
}

/**
 * @internal
 */
export interface IRowFilteredInterceptor {
    getRowFiltered(row: number): boolean;
}

/**
 * @internal
 */
export class SheetViewModel extends Disposable {
    private _cellContentInterceptor: Nullable<ICellContentInterceptor> = null;
    private _rowFilteredInterceptor: Nullable<IRowFilteredInterceptor> = null;
    _commandService: any;
    _univerInstanceService: any;

    constructor(
        private readonly getRawCell: (row: number, col: number) => Nullable<ICellData>
    ) {
        super();
        window.vm = this;
    }

    override dispose(): void {
        super.dispose();

        this._cellContentInterceptor = null;
        this._rowFilteredInterceptor = null;
    }

    _cellDataCacheMap: Map<number, Map<number, Nullable<ICellDataForSheetInterceptor>>> = new Map();
    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (this._cellContentInterceptor) {
            // return this._cellContentInterceptor.getCell(row, col);

            if (this._cellDataCacheMap.get(row)) {
                if (!this._cellDataCacheMap.get(row)?.get(col)) {
                    this._cellDataCacheMap.get(row)?.set(col, this._cellContentInterceptor.getCell(row, col));
                    // return this._cellDataCacheMap.get(row)?.get(col);
                }
            } else {
                this._cellDataCacheMap.set(row, new Map());
                this._cellDataCacheMap.get(row)?.set(col, this._cellContentInterceptor.getCell(row, col));
                // return this._cellDataCacheMap.get(row)?.get(col);
            }
            return this._cellDataCacheMap.get(row)?.get(col);
        }

        return this.getRawCell(row, col);
    }

    // _filteredRowCacheMap: Map<number, boolean> = new Map();
    getRowFiltered(row: number): boolean {
        return this._rowFilteredInterceptor?.getRowFiltered(row) ?? false;

        // if (!this._filteredRowCacheMap.has(row)) {
        //     this._filteredRowCacheMap.set(row, this._rowFilteredInterceptor?.getRowFiltered(row) ?? false);
        // }
        // return !!this._filteredRowCacheMap.get(row);

        // merge(
        //     // source1: executing filter related mutations
        //     fromCallback(this._commandService.onCommandExecuted.bind(this._commandService))
        //         .pipe(filter(([command]) => command.type === CommandType.MUTATION && FILTER_MUTATIONS.has(command.id))),

        //     // source2: activate sheet changes
        //     this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
        //         .pipe(switchMap((workbook) => workbook?.activeSheet$ ?? of(null)))
        // ).subscribe(() => this._updateActiveFilterModel()));
    }

    registerCellContentInterceptor(interceptor: ICellContentInterceptor): IDisposable {
        if (this._cellContentInterceptor) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._cellContentInterceptor = interceptor;
        return toDisposable(() => this._cellContentInterceptor = null);
    }

    registerRowFilteredInterceptor(interceptor: IRowFilteredInterceptor): IDisposable {
        if (this._rowFilteredInterceptor) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._rowFilteredInterceptor = interceptor;
        return toDisposable(() => this._rowFilteredInterceptor = null);
    }
}
