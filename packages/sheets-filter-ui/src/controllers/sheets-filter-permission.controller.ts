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
import { Disposable, ICommandService, Inject, LocaleService, Tools } from '@univerjs/core';
import {
    RangeProtectionPermissionViewPoint,
    SheetPermissionCheckController,
    WorksheetFilterPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import type { IOpenFilterPanelOperationParams } from '../commands/operations/sheets-filter.operation';
import type { LocaleKey } from '../locale/types';
import { OpenFilterPanelOperation } from '../commands/operations/sheets-filter.operation';

export interface IUniverSheetsFilterUIConfig {
    menu: MenuConfig;
}

export const DefaultSheetFilterUiConfig = {};

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
export class SheetsFilterPermissionController extends Disposable {
    constructor(
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetPermissionCheckController)
        private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id !== OpenFilterPanelOperation.id) {
                    return;
                }

                const params = command.params as IOpenFilterPanelOperationParams;
                const { unitId, subUnitId } = params;
                const filterRange = this._sheetsFilterService.getFilterModel(unitId, subUnitId)?.getRange();
                const colRange = Tools.deepClone(filterRange);
                if (!colRange) {
                    return;
                }

                colRange.startColumn = params.col;
                colRange.endColumn = params.col;
                const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
                    rangeTypes: [RangeProtectionPermissionViewPoint],
                    worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
                }, [colRange], unitId, subUnitId);
                if (!permission) {
                    this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                        this._localeService.t<LocaleKey>('sheets-filter-ui.permission.filterErr')
                    );
                }
            })
        );
    }
}
