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

import { format, formatColor, isDateFormat } from '../api';
import { numfmtTest } from './test-utils';

const excelOpts = { dateSpanLarge: false, dateErrorNumber: false };

numfmtTest('Robust mode', (t) => {
    t.equal(format('dddd, dd. mmmm yyy', -1, excelOpts), '######');

    // these things should throw
    t.throws(() => format('a;b;c;d;', 0, excelOpts), 'a;b;c;d;');
    t.throws(() => format('y 0', 0, excelOpts), 'y 0');

    // ...but not in robust mode
    const opts = { locale: 'en', throws: false, ...excelOpts };
    t.equal(format('a;b;c;d;', 0, opts), '######', 'format does not throw with "a;b;c;d;"');
    t.equal(format('y 0', 1, opts), '######', 'format does not throw with "y 0"');
    t.equal(format('dddd, dd. mmmm yyy', -1, opts), '######', 'format does not throw with "dddd, dd. mmmm yyy"');
    t.equal(format('y 0', 1, opts), '######', 'format does not throw with "dddd, dd. mmmm yyy"');

    t.equal(formatColor('a;b;c;d;', 0, opts), null, 'formatColor does not throw');
    t.equal(
        (isDateFormat as (pattern: string, options?: unknown) => boolean)('a;b;c;d;', opts),
        false,
        'isDateFormat does not throw'
    );
});
