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
import { Observable } from 'rxjs';
import { DeleteLeftCommand, TextSelectionManagerService } from '@univerjs/docs';
import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../../commands/commands/clipboard.command';

const getDisableOnCollapsedObservable = (accessor: IAccessor) => {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    return new Observable<boolean>((subscriber) => {
        const observable = textSelectionManagerService.textSelection$.subscribe((selections) => {
            const range = textSelectionManagerService.getActiveRange();
            if (range && !range.collapsed) {
                subscriber.next(false);
            } else {
                subscriber.next(true);
            }
        });

        return () => observable.unsubscribe();
    });
};

export const CopyMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocCopyCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.copy',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const CutMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocCutCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.cut',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const PasteMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocPasteCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecial',
        title: 'rightClick.paste',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const DeleteMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DeleteLeftCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecial',
        title: 'rightClick.delete',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};
