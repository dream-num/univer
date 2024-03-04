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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { SheetsFilterService } from '../services/sheet-filter.service';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '../commands/sheets-filter.mutation';

@OnLifecycle(LifecycleStages.Ready, SheetsFilterController)
export class SheetsFilterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService
    ) {
        super();

        this._initCommands();
        this._initRowFilteredInterceptor();
        this._initInterceptors();
    }

    private _initCommands(): void {
        [
            SetSheetsFilterCriteriaMutation,
            SetSheetsFilterRangeMutation,
            ReCalcSheetsFilterMutation,
            RemoveSheetsFilterMutation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initInterceptors(): void {
        // TODO@yuhongz: init interceptor commands, some commands may cause the filter range / conditions to change,
        // even remove the whole filter.

        // this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
        //     getMutations(command) {

        //     },
        // }));
    }

    private _initRowFilteredInterceptor(): void {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            handler: (filtered, rowLocation) => {
                if (filtered) return true;

                // NOTE@wzhudev: maybe we should use some cache or add some cache on the skeleton to improve performance
                const f = this._sheetsFilterService
                    .getFilterModel(rowLocation.unitId, rowLocation.subUnitId)
                    ?.isRowFiltered(rowLocation.row);
                return f ?? false;
            },
        }));
    }
}
