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

import process from 'node:process';
import { expect, it } from 'vitest';
import { detectEtsPeriod } from '../ets-model';

it.runIf(process.env.RUN_ETS_BENCHMARK === '1')('benchmarks ETS seasonality on 35,040 nonperiodic hourly values', () => {
    let seed = 37;
    const values = Array.from({ length: 35_040 }, () => {
        seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
        return seed / 2 ** 32;
    });

    for (let run = 0; run < 10; run++) {
        expect(detectEtsPeriod(values)).toBe(0);
    }
    const runs = 30;
    const start = performance.now();
    for (let run = 0; run < runs; run++) {
        detectEtsPeriod(values);
    }
    const average = (performance.now() - start) / runs;
    process.stdout.write(`ETS seasonality averaged ${average.toFixed(2)} ms over ${runs} runs\n`);
});
