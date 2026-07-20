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
import type { LocaleKey } from '../locale/types';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, ILayoutService, MenuItemType, ToggleFullscreenOperation } from '@univerjs/ui';
import { distinctUntilChanged, fromEvent, map, merge, of } from 'rxjs';

export function FullscreenMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const root = accessor.get(ILayoutService).rootContainerElement;
    const fullscreen$ = root
        ? merge(of(null), fromEvent(root.ownerDocument, 'fullscreenchange')).pipe(
            map(() => root.ownerDocument.fullscreenElement === root),
            distinctUntilChanged()
        )
        : of(false);

    return {
        id: ToggleFullscreenOperation.id,
        type: MenuItemType.BUTTON,
        tooltip: 'sheets-ui.toolbar.fullscreen',
        icon: fullscreen$.pipe(map((fullscreen) => fullscreen ? 'ShrinkIcon' : 'ExpandIcon')),
        activated$: fullscreen$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
