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
    RangeProtectionPermissionViewPoint,
    SheetPermissionCheckController,
    WorksheetFilterPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import type { ISetSheetFilterRangeCommandParams } from '../commands/commands/sheets-filter.command';
import type { LocaleKey } from '../locale/types';
import {
    ClearSheetsFilterCriteriaCommand,
    ReCalcSheetsFilterCommand,
    RemoveSheetFilterCommand,
    SetSheetFilterRangeCommand,
    SetSheetsFilterCriteriaCommand,
} from '../commands/commands/sheets-filter.command';
import { SheetsFilterService } from '../services/sheet-filter.service';

/**
 * Runs in the base package so every filter command is checked, not only the toolbar toggle.
 * Commands that mutate an existing filter are checked against the filter's final range.
 */
export class SheetsFilterPermissionController extends Disposable {
    constructor(
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (
                    command.id !== SetSheetFilterRangeCommand.id &&
                    command.id !== RemoveSheetFilterCommand.id &&
                    command.id !== SetSheetsFilterCriteriaCommand.id &&
                    command.id !== ClearSheetsFilterCriteriaCommand.id &&
                    command.id !== ReCalcSheetsFilterCommand.id
                ) {
                    return;
                }

                const target = getSheetCommandTarget(this._univerInstanceService, command.params as {
                    unitId?: string;
                    subUnitId?: string;
                });
                if (!target) {
                    return;
                }

                const range = this._getCommandRange(command, target.unitId, target.subUnitId);
                if (!range) {
                    return;
                }

                const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                    worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
                }, [range], target.unitId, target.subUnitId);

                if (!permission) {
                    this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                        this._localeService.t<LocaleKey>('sheets-filter.permission.filterErr')
                    );
                }
            })
        );
    }

    private _getCommandRange(command: ICommandInfo, unitId: string, subUnitId: string): IRange | undefined {
        if (command.id === SetSheetFilterRangeCommand.id) {
            return (command.params as ISetSheetFilterRangeCommandParams).range;
        }

        return this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
    }
}
