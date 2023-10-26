import {
    BorderStyleManagerService,
    SetBorderColorCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '@univerjs/base-sheets';
import { ColorPicker, DisplayTypes, IMenuSelectorItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { BorderStyleTypes, ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from '../../Basics/Const/PLUGIN_NAME';

export const LINE_BOLD_LABEL = 'CONTEXT_MENU_INPUT';

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        icon: 'TopBorderIcon',
        value: 'top',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderBottom',
        icon: 'BottomBorderIcon',
        value: 'bottom',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderLeft',
        icon: 'LeftBorderIcon',
        value: 'left',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderRight',
        icon: 'RightBorderIcon',
        value: 'right',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderNone',
        icon: 'NoneBorderIcon',
        value: 'none',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderAll',
        icon: 'FullBorderIcon',
        value: 'all',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderOutside',
        icon: 'OuterBorderIcon',
        value: 'outside',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderInside',
        icon: 'InnerBorderIcon',
        value: 'inside',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderHorizontal',
        icon: 'StripingBorderIcon',
        value: 'horizontal',
        showAfterClick: true,
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'VerticalBorderIcon',
        value: 'vertical',
        showAfterClick: true,
    },
];

export const BORDER_SIZE_CHILDREN = [
    {
        label: 'BorderThin',
        value: BorderStyleTypes.THIN,
    },
    {
        label: 'BorderHair',
        value: BorderStyleTypes.HAIR,
    },
    {
        label: 'BorderDotted',
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: 'BorderDashed',
        value: BorderStyleTypes.DASHED,
    },
    {
        label: 'BorderDashDot',
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: 'BorderDashDotDot',
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: 'BorderMedium',
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: 'BorderMediumDashed',
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: 'BorderMediumDashDot',
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: 'BorderMediumDashDotDot',
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: 'BorderThick',
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
        icon: 'FullBorderIcon',
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
        display: DisplayTypes.COLOR,
        type: MenuItemType.SELECTOR,
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
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
        label: SHEET_UI_PLUGIN_NAME + LINE_BOLD_LABEL,
        positions: SetBorderPositionCommand.id,
        display: DisplayTypes.CUSTOM,
        type: MenuItemType.SELECTOR,
        selections: [...BORDER_SIZE_CHILDREN],
        value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.style)),
    };
}
