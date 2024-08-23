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

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, Inject, LocaleService, Tools } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';

import { SheetPermissionInterceptorBaseController } from '@univerjs/sheets-ui';

import { SheetsFilterService } from '@univerjs/sheets-filter';
import { RangeProtectionPermissionViewPoint, WorksheetFilterPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { type IOpenFilterPanelOperationParams, OpenFilterPanelOperation } from '../commands/operations/sheets-filter.operation';

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
        @Inject(SheetPermissionInterceptorBaseController)
        private readonly _sheetPermissionInterceptorBaseController: SheetPermissionInterceptorBaseController
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === OpenFilterPanelOperation.id) {
                    const params = command.params as IOpenFilterPanelOperationParams;
                    const { unitId, subUnitId } = params;
                    const filterRange = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
                    const colRange = Tools.deepClone(filterRange);
                    if (colRange) {
                        colRange.startColumn = params.col;
                        colRange.endColumn = params.col;
                        const permission = this._sheetPermissionInterceptorBaseController.permissionCheckWithRanges({
                            rangeTypes: [RangeProtectionPermissionViewPoint],
                            worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
                        }, [colRange]);
                        if (!permission) {
                            this._sheetPermissionInterceptorBaseController.haveNotPermissionHandle(this._localeService.t('permission.dialog.filterErr'));
                        }
                    }
                }
            })
        );
    }
}
