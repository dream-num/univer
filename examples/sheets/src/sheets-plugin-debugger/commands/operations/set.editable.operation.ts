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

import type { ICommand } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverPermissionService } from '@univerjs/core';
import { SheetPermissionService } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetEditableCommandParams {
    value: 'sheet' | 'univer';
}

export const SetEditable: ICommand = {
    id: 'debugger.operation.set.editable',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISetEditableCommandParams) => {
        if (params.value === 'sheet') {
            const sheetPermissionService = accessor.get(SheetPermissionService);
            const editable = sheetPermissionService.getSheetEditable();
            sheetPermissionService.setSheetEditable(!editable);
        } else {
            const univerPermissionService = accessor.get(UniverPermissionService);
            const univerInstanceService = accessor.get(IUniverInstanceService);
            const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const editable = univerPermissionService.getEditable(unitId);
            univerPermissionService.setEditable(unitId, !editable);
        }
        return true;
    },
};
