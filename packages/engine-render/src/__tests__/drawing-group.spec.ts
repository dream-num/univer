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
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from '../basics/const';
import { Vector2 } from '../basics/vector2';
import { DrawingGroupObject } from '../drawing-group';
import { Group } from '../group';
import { Rect } from '../shape/rect';

function createContext() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        rect: vi.fn(),
        arc: vi.fn(),
        translate: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        setLineDash: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        lineCap: 'round',
        lineDashOffset: 0,
        lineJoin: 'round',
        miterLimit: 0,
    } as any;
}

function createSceneStub(objectMap: Record<string, Rect | undefined>) {
    return {
        classType: RENDER_CLASS_TYPE.SCENE,
        getParent: () => null,
        getObject: (key: string) => objectMap[key],
        removeObject: vi.fn(),
        setCursor: vi.fn(),
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

    it('covers group object management, transform recalculation and dispose flow', () => {
        const sceneChild = new Rect('scene-child', {
            left: 5,
            top: 8,
            width: 20,
            height: 16,
            fill: '#224466',
        });
        sceneChild.zIndex = 1;

        const directChild = new Rect('direct-child', {
            left: 40,
            top: 25,
            width: 10,
            height: 10,
            fill: '#446622',
        });
        directChild.zIndex = 5;

        const hiddenChild = new Rect('hidden-child', {
            left: 2,
            top: 3,
            width: 8,
            height: 8,
            fill: '#663344',
        });
        hiddenChild.hide();

        const nestedGroup = new Group('nested-group', new Rect('nested-rect', {
            left: 1,
            top: 1,
            width: 4,
            height: 4,
            fill: '#111111',
        }));
        nestedGroup.transformByState({
            left: 30,
            top: 12,
            width: 18,
            height: 10,
        });

        const scene = createSceneStub({
            'scene-child': sceneChild,
        });
        const group = new Group('group-ops');
        group.parent = scene;
        group.transformByState({
            left: 10,
            top: 6,
        });

        group.addObject('scene-child');
        group.addObject(directChild);
        group.addObject(hiddenChild);
        group.addObject(nestedGroup);
        group.addObject('missing-child');

        expect(group.getObjects().length).toBe(4);
        expect(sceneChild.parent).toBe(group);
        expect(sceneChild.isInGroup).toBe(true);
        expect(sceneChild.groupKey).toBe(group.oKey);
        expect(group.maxZIndex).toBe(5);

        const visibleObjects = group.getObjectsByOrder();
        expect(visibleObjects).not.toContain(hiddenChild);
        expect(visibleObjects).toContain(directChild);

        group.cursor = CURSOR_TYPE.POINTER;
        expect(scene.setCursor).toHaveBeenCalledWith(CURSOR_TYPE.POINTER);

        const preWidth = directChild.width;
        const preHeight = directChild.height;
        group.width = group.width + 6;
        group.height = group.height + 4;
        expect(directChild.width).toBeCloseTo(preWidth + 6, 6);
        expect(directChild.height).toBeCloseTo(preHeight + 4, 6);

        const directTransformSpy = vi.spyOn(directChild, 'transformByState');
        group.openSelfSizeMode();
        group.width = 33;
        group.height = 21;
        expect(group.width).toBe(33);
        expect(group.height).toBe(21);
        group.reCalculateObjects();
        expect(directTransformSpy).not.toHaveBeenCalled();
        group.closeSelfSizeMode();

        group.reCalculateObjects();
        expect(directTransformSpy).toHaveBeenCalled();

        const detachedRect = new Rect('detached-rect', {
            left: 4,
            top: 4,
            width: 6,
            height: 6,
            fill: '#333333',
        });
        const detachedGroup = new Group('detached-group', new Rect('nested-2', {
            left: 0,
            top: 0,
            width: 2,
            height: 2,
            fill: '#999999',
        }));
        group.addObject(detachedRect);
        group.addObject(detachedGroup);

        const detachedRectTransformSpy = vi.spyOn(detachedRect, 'transformByState');
        const detachedGroupTransformSpy = vi.spyOn(detachedGroup, 'transformByState');
        group.removeSelfObjectAndTransform(detachedRect.oKey, undefined, undefined, true);
        group.removeSelfObjectAndTransform(detachedGroup.oKey, undefined, undefined, true);
        expect(detachedRectTransformSpy).toHaveBeenCalled();
        expect(detachedGroupTransformSpy).toHaveBeenCalledWith(expect.objectContaining({
            left: expect.any(Number),
            top: expect.any(Number),
        }));
        expect(detachedRect.parent).toBe(scene);
        expect(detachedRect.isInGroup).toBe(false);

        group.removeObject('scene-child');
        group.removeObject(hiddenChild);
        expect(scene.removeObject).toHaveBeenCalled();

        const renderTarget = new Rect('render-target', {
            left: 0,
            top: 0,
            width: 10,
            height: 10,
            fill: '#555555',
        });
        const renderSpy = vi.spyOn(renderTarget, 'render').mockImplementation(() => renderTarget);
        group.addObject(renderTarget);

        const ctx = createContext();
        group.render(ctx, {
            cacheBound: { left: -50, top: -50, right: 200, bottom: 200 },
        } as any);
        expect(ctx.transform).toHaveBeenCalled();
        expect(renderSpy).toHaveBeenCalled();

        const disposeSpy = vi.spyOn(renderTarget, 'dispose');
        group.dispose();
        expect(disposeSpy).toHaveBeenCalled();
    });
});
