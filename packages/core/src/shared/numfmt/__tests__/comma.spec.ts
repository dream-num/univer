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

numfmtTest('Excel-compatible decimal rounding after comma scaling', (t) => {
    t.format('0.00,', 10155, '10.16');
});

numfmtTest('Correct handling of the comma operator', (t) => {
    t.format('0,', 1234567.89, '1235');
    t.format('0,,', 1234567.89, '1');
    t.format('0,,,', 1234567.89, '0');
    t.format('0,0', 1234567.89, '1,234,568');
    t.format('0,00', 1234567.89, '1,234,568');
    t.format('0,000', 1234567.89, '1,234,568');
    t.format('0,0,0', 1234567.89, '1,234,568');
    t.format('0,,0', 1234567.89, '1,234,568');
    t.format('0,,,0', 1234567.89, '1,234,568');
    t.format('0,x', 1234567.89, '1235x');
    t.format('0,x,', 1234567.89, '1235x,');
    t.format('0x,', 1234567.89, '1234568x,');
    t.format('0,,x', 1234567.89, '1x');
    t.format('0,x0', 1234567.89, '123456x8');
    t.format('0 , 0', 1234567.89, '123456 , 8');
    t.format('0, ,0', 1234567.89, '123456 ,8');
    t.format('0.,', 1234567.89, '1235.');
    t.format('0.0,', 1234567.89, '1234.6');
    t.format('0.0,0', 1234567.89, '1234567.89');
    t.format('0,0 0/0', 1234567.89, '1,234,567 8/9');
    t.format('0,0,,0', 1234567.89, '1,234,568');
    t.format('0.0,0,', 1234567.89, '1234.57');
    t.format('0.0 , 0 ,', 1234567.89, '1234567.8 , 9 ,');
    t.format('0 ,', 1234567.89, '1234568 ,');
    t.format('0x,', 1234567.89, '1234568x,');
    t.format('0 ,', 1234567.89, '1234568 ,');
    t.format('0 ,,', 1234567.89, '1234568 ,');
    t.format('0x,', 1234567.89, '1234568x,');
    t.format('x,0', 1234567.89, 'x,1234568');

    // Still unsolved by the formatter: digit interplay with 0#?
    t.format('01,', 1234567.89, '12351');
    t.format('09,', 1234567.89, '12359');
    // t.format('01,0', 1234567.89, '1,234,5618');
    // t.format('09,0', 1234567.89, '1,234,5698');
    // t.format('0, 9', 1234567.89, '1234568 9');

    t.formatInvalid('0,0/0');
    t.formatInvalid('0/0,0');
    // t.formatInvalid('0 0/0,'); "1234 4/7" gets emitted, same as Sheets
});
