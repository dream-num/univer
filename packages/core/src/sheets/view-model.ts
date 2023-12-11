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

import type { IDisposable } from '@wendellhu/redi';

import { remove } from '../common/array';
import type { Nullable } from '../common/type-utils';
import { Disposable, toDisposable } from '../shared/lifecycle';
import type { ICellDataForSheetInterceptor } from '../types/interfaces/i-cell-data';

export interface ICellContentInterceptor {
    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor>;
}

export interface IRowFilteredInterceptor {}

export interface IRowVisibleInterceptor {}

export interface IColVisibleInterceptor {}

export interface ISheetViewModel {
    registerCellContentInterceptor(interceptor: ICellContentInterceptor): IDisposable;
    registerRowFilteredInterceptor(interceptor: IRowFilteredInterceptor): IDisposable;
    registerRowVisibleInterceptor(interceptor: IRowVisibleInterceptor): IDisposable;
    registerColVisibleInterceptor(interceptor: IColVisibleInterceptor): IDisposable;

    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor>;
}

/**
 * SheetViewModel
 */
export class SheetViewModel extends Disposable implements ISheetViewModel {
    private readonly _cellContentInterceptors: ICellContentInterceptor[] = [];
    private readonly _rowFilteredInterceptors: IRowFilteredInterceptor[] = [];
    private readonly _rowVisibleInterceptors: IRowVisibleInterceptor[] = [];
    private readonly _colVisibleInterceptors: IColVisibleInterceptor[] = [];

    override dispose(): void {
        super.dispose();

        this._cellContentInterceptors.length = 0;
        this._rowFilteredInterceptors.length = 0;
        this._rowVisibleInterceptors.length = 0;
        this._colVisibleInterceptors.length = 0;
    }

    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        for (const interceptor of this._cellContentInterceptors) {
            const result = interceptor.getCell(row, col);
            if (typeof result !== 'undefined') {
                return result;
            }
        }

        return null;
    }

    registerCellContentInterceptor(interceptor: ICellContentInterceptor): IDisposable {
        if (this._cellContentInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._cellContentInterceptors.push(interceptor);
        return toDisposable(() => remove(this._cellContentInterceptors, interceptor));
    }

    registerRowFilteredInterceptor(interceptor: IRowFilteredInterceptor): IDisposable {
        if (this._rowFilteredInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._rowFilteredInterceptors.push(interceptor);
        return toDisposable(() => remove(this._rowFilteredInterceptors, interceptor));
    }

    registerRowVisibleInterceptor(interceptor: IRowVisibleInterceptor): IDisposable {
        if (this._rowVisibleInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._rowVisibleInterceptors.push(interceptor);
        return toDisposable(() => remove(this._rowVisibleInterceptors, interceptor));
    }

    registerColVisibleInterceptor(interceptor: IColVisibleInterceptor): IDisposable {
        if (this._colVisibleInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._colVisibleInterceptors.push(interceptor);
        return toDisposable(() => remove(this._colVisibleInterceptors, interceptor));
    }
}
