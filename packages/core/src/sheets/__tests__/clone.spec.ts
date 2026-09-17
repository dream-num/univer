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
import { BooleanNumber } from '../../types/enum';
import { cloneCellData, cloneCellDataWithSpanAndDisplay } from '../clone';
import { FormulaType } from '../typedef';

describe('formula metadata cloning', () => {
    it.each([BooleanNumber.FALSE, BooleanNumber.TRUE])('retains the array kind and dynamic flag %s in cell and clipboard clones', (fd) => {
        const source = { f: '=SUM(A1:A2)', ft: FormulaType.ARRAY, fd };
        expect(cloneCellData(source)).toEqual(source);
        expect(cloneCellDataWithSpanAndDisplay({ ...source, rowSpan: 2, displayV: '3' })).toEqual({
            ...source,
            rowSpan: 2,
            displayV: '3',
        });
        expect(cloneCellData({ v: 'text' })).toEqual({ v: 'text' });
    });
});
