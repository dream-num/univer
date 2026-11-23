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
import { Disposable, ICommandService, Inject, LocaleService } from '@univerjs/core';
import { SheetPermissionCheckController, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import type { IInsertSheetDrawingCommandParams } from '../commands/commands/insert-sheet-drawing.command';
import type { IRemoveSheetDrawingCommandParams } from '../commands/commands/remove-sheet-drawing.command';
import type { ISetDrawingArrangeCommandParams } from '../commands/commands/set-drawing-arrange.command';
import type { ISetDrawingCommandParams } from '../commands/commands/set-sheet-drawing.command';
import type { LocaleKey } from '../locale/types';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { SetSheetDrawingPlacementCommand } from '../commands/commands/set-sheet-drawing-placement.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';

/**
 * Runs in the base package so drawing commands are checked in headless/Facade usage. Commands
 * that only exist in `sheets-drawing-ui` remain guarded by the UI controller.
 */
export class SheetDrawingPermissionController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetPermissionCheckController) private readonly _sheetPermissionCheckController: SheetPermissionCheckController
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                let unitId: string | undefined;
                let subUnitId: string | undefined;

                if (command.id === InsertSheetDrawingCommand.id || command.id === RemoveSheetDrawingCommand.id || command.id === SetSheetDrawingCommand.id) {
                    const params = command.params as IInsertSheetDrawingCommandParams | IRemoveSheetDrawingCommandParams | ISetDrawingCommandParams | undefined;
                    const drawings = params?.drawings;
                    unitId = drawings?.[0]?.unitId;
                    subUnitId = drawings?.[0]?.subUnitId;
                } else if (command.id === SetSheetDrawingPlacementCommand.id) {
                    const target = getPlacementCommandTarget(command.params);
                    unitId = target.unitId;
                    subUnitId = target.subUnitId;
                } else if (command.id === SetDrawingArrangeCommand.id) {
                    const params = command.params as ISetDrawingArrangeCommandParams | undefined;
                    unitId = params?.unitId;
                    subUnitId = params?.subUnitId;
                }

                if (!unitId || !subUnitId) {
                    return;
                }

                const permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
                    workbookTypes: [WorkbookEditablePermission],
                    worksheetTypes: [WorksheetEditPermission],
                }, unitId, subUnitId);
                if (!permission) {
                    this._sheetPermissionCheckController.blockExecuteWithoutPermission(
                        this._localeService.t<LocaleKey>('sheets-drawing.permission.editErr')
                    );
                }
            })
        );
    }
}

function getPlacementCommandTarget(params: object | undefined): {
    unitId?: string;
    subUnitId?: string;
} {
    if (!params) {
        return {};
    }

    const unitId = 'unitId' in params && typeof params.unitId === 'string'
        ? params.unitId
        : undefined;
    const subUnitId = 'subUnitId' in params && typeof params.subUnitId === 'string'
        ? params.subUnitId
        : undefined;
    return { unitId, subUnitId };
}
