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
import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { resolveDrawingRotateEnabled } from '../rotate-enabled';

const unitId = 'unit-1';
const subUnitId = 'sheet-1';

function createDrawing(drawingId: string, drawingType = DrawingTypeEnum.DRAWING_IMAGE, rotateEnabled?: boolean): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType,
        transform: {
            left: 0,
            top: 0,
            width: 10,
            height: 10,
            rotateEnabled,
        },
    };
}

function createGroup(drawingId: string, rotateEnabled?: boolean): IDrawingParam {
    return createDrawing(drawingId, DrawingTypeEnum.DRAWING_GROUP, rotateEnabled);
}

describe('resolveDrawingRotateEnabled', () => {
    it('keeps a group rotatable when all descendants are rotatable', () => {
        const group = createGroup('group');
        const child = createDrawing('shape');

        expect(resolveDrawingRotateEnabled(group, {
            getChildren: (drawing) => drawing.drawingId === 'group' ? [child] : undefined,
        })).toBe(true);
    });

    it('disables a group when a nested descendant cannot rotate', () => {
        const root = createGroup('root');
        const nested = createGroup('nested');
        const child = createDrawing('shape', DrawingTypeEnum.DRAWING_SHAPE, false);

        expect(resolveDrawingRotateEnabled(root, {
            getChildren: (drawing) => {
                if (drawing.drawingId === 'root') return [nested];
                if (drawing.drawingId === 'nested') return [child];
                return undefined;
            },
        })).toBe(false);
    });

    it('recomputes a stale group rotate flag from resolvable descendants', () => {
        const group = createGroup('group', false);
        const child = createDrawing('shape');

        expect(resolveDrawingRotateEnabled(group, {
            getChildren: (drawing) => drawing.drawingId === 'group' ? [child] : undefined,
        })).toBe(true);
    });

    it('falls back to a group persisted rotate flag when children cannot be resolved', () => {
        expect(resolveDrawingRotateEnabled(createGroup('group', false))).toBe(false);
    });

    it('uses known non-rotatable drawing types for old data without rotate flags', () => {
        const group = createGroup('group');
        const chart = createDrawing('chart', DrawingTypeEnum.DRAWING_CHART);

        expect(resolveDrawingRotateEnabled(group, {
            getChildren: (drawing) => drawing.drawingId === 'group' ? [chart] : undefined,
            isKnownNonRotatableType: (drawingType) => drawingType === DrawingTypeEnum.DRAWING_CHART,
        })).toBe(false);
    });

    it('keeps cyclic group graphs rotatable instead of recursing forever', () => {
        const group = createGroup('group');

        expect(resolveDrawingRotateEnabled(group, {
            getChildren: () => [group],
        })).toBe(true);
    });

    it('uses render object transformer config as a runtime rotation guard', () => {
        const shape = createDrawing('shape');

        expect(resolveDrawingRotateEnabled(shape, {
            getRenderObject: () => ({ transformerConfig: { rotateEnabled: false } }),
        })).toBe(false);
    });
});
