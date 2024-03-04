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

import type { Nullable } from '../common/type-utils';
import { Disposable, toDisposable } from '../shared/lifecycle';
import type { ICellData, ICellDataForSheetInterceptor } from '../types/interfaces/i-cell-data';

/**
 * @internal
 */
export interface ICellContentInterceptor {
    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor>;
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

    constructor(
        private readonly getRawCell: (row: number, col: number) => Nullable<ICellData>
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._cellContentInterceptor = null;
        this._rowFilteredInterceptor = null;
    }

    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (this._cellContentInterceptor) {
            return this._cellContentInterceptor.getCell(row, col);
        }

        return this.getRawCell(row, col);
    }

    getRowFiltered(row: number): boolean {
        return this._rowFilteredInterceptor?.getRowFiltered(row) ?? false;
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
