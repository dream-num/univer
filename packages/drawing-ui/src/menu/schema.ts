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

import type { MenuSchemaType } from '@univerjs/ui';
import { ContextMenuGroup, ContextMenuPosition } from '@univerjs/ui';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../commands/operations/drawing-group.operation';
import {
    DRAWING_ALIGN_BOTTOM_CONTEXT_MENU_ID,
    DRAWING_ALIGN_CENTER_CONTEXT_MENU_ID,
    DRAWING_ALIGN_CONTEXT_MENU_ID,
    DRAWING_ALIGN_HORIZON_CONTEXT_MENU_ID,
    DRAWING_ALIGN_LEFT_CONTEXT_MENU_ID,
    DRAWING_ALIGN_MIDDLE_CONTEXT_MENU_ID,
    DRAWING_ALIGN_RIGHT_CONTEXT_MENU_ID,
    DRAWING_ALIGN_TOP_CONTEXT_MENU_ID,
    DRAWING_ALIGN_VERTICAL_CONTEXT_MENU_ID,
    DrawingAlignContextMenuItemFactory,
    SetDrawingAlignBottomMenuItemFactory,
    SetDrawingAlignCenterMenuItemFactory,
    SetDrawingAlignHorizonMenuItemFactory,
    SetDrawingAlignLeftMenuItemFactory,
    SetDrawingAlignMiddleMenuItemFactory,
    SetDrawingAlignRightMenuItemFactory,
    SetDrawingAlignTopMenuItemFactory,
    SetDrawingAlignVerticalMenuItemFactory,
} from './align.menu';
import {
    DRAWING_ARRANGE_BACK_CONTEXT_MENU_ID,
    DRAWING_ARRANGE_BACKWARD_CONTEXT_MENU_ID,
    DRAWING_ARRANGE_CONTEXT_MENU_ID,
    DRAWING_ARRANGE_FORWARD_CONTEXT_MENU_ID,
    DRAWING_ARRANGE_FRONT_CONTEXT_MENU_ID,
    DrawingArrangeContextMenuItemFactory,
    SetDrawingArrangeBackMenuItemFactory,
    SetDrawingArrangeBackwardMenuItemFactory,
    SetDrawingArrangeForwardMenuItemFactory,
    SetDrawingArrangeFrontMenuItemFactory,
} from './arrange.menu';
import { CancelDrawingGroupMenuItemFactory, DRAWING_GROUP_CONTEXT_MENU_ID, DrawingGroupContextMenuItemFactory, SetDrawingGroupMenuItemFactory } from './group.menu';

export const menuSchema: MenuSchemaType = {
    [ContextMenuPosition.DRAWING]: {
        [ContextMenuGroup.OTHERS]: {
            [DRAWING_GROUP_CONTEXT_MENU_ID]: {
                order: 1,
                menuItemFactory: DrawingGroupContextMenuItemFactory,
                [SetDrawingGroupOperation.id]: {
                    order: 0,
                    menuItemFactory: SetDrawingGroupMenuItemFactory,
                },
                [CancelDrawingGroupOperation.id]: {
                    order: 1,
                    menuItemFactory: CancelDrawingGroupMenuItemFactory,
                },
            },
            [DRAWING_ARRANGE_CONTEXT_MENU_ID]: {
                order: 2,
                menuItemFactory: DrawingArrangeContextMenuItemFactory,
                [DRAWING_ARRANGE_FRONT_CONTEXT_MENU_ID]: {
                    order: 0,
                    menuItemFactory: SetDrawingArrangeFrontMenuItemFactory,
                },
                [DRAWING_ARRANGE_FORWARD_CONTEXT_MENU_ID]: {
                    order: 1,
                    menuItemFactory: SetDrawingArrangeForwardMenuItemFactory,
                },
                [DRAWING_ARRANGE_BACK_CONTEXT_MENU_ID]: {
                    order: 2,
                    menuItemFactory: SetDrawingArrangeBackMenuItemFactory,
                },
                [DRAWING_ARRANGE_BACKWARD_CONTEXT_MENU_ID]: {
                    order: 3,
                    menuItemFactory: SetDrawingArrangeBackwardMenuItemFactory,
                },
            },
            [DRAWING_ALIGN_CONTEXT_MENU_ID]: {
                order: 3,
                menuItemFactory: DrawingAlignContextMenuItemFactory,
                [DRAWING_ALIGN_LEFT_CONTEXT_MENU_ID]: {
                    order: 0,
                    menuItemFactory: SetDrawingAlignLeftMenuItemFactory,
                },
                [DRAWING_ALIGN_CENTER_CONTEXT_MENU_ID]: {
                    order: 1,
                    menuItemFactory: SetDrawingAlignCenterMenuItemFactory,
                },
                [DRAWING_ALIGN_RIGHT_CONTEXT_MENU_ID]: {
                    order: 2,
                    menuItemFactory: SetDrawingAlignRightMenuItemFactory,
                },
                [DRAWING_ALIGN_TOP_CONTEXT_MENU_ID]: {
                    order: 3,
                    menuItemFactory: SetDrawingAlignTopMenuItemFactory,
                },
                [DRAWING_ALIGN_MIDDLE_CONTEXT_MENU_ID]: {
                    order: 4,
                    menuItemFactory: SetDrawingAlignMiddleMenuItemFactory,
                },
                [DRAWING_ALIGN_BOTTOM_CONTEXT_MENU_ID]: {
                    order: 5,
                    menuItemFactory: SetDrawingAlignBottomMenuItemFactory,
                },
                [DRAWING_ALIGN_HORIZON_CONTEXT_MENU_ID]: {
                    order: 6,
                    menuItemFactory: SetDrawingAlignHorizonMenuItemFactory,
                },
                [DRAWING_ALIGN_VERTICAL_CONTEXT_MENU_ID]: {
                    order: 7,
                    menuItemFactory: SetDrawingAlignVerticalMenuItemFactory,
                },
            },
        },
    },
};
