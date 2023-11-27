import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';

import { ToggleScriptPanelOperation } from '../commands/operations/panel.operation';

export function UniscriptMenuItemFactory(): IMenuButtonItem {
    return {
        id: ToggleScriptPanelOperation.id,
        title: 'toggle-script-panel',
        tooltip: 'script-panel.tooltip.menu-button',
        icon: 'KeyboardSingle',
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
    };
}
