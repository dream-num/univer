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

import type { IDataValidationRule, Workbook } from '@univerjs/core';
import type { IValidatorCellInfo } from '@univerjs/data-validation';
import { DataValidationOperator, DataValidationType } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ITestBed } from '../../facade/__tests__/create-test-bed';
import type { DecimalValidator } from '../decimal-validator';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { getCellValueNumber } from '../decimal-validator';

const BETWEEN_0_AND_100 = {
    uid: 'decimal-rule',
    type: DataValidationType.DECIMAL,
    operator: DataValidationOperator.BETWEEN,
    formula1: '0',
    formula2: '100',
    allowBlank: false,
    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
} as IDataValidationRule;

describe('DecimalValidator', () => {
    let testBed: ITestBed;
    let validator: DecimalValidator;

    beforeEach(() => {
        // DataValidationController registers the validator with its real dependencies.
        testBed = createFacadeTestBed();
        validator = testBed.get(DataValidatorRegistryService).getValidatorItem(DataValidationType.DECIMAL) as DecimalValidator;
    });

    function cellWith(value: string): IValidatorCellInfo {
        const workbook = testBed.sheet as Workbook;
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        return { value, interceptValue: value, t: null, row: 0, column: 0, unitId: 'test', subUnitId: 'sheet1', workbook, worksheet };
    }

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('reads only decimal numeric text as a number', () => {
        for (const [text, number] of [[' 12 ', 12], ['.5', 0.5], ['-3', -3], ['+4', 4], ['1e3', 1000], ['12.', 12]] as const) {
            expect(getCellValueNumber(text)).toBe(number);
        }
        for (const value of [' ', '0x10', '0b101', '0o17', 'Infinity', '1,234', true, false]) {
            expect(getCellValueNumber(value)).toBeNaN();
        }
    });

    it('rejects text that is not a decimal number', async () => {
        expect(await validator.validator(cellWith(' '), BETWEEN_0_AND_100)).toBe(false);
        expect(await validator.validator(cellWith('0x10'), BETWEEN_0_AND_100)).toBe(false);
        expect(await validator.validator(cellWith('12.5'), BETWEEN_0_AND_100)).toBe(true);
    });
});
