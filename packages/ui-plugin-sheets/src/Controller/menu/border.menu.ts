import { ISelectionManager, SetBorderColorCommand, SetBorderPositionCommand, SetBorderStyleCommand } from '@univerjs/base-sheets';
import { ColorPicker, DisplayTypes, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes } from '@univerjs/base-ui';
import { IBorderData, ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { SHEET_UI_PLUGIN_NAME } from '../../Basics/Const/PLUGIN_NAME';
import { BORDER_LINE_CHILDREN } from '../../View/Toolbar/Const';

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetBorderPositionCommand.id,
        title: 'border',
        display: DisplayTypes.ICON,
        positions: [MenuPosition.TOOLBAR],
        type: MenuItemType.DROPDOWN,
        selectType: SelectTypes.NEO,
        selections: [
            ...BORDER_LINE_CHILDREN,
            // TODO: add a set line bold menu item here
            // {
            //     label: {
            //         name: SHEET_UI_PLUGIN_NAME + LineBold.name,
            //         props: {
            //             img: 0,
            //             label: 'borderLine.borderSize',
            //         },
            //     },
            //     onClick: (...arg) => {},
            //     className: styles.selectLineBoldParent,
            //     children: BORDER_SIZE_CHILDREN,
            // },
        ],
        value$: new Observable<string>((subscriber) => {
            subscriber.next('border');
        }),
    };
}

export function SetBorderColorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SetBorderColorCommand.id,
        title: 'border',
        positions: [MenuPosition.TOOLBAR],
        parentId: SetBorderPositionCommand.id,
        display: DisplayTypes.COLOR,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            subscriber.next('#ff0000');
        }),
    };
}

export function SetBorderStyleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<IBorderData | undefined> {
    return {
        id: SetBorderStyleCommand.id,
        title: 'borderStyle',
        positions: [MenuPosition.TOOLBAR],
        parentId: SetBorderPositionCommand.id,
        display: DisplayTypes.COLOR,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [],
    };
}
