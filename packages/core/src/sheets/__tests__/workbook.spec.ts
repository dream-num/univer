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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Univer } from '../../univer';
import type { Workbook } from '../workbook';
import { createCoreTestBed } from './create-core-test-bed';

describe('Test workbook', () => {
    let univer: Univer;
    let workbook: Workbook;

    beforeEach(() => {
        const testBed = createCoreTestBed();
        univer = testBed.univer;
        workbook = testBed.sheet;
    });

    afterEach(() => univer.dispose());

    describe('Test workbook function', () => {
        it('function uniqueSheetName', () => {
            const newSheetName = workbook.uniqueSheetName('Sheet-002');
            expect(newSheetName).toBe('Sheet-002');

            workbook.addWorksheet('sheet2', 1, {
                id: 'sheet2',
                name: newSheetName,
            });

            const newSheetName2 = workbook.uniqueSheetName('Sheet-002');
            expect(newSheetName2).toBe('Sheet-0021');
        });

        it('function generateNewSheetName', () => {
            const newSheetName = workbook.generateNewSheetName('Sheet');
            expect(newSheetName).toBe('Sheet1');

            workbook.addWorksheet('sheet3', 1, {
                id: 'sheet3',
                name: newSheetName,
            });

            const newSheetName2 = workbook.generateNewSheetName('Sheet');
            expect(newSheetName2).toBe('Sheet2');
        });
    });
});
