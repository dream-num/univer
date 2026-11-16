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

import type { ICellData, Nullable } from '@univerjs/core';
import type { ErrorType } from '@univerjs/engine-formula';
import { CellValueType, Disposable, ICommandService, Inject, isRealNum } from '@univerjs/core';
import { ERROR_TYPE_SET } from '@univerjs/engine-formula';
import type { ICellValueCompareFn } from '../commands/commands/sheets-sort.command';
import { SortRangeCommand } from '../commands/commands/sheets-sort.command';
import { SortType } from '../services/interface';
import { SheetsSortService } from '../services/sheets-sort.service';
import { compareNull, compareNumber, compareString, isNullValue } from './utils';

export type ICommonComparableCellValue = number | string | null;

export class SheetsSortController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetsSortService) private readonly _sortService: SheetsSortService
    ) {
        super();
        this._initCommands();
        this._registerCompareFns();
    }

    private _initCommands(): void {
        [
            SortRangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerCompareFns(): void {
        const commonFn: ICellValueCompareFn = (type, a, b) => {
            const valueA: ICommonComparableCellValue = this._getCommonValue(a);
            const valueB: ICommonComparableCellValue = this._getCommonValue(b);

            const compareTypeFns = [
                compareNull,
                (left: ICommonComparableCellValue, right: ICommonComparableCellValue) => {
                    if (left === null || left === '' || right === null || right === '') return null;
                    const category = (cell: Nullable<ICellData>, value: ICommonComparableCellValue) => {
                        if (cell?.p?.body?.dataStream) return 1;
                        if (cell?.t === CellValueType.BOOLEAN) return 2;
                        if (cell?.t === CellValueType.STRING && typeof cell.v === 'string' && ERROR_TYPE_SET.has(cell.v as ErrorType)) return 3;
                        return typeof value === 'number' ? 0 : 1;
                    };
                    const difference = category(a, left) - category(b, right);
                    if (difference !== 0) return (type === SortType.ASC ? 1 : -1) * difference;
                    if (a?.t === CellValueType.BOOLEAN && b?.t === CellValueType.BOOLEAN && !a.p?.body?.dataStream && !b.p?.body?.dataStream) {
                        const logicalValue = (cell: Nullable<ICellData>) => cell?.v === true || cell?.v === 1 || cell?.v === 'true' || cell?.v === '1' ? 1 : 0;
                        const logicalDifference = logicalValue(a) - logicalValue(b);
                        return (type === SortType.ASC ? 1 : -1) * Math.sign(logicalDifference);
                    }
                    return null;
                },
                compareString,
                compareNumber,
            ];

            for (let i = 0; i < compareTypeFns.length; i++) {
                const res = compareTypeFns[i](valueA, valueB, type);
                if (res !== null) {
                    return res;
                }
            }

            return null;
        };
        this._sortService.registerCompareFn(commonFn);
    }

    private _getCommonValue(a: Nullable<ICellData>): ICommonComparableCellValue {
        if (isNullValue(a)) {
            return null;
        }

        const richTextValue = a?.p?.body?.dataStream;
        if (richTextValue) {
            return richTextValue;
        }

        if (a?.t === CellValueType.NUMBER) {
            return Number.parseFloat(`${a.v}`);
        }
        if (a?.t === CellValueType.STRING) {
            if (typeof a.v === 'number') {
                return a.v;
            }
            return `${a.v}`;
        }
        if (a?.t === CellValueType.BOOLEAN) {
            return `${a.v}`;
        }
        if (a?.t === CellValueType.FORCE_STRING) {
            return isRealNum(a.v) ? Number.parseFloat(`${a.v}`) : `${a.v}`;
        }
        return `${a?.v}`;
    }
}
