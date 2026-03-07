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

import type { IAccessor } from '@univerjs/core';
import { DataValidationOperator, DataValidationType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultNewRule } from '../create';

describe('createDefaultNewRule', () => {
    it('uses the current selection ranges and default decimal criteria', () => {
        const accessor = {
            get(token: unknown) {
                if (token === SheetsSelectionsService) {
                    return {
                        getCurrentSelections: vi.fn(() => [
                            { range: { startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 } },
                        ]),
                    };
                }

                throw new Error(`Unknown token: ${String(token)}`);
            },
        } as IAccessor;

        const rule = createDefaultNewRule(accessor);

        expect(rule.uid).toHaveLength(6);
        expect(rule.type).toBe(DataValidationType.DECIMAL);
        expect(rule.operator).toBe(DataValidationOperator.EQUAL);
        expect(rule.formula1).toBe('100');
        expect(rule.ranges).toEqual([{ startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 }]);
    });
});
