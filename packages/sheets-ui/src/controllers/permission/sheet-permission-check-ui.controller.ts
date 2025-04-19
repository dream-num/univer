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

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */

import type { ICellDataForSheetInterceptor, ICommandInfo, IRange, Workbook } from '@univerjs/core';
import type { IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, ISetRangeValuesCommandParams, ISetSpecificRowsVisibleCommandParams } from '@univerjs/sheets';
import type { IAutoFillCommandParams } from '../../commands/commands/auto-fill.command';
import type { ISheetPasteParams } from '../../commands/commands/clipboard.command';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { Disposable, DisposableCollection, FOCUSING_EDITOR_STANDALONE, ICommandService, IContextService, Inject, IPermissionService, IUniverInstanceService, LocaleService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { IMEInputCommand, InsertCommand } from '@univerjs/docs-ui';
import { UnitAction } from '@univerjs/protocol';
import { getSheetCommandTarget, RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint, RangeProtectionRuleModel, SetBackgroundColorCommand, SheetPermissionCheckController, WorkbookCopyPermission, WorkbookEditablePermission, WorksheetCopyPermission, WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetColumnStylePermission } from '@univerjs/sheets';
import { IDialogService } from '@univerjs/ui';
import { AutoFillCommand } from '../../commands/commands/auto-fill.command';
import { SheetCopyCommand, SheetCutCommand, SheetPasteColWidthCommand, SheetPasteShortKeyCommand } from '../../commands/commands/clipboard.command';
import { SetRangeBoldCommand, SetRangeItalicCommand, SetRangeStrickThroughCommand, SetRangeUnderlineCommand } from '../../commands/commands/inline-format.command';
import { ApplyFormatPainterCommand } from '../../commands/commands/set-format-painter.command';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG, UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID } from '../../views/permission/error-msg-dialog/interface';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };
type ICheckPermissionCommandParams = IEditorBridgeServiceVisibleParam | IMoveRowsCommandParams | IMoveColsCommandParams | IMoveRangeCommandParams | ISetRangeValuesCommandParams | ISheetPasteParams | ISetSpecificRowsVisibleCommandParams | IAutoFillCommandParams;

export class SheetPermissionCheckUIController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @IAutoFillService private _autoFillService: IAutoFillService,
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
            title: { title: 'permission.dialog.alert' },
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

    private _getPermissionCheck(id: string, params: ICheckPermissionCommandParams) {
        let permission = true;
        let errorMsg = '';

        switch (id) {
            case InsertCommand.id:
            case IMEInputCommand.id:
                if (this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) === true) {
                    break;
                }
                permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.editErr');
                break;
            case SetCellEditVisibleOperation.id:
                if ((params as IEditorBridgeServiceVisibleParam).visible === false) {
                    break;
                }
                permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.editErr');
                break;
            case SheetPasteColWidthCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                });
                errorMsg = this._localeService.t('permission.dialog.pasteErr');
                break;
            case SheetPasteShortKeyCommand.id:
                permission = this._permissionCheckByPaste(params as ISheetPasteParams);
                errorMsg = this._localeService.t('permission.dialog.pasteErr');
                break;
            case ApplyFormatPainterCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission],
                });
                errorMsg = this._localeService.t('permission.dialog.commonErr');
                break;
            case SetBackgroundColorCommand.id:
            case SetRangeBoldCommand.id:
            case SetRangeItalicCommand.id:
            case SetRangeUnderlineCommand.id:
            case SetRangeStrickThroughCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.setStyleErr');
                break;
            case SheetCopyCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookCopyPermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                    worksheetTypes: [WorksheetCopyPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.copyErr');
                if (!this._permissionService.getPermissionPoint(new WorkbookCopyPermission(this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId()).id)?.value) {
                    errorMsg = this._localeService.t('permission.dialog.workbookCopyErr');
                }
                break;
            case SheetCutCommand.id:
                permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    workbookTypes: [WorkbookCopyPermission, WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint, RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetCopyPermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.copyErr');
                if (!this._permissionService.getPermissionPoint(new WorkbookCopyPermission(this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId()).id)?.value) {
                    errorMsg = this._localeService.t('permission.dialog.workbookCopyErr');
                }
                break;

            case AutoFillCommand.id:
                permission = this._permissionCheckByAutoFillCommand(params as IAutoFillCommandParams);
                errorMsg = this._localeService.t('permission.dialog.autoFillErr');
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
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                this._getPermissionCheck(command.id, command?.params as ICheckPermissionCommandParams);
            })
        );
    }

    private _permissionCheckByPaste(params: ISheetPasteParams) {
        if (params.value === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE || params.value === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA) {
            return this._sheetPermissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        } else if (params.value === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT) {
            return this._sheetPermissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        } else {
            return this._sheetPermissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        }
    }

    private _permissionCheckByAutoFillCommand(params?: IAutoFillCommandParams) {
        if (!params) {
            return false;
        }

        const { targetRange } = params;

        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;

        const permissionLapRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
            return [...p, ...c.ranges];
        }, [] as IRange[]).filter((range) => {
            return Rectangle.intersects(range, targetRange);
        });

        const hasNotPermission = permissionLapRanges.some((range) => {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startColumn; col <= range.endColumn; col++) {
                    const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                    if (permission?.[UnitAction.Edit] === false) {
                        return true;
                    }
                }
            }
            return false;
        });

        return !hasNotPermission;
    }
}
