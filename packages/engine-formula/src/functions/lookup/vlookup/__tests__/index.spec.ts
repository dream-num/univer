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

/* eslint-disable no-magic-numbers */
import { describe, expect, it } from 'vitest';

import type { BaseValueObject } from '../../../..';
import { NumberValueObject } from '../../../..';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Vlookup } from '..';

const arrayValueObject1 = new ArrayValueObject(
    `{
    1, "甲";
    2, "乙";
    3, "丙";
    4, "丁";
    5, "戊";
    6, "己";
    7, "庚";
    8, "辛";
}`
);

const arrayValueObject2 = new ArrayValueObject(
    `{
    4, "丁";
    5, "戊";
    6, "己";
    7, "庚";
    8, "辛";
    1, "甲";
    2, "乙";
    3, "丙";
}`
);

describe('Test vlookup', () => {
    const textFunction = new Vlookup(FUNCTION_NAMES_LOOKUP.VLOOKUP);

    describe('Exact Match', () => {
        it('normal', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(2),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('乙');
        });

        it('normal2', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(8),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('辛');
        });
    });
});
