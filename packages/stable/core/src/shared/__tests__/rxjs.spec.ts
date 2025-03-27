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

import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { afterTime, takeAfter } from '../rxjs';

describe('test custom rxjs utils', () => {
    it('should terminate when a condition is met with "takeAfter"', () => {
        const acculated: number[] = [];
        const nums$ = of(1, 2, 3, 4, 5);
        nums$.pipe(takeAfter((val) => val === 3)).subscribe((v) => acculated.push(v));
        expect(acculated).toEqual([1, 2, 3]);
    });

    describe('test "createTimerObservable$"', () => {
        beforeEach(() => vi.useFakeTimers());

        afterEach(() => vi.useRealTimers());

        it('should emit after a period of time', async () => {
            let fired = false;

            const ob1 = afterTime(2000);
            ob1.subscribe(() => fired = true);
            vi.advanceTimersByTime(1000);
            expect(fired).toBeFalsy();
            vi.advanceTimersByTime(2000);
            expect(fired).toBeTruthy();

            fired = false;
            ob1.subscribe(() => fired = true);
            expect(fired).toBeTruthy();

            fired = false;
            const ob2 = afterTime(2000);
            ob2.subscribe(() => fired = true);
            vi.advanceTimersByTime(3000);
            expect(fired).toBeTruthy();

            fired = false;
            const ob3 = afterTime(2000);
            vi.advanceTimersByTime(3000);
            ob3.subscribe(() => fired = true);
            expect(fired).toBeTruthy();
        });
    });
});
