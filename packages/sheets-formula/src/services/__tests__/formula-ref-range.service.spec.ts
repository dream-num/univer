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

import type { ITestBed } from './util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FormulaRefRangeService } from '../formula-ref-range.service';
import { createCommandTestBed } from './util';

describe('FormulaRefRangeService service coverage', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createCommandTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('updates sheet formula references when a referenced range moves', () => {
        const service = testBed.get(FormulaRefRangeService);

        const transformedFormula = service.transformFormulaByEffectCommand('test', 'sheet1', '=SUM(A1)', {
            id: 'sheet.command.move-range',
            params: {
                fromRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
                toRange: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 },
            },
        });

        expect(transformedFormula).toBe('=SUM(B3)');
    });
});
