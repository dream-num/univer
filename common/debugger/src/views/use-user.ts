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
