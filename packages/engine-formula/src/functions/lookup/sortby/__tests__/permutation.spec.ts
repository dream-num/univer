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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Sortby } from '../index';

function array(values: (number | string | boolean | null)[][]): ArrayValueObject {
    return ArrayValueObject.create({
        calculateValueList: transformToValueObject(values),
        rowCount: values.length,
        columnCount: values[0].length,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });
}

describe.each([false, true])('SORTBY column orientation: %s', (byColumns) => {
    const func = new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY);
    const orient = (values: number[][]) => byColumns ? values[0].map((_, col) => values.map((row) => row[col])) : values;
    const keys = (values: (number | string | boolean | null)[]) => array(byColumns ? [values] : values.map((value) => [value]));

    it.each([
        { order: 1, indices: [3, 1, 0, 2, 4] },
        { order: -1, indices: [0, 2, 4, 3, 1] },
    ])('preserves secondary keys, ties and source arrays with order $order', ({ order, indices }) => {
        const rows = Array.from({ length: 5 }, (_, row) => [row * 100, row * 100 + 1, row * 100 + 2]);
        const source = array(orient(rows));
        const primary = keys([2, 1, 2, 1, 2]);
        const secondary = keys([3, 2, 1, 3, 1]);
        const originalPrimary = getObjectValue(primary);
        const originalSecondary = getObjectValue(secondary);

        const result = func.calculate(source, primary, NumberValueObject.create(order), secondary, NumberValueObject.create(-1)) as ArrayValueObject;

        expect(getObjectValue(result)).toEqual(orient(indices.map((index) => rows[index])));
        expect(getObjectValue(source)).toEqual(orient(rows));
        expect(getObjectValue(primary)).toEqual(originalPrimary);
        expect(getObjectValue(secondary)).toEqual(originalSecondary);
        result.set(0, 0, NumberValueObject.create(-1));
        expect(getObjectValue(source)).toEqual(orient(rows));
    });

    it.each([
        { order: 1, indices: [3, 2, 5, 1, 4, 0] },
        { order: -1, indices: [4, 1, 5, 2, 3, 0] },
    ])('retains mixed-type key ordering with order $order', ({ order, indices }) => {
        const rows = Array.from({ length: 6 }, (_, row) => [row, row + 10]);
        const source = array(orient(rows));
        const byArray = keys([null, true, 'z', 2, ErrorType.NA, false]);

        const result = func.calculate(source, byArray, NumberValueObject.create(order));

        expect(getObjectValue(result)).toEqual(orient(indices.map((index) => rows[index])));
        expect(getObjectValue(source)).toEqual(orient(rows));
    });
});

it('keeps array-valued sort-order results and their errors independent', () => {
    const func = new Sortby(FUNCTION_NAMES_LOOKUP.SORTBY);
    const source = array([[20], [10], [30]]);
    const result = func.calculate(source, array([[2], [1], [3]]), array([[1, -1, 0, ErrorType.NA]]));

    expect(getObjectValue(result)).toEqual([[10, 30, ErrorType.VALUE, ErrorType.NA]]);
    expect(getObjectValue(source)).toEqual([[20], [10], [30]]);
});
