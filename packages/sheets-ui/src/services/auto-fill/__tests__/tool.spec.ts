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
import { CellValueType } from '@univerjs/core';
import { needsUpdateCellValue } from '../tools';

describe('Test tool', () => {
    it('Function needsUpdateCellValue', () => {
        expect(needsUpdateCellValue({ f: '=A1' })).toBeFalsy();
        expect(needsUpdateCellValue({ si: 'id1' })).toBeFalsy();
        expect(needsUpdateCellValue({ t: CellValueType.BOOLEAN })).toBeFalsy();
        expect(needsUpdateCellValue({ v: 1, t: CellValueType.NUMBER })).toBeTruthy();
    });
});
