import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    RemoveColCommand,
    RemoveRowCommand,
} from '@univerjs/base-sheets';
import { IMenuButtonItem, IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/base-ui';

import { SheetMenuPosition } from './menu';

const DELETE_RANGE_MENU_ID = 'sheet.menu.delete';
export function DeleteRangeMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: DELETE_RANGE_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.delete',
        icon: 'Reduce',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function RemoveColMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveColCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'DeleteColumn',
        positions: [DELETE_RANGE_MENU_ID, SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.deleteSelectedColumn',
    };
}

export function RemoveRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveRowCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'DeleteRow',
        positions: [DELETE_RANGE_MENU_ID, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.deleteSelectedRow',
    };
}

export function DeleteRangeMoveLeftMenuItemFactory(): IMenuButtonItem {
    return {
        id: DeleteRangeMoveLeftCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveLeft',
        icon: 'DeleteCellShiftLeft',
        positions: [DELETE_RANGE_MENU_ID],
    };
}

export function DeleteRangeMoveUpMenuItemFactory(): IMenuButtonItem {
    return {
        id: DeleteRangeMoveUpCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveUp',
        icon: 'DeleteCellShiftUp',
        positions: [DELETE_RANGE_MENU_ID],
    };
}
