import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType, MenuPosition } from '@univerjs/ui';

import { ToggleScriptPanelOperation } from '../commands/operations/panel.operation';

export function UniscriptMenuItemFactory(): IMenuButtonItem {
    return {
        id: ToggleScriptPanelOperation.id,
        title: 'toggle-script-panel',
        tooltip: 'script-panel.tooltip.menu-button',
        icon: 'CodeSingle',
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
    };
}
