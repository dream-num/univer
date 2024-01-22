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

import { describe, expect, it } from 'vitest';

import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import {
    BooleanValueObject,
    NumberValueObject,
    StringValueObject,
} from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Address } from '..';

describe('Test address', () => {
    const textFunction = new Address(FUNCTION_NAMES_LOOKUP.ADDRESS);

    describe('Correct situations', () => {
        it('Absolute reference', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const result = textFunction.calculate(rowNumber, columnNumber);
            expect(result.getValue()).toBe('$C$2');
        });

        it('Absolute row; relative column', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const absNumber = new NumberValueObject(2);
            const result = textFunction.calculate(rowNumber, columnNumber, absNumber);
            expect(result.getValue()).toBe('C$2');
        });

        it('Relative row; absolute column', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const absNumber = new NumberValueObject(3);
            const result = textFunction.calculate(rowNumber, columnNumber, absNumber);
            expect(result.getValue()).toBe('$C2');
        });

        it('Relative reference', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const absNumber = new NumberValueObject(4);
            const result = textFunction.calculate(rowNumber, columnNumber, absNumber);
            expect(result.getValue()).toBe('C2');
        });

        it('Absolute row; relative column in R1C1 reference style', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const absNumber = new NumberValueObject(2);
            const a1 = new BooleanValueObject(false);
            const result = textFunction.calculate(rowNumber, columnNumber, absNumber, a1);
            expect(result.getValue()).toBe('R2C[3]');
        });

        it('Absolute reference to another workbook and worksheet', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const absNumber = new NumberValueObject(1);
            const a1 = new BooleanValueObject(false);
            const sheetText = new StringValueObject('[Book1]Sheet1');
            const result = textFunction.calculate(rowNumber, columnNumber, absNumber, a1, sheetText);
            expect(result.getValue()).toBe("'[Book1]Sheet1'!R2C3");
        });

        it('Absolute reference to another worksheet', async () => {
            const rowNumber = new NumberValueObject(2);
            const columnNumber = new NumberValueObject(3);
            const absNumber = new NumberValueObject(1);
            const a1 = new BooleanValueObject(false);
            const sheetText = new StringValueObject('EXCEL SHEET');
            const result = textFunction.calculate(rowNumber, columnNumber, absNumber, a1, sheetText);
            expect(result.getValue()).toBe("'EXCEL SHEET'!R2C3");
        });
    });

    describe('Fault situations', () => {
        it('Value error', async () => {
            const error = new ErrorValueObject(ErrorType.VALUE);
            const errorValue = textFunction.calculate(error, error);
            expect(errorValue.isError()).toBeTruthy();
        });
    });
});
