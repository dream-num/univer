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
import * as core from '@univerjs/core';
import { ICommandService } from '@univerjs/core';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';

import { InsertFunctionCommand } from '../insert-function.command';

describe('InsertFunctionCommand', () => {
    it('should write shared-formula ranges and direct formulas in one SetRangeValuesCommand call', async () => {
        vi.spyOn(core, 'generateRandomId').mockReturnValue('ABC123');

        const executeCommand = vi.fn().mockResolvedValue(true);
        const accessor = {
            get: (token: unknown) => {
                if (token === ICommandService) {
                    return { executeCommand };
                }

                throw new Error(`Unexpected token: ${String(token)}`);
            },
        } as unknown as IAccessor;

        const result = await InsertFunctionCommand.handler!(accessor, {
            list: [{
                range: {
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 2,
                },
                primary: {
                    row: 1,
                    column: 1,
                },
                formula: '=SUM(B1:C2)',
            }],
            listOfRangeHasNumber: [{
                range: {
                    startRow: 4,
                    endRow: 4,
                    startColumn: 0,
                    endColumn: 0,
                },
                primary: {
                    row: 4,
                    column: 0,
                },
                formula: '=SUM(A1:A4)',
            }],
        });

        expect(result).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetRangeValuesCommand.id, {
            value: {
                1: {
                    1: {
                        f: '=SUM(B1:C2)',
                        si: 'ABC123',
                    },
                    2: {
                        si: 'ABC123',
                    },
                },
                2: {
                    1: {
                        si: 'ABC123',
                    },
                    2: {
                        si: 'ABC123',
                    },
                },
                4: {
                    0: {
                        f: '=SUM(A1:A4)',
                    },
                },
            },
        });
    });
});
