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

import { CommandType, IPermissionService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import type { IAccessor, ICommand } from '@univerjs/core';

export interface ISetEditableCommandParams {
    value: 'sheet' | 'univer';
}

export const SetEditable: ICommand = {
    id: 'debugger.operation.set.editable',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params: ISetEditableCommandParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }
        const { workbook, worksheet, unitId, subUnitId } = target;
        const permissionService = accessor.get(IPermissionService);
        if (!workbook || !worksheet) {
            return false;
        }
        if (params.value === 'sheet') {
            const editable = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id);
            permissionService.updatePermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id, !editable);
        } else {
            const unitId = workbook!.getUnitId();
            const editable = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id);
            permissionService.updatePermissionPoint(new WorkbookEditablePermission(unitId).id, !editable);
        }
        return true;
    },
};
