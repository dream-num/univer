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
import { horizontalLineSegmentsSubtraction } from '../doc-tool';

describe('test cases in doc-tool', () => {
    it('should pass test case when call horizontalLineSegmentsSubtraction', () => {
        expect(horizontalLineSegmentsSubtraction(1, 2, 3, 4)).toEqual([1, 2]);
        expect(horizontalLineSegmentsSubtraction(1, 3, 2, 4)).toEqual([1, 1]);
        expect(horizontalLineSegmentsSubtraction(1, 2, 1, 3)).toEqual([]);
        expect(horizontalLineSegmentsSubtraction(1, 2, 1, 2)).toEqual([]);
        expect(horizontalLineSegmentsSubtraction(1, 2, 1, 1)).toEqual([1, 1]);
        expect(horizontalLineSegmentsSubtraction(3, 5, 2, 3)).toEqual([2, 3]);
    });
});
