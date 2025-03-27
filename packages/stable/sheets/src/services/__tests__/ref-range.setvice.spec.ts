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

import type { Injector, IRange, Univer, Workbook, Worksheet } from '@univerjs/core';
import type { IMoveRangeCommandParams } from '../../commands/commands/move-range.command';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveRangeCommand } from '../../commands/commands/move-range.command';
import { MoveRangeMutation } from '../../commands/mutations/move-range.mutation';
import { SetSelectionsOperation } from '../../commands/operations/selection.operation';
import { RefRangeService } from '../ref-range/ref-range.service';
import { SheetsSelectionsService } from '../selections/selection.service';
import { SheetInterceptorService } from '../sheet-interceptor/sheet-interceptor.service';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from './util';

const originRange: IRange = {
    startRow: 2,
    endRow: 2,
    startColumn: 2,
    endColumn: 2,
};
const getRangeByCell = (row: number, col: number): IRange => ({
    startRow: row,
    endRow: row,
    startColumn: col,
    endColumn: col,
});
describe('Test ref-range.service', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let get: Injector['get'];
    let sheetInterceptorService: SheetInterceptorService;
    let refRangeService: RefRangeService;
    let workbook: Workbook;
    let worksheet: Worksheet;

    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [SheetsSelectionsService],
            [RefRangeService],
            [SheetInterceptorService],
        ]);
        get = testBed.get;
        univer = testBed.univer;
        sheetInterceptorService = get(SheetInterceptorService);
        refRangeService = get(RefRangeService);
        commandService = testBed.get(ICommandService);
        [MoveRangeCommand, MoveRangeMutation, SetSelectionsOperation].forEach((item) =>
            commandService.registerCommand(item)
        );

        const univerInstanceService = get(IUniverInstanceService);
        workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        worksheet = workbook.getActiveSheet()!;
    });
    afterEach(() => {
        univer.dispose();
    });

    it('test registerRefRange', async () => {
        const mockFn = vi.fn(() => ({ redos: [], undos: [] }));
        refRangeService.registerRefRange(originRange, mockFn);
        const params: IMoveRangeCommandParams = {
            fromRange: { ...originRange },
            toRange: { startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 },
        };
        await commandService.executeCommand(MoveRangeCommand.id, params);
        expect(mockFn.mock.calls.length).toBe(1);
        const callParams = (mockFn.mock.calls as any)[0][0];
        expect(callParams?.id).toBe('sheet.command.move-range');
    });

    it('test registerRefRange 3', async () => {
        const redoMutationId = 'test-redo-mutation';
        const undoMutationId = 'test-undo-mutation';

        const mockFn1 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params: {} }],
            undos: [{ id: undoMutationId, params: {} }],
        }));
        const mockFn2 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params }],
            undos: [{ id: undoMutationId, params: {} }],
        }));
        const mockFn3 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params }],
            undos: [{ id: undoMutationId, params: {} }],
        }));
        const mockFn4 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params }],
            undos: [{ id: undoMutationId, params: {} }],
        }));

        refRangeService.registerRefRange(getRangeByCell(2, 2), mockFn1);
        refRangeService.registerRefRange(getRangeByCell(3, 2), mockFn2);
        refRangeService.registerRefRange(getRangeByCell(4, 2), mockFn3);
        refRangeService.registerRefRange(getRangeByCell(1, 1), mockFn4);

        const params: IMoveRangeCommandParams = {
            fromRange: { startRow: 2, endRow: 4, startColumn: 2, endColumn: 2 },
            toRange: { startRow: 3, endRow: 5, startColumn: 2, endColumn: 2 },
        };
        await commandService.executeCommand(MoveRangeCommand.id, params);

        expect(mockFn1.mock.calls.length).toBe(1);
        expect(mockFn2.mock.calls.length).toBe(1);
        expect(mockFn3.mock.calls.length).toBe(1);
        expect(mockFn4.mock.calls.length).toBe(0);
        const result = sheetInterceptorService.onCommandExecute({ id: MoveRangeCommand.id, params });
        expect(result.redos.length).toBe(3);
    });

    it('test merge mutation', async () => {
        const redoMutationId = 'test-redo-mutation';
        const undoMutationId = 'test-undo-mutation';

        const mockFn1 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params: { values: [1, 2, 3] } }],
            undos: [{ id: undoMutationId, params: {} }],
        }));
        const mockFn2 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params: { values: [1, 2, 3] } }],
            undos: [{ id: undoMutationId, params: {} }],
        }));
        const mockFn3 = vi.fn(() => ({
            redos: [{ id: redoMutationId, params: { values: [1, 2, 3] } }],
            undos: [{ id: undoMutationId, params: {} }],
        }));

        refRangeService.registerRefRange(getRangeByCell(2, 2), mockFn1);
        refRangeService.registerRefRange(getRangeByCell(3, 2), mockFn2);
        refRangeService.registerRefRange(getRangeByCell(4, 2), mockFn3);
        // will squash mutations to one.
        // [1,2,3],[1,2,3],[1,2,3]
        // after squash to be
        // [1,2,3,1,2,3,1,2,3]
        const disposeIntercept = refRangeService.interceptor.intercept(
            refRangeService.interceptor.getInterceptPoints().MERGE_REDO,
            {
                handler: (list, _c, next) => {
                    const redo = list?.filter((item) => item.id === redoMutationId) || [];
                    const result = list?.filter((item) => item.id !== redoMutationId) || [];
                    if (redo.length) {
                        result.push(
                            redo.reduce(
                                (_result, current) => {
                                    const params = current.params as any;
                                    _result.params.values.push(...params.values);
                                    return _result;
                                },
                                {
                                    id: redoMutationId,
                                    params: { values: [] },
                                } as { id: string; params: { values: any[] } }
                            )
                        );
                    }
                    return next(result);
                },
            }
        );

        const params: IMoveRangeCommandParams = {
            fromRange: { startRow: 2, endRow: 4, startColumn: 2, endColumn: 2 },
            toRange: { startRow: 3, endRow: 5, startColumn: 2, endColumn: 2 },
        };
        await commandService.executeCommand(MoveRangeCommand.id, params);
        const result = sheetInterceptorService.onCommandExecute({ id: MoveRangeCommand.id, params });
        expect((result as any).redos.length).toBe(1);
        expect((result as any).redos[0].params.values.length).toBe(9);

        // if dispose, the mutations will not be squash.
        disposeIntercept();
        commandService.executeCommand(MoveRangeCommand.id, params);
        const resultWithoutInterceptor = sheetInterceptorService.onCommandExecute({ id: MoveRangeCommand.id, params });
        expect((resultWithoutInterceptor as any).redos.length).toBe(3);
        expect((resultWithoutInterceptor as any).redos[0].params.values.length).toBe(3);
    });
});
