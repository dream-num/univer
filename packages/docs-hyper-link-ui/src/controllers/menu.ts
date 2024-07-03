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

import type { IAccessor } from '@wendellhu/redi';
import type { DocumentDataModel } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { debounceTime, Observable } from 'rxjs';
import { TextSelectionManagerService } from '@univerjs/docs';
import { ShowDocHyperLinkEditPopupOperation } from '../commands/operations/popup.operation';

export const DOC_LINK_ICON = 'doc-hyper-link-icon';

export function AddHyperLinkMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ShowDocHyperLinkEditPopupOperation.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: DOC_LINK_ICON,
        title: 'hyperLinkUI.panel.addComment',
        tooltip: 'hyperLinkUI.panel.addComment',
        positions: [MenuPosition.TOOLBAR_START, MenuPosition.CONTEXT_MENU],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: new Observable(function (subscribe) {
            const textSelectionService = accessor.get(TextSelectionManagerService);
            const univerInstanceService = accessor.get(IUniverInstanceService);
            const observer = textSelectionService.textSelection$.pipe(debounceTime(16)).subscribe(() => {
                const activeRange = textSelectionService.getActiveRange();
                const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                if (!doc || !activeRange || activeRange.collapsed) {
                    subscribe.next(true);
                    return;
                }

                const paragraphs = doc.getBody()?.paragraphs;
                if (!paragraphs) {
                    subscribe.next(true);
                    return;
                }

                for (let i = 0, len = paragraphs.length; i < len; i++) {
                    const p = paragraphs[i];
                    if (activeRange.startOffset <= p.startIndex && activeRange.endOffset > p.startIndex) {
                        subscribe.next(true);
                        return;
                    }

                    if (p.startIndex > activeRange.endOffset) {
                        break;
                    }
                }

                subscribe.next(false);
            });

            return () => {
                observer.unsubscribe();
            };
        }),
    };
}

