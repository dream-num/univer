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
import { ISidebarService } from '@univerjs/ui';

import { ScriptPanelService } from '../../services/script-panel.service';

export const ScriptPanelComponentName = 'ScriptPanel';

export const ToggleScriptPanelOperation: IOperation = {
    type: CommandType.OPERATION,
    id: 'univer.operation.toggle-script-panel',
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
