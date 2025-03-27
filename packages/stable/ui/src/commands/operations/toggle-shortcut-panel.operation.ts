/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IAccessor, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

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
