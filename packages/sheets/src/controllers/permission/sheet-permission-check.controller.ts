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

import type {
    ICellData,
    ICellDataForSheetInterceptor,
    ICommandInfo,
    IObjectMatrixPrimitiveType,
    IPermissionTypes,
    IRange,
    Nullable,
    Workbook,
    WorkbookPermissionPointConstructor,
} from '@univerjs/core';
import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { IAutoFillCommandParams } from '../../commands/commands/auto-fill.command';
import type { IClearSelectionAllCommandParams } from '../../commands/commands/clear-selection-all.command';
import type { IClearSelectionContentCommandParams } from '../../commands/commands/clear-selection-content.command';
import type { IClearSelectionFormatCommandParams } from '../../commands/commands/clear-selection-format.command';
import type { IDeleteRangeMoveLeftCommandParams } from '../../commands/commands/delete-range-move-left.command';
import type { IDeleteRangeMoveUpCommandParams } from '../../commands/commands/delete-range-move-up.command';
import type { IInsertRangeMoveDownCommandParams } from '../../commands/commands/insert-range-move-down.command';
import type { IInsertRangeMoveRightCommandParams } from '../../commands/commands/insert-range-move-right.command';
import type { IInsertColCommandParams, IInsertRowCommandParams } from '../../commands/commands/insert-row-col.command';
import type { IMoveRangeCommandParams } from '../../commands/commands/move-range.command';
import type { IMoveColsCommandParams, IMoveRowsCommandParams } from '../../commands/commands/move-rows-cols.command';
import type {
    IRemoveColByRangeCommandParams,
    IRemoveRowByRangeCommandParams,
} from '../../commands/commands/remove-row-col.command';
import type { ISetBorderCommandParams } from '../../commands/commands/set-border.command';
import type { ISetSpecificColsVisibleCommandParams } from '../../commands/commands/set-col-visible.command';
import type { ISetRangeValuesCommandParams } from '../../commands/commands/set-range-values.command';
import type { ISetSpecificRowsVisibleCommandParams } from '../../commands/commands/set-row-visible.command';
import type { ISetStyleCommandParams } from '../../commands/commands/set-style.command';
import type { ISetColWidthCommandParams } from '../../commands/commands/set-worksheet-col-width.command';
import type { ISetWorksheetNameCommandParams } from '../../commands/commands/set-worksheet-name.command';
import type { ISetWorksheetOrderCommandParams } from '../../commands/commands/set-worksheet-order.command';
import type {
    ISetRowHeightCommandParams,
    ISetWorksheetRowIsAutoHeightCommandParams,
} from '../../commands/commands/set-worksheet-row-height.command';
import type { ISetWorksheetShowCommandParams } from '../../commands/commands/set-worksheet-show.command';
import type { LocaleKey } from '../../locale/types';
import {
    CustomCommandExecutionError,
    Direction,
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    IPermissionService,
    isICellData,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    Rectangle,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    deserializeRangeWithSheet,
    deserializeRangeWithSheetWithCache,
    IDefinedNamesService,
    LexerTreeBuilder,
    operatorToken,
    sequenceNodeType,
} from '@univerjs/engine-formula';
import { UnitAction } from '@univerjs/protocol';
import { Subject } from 'rxjs';
import { AutoFillCommand } from '../../commands/commands/auto-fill.command';
import { ClearSelectionAllCommand } from '../../commands/commands/clear-selection-all.command';
import { ClearSelectionContentCommand } from '../../commands/commands/clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../../commands/commands/clear-selection-format.command';
import { DeleteRangeMoveLeftCommand } from '../../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../../commands/commands/delete-range-move-up.command';
import { InsertDefinedNameCommand } from '../../commands/commands/insert-defined-name.command';
import { InsertRangeMoveDownCommand } from '../../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../../commands/commands/insert-range-move-right.command';
import { InsertColByRangeCommand, InsertRowByRangeCommand } from '../../commands/commands/insert-row-col.command';
import { MoveRangeCommand } from '../../commands/commands/move-range.command';
import { MoveColsCommand, MoveRowsCommand } from '../../commands/commands/move-rows-cols.command';
import { RemoveDefinedNameCommand } from '../../commands/commands/remove-defined-name.command';
import { RemoveColByRangeCommand, RemoveRowByRangeCommand } from '../../commands/commands/remove-row-col.command';
import { SetBorderCommand } from '../../commands/commands/set-border.command';
import {
    SetSelectedColsVisibleCommand,
    SetSpecificColsVisibleCommand,
} from '../../commands/commands/set-col-visible.command';
import { SetDefinedNameCommand } from '../../commands/commands/set-defined-name.command';
import { SetRangeValuesCommand } from '../../commands/commands/set-range-values.command';
import {
    SetSelectedRowsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '../../commands/commands/set-row-visible.command';
import { SetStyleCommand } from '../../commands/commands/set-style.command';
import { DeltaColumnWidthCommand, SetColWidthCommand } from '../../commands/commands/set-worksheet-col-width.command';
import { SetWorksheetNameCommand } from '../../commands/commands/set-worksheet-name.command';
import { SetWorksheetOrderCommand } from '../../commands/commands/set-worksheet-order.command';
import {
    DeltaRowHeightCommand,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '../../commands/commands/set-worksheet-row-height.command';
import { SetWorksheetShowCommand } from '../../commands/commands/set-worksheet-show.command';
import { getSheetCommandTarget } from '../../commands/commands/utils/target-util';
import { SetWorksheetNameMutation } from '../../commands/mutations/set-worksheet-name.mutation';
import { RangeProtectionRuleModel } from '../../models/range-protection-rule.model';
import {
    RangeProtectionPermissionEditPoint,
    WorkbookDeleteColumnPermission,
    WorkbookDeleteRowPermission,
    WorkbookEditablePermission,
    WorkbookHideSheetPermission,
    WorkbookInsertColumnPermission,
    WorkbookInsertRowPermission,
    WorkbookMoveSheetPermission,
    WorkbookRenameSheetPermission,
    WorksheetDeleteColumnPermission,
    WorksheetDeleteRowPermission,
    WorksheetEditPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertRowPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
    WorksheetViewPermission,
} from '../../services/permission/permission-point';
import { WorksheetProtectionRuleModel } from '../../services/permission/worksheet-permission';
import { SheetsSelectionsService } from '../../services/selections';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME } from '../defined-name-data.controller';

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

export class SheetPermissionCheckController extends Disposable {
    disposableCollection = new DisposableCollection();

    private _triggerPermissionUIEvent$ = new Subject<string>();
    public triggerPermissionUIEvent$ = this._triggerPermissionUIEvent$.asObservable();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
    ) {
        super();
        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((commandInfo: ICommandInfo) => {
                this._getPermissionCheck(commandInfo);
            })
        );
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetNameMutation.id) {
                    const target = getSheetCommandTarget(this._univerInstanceService, command.params);
                    if (!target) return;

                    const { unitId, subUnitId } = target;

                    const worksheetRule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                    if (worksheetRule) {
                        this._worksheetProtectionRuleModel.ruleRefresh(worksheetRule.permissionId);
                    }

                    const selectionRuleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                    if (selectionRuleList.length) {
                        this._rangeProtectionRuleModel.ruleRefresh(subUnitId);
                    }
                }
            })
        );
    }

    public blockExecuteWithoutPermission(errorMsg: string) {
        this._triggerPermissionUIEvent$.next(errorMsg);
        throw new CustomCommandExecutionError('have no permission');
    }

    private _getPermissionCheck(commandInfo: ICommandInfo) {
        const { id } = commandInfo;

        let permission = true;
        let errorMsg = '';
        let params;

        switch (id) {
            // set cell value
            case SetRangeValuesCommand.id:
                params = commandInfo.params as ISetRangeValuesCommandParams;

                if (isICellData(params.value) && params.value.f) {
                    permission = this._permissionCheckWithFormula(params);
                    errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.formulaErr');
                } else {
                    permission = this._permissionCheckBySetRangeValue(
                        {
                            workbookTypes: [WorkbookEditablePermission],
                            worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                            rangeTypes: [RangeProtectionPermissionEditPoint],
                        },
                        params
                    );
                    errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.editErr');
                }
                break;

            // set cell style
            case SetStyleCommand.id:
                params = commandInfo.params as ISetStyleCommandParams<unknown>;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params.range ? [params.range] : undefined,
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setStyleErr');
                break;
            case SetBorderCommand.id:
                params = commandInfo.params as ISetBorderCommandParams | undefined;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params?.ranges,
                    params?.unitId,
                    params?.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setStyleErr');
                break;

            // clear all/content/format
            case ClearSelectionAllCommand.id:
                params = commandInfo.params as IClearSelectionAllCommandParams | undefined;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetSetCellStylePermission, WorksheetEditPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params?.ranges,
                    params?.unitId,
                    params?.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.editErr');
                break;
            case ClearSelectionContentCommand.id:
                params = commandInfo.params as IClearSelectionContentCommandParams | undefined;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params?.ranges,
                    params?.unitId,
                    params?.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.editErr');
                break;
            case ClearSelectionFormatCommand.id:
                params = commandInfo.params as IClearSelectionFormatCommandParams | undefined;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params?.ranges,
                    params?.unitId,
                    params?.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setStyleErr');
                break;

            // set column width
            case DeltaColumnWidthCommand.id:
                permission = this.permissionCheckWithoutRange(
                    {
                        worksheetTypes: [WorksheetSetColumnStylePermission],
                    }
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;
            case SetColWidthCommand.id:
                params = commandInfo.params as ISetColWidthCommandParams;

                permission = this.permissionCheckWithoutRange(
                    {
                        worksheetTypes: [WorksheetSetColumnStylePermission],
                    },
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;

            // set row height
            case DeltaRowHeightCommand.id:
                permission = this.permissionCheckWithoutRange(
                    {
                        worksheetTypes: [WorksheetSetRowStylePermission],
                    }
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;
            case SetRowHeightCommand.id:
            case SetWorksheetRowIsAutoHeightCommand.id:
                params = commandInfo.params as ISetRowHeightCommandParams | ISetWorksheetRowIsAutoHeightCommandParams;

                permission = this.permissionCheckWithoutRange(
                    {
                        worksheetTypes: [WorksheetSetRowStylePermission],
                    },
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;

            // move rows/columns/ranges
            case MoveRowsCommand.id:
            case MoveColsCommand.id:
                params = commandInfo.params as IMoveRowsCommandParams | IMoveColsCommandParams;

                permission = this._permissionCheckByMoveRowsColsCommand(params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.moveRowColErr');
                break;
            case MoveRangeCommand.id:
                params = commandInfo.params as IMoveRangeCommandParams;

                permission = this._permissionCheckByMoveRangeCommand(params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.moveRangeErr');
                break;

            // insert row/column
            case InsertRowByRangeCommand.id:
            case InsertColByRangeCommand.id:
                params = commandInfo.params as IInsertRowCommandParams | IInsertColCommandParams;

                permission = this._permissionCheckByInsertRowColCommand(params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.insertRowColErr');
                break;

            // remove row/column
            case RemoveRowByRangeCommand.id:
                params = commandInfo.params as IRemoveRowByRangeCommandParams;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission, WorkbookDeleteRowPermission],
                        worksheetTypes: [WorksheetEditPermission, WorksheetDeleteRowPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    [params.range],
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.removeRowColErr');
                break;
            case RemoveColByRangeCommand.id:
                params = commandInfo.params as IRemoveRowByRangeCommandParams | IRemoveColByRangeCommandParams;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission, WorkbookDeleteColumnPermission],
                        worksheetTypes: [WorksheetEditPermission, WorksheetDeleteColumnPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    [params.range],
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.removeRowColErr');
                break;

            // worksheet operations
            case SetWorksheetOrderCommand.id:
                params = commandInfo.params as ISetWorksheetOrderCommandParams;

                permission = this._permissionCheckByWorksheetCommand([WorkbookEditablePermission, WorkbookMoveSheetPermission], params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.operatorSheetErr');
                break;
            case SetWorksheetNameCommand.id:
                params = commandInfo.params as ISetWorksheetNameCommandParams;

                permission = this._permissionCheckByWorksheetCommand([WorkbookEditablePermission, WorkbookRenameSheetPermission], params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.operatorSheetErr');
                break;
            case SetWorksheetShowCommand.id:
                params = commandInfo.params as ISetWorksheetShowCommandParams;

                permission = this._permissionCheckByWorksheetCommand([WorkbookEditablePermission, WorkbookHideSheetPermission], params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.operatorSheetErr');
                break;

            // set row/column style
            case SetSpecificColsVisibleCommand.id:
                params = commandInfo.params as ISetSpecificColsVisibleCommandParams;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params.ranges,
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;
            case SetSpecificRowsVisibleCommand.id:
                params = commandInfo.params as ISetSpecificRowsVisibleCommandParams;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    params.ranges,
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;
            case SetSelectedColsVisibleCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;
            case SetSelectedRowsVisibleCommand.id:
                permission = this.permissionCheckWithRanges({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
                    rangeTypes: [RangeProtectionPermissionEditPoint],
                });
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.setRowColStyleErr');
                break;

            // insert/delete with move range
            case InsertRangeMoveRightCommand.id:
                params = commandInfo.params as IInsertRangeMoveRightCommandParams | undefined;

                permission = this._permissionCheckWithInsertOrDeleteMoveRange('right', params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case InsertRangeMoveDownCommand.id:
                params = commandInfo.params as IInsertRangeMoveDownCommandParams | undefined;

                permission = this._permissionCheckWithInsertOrDeleteMoveRange('down', params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case DeleteRangeMoveLeftCommand.id:
                params = commandInfo.params as IDeleteRangeMoveLeftCommandParams | undefined;

                permission = this._permissionCheckWithInsertOrDeleteMoveRange('left', params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.insertOrDeleteMoveRangeErr');
                break;
            case DeleteRangeMoveUpCommand.id:
                params = commandInfo.params as IDeleteRangeMoveUpCommandParams | undefined;

                permission = this._permissionCheckWithInsertOrDeleteMoveRange('up', params);
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.insertOrDeleteMoveRangeErr');
                break;

            // auto fill
            case AutoFillCommand.id:
                params = commandInfo.params as IAutoFillCommandParams;

                permission = this.permissionCheckWithRanges(
                    {
                        workbookTypes: [WorkbookEditablePermission],
                        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                        rangeTypes: [RangeProtectionPermissionEditPoint],
                    },
                    [params.targetRange],
                    params.unitId,
                    params.subUnitId
                );
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.autoFillErr');
                break;

            // defined name
            case InsertDefinedNameCommand.id:
            case SetDefinedNameCommand.id:
            case RemoveDefinedNameCommand.id:
                params = commandInfo.params as ISetDefinedNameMutationParam;

                if (!params.localSheetId || params.localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME) {
                    permission = this.permissionCheckWithoutRange(
                        {
                            workbookTypes: [WorkbookEditablePermission],
                        },
                        params.unitId
                    );
                } else {
                    permission = this.permissionCheckWithoutRange(
                        {
                            workbookTypes: [WorkbookEditablePermission],
                            worksheetTypes: [WorksheetEditPermission],
                        },
                        params.unitId,
                        params.localSheetId
                    );
                }
                errorMsg = this._localeService.t<LocaleKey>('sheets.permission.dialog.editErr');
                break;

            default:
                break;
        }

        if (!permission) {
            this.blockExecuteWithoutPermission(errorMsg);
        }
    };

    public permissionCheckWithRanges(permissionTypes: IPermissionTypes, selectionRanges?: IRange[], unitId?: string, subUnitId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
        if (!target) return false;

        const { unitId: _unitId, subUnitId: _subUnitId } = target;
        const { workbookTypes, worksheetTypes, rangeTypes } = permissionTypes;

        if (
            workbookTypes &&
            workbookTypes.some((F) => {
                const instance = new F(_unitId);
                const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                return permissionPoint === false;
            })
        ) {
            return false;
        }

        if (
            worksheetTypes &&
            worksheetTypes.some((F) => {
                const instance = new F(_unitId, _subUnitId);
                const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                return permissionPoint === false;
            })
        ) {
            return false;
        }

        if (rangeTypes && rangeTypes.length > 0) {
            const ranges = selectionRanges ?? this._selectionManagerService.getCurrentSelections()?.map((s) => s.range);
            if (!ranges) return false;

            const rules = this._rangeProtectionRuleModel.getSubunitRuleList(_unitId, _subUnitId);
            if (rules.length === 0) return true;

            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];

                if (
                    ranges.some((range) =>
                        rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range))
                    )
                ) {
                    const permissionId = rule.permissionId;

                    if (
                        rangeTypes.some((F) => {
                            const instance = new F(_unitId, _subUnitId, permissionId);
                            const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                            return permissionPoint === false;
                        })
                    ) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    public permissionCheckWithoutRange(permissionTypes: IPermissionTypes, unitId?: string, subUnitId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
        if (!target) return false;

        const { worksheet, unitId: _unitId, subUnitId: _subUnitId } = target;
        const { workbookTypes, worksheetTypes, rangeTypes } = permissionTypes;

        if (
            workbookTypes &&
            workbookTypes.some((F) => {
                const instance = new F(_unitId);
                const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                return permissionPoint === false;
            })
        ) {
            return false;
        }

        if (
            worksheetTypes &&
            worksheetTypes.some((F) => {
                const instance = new F(_unitId, _subUnitId);
                const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                return permissionPoint === false;
            })
        ) {
            return false;
        }

        if (rangeTypes && rangeTypes.length > 0) {
            const selectionPrimary = this._selectionManagerService.getCurrentLastSelection()?.primary;
            if (!selectionPrimary) {
                return false;
            }

            const { actualRow, actualColumn } = selectionPrimary;
            const cell = worksheet.getCell(actualRow, actualColumn) as Nullable<ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }>;
            const permission = cell?.selectionProtection?.[0];
            if (!permission?.ruleId) {
                return true;
            }

            const permissionId = this._rangeProtectionRuleModel.getRule(_unitId, _subUnitId, permission.ruleId)?.permissionId;
            if (!permissionId) {
                return true;
            }

            if (
                rangeTypes.some((F) => {
                    const instance = new F(_unitId, _subUnitId, permissionId);
                    const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                    return permissionPoint === false;
                })
            ) {
                return false;
            }
        }

        return true;
    }

    private _permissionCheckWithFormula(params: ISetRangeValuesCommandParams) {
        const target = getSheetCommandTarget(this._univerInstanceService, params);
        if (!target) return false;

        const { workbook, unitId, subUnitId } = target;

        const formulaString = (params.value as ICellData).f;
        if (formulaString) {
            const definedNameStr = formulaString.substring(1);
            const definedName = this._definedNamesService.getValueByName(unitId, definedNameStr);

            if (definedName) {
                let formulaOrRefString = definedName.formulaOrRefString;
                if (formulaOrRefString.startsWith(operatorToken.EQUALS)) {
                    formulaOrRefString = formulaOrRefString.slice(1);
                }

                const refRangesArr = formulaOrRefString.split(',');

                for (let i = 0; i < refRangesArr.length; i++) {
                    const refRange = refRangesArr[i];
                    const { sheetName, range } = deserializeRangeWithSheet(refRange);

                    if (sheetName) {
                        const targetSheet = workbook.getSheetBySheetName(sheetName);
                        if (!targetSheet) {
                            // Formula errors need to be handled by the formula system, and permissions will not be blocked
                            return true;
                        }

                        const { startRow, endRow, startColumn, endColumn } = range;

                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                const cell = targetSheet.getCell(r, c) as Nullable<ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }>;
                                const permission = cell?.selectionProtection?.[0];
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
                    const { unitId: sequenceGridUnitId, sheetName, range } = deserializeRangeWithSheetWithCache(token);

                    let sequenceGridWorkbook = workbook;
                    if (sequenceGridUnitId && sequenceGridUnitId !== unitId) {
                        const _sequenceGridWorkbook = this._univerInstanceService.getUnit<Workbook>(sequenceGridUnitId, UniverInstanceType.UNIVER_SHEET);
                        if (!_sequenceGridWorkbook) return true;
                        sequenceGridWorkbook = _sequenceGridWorkbook;
                    }

                    const sequenceGridWorksheet = sheetName ? sequenceGridWorkbook.getSheetBySheetName(sheetName) : sequenceGridWorkbook.getActiveSheet();
                    if (!sequenceGridWorksheet) return true;

                    if (sheetName) {
                        const viewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(sequenceGridWorkbook.getUnitId(), sequenceGridWorksheet.getSheetId()).id);
                        if (!viewPermission || viewPermission.value === false) return false;
                    }

                    const { startRow, endRow, startColumn, endColumn } = range;

                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startColumn; c <= endColumn; c++) {
                            const cell = sequenceGridWorksheet.getCell(r, c) as Nullable<ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }>;
                            const permission = cell?.selectionProtection?.[0];
                            if (permission?.[UnitAction.View] === false) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            }
        }

        const { range } = params;
        if (range) {
            const rules = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
            if (rules.length === 0) return true;

            const permissionIds = rules
                .filter((rule) =>
                    rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range))
                )
                .map((rule) => new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId).id);

            return this._permissionService.composePermission(permissionIds).every((permission) => permission.value);
        }

        return true;
    }

    private _permissionCheckBySetRangeValue(permissionTypes: IPermissionTypes, params: ISetRangeValuesCommandParams) {
        const { unitId, subUnitId, value, range } = params;

        let ranges: IRange[] = [];

        if ((Tools.isArray(value) || isICellData(value)) && range) {
            ranges = [range];
        } else {
            const matrix = new ObjectMatrix(value as IObjectMatrixPrimitiveType<ICellData>);
            ranges = [matrix.getStartEndScope()];
        }

        return this.permissionCheckWithRanges(permissionTypes, ranges, unitId, subUnitId);
    }

    private _permissionCheckByMoveRowsColsCommand(params: IMoveRowsCommandParams | IMoveColsCommandParams) {
        const target = getSheetCommandTarget(this._univerInstanceService, params);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const { fromRange, toRange } = params;

        const fromRangePermissionCheck = this.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            [fromRange],
            unitId,
            subUnitId
        );
        if (!fromRangePermissionCheck) return false;

        const _toRange = { ...toRange };
        if (_toRange.endRow === worksheet.getRowCount() - 1) {
            _toRange.endColumn = _toRange.startColumn;
        } else {
            _toRange.endRow = _toRange.startRow;
        }

        const toRangePermissionCheck = this.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            [_toRange],
            unitId,
            subUnitId
        );

        return toRangePermissionCheck;
    }

    private _permissionCheckByMoveRangeCommand(params: IMoveRangeCommandParams) {
        const { fromUnitId, fromSubUnitId, fromRange, toUnitId, toSubUnitId, toRange } = params;

        const fromTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: fromUnitId, subUnitId: fromSubUnitId });
        if (!fromTarget) return false;

        const toTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: toUnitId, subUnitId: toSubUnitId });
        if (!toTarget) return false;

        const fromRangePermissionCheck = this.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            [fromRange],
            fromTarget.unitId,
            fromTarget.subUnitId
        );
        if (!fromRangePermissionCheck) return false;

        const toRangePermissionCheck = this.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            [toRange],
            toTarget.unitId,
            toTarget.subUnitId
        );

        return toRangePermissionCheck;
    }

    private _permissionCheckByInsertRowColCommand(params: IInsertRowCommandParams | IInsertColCommandParams) {
        const target = getSheetCommandTarget(this._univerInstanceService, params);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const { range, direction } = params;

        const _range = { ...range };
        const permissionTypes = {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        };

        if (direction === Direction.UP || direction === Direction.DOWN) {
            const anchorRow = direction === Direction.UP ? range.startRow : range.startRow - 1;
            if (anchorRow < 0 || anchorRow > worksheet.getRowCount() - 1) return false;

            _range.startRow = anchorRow;
            _range.endRow = anchorRow;

            permissionTypes.workbookTypes.push(WorkbookInsertRowPermission);
            permissionTypes.worksheetTypes.push(WorksheetInsertRowPermission);
        } else if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            const anchorCol = direction === Direction.LEFT ? range.startColumn : range.startColumn - 1;
            if (anchorCol < 0 || anchorCol > worksheet.getColumnCount() - 1) return false;

            _range.startColumn = anchorCol;
            _range.endColumn = anchorCol;

            permissionTypes.workbookTypes.push(WorkbookInsertColumnPermission);
            permissionTypes.worksheetTypes.push(WorksheetInsertColumnPermission);
        }

        return this.permissionCheckWithRanges(permissionTypes, [_range], unitId, subUnitId);
    }

    private _permissionCheckByWorksheetCommand(workbookPermissionTypes: WorkbookPermissionPointConstructor[], params: ISetWorksheetOrderCommandParams | ISetWorksheetNameCommandParams | ISetWorksheetShowCommandParams) {
        const target = getSheetCommandTarget(this._univerInstanceService, params);
        if (!target) {
            this._worksheetProtectionRuleModel.resetOrder();
            return false;
        }

        const { unitId } = target;

        if (
            workbookPermissionTypes.some((F) => {
                const instance = new F(unitId);
                const permissionPoint = this._permissionService.getPermissionPoint(instance.id)?.value;
                return permissionPoint === false;
            })
        ) {
            this._worksheetProtectionRuleModel.resetOrder();
            return false;
        }

        return true;
    }

    private _permissionCheckWithInsertOrDeleteMoveRange(
        direction: 'right' | 'down' | 'left' | 'up',
        params?: IInsertRangeMoveRightCommandParams | IInsertRangeMoveDownCommandParams | IDeleteRangeMoveLeftCommandParams | IDeleteRangeMoveUpCommandParams
    ) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;

        const range = params?.range ?? this._selectionManagerService.getCurrentLastSelection()?.range;
        if (!range) return false;

        const permissionCheck = this.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            [range],
            unitId,
            subUnitId
        );
        if (!permissionCheck) return false;

        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
        if (rules.length === 0) return true;

        const _range = { ...range };
        if (direction === 'right' || direction === 'left') {
            _range.endColumn = worksheet.getColumnCount() - 1;
        } else if (direction === 'down' || direction === 'up') {
            _range.endRow = worksheet.getRowCount() - 1;
        }

        if (
            rules.some((rule) =>
                rule.ranges.some((range) => Rectangle.intersects(range, _range))
            )
        ) {
            return false;
        }

        return true;
    }
}
