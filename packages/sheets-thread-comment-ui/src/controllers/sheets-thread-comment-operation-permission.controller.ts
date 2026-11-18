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

import type { ICommandInfo, Workbook } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import { IThreadCommentAuthzService } from '@univerjs/thread-comment';
import type { LocaleKey } from '../locale/types';
import {
    AddSheetDrawingCommentOperation,
    ShowAddSheetCommentModalOperation,
    ToggleSheetCommentPanelOperation,
} from '../commands/operations/comment.operation';

/**
 * Guards the sheet comment entry points. Command writes are enforced in
 * `@univerjs/sheets-thread-comment`; these operations only open UI surfaces, so
 * blocking them early gives feedback before a modal or panel is opened.
 */
export class SheetsThreadCommentOperationPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @Inject(IThreadCommentAuthzService) private readonly _authzService: IThreadCommentAuthzService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                const { id } = command;

                if (id === ShowAddSheetCommentModalOperation.id || id === AddSheetDrawingCommentOperation.id) {
                    if (!this._authzService.canWrite('add', this._getTarget())) {
                        this._block();
                    }
                } else if (id === ToggleSheetCommentPanelOperation.id) {
                    if (!this._authzService.canRead(this._getTarget())) {
                        this._block();
                    }
                }
            })
        );
    }

    private _getTarget() {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);

        return {
            unitId: workbook?.getUnitId() ?? '',
            subUnitId: workbook?.getActiveSheet().getSheetId() ?? '',
            ref: '',
        };
    }

    private _block() {
        this._sheetPermissionCheckController.blockExecuteWithoutPermission(
            this._localeService.t<LocaleKey>('sheets-thread-comment-ui.permission.commentErr')
        );
    }
}
