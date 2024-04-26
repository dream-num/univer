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

import { ComponentManager, getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { ToggleSheetCommentPanelOperation } from '@univerjs/thread-comment-ui';
import { UniverInstanceType } from '@univerjs/core';
import { CommentSingle } from '@univerjs/icons';
import { ShowAddSheetCommentModalOperation } from '../commands/operations/comment.operation';

export const threadCommentMenu = (accessor: IAccessor) => {
    const componentManager = accessor.get(ComponentManager);
    const COMMENT_SINGLE = 'comment-single';

    componentManager.register(
        COMMENT_SINGLE,
        CommentSingle
    );

    return {
        id: ShowAddSheetCommentModalOperation.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        icon: COMMENT_SINGLE,
        tooltip: 'sheetThreadComment.menu.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
};

export const threadPanelMenu = (accessor: IAccessor) => {
    return {
        id: ToggleSheetCommentPanelOperation.id,
        type: MenuItemType.BUTTON,
        title: 'sheetThreadComment.menu.commentManagement',
        positions: MenuPosition.TOOLBAR_INSERT,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
};
