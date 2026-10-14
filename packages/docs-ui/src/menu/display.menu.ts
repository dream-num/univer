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

import type { DocumentDataModel, IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, ILayoutService, MenuItemType, ToggleFullscreenOperation } from '@univerjs/ui';
import { distinctUntilChanged, fromEvent, map, merge, of } from 'rxjs';
import { SetDocZoomRatioOperation } from '../commands/operations/set-doc-zoom-ratio.operation';
import { DOC_ZOOM_SHORTCUTS, getDocZoomRatio$ } from '../services/doc-zoom';

export const DOC_ZOOM_RATIO_MENU_ID = 'doc.menu.zoom-ratio';

export function DocZoomRatioMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, number> {
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);

    return {
        id: DOC_ZOOM_RATIO_MENU_ID,
        type: MenuItemType.SELECTOR,
        icon: 'ZoomInIcon',
        tooltip: 'docs-ui.toolbar.zoom',
        selectionsCommandId: SetDocZoomRatioOperation.id,
        selections: DOC_ZOOM_SHORTCUTS.map((value) => ({
            value,
            label: `${value}%`,
            params: () => ({
                unitId: instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getUnitId(),
                zoomRatio: value / 100,
            }),
        })),
        value$: getDocZoomRatio$(commandService, instanceService),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DocFullscreenMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
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
        tooltip: 'docs-ui.toolbar.fullscreen',
        icon: fullscreen$.pipe(map((fullscreen) => fullscreen ? 'ShrinkIcon' : 'ExpandIcon')),
        activated$: fullscreen$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
