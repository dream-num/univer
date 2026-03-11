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

import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { StatusBarService } from '../status-bar.service';

describe('StatusBarService', () => {
    it('filters status values based on count/counter rules', () => {
        const service = new StatusBarService();

        // With only one non-empty cell: should emit pattern but filter out all calculated metrics.
        service.setState({
            pattern: '0.00',
            values: [
                { func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 1 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNT, value: 1 },
                { func: FUNCTION_NAMES_MATH.SUM, value: 10 },
                { func: FUNCTION_NAMES_STATISTICAL.MIN, value: 10 },
                { func: FUNCTION_NAMES_STATISTICAL.MAX, value: 10 },
            ],
        });

        expect(service.getState()).toEqual({
            pattern: '0.00',
            values: [],
        });

        // With multiple cells but no numbers: only `COUNTA` should be kept.
        service.setState({
            pattern: null,
            values: [
                { func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 3 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNT, value: 0 },
                { func: FUNCTION_NAMES_MATH.SUM, value: 0 },
                { func: FUNCTION_NAMES_STATISTICAL.AVERAGE, value: 0 },
            ],
        });

        expect(service.getState()).toEqual({
            pattern: null,
            values: [{ func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 3 }],
        });

        // With multiple numeric cells: all supported functions should be kept.
        service.setState({
            pattern: null,
            values: [
                { func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 3 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNT, value: 2 },
                { func: FUNCTION_NAMES_MATH.SUM, value: 12 },
                { func: FUNCTION_NAMES_STATISTICAL.MIN, value: 5 },
                { func: FUNCTION_NAMES_STATISTICAL.MAX, value: 7 },
                { func: FUNCTION_NAMES_STATISTICAL.AVERAGE, value: 6 },
            ],
        });

        expect(service.getState()!.values.map((v) => v.func).sort()).toEqual([
            FUNCTION_NAMES_STATISTICAL.AVERAGE,
            FUNCTION_NAMES_STATISTICAL.COUNT,
            FUNCTION_NAMES_STATISTICAL.COUNTA,
            FUNCTION_NAMES_STATISTICAL.MAX,
            FUNCTION_NAMES_STATISTICAL.MIN,
            FUNCTION_NAMES_MATH.SUM,
        ].sort());
    });
});
