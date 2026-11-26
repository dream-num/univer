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

import type {
    Dependency,
    ICommand,
    IDisposable,
    IRange,
    IWorkbookData,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IInsertColMutationParams } from '../../../basics';
import type { IMoveRangeCommandParams } from '../../../commands/commands/move-range.command';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../__tests__/util';
import { MoveRangeCommand } from '../../../commands/commands/move-range.command';
import { InsertColMutation } from '../../../commands/mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../../commands/mutations/move-range.mutation';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { SheetsSelectionsService } from '../../selections/selection.service';
import { SheetInterceptorService } from '../../sheet-interceptor/sheet-interceptor.service';
import { RefRangeService } from '../ref-range.service';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'A2',
                    },
                },
            },
            rowCount: 10,
            columnCount: 10,
        },
        sheet2: {
            id: 'sheet2',
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export function createRefRangeTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }
    }

    ([
        [RefRangeService],
        [SheetsSelectionsService],
        [SheetInterceptorService],
    ] as Dependency[]).forEach((d) => injector.add(d));

    const commandService = get(ICommandService);

    ([
        InsertColMutation,
    ] as ICommand[]).forEach((command) => commandService.registerCommand(command));

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, TEST_WORKBOOK_DATA);

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}

describe('test "RefRangeService"', () => {
    let univer: Univer;
    let refRangeService: RefRangeService;
    let commandService: ICommandService;

    describe('test "watchRange"', () => {
        beforeEach(() => {
            const bed = createRefRangeTestBed();

            univer = bed.univer;
            refRangeService = bed.get(RefRangeService);
            commandService = bed.get(ICommandService);
        });

        afterEach(() => {
            univer.dispose();
        });

        it('should emit updated range when a mutation happens', () => {
            let beforeRange: Nullable<IRange> = null;
            let afterRange: Nullable<IRange> = null;

            const watchedRange: IRange = { startRow: 0, startColumn: 1, endColumn: 3, endRow: 0 };
            refRangeService.watchRange('test', 'sheet1', watchedRange, (before, after) => {
                beforeRange = before;
                afterRange = after;
            });

            expect(commandService.syncExecuteCommand(InsertColMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            } as IInsertColMutationParams)).toBeTruthy();
            expect(beforeRange).toEqual(watchedRange);
            expect(afterRange).toEqual({ startRow: 0, startColumn: 1, endColumn: 4, endRow: 0 });
        });

        it('should not emit when mutation not related to the watched range', () => {
            let beforeRange: Nullable<IRange> = null;
            let afterRange: Nullable<IRange> = null;

            const watchedRange: IRange = { startRow: 0, startColumn: 1, endColumn: 3, endRow: 0 };
            refRangeService.watchRange('test', 'sheet1', watchedRange, (before, after) => {
                beforeRange = before;
                afterRange = after;
            });

            // On another sheet.
            expect(commandService.syncExecuteCommand(InsertColMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet2',
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            } as IInsertColMutationParams)).toBeTruthy();
            expect(beforeRange).toBeNull();
            expect(afterRange).toBeNull();

            // On a not relevant range.
            expect(commandService.syncExecuteCommand(InsertColMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 9, startColumn: 5, endColumn: 5 },
            } as IInsertColMutationParams)).toBeTruthy();
            expect(beforeRange).toBeNull();
            expect(afterRange).toBeNull();
        });

        it('should keep one command listener after watchers are disposed out of registration order', () => {
            const watchedRange: IRange = { startRow: 0, startColumn: 1, endColumn: 3, endRow: 0 };

            for (let i = 0; i < 3; i++) {
                const first = refRangeService.watchRange('test', 'sheet1', watchedRange, () => {});
                const second = refRangeService.watchRange('test', 'sheet1', watchedRange, () => {});
                first.dispose();
                second.dispose();
            }

            const callback = vi.fn();
            refRangeService.watchRange('test', 'sheet1', watchedRange, callback);

            expect(commandService.syncExecuteCommand(InsertColMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            })).toBeTruthy();
            expect(callback).toHaveBeenCalledOnce();
            expect(callback).toHaveBeenCalledWith(watchedRange, {
                startRow: 0,
                startColumn: 1,
                endColumn: 4,
                endRow: 0,
            });
        });

        it('should not notify a replacement watcher for the mutation that registered it', () => {
            const watchedRange: IRange = { startRow: 0, startColumn: 1, endColumn: 3, endRow: 0 };
            const replacementCallback = vi.fn();
            let primaryDisposable: IDisposable;
            let replacementDisposable: IDisposable | undefined;
            const primaryCallback = vi.fn((_before: IRange, after: Nullable<IRange>) => {
                if (!after) {
                    throw new Error('Expected the watched range to survive column insertion');
                }
                replacementDisposable = refRangeService.watchRange('test', 'sheet1', after, replacementCallback);
                primaryDisposable.dispose();
            });
            primaryDisposable = refRangeService.watchRange('test', 'sheet1', watchedRange, primaryCallback);
            const insertParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            };

            expect(commandService.syncExecuteCommand(InsertColMutation.id, insertParams)).toBeTruthy();
            expect(primaryCallback).toHaveBeenCalledOnce();
            expect(replacementCallback).not.toHaveBeenCalled();

            expect(commandService.syncExecuteCommand(InsertColMutation.id, insertParams)).toBeTruthy();
            expect(primaryCallback).toHaveBeenCalledOnce();
            expect(replacementCallback).toHaveBeenCalledOnce();
            replacementDisposable?.dispose();
        });

        it('should not notify a pending watcher after another callback disposes it', () => {
            const watchedRange: IRange = { startRow: 0, startColumn: 1, endColumn: 3, endRow: 0 };
            let pendingDisposable: IDisposable;
            const firstCallback = vi.fn(() => pendingDisposable.dispose());
            const pendingCallback = vi.fn();
            refRangeService.watchRange('test', 'sheet1', watchedRange, firstCallback);
            pendingDisposable = refRangeService.watchRange('test', 'sheet1', watchedRange, pendingCallback);

            expect(commandService.syncExecuteCommand(InsertColMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            })).toBeTruthy();
            expect(firstCallback).toHaveBeenCalledOnce();
            expect(pendingCallback).not.toHaveBeenCalled();
        });

        it('should keep chart-like rebinders and stable float watchers bounded during structural churn', () => {
            const rebindWatcherCount = 64;
            const stableWatcherCount = 64;
            const mutationCount = 200;
            const watchedRange: IRange = { startRow: 0, startColumn: 1, endColumn: 3, endRow: 0 };
            const activeRebinders: IDisposable[] = [];
            const stableWatchers: IDisposable[] = [];
            let rebindCallbackCount = 0;
            let rebindCallbacksInCurrentMutation = 0;
            let stableCallbackCount = 0;

            const bindRebindingWatcher = (index: number, range: IRange): IDisposable => {
                const currentDisposable = refRangeService.watchRange('test', 'sheet1', range, (_before, after) => {
                    if (!after) {
                        throw new Error('Expected the watched range to survive column insertion');
                    }
                    rebindCallbackCount++;
                    rebindCallbacksInCurrentMutation++;
                    if (rebindCallbacksInCurrentMutation > rebindWatcherCount) {
                        throw new Error('A structural mutation notified replacement watchers registered during the same mutation');
                    }
                    const replacement = bindRebindingWatcher(index, after);
                    currentDisposable.dispose();
                    activeRebinders[index] = replacement;
                });
                return currentDisposable;
            };

            for (let i = 0; i < rebindWatcherCount; i++) {
                activeRebinders.push(bindRebindingWatcher(i, watchedRange));
            }
            for (let i = 0; i < stableWatcherCount; i++) {
                stableWatchers.push(refRangeService.watchRange('test', 'sheet1', watchedRange, () => {
                    stableCallbackCount++;
                }));
            }

            const insertParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            };
            for (let i = 0; i < mutationCount; i++) {
                rebindCallbacksInCurrentMutation = 0;
                expect(commandService.syncExecuteCommand(InsertColMutation.id, insertParams)).toBeTruthy();
            }

            expect(rebindCallbackCount).toBe(rebindWatcherCount * mutationCount);
            expect(stableCallbackCount).toBe(stableWatcherCount * mutationCount);

            activeRebinders.forEach((disposable) => disposable.dispose());
            stableWatchers.forEach((disposable) => disposable.dispose());
            expect(commandService.syncExecuteCommand(InsertColMutation.id, insertParams)).toBeTruthy();
            expect(rebindCallbackCount).toBe(rebindWatcherCount * mutationCount);
            expect(stableCallbackCount).toBe(stableWatcherCount * mutationCount);
        });
    });
});

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
        workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
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
        await commandService.executeCommand(MoveRangeCommand.id, params);
        const resultWithoutInterceptor = sheetInterceptorService.onCommandExecute({ id: MoveRangeCommand.id, params });
        expect((resultWithoutInterceptor as any).redos.length).toBe(3);
        expect((resultWithoutInterceptor as any).redos[0].params.values.length).toBe(3);
    });
});
