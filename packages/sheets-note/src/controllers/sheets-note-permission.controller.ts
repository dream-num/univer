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
import { SheetPermissionCheckController } from '@univerjs/sheets';
import type { ISheetDeleteNoteCommandParams } from '../commands/commands/note.command';
import type { IUpdateNoteMutationParams } from '../commands/mutations/note.mutation';
import type { LocaleKey } from '../locale/types';
import { SheetDeleteNoteCommand, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '../commands/commands/note.command';
import { SHEET_NOTE_EDIT_PERMISSIONS } from '../const';

/**
 * Blocks note writes without edit permission in the base package, so headless
 * integrations and the UI share the same enforcement point. Mutations are not
 * checked on purpose: collaboration replay, undo and reference updates run
 * through mutations and must still be applied.
 */
export class SheetsNotePermissionController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._initCommandListener();
    }

    private _initCommandListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                const { id } = command;

                if (id === SheetUpdateNoteCommand.id) {
                    const params = command.params as IUpdateNoteMutationParams | undefined;
                    if (!params) {
                        return;
                    }

                    if (!this._checkCell(params.unitId, params.sheetId, params.row, params.col)) {
                        this._blockExecute();
                    }
                } else if (id === SheetDeleteNoteCommand.id) {
                    const params = command.params as ISheetDeleteNoteCommandParams | undefined;
                    const permission = params
                        ? this._checkCell(params.unitId, params.sheetId, params.row, params.col)
                        : this._sheetPermissionCheckController.permissionCheckWithoutRange(SHEET_NOTE_EDIT_PERMISSIONS);

                    if (!permission) {
                        this._blockExecute();
                    }
                } else if (id === SheetToggleNotePopupCommand.id) {
                    // Showing or hiding a note changes the persisted note, so it is a write.
                    if (!this._sheetPermissionCheckController.permissionCheckWithoutRange(SHEET_NOTE_EDIT_PERMISSIONS)) {
                        this._blockExecute();
                    }
                }
            })
        );
    }

    private _checkCell(unitId: string, sheetId: string, row: number, col: number) {
        return this._sheetPermissionCheckController.permissionCheckWithRanges(
            SHEET_NOTE_EDIT_PERMISSIONS,
            [{ startRow: row, startColumn: col, endRow: row, endColumn: col }],
            unitId,
            sheetId
        );
    }

    private _blockExecute() {
        this._sheetPermissionCheckController.blockExecuteWithoutPermission(
            this._localeService.t<LocaleKey>('sheets-note.permission.editErr')
        );
    }
}
