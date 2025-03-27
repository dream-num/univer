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

import type { MenuSchemaType } from '@univerjs/ui';
import { RibbonOthersGroup } from '@univerjs/ui';
import { CreateFloatDomCommand } from '../commands/commands/float-dom.command';
import { CreateEmptySheetCommand, DisposeCurrentUnitCommand, DisposeUniverCommand, LoadSheetSnapshotCommand } from '../commands/commands/unit.command';
import { ShowCellContentOperation } from '../commands/operations/cell.operation';
import { ChangeUserCommand } from '../commands/operations/change-user.operation';
import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DarkModeOperation } from '../commands/operations/dark-mode.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { OpenWatermarkPanelOperation } from '../commands/operations/open-watermark-panel.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import {
    ChangeUserMenuItemFactory,
    ConfirmMenuItemFactory,
    CreateEmptySheetMenuItemFactory,
    CreateFloatDOMMenuItemFactory,
    DarkModeMenuItemFactory,
    DialogMenuItemFactory,
    DisposeCurrentUnitMenuItemFactory,
    DisposeUniverItemFactory,
    FLOAT_DOM_ITEM_MENU_ID,
    FloatDomMenuItemFactory,
    LoadSheetSnapshotMenuItemFactory,
    LocaleMenuItemFactory,
    MessageMenuItemFactory,
    NotificationMenuItemFactory,
    SaveSnapshotSetEditableMenuItemFactory,
    SetEditableMenuItemFactory,
    ShowCellContentMenuItemFactory,
    SidebarMenuItemFactory,
    ThemeMenuItemFactory,
    UNIT_ITEM_MENU_ID,
    UnitMenuItemFactory,
    WatermarkMenuItemFactory,
} from '../controllers/menu';

export const menuSchema: MenuSchemaType = {
    [RibbonOthersGroup.OTHERS]: {
        [LocaleOperation.id]: {
            order: 0,
            menuItemFactory: LocaleMenuItemFactory,
        },
        [DarkModeOperation.id]: {
            order: 0.9,
            menuItemFactory: DarkModeMenuItemFactory,
        },
        [ThemeOperation.id]: {
            order: 1,
            menuItemFactory: ThemeMenuItemFactory,
        },
        [NotificationOperation.id]: {
            order: 2,
            menuItemFactory: NotificationMenuItemFactory,
        },
        [DialogOperation.id]: {
            order: 3,
            menuItemFactory: DialogMenuItemFactory,
        },
        [ConfirmOperation.id]: {
            order: 4,
            menuItemFactory: ConfirmMenuItemFactory,
        },
        [MessageOperation.id]: {
            order: 5,
            menuItemFactory: MessageMenuItemFactory,
        },
        [SidebarOperation.id]: {
            order: 6,
            menuItemFactory: SidebarMenuItemFactory,
        },
        [SetEditable.id]: {
            order: 7,
            menuItemFactory: SetEditableMenuItemFactory,
        },
        [SaveSnapshotOptions.id]: {
            order: 8,
            menuItemFactory: SaveSnapshotSetEditableMenuItemFactory,
            [LoadSheetSnapshotCommand.id]: {
                order: 3,
                menuItemFactory: LoadSheetSnapshotMenuItemFactory,
            },
        },
        [UNIT_ITEM_MENU_ID]: {
            order: 9,
            menuItemFactory: UnitMenuItemFactory,
            [DisposeUniverCommand.id]: {
                order: 0,
                menuItemFactory: DisposeUniverItemFactory,
            },
            [DisposeCurrentUnitCommand.id]: {
                order: 1,
                menuItemFactory: DisposeCurrentUnitMenuItemFactory,
            },
            [CreateEmptySheetCommand.id]: {
                order: 2,
                menuItemFactory: CreateEmptySheetMenuItemFactory,
            },
        },
        [FLOAT_DOM_ITEM_MENU_ID]: {
            order: 10,
            menuItemFactory: FloatDomMenuItemFactory,
            [CreateFloatDomCommand.id]: {
                order: 0,
                menuItemFactory: CreateFloatDOMMenuItemFactory,
            },
            [ShowCellContentOperation.id]: {
                order: 1,
                menuItemFactory: ShowCellContentMenuItemFactory,
            },
        },
        [ChangeUserCommand.id]: {
            order: 11,
            menuItemFactory: ChangeUserMenuItemFactory,
        },
        [OpenWatermarkPanelOperation.id]: {
            order: 12,
            menuItemFactory: WatermarkMenuItemFactory,
        },
    },
};
