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

            expect((originArrayValueObject.atan2(atan2ArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.4636476090008061, 0.5880026035475675, 0.6435011087932844, '#N/A', '#N/A'],
                [1.4056476493802699, 1.0516502125483738, 1.3258176636680326, '#N/A', '#N/A'],
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

            expect((originArrayValueObject.atan2(atan2ArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.4636476090008061, 0.7853981633974483, 0.982793723247329, 0.9272952180016122, 1.0303768265243125],
                [1.2490457723982544, 1.2924966677897853, 1.3258176636680326, 1.2490457723982544, 1.2793395323170296],
                [1.3909428270024184, 1.4056476493802699, 1.4181469983996315, 1.35970299357215, 1.373400766945016],
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

            expect((originArrayValueObject.atan2(atan2ArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.3217505543966422, 0.5880026035475675, 0.7853981633974483, 0.9272952180016122, 1.0303768265243125],
                [1.2490457723982544, 1.2924966677897853, 1.3258176636680326, 1.3521273809209546, 1.373400766945016],
                [1.4801364395941514, 1.4876550949064553, 1.4940244355251187, 1.4994888620096063, 1.5042281630190728],
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

            expect((atan2ArrayValueObject.atan2(originArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1.1071487177940904, 0.7853981633974483, 0.5880026035475675, 0.6435011087932844, 0.5404195002705842],
                [0.3217505543966422, 0.27829965900511133, 0.24497866312686414, 0.3217505543966422, 0.2914567944778671],
                [0.17985349979247828, 0.16514867741462683, 0.15264932839526518, 0.21109333322274654, 0.19739555984988078],
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

            expect((atan2ArrayValueObject.atan2(originArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1.2490457723982544, 0.982793723247329, 0.7853981633974483, 0.6435011087932844, 0.5404195002705842],
                [0.3217505543966422, 0.27829965900511133, 0.24497866312686414, 0.21866894587394195, 0.19739555984988078],
                [0.09065988720074511, 0.08314123188844122, 0.07677189126977804, 0.07130746478529032, 0.06656816377582381],
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

            expect((originArrayValueObject.atan2(roundValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.7853981633974483, '#VALUE!', 0.8881737743776796, 0.7853981633974483, 0],
                [0, 1.5607966601082315, 1.16693653188752, '#VALUE!', -1.2490457723982544],
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

            expect((originValueObject.atan2(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.7853981633974483, '#VALUE!', 0.682622552417217, 0.7853981633974483, 1.5707963267948966],
                [1.5707963267948966, 0.009999666686665238, 0.40385979490737667, '#VALUE!', 2.819842099193151],
            ]);
        });
    });
});
