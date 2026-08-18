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
import { createDrawingCopyPlan, getOrCreateDrawingCopyPlan } from '../drawing-copy-plan';

const unitId = 'unit';
const subUnitId = 'subUnit';

function createDrawing(drawingId: string, overrides: Partial<IDrawingParam> = {}): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        ...overrides,
    };
}

describe('drawing copy plan', () => {
    it('creates one copy id map for group children and chart drawings', () => {
        let nextId = 0;
        const plan = createDrawingCopyPlan([
            createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP }),
            createDrawing('image-child', { groupId: 'group' }),
            createDrawing('chart-child', { drawingType: DrawingTypeEnum.DRAWING_CHART, groupId: 'group' }),
        ], {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => `copy-${nextId++}`,
        });

        expect(plan.idMap.size).toBe(3);
        expect(plan.idMap.get('group')).toBe('copy-0');
        expect(plan.idMap.get('image-child')).toBe('copy-1');
        expect(plan.idMap.get('chart-child')).toBe('copy-2');
        expect(plan.drawings).toEqual([
            expect.objectContaining({ drawingId: 'copy-0', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-1', groupId: 'copy-0', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-2', groupId: 'copy-0', subUnitId: 'copied-sheet' }),
        ]);
    });

    it('keeps copied drawing unchanged when the id map cannot resolve its current id', () => {
        let readCount = 0;
        const dynamicDrawing = {
            ...createDrawing('registered-id'),
            get drawingId() {
                readCount += 1;
                return readCount <= 2 ? 'registered-id' : 'unmapped-id';
            },
        } as IDrawingParam;

        const plan = createDrawingCopyPlan([dynamicDrawing], {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => 'copy-0',
        });

        expect(plan.idMap.get('registered-id')).toBe('copy-0');
        expect(plan.drawings[0]).toEqual(expect.objectContaining({
            drawingId: 'unmapped-id',
            subUnitId,
        }));
    });

    it('creates uncached copy plans and reuses cached complete copy plans', () => {
        let nextId = 0;
        const options = {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => `copy-${nextId++}`,
        };
        const child = createDrawing('child', { groupId: 'missing-group' });
        const uncachedPlan = getOrCreateDrawingCopyPlan(undefined, [child], options);

        expect(uncachedPlan.drawings[0]).toEqual(expect.objectContaining({
            drawingId: 'copy-0',
            subUnitId: 'copied-sheet',
        }));
        expect(uncachedPlan.drawings[0].groupId).toBeUndefined();

        const copyContext = new Map<string, unknown>();
        const cachedPlan = getOrCreateDrawingCopyPlan(copyContext, [child], options);

        expect(getOrCreateDrawingCopyPlan(copyContext, [child], options)).toBe(cachedPlan);
    });

    it('extends a cached copy plan with the default id generator when no generator is provided', () => {
        const options = {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
        };
        const copyContext = new Map<string, unknown>();
        const firstPlan = getOrCreateDrawingCopyPlan(copyContext, [createDrawing('child-1')], options);

        const extendedPlan = getOrCreateDrawingCopyPlan(copyContext, [
            createDrawing('child-1'),
            createDrawing('child-2'),
        ], options);

        expect(extendedPlan).toBe(firstPlan);
        expect(extendedPlan.idMap.has('child-2')).toBe(true);
        expect(extendedPlan.drawings.map((drawing) => drawing.subUnitId)).toEqual(['copied-sheet', 'copied-sheet']);
    });

    it('extends a cached copy plan when a later caller provides more drawing graph nodes', () => {
        let nextId = 0;
        const copyContext = new Map<string, unknown>();
        const options = {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => `copy-${nextId++}`,
        };
        const chart = createDrawing('chart-child', { drawingType: DrawingTypeEnum.DRAWING_CHART, groupId: 'group' });
        const firstPlan = getOrCreateDrawingCopyPlan(copyContext, [chart], options);

        expect(firstPlan.drawings[0].groupId).toBeUndefined();

        const extendedPlan = getOrCreateDrawingCopyPlan(copyContext, [
            createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP }),
            createDrawing('image-child', { groupId: 'group' }),
            chart,
        ], options);

        expect(extendedPlan).toBe(firstPlan);
        expect(extendedPlan.idMap.get('chart-child')).toBe('copy-0');
        expect(extendedPlan.idMap.get('group')).toBe('copy-1');
        expect(extendedPlan.idMap.get('image-child')).toBe('copy-2');
        expect(extendedPlan.drawings).toEqual([
            expect.objectContaining({ drawingId: 'copy-1', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-2', groupId: 'copy-1', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-0', groupId: 'copy-1', subUnitId: 'copied-sheet' }),
        ]);
    });
});
