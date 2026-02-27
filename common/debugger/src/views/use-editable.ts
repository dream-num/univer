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

import { IPermissionService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Change workbook editable',
        value: 'univer',
    },
    {
        label: 'Change worksheet editable',
        value: 'sheet',
    },
];

export function useEditable() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const permissionService = useDependency(IPermissionService);

    const onSelect = (value: string) => {
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }
        const { workbook, worksheet, unitId, subUnitId } = target;
        if (!workbook || !worksheet) {
            return false;
        }
        if (value === 'sheet') {
            const editable = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id);
            permissionService.updatePermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id, !editable);
        } else {
            const unitId = workbook!.getUnitId();
            const editable = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id);
            permissionService.updatePermissionPoint(new WorkbookEditablePermission(unitId).id, !editable);
        }
    };

    return {
        type: 'subItem' as const,
        children: '✍️ Editable',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
