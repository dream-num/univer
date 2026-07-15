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

import { expect, expectTypeOf, it } from 'vitest';
import * as numfmt from '../api';

it('preserves the numfmt 3.2.6 type exports', () => {
    expectTypeOf<numfmt.FormatDateInfo['clockType']>().toEqualTypeOf<12 | 24>();
    expectTypeOf<numfmt.FormatInfo['type']>().toMatchTypeOf<string>();
    expectTypeOf<numfmt.FormatToken['raw']>().toEqualTypeOf<string>();
    expectTypeOf<numfmt.LocaleData['decimal']>().toEqualTypeOf<string>();
    expectTypeOf<numfmt.LocaleToken['lang']>().toEqualTypeOf<string>();
    expectTypeOf<numfmt.ParseData['v']>().toEqualTypeOf<number | boolean>();
});

it('preserves the numfmt 3.2.6 runtime exports', () => {
    expect(Object.keys(numfmt).sort()).toEqual([
        'addLocale',
        'dateFromSerial',
        'dateToSerial',
        'dec2frac',
        'format',
        'formatColor',
        'getFormatDateInfo',
        'getFormatInfo',
        'getLocale',
        'isDateFormat',
        'isPercentFormat',
        'isTextFormat',
        'isValidFormat',
        'parseBool',
        'parseDate',
        'parseLocale',
        'parseNumber',
        'parseTime',
        'parseValue',
        'round',
        'tokenTypes',
        'tokenize',
    ]);
});
