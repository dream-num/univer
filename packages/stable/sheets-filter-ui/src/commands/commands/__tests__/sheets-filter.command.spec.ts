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

import type { Dependency, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import type { FilterModel, ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter/commands/commands/sheets-filter.command.js';
import { AuthzIoLocalService, IAuthzIoService, ICommandService, Inject, Injector, IUniverInstanceService, LocaleType, Plugin, RANGE_TYPE, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { ActiveDirtyManagerService, IActiveDirtyManagerService, ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import { RangeProtectionRuleModel, RefRangeService, SetRangeValuesCommand, SetRangeValuesMutation, SheetInterceptorService, SheetsSelectionsService, WorkbookPermissionService, WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { SetSheetsFilterRangeMutation, SheetsFilterService, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, RemoveSheetFilterCommand, SetSheetFilterRangeCommand, SetSheetsFilterCriteriaCommand, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter/commands/commands/sheets-filter.command.js';
import { IMessageService } from '@univerjs/ui';
import { MockMessageService } from '@univerjs/ui/services/message/__testing__/mock-message.service.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function testWorkbookDataFactory(): IWorkbookData {
    return {
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
                    },
                    1: {
                        0: {
                            v: '1',
                        },
                        1: {
                            v: 'a',
                        },
                    },
                    2: {
                        0: {
                            v: '2',
                        },
                        1: {
                            v: 'b',
                        },
                    },
                    3: {
                        0: {
                            v: '3',
                        },
                        1: {
                            v: 'c',
                        },
                    },
                },
                name: 'Sheet-001',
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};

function createFilterCommandTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class SheetsFilterCommandTestPlugin extends Plugin {
        static override pluginName = 'sheets-filter-command-test';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(_config: unknown, @Inject(Injector) protected readonly _injector: Injector) {
            super();
        }

        override onStarting(): void {
            ([
                [RefRangeService],
                [SheetInterceptorService],
                [SheetsSelectionsService],
                [WorksheetPermissionService],
                [WorksheetProtectionPointModel],
                [WorkbookPermissionService],
                [IAuthzIoService, { useClass: AuthzIoLocalService }],
                [WorksheetProtectionRuleModel],
                [RangeProtectionRuleModel],
                [IMessageService, { useClass: MockMessageService }],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
            ] as Dependency[]).forEach((d) => this._injector.add(d));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }
    }

    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(SheetsFilterCommandTestPlugin);

    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, testWorkbookDataFactory());

    const commandService = get(ICommandService);
    [
        SetRangeValuesCommand,
        SetRangeValuesMutation,
        RemoveSheetFilterCommand,
        SetSheetFilterRangeCommand,
        SmartToggleSheetsFilterCommand,
        SetSheetsFilterCriteriaCommand,
        ClearSheetsFilterCriteriaCommand,
        ReCalcSheetsFilterCommand,
    ].forEach((command) => commandService.registerCommand(command));

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    return { univer, get };
}

describe('test sheets filter commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetsFilterService: SheetsFilterService;
    let selectionManagerService: SheetsSelectionsService;

    beforeEach(() => {
        const testBed = createFilterCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        sheetsFilterService = get(SheetsFilterService);
        selectionManagerService = get(SheetsSelectionsService);
    });

    afterEach(() => {
    });

    function select(range: IRange) {
        const { startColumn, startRow, endColumn, endRow } = range;
        selectionManagerService.addSelections([
            {
                range: { startRow, startColumn, endColumn, endRow, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endColumn,
                    endRow,
                    actualRow: startRow,
                    actualColumn: startColumn,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function getFilterModel(): FilterModel {
        return sheetsFilterService.getFilterModel('test', 'sheet1')!;
    }

    describe('test "SmartToggleSheetsFilterCommand"', () => {
        it('should remove filter when there is one', async () => {
            expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
            } as ISetSheetsFilterRangeMutationParams));
            expect(getFilterModel()).toBeTruthy();

            expect(await commandService.executeCommand(SmartToggleSheetsFilterCommand.id)).toBeTruthy();
            expect(getFilterModel()).toBeNull();

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const filterModel = getFilterModel();
            expect(filterModel).toBeTruthy();
            expect(filterModel!.getRange()).toEqual({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getFilterModel()).toBeNull();
        });

        it('should add filter when there is no filter', async () => {
            expect(getFilterModel()).toBeNull();

            // since there is no selection, it should return false
            expect(await commandService.executeCommand(SmartToggleSheetsFilterCommand.id)).toBeFalsy();

            select({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(await commandService.executeCommand(SmartToggleSheetsFilterCommand.id)).toBeTruthy();
            expect(getFilterModel()!.getRange()).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 5,
                endColumn: 5,
                rangeType: RANGE_TYPE.NORMAL,
            });

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getFilterModel()).toBeNull();

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getFilterModel()).toBeTruthy();
        });
    });

    describe('test "SetSheetsFilterCriteriaCommand"', () => {
        it('should return false when there is not filter', async () => {
            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
                criteria: null,
            } as ISetSheetsFilterCriteriaCommandParams)).toBeFalsy();
        });

        it('should set filter criteria works', async () => {
            select({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(await commandService.executeCommand(SmartToggleSheetsFilterCommand.id)).toBeTruthy();

            // set filter criteria
            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
                criteria: {
                    filters: { filters: ['1'] },
                },
            } as ISetSheetsFilterCriteriaCommandParams)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([2, 3, 4, 5]));

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set());

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([2, 3, 4, 5]));

            // manually set criteria to null
            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
                criteria: null,
            } as ISetSheetsFilterCriteriaCommandParams)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set());

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([2, 3, 4, 5]));

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set());
        });
    });

    describe('test "ClearSheetsFilterConditionsCommand"', () => {
        it('should clear all filter criteria', async () => {
            select({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(await commandService.executeCommand(SmartToggleSheetsFilterCommand.id)).toBeTruthy();

            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
                criteria: {
                    filters: { filters: ['1'] },
                },
            } as ISetSheetsFilterCriteriaCommandParams)).toBeTruthy();
            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 1,
                criteria: {
                    filters: { filters: ['b'] },
                },
            } as ISetSheetsFilterCriteriaCommandParams)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([1, 2, 3, 4, 5]));

            expect(await commandService.executeCommand(ClearSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set());

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([1, 2, 3, 4, 5]));

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set());
        });
    });

    describe('test "ReCalcSheetsFilterConditionsCommand"', () => {
        it('should reCalc after set range values and get correct result', async () => {
            select({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(await commandService.executeCommand(SmartToggleSheetsFilterCommand.id)).toBeTruthy();

            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
                criteria: {
                    filters: { filters: ['1'] },
                },
            } as ISetSheetsFilterCriteriaCommandParams)).toBeTruthy();
            expect(await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 1,
                criteria: {
                    filters: { filters: ['b'] },
                },
            } as ISetSheetsFilterCriteriaCommandParams)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([1, 2, 3, 4, 5]));

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                value: { 1: { 1: { v: 'b' } } },
            } as ISetRangeValuesCommandParams)).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([1, 2, 3, 4, 5]));

            expect(await commandService.executeCommand(ReCalcSheetsFilterCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();
            expect(getFilterModel()!.filteredOutRows).toEqual(new Set([2, 3, 4, 5]));
        });
    });
});
