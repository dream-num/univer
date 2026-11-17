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
import { getCellValue } from '@univerjs/sheets';
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

            const nullComparison = compareNull(valueA, valueB);
            if (nullComparison !== null) return nullComparison;

            let categoryA = typeof valueA === 'number' ? 0 : 1;
            let categoryB = typeof valueB === 'number' ? 0 : 1;
            if (a?.p?.body?.dataStream) categoryA = 1;
            else if (a?.t === CellValueType.BOOLEAN) categoryA = 2;
            else if (a?.t === CellValueType.STRING && typeof a.v === 'string' && ERROR_TYPE_SET.has(a.v as ErrorType)) categoryA = 3;
            if (b?.p?.body?.dataStream) categoryB = 1;
            else if (b?.t === CellValueType.BOOLEAN) categoryB = 2;
            else if (b?.t === CellValueType.STRING && typeof b.v === 'string' && ERROR_TYPE_SET.has(b.v as ErrorType)) categoryB = 3;

            if (categoryA !== categoryB) {
                return (type === SortType.ASC ? 1 : -1) * Math.sign(categoryA - categoryB);
            }
            if (categoryA === 3) return 0;
            if (categoryA === 2) {
                return (type === SortType.ASC ? 1 : -1) * Math.sign(
                    Number(getCellValue(CellValueType.BOOLEAN, a!)) - Number(getCellValue(CellValueType.BOOLEAN, b!))
                );
            }

            return categoryA === 0 ? compareNumber(valueA, valueB, type) : compareString(valueA, valueB, type);
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
