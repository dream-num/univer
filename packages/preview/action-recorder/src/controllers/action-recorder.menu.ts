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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuSelectorItem, MenuSchemaType } from '@univerjs/ui';
import { MenuItemType, RibbonStartGroup } from '@univerjs/ui';
import { ReplayLocalRecordCommand, ReplayLocalRecordOnActiveCommand, ReplayLocalRecordOnNamesakeCommand } from '../commands/commands/replay.command';
import { OpenRecordPanelOperation } from '../commands/operations/operation';
import { ActionRecorderService } from '../services/action-recorder.service';

export const RECORD_MENU_ITEM_ID = 'RECORD_MENU_ITEM';
export function RecordMenuItemFactory(): IMenuSelectorItem {
    return {
        id: RECORD_MENU_ITEM_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'RecordSingle',
        tooltip: 'action-recorder.menu.title',
    };
}

export function OpenRecorderMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const actionRecorderService = accessor.get(ActionRecorderService);

    return {
        id: OpenRecordPanelOperation.id,
        title: 'action-recorder.menu.record',
        type: MenuItemType.BUTTON,
        disabled$: actionRecorderService.panelOpened$,
    };
}

export function ReplayLocalRecordMenuItemFactory(): IMenuButtonItem {
    return {
        id: ReplayLocalRecordCommand.id,
        title: 'action-recorder.menu.replay-local',
        type: MenuItemType.BUTTON,
    };
}

export function ReplayLocalRecordOnNamesakeMenuItemFactory(): IMenuButtonItem {
    return {
        id: ReplayLocalRecordOnNamesakeCommand.id,
        title: 'action-recorder.menu.replay-local-name',
        type: MenuItemType.BUTTON,
    };
}

export function ReplayLocalRecordOnActiveMenuItemFactory(): IMenuButtonItem {
    return {
        id: ReplayLocalRecordOnActiveCommand.id,
        title: 'action-recorder.menu.replay-local-active',
        type: MenuItemType.BUTTON,
    };
}

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.OTHERS]: {
        [RECORD_MENU_ITEM_ID]: {
            order: 10,
            menuItemFactory: RecordMenuItemFactory,
            [OpenRecordPanelOperation.id]: {
                order: 1,
                menuItemFactory: OpenRecorderMenuItemFactory,
            },
            [ReplayLocalRecordCommand.id]: {
                order: 2,
                menuItemFactory: ReplayLocalRecordMenuItemFactory,
            },
            [ReplayLocalRecordOnNamesakeCommand.id]: {
                order: 3,
                menuItemFactory: ReplayLocalRecordOnNamesakeMenuItemFactory,
            },
            [ReplayLocalRecordOnActiveCommand.id]: {
                order: 4,
                menuItemFactory: ReplayLocalRecordOnActiveMenuItemFactory,
            },
        },

    },
};
