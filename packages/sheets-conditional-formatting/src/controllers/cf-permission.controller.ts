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
import { Disposable, ICommandService, Inject, IUniverInstanceService, LocaleService } from '@univerjs/core';
import {
    getSheetCommandTarget,
    RangeProtectionPermissionEditPoint,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import type { IAddCfCommandParams } from '../commands/commands/add-cf.command';
import type { IClearRangeCfParams } from '../commands/commands/clear-range-cf.command';
import type { IClearWorksheetCfParams } from '../commands/commands/clear-worksheet-cf.command';
import type { IDeleteCfCommandParams } from '../commands/commands/delete-cf.command';
import type { IMoveCfCommandParams } from '../commands/commands/move-cf.command';
import type { ISetCfCommandParams } from '../commands/commands/set-cf.command';
import type { LocaleKey } from '../locale/types';
import { AddCfCommand } from '../commands/commands/add-cf.command';
import { ClearRangeCfCommand } from '../commands/commands/clear-range-cf.command';
import { ClearWorksheetCfCommand } from '../commands/commands/clear-worksheet-cf.command';
import { DeleteCfCommand } from '../commands/commands/delete-cf.command';
import { MoveCfCommand } from '../commands/commands/move-cf.command';
import { SetCfCommand } from '../commands/commands/set-cf.command';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';

/**
 * Runs in the base package so headless and Facade callers enforce the same permission as the
 * conditional-formatting UI.
 */
export class ConditionalFormattingPermissionController extends Disposable {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @Inject(ConditionalFormattingRuleModel) private readonly _ruleModel: ConditionalFormattingRuleModel,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private readonly _selectionsService: SheetsSelectionsService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                let ranges: IRange[] = [];

                switch (command.id) {
                    case AddCfCommand.id:
                        ranges = (command.params as IAddCfCommandParams).rule.ranges;
                        break;
                    case SetCfCommand.id: {
                        const params = command.params as ISetCfCommandParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return;
                        }
                        const oldRule = this._ruleModel.getRule(target.unitId, target.subUnitId, params.cfId ?? params.rule.cfId);
                        ranges = [...(oldRule?.ranges ?? []), ...params.rule.ranges];
                        break;
                    }
                    case MoveCfCommand.id: {
                        const params = command.params as IMoveCfCommandParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return;
                        }
                        ranges = this._ruleModel.getRule(target.unitId, target.subUnitId, params.start.id)?.ranges ?? [];
                        break;
                    }
                    case DeleteCfCommand.id: {
                        const params = command.params as IDeleteCfCommandParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return;
                        }
                        ranges = this._ruleModel.getRule(target.unitId, target.subUnitId, params.cfId)?.ranges ?? [];
                        break;
                    }
                    case ClearRangeCfCommand.id: {
                        const params = command.params as IClearRangeCfParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return;
                        }
                        ranges = params.ranges ?? this._selectionsService.getCurrentSelections()?.map((selection) => selection.range) ?? [];
                        break;
                    }
                    case ClearWorksheetCfCommand.id: {
                        const params = command.params as IClearWorksheetCfParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return;
                        }
                        ranges = (this._ruleModel.getSubunitRules(target.unitId, target.subUnitId) ?? [])
                            .flatMap((rule) => rule.ranges);
                        break;
                    }
                    default:
                        return;
                }

                const target = getSheetCommandTarget(this._univerInstanceService, command.params as {
                    unitId?: string;
                    subUnitId?: string;
                });
                if (!target || ranges.length === 0) {
                    return;
                }
                this._checkPermission(target.unitId, target.subUnitId, ranges);
            })
        );
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
                this._localeService.t<LocaleKey>('sheets-conditional-formatting.permission.dialog.setStyleErr')
            );
        }
    }
}
