import {
    BorderStyleManagerService,
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '@univerjs/base-sheets';
import { IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { BORDER_PANEL_COMPONENT, BorderPanelType } from '../../components/border-panel/interface';

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    // const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderBasicCommand.id,
        icon: 'AllBorderSingle',
        group: MenuGroup.TOOLBAR_FORMAT,
        tooltip: 'toolbar.border.main',
        positions: [MenuPosition.TOOLBAR_START],
        type: MenuItemType.SUBITEMS,
        selections: [
            {
                label: {
                    name: BORDER_PANEL_COMPONENT,
                    hoverable: false,
                    props: {
                        panelType: [
                            {
                                type: BorderPanelType.POSITION,
                                id: SetBorderPositionCommand.id,
                            },
                            {
                                type: BorderPanelType.STYLE,
                                id: SetBorderStyleCommand.id,
                            },
                            {
                                type: BorderPanelType.COLOR,
                                id: SetBorderColorCommand.id,
                            },
                        ],
                    },
                },
            },
        ],
    };
}

// export function SetBorderColorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
//     const borderStyleManagerService = accessor.get(BorderStyleManagerService);
//     return {
//         id: SetBorderColorCommand.id,
//         title: 'borderLine.borderColor',
//         positions: SetBorderPositionCommand.id,
//         type: MenuItemType.SELECTOR,
//         selections: [
//             {
//                 label: COLOR_PICKER_COMPONENT,
//             },
//         ],
//         value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.color)),
//     };
// }

// export function SetBorderStyleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<BorderStyleTypes> {
//     const borderStyleManagerService = accessor.get(BorderStyleManagerService);
//     return {
//         id: SetBorderStyleCommand.id,
//         title: 'borderLine.borderType',
//         positions: SetBorderPositionCommand.id,
//         type: MenuItemType.SELECTOR,
//         selections: [...BORDER_SIZE_CHILDREN],
//         value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.style)),
//     };
// }
