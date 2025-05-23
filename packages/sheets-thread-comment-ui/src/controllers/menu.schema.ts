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
import { ToggleSheetCommentPanelOperation } from '@univerjs/thread-comment-ui';
import { ContextMenuGroup, ContextMenuPosition, RibbonInsertGroup } from '@univerjs/ui';
import { ShowAddSheetCommentModalOperation } from '../commands/operations/comment.operation';
import { threadCommentMenuFactory, threadPanelMenuFactory } from './menu';

export const menuSchema: MenuSchemaType = {
    [RibbonInsertGroup.MEDIA]: {
        [ToggleSheetCommentPanelOperation.id]: {
            order: 2,
            menuItemFactory: threadPanelMenuFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
            [ShowAddSheetCommentModalOperation.id]: {
                order: 0,
                menuItemFactory: threadCommentMenuFactory,
            },
        },
    },
};
