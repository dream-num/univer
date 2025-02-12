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

import type { ICellData } from '@univerjs/core';
import { getCellValue } from '../cell';

describe('Test cell', () => {
    it('Function getCellValue', () => {
        const cell1: ICellData = {
            p: {
                id: 'p',
                body: {
                    dataStream: 'test\r\n',
                },
                documentStyle: {},
            },
        };

        const cell2 = {
            v: 2,
        };

        const cell3 = {
            f: '',
        };

        expect(getCellValue(cell1)).toBe('test');
        expect(getCellValue(cell2)).toBe(2);
        expect(getCellValue(cell3)).toBe(0);
    });
});
