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

import { describe, expect, it, vi } from 'vitest';
import { Vector2 } from '../basics/vector2';
import { DrawingGroupObject } from '../drawing-group';
import { Group } from '../group';
import { Rect } from '../shape/rect';

function createContext() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
    } as any;
}

describe('drawing group', () => {
    it('handles base bound/ancestor transform and child hit detection', () => {
        const parentGroup = new Group('parent');
        parentGroup.transformByState({
            left: 5,
            top: 8,
            width: 200,
            height: 120,
        });

        const drawingGroup = new DrawingGroupObject('drawing-group');
        drawingGroup.transformByState({
            left: 20,
            top: 30,
            width: 120,
            height: 80,
        });
        drawingGroup.setBaseBound({
            left: 10,
            top: 12,
            width: 100,
            height: 60,
        });
        expect(drawingGroup.getBaseBound()).toEqual({
            left: 10,
            top: 12,
            width: 100,
            height: 60,
        });

        const child = new Rect('child', {
            left: 0,
            top: 0,
            width: 20,
            height: 20,
            fill: '#333333',
        });
        vi.spyOn(child, 'isHit').mockReturnValue(true);
        vi.spyOn(child, 'render').mockImplementation(() => child);

        drawingGroup.addObjects(child);
        parentGroup.addObject(drawingGroup);

        const ancestor = drawingGroup.ancestorTransform.getMatrix();
        expect(ancestor).toHaveLength(6);
        expect(ancestor[4]).toBeTypeOf('number');
        expect(ancestor[5]).toBeTypeOf('number');

        expect(drawingGroup.isHit(Vector2.FromArray([40, 50]))).toBe(true);
        expect(drawingGroup.isHit(Vector2.FromArray([1000, 1000]))).toBe(false);
    });

    it('renders children with group-centered transform', () => {
        const drawingGroup = new DrawingGroupObject('drawing-group-render');
        drawingGroup.transformByState({
            left: 10,
            top: 10,
            width: 100,
            height: 60,
        });
        const child = new Rect('render-child', {
            left: 0,
            top: 0,
            width: 10,
            height: 10,
            fill: '#666666',
        });
        const childRenderSpy = vi.spyOn(child, 'render').mockImplementation(() => child);
        drawingGroup.addObject(child);

        const ctx = createContext();
        drawingGroup.render(ctx, {
            cacheBound: { left: 0, top: 0, right: 500, bottom: 500 },
        } as any);

        expect(ctx.transform).toHaveBeenCalled();
        expect(childRenderSpy).toHaveBeenCalled();
    });
});
