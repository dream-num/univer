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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { dateInfo, info } from '../format-info';
import { parsePattern } from '../parse-pattern';
import { tokenize } from '../tokenize';

describe('numfmt pattern parser', () => {
    it('tokenizes number operators', () => {
        expect(tokenize('0.00').map(({ type, value, raw }) => ({ type, value, raw }))).toEqual([
            { type: 'zero', value: '0', raw: '0' },
            { type: 'point', value: '.', raw: '.' },
            { type: 'zero', value: '0', raw: '0' },
            { type: 'zero', value: '0', raw: '0' },
        ]);
    });

    it('partitions conditions and colors', () => {
        const parsed = parsePattern('[Red][>=10]0.00;[Blue]-0.00');
        expect(parsed.partitions).toHaveLength(2);
        expect(parsed.partitions[0]).toMatchObject({
            color: 'red',
            condition: ['>=', 10],
            frac_max: 2,
        });
    });

    it('reports format metadata', () => {
        const number = parsePattern('#,##0.00');
        expect(info(number.partitions)).toEqual({
            type: 'grouped',
            isDate: false,
            isText: false,
            isPercent: false,
            maxDecimals: 2,
            scale: 1,
            color: 0,
            parentheses: 0,
            grouped: 1,
            code: ',2',
            level: 10.2,
        });

        const date = parsePattern('yyyy-mm-dd hh:mm:ss');
        expect(dateInfo(date.partitions)).toEqual({
            year: true,
            month: true,
            day: true,
            hours: true,
            minutes: true,
            seconds: true,
            clockType: 24,
        });
    });
});
