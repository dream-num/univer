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
import type { IMenuButtonItem, IShortcutItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { whenDocAndEditorFocused } from '@univerjs/docs-ui';
import { getMenuHiddenObservable, KeyCode, MenuItemType, MetaKeys } from '@univerjs/ui';
import { debounceTime, Observable } from 'rxjs';
import { shouldDisableAddLink, ShowDocHyperLinkEditPopupOperation } from '../commands/operations/popup.operation';

export const DOC_LINK_ICON = 'doc-hyper-link-icon';

export function AddHyperLinkMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ShowDocHyperLinkEditPopupOperation.id,
        type: MenuItemType.BUTTON,
        icon: DOC_LINK_ICON,
        title: 'docLink.menu.tooltip',
        tooltip: 'docLink.menu.tooltip',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: new Observable(function (subscribe) {
            const textSelectionService = accessor.get(DocSelectionManagerService);
            const observer = textSelectionService.textSelection$.pipe(debounceTime(16)).subscribe(() => {
                subscribe.next(shouldDisableAddLink(accessor));
            });

            return () => {
                observer.unsubscribe();
            };
        }),
    };
}

export const addLinkShortcut: IShortcutItem = {
    id: ShowDocHyperLinkEditPopupOperation.id,
    binding: MetaKeys.CTRL_COMMAND | KeyCode.K,
    description: 'docLink.menu.tooltip',
    preconditions: whenDocAndEditorFocused,
};
