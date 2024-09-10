/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, MenuSchemaType } from '@univerjs/ui';
import { MenuItemType, RibbonStartGroup } from '@univerjs/ui';
import { ActionRecorderService } from '../services/action-recorder.service';
import { OpenRecordPanelOperation } from '../commands/operations/operation';

export function OpenRecorderMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const actionRecorderService = accessor.get(ActionRecorderService);

    return {
        id: OpenRecordPanelOperation.id,
        icon: 'RecorderIcon',
        tooltip: 'action-recorder.menu.title',
        type: MenuItemType.BUTTON,
        disabled$: actionRecorderService.panelOpened$,
    };
}

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.OTHERS]: {
        [OpenRecordPanelOperation.id]: {
            order: 1,
            menuItemFactory: OpenRecorderMenuItemFactory,
        },
    },
};
