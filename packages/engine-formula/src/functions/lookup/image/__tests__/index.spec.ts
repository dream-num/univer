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
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { ImageFunction } from '../index';

describe('ImageFunction', () => {
    const fn = new ImageFunction(FUNCTION_NAMES_LOOKUP.IMAGE);

    it('should return #VALUE! when source is not string', () => {
        const source = ArrayValueObject.createByArray([[1]]);
        const result = fn.calculate(source);
        expect(result.isError()).toBe(true);
        expect(result.getValue()).toBe(ErrorType.VALUE);
    });

    it('should build image metadata for valid scalar params', () => {
        const result = fn.calculate(
            StringValueObject.create('https://image'),
            StringValueObject.create('alt'),
            StringValueObject.create('3'),
            StringValueObject.create('100'),
            StringValueObject.create('200')
        ) as StringValueObject;

        expect(result.isString()).toBe(true);
        expect(result.isImage()).toBe(true);
        expect(result.getImageInfo()).toEqual({
            source: 'https://image',
            altText: 'alt',
            sizing: 3,
            height: 100,
            width: 200,
        });
    });

    it('should validate sizing and size constraints', () => {
        const source = StringValueObject.create('https://image');

        const invalidSizing = fn.calculate(source, undefined, StringValueObject.create('9'));
        expect(invalidSizing.getValue()).toBe(ErrorType.VALUE);

        const invalidBySizingRule = fn.calculate(
            source,
            undefined,
            StringValueObject.create('1'),
            StringValueObject.create('10')
        );
        expect(invalidBySizingRule.getValue()).toBe(ErrorType.VALUE);

        const invalidHeightWidth = fn.calculate(
            source,
            undefined,
            StringValueObject.create('3'),
            StringValueObject.create('0'),
            StringValueObject.create('0')
        );
        expect(invalidHeightWidth.getValue()).toBe(ErrorType.VALUE);
    });

    it('should propagate argument errors in array mode and calculate each cell', () => {
        const source = ArrayValueObject.create({
            calculateValueList: transformToValueObject([
                ['https://a', 'https://b'],
                ['https://c', 'https://d'],
            ]),
            rowCount: 2,
            columnCount: 2,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
        const alt = ArrayValueObject.create({
            calculateValueList: transformToValueObject([
                ['ok', ErrorType.NAME],
                [true, false],
            ]),
            rowCount: 2,
            columnCount: 2,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
        const sizing = ArrayValueObject.createByArray([[3]]);
        const height = ArrayValueObject.createByArray([[20]]);
        const width = ArrayValueObject.createByArray([[30]]);

        const result = fn.calculate(source, alt, sizing, height, width) as ArrayValueObject;
        expect(result.getRowCount()).toBe(2);
        expect(result.getColumnCount()).toBe(2);

        const first = result.get(0, 0) as StringValueObject;
        expect(first.isImage()).toBe(true);
        expect(first.getImageInfo()).toEqual({
            source: 'https://a',
            altText: 'ok',
            sizing: 3,
            height: 20,
            width: 30,
        });

        const second = result.get(0, 1);
        expect(second?.isError()).toBe(true);
        expect(second?.getValue()).toBe(ErrorType.NAME);
    });
});
