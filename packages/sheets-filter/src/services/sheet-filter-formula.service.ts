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

import type { Workbook } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import { Disposable, Inject, IUniverInstanceService } from '@univerjs/core';
import { IActiveDirtyManagerService, ISheetRowFilteredService } from '@univerjs/engine-formula';
import { FILTER_MUTATIONS } from '../common/const';
import { SheetsFilterService } from './sheet-filter.service';

/**
 * Hidden rows after filtering affect formula calculations, such as SUBTOTAL
 */
export class SheetsFilterFormulaService extends Disposable {
    constructor(
        @Inject(IActiveDirtyManagerService) private _activeDirtyManagerService: IActiveDirtyManagerService,
        @Inject(ISheetRowFilteredService) private _sheetRowFilteredService: ISheetRowFilteredService,
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initFormulaDirtyRange();
        this._registerSheetRowFiltered();
    }

    private _initFormulaDirtyRange() {
        FILTER_MUTATIONS.forEach((commandId) => {
            this._activeDirtyManagerService.register(
                commandId,
                {
                    commandId,
                    getDirtyData: (commandInfo) => {
                        const params = commandInfo.params as ISheetCommandSharedParams;
                        const { unitId, subUnitId } = params;
                        return {
                            dirtyRanges: this._getHideRowMutation(unitId, subUnitId),
                            clearDependencyTreeCache: {
                                [unitId]: {
                                    [subUnitId]: '1',
                                },
                            },
                        };
                    },
                }
            );
        });
    }

    private _getHideRowMutation(unitId: string, subUnitId: string) {
        const range = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();

        const sheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);

        if (range == null || sheet == null) {
            return [];
        }

        const { startRow, endRow } = range;

        // covert hidden rows to dirtyRanges
        const dirtyRanges = [{
            unitId,
            sheetId: subUnitId,
            range: {
                startRow,
                startColumn: 0,
                endRow,
                endColumn: sheet.getColumnCount() - 1,
            },
        }];

        return dirtyRanges;
    }

    private _registerSheetRowFiltered() {
        this._sheetRowFilteredService.register((unitId, subUnitId, row) => {
            return this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.isRowFiltered(row) ?? false;
        });
    }
}
