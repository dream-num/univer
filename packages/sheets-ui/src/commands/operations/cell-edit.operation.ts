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

import type { IOperation, Workbook } from '@univerjs/core';
import { CommandType, ICommandService, IConfigService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import type { IUniverSheetsUIConfig } from '../../config/config';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

export const SetCellEditVisibleOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const configService = accessor.get(IConfigService);
        const disableEdit = configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY)?.disableEdit;
        if (disableEdit && params.visible) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const unitId = params.unitId ?? workbook.getUnitId();
        if (params.visible) {
            const injector = accessor.get(Injector);
            if (injector.has(SheetSkeletonService)) {
                const target = unitId === workbook.getUnitId() ? workbook : univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                const sheetId = target?.getActiveSheet()?.getSheetId();
                if (sheetId && injector.get(SheetSkeletonService).isDisplayProjectionPending(unitId, sheetId)) {
                    return false;
                }
            }
        }
        const editorBridgeService = accessor.get(IEditorBridgeService);
        editorBridgeService.changeVisible({ ...params, unitId });

        return true;
    },
};

export const SetCellEditVisibleWithF2Operation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible-f2',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }

        return commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            ...params,
            unitId: workbook.getUnitId(),
        });
    },
};

/**
 * When the editor is not clicked to change the cursor,
 * the arrow keys will exit editing and move the cell.
 */
export const SetCellEditVisibleArrowOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible-arrow',
    type: CommandType.OPERATION,
    handler: () => true,
};
