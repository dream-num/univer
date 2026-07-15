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

import type { FormatOptions } from '../types';
import { numfmtTest } from './test-utils';

numfmtTest('SSF-fractions tests', (t) => {
    t.format('# ?/?', 1, '1    ', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', -1.2, '-1 1/5', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', 12.3, '12 1/3', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', -12.34, '-12 1/3', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', 123.45, '123 4/9', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', -123.456, '-123 1/2', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', 1234.567, '1234 4/7', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', -1234.5678, '-1234 4/7', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', 12345.6789, '12345 2/3', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', -12345.67891, '-12345 2/3', '# ?/?' as unknown as FormatOptions);
    t.format('# ??/??', 1, '1      ', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', -1.2, '-1  1/5 ', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', 12.3, '12  3/10', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', -12.34, '-12 17/50', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', 123.45, '123  9/20', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', -123.456, '-123 26/57', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', 1234.567, '1234 55/97', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', -1234.5678, '-1234 46/81', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', 12345.6789, '12345 55/81', '# ??/??' as unknown as FormatOptions);
    t.format('# ??/??', -12345.67891, '-12345 55/81', '# ??/??' as unknown as FormatOptions);
    t.format('# ???/???', 1, '1        ', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', -1.2, '-1   1/5  ', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', 12.3, '12   3/10 ', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', -12.34, '-12  17/50 ', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', 123.45, '123   9/20 ', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', -123.456, '-123  57/125', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', 1234.567, '1234  55/97 ', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', -1234.5678, '-1234  67/118', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', 12345.6789, '12345  74/109', '# ???/???' as unknown as FormatOptions);
    t.format('# ???/???', -12345.67891, '-12345 573/844', '# ???/???' as unknown as FormatOptions);
    t.format('# ?/2', 1, '1    ', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', -1.2, '-1    ', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', 12.3, '12 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', -12.34, '-12 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', 123.45, '123 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', -123.456, '-123 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', 1234.567, '1234 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', -1234.5678, '-1234 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', 12345.6789, '12345 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/2', -12345.67891, '-12345 1/2', '# ?/2' as unknown as FormatOptions);
    t.format('# ?/4', 1, '1    ', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', -1.2, '-1 1/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', 12.3, '12 1/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', -12.34, '-12 1/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', 123.45, '123 2/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', -123.456, '-123 2/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', 1234.567, '1234 2/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', -1234.5678, '-1234 2/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', 12345.6789, '12345 3/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/4', -12345.67891, '-12345 3/4', '# ?/4' as unknown as FormatOptions);
    t.format('# ?/8', 1, '1    ', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', -1.2, '-1 2/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', 12.3, '12 2/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', -12.34, '-12 3/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', 123.45, '123 4/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', -123.456, '-123 4/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', 1234.567, '1234 5/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', -1234.5678, '-1234 5/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', 12345.6789, '12345 5/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ?/8', -12345.67891, '-12345 5/8', '# ?/8' as unknown as FormatOptions);
    t.format('# ??/16', 1, '1      ', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', -1.2, '-1  3/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', 12.3, '12  5/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', -12.34, '-12  5/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', 123.45, '123  7/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', -123.456, '-123  7/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', 1234.567, '1234  9/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', -1234.5678, '-1234  9/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', 12345.6789, '12345 11/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ??/16', -12345.67891, '-12345 11/16', '# ??/16' as unknown as FormatOptions);
    t.format('# ?/10', 1, '1     ', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', -1.2, '-1 2/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', 12.3, '12 3/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', -12.34, '-12 3/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', 123.45, '123 5/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', -123.456, '-123 5/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', 1234.567, '1234 6/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', -1234.5678, '-1234 6/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', 12345.6789, '12345 7/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ?/10', -12345.67891, '-12345 7/10', '# ?/10' as unknown as FormatOptions);
    t.format('# ??/100', 1, '1       ', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', -1.2, '-1 20/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', 12.3, '12 30/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', -12.34, '-12 34/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', 123.45, '123 45/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', -123.456, '-123 46/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', 1234.567, '1234 57/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', -1234.5678, '-1234 57/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', 12345.6789, '12345 68/100', '# ??/100' as unknown as FormatOptions);
    t.format('# ??/100', -12345.67891, '-12345 68/100', '# ??/100' as unknown as FormatOptions);
    t.format('??/??', 1, ' 1/1 ', '??/??' as unknown as FormatOptions);
    t.format('??/??', -1.2, '- 6/5 ', '??/??' as unknown as FormatOptions);
    t.format('??/??', 12.3, '123/10', '??/??' as unknown as FormatOptions);
    t.format('??/??', -12.34, '-617/50', '??/??' as unknown as FormatOptions);
    t.format('??/??', 123.45, '2469/20', '??/??' as unknown as FormatOptions);
    t.format('??/??', -123.456, '-7037/57', '??/??' as unknown as FormatOptions);
    t.format('??/??', 1234.567, '119753/97', '??/??' as unknown as FormatOptions);
    t.format('??/??', -1234.5678, '-100000/81', '??/??' as unknown as FormatOptions);
    t.format('??/??', 12345.6789, '1000000/81', '??/??' as unknown as FormatOptions);
    t.format('??/??', -12345.67891, '-1000000/81', '??/??' as unknown as FormatOptions);
    t.format('# ?/?', 0.3, ' 2/7', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', 1.3, '1 1/3', '# ?/?' as unknown as FormatOptions);
    t.format('# ?/?', 2.3, '2 2/7', '# ?/?' as unknown as FormatOptions);
    t.format('# ??/?????????', 0.123251512342345, ' 480894/3901729  ', '# ??/?????????' as unknown as FormatOptions);
    t.format('# ?? / ?????????', 0.123251512342345, ' 480894 / 3901729  ', '# ?? / ?????????' as unknown as FormatOptions);
    t.format('0', 0, '0', '0' as unknown as FormatOptions);
});

numfmtTest('More fraction cases', (t) => {
    t.formatInvalid('0/');
    t.formatInvalid('/0');
    t.formatInvalid('/');

    t.format('0/0', 0, '0/1');
    t.format('0/0', 1, '1/1');
    t.format('0/0', 123, '123/1');
    t.format('0/0', 12.345, '37/3');
    t.format('0 0/0', 0, '0 0/1');
    t.format('0 0/0', 1, '1 0/1');
    t.format('0 0/0', 123, '123 0/1');
    t.format('0 0/0', 12.345, '12 1/3');

    t.format('?/?', 0, '0/1');
    t.format('?/?', 1, '1/1');
    t.format('?/?', 123, '123/1');
    t.format('?/?', 12.345, '37/3');
    t.format('? ?/?', 0, '0    ');
    t.format('? ?/?', 1, '1    ');
    t.format('? ?/?', 123, '123    ');
    t.format('? ?/?', 12.345, '12 1/3');

    t.format('#/#', 0, '0/1');
    t.format('#/#', 1, '1/1');
    t.format('#/#', 123, '123/1');
    t.format('#/#', 12.345, '37/3');
    t.format('# #/#', 0, '0');
    t.format('# #/#', 1, '1');
    t.format('# #/#', 123, '123');
    t.format('# #/#', 12.345, '12 1/3');
});
