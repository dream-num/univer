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

import { ArrayValueObject, transformToValue } from '../../value-object/array-value-object';
import { StringValueObject } from '../../value-object/primitive-object';
import { valueObjectCompare } from '../object-compare';

const range = new ArrayValueObject(/*ts*/ `{
    Ada;
    test1;
    test12;
    Univer
}`);

function transformValue(criteriaValue: string) {
    const criteria = new StringValueObject(criteriaValue);

    return transformToValue(valueObjectCompare(range, criteria).getArrayValue());
}
describe('Test object compare', () => {
    describe('Test valueObjectCompare', () => {
        it('range and criteria', () => {
            const rangeNumber = new ArrayValueObject(/*ts*/ `{
                1;
                4;
                44;
                444
            }`);

            const criteria = new StringValueObject('>40');

            const resultObjectValue = transformToValue(valueObjectCompare(rangeNumber, criteria).getArrayValue());
            expect(resultObjectValue).toStrictEqual([[false], [false], [true], [true]]);
        });

        it('range with wildcard asterisk', () => {
            expect(transformValue('test*')).toStrictEqual([[false], [true], [true], [false]]);
        });

        it('range with compare = and wildcard asterisk', () => {
            expect(transformValue('=test*')).toStrictEqual([[false], [true], [true], [false]]);
        });

        it('range with compare > and wildcard asterisk', () => {
            expect(transformValue('>test*')).toStrictEqual([[false], [true], [true], [true]]);
        });

        it('range with compare >= and wildcard asterisk', () => {
            expect(transformValue('>=test*')).toStrictEqual([[false], [true], [true], [true]]);
        });

        it('range with compare < and wildcard asterisk', () => {
            expect(transformValue('<test*')).toStrictEqual([[true], [false], [false], [false]]);
        });

        it('range with compare <= and wildcard asterisk', () => {
            expect(transformValue('<=test*')).toStrictEqual([[true], [false], [false], [false]]);
        });

        it('range with wildcard question mark', () => {
            expect(transformValue('test?')).toStrictEqual([[false], [true], [false], [false]]);
        });

        it('range with compare = and wildcard question mark', () => {
            expect(transformValue('=test??')).toStrictEqual([[false], [false], [true], [false]]);
        });

        it('range with compare > and wildcard question mark', () => {
            expect(transformValue('>test?')).toStrictEqual([[false], [true], [true], [true]]);
        });

        it('range with compare >= and wildcard question mark', () => {
            expect(transformValue('>=test??')).toStrictEqual([[false], [true], [true], [true]]);
        });

        it('range with compare < and wildcard question mark', () => {
            expect(transformValue('<test?')).toStrictEqual([[true], [false], [false], [false]]);
        });

        it('range with compare <= and wildcard question mark', () => {
            expect(transformValue('<=test??')).toStrictEqual([[true], [false], [false], [false]]);
        });
    });
});
