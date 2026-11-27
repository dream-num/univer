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

import type { ICommandInfo, IRange } from '@univerjs/core';
import { Disposable, ICommandService, Inject, LocaleService, Rectangle } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    SheetPermissionCheckController,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import type {
    IAddSheetDataValidationCommandParams,
    IClearRangeDataValidationCommandParams,
    IRemoveSheetAllDataValidationCommandParams,
    IRemoveSheetDataValidationCommandParams,
    IUpdateSheetDataValidationOptionsCommandParams,
    IUpdateSheetDataValidationRangeCommandParams,
    IUpdateSheetDataValidationSettingCommandParams,
} from '../commands/commands/data-validation.command';
import type { LocaleKey } from '../locale/types';
import type { RuleMatrix } from '../models/rule-matrix';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '../commands/commands/data-validation.command';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';

/**
 * Runs in the base package so headless and Facade callers enforce the same permission as the
 * data-validation UI.
 */
export class DataValidationPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === AddSheetDataValidationCommand.id) {
                    const { unitId, subUnitId, rule } = command.params as IAddSheetDataValidationCommandParams;
                    const matrix = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
                    matrix.addRule(rule);
                    this._checkPermission(unitId, subUnitId, [
                        ...this._diffRanges(matrix.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId))),
                        ...rule.ranges,
                    ]);
                } else if (command.id === UpdateSheetDataValidationRangeCommand.id) {
                    const { unitId, subUnitId, ruleId, ranges } = command.params as IUpdateSheetDataValidationRangeCommandParams;
                    const matrix = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
                    matrix.updateRange(ruleId, ranges);
                    this._checkPermission(unitId, subUnitId, this._diffRanges(matrix.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId))));
                } else if (command.id === UpdateSheetDataValidationSettingCommand.id) {
                    const { unitId, subUnitId, ruleId } = command.params as IUpdateSheetDataValidationSettingCommandParams;
                    const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
                    this._checkPermission(unitId, subUnitId, rule?.ranges ?? []);
                } else if (command.id === UpdateSheetDataValidationOptionsCommand.id) {
                    const { unitId, subUnitId, ruleId } = command.params as IUpdateSheetDataValidationOptionsCommandParams;
                    const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
                    this._checkPermission(unitId, subUnitId, rule?.ranges ?? []);
                } else if (command.id === ClearRangeDataValidationCommand.id) {
                    const { unitId, subUnitId, ranges, types } = command.params as IClearRangeDataValidationCommandParams;
                    const affectedRules = this._sheetDataValidationModel
                        .getRules(unitId, subUnitId)
                        .filter((rule) => !types?.length || types.includes(rule.type as never))
                        .filter((rule) => rule.ranges.some((ruleRange) => ranges.some((range) => Rectangle.intersects(ruleRange, range))));
                    this._checkPermission(unitId, subUnitId, [
                        ...ranges,
                        ...affectedRules.flatMap((rule) => rule.ranges),
                    ]);
                } else if (command.id === RemoveSheetDataValidationCommand.id) {
                    const { unitId, subUnitId, ruleId } = command.params as IRemoveSheetDataValidationCommandParams;
                    const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
                    this._checkPermission(unitId, subUnitId, rule?.ranges ?? []);
                } else if (command.id === RemoveSheetAllDataValidationCommand.id) {
                    const { unitId, subUnitId } = command.params as IRemoveSheetAllDataValidationCommandParams;
                    const ranges = this._sheetDataValidationModel.getRules(unitId, subUnitId).flatMap((rule) => rule.ranges);
                    this._checkPermission(unitId, subUnitId, ranges);
                }
            })
        );
    }

    private _diffRanges(diffs: ReturnType<RuleMatrix['diff']>): IRange[] {
        const ranges: IRange[] = [];
        diffs.forEach((diff) => {
            if (diff.type === 'update') {
                ranges.push(...diff.oldRanges, ...diff.newRanges);
            } else {
                ranges.push(...diff.rule.ranges);
            }
        });
        return ranges;
    }

    private _checkPermission(unitId: string, subUnitId: string, ranges: IRange[]): void {
        const permission = this._sheetPermissionCheckController.permissionCheckWithRanges(
            {
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
            },
            ranges,
            unitId,
            subUnitId
        );
        if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                this._localeService.t<LocaleKey>('sheets-data-validation.permission.dialog.setStyleErr')
            );
        }
    }
}
