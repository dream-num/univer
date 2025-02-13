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
import type { ICellValueCompareFn } from '../commands/commands/sheets-sort.command';

import { CellValueType, Disposable, ICommandService, Inject } from '@univerjs/core';
import { SortRangeCommand } from '../commands/commands/sheets-sort.command';
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
            return Number.parseFloat(`${a.v}`);
        }
        return `${a?.v}`;
    }
}
