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

afterEach(() => {
    vi.useRealTimers();
});

describe('throttle', () => {
    it('does not publish an older trailing call after a newer immediate call', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        const publish = vi.fn();
        const update = throttle(publish, 100);

        update('initial');
        vi.advanceTimersByTime(50);
        update('stale');
        vi.advanceTimersByTime(60);
        update('latest');
        expect(publish.mock.calls).toEqual([['initial'], ['latest']]);

        vi.advanceTimersByTime(100);
        expect(publish.mock.calls).toEqual([['initial'], ['latest']]);
    });
});
