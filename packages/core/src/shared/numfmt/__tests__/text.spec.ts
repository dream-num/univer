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

import { format } from '../api';
import { numfmtTest } from './test-utils';

numfmtTest('Errors', (t) => {
    // no more than a single text section
    t.throws(() => format('@;@', undefined), '@;@');
});

numfmtTest('Repeated @ in same pattern', (t) => {
    t.format('@@', 1, '1');
    t.format('@@', -1, '-1');
    t.format('@@', 0, '0');
    t.format('@@', 'text', 'texttext');
});

numfmtTest('Text in combination with other things', (t) => {
    t.format('@ "foo"', 1, '1');
    t.format('@ "foo"', -1, '-1');
    t.format('@ "foo"', 0, '0');
    t.format('@ "foo"', 'text', 'text foo');

    t.format('"bar" @ "foo"', 1, '1');
    t.format('"bar" @ "foo"', -1, '-1');
    t.format('"bar" @ "foo"', 0, '0');
    t.format('"bar" @ "foo"', 'text', 'bar text foo');
});
