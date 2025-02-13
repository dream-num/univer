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

import type { ICellDataForSheetInterceptor, IRange, Workbook } from '@univerjs/core';
import { Disposable, DisposableCollection, Inject, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import { SheetPermissionCheckController, SheetsSelectionsService } from '@univerjs/sheets';
import { ISheetClipboardService } from '../../services/clipboard/clipboard.service';
import { virtualizeDiscreteRanges } from '../utils/range-tools';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };
export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

export class SheetPermissionInterceptorClipboardController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(LocaleService) private readonly _localService: LocaleService,
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();
        this._initClipboardHook();
    }

    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                id: SHEET_PERMISSION_PASTE_PLUGIN,
                onBeforePaste: (pasteTo) => {
                    const [ranges] = virtualizeDiscreteRanges([pasteTo.range]).ranges;
                    const startRange = this._selectionManagerService.getCurrentLastSelection()?.range;
                    if (!startRange) {
                        return false;
                    }
                    const targetRange = {
                        startRow: startRange.startRow + ranges.startRow,
                        endRow: startRange.startRow + ranges.endRow,
                        startColumn: startRange.startColumn + ranges.startColumn,
                        endColumn: startRange.startColumn + ranges.endColumn,
                    };

                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getActiveSheet();
                    if (!worksheet) {
                        return false;
                    }

                    const { startRow, endRow, startColumn, endColumn } = targetRange;

                    let hasPermission = true;

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startColumn; col <= endColumn; col++) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false) {
                                hasPermission = false;
                                break;
                            }
                        }
                    }

                    if (!hasPermission) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localService.t('permission.dialog.pasteErr'));
                    }

                    return hasPermission;
                },
            })
        );
    }
}
