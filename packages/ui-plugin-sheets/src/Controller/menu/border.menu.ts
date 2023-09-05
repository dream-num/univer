import { BorderStyleManagerService, ISelectionManager, SetBorderColorCommand, SetBorderPositionCommand, SetBorderStyleCommand } from '@univerjs/base-sheets';
import { ColorPicker, DisplayTypes, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes } from '@univerjs/base-ui';
import { BorderStyleTypes, ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from '../../Basics/Const/PLUGIN_NAME';
import { LineBold } from '../../View';

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        icon: 'TopBorderIcon',
        value: 'top',
    },
    {
        label: 'borderLine.borderBottom',
        icon: 'BottomBorderIcon',
        value: 'bottom',
    },
    {
        label: 'borderLine.borderLeft',
        icon: 'LeftBorderIcon',
        value: 'left',
    },
    {
        label: 'borderLine.borderRight',
        icon: 'RightBorderIcon',
        value: 'right',
    },
    {
        label: 'borderLine.borderNone',
        icon: 'NoneBorderIcon',
        value: 'none',
    },
    {
        label: 'borderLine.borderAll',
        icon: 'FullBorderIcon',
        value: 'all',
    },
    {
        label: 'borderLine.borderOutside',
        icon: 'OuterBorderIcon',
        value: 'outside',
    },
    {
        label: 'borderLine.borderInside',
        icon: 'InnerBorderIcon',
        value: 'inside',
    },
    {
        label: 'borderLine.borderHorizontal',
        icon: 'StripingBorderIcon',
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'VerticalBorderIcon',
        value: 'vertical',
    },
];

export const BORDER_SIZE_CHILDREN = [
    {
        label: 'borderLine.borderNone',
        value: BorderStyleTypes.NONE,
    },
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
    const selectionManager = accessor.get(ISelectionManager);
    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderPositionCommand.id,
        title: 'border',
        icon: 'FullBorderIcon',
        display: DisplayTypes.ICON,
        positions: [MenuPosition.TOOLBAR],
        type: MenuItemType.DROPDOWN,
        selectType: SelectTypes.NEO,
        selections: [...BORDER_LINE_CHILDREN],
        value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.color)),
    };
}

export function SetBorderColorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);
    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderColorCommand.id,
        title: 'border',
        positions: SetBorderPositionCommand.id,
        display: DisplayTypes.COLOR,
        selectType: SelectTypes.NEO,
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
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);
    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderStyleCommand.id,
        title: 'borderLine.borderSize',
        label: SHEET_UI_PLUGIN_NAME + LineBold.name,
        positions: SetBorderPositionCommand.id,
        display: DisplayTypes.CUSTOM,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [...BORDER_SIZE_CHILDREN],
        value$: borderStyleManagerService.borderInfo$.pipe(map((info) => info.style)),
    };
}
