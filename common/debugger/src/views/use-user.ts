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

import type { Workbook } from '@univerjs/core';
import { createDefaultUser, IPermissionService, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { WorkbookManageCollaboratorPermission } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';

enum UnitRole {
    Reader = 0,
    Editor = 1,
    Owner = 2,
    UNRECOGNIZED = -1,
}

const menu = [
    {
        label: 'Owner',
        value: UnitRole.Owner,
    },
    {
        label: 'Editor',
        value: UnitRole.Editor,
    },
    {
        label: 'Reader',
        value: UnitRole.Reader,
    },

];

export function useUser() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const userManagerService = useDependency(UserManagerService);
    const permissionService = useDependency(IPermissionService);

    const onSelect = (value: UnitRole) => {
        userManagerService.setCurrentUser(createDefaultUser(value));
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        if (value === UnitRole.Owner) {
            permissionService.updatePermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id, true);
        } else {
            permissionService.updatePermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id, false);
        }
    };

    return {
        type: 'subItem' as const,
        children: '👥 Change user\'s role',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
