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

import type { ICommandInfo, ICommandService as ICommandServiceType, Workbook } from '@univerjs/core';
import type { Engine, IRenderContext, Scene } from '@univerjs/engine-render';
import { ICommandService, Injector, UniverInstanceType } from '@univerjs/core';
import { MarkDirtyRowAutoHeightMutation, SetWorksheetRowAutoHeightMutation } from '@univerjs/sheets';
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

        const sheetSkeletonManagerService = {
            getSkeleton: () => skeleton,
        } as unknown;

        const syncExecuteCommand = vi.fn();
        const onCommandExecuted = vi.fn(() => ({ dispose: () => { } }));
        const commandService = {
            syncExecuteCommand,
            onCommandExecuted,
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

        const context = createRenderContext('u-1');
        const injector = new Injector();
        injector.add([SheetSkeletonManagerService, { useValue: sheetSkeletonManagerService as unknown as SheetSkeletonManagerService }]);
        injector.add([ICommandService, { useValue: commandService as unknown as ICommandServiceType }]);
        const service = injector.createInstance(AutoHeightService, context);

        service.startAutoHeightTask({
            id: 't-1',
            sheetId: 's-1',
            ranges: [{ startRow: 0, endRow: 2, startColumn: 5, endColumn: 8 }],
        });

        // Only rows with changed autoHeight should be synced.
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'u-1',
            subUnitId: 's-1',
            rowsAutoHeightInfo: [{ row: 0, autoHeight: 30 }],
        });

        // Ensures it "normalizes" ranges to column 0 in the task.
        expect(calculateAutoHeightInRange).toHaveBeenCalledWith([
            { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
        ]);

        service.dispose();
        requestIdleCallbackSpy.mockRestore();
    });

    it('wires command executed listener for mark-dirty mutation', () => {
        const sheetSkeletonManagerService = {
            getSkeleton: () => ({
                calculateAutoHeightInRange: () => [],
                getRowHeight: () => 10,
            }),
        } as unknown;

        const commandHandlers: Array<(info: ICommandInfo) => void> = [];
        const commandService = {
            syncExecuteCommand: vi.fn(),
            onCommandExecuted: (cb: (info: ICommandInfo) => void) => {
                commandHandlers.push(cb);
                return { dispose: () => { } };
            },
        } as unknown;

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

        const context = createRenderContext('u-1');
        const injector = new Injector();
        injector.add([SheetSkeletonManagerService, { useValue: sheetSkeletonManagerService as unknown as SheetSkeletonManagerService }]);
        injector.add([ICommandService, { useValue: commandService as unknown as ICommandServiceType }]);
        const service = injector.createInstance(AutoHeightService, context);

        expect(commandHandlers).toHaveLength(1);
        commandHandlers[0]({
            id: MarkDirtyRowAutoHeightMutation.id,
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
});
