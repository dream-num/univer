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

import type { ICommandInfo } from '@univerjs/core';
import type { IUpdateSheetDataValidationRangeCommandParams } from '@univerjs/sheets-data-validation';
import { Disposable, ICommandService, Inject, LocaleService } from '@univerjs/core';
import { RangeProtectionPermissionEditPoint, SheetPermissionCheckController, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission } from '@univerjs/sheets';
import { AddSheetDataValidationCommand, UpdateSheetDataValidationRangeCommand } from '@univerjs/sheets-data-validation';

export class DataValidationPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === AddSheetDataValidationCommand.id) {
                    const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                        workbookTypes: [WorkbookEditablePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                    });
                    if (!permission) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t('permission.dialog.setStyleErr'));
                    }
                }
                if (command.id === UpdateSheetDataValidationRangeCommand.id) {
                    const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                        workbookTypes: [WorkbookEditablePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                    }, (command.params as IUpdateSheetDataValidationRangeCommandParams).ranges);
                    if (!permission) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t('permission.dialog.setStyleErr'));
                    }
                }
            })
        );
    }
}
