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
import { ArrangeTypeEnum } from '@univerjs/core';
import { MenuItemType } from '@univerjs/ui';
import { SetDrawingArrangeOperation } from '../commands/operations/drawing-arrange.operation';

export const DRAWING_ARRANGE_CONTEXT_MENU_ID = 'contextMenu.drawing-arrange';
export function DrawingArrangeContextMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: DRAWING_ARRANGE_CONTEXT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'TopmostIcon',
        title: 'image-panel.arrange.title',
    };
}

export const DRAWING_ARRANGE_FRONT_CONTEXT_MENU_ID = 'contextMenu.drawing-arrange-front';
export function SetDrawingArrangeFrontMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ARRANGE_FRONT_CONTEXT_MENU_ID,
        commandId: SetDrawingArrangeOperation.id,
        params: {
            arrangeType: ArrangeTypeEnum.front,
        },
        type: MenuItemType.BUTTON,
        icon: 'TopmostIcon',
        title: 'image-panel.arrange.front',
    };
}

export const DRAWING_ARRANGE_FORWARD_CONTEXT_MENU_ID = 'contextMenu.drawing-arrange-forward';
export function SetDrawingArrangeForwardMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ARRANGE_FORWARD_CONTEXT_MENU_ID,
        commandId: SetDrawingArrangeOperation.id,
        params: {
            arrangeType: ArrangeTypeEnum.forward,
        },
        type: MenuItemType.BUTTON,
        icon: 'MoveUpIcon',
        title: 'image-panel.arrange.forward',
    };
}

export const DRAWING_ARRANGE_BACK_CONTEXT_MENU_ID = 'contextMenu.drawing-arrange-back';
export function SetDrawingArrangeBackMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ARRANGE_BACK_CONTEXT_MENU_ID,
        commandId: SetDrawingArrangeOperation.id,
        params: {
            arrangeType: ArrangeTypeEnum.back,
        },
        type: MenuItemType.BUTTON,
        icon: 'BottomIcon',
        title: 'image-panel.arrange.back',
    };
}

export const DRAWING_ARRANGE_BACKWARD_CONTEXT_MENU_ID = 'contextMenu.drawing-arrange-backward';
export function SetDrawingArrangeBackwardMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ARRANGE_BACKWARD_CONTEXT_MENU_ID,
        commandId: SetDrawingArrangeOperation.id,
        params: {
            arrangeType: ArrangeTypeEnum.backward,
        },
        type: MenuItemType.BUTTON,
        icon: 'MoveDownIcon',
        title: 'image-panel.arrange.backward',
    };
}
