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

import type { Dependency, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { CellValueType, ICommandService, ILogService, Inject, IUniverInstanceService, LocaleType, LogLevel, Plugin, RANGE_TYPE, touchDependencies, Univer, Injector as UniverInjector, UniverInstanceType } from '@univerjs/core';
import { FormulaDataModel, FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL } from '@univerjs/engine-formula';
import { INumfmtService, SetRangeValuesMutation, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    styles: {},
    sheets: {
        [sheetId]: {
            id: sheetId,
            name: 'Sheet1',
            rowCount: 10,
            columnCount: 10,
            cellData: {
                0: {
                    0: { t: CellValueType.NUMBER, v: 1 },
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

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(UniverInjector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetsSelectionsService],
                [IStatusBarService, { useClass: StatusBarService }],
                [INumfmtService, { useValue: { getValue: () => ({ pattern: '0.00' }) } }],
                [FormulaDataModel, { useValue: { getArrayFormulaCellData: () => undefined } }],
                [StatusBarController],
            ] as Dependency[]).forEach((d) => this._injector.add(d));

            touchDependencies(this._injector, [
                [StatusBarController],
            ]);
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, TEST_WORKBOOK_DATA);
    get(SheetsSelectionsService);
    get(StatusBarController);

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
        vi.useRealTimers();
        univer.dispose();
    });

    it('updates status bar values on selection changes and cell updates within selection', () => {
        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
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
});
