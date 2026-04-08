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
import { Animate } from '../animate';

describe('animate util', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('runs request -> success -> complete path', () => {
        let now = 0;
        const receive = vi.fn();
        const success = vi.fn();
        const complete = vi.fn();
        vi.spyOn(Date, 'now').mockImplementation(() => {
            now += 10;
            return now;
        });

        const animate = new Animate({
            begin: 0,
            end: 100,
            duration: 10,
            receive,
            success,
            complete,
        });
        animate.request();

        expect(receive).toHaveBeenCalled();
        expect(success).toHaveBeenCalled();
        expect(complete).toHaveBeenCalled();
    });

    it('runs cancel callback when animation was canceled', () => {
        let rafCallback: (() => void) | null = null;
        vi.spyOn(Date, 'now').mockImplementation(() => 0);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
            rafCallback = () => cb(0);
            return 1;
        });
        const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        const cancel = vi.fn();
        const complete = vi.fn();
        const receive = vi.fn();

        const animate = new Animate({
            begin: 0,
            end: 100,
            duration: 100,
            receive,
            cancel,
            complete,
        });
        animate.request();
        animate.cancel();
        (animate as any)._fakeHandle();

        expect(receive).toHaveBeenCalled();
        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
        expect(cancel).toHaveBeenCalled();
        expect(complete).toHaveBeenCalled();
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
