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
import { RibbonStartGroup } from '@univerjs/ui';
import { InsertSlideFloatImageCommand } from '../commands/operations/insert-image.operation';
import { InsertSlideShapeRectangleCommand } from '../commands/operations/insert-shape.operation';
import { SlideAddTextCommand } from '../commands/operations/insert-text.operation';
import { SlideImageMenuFactory, SLIDES_IMAGE_MENU_ID, UploadSlideFloatImageMenuFactory } from './image.menu';
import { SHAPE_MENU_ID, SlideShapeMenuFactory, UploadSlideFloatShapeMenuFactory } from './shape.menu';
import { SlideAddTextMenuItemFactory } from './text.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMAT]: {
        [SlideAddTextCommand.id]: {
            order: 0,
            menuItemFactory: SlideAddTextMenuItemFactory,
        },
        [SLIDES_IMAGE_MENU_ID]: {
            order: 0,
            menuItemFactory: SlideImageMenuFactory,
            [InsertSlideFloatImageCommand.id]: {
                order: 0,
                menuItemFactory: UploadSlideFloatImageMenuFactory,
            },
        },
        [SHAPE_MENU_ID]: {
            order: 0,
            menuItemFactory: SlideShapeMenuFactory,
            [InsertSlideShapeRectangleCommand.id]: {
                order: 0,
                menuItemFactory: UploadSlideFloatShapeMenuFactory,
            },
        },
    },
};
