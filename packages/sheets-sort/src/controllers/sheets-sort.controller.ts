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

import type { ICellData, Nullable, UniverInstanceService } from '@univerjs/core';
import { CellValueType, Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';


import { Inject, Injector } from '@wendellhu/redi';
import { SheetRenderController } from '@univerjs/sheets-ui';
import { IMenuService } from '@univerjs/ui';
import type { ICellValueCompareFn } from '../commands/sheets-reorder.command';
import { ReorderRangeCommand } from '../commands/sheets-reorder.command';
import { ReorderRangeMutation } from '../commands/sheets-reorder.mutation';
import { SheetsSortService } from '../services/sheet-sort.service';
import { compareNull, compareNumber, compareString } from './utils';


export type ICommonComparableCellValue = number | string | null;

@OnLifecycle(LifecycleStages.Ready, SheetsSortController)
export class SheetsSortController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceService: UniverInstanceService,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(SheetRenderController) private _sheetRenderController: SheetRenderController,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetsSortService) private readonly _sortService: SheetsSortService
    ) {
        super();
        [
            ReorderRangeMutation,
        ].forEach((m) => this.disposeWithMe(this._sheetRenderController.registerSkeletonChangingMutations(m.id)));
        this._initCommands();
        this._registerCompareFns();
    }


    private _initCommands(): void {
        [
            ReorderRangeCommand,
            ReorderRangeMutation,
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
        if (!a) {
            return null;
        }
        if (a?.t === CellValueType.NUMBER) {
            return Number.parseFloat(`${a.v}`);
        }
        if (a?.t === CellValueType.STRING) {
            return `${a.v}`;
        }
        if (a?.t === CellValueType.BOOLEAN) {
            return `${a.v}`;
        }
        if (a?.t === CellValueType.FORCE_STRING) {
            return Number.parseFloat(`${a.v}`);
        }
        return `${a.v}`;
    }
}

