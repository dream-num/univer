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

import { ObjectMatrix } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';

import { NumberValueObject } from '../../../..';
import type { ISheetData } from '../../../../basics/common';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Address } from '..';

const cellData = {
    0: {
        0: {
            v: 1,
        },
        1: {
            v: ' ',
        },
        2: {
            v: 1.23,
        },
        3: {
            v: true,
        },
        4: {
            v: false,
        },
    },
    1: {
        0: {
            v: 0,
        },
        1: {
            v: '100',
        },
        2: {
            v: '2.34',
        },
        3: {
            v: 'test',
        },
        4: {
            v: -3,
        },
    },
};

describe('test address', () => {
    let unitId: string;
    let sheetId: string;
    let sheetData: ISheetData = {};
    let address: Address;

    beforeEach(() => {
        unitId = 'test';
        sheetId = 'sheet1';
        sheetData = {
            [sheetId]: {
                cellData: new ObjectMatrix(cellData),
                rowCount: 4,
                columnCount: 3,
            },
        };

        // register address
        address = new Address(FUNCTION_NAMES_LOOKUP.ADDRESS);
    });

    describe('address', () => {
        describe('correct situations', () => {
            it('single cell', async () => {
                const rowNumber = new NumberValueObject(2);
                const columnNumber = new NumberValueObject(3);
                const result = address.calculate(rowNumber, columnNumber);
                expect(result.getValue()).toBe('$C$2');
            });
        });

        describe('fault situations', () => {
            it('value error', async () => {
                const error = ErrorValueObject.create(ErrorType.VALUE);
                const errorValue = address.calculate(error, error);
                expect(errorValue.isError()).toBeTruthy();
            });
        });
    });
});
