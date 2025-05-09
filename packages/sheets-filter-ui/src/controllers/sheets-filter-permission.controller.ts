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
import type { MenuConfig } from '@univerjs/ui';
import type { IOpenFilterPanelOperationParams } from '../commands/operations/sheets-filter.operation';
import { Disposable, ICommandService, Inject, Injector, IUniverInstanceService, LocaleService, Tools } from '@univerjs/core';
import { expandToContinuousRange, getSheetCommandTarget, RangeProtectionPermissionViewPoint, SheetPermissionCheckController, SheetsSelectionsService, WorksheetFilterPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { SheetsFilterService, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter';
import { OpenFilterPanelOperation } from '../commands/operations/sheets-filter.operation';

export interface IUniverSheetsFilterUIConfig {
    menu: MenuConfig;
}

export const DefaultSheetFilterUiConfig = {};

export const FILTER_PANEL_POPUP_KEY = 'FILTER_PANEL_POPUP';

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
export class SheetsFilterPermissionController extends Disposable {
    constructor(
        @Inject(SheetsFilterService) private _sheetsFilterService: SheetsFilterService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController)
        private readonly _sheetPermissionCheckPermission: SheetPermissionCheckController,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetsSelectionsService) private _sheetsSelectionService: SheetsSelectionsService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === SmartToggleSheetsFilterCommand.id) {
                    const univerInstanceService = this._injector.get(IUniverInstanceService);
                    const target = getSheetCommandTarget(univerInstanceService);
                    if (!target) return;
                    const { unitId, subUnitId, worksheet } = target;
                    const filterRange = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
                    let permission;
                    if (filterRange) {
                        permission = this._sheetPermissionCheckPermission.permissionCheckWithRanges({
                            rangeTypes: [RangeProtectionPermissionViewPoint],
                            worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
                        }, [filterRange]);
                    } else {
                        const range = this._sheetsSelectionService.getCurrentLastSelection()?.range;
                        if (range) {
                            let newRange = { ...range };
                            const isCellRange = range.startColumn === range.endColumn && range.startRow === range.endRow;
                            newRange = isCellRange ? expandToContinuousRange(newRange, { left: true, right: true, up: true, down: true }, worksheet) : newRange;
                            permission = this._sheetPermissionCheckPermission.permissionCheckWithRanges({
                                rangeTypes: [RangeProtectionPermissionViewPoint],
                                worksheetTypes: [WorksheetViewPermission, WorksheetFilterPermission],
                            }, [newRange], unitId, subUnitId);
                        } else {
                            permission = this._sheetPermissionCheckPermission.permissionCheckWithoutRange({
                                rangeTypes: [RangeProtectionPermissionViewPoint],
                                worksheetTypes: [WorksheetViewPermission, WorksheetFilterPermission],
                            });
                        }
                    }

                    if (!permission) {
                        this._sheetPermissionCheckPermission.blockExecuteWithoutPermission(this._localeService.t('permission.dialog.filterErr'));
                    }
                }
                if (command.id === OpenFilterPanelOperation.id) {
                    const params = command.params as IOpenFilterPanelOperationParams;
                    const { unitId, subUnitId } = params;
                    const filterRange = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
                    const colRange = Tools.deepClone(filterRange);
                    if (colRange) {
                        colRange.startColumn = params.col;
                        colRange.endColumn = params.col;
                        const permission = this._sheetPermissionCheckPermission.permissionCheckWithRanges({
                            rangeTypes: [RangeProtectionPermissionViewPoint],
                            worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
                        }, [colRange]);
                        if (!permission) {
                            this._sheetPermissionCheckPermission.blockExecuteWithoutPermission(this._localeService.t('permission.dialog.filterErr'));
                        }
                    }
                }
            })
        );
    }
}
