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

numfmtTest('bigint', (t) => {
    t.format('0', Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER));
    t.format('0', 10n, '10');

    t.format('General', 10n, '10');
    t.format('General', 9007199254740991n, '9.0072E+15');

    t.format('0.0', 9007199254740991n, '9007199254740990.0');

    t.format('#,##0.0', 9007199254740991n, '9,007,199,254,740,990.0');
    t.format('#,##0.0', 9007199254750000n, '######');
    t.format('#,##0.0', -9007199254750000n, '######');

    t.format('#0-000-00', 9007199254750000n, '######');
    t.format('0%', 9007199254750000n, '######');

    t.format('#0-000-00', 9007199254750000n, '9007199254750000', { bigintErrorNumber: true });
    t.format('0%', 9007199254750000n, '9007199254750000', { bigintErrorNumber: true });

    // preferably we should support bigint throughout:
    // t.format('#0-000-00', 9007199254750000n, '90071992547-500-00');
    // t.format('0%', 9007199254750000n, '900719925475000000%');

    t.format('0.000E+00', 999990000, '1.000E+09');
    t.format('0.000E+00', 999990000n, '1.000E+09');
});
