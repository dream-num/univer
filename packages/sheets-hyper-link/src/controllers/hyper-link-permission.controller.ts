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

import type { ICommandInfo, IPermissionTypes } from '@univerjs/core';
import { Disposable, ICommandService, Inject, LocaleService } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    SheetPermissionCheckController,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetInsertHyperlinkPermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import type { IAddHyperLinkCommandParams } from '../commands/commands/add-hyper-link.command';
import type { ICancelHyperLinkCommandParams } from '../commands/commands/remove-hyper-link.command';
import type { IUpdateHyperLinkCommandParams } from '../commands/commands/update-hyper-link.command';
import type { LocaleKey } from '../locale/types';
import { AddHyperLinkCommand } from '../commands/commands/add-hyper-link.command';
import { CancelHyperLinkCommand } from '../commands/commands/remove-hyper-link.command';
import { UpdateHyperLinkCommand } from '../commands/commands/update-hyper-link.command';

/**
 * Runs in the base package so hyperlink commands are checked in headless/Facade usage. The UI
 * operation that opens the hyperlink editor is still guarded by `sheets-hyper-link-ui`.
 */
export class SheetsHyperLinkPermissionController extends Disposable {
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
                if (command.id === AddHyperLinkCommand.id) {
                    const params = command.params as IAddHyperLinkCommandParams;
                    this._checkPermission(params.unitId, params.subUnitId, params.link.row, params.link.column, true);
                } else if (command.id === UpdateHyperLinkCommand.id) {
                    const params = command.params as IUpdateHyperLinkCommandParams;
                    this._checkPermission(params.unitId, params.subUnitId, params.row, params.column, true);
                } else if (command.id === CancelHyperLinkCommand.id) {
                    const params = command.params as ICancelHyperLinkCommandParams;
                    this._checkPermission(params.unitId, params.subUnitId, params.row, params.column, true);
                }
            })
        );
    }

    private _checkPermission(unitId: string, subUnitId: string, row: number, column: number, requireInsert: boolean): void {
        const worksheetTypes: IPermissionTypes['worksheetTypes'] = [WorksheetEditPermission, WorksheetSetCellValuePermission];
        if (requireInsert) {
            worksheetTypes.push(WorksheetInsertHyperlinkPermission);
        }

        const permission = this._sheetPermissionCheckController.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes,
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            [{
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
            }],
            unitId,
            subUnitId
        );
        if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                this._localeService.t<LocaleKey>('sheets-hyper-link.permission.editErr')
            );
        }
    }
}
