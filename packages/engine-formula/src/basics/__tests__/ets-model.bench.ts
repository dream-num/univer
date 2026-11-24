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

import { bench, describe } from 'vitest';
import { detectEtsPeriod } from '../ets-model';

describe('ETS seasonality', () => {
    let seed = 37;
    const values = Array.from({ length: 35_040 }, () => {
        seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
        return seed / 2 ** 32;
    });

    bench('searches four years of non-periodic hourly values', () => {
        if (detectEtsPeriod(values) !== 0) {
            throw new Error('Expected no seasonal period');
        }
    });
});
