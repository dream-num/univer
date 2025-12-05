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
import { ContextMenuGroup, ContextMenuPosition, RibbonInsertGroup } from '@univerjs/ui';
import { InsertCellImageCommand, InsertFloatImageCommand } from '../commands/commands/insert-image.command';
import { SaveCellImagesCommand } from '../commands/commands/save-cell-images.command';
import { ImageMenuFactory, SHEETS_IMAGE_MENU_ID, UploadCellImageMenuFactory, UploadFloatImageMenuFactory } from '../views/menu/image.menu';
import { SaveCellImagesMenuFactory } from '../views/menu/save-images.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonInsertGroup.MEDIA]: {
        [SHEETS_IMAGE_MENU_ID]: {
            order: 0,
            menuItemFactory: ImageMenuFactory,
            [InsertFloatImageCommand.id]: {
                order: 0,
                menuItemFactory: UploadFloatImageMenuFactory,
            },
            [InsertCellImageCommand.id]: {
                order: 1,
                menuItemFactory: UploadCellImageMenuFactory,
            },
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
            [SaveCellImagesCommand.id]: {
                order: 10,
                menuItemFactory: SaveCellImagesMenuFactory,
            },
        },
    },
    [ContextMenuPosition.COL_HEADER]: {
        [ContextMenuGroup.OTHERS]: {
            [SaveCellImagesCommand.id]: {
                order: 10,
                menuItemFactory: SaveCellImagesMenuFactory,
            },
        },
    },
    [ContextMenuPosition.ROW_HEADER]: {
        [ContextMenuGroup.OTHERS]: {
            [SaveCellImagesCommand.id]: {
                order: 10,
                menuItemFactory: SaveCellImagesMenuFactory,
            },
        },
    },
};
