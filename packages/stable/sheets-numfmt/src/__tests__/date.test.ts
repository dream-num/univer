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

import { numfmt } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

describe('test numfmt date', () => {
    it('date parse date', () => {
        expect(numfmt.parseDate('asdasdasd')).toBe(null);
        expect(numfmt.parseDate('1988/12/12 21:21:21').z).toBe('yyyy/mm/dd hh:mm:ss');
        expect(numfmt.parseDate('12/12 21:21:21').z).toBe('mm/dd hh:mm:ss');
        expect(numfmt.parseDate('2012/12 21:21:21').z).toBe('yyyy/m hh:mm:ss'); // TODO: is yyy/mm hh:mm:ss ?
        expect(numfmt.parseDate('2012/12 21:21').z).toBe('yyyy/m hh:mm'); // TODO: is yyy/mm hh:mm ?
        expect(numfmt.parseDate('2012/12').z).toBe('yyyy/m'); // TODO: is yyy/mm ?
        expect(numfmt.parseDate('2012/12/12').z).toBe('yyyy/mm/dd');
        expect(numfmt.parseDate('21:21')).toBe(null);
    });
});
