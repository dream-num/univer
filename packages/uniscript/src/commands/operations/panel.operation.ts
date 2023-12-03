import { ISidebarService } from '@univerjs/ui';
import { CommandType, IOperation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ScriptPanelService } from '../../services/script-panel.service';

export const ScriptPanelComponentName = 'ScriptPanel';

export const ToggleScriptPanelOperation: IOperation = {
    type: CommandType.OPERATION,
    id: 'univer.operation.toggle-sscript-panel',
    handler: (accessor: IAccessor) => {
        const scriptPanelService = accessor.get(ScriptPanelService);
        const sidebarService = accessor.get(ISidebarService);

        const isOpen = scriptPanelService.isOpen;

        if (isOpen) {
            scriptPanelService.close();
            sidebarService.close();
        } else {
            scriptPanelService.open();
            sidebarService.open({
                header: { title: 'script-panel.title' },
                children: { label: ScriptPanelComponentName },
                width: 600,
            });
        }

        return true;
    },
};
