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

import { describe } from 'vitest';

import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';

import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Xmatch } from '..';

const arrayValueObject1 = new ArrayValueObject(/*ts*/ `{
    1, "First", 100, 89;
    2, "Second", 68, 66;
    3, "Third", 100, 75;
    4, "Fourth", 93, 70;
    5, "Fifth", 87, 69;
    6, "Sixth", 96, 82
}`);

const arrayValueObject2 = new ArrayValueObject(/*ts*/ `{
    6, "Sixth";
    1, "First";
    4, "Fourth"
}`);

const arrayValueObject3 = new ArrayValueObject(/*ts*/ `{
    0, 500;
    101, 800;
    301, 1000;
    1000, 3000
}`);

const arrayValueObject4 = new ArrayValueObject(/*ts*/ `{
    701, 3000;
    101, 800;
    401, 2000;
    901, 5000;
    501, 2300;
    1000, 6000;
    601, 2900;
    0, 500;
    201, 1200;
    301, 1700;
    801, 3500
}`);

describe('Test vlookup', () => {
    const textFunction = new Xmatch(FUNCTION_NAMES_LOOKUP.XLOOKUP);

    describe('The value of the lookup', () => {

    });
});
