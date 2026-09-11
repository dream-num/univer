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
import { throttle } from '../function';

afterEach(() => vi.useRealTimers());

describe('throttle', () => {
    it('does not replay a delayed old value after a newer leading call', () => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
        const render = vi.fn();
        const update = throttle(render, 100);
        update('initial');
        vi.setSystemTime(1010);
        update('old');
        // A background tab can delay timers beyond the throttle interval.
        vi.setSystemTime(1200);
        update('latest');
        vi.runAllTimers();
        expect(render.mock.calls).toEqual([['initial'], ['latest']]);
    });

    it('still delivers the last value of a burst', () => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
        const render = vi.fn();
        const update = throttle(render, 100);
        update('initial');
        update('middle');
        update('latest');
        vi.runAllTimers();
        expect(render.mock.calls).toEqual([['initial'], ['latest']]);
    });
});
