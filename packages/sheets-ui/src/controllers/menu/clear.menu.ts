import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand } from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';

import { SheetMenuPosition } from './menu';

const CLEAR_SELECTION_MENU_ID = 'sheet.menu.clear-selection';
export function ClearSelectionMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: CLEAR_SELECTION_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.SUBITEMS,
        icon: 'ClearFormat',
        title: 'rightClick.clearSelection',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function ClearSelectionContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionContentCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearContent',
        positions: [CLEAR_SELECTION_MENU_ID],
    };
}
export function ClearSelectionFormatMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearFormat',
        positions: [CLEAR_SELECTION_MENU_ID],
    };
}
export function ClearSelectionAllMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearAll',
        positions: [CLEAR_SELECTION_MENU_ID],
    };
}
