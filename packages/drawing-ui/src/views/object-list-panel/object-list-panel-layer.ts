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
