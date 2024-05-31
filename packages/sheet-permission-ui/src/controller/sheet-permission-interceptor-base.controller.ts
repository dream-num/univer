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

import type { ICellData, ICellDataForSheetInterceptor, ICommandInfo, IObjectMatrixPrimitiveType, IPermissionTypes, IRange, ISheetDataValidationRule, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { DisposableCollection, FOCUSING_EDITOR_STANDALONE, ICommandService, IContextService, IPermissionService, isICellData, IUniverInstanceService, LifecycleStages, LocaleService, ObjectMatrix, OnLifecycle, Rectangle, Disposable, UniverInstanceType, Tools } from '@univerjs/core';
import type { IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, ISetRangeValuesCommandParams, ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams, ISetWorksheetNameMutationParams } from '@univerjs/sheets';
import { ClearSelectionContentCommand, DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, DeltaColumnWidthCommand, DeltaRowHeightCommand, getSheetCommandTarget, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, MoveColsCommand, MoveRangeCommand, MoveRowsCommand, RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint, RangeProtectionRuleModel, SelectionManagerService, SetBackgroundColorCommand, SetColWidthCommand, SetRangeValuesCommand, SetRowHeightCommand, SetSelectedColsVisibleCommand, SetSelectedRowsVisibleCommand, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetNameCommand, SetWorksheetNameMutation, SetWorksheetOrderCommand, SetWorksheetRowIsAutoHeightCommand, SetWorksheetShowCommand, WorkbookCopyPermission, WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetCopyPermission, WorksheetEditPermission, WorksheetFilterPermission, WorksheetProtectionRuleModel, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission, WorksheetViewPermission } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { IDialogService } from '@univerjs/ui';
import { filter, first } from 'rxjs/operators';
import type { IRenderContext, IRenderController, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetPasteParams } from '@univerjs/sheets-ui';
import { ApplyFormatPainterCommand, AutoFillCommand, IAutoFillService, SetCellEditVisibleOperation, SetRangeBoldCommand, SetRangeItalicCommand, SetRangeStrickThroughCommand, SetRangeUnderlineCommand, SheetCopyCommand, SheetCutCommand, SheetPasteColWidthCommand, SheetPasteShortKeyCommand } from '@univerjs/sheets-ui';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { IOpenFilterPanelOperationParams } from '@univerjs/sheets-filter-ui';
import { OpenFilterPanelOperation, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter-ui';
import { InsertCommand } from '@univerjs/docs';
import type { IUpdateSheetDataValidationRangeCommandParams } from '@univerjs/sheets-data-validation';
import { AddSheetDataValidationCommand, UpdateSheetDataValidationRangeCommand } from '@univerjs/sheets-data-validation';
import type { IAddCfCommandParams } from '@univerjs/sheets-conditional-formatting-ui';
import { AddCfCommand } from '@univerjs/sheets-conditional-formatting-ui';
import { UnitAction } from '@univerjs/protocol';
import { deserializeRangeWithSheet, IDefinedNamesService, LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG, UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID } from '../views/error-msg-dialog/interface';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };
type ICheckPermissionCommandParams = IMoveRowsCommandParams | IMoveColsCommandParams | IMoveRangeCommandParams | ISetRangeValuesCommandParams | ISheetPasteParams | ISetSpecificRowsVisibleCommandParams | IUpdateSheetDataValidationRangeCommandParams | IAddCfCommandParams | IOpenFilterPanelOperationParams;

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorBaseController)
export class SheetPermissionInterceptorBaseController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @IAutoFillService private _autoFillService: IAutoFillService,
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @Inject(LocaleService) private readonly _localService: LocaleService,
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
        this._dialogService.open(dialogProps);
        throw new Error('have not permission');
    }

    private _getPermissionCheck(id: string, params: ICheckPermissionCommandParams) {
        let permission = true;
        let errorMsg = '';

        switch (id) {
            case InsertCommand.id:
            case SetCellEditVisibleOperation.id:
                if (this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) === true) {
                    break;
                }
                permission = this._permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                });
                errorMsg = this._localService.t('permission.dialog.editErr');
                break;
            case SetRangeValuesCommand.id:
                if (isICellData((params as ISetRangeValuesCommandParams).value) && ((params as ISetRangeValuesCommandParams).value as ICellData).f) {
                    permission = this._permissionCheckWithFormula((params as ISetRangeValuesCommandParams));
                    errorMsg = this._localService.t('permission.dialog.formulaErr');
                } else {
                    permission = this._permissionCheckBySetRangeValue({
                        workbookTypes: [WorkbookEditablePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                    }, params as ISetRangeValuesCommandParams);
                }

                break;
            case ClearSelectionContentCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                });
                errorMsg = this._localService.t('permission.dialog.editErr');
                break;
            case SheetPasteColWidthCommand.id:
                permission = this._permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                });
                errorMsg = this._localService.t('permission.dialog.pasteErr');
                break;
            case SheetPasteShortKeyCommand.id:
                permission = this._permissionCheckByPaste(params as ISheetPasteParams);
                errorMsg = this._localService.t('permission.dialog.pasteErr');
                break;
            case ApplyFormatPainterCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission],
                });
                errorMsg = this._localService.t('permission.dialog.commonErr');
                break;
            case SetBackgroundColorCommand.id:
            case SetRangeBoldCommand.id:
            case SetRangeItalicCommand.id:
            case SetRangeUnderlineCommand.id:
            case SetRangeStrickThroughCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                });
                errorMsg = this._localService.t('permission.dialog.setStyleErr');
                break;
            case SheetCopyCommand.id:
            case SheetCutCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookCopyPermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                    worksheetTypes: [WorksheetCopyPermission],
                });
                errorMsg = this._localService.t('permission.dialog.copyErr');
                break;
            case DeltaColumnWidthCommand.id:
            case SetColWidthCommand.id:
                permission = this._permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetRowStylePermission, WorksheetEditPermission],
                });
                errorMsg = this._localService.t('permission.dialog.setRowColStyleErr');
                break;

            case DeltaRowHeightCommand.id:
            case SetRowHeightCommand.id:
            case SetWorksheetRowIsAutoHeightCommand.id:
                permission = this._permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetSetRowStylePermission, WorksheetEditPermission],
                });
                errorMsg = this._localService.t('permission.dialog.setRowColStyleErr');
                break;
            case MoveColsCommand.id:
            case MoveRowsCommand.id:
                permission = this._permissionCheckByMoveCommand(params as IMoveColsCommandParams);
                errorMsg = this._localService.t('permission.dialog.moveRowColErr');
                break;

            case MoveRangeCommand.id:
                permission = this._permissionCheckByMoveRangeCommand(params as IMoveRangeCommandParams);
                errorMsg = this._localService.t('permission.dialog.moveRangeErr');
                break;

            case AutoFillCommand.id:
                permission = this._permissionCheckByAutoFillCommand(this._autoFillService.autoFillLocation?.target);
                errorMsg = this._localService.t('permission.dialog.autoFillErr');
                break;

            case SmartToggleSheetsFilterCommand.id:
                permission = this._permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                    worksheetTypes: [WorksheetFilterPermission, WorksheetEditPermission],
                });
                errorMsg = this._localService.t('permission.dialog.filterErr');
                break;
            case SetWorksheetOrderCommand.id:
            case SetWorksheetNameCommand.id:
            case SetWorksheetShowCommand.id:
                permission = this._permissionCheckByWorksheetCommand();
                errorMsg = this._localService.t('permission.dialog.operatorSheetErr');
                if (permission === false) {
                    this._worksheetProtectionRuleModel.resetOrder();
                }
                break;
            case OpenFilterPanelOperation.id:
                permission = this._permissionCheckWithFilter(params as IOpenFilterPanelOperationParams);
                errorMsg = this._localService.t('permission.dialog.filterErr');
                break;

            case SetSpecificColsVisibleCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                }, (params as ISetSpecificColsVisibleCommandParams).ranges);
                errorMsg = this._localService.t('permission.dialog.setRowColStyleErr');
                break;
            case SetSpecificRowsVisibleCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
                }, (params as ISetSpecificRowsVisibleCommandParams).ranges);
                errorMsg = this._localService.t('permission.dialog.setRowColStyleErr');
                break;
            case SetSelectedColsVisibleCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                });
                errorMsg = this._localService.t('permission.dialog.setRowColStyleErr');
                break;
            case SetSelectedRowsVisibleCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
                });
                errorMsg = this._localService.t('permission.dialog.setRowColStyleErr');
                break;

            case AddSheetDataValidationCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                });
                errorMsg = this._localService.t('permission.dialog.setStyleErr');
                break;
            case UpdateSheetDataValidationRangeCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                }, (params as IUpdateSheetDataValidationRangeCommandParams).ranges);
                errorMsg = this._localService.t('permission.dialog.setStyleErr');
                break;

            case AddCfCommand.id:
                permission = this._permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                }, (params as IAddCfCommandParams).rule.ranges);
                errorMsg = this._localService.t('permission.dialog.setStyleErr');
                break;

            case InsertRangeMoveRightCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('right');
                errorMsg = this._localService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case InsertRangeMoveDownCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('bottom');
                errorMsg = this._localService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case DeleteRangeMoveLeftCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('left');
                errorMsg = this._localService.t('permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case DeleteRangeMoveUpCommand.id:
                permission = this._permissionCheckWithInsertRangeMove('top');
                errorMsg = this._localService.t('permission.dialog.insertOrDeleteMoveRangeErr');
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
        const selectionRange = this._selectionManagerService.getLast()?.range;
        if (!selectionRange) {
            return false;
        };
        if (direction === 'top') {
            selectionRange.startRow = 0;
        } else if (direction === 'left') {
            selectionRange.startColumn = 0;
        } else if (direction === 'right') {
            selectionRange.endColumn = worksheet.getColumnCount() - 1;
        } else if (direction === 'bottom') {
            selectionRange.endRow = worksheet.getRowCount() - 1;
        }

        const selectionRuleRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).map((rule) => rule.ranges).flat();
        const hasLap = selectionRuleRanges.some((range) => {
            return Rectangle.getIntersects(selectionRange, range);
        });
        if (hasLap) {
            return false;
        }
        return true;
    }

    private _permissionCheckWithFilter(params: IOpenFilterPanelOperationParams) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { unitId, subUnitId } = target;
        const filterRange = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
        const colRange = Tools.deepClone(filterRange);
        if (colRange) {
            colRange.startColumn = params.col;
            colRange.endColumn = params.col;
            return this._permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionViewPoint],
                worksheetTypes: [WorksheetFilterPermission, WorksheetEditPermission],
            }, [colRange]);
        }
        return true;
    }

    private _permissionCheckByWorksheetCommand() {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { unitId, subUnitId } = target;
        const worksheetRule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
        const selectionRule = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;
        if (worksheetRule || selectionRule) {
            return this._permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;
        } else {
            return this._permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value ?? false;
        }
    }

    private _permissionCheckWithoutRange(permissionTypes: IPermissionTypes) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;
        const selection = this._selectionManagerService.getLast();
        if (!selection) {
            return true;
        }
        const row = selection?.primary?.actualRow ?? 0;
        const col = selection?.primary?.actualColumn ?? 0;
        const { workbookTypes = [WorkbookEditablePermission], worksheetTypes, rangeTypes } = permissionTypes;
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

    private _permissionCheckWithRanges(permissionTypes: IPermissionTypes, selectionRanges?: IRange[], unitId?: string, subUnitId?: string) {
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
        const ranges = selectionRanges ?? this._selectionManagerService.getSelections()?.map((selection) => {
            return selection.range;
        });

        if (!ranges) {
            return false;
        }

        const { workbookTypes = [WorkbookEditablePermission], worksheetTypes, rangeTypes } = permissionTypes;
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
            const hasPermission = ranges?.every((range) => {
                return rangeTypes.every((F) => {
                    for (let row = range.startRow; row <= range.endRow; row++) {
                        for (let col = range.startColumn; col <= range.endColumn; col++) {
                            const cellInfo = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (!cellInfo?.ruleId) {
                                continue;
                            }
                            const permissionId = this._rangeProtectionRuleModel.getRule(unitId, subUnitId, cellInfo.ruleId)?.permissionId;
                            if (!permissionId) {
                                continue;
                            }
                            const instance = new F(unitId, subUnitId, permissionId);
                            const permission = this._permissionService.getPermissionPoint(instance.id)?.value ?? false;
                            if (permission === false) {
                                return false;
                            }
                        }
                    }
                    return true;
                });
            });
            return hasPermission;
        }

        return true;
    }

    private _permissionCheckByPaste(params: ISheetPasteParams) {
        if (params.value === 'special-paste-value' || params.value === 'special-paste-formula') {
            return this._permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        } else if (params.value === 'special-paste-format') {
            return this._permissionCheckWithRanges({
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            });
        } else {
            return this._permissionCheckWithRanges({
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

    private _permissionCheckByAutoFillCommand(params?: { rows: number[]; cols: number[] }) {
        if (!params) {
            return false;
        }
        const { rows, cols } = params;
        const startRow = rows[0];
        const endRow = rows[rows.length - 1];
        const startCol = cols[0];
        const endCol = cols[cols.length - 1];

        const targetRange = { startRow, endRow, startColumn: startCol, endColumn: endCol };

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
        return this._permissionCheckWithRanges(permissionTypes, ranges, unitId, subUnitId);
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
                            return false;
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
                    if (typeof node === 'string') {
                        continue;
                    }
                    const { token } = node;
                    const sequenceGrid = deserializeRangeWithSheet(token);
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    let targetSheet: Nullable<Worksheet> = workbook.getActiveSheet();
                    const unitId = workbook.getUnitId();
                    if (sequenceGrid.sheetName) {
                        targetSheet = workbook.getSheetBySheetName(sequenceGrid.sheetName);
                        if (!targetSheet) {
                            return false;
                        }
                        const subUnitId = targetSheet?.getSheetId();
                        const viewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id);
                        if (!viewPermission) return false;
                    }
                    if (!targetSheet) {
                        return false;
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
