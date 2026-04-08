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

import type { IAccessor, IWorkbookData } from '@univerjs/core';
import { CellValueType, ICommandService, IUniverInstanceService, LocaleType } from '@univerjs/core';
import { SetRangeValuesCommand, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from '../../../facade/__tests__/create-test-bed';
import { QuickSumCommand } from '../quick-sum.command';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 1, t: CellValueType.NUMBER },
                        1: { v: 2, t: CellValueType.NUMBER },
                        2: {},
                    },
                    1: {
                        0: { v: 3, t: CellValueType.NUMBER },
                        1: { v: 4, t: CellValueType.NUMBER },
                        2: {},
                    },
                    2: {
                        0: {},
                        1: {},
                        2: {},
                    },
                },
            },
        },
        styles: {},
    };
}

describe('QuickSumCommand', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns false when there is no active selection', async () => {
        const testBed = createFacadeTestBed(createWorkbookData());

        const executeCommand = vi.fn();
        const accessor = {
            get(token: unknown) {
                if (token === SheetsSelectionsService) {
                    return { getCurrentLastSelection: vi.fn(() => null) };
                }
                if (token === IUniverInstanceService) {
                    return testBed.injector.get(IUniverInstanceService);
                }
                if (token === ICommandService) {
                    return { executeCommand };
                }

                throw new Error(`Unknown token: ${String(token)}`);
            },
        } as unknown as IAccessor;

        await expect(QuickSumCommand.handler?.(accessor)).resolves.toBe(false);
        expect(executeCommand).not.toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('writes row and column sum formulas, then resets selection to the computed range', async () => {
        const testBed = createFacadeTestBed(createWorkbookData());
        const executeCommand = vi.fn(async () => true);
        const accessor = {
            get(token: unknown) {
                if (token === SheetsSelectionsService) {
                    return {
                        getCurrentLastSelection: vi.fn(() => ({
                            range: {
                                startRow: 0,
                                startColumn: 0,
                                endRow: 2,
                                endColumn: 2,
                            },
                            primary: {
                                startRow: 9,
                                startColumn: 9,
                                endRow: 9,
                                endColumn: 9,
                            },
                        })),
                    };
                }
                if (token === IUniverInstanceService) {
                    return testBed.injector.get(IUniverInstanceService);
                }
                if (token === ICommandService) {
                    return { executeCommand };
                }

                throw new Error(`Unknown token: ${String(token)}`);
            },
        } as unknown as IAccessor;

        await expect(QuickSumCommand.handler?.(accessor)).resolves.toBe(true);

        expect(executeCommand).toHaveBeenNthCalledWith(1, SetRangeValuesCommand.id, {
            range: {
                startRow: 0,
                startColumn: 0,
                endRow: 2,
                endColumn: 2,
            },
            value: {
                0: {
                    2: { f: '=SUM(A1:B1)' },
                },
                1: {
                    2: { f: '=SUM(A2:B2)' },
                },
                2: {
                    0: { f: '=SUM(A1:A2)' },
                    1: { f: '=SUM(B1:B2)' },
                    2: { f: '=SUM(A3:B3)' },
                },
            },
        }, undefined);
        expect(executeCommand).toHaveBeenNthCalledWith(2, SetSelectionsOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            selections: [{
                range: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 2,
                    endColumn: 2,
                },
                primary: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    actualRow: 0,
                    actualColumn: 0,
                },
                style: null,
            }],
        }, undefined);

        testBed.univer.dispose();
    });
});
