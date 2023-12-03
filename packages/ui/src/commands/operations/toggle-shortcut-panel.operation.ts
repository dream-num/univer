import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { ShortcutPanelService } from '../../services/shortcut/shortcut-panel.service';
import { ISidebarService } from '../../services/sidebar/sidebar.service';

export const ShortcutPanelComponentName = 'ShortcutPanel';

export const ToggleShortcutPanelOperation: IOperation = {
    id: 'base-ui.operation.toggle-shortcut-panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const shortcutPanelService = accessor.get(ShortcutPanelService);
        const sidebarService = accessor.get(ISidebarService);

        const isOpen = shortcutPanelService.isOpen;

        if (isOpen) {
            shortcutPanelService.close();
            sidebarService.close();
        } else {
            shortcutPanelService.open();
            sidebarService.open({
                header: { title: 'shortcut-panel.title' },
                children: { label: ShortcutPanelComponentName },
            });
        }

        return true;
    },
};
