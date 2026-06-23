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

import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { MenuItemType } from '@univerjs/ui';
import {
    SetDrawingArrangeBackOperation,
    SetDrawingArrangeBackwardOperation,
    SetDrawingArrangeForwardOperation,
    SetDrawingArrangeFrontOperation,
} from '../commands/operations/drawing-arrange.operation';

export const DRAWING_ARRANGE_CONTEXT_MENU_ID = 'contextMenu.drawing-arrange';
export function DrawingArrangeContextMenuItemFactory(): IMenuSelectorItem<LocaleKey> {
    return {
        id: DRAWING_ARRANGE_CONTEXT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'TopmostIcon',
        title: 'drawing-ui.image-panel.arrange.title',
    };
}

export function SetDrawingArrangeFrontMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: SetDrawingArrangeFrontOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'TopmostIcon',
        title: 'drawing-ui.image-panel.arrange.front',
    };
}

export function SetDrawingArrangeForwardMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: SetDrawingArrangeForwardOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'MoveUpIcon',
        title: 'drawing-ui.image-panel.arrange.forward',
    };
}

export function SetDrawingArrangeBackMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: SetDrawingArrangeBackOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'BottomIcon',
        title: 'drawing-ui.image-panel.arrange.back',
    };
}

export function SetDrawingArrangeBackwardMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: SetDrawingArrangeBackwardOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'MoveDownIcon',
        title: 'drawing-ui.image-panel.arrange.backward',
    };
}
