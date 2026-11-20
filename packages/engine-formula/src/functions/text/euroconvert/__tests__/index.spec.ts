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
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { functionText } from '../../function-map';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Euroconvert } from '../index';

type Argument = number | string | boolean | null;

const toValueObject = (value: Argument): BaseValueObject => {
    if (value === null) {
        return NullValueObject.create();
    }
    if (typeof value === 'number') {
        return NumberValueObject.create(value);
    }
    if (typeof value === 'boolean') {
        return BooleanValueObject.create(value);
    }
    return StringValueObject.create(value);
};

describe('Test euroconvert function', () => {
    const testFunction = new Euroconvert(FUNCTION_NAMES_TEXT.EUROCONVERT);

    const euroconvert = (...args: Argument[]) => {
        const [number, source, target, ...rest] = args.map(toValueObject);
        return getObjectValue(testFunction.calculate(number, source, target, ...rest));
    };

    describe('Euroconvert', () => {
        it('Is registered as a text function', () => {
            expect(functionText.some(([func, name]) => func === Euroconvert && name === FUNCTION_NAMES_TEXT.EUROCONVERT)).toBe(true);
        });

        it('Returns the results of the examples in the Excel documentation', () => {
            expect(euroconvert(1.2, 'DEM', 'EUR')).toStrictEqual(0.61);
            expect(euroconvert(1, 'FRF', 'EUR', true, 3)).toStrictEqual(0.152);
            expect(euroconvert(1, 'FRF', 'EUR', false, 3)).toStrictEqual(0.15);
            expect(euroconvert(1, 'FRF', 'DEM', true, 3)).toBeCloseTo(0.29728616, 10);
        });

        it('Converts euros with the fixed rate of the target currency', () => {
            expect(euroconvert(1, 'EUR', 'DEM', true)).toStrictEqual(1.95583);
            expect(euroconvert(1, 'EUR', 'DEM')).toStrictEqual(1.96);
            expect(euroconvert(100, 'EUR', 'ESP', true)).toBeCloseTo(16638.6, 10);
            expect(euroconvert(100, 'EUR', 'ITL')).toStrictEqual(193627);
            expect(euroconvert(1, 'EUR', 'IEP', true)).toStrictEqual(0.787564);
        });

        it('Rounds to the calculation precision of the target currency unless full precision is asked for', () => {
            // Belgian francs, pesetas, lire, escudos and drachmas have no decimals.
            expect(euroconvert(1, 'EUR', 'BEF')).toStrictEqual(40);
            expect(euroconvert(1, 'EUR', 'LUF')).toStrictEqual(40);
            expect(euroconvert(1, 'EUR', 'ESP')).toStrictEqual(166);
            expect(euroconvert(1, 'EUR', 'PTE')).toStrictEqual(200);
            expect(euroconvert(1, 'EUR', 'GRD')).toStrictEqual(341);
            expect(euroconvert(1, 'EUR', 'NLG')).toStrictEqual(2.2);
            expect(euroconvert(1, 'EUR', 'ATS')).toStrictEqual(13.76);
            expect(euroconvert(1, 'EUR', 'FIM')).toStrictEqual(5.95);
            expect(euroconvert(1, 'EUR', 'SIT')).toStrictEqual(239.64);
            expect(euroconvert(1, 'EUR', 'GRD', true)).toStrictEqual(340.75);
        });

        it('Rounds halves away from zero', () => {
            expect(euroconvert(0.5, 'EUR', 'ITL', true)).toBeCloseTo(968.135, 10);
            expect(euroconvert(-1.2, 'DEM', 'EUR')).toStrictEqual(-0.61);
            expect(euroconvert(-100, 'EUR', 'ESP')).toStrictEqual(-16639);
            expect(euroconvert(-2.5, 'EUR', 'EUR')).toStrictEqual(-2.5);
        });

        it('Triangulates through the euro between two member currencies', () => {
            // 100 / 1.95583 euros, times 6.55957 francs to the euro.
            expect(euroconvert(100, 'DEM', 'FRF', true)).toBeCloseTo(335.385488513828, 9);
            expect(euroconvert(100, 'DEM', 'FRF')).toStrictEqual(335.39);
            // The intermediate 51.12918812 euros become 51.129 before the second conversion.
            expect(euroconvert(100, 'DEM', 'FRF', true, 3)).toBeCloseTo(335.38425453, 8);
            expect(euroconvert(100, 'DEM', 'FRF', false, 3)).toStrictEqual(335.38);
            expect(euroconvert(1, 'FRF', 'DEM', false, 3)).toStrictEqual(0.3);
            // The escudo and the drachma have no calculation decimals, so the euro value rounds there too.
            expect(euroconvert(100, 'ATS', 'PTE')).toStrictEqual(1457);
        });

        it('Returns the number unchanged when source and target are the same currency', () => {
            expect(euroconvert(1.23456, 'DEM', 'DEM')).toStrictEqual(1.23456);
            expect(euroconvert(1.23456, 'EUR', 'EUR', false, 3)).toStrictEqual(1.23456);
            // An invalid precision is still an error when no triangulation takes place.
            expect(euroconvert(1, 'DEM', 'DEM', true, 2)).toStrictEqual(ErrorType.VALUE);
        });

        it('Accepts ISO codes in any letter case', () => {
            expect(euroconvert(1.2, 'dem', 'Eur')).toStrictEqual(0.61);
        });

        it('Number value test', () => {
            expect(euroconvert('1.2', 'DEM', 'EUR')).toStrictEqual(0.61);
            // Excel's add-in receives a VBA Boolean, where TRUE is -1, so Excel returns -1.95583
            // here; Univer keeps its own boolean coercion instead.
            expect(euroconvert(true, 'EUR', 'DEM', true)).toStrictEqual(1.95583);
            expect(euroconvert(null, 'EUR', 'DEM')).toStrictEqual(0);
            expect(euroconvert('test', 'DEM', 'EUR')).toStrictEqual(ErrorType.VALUE);

            const error = testFunction.calculate(ErrorValueObject.create(ErrorType.NAME), StringValueObject.create('DEM'), StringValueObject.create('EUR'));
            expect(getObjectValue(error)).toStrictEqual(ErrorType.NAME);
        });

        it('Source and target value test', () => {
            expect(euroconvert(1, 'USD', 'EUR')).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'EUR', 'GBP')).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'EURO', 'DEM')).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, '', 'DEM')).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 1, 'DEM')).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'DEM', true)).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, null, 'DEM')).toStrictEqual(ErrorType.VALUE);
            // Names that every object inherits are not currencies.
            expect(euroconvert(1, 'constructor', 'toString')).toStrictEqual(ErrorType.VALUE);

            const error = testFunction.calculate(NumberValueObject.create(1), ErrorValueObject.create(ErrorType.NAME), StringValueObject.create('EUR'));
            expect(getObjectValue(error)).toStrictEqual(ErrorType.NAME);
        });

        it('FullPrecision value test', () => {
            expect(euroconvert(1, 'EUR', 'DEM', 1)).toStrictEqual(1.95583);
            expect(euroconvert(1, 'EUR', 'DEM', 0)).toStrictEqual(1.96);
            expect(euroconvert(1, 'EUR', 'DEM', null)).toStrictEqual(1.96);
            expect(euroconvert(1, 'EUR', 'DEM', 'test')).toStrictEqual(ErrorType.VALUE);
        });

        it('TriangulationPrecision value test', () => {
            expect(euroconvert(1, 'FRF', 'DEM', true, 2)).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'FRF', 'DEM', true, 0)).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'FRF', 'DEM', true, -3)).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'FRF', 'DEM', true, 'test')).toStrictEqual(ErrorType.VALUE);
            // An invalid precision is an error even when no triangulation takes place.
            expect(euroconvert(1, 'EUR', 'DEM', true, 2)).toStrictEqual(ErrorType.VALUE);
            // Excel converts a fractional precision with VBA's CInt, which rounds halves to even.
            expect(euroconvert(1, 'FRF', 'EUR', true, 3.1)).toStrictEqual(0.152);
            expect(euroconvert(1, 'FRF', 'EUR', true, 3.4)).toStrictEqual(0.152);
            expect(euroconvert(1, 'FRF', 'EUR', true, 3.5)).toStrictEqual(0.1524);
            expect(euroconvert(1, 'FRF', 'EUR', true, 3.9)).toStrictEqual(0.1524);
            expect(euroconvert(1, 'FRF', 'EUR', true, 2.5)).toStrictEqual(ErrorType.VALUE);
            expect(euroconvert(1, 'FRF', 'EUR', true, 2.9)).toStrictEqual(0.152);
            expect(euroconvert(1, 'FRF', 'EUR', true, 4.5)).toStrictEqual(0.1524);
            expect(euroconvert(1, 'FRF', 'EUR', true, 5.5)).toStrictEqual(0.152449);
            expect(euroconvert(1, 'FRF', 'EUR', true, '3.9')).toStrictEqual(0.1524);
            expect(euroconvert(1, 'FRF', 'EUR', true, '4')).toStrictEqual(0.1524);
            // Excel never rounds the intermediate euro value to more than 15 decimals.
            expect(euroconvert(1, 'FRF', 'EUR', true, 20)).toStrictEqual(0.15244901723741);
            expect(euroconvert(1, 'FRF', 'EUR', true, 32767)).toStrictEqual(0.15244901723741);
            // Values above the VBA Integer limit overflow to #NUM!.
            expect(euroconvert(1, 'FRF', 'EUR', true, 32768)).toStrictEqual(ErrorType.NUM);
        });

        it('Value is array', () => {
            const single = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1.2]]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const source = StringValueObject.create('DEM');
            const target = StringValueObject.create('EUR');
            expect(getObjectValue(testFunction.calculate(single, source, target))).toStrictEqual(0.61);

            const multiple = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1.2, 2.4]]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            expect(getObjectValue(testFunction.calculate(multiple, source, target))).toStrictEqual(ErrorType.VALUE);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(1), source, target, BooleanValueObject.create(true), multiple))).toStrictEqual(ErrorType.VALUE);
        });
    });
});
