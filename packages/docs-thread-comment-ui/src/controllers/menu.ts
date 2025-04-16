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
import type { IMenuButtonItem } from '@univerjs/ui';
import { IUniverInstanceService, SHEET_EDITOR_UNITS, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService, withCurrentTypeOfRenderer } from '@univerjs/engine-render';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { debounceTime, Observable } from 'rxjs';
import { StartAddCommentOperation, ToggleCommentPanelOperation } from '../commands/operations/show-comment-panel.operation';

export const shouldDisableAddComment = (accessor: IAccessor) => {
    const renderManagerService = accessor.get(IRenderManagerService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const skeleton = withCurrentTypeOfRenderer(
        UniverInstanceType.UNIVER_DOC,
        DocSkeletonManagerService,
        accessor.get(IUniverInstanceService),
        renderManagerService
    )?.getSkeleton();

    const editArea = skeleton?.getViewModel().getEditArea();
    if (editArea === DocumentEditArea.FOOTER || editArea === DocumentEditArea.HEADER) {
        return true;
    }

    const range = docSelectionManagerService.getActiveTextRange();

    if (range == null || range.collapsed) {
        return true;
    }

    return false;
};

export function AddDocCommentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: StartAddCommentOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'CommentSingle',
        title: 'threadCommentUI.panel.addComment',
        tooltip: 'threadCommentUI.panel.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, SHEET_EDITOR_UNITS),
        disabled$: new Observable(function (subscribe) {
            const textSelectionService = accessor.get(DocSelectionManagerService);
            const observer = textSelectionService.textSelection$.pipe(debounceTime(16)).subscribe(() => {
                subscribe.next(shouldDisableAddComment(accessor));
            });

            return () => {
                observer.unsubscribe();
            };
        }),
    };
}

export function ToolbarDocCommentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ToggleCommentPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'CommentSingle',
        title: 'threadCommentUI.panel.addComment',
        tooltip: 'threadCommentUI.panel.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
