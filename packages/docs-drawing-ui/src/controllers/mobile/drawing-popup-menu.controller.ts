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

import type { IImagePopupMenuItem } from '@univerjs/drawing-ui';
import { DrawingTypeEnum } from '@univerjs/core';
import { MOBILE_DOC_ELEMENT_MENU } from '@univerjs/docs-ui';
import { COMPONENT_MOBILE_IMAGE_POPUP_MENU } from '@univerjs/drawing-ui';
import { DocDrawingPopupMenuController } from '../../menu/drawing-popup-menu.controller';

export class MobileDocDrawingPopupMenuController extends DocDrawingPopupMenuController {
    protected override _getPopupComponent(drawingType: number): string {
        return drawingType === DrawingTypeEnum.DRAWING_IMAGE || drawingType === DrawingTypeEnum.DRAWING_CHART
            ? COMPONENT_MOBILE_IMAGE_POPUP_MENU
            : MOBILE_DOC_ELEMENT_MENU;
    }

    protected override _resolvePopupMenuItems(defaultItems: IImagePopupMenuItem[], customItems: IImagePopupMenuItem[] | null, drawingType: number): IImagePopupMenuItem[] {
        if (drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
            return defaultItems.slice(0, 3);
        }
        if (drawingType === DrawingTypeEnum.DRAWING_CHART) {
            return [{ ...defaultItems[0], label: 'docs-drawing-ui.image-popup.edit' }, defaultItems[2]];
        }
        return super._resolvePopupMenuItems(defaultItems, customItems, drawingType);
    }
}
