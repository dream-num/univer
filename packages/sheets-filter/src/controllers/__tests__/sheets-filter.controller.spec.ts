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

/* eslint-disable perfectionist/sort-imports */

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { ICommandService, Inject, Injector, IUniverInstanceService, LocaleService, LocaleType, Plugin, RANGE_TYPE, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { CopySheetCommand, InsertColByRangeCommand, InsertColMutation, InsertRowByRangeCommand, InsertSheetMutation, MoveColsCommand, MoveColsMutation, MoveRangeCommand, MoveRangeMutation, MoveRowsCommand, MoveRowsMutation, RefRangeService, RemoveColByRangeCommand, RemoveColCommand, RemoveColMutation, RemoveRowByRangeCommand, RemoveRowCommand, RemoveRowMutation, SetRangeValuesMutation, SetSelectionsOperation, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { SHEET_FILTER_SNAPSHOT_ID, SheetsFilterService } from '../../services/sheet-filter.service';
import { SheetsFilterController } from '../sheets-filter.controller';
import { SetSheetsFilterCriteriaMutation } from '../../commands/mutations/sheets-filter.mutation';

function testWorkbookDataWithFilterFactory(): IWorkbookData {
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
                        1: {
                            v: 'B1',
                        },
                        2: {
                            v: 'C1',
                        },
                        3: {
                            v: 'D1',
                        },
                    },
                    1: {
                        0: {
                            v: 'A2',
                        },
                        1: {
                            v: 'B2',
                        },
                        2: {
                            v: 'C2',
                        },
                        3: {
                            v: 'D2',
                        },
                    },
                    2: {
                        0: {
                            v: 'A3',
                        },
                        1: {
                            v: 'B3',
                        },
                        2: {
                            v: 'C3',
                        },
                        3: {
                            v: 'D3',
                        },
                    },
                    3: {
                        0: {
                            v: 'A',
                        },
                        1: {
                            v: 'B',
                        },
                        2: {
                            v: 'C',
                        },
                        3: {
                            v: 'D',
                        },
                    },
                    4: {
                        0: {
                            v: 'H',
                        },
                    },
                },
                name: 'Sheet-001',
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startRow: 3, startColumn: 0, endRow: 5, endColumn: 5 },
                        filterColumns: [{ colId: 0, filters: { blank: true } }],
                        cachedFilteredOut: [4],
                    },
                }),
            },
        ],
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
}

function createFilterControllerTestBed(workbookData?: IWorkbookData) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class SheetsFilterTestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'SheetsFilterTestPlugin';

        constructor(_config: unknown, @Inject(Injector) protected readonly _injector: Injector) {
            super();
        }

        override onStarting(): void {
            this._injector.add([RefRangeService]);
            this._injector.add([SheetsFilterService]);
            this._injector.add([SheetsFilterController]);
            this._injector.add([SheetsSelectionsService]);
            this._injector.add([SheetInterceptorService]);
        }

        override onReady(): void {
            this._injector.get(SheetsFilterController);
        }
    }

    univer.registerPlugin(SheetsFilterTestPlugin);

    const sheet = univer.createUniverSheet(workbookData || testWorkbookDataWithFilterFactory());

    const sheetsFilterService = get(SheetsFilterService);
    const commandService = get(ICommandService);

    ([
        MoveRowsCommand,
        MoveRowsMutation,
        MoveColsCommand,
        MoveColsMutation,
        InsertColMutation,
        InsertColByRangeCommand,
        InsertRowByRangeCommand,
        RemoveRowCommand,
        RemoveRowMutation,
        RemoveColCommand,
        RemoveColMutation,
        RemoveColByRangeCommand,
        RemoveRowByRangeCommand,
        SetSelectionsOperation,
        SetRangeValuesMutation,
        CopySheetCommand,
        InsertSheetMutation,
        MoveRangeCommand,
        MoveRangeMutation,
    ]
    ).forEach((command) => commandService.registerCommand(command));

    return {
        univer,
        get,
        sheet,
        sheetsFilterService,
        commandService,
    };
}

describe('test controller of sheets filter', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetsFilterService: SheetsFilterService;
    let instanceService: IUniverInstanceService;

    beforeEach(() => {
        const testBed = createFilterControllerTestBed();
        univer = testBed.univer;
        get = testBed.get;

        get(LocaleService).load({ zhCN: {} });

        commandService = get(ICommandService);
        sheetsFilterService = get(SheetsFilterService);
        instanceService = get(IUniverInstanceService);
        instanceService.setCurrentUnitForType('test');
        instanceService.focusUnit('test');
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('test interceptor of move-rows-command', () => {
        it('should be success when move row before filter header', async () => {
            await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [
                    {
                        range: {
                            rangeType: RANGE_TYPE.ROW,
                            startRow: 0,
                            endRow: 0,
                        },
                    },
                ],
            });
            const result = await commandService.executeCommand(MoveRowsCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                fromRange: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 5 },
                toRange: { startRow: 2, startColumn: 0, endRow: 2, endColumn: 5 },
            });
            expect(result).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 5, endColumn: 5 });
            const workbook = instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(0, 0)?.v).toBe('A2');
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(1, 0)?.v).toBe('A1');
        });
    });

    describe('test interceptor of move-cols-command', () => {
        it('should be restored when undo move cols command', async () => {
            await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [
                    {
                        range: {
                            rangeType: RANGE_TYPE.COLUMN,
                            startRow: 0,
                            endRow: 10,
                            startColumn: 0,
                            endColumn: 5,
                        },
                    },
                ],
            });
            const result = await commandService.executeCommand(MoveColsCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                fromRange: { startRow: 0, startColumn: 0, endRow: 10, endColumn: 5 },
                toRange: { startRow: 0, startColumn: 10, endRow: 10, endColumn: 15 },
            });
            expect(result).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 4, endRow: 5, endColumn: 9 });

            expect(await commandService.executeCommand(UndoCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 5, endColumn: 5 });
        });
    });

    describe('test extend range of filter', () => {
        it('should not be extended when edit null', async () => {
            expect(await commandService.executeCommand(SetRangeValuesMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: {
                    6: {
                        0: {
                            f: null,
                        },
                    },
                },
            } as ISetRangeValuesMutationParams)).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 5, endColumn: 5 });
        });
        it('should be extended when edit not null', async () => {
            expect(await commandService.executeCommand(SetRangeValuesMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: {
                    6: {
                        0: {
                            v: 'test',
                        },
                    },
                },
            } as ISetRangeValuesMutationParams)).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 6, endColumn: 5 });
        });
    });

    describe('test interceptor of remove-rows-command', () => {
        it('filter range should move up if remove rows before filter header', async () => {
            expect(await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [
                    {
                        range: {
                            rangeType: RANGE_TYPE.ROW,
                            startRow: 0,
                            endRow: 0,
                        },
                    },
                ],
            })).toBeTruthy();
            expect(await commandService.executeCommand(RemoveRowCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 5 },
            })).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 2, startColumn: 0, endRow: 4, endColumn: 5 });
        });
    });

    describe('test interceptor of remove-cols-command', () => {
        it('filter range should move left if remove cols before filter header', async () => {
            expect(await commandService.executeCommand(SetSheetsFilterCriteriaMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 1,
                criteria: {
                    colId: 1,
                    filters: {
                        filters: ['test'],
                    },
                },
            })).toBeTruthy();
            expect(await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [
                    {
                        range: {
                            rangeType: RANGE_TYPE.COLUMN,
                            startRow: 0,
                            endRow: 10,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                ],
            })).toBeTruthy();
            expect(await commandService.executeCommand(RemoveColCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, startColumn: 0, endRow: 10, endColumn: 0 },
            })).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 5, endColumn: 4 });
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getAllFilterColumns()?.[0][0]).toBe(0);

            expect(await commandService.executeCommand(UndoCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 5, endColumn: 5 });
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getAllFilterColumns()?.[0][0]).toBe(1);
        });
    });

    describe('test copy sheet', () => {
        it('should copy filter', async () => {
            const res = await commandService.executeCommand(CopySheetCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            });
            expect(res).toBeTruthy();
            const workbook = instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const sheet2 = workbook.getSheets()[1];
            const filterModel = (sheetsFilterService as SheetsFilterService).getFilterModel('test', sheet2.getSheetId());
            expect(filterModel).toBeTruthy();
            expect(filterModel?.getFilterColumn(0)?.getColumnData()).toStrictEqual({ colId: 0, filters: { blank: true } });
        });
    });

    describe('test interceptor of move range', () => {
        it('moved range intersect with filter range should expand filter', async () => {
            const res = await commandService.executeCommand(MoveRangeCommand.id, {
                fromRange: {
                    startRow: 10,
                    startColumn: 7,
                    endRow: 16,
                    endColumn: 7,
                    rangeType: 0,
                },
                toRange: {
                    startRow: 4,
                    startColumn: 3,
                    endRow: 10,
                    endColumn: 3,
                    rangeType: 0,
                },
            });
            expect(res).toBeTruthy();
            expect((sheetsFilterService as SheetsFilterService).getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 3, startColumn: 0, endRow: 10, endColumn: 5 });
        });
    });
});
