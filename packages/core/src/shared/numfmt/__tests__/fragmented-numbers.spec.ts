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

import { numfmtTest } from './test-utils';

numfmtTest('Fragmented number parts', (t) => {
    // exps with fragments
    t.format('0.00E+0x0', 123456789, '1.23E+0x8');
    t.format('0.00E+0x0', 123456789, '1.23E+0x8');
    t.format('0.00E+?x?', 123456789, '1.23E+ x8');
    t.format('0.00E+#x#', 123456789, '1.23E+x8');
    t.format('0.0x0E+0', 123456789, '1.2x3E+8');
    t.format('0x0.00E+0', 123456789, '0x1.23E+8');
    t.format('0x0.0x0E+0x0', 1, '0x1.0x0E+0x0');
    t.format('#x#.#x#E+#x#', 1, 'x1.xE+x0');
    t.format('?x?.?x?E+?x?', 1, ' x1. x E+ x0');

    t.format('00 00/00', 1, '01 00/01');
    t.format('00x00/00', 12345.67, '12345x65/97');
    t.format('0z0 00/00', 12345.67, '1234z5 65/97');
    t.format('00 0z0/00', 12345.67, '1234 5z65/97');
    t.format('00 00/0z0', 12345.67, '12345 02/3z0');
    t.format('00 0/0', 12345.67, '12345 2/3');
    t.format('00 ??/?z?', 12345.67, '12345  2/3z ');

    t.format('000E+00', 12345.67, '012E+03');
    t.format('00x0E+00', 12345.67, '01x2E+03');
    t.format('000E+0x0', 12345.67, '012E+0x3');
    t.format('0.0E+0x00', 1234567890000, '1.2E+0x12');
});
