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

import { type IAccessor, IContextService } from '@univerjs/core';
import { type IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/ui';
import { startWith } from 'rxjs';
import { CROSSHAIR_HIGHLIGHT_TURNED_ON, ToggleCrosshairHighlightOperation } from '../commands/operations/operation';

export function CrosshairMenuItemFactory(accessor: IAccessor): IMenuButtonItem<boolean> {
    const contextService = accessor.get(IContextService);

    return {
        id: ToggleCrosshairHighlightOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'crosshair',
        title: 'Crosshair Highlight',
        tooltip: 'Toggle crosshair highlight',
        positions: [MenuPosition.FOOTER],
        activated$: contextService.subscribeContextValue$(CROSSHAIR_HIGHLIGHT_TURNED_ON).pipe(startWith(false)),
    };
}
