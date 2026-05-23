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

import { FunctionType, sequenceNodeType } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { getFormulaReplaceResult } from '../use-formula-search';

describe('getFormulaReplaceResult', () => {
    it('does not append an open bracket when replacing table names', () => {
        expect(getFormulaReplaceResult(
            [{ nodeType: sequenceNodeType.FUNCTION, token: 'Ord', startIndex: 0, endIndex: 2 }],
            0,
            'Orders',
            FunctionType.Table
        )).toEqual({
            text: 'Orders',
            offset: -3,
        });
    });
});
