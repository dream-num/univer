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

import type { IInsertRowMutationParams, IRemoveRowsMutationParams } from '../basics';
import type { ISetRowHiddenMutationParams, ISetRowVisibleMutationParams } from '../commands/mutations/set-row-visible.mutation';
import type { ISetWorksheetRowHeightMutationParams } from '../commands/mutations/set-worksheet-row-height.mutation';
import { Disposable, ICommandService, Inject, IUniverInstanceService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../commands/mutations/set-row-visible.mutation';
import { SetWorksheetRowHeightMutation } from '../commands/mutations/set-worksheet-row-height.mutation';
import { SheetRangeThemeModel } from '../model/range-theme-model';

export class ZebraCrossingCacheController extends Disposable {
    private _zebraCacheUpdateSubject = new Subject<{
        unitId: string;
        subUnitId: string;
    }>();

    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(SheetRangeThemeModel) private readonly _sheetRangeThemeModel: SheetRangeThemeModel,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initializeCommandListener();
        this._initTriggerCacheUpdateListener();
    }

    /**
     * Update the zebra crossing cache for a specific unit and sub-unit.
     * @param {string} unitId - The ID of the unit.
     * @param {string} subUnitId - The ID of the sub-unit.
     */
    public updateZebraCrossingCache(unitId: string, subUnitId: string) {
        this._zebraCacheUpdateSubject.next({ unitId, subUnitId });
    }

    private _initializeCommandListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            const { id } = commandInfo;
            let unitId: string | undefined;
            let subUnitId: string | undefined;
            switch (id) {
                case InsertRowMutation.id:
                    {
                        const params = commandInfo.params as IInsertRowMutationParams;
                        unitId = params.unitId;
                        subUnitId = params.subUnitId;
                    }
                    break;
                case SetRowVisibleMutation.id:
                    {
                        const params = commandInfo.params as ISetRowVisibleMutationParams;
                        unitId = params.unitId;
                        subUnitId = params.subUnitId;
                    }
                    break;
                case SetRowHiddenMutation.id:
                    {
                        const params = commandInfo.params as ISetRowHiddenMutationParams;
                        unitId = params.unitId;
                        subUnitId = params.subUnitId;
                    }
                    break;
                case RemoveRowMutation.id:
                    {
                        const params = commandInfo.params as IRemoveRowsMutationParams;
                        unitId = params.unitId;
                        subUnitId = params.subUnitId;
                    }
                    break;
                case SetWorksheetRowHeightMutation.id:
                    {
                        // only row height change 0 from non-zero or vice versa will trigger the cache update， we can perform in the future
                        const params = commandInfo.params as ISetWorksheetRowHeightMutationParams;
                        unitId = params.unitId;
                        subUnitId = params.subUnitId;
                    }
                    break;
                default:
                    break;
            }

            if (unitId && subUnitId) {
                this._sheetRangeThemeModel.refreshSheetRowVisibleFuncSet(unitId, subUnitId);
                this._sheetRangeThemeModel.refreshZebraCrossingCacheBySheet(unitId, subUnitId);
            }
        }));
    }

    private _initTriggerCacheUpdateListener() {
        this.disposeWithMe(
            this._zebraCacheUpdateSubject.subscribe(({ unitId, subUnitId }) => {
                this._sheetRangeThemeModel.refreshSheetRowVisibleFuncSet(unitId, subUnitId);
                this._sheetRangeThemeModel.refreshZebraCrossingCacheBySheet(unitId, subUnitId);
            })
        );
    }
}
