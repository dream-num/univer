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
import { DisposableCollection, FOCUSING_EDITOR_STANDALONE, ICommandService, IContextService, IPermissionService, isICellData, IUniverInstanceService, LifecycleStages, LocaleService, ObjectMatrix, OnLifecycle, Rectangle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import type { IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, ISetRangeValuesCommandParams, ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams, ISetWorksheetNameMutationParams } from '@univerjs/sheets';
import { ClearSelectionContentCommand, DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, DeltaColumnWidthCommand, DeltaRowHeightCommand, getSheetCommandTarget, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, MoveColsCommand, MoveRangeCommand, MoveRowsCommand, RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint, RangeProtectionRuleModel, SelectionManagerService, SetBackgroundColorCommand, SetColWidthCommand, SetRangeValuesCommand, SetRowHeightCommand, SetSelectedColsVisibleCommand, SetSelectedRowsVisibleCommand, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetNameCommand, SetWorksheetNameMutation, SetWorksheetOrderCommand, SetWorksheetRowIsAutoHeightCommand, SetWorksheetShowCommand, WorkbookCopyPermission, WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetCopyPermission, WorksheetEditPermission, WorksheetFilterPermission, WorksheetProtectionRuleModel, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission, WorksheetViewPermission } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { IDialogService } from '@univerjs/ui';
import { filter, first } from 'rxjs/operators';
import type { IRenderContext, IRenderController, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetPasteParams } from '@univerjs/sheets-ui';
import { ApplyFormatPainterCommand, AutoFillCommand, FormulaEditorController, HeaderMoveRenderController, HeaderResizeRenderController, IAutoFillService, ISelectionRenderService, ISheetClipboardService, SetCellEditVisibleOperation, SetRangeBoldCommand, SetRangeItalicCommand, SetRangeStrickThroughCommand, SetRangeUnderlineCommand, SheetCopyCommand, SheetCutCommand, SheetPasteColWidthCommand, SheetPasteShortKeyCommand, StatusBarController, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { IOpenFilterPanelOperationParams } from '@univerjs/sheets-filter-ui';
import { OpenFilterPanelOperation, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter-ui';
import { SheetsFindReplaceController } from '@univerjs/sheets-find-replace';
import { InsertCommand } from '@univerjs/docs';
import type { IUpdateSheetDataValidationRangeCommandParams } from '@univerjs/sheets-data-validation';
import { AddSheetDataValidationCommand, DataValidationController, DataValidationFormulaController, UpdateSheetDataValidationRangeCommand } from '@univerjs/sheets-data-validation';
import type { IAddCfCommandParams } from '@univerjs/sheets-conditional-formatting-ui';
import { AddCfCommand, ConditionalFormattingClearController } from '@univerjs/sheets-conditional-formatting-ui';
import type { IConditionalFormattingRuleConfig, IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { HeaderFreezeRenderController } from '@univerjs/sheets-ui/controllers/render-controllers/freeze.render-controller.js';
import { UnitAction } from '@univerjs/protocol';
import { deserializeRangeWithSheet, LexerTreeBuilder, NullValueObject } from '@univerjs/engine-formula';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG, UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID } from '../views/error-msg-dialog/interface';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };
type ICheckPermissionCommandParams = IMoveRowsCommandParams | IMoveColsCommandParams | IMoveRangeCommandParams | ISetRangeValuesCommandParams | ISheetPasteParams | ISetSpecificRowsVisibleCommandParams | IUpdateSheetDataValidationRangeCommandParams | IAddCfCommandParams | IOpenFilterPanelOperationParams;

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorRenderController)
export class SheetPermissionInterceptorRenderController extends RxDisposable implements IRenderController {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(HeaderMoveRenderController) private _headerMoveRenderController: HeaderMoveRenderController,
        @Inject(HeaderResizeRenderController) private _headerResizeRenderController: HeaderResizeRenderController,
        @ISelectionRenderService private _selectionRenderService: ISelectionRenderService,
        @IAutoFillService private _autoFillService: IAutoFillService,
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @Inject(SheetsFindReplaceController) private _sheetsFindReplaceController: SheetsFindReplaceController,
        @Inject(LocaleService) private readonly _localService: LocaleService,
        @Inject(DataValidationController) private readonly _dataValidationController: DataValidationController,
        @Inject(ConditionalFormattingClearController) private readonly _conditionalFormattingClearController: ConditionalFormattingClearController,
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(HeaderFreezeRenderController) private _headerFreezeRenderController: HeaderFreezeRenderController,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IContextService private readonly _contextService: IContextService,
        @Inject(StatusBarController) private readonly _statusBarController: StatusBarController,
        @Inject(DataValidationFormulaController) private readonly _dataValidationFormulaController: DataValidationFormulaController
    ) {
        super();
        this._initialize();
        this._initHeaderMovePermissionInterceptor();
        this._initHeaderResizePermissionInterceptor();
        this._initRangeFillPermissionInterceptor();
        this._initRangeMovePermissionInterceptor();
        this._initSheetFindPermissionInterceptor();
        this._initDataValidationPermissionInterceptor();
        this._initConditionalFormattingPermissionInterceptor();
        this._initFreezePermissionInterceptor();
        this._initFormulaEditorPermissionInterceptor();
        this._initStatusBarPermissionInterceptor();
        this._initDvFormulaPermissionInterceptor();
        this._initClipboardHook();
    }

    private _haveNotPermissionHandle(errorMsg: string) {
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
            this._haveNotPermissionHandle(errorMsg);
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

    private _initHeaderMovePermissionInterceptor() {
        this._headerMoveRenderController.interceptor.intercept(this._headerMoveRenderController.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK, {
            handler: (defaultValue: Nullable<boolean>, selectionRange: IRange) => {
                const target = getSheetCommandTarget(this._univerInstanceService);
                if (!target) {
                    return false;
                }
                const { worksheet, unitId, subUnitId } = target;

                const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                if (!workSheetEditPermission) {
                    return false;
                }

                if (!selectionRange) {
                    return true;
                }

                const protectionLapRange = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                    return [...p, ...c.ranges];
                }, [] as IRange[]).filter((range) => {
                    return Rectangle.intersects(range, selectionRange);
                });

                const haveNotPermission = protectionLapRange.some((range) => {
                    const { startRow, startColumn, endRow, endColumn } = range;
                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startColumn; col <= endColumn; col++) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false) {
                                return true;
                            }
                        }
                    }
                    return false;
                });

                return !haveNotPermission;
            },
        });
    }

    private _initHeaderResizePermissionInterceptor() {
        this._headerResizeRenderController.interceptor.intercept(this._headerResizeRenderController.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
            handler: (defaultValue: Nullable<boolean>, rangeParams: { row?: number; col?: number }) => {
                const target = getSheetCommandTarget(this._univerInstanceService);
                if (!target) {
                    return false;
                }
                const { worksheet, unitId, subUnitId } = target;

                const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                if (!workSheetEditPermission) {
                    return false;
                }

                if (rangeParams.row) {
                    const setRowStylePermission = this._permissionService.getPermissionPoint(new WorksheetSetRowStylePermission(unitId, subUnitId).id)?.value ?? false;
                    if (setRowStylePermission === false) {
                        return false;
                    }
                } else if (rangeParams.col) {
                    const setColStylePermission = this._permissionService.getPermissionPoint(new WorksheetSetColumnStylePermission(unitId, subUnitId).id)?.value ?? false;
                    if (setColStylePermission === false) {
                        return false;
                    }
                }

                let selectionRange: Nullable<IRange>;

                if (rangeParams.row !== undefined) {
                    selectionRange = {
                        startRow: rangeParams.row,
                        endRow: rangeParams.row,
                        startColumn: 0,
                        endColumn: worksheet.getColumnCount() - 1,
                    };
                } else if (rangeParams.col !== undefined) {
                    selectionRange = {
                        startRow: 0,
                        endRow: worksheet.getRowCount() - 1,
                        startColumn: rangeParams.col,
                        endColumn: rangeParams.col,
                    };
                }

                if (!selectionRange) {
                    return true;
                }

                const protectionLapRange = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                    return [...p, ...c.ranges];
                }, [] as IRange[]).filter((range) => {
                    return Rectangle.intersects(range, selectionRange);
                });

                const haveNotPermission = protectionLapRange.some((range) => {
                    const { startRow, startColumn, endRow, endColumn } = range;
                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startColumn; col <= endColumn; col++) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false) {
                                return true;
                            }
                        }
                    }
                    return false;
                });

                return !haveNotPermission;
            },
        });
    }

    private _initRangeFillPermissionInterceptor() {
        this._selectionRenderService.interceptor.intercept(this._selectionRenderService.interceptor.getInterceptPoints().RANGE_FILL_PERMISSION_CHECK, {
            handler: (_: Nullable<boolean>, position: { x: number; y: number; skeleton: SpreadsheetSkeleton }) => {
                const target = getSheetCommandTarget(this._univerInstanceService);
                if (!target) {
                    return false;
                }
                const { worksheet, unitId, subUnitId } = target;

                const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                if (!workSheetEditPermission) {
                    return false;
                }

                const ranges = this._selectionManagerService.getSelections()?.map((selection) => {
                    return selection.range;
                });

                const selectionRange = ranges?.find((range) => {
                    const cellPosition = position.skeleton.getCellByIndex(range.endRow, range.endColumn);
                    const missX = Math.abs(cellPosition.endX - position.x);
                    const missY = Math.abs(cellPosition.endY - position.y);
                    return missX <= 5 && missY <= 5;
                });

                if (!selectionRange) {
                    return true;
                }

                const { startRow, endRow, startColumn, endColumn } = selectionRange;

                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false || permission?.[UnitAction.View] === false) {
                            return false;
                        }
                    }
                }
                return true;
            },
        });
    }

    private _initRangeMovePermissionInterceptor() {
        this._selectionRenderService.interceptor.intercept(this._selectionRenderService.interceptor.getInterceptPoints().RANGE_MOVE_PERMISSION_CHECK, {
            handler: (_: Nullable<boolean>, _cellInfo: null) => {
                const target = getSheetCommandTarget(this._univerInstanceService);
                if (!target) {
                    return false;
                }
                const { worksheet, unitId, subUnitId } = target;

                const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                if (!workSheetEditPermission) {
                    return false;
                }

                const ranges = this._selectionManagerService.getSelections()?.map((selection) => {
                    return selection.range;
                });

                const ruleRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                    return [...p, ...c.ranges];
                }, [] as IRange[]);

                const permissionLapRanges = ranges?.filter((range) => {
                    return ruleRanges.some((ruleRange) => {
                        return Rectangle.intersects(ruleRange, range);
                    });
                });

                const haveNotPermission = permissionLapRanges?.some((range) => {
                    const { startRow, startColumn, endRow, endColumn } = range;
                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startColumn; col <= endColumn; col++) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false) {
                                return true;
                            }
                        }
                    }
                    return false;
                });

                return !haveNotPermission;
            },
        });
    }

    private _initSheetFindPermissionInterceptor() {
        this._sheetsFindReplaceController.interceptor.intercept(this._sheetsFindReplaceController.interceptor.getInterceptPoints().FIND_PERMISSION_CHECK, {
            handler: (_: Nullable<boolean>, _cellInfo: { row: number; col: number; unitId: string; subUnitId: string }) => {
                const { row, col, subUnitId } = _cellInfo;
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return false;
                }
                const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                return permission?.[UnitAction.View] !== false;
            },
        });
    }

    private _initDataValidationPermissionInterceptor() {
        this._dataValidationController.interceptor.intercept(this._dataValidationController.interceptor.getInterceptPoints().DATA_VALIDATION_PERMISSION_CHECK, {
            handler: (_: Nullable<(ISheetDataValidationRule & { disable?: boolean })[]>, rules: ISheetDataValidationRule[]) => {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getActiveSheet();
                const rulesByPermissionCheck = rules.map((rule) => {
                    const { ranges } = rule;
                    const haveNotPermission = ranges?.some((range) => {
                        const { startRow, startColumn, endRow, endColumn } = range;
                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startColumn; col <= endColumn; col++) {
                                const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                if (permission?.[UnitAction.Edit] === false || permission?.[UnitAction.View] === false) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                    if (haveNotPermission) {
                        return { ...rule, disable: true };
                    } else {
                        return { ...rule };
                    }
                });
                return rulesByPermissionCheck;
            },
        });
    }

    private _initConditionalFormattingPermissionInterceptor() {
        this._conditionalFormattingClearController.interceptor.intercept(this._conditionalFormattingClearController.interceptor.getInterceptPoints().CONDITIONAL_FORMATTING_PERMISSION_CHECK, {
            handler: (_: Nullable<(IConditionFormattingRule<IConditionalFormattingRuleConfig> & { disable?: boolean })[]>, rules: ((IConditionFormattingRule<IConditionalFormattingRuleConfig> & { disable?: boolean }))[]) => {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getActiveSheet();
                const rulesByPermissionCheck = rules.map((rule) => {
                    const ranges = rule.ranges;
                    const haveNotPermission = ranges?.some((range) => {
                        const { startRow, startColumn, endRow, endColumn } = range;
                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startColumn; col <= endColumn; col++) {
                                const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                if (permission?.[UnitAction.Edit] === false || permission?.[UnitAction.View] === false) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                    if (haveNotPermission) {
                        return { ...rule, disable: true };
                    } else {
                        return { ...rule };
                    }
                });
                return rulesByPermissionCheck;
            },
        });
    }

    private _initStatusBarPermissionInterceptor() {
        this.disposeWithMe(
            this._statusBarController.interceptor.intercept(this._statusBarController.interceptor.getInterceptPoints().STATUS_BAR_PERMISSION_CORRECT, {
                priority: 100,
                handler: (defaultValue, originValue) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return defaultValue ?? [];
                    }
                    const { worksheet } = target;
                    originValue.forEach((item) => {
                        const itemValue = item.getArrayValue();
                        const startRow = item.getCurrentRow();
                        const startCol = item.getCurrentColumn();
                        itemValue.forEach((row, rowIndex) => {
                            row.forEach((col, colIndex) => {
                                const permission = (worksheet.getCell(rowIndex + startRow, colIndex + startCol) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                if (permission?.[UnitAction.View] === false) {
                                    itemValue[rowIndex][colIndex] = NullValueObject.create();
                                }
                            });
                        });
                    });
                    return originValue;
                },
            })
        );
    }

    private _initDvFormulaPermissionInterceptor() {
        this._dataValidationFormulaController.interceptor.intercept(this._dataValidationFormulaController.interceptor.getInterceptPoints().DV_FORMULA_PERMISSION_CHECK, {
            priority: 100,
            handler: (_, formulaString: string) => {
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
                return true;
            },
        });
    }

    private _initFreezePermissionInterceptor() {
        this._headerFreezeRenderController.interceptor.intercept(this._headerFreezeRenderController.interceptor.getInterceptPoints().FREEZE_PERMISSION_CHECK, {
            handler: (_: Nullable<boolean>, __) => {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = workbook.getActiveSheet();
                if (!worksheet) {
                    return false;
                }
                const permission = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(workbook.getUnitId()).id)?.value ?? false;
                return permission;
            },
        });
    }

    private _initFormulaEditorPermissionInterceptor() {
        this._univerInstanceService.unitAdded$.pipe(filter((unitInstance) => unitInstance.type === UniverInstanceType.UNIVER_DOC), first()).subscribe(() => {
            const formulaEditorController = this._injector.get(FormulaEditorController);
            formulaEditorController.interceptor.intercept(formulaEditorController.interceptor.getInterceptPoints().FORMULA_EDIT_PERMISSION_CHECK, {
                handler: (_: Nullable<boolean>, cellInfo: { row: number; col: number }) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { unitId, subUnitId } = target;

                    const worksheetViewPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                    if (!worksheetViewPermission) {
                        return false;
                    }

                    const { row, col } = cellInfo;
                    const permissionList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                        return rule.ranges.some((range) => {
                            return Rectangle.intersects(range, { startRow: row, endRow: row, startColumn: col, endColumn: col });
                        });
                    });

                    const permissionIds = permissionList.map((rule) => new RangeProtectionPermissionViewPoint(unitId, subUnitId, rule.permissionId).id);
                    const rangeViewPermission = this._permissionService.composePermission(permissionIds).every((permission) => permission.value);
                    return rangeViewPermission;
                },
            });
        });
    }

    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                id: SHEET_PERMISSION_PASTE_PLUGIN,
                onBeforePaste: (pasteTo) => {
                    const [ranges] = virtualizeDiscreteRanges([pasteTo.range]).ranges;
                    const startRange = this._selectionManagerService.getLast()?.range;
                    if (!startRange) {
                        return false;
                    }
                    const targetRange = {
                        startRow: startRange.startRow + ranges.startRow,
                        endRow: startRange.startRow + ranges.endRow,
                        startColumn: startRange.startColumn + ranges.startColumn,
                        endColumn: startRange.startColumn + ranges.endColumn,
                    };

                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getActiveSheet();
                    const { startRow, endRow, startColumn, endColumn } = targetRange;

                    let hasPermission = true;

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startColumn; col <= endColumn; col++) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false) {
                                hasPermission = false;
                                break;
                            }
                        }
                    }

                    if (!hasPermission) {
                        this._haveNotPermissionHandle(this._localService.t('permission.dialog.pasteErr'));
                    }

                    return hasPermission;
                },
            })
        );
    }

    private _permissionCheckWithFormula(params: ISetRangeValuesCommandParams) {
        const value = params.value as ICellData;
        const range = params.range;
        const formulaString = value.f;
        if (formulaString) {
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
