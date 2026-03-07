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

import type { IViewportInfo } from '../basics/vector2';
import { describe, expect, it, vi } from 'vitest';
import { BaseObject } from '../base-object';
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from '../basics/const';
import { Vector2 } from '../basics/vector2';

class TestObject extends BaseObject {
    setBox(left: number | string, top: number | string, width: number | string, height: number | string) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    setTransformState(input: {
        strokeWidth?: number;
        angle?: number;
        scaleX?: number;
        scaleY?: number;
        skewX?: number;
        skewY?: number;
        flipX?: boolean;
        flipY?: boolean;
    }) {
        if (input.strokeWidth !== undefined) this.strokeWidth = input.strokeWidth;
        if (input.angle !== undefined) this.angle = input.angle;
        if (input.scaleX !== undefined) this.scaleX = input.scaleX;
        if (input.scaleY !== undefined) this.scaleY = input.scaleY;
        if (input.skewX !== undefined) this.skewX = input.skewX;
        if (input.skewY !== undefined) this.skewY = input.skewY;
        if (input.flipX !== undefined) this.flipX = input.flipX;
        if (input.flipY !== undefined) this.flipY = input.flipY;
        (this as any)._setTransForm();
    }

    override render(_ctx: any, _bounds?: IViewportInfo) {
        // noop
    }
}

function createParentChain() {
    const scene = {
        classType: RENDER_CLASS_TYPE.SCENE,
        getParent: vi.fn(() => ({
            classType: RENDER_CLASS_TYPE.ENGINE,
            getParent: vi.fn(() => null),
        })),
        setCursor: vi.fn(),
        resetCursor: vi.fn(),
        attachTransformerTo: vi.fn(),
        detachTransformerFrom: vi.fn(),
    } as any;
    return scene;
}

describe('base object', () => {
    it('covers transform/getter/state and cursor/parent chain methods', () => {
        const obj = new TestObject('obj-1');
        const scene = createParentChain();
        obj.parent = scene;
        obj.layer = { zIndex: 9, makeDirty: vi.fn(), makeDirtyWithDebounce: vi.fn() } as any;
        obj.setBox(10, 20, 30, 40);
        obj.setTransformState({
            strokeWidth: 2,
            angle: 30,
            scaleX: 1.5,
            scaleY: 2,
            skewX: 5,
            skewY: 6,
            flipX: true,
            flipY: false,
        });

        expect(obj.oKey).toBe('obj-1');
        expect(obj.top).toBe(20);
        expect(obj.left).toBe(10);
        expect(obj.width).toBe(30);
        expect(obj.height).toBe(40);
        expect(obj.strokeWidth).toBe(2);
        expect(obj.transform).toBeTruthy();
        expect(obj.transformForAngle((obj as any)._transform.clone())).toBeTruthy();
        expect(obj.getState()).toEqual(expect.objectContaining({
            left: 10,
            top: 20,
            width: 30,
            height: 40,
        }));

        obj.cursor = CURSOR_TYPE.POINTER;
        obj.resetCursor();
        expect(scene.setCursor).toHaveBeenCalledWith(CURSOR_TYPE.POINTER);
        expect(scene.resetCursor).toHaveBeenCalled();
        expect(obj.getScene()).toBe(scene);
        expect(obj.getEngine()).toBeTruthy();
        expect(obj.getLayerIndex()).toBe(9);

        obj.applyTransform();
        obj.removeTransform();
        expect(scene.attachTransformerTo).toHaveBeenCalledWith(obj);
        expect(scene.detachTransformerFrom).toHaveBeenCalledWith(obj);
        expect(obj.getObjects()).toEqual([]);
    });

    it('covers dirty control, visibility and render/hit branches', () => {
        const obj = new TestObject();
        obj.setBox(0, 0, 20, 10);
        obj.setTransformState({ strokeWidth: 2 });

        obj.layer = null as any;
        obj.makeDirty(true);
        expect(obj.isDirty()).toBe(false);

        const layer = { zIndex: 3, makeDirty: vi.fn(), makeDirtyWithDebounce: vi.fn() };
        obj.layer = layer as any;
        obj.makeDirty(true);
        expect(layer.makeDirtyWithDebounce).toHaveBeenCalled();

        obj.makeDirtyNoDebounce(true);
        expect(layer.makeDirty).toHaveBeenCalled();

        obj.makeForceDirty(true);
        obj.hide();
        expect(obj.visible).toBe(false);
        obj.show();
        expect(obj.visible).toBe(true);

        expect(obj.isRender({} as any)).toBe(true);
        (obj as any)._forceRender = true;
        expect(obj.isRender({} as any)).toBe(false);

        expect(obj.isHit(Vector2.FromArray([5, 5]))).toBe(true);
        expect(obj.isHit(Vector2.FromArray([100, 100]))).toBe(false);
        expect(obj.getInverseCoord(Vector2.FromArray([2, 3]))).toBeTruthy();
    });

    it('covers event trigger propagation and stopPropagation branches', () => {
        const obj = new TestObject();
        const parent = {
            triggerPointerMove: vi.fn(),
            triggerPointerDown: vi.fn(),
            triggerPointerUp: vi.fn(),
            triggerSingleClick: vi.fn(),
            triggerClick: vi.fn(),
            triggerDblclick: vi.fn(),
            triggerTripleClick: vi.fn(),
            triggerMouseWheel: vi.fn(),
            triggerPointerOut: vi.fn(),
            triggerPointerLeave: vi.fn(),
            triggerPointerOver: vi.fn(),
            triggerPointerEnter: vi.fn(),
            triggerPointerCancel: vi.fn(),
            triggerDragLeave: vi.fn(),
            triggerDragOver: vi.fn(),
            triggerDragEnter: vi.fn(),
            triggerDrop: vi.fn(),
        };
        obj.parent = parent as any;

        const event = { stopPropagation: false } as any;
        expect(obj.triggerPointerMove(event)).toBe(false);
        expect(obj.triggerPointerDown(event)).toBe(false);
        expect(obj.triggerPointerUp(event)).toBe(false);
        expect(obj.triggerSingleClick(event)).toBe(false);
        expect(obj.triggerClick(event)).toBe(false);
        expect(obj.triggerDblclick(event)).toBe(false);
        expect(obj.triggerTripleClick(event)).toBe(false);
        expect(obj.triggerMouseWheel(event)).toBe(false);
        expect(obj.triggerPointerOut(event)).toBe(false);
        expect(obj.triggerPointerLeave(event)).toBe(false);
        expect(obj.triggerPointerOver(event)).toBe(true);
        expect(obj.triggerPointerEnter(event)).toBe(false);
        expect(obj.triggerPointerCancel(event)).toBe(false);
        expect(obj.triggerDragLeave(event)).toBe(false);
        expect(obj.triggerDragOver(event)).toBe(false);
        expect(obj.triggerDragEnter(event)).toBe(false);
        expect(obj.triggerDrop(event)).toBe(false);

        const stopEvt = { stopPropagation: true } as any;
        obj.onPointerMove$.emitEvent = vi.fn(() => stopEvt);
        obj.onPointerDown$.emitEvent = vi.fn(() => stopEvt);
        obj.onPointerUp$.emitEvent = vi.fn(() => stopEvt);
        obj.onSingleClick$.emitEvent = vi.fn(() => stopEvt);
        obj.onClick$.emitEvent = vi.fn(() => stopEvt);
        obj.onDblclick$.emitEvent = vi.fn(() => stopEvt);
        obj.onTripleClick$.emitEvent = vi.fn(() => stopEvt);
        obj.onMouseWheel$.emitEvent = vi.fn(() => stopEvt);
        obj.onPointerOut$.emitEvent = vi.fn(() => stopEvt);
        obj.onPointerLeave$.emitEvent = vi.fn(() => stopEvt);
        obj.onPointerOver$.emitEvent = vi.fn(() => stopEvt);
        obj.onPointerEnter$.emitEvent = vi.fn(() => stopEvt);
        obj.onDragLeave$.emitEvent = vi.fn(() => stopEvt);
        obj.onDragOver$.emitEvent = vi.fn(() => stopEvt);
        obj.onDragEnter$.emitEvent = vi.fn(() => stopEvt);
        obj.onDrop$.emitEvent = vi.fn(() => stopEvt);

        expect(obj.triggerPointerMove({} as any)).toBe(true);
        expect(obj.triggerPointerDown({} as any)).toBe(true);
        expect(obj.triggerPointerUp({} as any)).toBe(true);
        expect(obj.triggerSingleClick({} as any)).toBe(true);
        expect(obj.triggerClick({} as any)).toBe(true);
        expect(obj.triggerDblclick({} as any)).toBe(true);
        expect(obj.triggerTripleClick({} as any)).toBe(true);
        expect(obj.triggerMouseWheel({} as any)).toBe(true);
        expect(obj.triggerPointerOut({} as any)).toBe(true);
        expect(obj.triggerPointerLeave({} as any)).toBe(true);
        expect(obj.triggerPointerOver({} as any)).toBe(true);
        expect(obj.triggerPointerEnter({} as any)).toBe(true);
        expect(obj.triggerDragLeave({} as any)).toBe(true);
        expect(obj.triggerDragOver({} as any)).toBe(true);
        expect(obj.triggerDragEnter({} as any)).toBe(true);
        expect(obj.triggerDrop({} as any)).toBe(true);
    });

    it('covers transform APIs, serialization and dispose flow', () => {
        const obj = new TestObject();
        obj.setBox('10', '20', '30', '40');
        obj.transformByState({});
        obj.translate(11, 12).resize(13, 14).scale(1.2, 1.3).skew(2, 3).flip(true, false);
        obj.transformByState({
            left: 15,
            top: 16,
            width: 17,
            height: 18,
            angle: 10,
            scaleX: 1.1,
            scaleY: 1.2,
            skewX: 3,
            skewY: 4,
            flipX: false,
            flipY: true,
            strokeWidth: 1,
        });
        expect(obj.toJson()).toEqual(expect.objectContaining({
            top: expect.any(Number),
            left: expect.any(Number),
        }));

        const parent = { removeObject: vi.fn() };
        obj.parent = parent as any;
        obj.dispose();
        expect(parent.removeObject).toHaveBeenCalledWith(obj);
        expect(obj.parent).toBeNull();
    });
});
