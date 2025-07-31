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
import { getObjectValue } from '../../../functions/util';
import { ArrayValueObject, transformToValueObject } from '../array-value-object';
import { NumberValueObject } from '../primitive-object';

describe('arrayValueObject atan2 method test', () => {
    const originArrayValueObject = ArrayValueObject.create({
        calculateValueList: transformToValueObject([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
        ]),
        rowCount: 3,
        columnCount: 5,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });

    describe('atan2', () => {
        it('origin nm, param nm', () => {
            const atan2ArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 3, 4],
                    [1, 4, 2],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = originArrayValueObject.atan2(atan2ArrayValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [0.463647609001, 0.588002603548, 0.643501108793, '#N/A', '#N/A'],
                [1.40564764938, 1.05165021255, 1.32581766367, '#N/A', '#N/A'],
                ['#N/A', '#N/A', '#N/A', '#N/A', '#N/A'],
            ]);
        });

        it('origin nm, param 1m', () => {
            const atan2ArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[2, 2, 2, 3, 3]]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = originArrayValueObject.atan2(atan2ArrayValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [0.463647609001, 0.785398163397, 0.982793723247, 0.927295218002, 1.03037682652],
                [1.2490457724, 1.29249666779, 1.32581766367, 1.2490457724, 1.27933953232],
                [1.390942827, 1.40564764938, 1.4181469984, 1.35970299357, 1.37340076695],
            ]);
        });

        it('origin nm, param n1', () => {
            const atan2ArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[3], [2], [1]]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = originArrayValueObject.atan2(atan2ArrayValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [0.321750554397, 0.588002603548, 0.785398163397, 0.927295218002, 1.03037682652],
                [1.2490457724, 1.29249666779, 1.32581766367, 1.35212738092, 1.37340076695],
                [1.48013643959, 1.48765509491, 1.49402443553, 1.49948886201, 1.50422816302],
            ]);
        });

        it('origin 1m, param nm', () => {
            const atan2ArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[2, 2, 2, 3, 3]]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = atan2ArrayValueObject.atan2(originArrayValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [1.10714871779, 0.785398163397, 0.588002603548, 0.643501108793, 0.540419500271],
                [0.321750554397, 0.278299659005, 0.244978663127, 0.321750554397, 0.291456794478],
                [0.179853499792, 0.165148677415, 0.152649328395, 0.211093333223, 0.19739555985],
            ]);
        });

        it('origin n1, param nm', () => {
            const atan2ArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[3], [2], [1]]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = atan2ArrayValueObject.atan2(originArrayValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [1.2490457724, 0.982793723247, 0.785398163397, 0.643501108793, 0.540419500271],
                [0.321750554397, 0.278299659005, 0.244978663127, 0.218668945874, 0.19739555985],
                [0.0906598872007, 0.0831412318884, 0.0767718912698, 0.0713074647853, 0.0665681637758],
            ]);
        });

        it('origin nm multiple formats, param 1 number', () => {
            const originArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const roundValueObject = NumberValueObject.create(1);
            const result = originArrayValueObject.atan2(roundValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [0.785398163397, '#VALUE!', 0.888173774378, 0.785398163397, 0],
                [0, 1.56079666011, 1.16693653189, '#VALUE!', -1.2490457724],
            ]);
        });

        it('origin 1 number, param nm multiple formats', () => {
            const originValueObject = NumberValueObject.create(1);
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = originValueObject.atan2(roundArrayValueObject);

            expect(getObjectValue(result, true)).toStrictEqual([
                [0.785398163397, '#VALUE!', 0.682622552417, 0.785398163397, 1.57079632679],
                [1.57079632679, 0.00999966668667, 0.403859794907, '#VALUE!', 2.81984209919],
            ]);
        });
    });
});
