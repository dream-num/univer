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
import { MobileCanvasGesture } from '../mobile-canvas-gesture';

describe('MobileCanvasGesture', () => {
    const gestures: MobileCanvasGesture[] = [];

    afterEach(() => {
        gestures.splice(0).forEach((gesture) => gesture.dispose());
        vi.useRealTimers();
        document.body.replaceChildren();
    });

    function setup(action: 'pan' | 'object' | 'ignore' = 'pan') {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const options = {
            start: () => action,
            tap: vi.fn(),
            pan: vi.fn(),
            pinch: vi.fn(),
            finishObjectTransform: vi.fn(),
            endPinch: vi.fn(),
        };
        const gesture = new MobileCanvasGesture(canvas, options);
        gestures.push(gesture);
        const pointer = (type: string, x: number, y: number, id = 1, pointerType = 'touch') => {
            const event = Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }), {
                pointerId: id,
                pointerType,
            });
            canvas.dispatchEvent(event);
            return event;
        };
        return { canvas, gesture, options, pointer };
    }

    it('selects on release without feeding an unselected object a drag', () => {
        const { canvas, pointer, options } = setup();
        const objectDown = vi.fn();
        canvas.addEventListener('pointerdown', objectDown);
        pointer('pointerdown', 40, 50);
        pointer('pointermove', 43, 52);
        expect(options.tap).not.toHaveBeenCalled();
        pointer('pointerup', 43, 52);
        expect(options.tap).toHaveBeenCalledExactlyOnceWith({ x: 43, y: 52 });
        expect(options.pan).not.toHaveBeenCalled();
        expect(objectDown).not.toHaveBeenCalled();
    });

    it('pans in screen pixels, ignores tap jitter and does not select after a swipe', () => {
        const { pointer, options } = setup();
        pointer('pointerdown', 20, 30);
        pointer('pointermove', 23, 32);
        expect(options.pan).not.toHaveBeenCalled();
        pointer('pointermove', 40, 50);
        pointer('pointermove', 55, 65);
        expect(options.pan.mock.calls).toEqual([[{ x: 20, y: 20 }], [{ x: 15, y: 15 }]]);
        pointer('pointercancel', 55, 65);
        expect(options.tap).not.toHaveBeenCalled();
    });

    it.each(['object', 'ignore'] as const)('preserves existing %s manipulation', (action) => {
        const { pointer, options } = setup(action);
        expect(pointer('pointerdown', 10, 20).defaultPrevented).toBe(false);
        expect(pointer('pointermove', 50, 60).defaultPrevented).toBe(false);
        expect(pointer('pointerup', 50, 60).defaultPrevented).toBe(false);
        expect(options.tap).not.toHaveBeenCalled();
        expect(options.pan).not.toHaveBeenCalled();
    });

    it('hands a selected object to a centered pinch and consumes the remaining finger without jumping', () => {
        const { pointer, options } = setup('object');
        pointer('pointerdown', 100, 100);
        pointer('pointerdown', 200, 100, 2);
        expect(options.finishObjectTransform).toHaveBeenCalledTimes(1);
        expect(pointer('pointermove', 300, 100, 2).defaultPrevented).toBe(true);
        expect(options.pinch).toHaveBeenCalledExactlyOnceWith(2, { x: 150, y: 100 }, { x: 200, y: 100 });
        pointer('pointerup', 300, 100, 2);
        pointer('pointermove', 120, 110);
        expect(options.pan).not.toHaveBeenCalled();
        expect(options.pinch).toHaveBeenCalledTimes(1);
        pointer('pointerup', 120, 110);
        expect(options.endPinch).toHaveBeenCalledTimes(1);
        expect(options.tap).not.toHaveBeenCalled();
    });

    it('continues a flick with inertia and stops immediately on a new touch', () => {
        vi.useFakeTimers();
        const { pointer, options } = setup();
        pointer('pointerdown', 20, 30);
        vi.advanceTimersByTime(16);
        pointer('pointermove', 20, 70);
        pointer('pointerup', 20, 70);
        const dragCalls = options.pan.mock.calls.length;
        vi.advanceTimersByTime(64);
        expect(options.pan.mock.calls.length).toBeGreaterThan(dragCalls);
        pointer('pointerdown', 20, 70);
        const stoppedCalls = options.pan.mock.calls.length;
        vi.advanceTimersByTime(100);
        expect(options.pan).toHaveBeenCalledTimes(stoppedCalls);
    });

    it('does not suppress subsequent mouse input or leave listeners after disposal', () => {
        const { canvas, gesture, pointer, options } = setup();
        pointer('pointerdown', 30, 30);
        pointer('pointerup', 30, 30);
        pointer('pointerdown', 30, 30, 2, 'mouse');
        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        canvas.dispatchEvent(click);
        expect(click.defaultPrevented).toBe(false);
        gesture.dispose();
        options.tap.mockClear();
        pointer('pointerdown', 30, 30);
        pointer('pointerup', 30, 30);
        expect(options.tap).not.toHaveBeenCalled();
        expect(canvas.style.touchAction).not.toBe('none');
    });
});
