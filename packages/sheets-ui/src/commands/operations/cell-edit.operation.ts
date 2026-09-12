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
import type { IUniverSheetsUIConfig } from '../../config/config';

import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { BooleanNumber, CommandType, ICommandService, IConfigService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { WorksheetProtectionRuleModel } from '@univerjs/sheets';
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

        const { unitId } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const editLocation = editorBridgeService.getEditLocation();
        if (params.visible && editLocation) {
            const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
            const worksheet = workbook.getSheetBySheetId(editLocation.sheetId);
            if (
                worksheetProtectionRuleModel.getRule(workbook.getUnitId(), editLocation.sheetId) &&
                worksheet?.getComposedCellStyle(editLocation.row, editLocation.column).formulaHidden === BooleanNumber.TRUE
            ) {
                return false;
            }
        }
        editorBridgeService.changeVisible({
            ...params,
            unitId: unitId ?? workbook.getUnitId(),
        });

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
