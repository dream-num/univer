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
import { DOC_CONTENT_INSERT_MENU_ID, DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID, DOC_PARAGRAPH_T_INSERT_MENU_ID, EMPTY_PARAGRAPH_MENU_ID, INSERT_BELLOW_MENU_ID } from '@univerjs/docs-ui';
import { ContextMenuGroup, ContextMenuPosition, RibbonInsertGroup } from '@univerjs/ui';
import { InsertDocEllipseShapeCommand, InsertDocRectangleShapeCommand } from '../commands/commands/insert-shape.command';
import {
    DOCS_IMAGE_MENU_ID,
    IMAGE_MENU_UPLOAD_FLOAT_ID,
    ImageMenuFactory,
    UploadFloatImageBelowMenuFactory,
    UploadFloatImageMenuFactory,
} from './image.menu';
import {
    DOCS_SHAPE_BELOW_MENU_ID,
    DOCS_SHAPE_MENU_ID,
    InsertEllipseShapeBelowMenuFactory,
    InsertEllipseShapeMenuFactory,
    InsertRectangleShapeBelowMenuFactory,
    InsertRectangleShapeMenuFactory,
    ShapeBelowMenuFactory,
    ShapeMenuFactory,
} from './shape.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonInsertGroup.MEDIA]: {
        [DOCS_IMAGE_MENU_ID]: {
            order: 0,
            menuItemFactory: ImageMenuFactory,
            [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
                order: 0,
                menuItemFactory: UploadFloatImageMenuFactory,
            },
        },
    },
    [ContextMenuPosition.PARAGRAPH]: {
        [ContextMenuGroup.LAYOUT]: {
            [INSERT_BELLOW_MENU_ID]: {
                [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
                    order: 5,
                    menuItemFactory: UploadFloatImageMenuFactory,
                },
            },
        },
        [EMPTY_PARAGRAPH_MENU_ID]: {
            [ContextMenuGroup.LAYOUT]: {
                [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
                    order: 5,
                    menuItemFactory: UploadFloatImageMenuFactory,
                },
            },
        },
        [DOC_CONTENT_INSERT_MENU_ID]: {
            [ContextMenuGroup.LAYOUT]: {
                [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
                    order: 5,
                    menuItemFactory: UploadFloatImageMenuFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_INSERT_MENU_ID]: {
            insert: {
                [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
                    order: 1,
                    menuItemFactory: UploadFloatImageMenuFactory,
                },
                [DOCS_SHAPE_MENU_ID]: {
                    order: 2,
                    menuItemFactory: ShapeMenuFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID]: {
            insert: {
                [`${IMAGE_MENU_UPLOAD_FLOAT_ID}.below`]: {
                    order: 1,
                    menuItemFactory: UploadFloatImageBelowMenuFactory,
                },
                [DOCS_SHAPE_BELOW_MENU_ID]: {
                    order: 2,
                    menuItemFactory: ShapeBelowMenuFactory,
                },
            },
        },
        [DOCS_SHAPE_MENU_ID]: {
            shapes: {
                order: 0,
                [InsertDocRectangleShapeCommand.id]: {
                    order: 0,
                    menuItemFactory: InsertRectangleShapeMenuFactory,
                },
                [InsertDocEllipseShapeCommand.id]: {
                    order: 1,
                    menuItemFactory: InsertEllipseShapeMenuFactory,
                },
            },
        },
        [DOCS_SHAPE_BELOW_MENU_ID]: {
            shapes: {
                order: 0,
                [`${InsertDocRectangleShapeCommand.id}.below`]: {
                    order: 0,
                    menuItemFactory: InsertRectangleShapeBelowMenuFactory,
                },
                [`${InsertDocEllipseShapeCommand.id}.below`]: {
                    order: 1,
                    menuItemFactory: InsertEllipseShapeBelowMenuFactory,
                },
            },
        },
    },
};
