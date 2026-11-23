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
import { Disposable, ICommandService, Inject, LocaleService } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    SheetPermissionCheckController,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import type { ISetNumfmtCommandParams } from '../commands/commands/set-numfmt.command';
import type { LocaleKey } from '../locale/types';
import { SetNumfmtCommand } from '../commands/commands/set-numfmt.command';

/**
 * Runs in the base package so headless and Facade callers enforce the same permission as the
 * number-format menu.
 */
export class NumfmtPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetNumfmtCommand.id) {
                    return;
                }

                const params = command.params as ISetNumfmtCommandParams | undefined;
                if (!params) {
                    return;
                }

                const { unitId, subUnitId, values } = params;
                const permission = this._sheetPermissionCheckController.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    values.map(({ row, col }) => ({
                        startRow: row,
                        endRow: row,
                        startColumn: col,
                        endColumn: col,
                    })),
                    unitId,
                    subUnitId
                );
                if (!permission) {
                    this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                        this._localeService.t<LocaleKey>('sheets-numfmt.permission.setStyleErr')
                    );
                }
            })
        );
    }
}
