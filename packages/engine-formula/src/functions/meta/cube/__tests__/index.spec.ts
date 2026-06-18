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
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { CubeValueObject } from '../../../../engine/value-object/cube-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_META } from '../../function-names';
import { Cube } from '../index';

describe('Cube function', () => {
    const testFunction = new Cube(FUNCTION_NAMES_META.CUBE);

    it('combines multiple array references into a cube value object', () => {
        const first = ArrayValueObject.create('{1,2;3,4}');
        const second = ArrayValueObject.create('{5;6}');

        const result = testFunction.calculate(first, second);

        expect(result.isCube()).toBe(true);
        expect(result).toBeInstanceOf(CubeValueObject);
        expect((result as CubeValueObject).getCubeCount()).toBe(2);
        expect((result as CubeValueObject).getCubeValues()).toEqual([first, second]);
    });

    it('propagates input errors before validating array arguments', () => {
        const result = testFunction.calculate(ErrorValueObject.create(ErrorType.NAME), NumberValueObject.create(1));

        expect(getObjectValue(result)).toBe(ErrorType.NAME);
    });

    it('rejects scalar values because cube aggregation requires array inputs', () => {
        const result = testFunction.calculate(ArrayValueObject.create('{1,2}'), NumberValueObject.create(1));

        expect(getObjectValue(result)).toBe(ErrorType.VALUE);
    });
});
