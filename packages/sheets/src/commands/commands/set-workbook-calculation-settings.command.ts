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

import type { ICommand } from '@univerjs/core';
import type { ISetWorkbookCalculationSettingsMutationParams } from '../mutations/set-workbook-calculation-settings.mutation';
import {
    CommandType,
    ICommandService,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { WorkbookEditablePermission } from '../../services/permission/permission-point/workbook/editable';
import { SetWorkbookCalculationSettingsMutation } from '../mutations/set-workbook-calculation-settings.mutation';
import { getSheetCommandTargetWorkbook } from './utils/target-util';

export const SetWorkbookCalculationSettingsCommand: ICommand<ISetWorkbookCalculationSettingsMutationParams> = {
    id: 'sheet.command.set-workbook-calculation-settings',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const target = getSheetCommandTargetWorkbook(accessor.get(IUniverInstanceService), params);
        if (!target) {
            return false;
        }

        const permission = accessor.get(IPermissionService).getPermissionPoint(
            new WorkbookEditablePermission(params.unitId).id
        );
        if (permission && !permission.value) {
            return false;
        }

        const undoParams = {
            unitId: params.unitId,
            settings: target.workbook.getCalculationSettings(),
        };
        const redoParams = {
            unitId: params.unitId,
            settings: { ...params.settings },
        };

        const result = accessor.get(ICommandService).syncExecuteCommand<ISetWorkbookCalculationSettingsMutationParams>(SetWorkbookCalculationSettingsMutation.id, redoParams);

        if (result) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [{ id: SetWorkbookCalculationSettingsMutation.id, params: undoParams }],
                redoMutations: [{ id: SetWorkbookCalculationSettingsMutation.id, params: redoParams }],
            });
            return true;
        }

        return false;
    },
};
