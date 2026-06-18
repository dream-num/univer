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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ObjectType } from '../../base-object';
import { getOffsetRectForDom, transformBoundingCoord } from '../../basics/position';
import { Vector2 } from '../../basics/vector2';
import { CustomObject } from '../../custom/custom-object';
import { CheckboxShape } from '../checkbox';
import { Circle } from '../circle';
import { ListItem } from '../dropdown-item';
import { Rect } from '../rect';

function createShapeCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        rect: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        setLineDash: vi.fn(),
        fillStyle: '#fff',
        strokeStyle: '#000',
        lineWidth: 1,
        lineCap: 'round',
        lineJoin: 'round',
        lineDashOffset: 0,
        miterLimit: 10,
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        shadowColor: '',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    } as any;
}

describe('basic shape and position helpers', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('draws and serializes circle state while keeping resize square', () => {
        const circle = new Circle('circle-1', {
            left: 8,
            top: 12,
            radius: 18,
            fill: '#00aaff',
            stroke: '#003355',
            strokeWidth: 2,
            strokeDashArray: [3, 2],
        });
        const ctx = createShapeCtx();

        expect(circle.radius).toBe(18);
        expect(circle.width).toBe(36);
        expect(circle.height).toBe(36);

        Circle.drawWith(ctx, circle);
        expect(ctx.setLineDash).toHaveBeenCalledWith([3, 2]);
        expect(ctx.arc).toHaveBeenCalledWith(18, 18, 18, 0, Math.PI * 2, false);
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
        circle.render(ctx);
        expect(ctx.transform).toHaveBeenCalled();

        circle.transformByState({ width: 30, height: 60 });
        expect(circle.radius).toBe(15);
        expect(circle.width).toBe(30);
        expect(circle.height).toBe(30);
        expect(circle.objectType).toBe(ObjectType.CIRCLE);
        expect(circle.toJson()).toMatchObject({ radius: 15 });
    });

    it('draws checked and unchecked checkbox graphics with scaled business dimensions', () => {
        const checked = new CheckboxShape('check-1', {
            left: 4,
            top: 6,
            width: 24,
            height: 20,
            fill: '#2f56ef',
            checked: true,
        });
        const checkedCtx = createShapeCtx();

        CheckboxShape.drawWith(checkedCtx, checked);
        expect(checked.checked).toBe(true);
        expect(checkedCtx.translate).toHaveBeenCalledWith(4, 6);
        expect(checkedCtx.scale).toHaveBeenCalledWith(1.5, 1.25);
        expect(checkedCtx.fill).toHaveBeenCalledWith(expect.any(Path2D), 'evenodd');
        checked.render(checkedCtx);
        expect(checkedCtx.transform).toHaveBeenCalled();
        expect(checked.toJson()).toMatchObject({ checked: true });

        const unchecked = new CheckboxShape('check-2', {
            width: 16,
            height: 16,
            checked: false,
        });
        const uncheckedCtx = createShapeCtx();
        CheckboxShape.drawWith(uncheckedCtx, unchecked);
        expect(unchecked.checked).toBe(false);
        expect(uncheckedCtx.fill).toHaveBeenCalledWith(expect.any(Path2D), 'evenodd');
        expect(unchecked.toJson()).not.toHaveProperty('checked');
    });

    it('draws a plain rect using its business bounds', () => {
        const ctx = createShapeCtx();

        Rect.drawWith(ctx, {
            width: 80,
            height: 32,
            fill: '#ffffff',
        });

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.rect).toHaveBeenCalledWith(0, 0, 80, 32);
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('draws a rounded visual rect centered in the interaction bounds', () => {
        const rect = new Rect('rect-visual', {
            width: 80,
            height: 40,
            radius: 12,
            visualWidth: 60,
            visualHeight: 20,
            fill: '#ddeeff',
            stroke: '#225588',
            strokeWidth: 2,
            strokeDashArray: [4, 2],
            paintFirst: 'stroke',
        });
        const ctx = createShapeCtx();

        expect(rect.radius).toBe(12);
        expect(rect.visualWidth).toBe(60);
        expect(rect.visualHeight).toBe(20);

        rect.setOpacity(0.4);
        rect.setObjectType(ObjectType.SHAPE);
        expect(rect.opacity).toBe(0.4);
        expect(rect.objectType).toBe(ObjectType.SHAPE);

        Rect.drawWith(ctx, {
            width: rect.width,
            height: rect.height,
            radius: rect.radius,
            visualWidth: rect.visualWidth ?? undefined,
            visualHeight: rect.visualHeight ?? undefined,
            fill: rect.fill,
            stroke: rect.stroke,
            strokeWidth: rect.strokeWidth,
            strokeDashArray: rect.strokeDashArray,
            paintFirst: rect.paintFirst,
        });

        expect(ctx.setLineDash).toHaveBeenCalledWith([4, 2]);
        expect(ctx.translate).toHaveBeenCalledWith(0, 10);
        expect(ctx.translate).toHaveBeenCalledWith(10, 0);
        expect(ctx.moveTo).toHaveBeenCalledWith(10, 0);
        expect(ctx.lineTo).toHaveBeenCalledWith(50, 0);
        expect(ctx.arc).toHaveBeenCalledTimes(4);
        expect(ctx.arc).toHaveBeenNthCalledWith(1, 50, 10, 10, (Math.PI * 3) / 2, 0, false);
        expect(ctx.arc).toHaveBeenNthCalledWith(4, 10, 10, 10, Math.PI, (Math.PI * 3) / 2, false);
        expect(ctx.stroke.mock.invocationCallOrder[0]).toBeLessThan(ctx.fill.mock.invocationCallOrder[0]);
        expect(rect.toJson()).toMatchObject({
            width: 80,
            height: 40,
            radius: 12,
            strokeDashArray: [4, 2],
        });
    });

    it('keeps list item drawing isolated from the surrounding canvas state', () => {
        const ctx = createShapeCtx();

        ListItem.drawWith(ctx, {
            text: 1,
            fontString: '12px Arial',
            fontFamily: 'Arial',
            fontSize: '12',
        } as any);

        expect(ctx.save).toHaveBeenCalledBefore(ctx.restore);
        expect(ctx.restore).toHaveBeenCalledTimes(1);
    });

    it('renders a custom object callback only when visible and in viewport', () => {
        const render = vi.fn();
        const hit = vi.fn((coord: Vector2) => coord.x === 5 && coord.y === 6);
        const object = new CustomObject('custom-1', render, hit);
        object.transformByState({ left: 10, top: 12, width: 40, height: 30 });
        const ctx = createShapeCtx();

        object.render(ctx, { viewBound: { left: 0, top: 0, right: 120, bottom: 80 } } as any);
        expect(ctx.transform).toHaveBeenCalled();
        expect(render).toHaveBeenCalledWith(ctx);
        expect(object.isHit(Vector2.FromArray([5, 6]))).toBe(true);
        expect(hit).toHaveBeenCalled();
        expect(object.toJson()).toMatchObject({ width: 40, height: 30, left: 10, top: 12 });

        const beforeCalls = render.mock.calls.length;
        object.render(ctx, { viewBound: { left: 200, top: 200, right: 260, bottom: 260 } } as any);
        expect(render).toHaveBeenCalledTimes(beforeCalls);

        object.hide();
        object.render(ctx);
        expect(render).toHaveBeenCalledTimes(beforeCalls);

        const defaultObject = new CustomObject('custom-default');
        defaultObject.transformByState({ width: 12, height: 14 });
        defaultObject.render(ctx);
        expect(ctx.save).toHaveBeenCalled();
    });

    it('computes DOM offsets and transforms world bounds into object coordinates', () => {
        Object.defineProperty(window, 'pageYOffset', { value: 30, configurable: true });
        Object.defineProperty(window, 'pageXOffset', { value: 40, configurable: true });
        Object.defineProperty(document.documentElement, 'clientTop', { value: 2, configurable: true });
        Object.defineProperty(document.documentElement, 'clientLeft', { value: 4, configurable: true });

        const element = document.createElement('div');
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top: 10,
            left: 20,
            right: 70,
            bottom: 50,
            width: 50,
            height: 40,
            x: 20,
            y: 10,
            toJSON: () => ({}),
        });

        expect(getOffsetRectForDom(element)).toEqual({
            top: 38,
            left: 56,
        });

        const rect = new Rect('rect-1', {
            left: 10,
            top: 20,
            width: 100,
            height: 50,
        });
        const transformed = transformBoundingCoord(rect, {
            tl: Vector2.FromArray([10, 20]),
            tr: Vector2.FromArray([60, 20]),
            bl: Vector2.FromArray([10, 70]),
            br: Vector2.FromArray([60, 70]),
            dx: 50,
            dy: 50,
        });

        expect(transformed).toEqual({
            minX: 0,
            maxX: 50,
            minY: 0,
            maxY: 50,
        });
    });
});
