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

import { IPermissionService, IUniverInstanceService, SHEET_EDITOR_UNITS, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, getDocumentPermissionValue } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService, withCurrentTypeOfRenderer } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, debounceTime, map, startWith } from 'rxjs';
import {
    AddDocDrawingCommentOperation,
    StartAddCommentOperation,
    ToggleCommentPanelOperation,
} from '../commands/operations/show-comment-panel.operation';

type MenuAccessor = Parameters<typeof getMenuHiddenObservable>[0];

function getCommentPermissionDisabled$(accessor: MenuAccessor) {
    const instanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    return combineLatest([
        instanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC),
        permissionService.permissionPointUpdate$.pipe(startWith(undefined)),
    ]).pipe(map(([document]) => !document || !getDocumentPermissionValue(
        permissionService,
        document.getUnitId(),
        document.getUnitId(),
        UnitAction.Comment
    )));
}

export function AddDocDrawingCommentMenuItemFactory(accessor: MenuAccessor) {
    return {
        id: AddDocDrawingCommentOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'InsertCommentDoubleIcon',
        title: 'docs-thread-comment-ui.panel.addComment',
        tooltip: 'docs-thread-comment-ui.panel.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: getCommentPermissionDisabled$(accessor),
    };
}

export const shouldDisableAddComment = (accessor: MenuAccessor) => {
    const renderManagerService = accessor.get(IRenderManagerService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const instanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const document = instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
    if (!document || !getDocumentPermissionValue(
        permissionService,
        document.getUnitId(),
        document.getUnitId(),
        UnitAction.Comment
    )) {
        return true;
    }
    const skeleton = withCurrentTypeOfRenderer(
        UniverInstanceType.UNIVER_DOC,
        DocSkeletonManagerService,
        instanceService,
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

export function AddDocCommentMenuItemFactory(accessor: MenuAccessor) {
    return {
        id: StartAddCommentOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'InsertCommentDoubleIcon',
        title: 'docs-thread-comment-ui.panel.addComment',
        tooltip: 'docs-thread-comment-ui.panel.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, SHEET_EDITOR_UNITS),
        disabled$: combineLatest([
            accessor.get(DocSelectionManagerService).textSelection$.pipe(
                debounceTime(16),
                map(() => shouldDisableAddComment(accessor)),
                startWith(shouldDisableAddComment(accessor))
            ),
            getCommentPermissionDisabled$(accessor),
        ]).pipe(map(([selectionDisabled, permissionDisabled]) =>
            selectionDisabled || permissionDisabled)),
    };
}

export function ToolbarDocCommentMenuItemFactory(accessor: MenuAccessor) {
    return {
        id: ToggleCommentPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'CommentIcon',
        title: 'docs-thread-comment-ui.panel.openComments',
        tooltip: 'docs-thread-comment-ui.panel.openComments',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
