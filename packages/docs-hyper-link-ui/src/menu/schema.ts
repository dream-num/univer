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
import { EMPTY_PARAGRAPH_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION, INSERT_BELLOW_MENU_ID } from '@univerjs/docs-ui';
import { ContextMenuGroup, ContextMenuPosition, RibbonInsertGroup } from '@univerjs/ui';
import { ShowDocHyperLinkEditPopupOperation } from '../commands/operations/popup.operation';
import { AddHyperLinkMenuItemFactory } from './menu';

export const menuSchema: MenuSchemaType = {
    [RibbonInsertGroup.MEDIA]: {
        [ShowDocHyperLinkEditPopupOperation.id]: {
            order: 1,
            menuItemFactory: AddHyperLinkMenuItemFactory,
        },
    },
    [FLOAT_TOOLBAR_MENU_POSITION]: {
        [ShowDocHyperLinkEditPopupOperation.id]: {
            order: 20,
            menuItemFactory: AddHyperLinkMenuItemFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.DATA]: {
            [ShowDocHyperLinkEditPopupOperation.id]: {
                order: 0,
                menuItemFactory: AddHyperLinkMenuItemFactory,
            },
        },
    },
    [ContextMenuPosition.PARAGRAPH]: {
        [ContextMenuGroup.LAYOUT]: {
            [INSERT_BELLOW_MENU_ID]: {
                [ShowDocHyperLinkEditPopupOperation.id]: {
                    order: 6,
                    menuItemFactory: AddHyperLinkMenuItemFactory,
                },
            },
        },
        [EMPTY_PARAGRAPH_MENU_ID]: {
            [ContextMenuGroup.LAYOUT]: {
                [ShowDocHyperLinkEditPopupOperation.id]: {
                    order: 6,
                    menuItemFactory: AddHyperLinkMenuItemFactory,
                },
            },
        },
    },
};
