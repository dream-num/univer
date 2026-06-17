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

import { afterEach, describe, expect, it } from 'vitest';
import { Animate } from '../animate';

const originalDateNow = Date.now;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

class TestAnimationState {
    static receivedValues: number[] = [];
    static successValues: number[] = [];
    static cancelValues: number[] = [];
    static completeValues: number[] = [];
    static canceledFrames: number[] = [];

    static reset(): void {
        this.receivedValues = [];
        this.successValues = [];
        this.cancelValues = [];
        this.completeValues = [];
        this.canceledFrames = [];
    }
}

describe('animate util', () => {
    afterEach(() => {
        Date.now = originalDateNow;
        window.requestAnimationFrame = originalRequestAnimationFrame;
        window.cancelAnimationFrame = originalCancelAnimationFrame;
        TestAnimationState.reset();
    });

    it('runs request -> success -> complete path', () => {
        let now = 0;
        Date.now = () => {
            now += 10;
            return now;
        };

        const animate = new Animate({
            begin: 0,
            end: 100,
            duration: 10,
            receive: (value) => TestAnimationState.receivedValues.push(value),
            success: (value) => TestAnimationState.successValues.push(value),
            complete: (value) => TestAnimationState.completeValues.push(value),
        });
        animate.request();

        expect(TestAnimationState.receivedValues.length).toBe(1);
        expect(TestAnimationState.successValues.length).toBe(1);
        expect(TestAnimationState.completeValues.length).toBe(1);
    });

    it('runs cancel callback when animation was canceled', () => {
        Date.now = () => 0;
        window.requestAnimationFrame = () => {
            return 1;
        };
        window.cancelAnimationFrame = (frameId: number) => {
            TestAnimationState.canceledFrames.push(frameId);
        };

        const animate = new Animate({
            begin: 0,
            end: 100,
            duration: 100,
            receive: (value) => TestAnimationState.receivedValues.push(value),
            cancel: (value) => TestAnimationState.cancelValues.push(value),
            complete: (value) => TestAnimationState.completeValues.push(value),
        });
        animate.request();
        animate.cancel();
        (animate as unknown as { _fakeHandle: () => void })._fakeHandle();

        expect(TestAnimationState.receivedValues.length).toBe(2);
        expect(TestAnimationState.canceledFrames).toEqual([1]);
        expect(TestAnimationState.cancelValues.length).toBe(1);
        expect(TestAnimationState.completeValues.length).toBe(1);
    });

    it('Animate.success resolves after all non-loop animations succeed', async () => {
        const a1 = new Animate({ loop: false });
        const a2 = new Animate({ loop: false });
        const promise = Animate.success(a1, a2);

        (a1 as any)._config.success(1);
        (a2 as any)._config.success(2);

        await expect(promise).resolves.toBeUndefined();
    });
});
