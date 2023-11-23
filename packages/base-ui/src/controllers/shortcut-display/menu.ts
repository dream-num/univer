import { ToggleShortcutPanelOperation } from '../../commands/operations/toggle-shortcut-panel.operation';
import { IMenuButtonItem, MenuItemType, MenuPosition } from '../../services/menu/menu';

export function ShortcutPanelMenuItemFactory(): IMenuButtonItem {
    return {
        id: ToggleShortcutPanelOperation.id,
        title: 'toggle-shortcut-panel',
        tooltip: 'toggle-shortcut-panel',
        icon: 'KeyboardSingle',
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_OTHERS],
    };
}
