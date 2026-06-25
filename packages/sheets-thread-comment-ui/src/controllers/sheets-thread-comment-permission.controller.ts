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
import type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IDeleteCommentTreeCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
} from '@univerjs/thread-comment';
import type { LocaleKey } from '../locale/types';
import { Disposable, ICommandService, Inject, LocaleService } from '@univerjs/core';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import {
    RangeProtectionPermissionViewPoint,
    SheetPermissionCheckController,
    WorkbookCommentPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
import { ShowAddSheetCommentModalOperation, ToggleSheetCommentPanelOperation } from '../commands/operations/comment.operation';

export class SheetsThreadCommentPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                const { id } = command;

                if (id === ShowAddSheetCommentModalOperation.id || id === ToggleSheetCommentPanelOperation.id) {
                    const permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                        workbookTypes: [WorkbookCommentPermission],
                        worksheetTypes: [WorksheetViewPermission],
                    });
                    if (!permission) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t<LocaleKey>('sheets-thread-comment-ui.permission.commentErr'));
                    }
                } else if (id === AddCommentCommand.id) {
                    const params = command.params as IAddCommentCommandParams;
                    const { unitId, subUnitId, comment } = params;
                    const location = singleReferenceToGrid(comment.ref);
                    const { row, column } = location;

                    const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                        workbookTypes: [WorkbookCommentPermission],
                        worksheetTypes: [WorksheetViewPermission],
                        rangeTypes: [RangeProtectionPermissionViewPoint],
                    }, [{ startRow: row, startColumn: column, endRow: row, endColumn: column }], unitId, subUnitId);
                    if (!permission) {
                        this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t<LocaleKey>('sheets-thread-comment-ui.permission.commentErr'));
                    }
                } else if (id === UpdateCommentCommand.id) {
                    const params = command.params as IUpdateCommentCommandParams;
                    const { unitId, subUnitId, payload } = params;
                    const { commentId } = payload;
                    const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);

                    if (comment) {
                        const location = singleReferenceToGrid(comment.ref);
                        const { row, column } = location;

                        const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                            workbookTypes: [WorkbookCommentPermission],
                            worksheetTypes: [WorksheetViewPermission],
                            rangeTypes: [RangeProtectionPermissionViewPoint],
                        }, [{ startRow: row, startColumn: column, endRow: row, endColumn: column }], unitId, subUnitId);
                        if (!permission) {
                            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t<LocaleKey>('sheets-thread-comment-ui.permission.commentErr'));
                        }
                    }
                } else if (id === ResolveCommentCommand.id || id === DeleteCommentCommand.id || id === DeleteCommentTreeCommand.id) {
                    const params = command.params as IResolveCommentCommandParams | IDeleteCommentCommandParams | IDeleteCommentTreeCommandParams;
                    const { unitId, subUnitId, commentId } = params;
                    const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);

                    if (comment) {
                        const location = singleReferenceToGrid(comment.ref);
                        const { row, column } = location;

                        const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                            workbookTypes: [WorkbookCommentPermission],
                            worksheetTypes: [WorksheetViewPermission],
                            rangeTypes: [RangeProtectionPermissionViewPoint],
                        }, [{ startRow: row, startColumn: column, endRow: row, endColumn: column }], unitId, subUnitId);
                        if (!permission) {
                            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t<LocaleKey>('sheets-thread-comment-ui.permission.commentErr'));
                        }
                    }
                }
            })
        );
    }
}
