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

import { describe, expect, it } from 'vitest';
import { SortType } from '../../services/interface';
import { compareString } from '../utils';

const sorted = (values: string[], type = SortType.ASC) => [...values].sort((a, b) => compareString(a, b, type) ?? 0);

describe('compareString', () => {
    it('sorts accented letters beside their base letter', () => {
        expect(sorted(['zoe', 'éclair', 'ángel', 'bob', 'abc'])).toEqual(['abc', 'ángel', 'bob', 'éclair', 'zoe']);
        expect(sorted(['zoe', 'éclair', 'ángel', 'bob', 'abc'], SortType.DESC)).toEqual(['zoe', 'éclair', 'bob', 'ángel', 'abc']);
    });

    it('ignores case, hyphens and apostrophes', () => {
        expect(sorted(['co-op', 'b', "c'd", 'A'])).toEqual(['A', 'b', "c'd", 'co-op']);
    });
});
