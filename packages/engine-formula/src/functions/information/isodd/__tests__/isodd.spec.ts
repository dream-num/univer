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

import { Isodd } from '../isodd';
import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';

describe('Test isodd function', () => {
    const testFunction = new Isodd(FUNCTION_NAMES_INFORMATION.ISODD);

    it('should work with different kind of number values', () => {
        expect(testFunction.calculate(NumberValueObject.create(-1)).getValue()).toBeTruthy();
        expect(testFunction.calculate(NumberValueObject.create(2.5)).getValue()).toBeFalsy();
        expect(testFunction.calculate(NumberValueObject.create(5)).getValue()).toBeTruthy();
        expect(testFunction.calculate(NumberValueObject.create(0)).getValue()).toBeFalsy();
    });

    it('should convert value first if is it not a number value', () => {
        expect(testFunction.calculate(StringValueObject.create('123')).getValue()).toBeTruthy();
        expect(testFunction.calculate(StringValueObject.create('122')).getValue()).toBeFalsy();
    });
});
