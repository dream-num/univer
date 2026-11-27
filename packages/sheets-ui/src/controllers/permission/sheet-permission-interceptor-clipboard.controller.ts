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
import {
    Disposable,
    Inject,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import {
    discreteRangeToRange,
    SheetPermissionCheckController,
    WorkbookInsertColumnPermission,
    WorkbookInsertRowPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertRowPermission,
} from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';
import { getSheetPastePermissions } from '../../commands/commands/clipboard.command';
import { ISheetClipboardService } from '../../services/clipboard/clipboard.service';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };
export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

export class SheetPermissionInterceptorClipboardController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
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
                onBeforePaste: (pasteTo, payload) => {
                    const { unitId, subUnitId, range } = pasteTo;
                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                    const worksheet = workbook?.getSheetBySheetId(subUnitId);
                    if (!worksheet) {
                        return false;
                    }

                    const bounds = discreteRangeToRange(range);
                    const permissions = getSheetPastePermissions(payload?.pasteType);
                    if (bounds.endRow >= worksheet.getMaxRows()) {
                        permissions.workbookTypes.push(WorkbookInsertRowPermission);
                        permissions.worksheetTypes.push(WorksheetInsertRowPermission);
                    }
                    if (bounds.endColumn >= worksheet.getMaxColumns()) {
                        permissions.workbookTypes.push(WorkbookInsertColumnPermission);
                        permissions.worksheetTypes.push(WorksheetInsertColumnPermission);
                    }
                    if (!this._sheetPermissionCheckController.permissionCheckWithRanges(permissions, [bounds], unitId, subUnitId)) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                            this._localService.t<LocaleKey>('sheets-ui.permission.dialog.pasteErr')
                        );
                        return false;
                    }

                    let hasPermission = true;

                    for (const row of range.rows) {
                        for (const col of range.cols) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false) {
                                hasPermission = false;
                                break;
                            }
                        }
                    }

                    if (!hasPermission) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                            this._localService.t<LocaleKey>('sheets-ui.permission.dialog.pasteErr')
                        );
                    }

                    return hasPermission;
                },
            })
        );
    }
}
