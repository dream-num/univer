/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetSelectionsOperation } from '@univerjs/sheets';
import type { IReorderRangeCommandParams } from '../sheets-reorder.command';
import { ReorderRangeCommand } from '../sheets-reorder.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test "Reorder Range Commands"', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getData: (row: number, col: number) => any;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(SetSelectionsOperation);
        const univerInstanceService = get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance('test');
        const worksheet = workbook?.getSheetBySheetId('sheet1')!;
        getData = (row: number, col: number) => {
            const data = worksheet.getCellMatrix().getValue(row, col);
            if (data) {
                return data;
            }
            return undefined;
        };
    });

    afterEach(() => univer.dispose());

    describe('reorder with single col', () => {
        it('asc case: ', async () => {
            const params = {
                unitId: 'test',
                subUnitId: 'sheet1',
                hasTitle: false,
                orderRules: [{ colIndex: 1, type: 'asc' }],
                range: {
                    startRow: 0,
                    endRow: 5,
                    startColumn: 0,
                    endColumn: 2,
                },
            } as IReorderRangeCommandParams;
            const result = await commandService.executeCommand(ReorderRangeCommand.id, params);
            expect(result).toBeTruthy();
            expect(getData(0, 0).v).toBe(6);
            expect(getData(0, 1).v).toBe(15);
            expect(getData(0, 2).v).toBe(200);
            expect(getData(5, 0).v).toBe(1);
            expect(getData(5, 1).v).toBe(20);
            expect(getData(5, 2).v).toBe(100);
        });

        it('desc case: ', async () => {
            const params = {
                unitId: 'test',
                subUnitId: 'sheet1',
                hasTitle: false,
                orderRules: [{ colIndex: 0, type: 'desc' }],
                range: {
                    startRow: 0,
                    endRow: 5,
                    startColumn: 0,
                    endColumn: 2,
                },
            } as IReorderRangeCommandParams;
            const result = await commandService.executeCommand(ReorderRangeCommand.id, params);
            expect(result).toBeTruthy();
            expect(getData(0, 0).v).toBe(6);
            expect(getData(0, 1).v).toBe(15);
            expect(getData(0, 2).v).toBe(200);
            expect(getData(5, 0).v).toBe(1);
            expect(getData(5, 1).v).toBe(20);
            expect(getData(5, 2).v).toBe(100);
        });
    });

    describe('reorder with multiple cols', () => {
        it('asc + desc combine case', async () => {
            const params = {
                unitId: 'test',
                subUnitId: 'sheet1',
                hasTitle: false,
                orderRules: [{ colIndex: 2, type: 'desc' }, { colIndex: 1, type: 'asc' }],
                range: {
                    startRow: 0,
                    endRow: 5,
                    startColumn: 0,
                    endColumn: 2,
                },
            } as IReorderRangeCommandParams;
            const result = await commandService.executeCommand(ReorderRangeCommand.id, params);
            expect(result).toBeTruthy();
            expect(getData(0, 0).v).toBe(6);
            expect(getData(0, 1).v).toBe(15);
            expect(getData(0, 2).v).toBe(200);
            expect(getData(5, 0).v).toBe(1);
            expect(getData(5, 1).v).toBe(20);
            expect(getData(5, 2).v).toBe(100);
        });
    });
});

