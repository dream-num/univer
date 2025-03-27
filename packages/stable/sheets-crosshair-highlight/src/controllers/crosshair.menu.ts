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
import type { IMenuSelectorItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { SetCrosshairHighlightColorOperation, ToggleCrosshairHighlightOperation } from '../commands/operations/operation';
import { SheetsCrosshairHighlightService } from '../services/crosshair.service';

export const CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT = 'CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT';

export function CrosshairHighlightMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const crosshairHighlightService = accessor.get(SheetsCrosshairHighlightService);

    return {
        id: ToggleCrosshairHighlightOperation.id,
        tooltip: 'crosshair.button.tooltip',
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'CrossHighlightingSingle',
        selections: [
            {
                label: {
                    name: CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
            },
        ],
        selectionsCommandId: SetCrosshairHighlightColorOperation.id,
        activated$: crosshairHighlightService.enabled$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
