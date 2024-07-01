/**
 * Copyright 2023-present DreamNum Inc.
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
import { describe, expect, it } from 'vitest';
import { takeAfter } from '../rxjs';

describe('test custom rxjs utils', () => {
    it('should terminate when a condition is met with "takeAfter"', () => {
        const acculated: number[] = [];
        const nums$ = of(1, 2, 3, 4, 5);
        nums$.pipe(takeAfter((val) => val === 3)).subscribe((v) => acculated.push(v));
        expect(acculated).toEqual([1, 2, 3]);
    });
});

