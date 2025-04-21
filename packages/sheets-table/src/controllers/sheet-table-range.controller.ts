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

import { Disposable, Inject } from '@univerjs/core';
import { IExclusiveRangeService } from '@univerjs/sheets';
import { FEATURE_TABLE_ID } from '../const';
import { TableManager } from '../model/table-manager';

export class SheetTableRangeController extends Disposable {
    constructor(
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(IExclusiveRangeService) private _exclusiveRangeService: IExclusiveRangeService
    ) {
        super();
        this._initRangeListener();
    }

    private _initRangeListener() {
        this.disposeWithMe(
            this._tableManager.tableRangeChanged$.subscribe((event) => {
                const { range, tableId, unitId, subUnitId } = event;
                this._exclusiveRangeService.clearExclusiveRangesByGroupId(unitId, subUnitId, FEATURE_TABLE_ID, tableId);
                this._exclusiveRangeService.addExclusiveRange(unitId, subUnitId, FEATURE_TABLE_ID, [{
                    range: { ...range },
                    groupId: tableId,
                }]);
            })
        );
        this.disposeWithMe(
            this._tableManager.tableAdd$.subscribe((event) => {
                const { tableId, unitId, subUnitId, range } = event;
                this._exclusiveRangeService.addExclusiveRange(unitId, subUnitId, FEATURE_TABLE_ID, [{
                    range: { ...range },
                    groupId: tableId,
                }]);
            })
        );
        this.disposeWithMe(
            this._tableManager.tableDelete$.subscribe((event) => {
                const { tableId, unitId, subUnitId } = event;
                this._exclusiveRangeService.clearExclusiveRangesByGroupId(unitId, subUnitId, FEATURE_TABLE_ID, tableId);
            })
        );
    }
}
