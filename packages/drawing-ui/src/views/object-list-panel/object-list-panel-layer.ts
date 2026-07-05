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

import type { DrawingType } from '@univerjs/core';
import { DrawingTypeEnum } from '@univerjs/core';

export const OBJECT_LIST_FLOATING_SECTION_ID = 'floating';
export const OBJECT_LIST_CANVAS_SECTION_ID = 'canvas';

export type ObjectListPanelSectionId =
    | typeof OBJECT_LIST_FLOATING_SECTION_ID
    | typeof OBJECT_LIST_CANVAS_SECTION_ID;

export function isFloatingObjectListDrawingType(drawingType: DrawingType | null | undefined): boolean {
    return drawingType === DrawingTypeEnum.DRAWING_CHART ||
        drawingType === DrawingTypeEnum.DRAWING_DOM ||
        drawingType === DrawingTypeEnum.DRAWING_UNIT;
}

export function getObjectListPanelSectionIdForDrawingType(drawingType: DrawingType | null | undefined): ObjectListPanelSectionId {
    return isFloatingObjectListDrawingType(drawingType)
        ? OBJECT_LIST_FLOATING_SECTION_ID
        : OBJECT_LIST_CANVAS_SECTION_ID;
}
