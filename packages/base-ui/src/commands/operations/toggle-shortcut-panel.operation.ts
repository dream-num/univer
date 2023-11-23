import { CommandType, IOperation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ShortcutPanelService } from '../../services/shortcut/shortcut-panel.service';
import { ISidebarService } from '../../services/sidebar/sidebar.service';

export const ShortcutPanelComponentName = 'ShortcutPanel';

export const ToggleShortcutPanelOperation: IOperation = {
    id: 'base-ui.operation.toggle-shortcut-panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const shortcutPanelStatusService = accessor.get(ShortcutPanelService);
        const sidebarService = accessor.get(ISidebarService);

        const isOpen = shortcutPanelStatusService.isOpen;

        if (isOpen) {
            shortcutPanelStatusService.close();
            sidebarService.close();
        } else {
            shortcutPanelStatusService.open();
            sidebarService.open({
                header: { title: 'shortcut-panel.title' },
                children: { label: ShortcutPanelComponentName },
            });
        }

        return true;
    },
};
