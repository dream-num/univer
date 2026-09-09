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
import { ContextMenuGroup, ContextMenuPosition, FloatingObjectToolbarPosition, RibbonInsertGroup } from '@univerjs/ui';
import { AddSheetDrawingCommentOperation, ToggleSheetCommentPanelOperation } from '../commands/operations/comment.operation';
import { ShowAddSheetCommentMobileOperation } from '../commands/operations/mobile/show-add-sheet-comment.operation';
import { drawingCommentMenuFactory, threadPanelMenuFactory } from './menu';
import { mobileContextThreadCommentMenuFactory, mobileThreadCommentMenuFactory } from './mobile-menu';

export const mobileMenuSchema: MenuSchemaType = {
    [RibbonInsertGroup.MEDIA]: {
        [ToggleSheetCommentPanelOperation.id]: {
            order: 2,
            gridLayout: { row: 1, column: 3, showLabel: true },
            menuItemFactory: threadPanelMenuFactory,
        },
        [ShowAddSheetCommentMobileOperation.id]: {
            order: 2.1,
            gridLayout: { row: 2, column: 3, showLabel: true },
            menuItemFactory: mobileThreadCommentMenuFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
            [ShowAddSheetCommentMobileOperation.id]: {
                order: 0,
                menuItemFactory: mobileContextThreadCommentMenuFactory,
            },
        },
    },
    [FloatingObjectToolbarPosition.SHEET]: {
        [AddSheetDrawingCommentOperation.id]: {
            order: 10,
            menuItemFactory: drawingCommentMenuFactory,
        },
    },
    [ContextMenuPosition.DRAWING]: {
        [ContextMenuGroup.OTHERS]: {
            [AddSheetDrawingCommentOperation.id]: {
                order: 0,
                menuItemFactory: drawingCommentMenuFactory,
            },
        },
    },
};
