import {
    BorderStyleManagerService,
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '@univerjs/base-sheets';
import { IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { BorderStyleTypes, ICommandService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import { BORDER_LINE_COMPONENT } from '../../components/border-line';
import { BORDER_PANEL_COMPONENT, BorderPanelType } from '../../components/border-panel/interface';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';

export const BORDER_SIZE_CHILDREN = [
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.THIN,
            },
        },
        value: BorderStyleTypes.THIN,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.HAIR,
            },
        },
        value: BorderStyleTypes.HAIR,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.DOTTED,
            },
        },
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.DASHED,
            },
        },
        value: BorderStyleTypes.DASHED,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.DOTTED,
            },
        },
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.DASH_DOT_DOT,
            },
        },
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.MEDIUM,
            },
        },
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.MEDIUM_DASHED,
            },
        },
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.MEDIUM_DASH_DOT,
            },
        },
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
            },
        },
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: {
            name: BORDER_LINE_COMPONENT,
            props: {
                type: BorderStyleTypes.THICK,
            },
        },
        value: BorderStyleTypes.THICK,
    },
];

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

export function SetBorderColorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderColorCommand.id,
        title: 'borderLine.borderColor',
        positions: SetBorderPositionCommand.id,
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: COLOR_PICKER_COMPONENT,
            },
        ],
        value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.color)),
    };
}

export function SetBorderStyleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<BorderStyleTypes> {
    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderStyleCommand.id,
        title: 'borderLine.borderType',
        positions: SetBorderPositionCommand.id,
        type: MenuItemType.SELECTOR,
        selections: [...BORDER_SIZE_CHILDREN],
        value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.style)),
    };
}
