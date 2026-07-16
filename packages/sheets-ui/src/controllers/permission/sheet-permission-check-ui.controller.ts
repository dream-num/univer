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
import type { IInsertTextCommandParams } from '@univerjs/docs';
import type { IIMEInputCommandParams } from '@univerjs/docs-ui';
import type { ISheetPasteParams } from '../../commands/commands/clipboard.command';
import type { LocaleKey } from '../../locale/types';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import {
    Disposable,
    DisposableCollection,
    FOCUSING_COMMENT_EDITOR,
    FOCUSING_EDITOR_STANDALONE,
    ICommandService,
    IContextService,
    Inject,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    SHEET_EDITOR_UNITS,
} from '@univerjs/core';
import { InsertTextCommand } from '@univerjs/docs';
import { IMEInputCommand } from '@univerjs/docs-ui';
import {
    getSheetCommandTarget,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    RangeProtectionRuleModel,
    SheetPermissionCheckController,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
} from '@univerjs/sheets';
import { IDialogService } from '@univerjs/ui';
import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteShortKeyCommand,
} from '../../commands/commands/clipboard.command';
import { ApplyFormatPainterCommand } from '../../commands/commands/set-format-painter.command';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { PREDEFINED_HOOK_NAME_PASTE } from '../../services/clipboard/clipboard.service';
import {
    UNIVER_SHEET_PERMISSION_ALERT_DIALOG,
    UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID,
} from '../../views/permission/error-msg-dialog/interface';

export class SheetPermissionCheckUIController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IContextService private readonly _contextService: IContextService,

        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();
        this._initialize();

        this._initUIEvent();
    }

    private _initUIEvent() {
        this.disposeWithMe(
            this._sheetPermissionCheckController.triggerPermissionUIEvent$.subscribe((errorMsg) => {
                this._haveNotPermissionHandle(errorMsg);
            })
        );
    }

    private _haveNotPermissionHandle(errorMsg: string) {
        const dialogProps = {
            id: UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID,
            title: { title: 'sheets-ui.permission.dialog.alert' },
            children: {
                label: UNIVER_SHEET_PERMISSION_ALERT_DIALOG,
                errorMsg,
            },
            width: 320,
            destroyOnClose: true,
            showOk: true,
            onClose: () => {
                this._dialogService.close(UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID);
            },
            onOk: () => {
                this._dialogService.close(UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID);
            },
            className: 'sheet-permission-user-dialog',
        };
        if (this._permissionService.getShowComponents()) {
            this._dialogService.open(dialogProps);
        }
    }

    // eslint-disable-next-line max-lines-per-function,complexity
    private _getPermissionCheck(commandInfo: ICommandInfo) {
        const { id } = commandInfo;

        let permission = true;
        let errorMsg = '';
        let params;
        let target;

        switch (id) {
            case InsertTextCommand.id:
            case IMEInputCommand.id:
                params = commandInfo.params as IInsertTextCommandParams | IIMEInputCommandParams;

                if (!params || !SHEET_EDITOR_UNITS.includes(params.unitId)) {
                    break;
                }

                if (this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) === true || this._contextService.getContextValue(FOCUSING_COMMENT_EDITOR) === true) {
                    break;
                }

                permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.editErr');
                break;
            case SetCellEditVisibleOperation.id:
                params = commandInfo.params as IEditorBridgeServiceVisibleParam;

                if (params.visible === false) {
                    break;
                }

                permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.editErr');
                break;
            case SheetPasteColWidthCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.pasteErr');
                break;
            case SheetPasteShortKeyCommand.id:
            case SheetPasteCommand.id:
                params = commandInfo.params as ISheetPasteParams;

                permission = this._permissionCheckByPaste(params);
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.pasteErr');
                break;
            case ApplyFormatPainterCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.commonErr');
                break;
            case SheetCopyCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookCopyPermission],
                    worksheetTypes: [WorksheetCopyPermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.copyErr');

                target = getSheetCommandTarget(this._univerInstanceService);
                if (
                    !permission &&
                    target &&
                    !this._permissionService.getPermissionPoint(new WorkbookCopyPermission(target.unitId).id)?.value
                ) {
                    errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.workbookCopyErr');
                }

                break;
            case SheetCutCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookCopyPermission, WorkbookEditablePermission],
                    worksheetTypes: [WorksheetCopyPermission, WorksheetEditPermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint, RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.copyErr');

                target = getSheetCommandTarget(this._univerInstanceService);
                if (
                    !permission &&
                    target &&
                    !this._permissionService.getPermissionPoint(new WorkbookCopyPermission(target.unitId).id)?.value
                ) {
                    errorMsg = this._localeService.t<LocaleKey>('sheets-ui.permission.dialog.workbookCopyErr');
                }

                break;

            default:
                break;
        }

        if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(errorMsg);
        }
    };

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((commandInfo: ICommandInfo) => {
                this._getPermissionCheck(commandInfo);
            })
        );
    }

    private _permissionCheckByPaste(params: ISheetPasteParams) {
        if (params.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE || params.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA) {
            return this._sheetPermissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            });
        } else if (params.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT) {
            return this._sheetPermissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            });
        } else {
            return this._sheetPermissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetSetCellStylePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            });
        }
    }
}
