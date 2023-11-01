import {
    BorderStyleManagerService,
    SetBorderColorCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '@univerjs/base-sheets';
import { DisplayTypes, IMenuSelectorItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { BorderStyleTypes, ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import { BORDER_LINE_COMPONENT } from '../../components/border-line';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';

export const LINE_BOLD_LABEL = 'CONTEXT_MENU_INPUT';

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        icon: 'UpBorderSingle',
        value: 'top',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderBottom',
        icon: 'DownBorderSingle',
        value: 'bottom',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderLeft',
        icon: 'LeftBorderSingle',
        value: 'left',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderRight',
        icon: 'RightBorderSingle',
        value: 'right',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderNone',
        icon: 'NoBorderSingle',
        value: 'none',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderAll',
        icon: 'AllBorderSingle',
        value: 'all',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderOutside',
        icon: 'OuterBorderSingle',
        value: 'outside',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderInside',
        icon: 'InnerBorderSingle',
        value: 'inside',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderHorizontal',
        icon: 'InnerBorderSingle',
        value: 'horizontal',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'InnerBorderSingle',
        value: 'vertical',
        showAfterClick: true,
    },
];

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
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderPositionCommand.id,
        title: 'border',
        icon: 'AllBorderSingle',
        tooltip: 'toolbar.border.main',
        display: DisplayTypes.ICON,
        positions: [MenuPosition.TOOLBAR_START],
        type: MenuItemType.SUBITEMS,
        selections: [...BORDER_LINE_CHILDREN],
        onClose: () => {
            borderStyleManagerService.setActiveBorderType(false);
        },
    };
}

export function SetBorderColorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderColorCommand.id,
        title: 'borderLine.borderColor',
        positions: SetBorderPositionCommand.id,
        display: DisplayTypes.CUSTOM,
        type: MenuItemType.SELECTOR,
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
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
        // label: SHEET_UI_PLUGIN_NAME + LINE_BOLD_LABEL,
        positions: SetBorderPositionCommand.id,
        display: DisplayTypes.CUSTOM,
        type: MenuItemType.SELECTOR,
        selections: [...BORDER_SIZE_CHILDREN],
        value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.style)),
    };
}
