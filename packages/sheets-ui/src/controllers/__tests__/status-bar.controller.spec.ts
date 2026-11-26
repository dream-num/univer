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

import type { Injector, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    CellValueType,
    ICommandService,
    ILogService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    RANGE_TYPE,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FormulaDataModel, FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL, LexerTreeBuilder } from '@univerjs/engine-formula';
import { CanvasColorService, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    INumfmtService,
    NumfmtService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { IStatusBarService, StatusBarService } from '../../services/status-bar.service';
import { StatusBarController } from '../status-bar.controller';

const unitId = 'test';
const sheetId = 'sheet1';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: unitId,
    sheetOrder: [sheetId],
    name: '',
    appVersion: '0.15.4',
    locale: LocaleType.EN_US,
    styles: { number: { n: { pattern: '0.00' } } },
    sheets: {
        [sheetId]: {
            id: sheetId,
            name: 'Sheet1',
            rowCount: 10,
            columnCount: 10,
            cellData: {
                0: {
                    0: { t: CellValueType.NUMBER, v: 1, s: 'number' },
                },
                1: {
                    0: { t: CellValueType.NUMBER, v: 2 },
                },
            },
        },
    },
};

function createTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    injector.add([SheetsSelectionsService]);
    injector.add([IStatusBarService, { useClass: StatusBarService }]);
    injector.add([INumfmtService, { useClass: NumfmtService }]);
    injector.add([FormulaDataModel]);
    injector.add([LexerTreeBuilder]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([SheetSkeletonService]);
    injector.add([StatusBarController]);

    get(SheetSkeletonService);
    get(SheetsSelectionsService);
    get(IRenderManagerService).registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, Tools.deepClone(TEST_WORKBOOK_DATA));

    // Trigger SheetsSelectionsService's current workbook stream.
    get(IUniverInstanceService).focusUnit(unitId);

    get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = get(ICommandService);
    commandService.registerCommand(SetSelectionsOperation);
    commandService.registerCommand(SetRangeValuesMutation);

    return {
        univer,
        get,
        commandService,
    };
}

describe('StatusBarController', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        vi.useFakeTimers();
        const testBed = createTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = testBed.commandService;
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('updates status bar values on selection changes and cell updates within selection', () => {
        get(StatusBarController);
        const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;

        const statusBarService = get(IStatusBarService);

        const selection: ISelectionWithStyle = {
            range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
            primary: {
                startRow: 0,
                endRow: 2,
                startColumn: 0,
                endColumn: 1,
                actualRow: 0,
                actualColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        };

        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            selections: [selection],
        })).toBeTruthy();

        vi.advanceTimersByTime(150);
        vi.runOnlyPendingTimers();

        const state1 = statusBarService.getState();
        expect(state1?.pattern).toBe('0.00');
        expect(state1?.values.find((v) => v.func === FUNCTION_NAMES_MATH.SUM)?.value).toBe(3);
        expect(state1?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.MAX)?.value).toBe(2);
        expect(state1?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.MIN)?.value).toBe(1);
        expect(state1?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.COUNT)?.value).toBe(2);
        expect(state1?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value).toBe(2);
        expect(state1?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.AVERAGE)?.value).toBe(1.5);

        // Update a cell inside the current selection; controller should recalc via commandExecuted hook.
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            cellValue: {
                0: {
                    0: { t: CellValueType.NUMBER, v: 10 },
                },
            },
        })).toBeTruthy();

        vi.advanceTimersByTime(150);
        vi.runOnlyPendingTimers();

        const state2 = statusBarService.getState();
        expect(state2?.values.find((v) => v.func === FUNCTION_NAMES_MATH.SUM)?.value).toBe(12);
        expect(state2?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.MAX)?.value).toBe(10);
        expect(state2?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.MIN)?.value).toBe(2);
        expect(state2?.values.find((v) => v.func === FUNCTION_NAMES_STATISTICAL.AVERAGE)?.value).toBe(6);

        // Business sanity: workbook data actually updated.
        expect(workbook.getActiveSheet()!.getCellRaw(0, 0)?.v).toBe(10);
    });

    it('recalculates the existing selection from visible rows and projected formula values', () => {
        get(StatusBarController);
        // Happy DOM does not implement a canvas backend.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        const renders = get(IRenderManagerService);
        const render = renders.createRender(unitId);
        const skeletons = render.with(SheetSkeletonManagerService);
        get(FormulaDataModel).setArrayFormulaCellData({
            [unitId]: {
                [sheetId]: {
                    2: { 0: { v: 80, t: CellValueType.NUMBER } },
                    4: { 0: { v: 9, t: CellValueType.NUMBER } },
                },
            },
        });
        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: sheetId,
            selections: [{ range: { startRow: 0, endRow: 4, startColumn: 0, endColumn: 0 }, primary: null, style: null }],
        })).toBe(true);
        const status = get(IStatusBarService);
        const getSum = () => status.getState()?.values.find(({ func }) => func === FUNCTION_NAMES_MATH.SUM)?.value;
        vi.advanceTimersByTime(150);
        expect(getSum()).toBe(92);

        skeletons.setProjection(sheetId, {
            isRowFiltered: (row) => row === 1,
            getCell: (row, column) => {
                if (column !== 0) {
                    return undefined;
                }
                if (row === 2) {
                    return null;
                }
                if (row === 0 || row === 3) {
                    return { v: row === 0 ? 10 : 5, t: CellValueType.NUMBER };
                }
            },
        });
        vi.advanceTimersByTime(150);
        expect(getSum()).toBe(24);
        expect(status.getState()?.values.find(({ func }) => func === FUNCTION_NAMES_STATISTICAL.COUNTA)?.value).toBe(3);

        skeletons.setProjection(sheetId, undefined);
        vi.advanceTimersByTime(150);
        expect(getSum()).toBe(92);

        const companionId = 'companion';
        const companion = renders.createRender(unitId, undefined, companionId);
        companion.with(SheetSkeletonManagerService).setProjection(sheetId, {
            isRowFiltered: (row) => row === 1,
            getCell: (row, column) => row === 0 && column === 0 ? { v: 100, t: CellValueType.NUMBER } : undefined,
        });
        vi.advanceTimersByTime(150);
        expect(getSum()).toBe(92);

        renders.focusRender?.(companionId);
        vi.advanceTimersByTime(150);
        expect(getSum()).toBe(189);

        renders.focusRender?.(unitId);
        vi.advanceTimersByTime(150);
        expect(getSum()).toBe(92);
    });
});
