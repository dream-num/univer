/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, ICellDataForSheetInterceptor, ICommandInfo, IObjectMatrixPrimitiveType, IPermissionTypes, IRange, Nullable, Workbook, WorkbookPermissionPointConstructor, Worksheet } from '@univerjs/core';
import type { IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, ISetRangeValuesCommandParams, ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams, ISetWorksheetNameMutationParams, ISetWorksheetShowCommandParams } from '@univerjs/sheets';
import type { IAutoFillCommandParams } from '../../commands/commands/auto-fill.command';
import type { ISheetPasteParams } from '../../commands/commands/clipboard.command';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { CustomCommandExecutionError, Disposable, DisposableCollection, FOCUSING_EDITOR_STANDALONE, ICommandService, IContextService, Inject, IPermissionService, isICellData, IUniverInstanceService, LocaleService, ObjectMatrix, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import { IMEInputCommand, InsertCommand } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, deserializeRangeWithSheetWithCache, IDefinedNamesService, LexerTreeBuilder, operatorToken, sequenceNodeType } from '@univerjs/engine-formula';
import { UnitAction } from '@univerjs/protocol';
import { ClearSelectionContentCommand, DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, DeltaColumnWidthCommand, DeltaRowHeightCommand, getSheetCommandTarget, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, MoveColsCommand, MoveRangeCommand, MoveRowsCommand, RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint, RangeProtectionRuleModel, SetBackgroundColorCommand, SetColWidthCommand, SetRangeValuesCommand, SetRowHeightCommand, SetSelectedColsVisibleCommand, SetSelectedRowsVisibleCommand, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetNameCommand, SetWorksheetNameMutation, SetWorksheetOrderCommand, SetWorksheetRowIsAutoHeightCommand, SetWorksheetShowCommand, SheetsSelectionsService, WorkbookCopyPermission, WorkbookEditablePermission, WorkbookHideSheetPermission, WorkbookManageCollaboratorPermission, WorkbookMoveSheetPermission, WorkbookRenameSheetPermission, WorksheetCopyPermission, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission, WorksheetViewPermission } from '@univerjs/sheets';
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

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

export class SheetPermissionInterceptorBaseController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @IAutoFillService private _autoFillService: IAutoFillService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IContextService private readonly _contextService: IContextService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
    ) {
        super();
        this._initialize();
    }

    public haveNotPermissionHandle(errorMsg: string) {
        const dialogProps = {
            id: UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID,
            title: { title: '' },
            children: {
                label: UNIVER_SHEET_PERMISSION_ALERT_DIALOG,
                errorMsg,
            },
            width: 320,
            destroyOnClose: true,
            onClose: () => this._dialogService.close(UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID),
            className: 'sheet-permission-user-dialog',
        };
        if (this._permissionService.getShowComponents()) {
            this._dialogService.open(dialogProps);
        }
        throw new CustomCommandExecutionError('have not permission');
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
                permission = this.permissionCheckWithoutRange({
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
                permission = this.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.editErr');
                break;
            case SetRangeValuesCommand.id:
                if (isICellData((params as ISetRangeValuesCommandParams).value) && ((params as ISetRangeValuesCommandParams).value as ICellData).f) {
                    permission = this._permissionCheckWithFormula((params as ISetRangeValuesCommandParams));
                    errorMsg = this._localeService.t('permission.dialog.formulaErr');
                } else {
                    permission = this._permissionCheckBySetRangeValue({
                        workbookTypes: [WorkbookEditablePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                    }, params as ISetRangeValuesCommandParams);
                }

                break;
            case ClearSelectionContentCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.editErr');
                break;
            case SheetPasteColWidthCommand.id:
                permission = this.permissionCheckWithoutRange({
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
                permission = this.permissionCheckWithRanges({
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
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.setStyleErr');
                break;
            case SheetCopyCommand.id:
                permission = this.permissionCheckWithRanges({
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
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookCopyPermission, WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint, RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetCopyPermission, WorksheetEditPermission],
                });
                errorMsg = this._localeService.t('permission.dialog.copyErr');
                if (!this._permissionService.getPermissionPoint(new WorkbookCopyPermission(this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId()).id)?.value) {
                    errorMsg = this._localeService.t('permission.dialog.workbookCopyErr');
                }
                break;
            case DeltaColumnWidthCommand.id:
            case SetColWidthCommand.id:
                permission = this.permissionCheckWithoutRange({
                    worksheetTypes: [WorksheetSetColumnStylePermission],
                });
                errorMsg = this._localeService.t('permission.dialog.setRowColStyleErr');
                break;

            case DeltaRowHeightCommand.id:
            case SetRowHeightCommand.id:
            case SetWorksheetRowIsAutoHeightCommand.id:
                permission = this.permissionCheckWithoutRange({
                    worksheetTypes: [WorksheetSetRowStylePermission],
                });
                errorMsg = this._localeService.t('permission.dialog.setRowColStyleErr');
                break;
            case MoveColsCommand.id:
            case MoveRowsCommand.id:
                permission = this._permissionCheckByMoveCommand(params as IMoveColsCommandParams);
                errorMsg = this._localeService.t('permission.dialog.moveRowColErr');
                break;

            case MoveRangeCommand.id:
                permission = this._permissionCheckByMoveRangeCommand(params as IMoveRangeCommandParams);
                errorMsg = this._localeService.t('permission.dialog.moveRangeErr');
                break;

            case AutoFillCommand.id:
                permission = this._permissionCheckByAutoFillCommand(params as IAutoFillCommandParams);
                errorMsg = this._localeService.t('permission.dialog.autoFillErr');
                break;

            case SetWorksheetOrderCommand.id:
                permission = this._permissionCheckByWorksheetCommand([WorkbookEditablePermission, WorkbookMoveSheetPermission]);
                errorMsg = this._localeService.t('permission.dialog.operatorSheetErr');
                if (permission === false) {
                    this._worksheetProtectionRuleModel.resetOrder();
                }
                break;
            case SetWorksheetNameCommand.id:
                permission = this._permissionCheckByWorksheetCommand([WorkbookEditablePermission, WorkbookRenameSheetPermission]);
                errorMsg = this._localeService.t('permission.dialog.operatorSheetErr');
                if (permission === false) {
                    this._worksheetProtectionRuleModel.resetOrder();
                }
                break;
            case SetWorksheetShowCommand.id:
                {
                    const { unitId, subUnitId } = params as ISetWorksheetShowCommandParams;
                    permission = this._permissionCheckByWorksheetCommand([WorkbookEditablePermission, WorkbookHideSheetPermission], unitId, subUnitId);
                    errorMsg = this._localeService.t('permission.dialog.operatorSheetErr');
                    if (permission === false) {
                        this._worksheetProtectionRuleModel.resetOrder();
                    }
                }
                break;

            case SetSpecificColsVisibleCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                }, (params as ISetSpecificColsVisibleCommandParams).ranges);
                errorMsg = this._localeService.t('permission.dialog.setRowColStyleErr');
                break;
            case SetSpecificRowsVisibleCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
                }, (params as ISetSpecificRowsVisibleCommandParams).ranges);
                errorMsg = this._localeService.t('permission.dialog.setRowColStyleErr');
                break;
            case SetSelectedColsVisibleCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                });
                errorMsg = this._localeService.t('permission.dialog.setRowColStyleErr');
                break;
            case SetSelectedRowsVisibleCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
                });
                errorMsg = this._localeService.t('permission.dialog.setRowColStyleErr');
                break;

            case InsertRangeMoveRightCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('right');
                errorMsg = this._localeService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case InsertRangeMoveDownCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('bottom');
                errorMsg = this._localeService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case DeleteRangeMoveLeftCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('left');
                errorMsg = this._localeService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case DeleteRangeMoveUpCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('top');
                errorMsg = this._localeService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;

            default:
                break;
        }

        if (!permission) {
            this.haveNotPermissionHandle(errorMsg);
        }
    };

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        // @ybzky todo If encounter problems with multiple instances later, you need to increase the unitId in command params.
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                this._getPermissionCheck(command.id, command?.params as ICheckPermissionCommandParams);
            })
        );
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetNameMutation.id) {
                    const params = command.params as ISetWorksheetNameMutationParams;
                    const { unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId(), subUnitId } = params;
                    if (!unitId || !subUnitId) {
                        return;
                    }
                    const worksheetRule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                    const selectionRuleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                    if (worksheetRule) {
                        this._worksheetProtectionRuleModel.ruleRefresh(worksheetRule.permissionId);
                    }
                    if (selectionRuleList.length) {
                        this._rangeProtectionRuleModel.ruleRefresh(subUnitId);
                    }
                }
            })
        );
    }

    private _permissionCheckWithInsertRangeMove(direction: 'top' | 'bottom' | 'left' | 'right') {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;
        const selectionRange = Tools.deepClone(this._selectionManagerService.getCurrentLastSelection()?.range) as IRange | undefined;
        if (!selectionRange) {
            return false;
        };
        if (direction === 'top' || direction === 'bottom') {
            // selectionRange.startRow = 0;
            selectionRange.endRow = worksheet.getRowCount() - 1;
        } else if (direction === 'left' || direction === 'right') {
            // selectionRange.startColumn = 0;
            selectionRange.endColumn = worksheet.getColumnCount() - 1;
        }
        // } else if (direction === 'right') {
        //     selectionRange.endColumn = worksheet.getColumnCount() - 1;
        // } else if (direction === 'bottom') {
        //     selectionRange.endRow = worksheet.getRowCount() - 1;
        // }

        const selectionRuleRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).map((rule) => rule.ranges).flat();
        const hasLap = selectionRuleRanges.some((range) => {
            return Rectangle.getIntersects(selectionRange, range);
        });
        if (hasLap) {
            return false;
        }
        return true;
    }

    private _permissionCheckByWorksheetCommand(types: WorkbookPermissionPointConstructor[], targetUnitId?: string, targetSubUnitId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, { unitId: targetUnitId, subUnitId: targetSubUnitId });
        if (!target) {
            return false;
        }
        const { unitId, subUnitId } = target;
        const worksheetRule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
        const selectionRule = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;
        if (worksheetRule || selectionRule) {
            return this._permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;
        } else {
            return this._permissionService.composePermission(types.map((F) => new F(unitId).id)).every((permission) => permission.value);
        }
    }

    public permissionCheckWithoutRange(permissionTypes: IPermissionTypes) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;
        const selection = this._selectionManagerService.getCurrentLastSelection();
        if (!selection) {
            return true;
        }
        const row = selection?.primary?.actualRow ?? 0;
        const col = selection?.primary?.actualColumn ?? 0;
        const { workbookTypes, worksheetTypes, rangeTypes } = permissionTypes;
        if (workbookTypes) {
            const workbookDisable = workbookTypes.some((F) => {
                const instance = new F(unitId);
                const permission = this._permissionService.getPermissionPoint(instance.id)?.value ?? false;
                return permission === false;
            });
            if (workbookDisable === true) {
                return false;
            }
        }
        if (worksheetTypes) {
            const worksheetDisable = worksheetTypes.some((F) => {
                const instance = new F(unitId, subUnitId);
                const permission = this._permissionService.getPermissionPoint(instance.id)?.value ?? false;
                return permission === false;
            });
            if (worksheetDisable === true) {
                return false;
            }
        }
        if (rangeTypes) {
            const rangeDisable = rangeTypes.some((F) => {
                const cellInfo = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                if (!cellInfo?.ruleId) {
                    return false;
                }
                const permissionId = this._rangeProtectionRuleModel.getRule(unitId, subUnitId, cellInfo.ruleId)?.permissionId;
                if (!permissionId) {
                    return false;
                }
                const instance = new F(unitId, subUnitId, permissionId);
                const permission = this._permissionService.getPermissionPoint(instance.id)?.value ?? false;
                return permission === false;
            });
            if (rangeDisable === true) {
                return false;
            }
        }
        return true;
    }

    public permissionCheckWithRanges(permissionTypes: IPermissionTypes, selectionRanges?: IRange[], unitId?: string, subUnitId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { workbook, worksheet } = target;
        if (!unitId) {
            unitId = workbook.getUnitId();
        }
        if (!subUnitId) {
            subUnitId = worksheet.getSheetId();
        }
        const ranges = selectionRanges ?? this._selectionManagerService.getCurrentSelections()?.map((selection) => {
            return selection.range;
        });

        if (!ranges) {
            return false;
        }

        const { workbookTypes, worksheetTypes, rangeTypes } = permissionTypes;
        const permissionIds = [];
        if (workbookTypes) {
            permissionIds.push(...workbookTypes.map((F) => new F(unitId).id));
        }
        if (worksheetTypes) {
            permissionIds.push(...worksheetTypes.map((F) => new F(unitId, subUnitId).id));
        }
        if (rangeTypes) {
            this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).forEach((rule) => {
                const overlap = ranges.some((range) => {
                    return rule.ranges.some((r) => {
                        return Rectangle.intersects(r, range);
                    });
                });
                if (overlap) {
                    permissionIds.push(...rangeTypes.map((F) => new F(unitId, subUnitId, rule.permissionId).id));
                }
            });
        }

        if (permissionIds.length) {
            return this._permissionService.composePermission(permissionIds).every((permission) => permission.value);
        }

        return true;
    }

    private _permissionCheckByPaste(params: ISheetPasteParams) {
        if (params.value === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE || params.value === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA) {
            return this.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        } else if (params.value === PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT) {
            return this.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        } else {
            return this.permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        }
    }

    private _permissionCheckByMoveCommand(params: IMoveRowsCommandParams | IMoveColsCommandParams) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;
        const toRange = params.toRange;
        if (toRange.endRow === worksheet.getRowCount() - 1) {
            toRange.endColumn = toRange.startColumn;
        } else {
            toRange.endRow = toRange.startRow;
        }
        const permissionLapRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
            return [...p, ...c.ranges];
        }, [] as IRange[]).filter((range) => {
            return Rectangle.intersects(range, toRange);
        });

        if (permissionLapRanges.length > 0) {
            return false;
        }
        permissionLapRanges.forEach((range) => {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startColumn; col <= range.endColumn; col++) {
                    const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                    if (permission?.[UnitAction.Edit] === false) {
                        return false;
                    }
                }
            }
        });
        return true;
    }

    private _permissionCheckByAutoFillCommand(params?: { targetRange: IRange }) {
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

    private _permissionCheckByMoveRangeCommand(params: IMoveRangeCommandParams) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;
        const toRange = params.toRange;
        const permissionLapRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
            return [...p, ...c.ranges];
        }, [] as IRange[]).filter((range) => {
            return Rectangle.intersects(range, toRange);
        });

        if (permissionLapRanges.length > 0) {
            return false;
        }
        permissionLapRanges.forEach((range) => {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startColumn; col <= range.endColumn; col++) {
                    const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                    if (permission?.[UnitAction.Edit] === false) {
                        return false;
                    }
                }
            }
        });
        return true;
    }

    private _permissionCheckBySetRangeValue(permissionTypes: IPermissionTypes, setRangeValueParams: ISetRangeValuesCommandParams) {
        let ranges: IRange[] = [];
        if (setRangeValueParams.range) {
            ranges = [setRangeValueParams.range];
        } else {
            const matrix = new ObjectMatrix(setRangeValueParams.value as IObjectMatrixPrimitiveType<ICellData>);
            const range = matrix.getDataRange();
            ranges = [range];
        }
        const { unitId, subUnitId } = setRangeValueParams;
        return this.permissionCheckWithRanges(permissionTypes, ranges, unitId, subUnitId);
    }

    private _permissionCheckWithFormula(params: ISetRangeValuesCommandParams) {
        const value = params.value as ICellData;
        const range = params.range;
        const formulaString = value.f;
        if (formulaString) {
            const definedNameStr = formulaString.substring(1);
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const unitId = params.unitId ?? workbook.getUnitId();
            const definedName = this._definedNamesService.getValueByName(unitId, definedNameStr);
            if (definedName) {
                let formulaOrRefString = definedName.formulaOrRefString;
                if (formulaOrRefString.startsWith(operatorToken.EQUALS)) {
                    formulaOrRefString = formulaOrRefString.slice(1);
                }
                const refRangesArr = formulaOrRefString.split(',');
                for (let i = 0; i < refRangesArr.length; i++) {
                    const refRange = refRangesArr[i];
                    const sequenceGrid = deserializeRangeWithSheet(refRange);
                    if (sequenceGrid.sheetName) {
                        const targetSheet = workbook.getSheetBySheetName(sequenceGrid.sheetName);
                        if (!targetSheet) {
                            // Formula errors need to be handled by the formula system, and permissions will not be blocked
                            return true;
                        }
                        const { startRow, endRow, startColumn, endColumn } = sequenceGrid.range;
                        for (let i = startRow; i <= endRow; i++) {
                            for (let j = startColumn; j <= endColumn; j++) {
                                const permission = (targetSheet.getCell(i, j) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                if (permission?.[UnitAction.View] === false) {
                                    return false;
                                }
                            }
                        }
                    }
                }
                return true;
            } else {
                const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaString);
                if (!sequenceNodes) {
                    return true;
                }
                for (let i = 0; i < sequenceNodes.length; i++) {
                    const node = sequenceNodes[i];
                    if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                        continue;
                    }
                    const { token } = node;
                    const sequenceGrid = deserializeRangeWithSheetWithCache(token);
                    const workbook = sequenceGrid.unitId ? this._univerInstanceService.getUnit<Workbook>(sequenceGrid.unitId) : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (!workbook) return true;
                    let targetSheet: Nullable<Worksheet> = sequenceGrid.sheetName ? workbook.getSheetBySheetName(sequenceGrid.sheetName) : workbook.getActiveSheet();
                    const unitId = workbook.getUnitId();
                    if (sequenceGrid.sheetName) {
                        targetSheet = workbook.getSheetBySheetName(sequenceGrid.sheetName);
                        if (!targetSheet) {
                            return true;
                        }
                        const subUnitId = targetSheet?.getSheetId();
                        const viewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id);
                        if (!viewPermission) return false;
                    }
                    if (!targetSheet) {
                        return true;
                    }
                    const { startRow, endRow, startColumn, endColumn } = sequenceGrid.range;
                    for (let i = startRow; i <= endRow; i++) {
                        for (let j = startColumn; j <= endColumn; j++) {
                            const permission = (targetSheet.getCell(i, j) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.View] === false) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
        }
        if (range) {
            const target = getSheetCommandTarget(this._univerInstanceService);
            if (!target) {
                return false;
            }
            const unitId = params.unitId || target.unitId;
            const subunitId = params.subUnitId || target.subUnitId;
            const permissionList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subunitId).filter((rule) => {
                return rule.ranges.some((ruleRange) => {
                    return Rectangle.intersects(ruleRange, range);
                });
            });
            const permissionIds = permissionList.map((rule) => new RangeProtectionPermissionEditPoint(unitId, subunitId, rule.permissionId).id);
            const editPermission = this._permissionService.composePermission(permissionIds).every((permission) => permission.value);
            if (!editPermission) {
                return false;
            }
        }
        return true;
    }
}
