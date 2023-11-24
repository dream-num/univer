import { BorderStyleManagerService, IBorderInfo, SetBorderBasicCommand } from '@univerjs/base-sheets';
import { IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { BORDER_PANEL_COMPONENT } from '../../components/border-panel/interface';

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<IBorderInfo, IBorderInfo> {
    // const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderBasicCommand.id,
        icon: 'AllBorderSingle',
        group: MenuGroup.TOOLBAR_FORMAT,
        tooltip: 'toolbar.border.main',
        positions: [MenuPosition.TOOLBAR_START],
        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: BORDER_PANEL_COMPONENT,
                    hoverable: false,
                },
                value$: borderStyleManagerService.borderInfo$,
            },
        ],
        value$: borderStyleManagerService.borderInfo$,
    };
}
