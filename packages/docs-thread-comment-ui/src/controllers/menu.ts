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
import { UniverInstanceType } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { DocSkeletonManagerService, TextSelectionManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { debounceTime, Observable } from 'rxjs';
import { StartAddCommentOperation } from '../commands/operations/show-comment-panel.operation';

export const shouldDisableAddComment = (accessor: IAccessor) => {
    const renderManagerService = accessor.get(IRenderManagerService);
    const render = renderManagerService.getCurrent();
    const skeleton = render?.with(DocSkeletonManagerService).getSkeleton();
    const editArea = skeleton?.getViewModel().getEditArea();
    if (editArea === DocumentEditArea.FOOTER || editArea === DocumentEditArea.HEADER) {
        return true;
    }

    return false;
};

export function AddDocCommentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: StartAddCommentOperation.id,
        group: MenuGroup.CONTEXT_MENU_DATA,
        type: MenuItemType.BUTTON,
        icon: 'CommentSingle',
        title: 'threadCommentUI.panel.addComment',
        tooltip: 'threadCommentUI.panel.addComment',
        positions: [MenuPosition.TOOLBAR_START, MenuPosition.CONTEXT_MENU],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: new Observable(function (subscribe) {
            const textSelectionService = accessor.get(TextSelectionManagerService);
            const observer = textSelectionService.textSelection$.pipe(debounceTime(16)).subscribe(() => {
                subscribe.next(shouldDisableAddComment(accessor));
            });

            return () => {
                observer.unsubscribe();
            };
        }),
    };
}
