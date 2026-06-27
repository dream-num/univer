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

import type { IDrawingParam } from '@univerjs/core';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { resolveSheetDrawingRotateEnabled } from '../rotate-enabled';

const unitId = 'unit-1';
const subUnitId = 'sheet-1';

function createDrawing(drawingId: string, drawingType = DrawingTypeEnum.DRAWING_IMAGE, groupId?: string, rotateEnabled?: boolean): IDrawingParam {
    const transform: IDrawingParam['transform'] = {
        left: 0,
        top: 0,
        width: 10,
        height: 10,
    };
    if (rotateEnabled !== undefined) {
        transform.rotateEnabled = rotateEnabled;
    }

    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType,
        groupId,
        transform,
    };
}

function createGroup(drawingId: string, groupId?: string, rotateEnabled?: boolean): IDrawingParam {
    return createDrawing(drawingId, DrawingTypeEnum.DRAWING_GROUP, groupId, rotateEnabled);
}

function createDrawingService(drawings: readonly IDrawingParam[] = []) {
    return {
        getDrawingsByGroup: (drawing: IDrawingParam) => drawings.filter((child) =>
            child.groupId === drawing.drawingId &&
            child.unitId === drawing.unitId &&
            child.subUnitId === drawing.subUnitId
        ) as ISheetDrawing[],
    };
}

describe('sheet drawing rotate-enabled helpers', () => {
    it('keeps regular drawings rotatable by default', () => {
        expect(resolveSheetDrawingRotateEnabled(createDrawing('shape'), createDrawingService())).toBe(true);
    });

    it('treats chart drawings as non-rotatable without persisted rotate flags', () => {
        const chart = createDrawing('chart', DrawingTypeEnum.DRAWING_CHART);

        expect(Object.prototype.hasOwnProperty.call(chart.transform ?? {}, 'rotateEnabled')).toBe(false);
        expect(resolveSheetDrawingRotateEnabled(chart, createDrawingService())).toBe(false);
    });

    it('treats old chart children as non-rotatable', () => {
        const root = createGroup('root');
        const chart = createDrawing('chart', DrawingTypeEnum.DRAWING_CHART, 'root');

        expect(resolveSheetDrawingRotateEnabled(root, createDrawingService([chart]))).toBe(false);
    });

    it('recomputes stale nested group rotate flags from current children', () => {
        const root = createGroup('root');
        const nested = createGroup('nested', 'root', false);
        const child = createDrawing('shape', DrawingTypeEnum.DRAWING_IMAGE, 'nested');

        expect(resolveSheetDrawingRotateEnabled(root, createDrawingService([nested, child]))).toBe(true);
    });
});
