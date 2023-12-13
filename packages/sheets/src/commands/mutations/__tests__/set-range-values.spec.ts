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

import { Tools } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { transformCellsFromRefStyle, transformRefStyleFromCells } from '../set-range-values.mutation';

const createCl = (v: string) => ({ rgb: v });
describe('test set-range-values-mutation', () => {
    it('test transformRefStyleFromCells', () => {
        const result = transformRefStyleFromCells({
            1: {
                2: { s: { cl: createCl('23') } },
                3: { s: { cl: createCl('1') } },
                4: { s: { cl: createCl('2113') } },
                5: { s: { cl: createCl('2113') } },
                6: { s: 'asd' },
                7: { v: 123 },
            },
        });
        expect(result).toEqual({
            cellValue: {
                '1': {
                    '2': {
                        s: '0',
                    },
                    '3': {
                        s: '1',
                    },
                    '4': {
                        s: '2',
                    },
                    '5': {
                        s: '2',
                    },
                    '6': { s: 'asd' },
                    '7': { v: 123 },
                },
            },
            styleRefMap: {
                '0': {
                    cl: {
                        rgb: '23',
                    },
                },
                '1': {
                    cl: {
                        rgb: '1',
                    },
                },
                '2': {
                    cl: {
                        rgb: '2113',
                    },
                },
            },
        });
    });

    it('test transformCellsFromRefStyle', () => {
        const cells = {
            1: {
                2: { s: { cl: createCl('23') } },
                3: { s: { cl: createCl('1') } },
                4: { s: { cl: createCl('2113') } },
                5: { s: { cl: createCl('2113') } },
                '6': { s: 'asd' },
                '7': { v: 123 },
            },
        };
        const result = transformRefStyleFromCells(Tools.deepClone(cells));
        const cells2 = transformCellsFromRefStyle(result.cellValue, result.styleRefMap!);
        expect(cells2).toEqual(cells);
    });
});
