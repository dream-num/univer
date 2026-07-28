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

import type { ICommandInfo, Workbook } from '@univerjs/core';
import type { Engine, IRenderContext, Scene } from '@univerjs/engine-render';
import { ICommandService, Injector, UniverInstanceType } from '@univerjs/core';
import {
    CancelMarkDirtyRowAutoHeightOperation,
    MarkDirtyRowAutoHeightOperation,
    SetWorksheetRowAutoHeightMutation,
} from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AutoHeightService, taskRowsFromRanges } from '../auto-height.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

interface IIdleGlobals {
    requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
}

function createRenderContext(unitId: string): IRenderContext<Workbook> {
    const activated$ = new BehaviorSubject(true);
    const unit = {
        getUnitId: () => unitId,
        type: UniverInstanceType.UNIVER_SHEET,
    } as unknown as Workbook;

    return {
        unit,
        unitId,
        type: UniverInstanceType.UNIVER_SHEET,
        engine: {} as unknown as Engine,
        scene: {} as unknown as Scene,
        mainComponent: null,
        components: new Map(),
        isMainScene: true,
        activated$,
        activate: () => activated$.next(true),
        deactivate: () => activated$.next(false),
    };
}

class TestSheetSkeletonManagerService {
    static skeleton: unknown = null;

    getSkeleton() {
        return TestSheetSkeletonManagerService.skeleton;
    }
}

class TestCommandService {
    static executed: Array<{ id: string; params?: unknown }> = [];
    static listeners: Array<(info: ICommandInfo) => void> = [];

    syncExecuteCommand(id: string, params?: unknown) {
        TestCommandService.executed.push({ id, params });
    }

    onCommandExecuted(cb: (info: ICommandInfo) => void) {
        TestCommandService.listeners.push(cb);
        return {
            dispose: () => {
                TestCommandService.listeners = TestCommandService.listeners.filter((listener) => listener !== cb);
            },
        };
    }
}

function createAutoHeightService(skeleton: unknown, unitId = 'u-1') {
    TestSheetSkeletonManagerService.skeleton = skeleton;
    TestCommandService.executed = [];
    TestCommandService.listeners = [];

    const injector = new Injector();
    injector.add([SheetSkeletonManagerService, { useClass: TestSheetSkeletonManagerService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([AutoHeightService, { useFactory: () => injector.createInstance(AutoHeightService, createRenderContext(unitId)) }]);
    return injector.get(AutoHeightService);
}

describe('taskRowsFromRanges', () => {
    it('splits ranges by max rows and keeps remains', () => {
        const { result, lasts } = taskRowsFromRanges(
            [{ startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 }],
            3
        );

        expect(result).toEqual([{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 }]);
        expect(lasts).toEqual([{ startRow: 3, endRow: 9, startColumn: 0, endColumn: 0 }]);
    });

    it('returns all ranges when max rows is enough', () => {
        const { result, lasts } = taskRowsFromRanges(
            [
                { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
                { startRow: 5, endRow: 5, startColumn: 0, endColumn: 0 },
            ],
            10
        );

        expect(result).toHaveLength(2);
        expect(lasts).toEqual([]);
    });
});

describe('AutoHeightService', () => {
    it('starts auto height task and executes row-height mutation with calculated values', () => {
        const calculateAutoHeightInRange = vi.fn(() => [
            { row: 0, autoHeight: 30 },
            { row: 1, autoHeight: 0 },
            { row: 2, autoHeight: 20 },
        ]);
        const getRowHeight = vi.fn((row: number) => (row === 2 ? 20 : 10));
        const skeleton = {
            calculateAutoHeightInRange,
            getRowHeight,
        } as unknown;

        // Make requestIdleCallback run "once" synchronously.
        // `AutoHeightService` schedules another idle callback after processing; if we
        // call callbacks immediately every time, it becomes infinite recursion.
        let ran = false;
        const idleGlobals = globalThis as unknown as IIdleGlobals;
        const requestIdleCallbackSpy = vi
            .spyOn(idleGlobals, 'requestIdleCallback')
            .mockImplementation((cb) => {
                if (!ran) {
                    ran = true;
                    cb({ timeRemaining: () => 100, didTimeout: false } as IdleDeadline);
                }
                return 1;
            });

        const service = createAutoHeightService(skeleton);

        service.startAutoHeightTask({
            id: 't-1',
            sheetId: 's-1',
            ranges: [{ startRow: 0, endRow: 2, startColumn: 5, endColumn: 8 }],
        });

        // Only rows with changed autoHeight should be synced.
        expect(TestCommandService.executed).toEqual([{
            id: SetWorksheetRowAutoHeightMutation.id,
            params: {
                unitId: 'u-1',
                subUnitId: 's-1',
                rowsAutoHeightInfo: [{ row: 0, autoHeight: 30 }],
            },
        }]);

        // Ensures it "normalizes" ranges to column 0 in the task.
        expect(calculateAutoHeightInRange).toHaveBeenCalledWith([
            { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
        ]);

        service.dispose();
        requestIdleCallbackSpy.mockRestore();
    });

    it('wires command executed listener for mark-dirty mutation', () => {
        let ran = false;
        const idleGlobals = globalThis as unknown as IIdleGlobals;
        const requestIdleCallbackSpy = vi
            .spyOn(idleGlobals, 'requestIdleCallback')
            .mockImplementation((cb) => {
                if (!ran) {
                    ran = true;
                    cb({ timeRemaining: () => 0, didTimeout: false } as IdleDeadline);
                }
                return 1;
            });

        const service = createAutoHeightService({
            calculateAutoHeightInRange: () => [],
            getRowHeight: () => 10,
        });

        expect(TestCommandService.listeners).toHaveLength(1);
        TestCommandService.listeners[0]({
            id: MarkDirtyRowAutoHeightOperation.id,
            params: {
                unitId: 'u-1',
                subUnitId: 's-1',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }],
                id: 'task',
            },
        });

        // It should not throw, and should eventually schedule a loop.
        expect(requestIdleCallbackSpy).toHaveBeenCalled();

        service.dispose();
        requestIdleCallbackSpy.mockRestore();
    });

    it('cancels queued dirty-row work through the command listener', () => {
        const skeleton = {
            calculateAutoHeightInRange: () => [{ row: 1, autoHeight: 24 }],
            getRowHeight: () => 12,
        };

        const idleGlobals = globalThis as unknown as IIdleGlobals;
        const requestIdleCallbackSpy = vi
            .spyOn(idleGlobals, 'requestIdleCallback')
            .mockImplementation(() => 1);
        const service = createAutoHeightService(skeleton);

        TestCommandService.listeners[0]({
            id: MarkDirtyRowAutoHeightOperation.id,
            params: {
                unitId: 'u-1',
                subUnitId: 's-1',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 5, endColumn: 8 }],
                id: 'task-to-cancel',
            },
        });
        TestCommandService.listeners[0]({
            id: CancelMarkDirtyRowAutoHeightOperation.id,
            params: {
                unitId: 'u-1',
                id: 'task-to-cancel',
            },
        });

        (service as unknown as { _calculateLoop: (deadline: IdleDeadline) => void })._calculateLoop({
            timeRemaining: () => 100,
            didTimeout: false,
        } as IdleDeadline);

        expect(TestCommandService.executed).toEqual([]);

        service.dispose();
        requestIdleCallbackSpy.mockRestore();
    });

    it('keeps large auto-height work in batches and skips already queued ranges', () => {
        const calculatedRanges: unknown[] = [];
        const skeleton = {
            calculateAutoHeightInRange: (ranges: unknown[]) => {
                calculatedRanges.push(ranges);
                return [{ row: 0, autoHeight: 24 }];
            },
            getRowHeight: () => 12,
        };

        let callbacks = 0;
        let timeRemainingCalls = 0;
        const idleGlobals = globalThis as unknown as IIdleGlobals;
        const requestIdleCallbackSpy = vi
            .spyOn(idleGlobals, 'requestIdleCallback')
            .mockImplementation((cb) => {
                callbacks++;
                if (callbacks === 1) {
                    cb({
                        timeRemaining: () => {
                            timeRemainingCalls++;
                            return timeRemainingCalls === 1 ? 100 : 0;
                        },
                        didTimeout: false,
                    } as IdleDeadline);
                }
                return callbacks;
            });
        const service = createAutoHeightService(skeleton);

        service.startAutoHeightTask({
            id: 'large',
            sheetId: 's-1',
            ranges: [{ startRow: 0, endRow: 600, startColumn: 2, endColumn: 4 }],
        });
        service.startAutoHeightTask({
            id: 'already-queued',
            sheetId: 's-1',
            ranges: [{ startRow: 500, endRow: 600, startColumn: 9, endColumn: 9 }],
        });

        expect(calculatedRanges[0]).toEqual([{ startRow: 0, endRow: 499, startColumn: 0, endColumn: 0 }]);
        expect(TestCommandService.executed).toEqual([{
            id: SetWorksheetRowAutoHeightMutation.id,
            params: {
                unitId: 'u-1',
                subUnitId: 's-1',
                rowsAutoHeightInfo: [{ row: 0, autoHeight: 24 }],
            },
        }]);

        service.dispose();
        requestIdleCallbackSpy.mockRestore();
    });

    it('calculates the full remaining range after task timeout', () => {
        const calculatedRanges: unknown[] = [];
        const skeleton = {
            calculateAutoHeightInRange: (ranges: unknown[]) => {
                calculatedRanges.push(ranges);
                return [];
            },
            getRowHeight: () => 12,
        };

        const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValue(20_000);
        let ran = false;
        const idleGlobals = globalThis as unknown as IIdleGlobals;
        const requestIdleCallbackSpy = vi
            .spyOn(idleGlobals, 'requestIdleCallback')
            .mockImplementation((cb) => {
                if (!ran) {
                    ran = true;
                    cb({ timeRemaining: () => 100, didTimeout: false } as IdleDeadline);
                }
                return 1;
            });
        const service = createAutoHeightService(skeleton);

        service.startAutoHeightTask({
            id: 'expired',
            sheetId: 's-1',
            maxTime: 1,
            ranges: [{ startRow: 0, endRow: 600, startColumn: 1, endColumn: 1 }],
        });

        expect(calculatedRanges[0]).toEqual([{ startRow: 0, endRow: 600, startColumn: 0, endColumn: 0 }]);

        service.dispose();
        requestIdleCallbackSpy.mockRestore();
        dateNowSpy.mockRestore();
    });
});
