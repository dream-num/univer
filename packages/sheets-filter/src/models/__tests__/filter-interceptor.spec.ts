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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IWorkbookData, LocaleType } from '@univerjs/core';
import { Direction, ICommandService, Plugin, RANGE_TYPE, Univer, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import type { IInsertColCommandParams, IInsertRowCommandParams, IMoveColsCommandParams, IMoveRowsCommandParams, IRemoveRowColCommandParams, IRemoveSheetCommandParams, ISetSelectionsOperationParams } from '@univerjs/sheets';
import { InsertColCommand, InsertColMutation, InsertRowCommand, InsertRowMutation, MoveColsCommand, MoveColsMutation, MoveRowsCommand, MoveRowsMutation, NORMAL_SELECTION_PLUGIN_NAME, RefRangeService, RemoveColCommand, RemoveColMutation, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, RemoveSheetMutation, SelectionManagerService, SetSelectionsOperation, SheetInterceptorService } from '@univerjs/sheets';
import { SHEET_FILTER_SNAPSHOT_ID, SheetsFilterService } from '../../services/sheet-filter.service';
import { SheetsFilterController } from '../../controllers/sheets-filter.controller';

describe('Test "Filter Interceptor"', () => {
    let univer: Univer;
    let get: Injector['get'];
    let sheetsFilterService: SheetsFilterService;
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createFilterTestUniver();
        univer = testBed.univer;
        get = testBed.get;
        sheetsFilterService = testBed.sheetsFilterService;
        commandService = testBed.commandService;
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Test "insert Command"', () => {
        it('insert col command, in filter range', async () => {
            const insertColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 2, endColumn: 2, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN,
            }, direction: Direction.RIGHT } as IInsertColCommandParams;
            await commandService.executeCommand(InsertColCommand.id, insertColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([3]);
        });

        it('insert col command, before filter range', async () => {
            const insertColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 0, endColumn: 0, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN,
            }, direction: Direction.RIGHT } as IInsertColCommandParams;
            await commandService.executeCommand(InsertColCommand.id, insertColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 2, endColumn: 3, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([3]);
        });

        it('insert row command, in filter range', async () => {
            const insertRowCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 0, endColumn: 3, startRow: 2, endRow: 2, type: RANGE_TYPE.ROW,
            }, direction: Direction.DOWN } as IInsertRowCommandParams;
            await commandService.executeCommand(InsertRowCommand.id, insertRowCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 2, startRow: 1, endRow: 3 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([2]);
        });

        it('insert row command, before filter range', async () => {
            const insertRowCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 0, endColumn: 3, startRow: 0, endRow: 0, type: RANGE_TYPE.ROW,
            }, direction: Direction.DOWN } as IInsertRowCommandParams;
            await commandService.executeCommand(InsertRowCommand.id, insertRowCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 2, startRow: 2, endRow: 3 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([2]);
        });
    });

    describe('Test "remove Command"', () => {
        it('remove col command, in filter range', async () => {
            const removeColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 1, endColumn: 1, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN,
            }, direction: Direction.RIGHT } as IRemoveRowColCommandParams;
            await commandService.executeCommand(RemoveColCommand.id, removeColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 1, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([1]);
        });
        it('remove col command, before filter range', async () => {
            const removeColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 0, endColumn: 0, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN,
            }, direction: Direction.RIGHT } as IRemoveRowColCommandParams;
            await commandService.executeCommand(RemoveColCommand.id, removeColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 0, endColumn: 1, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([1]);
        });

        it('remove row command, in filter range', async () => {
            const removeRowCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 0, endColumn: 3, startRow: 1, endRow: 1, type: RANGE_TYPE.ROW,
            }, direction: Direction.DOWN } as IRemoveRowColCommandParams;
            await commandService.executeCommand(RemoveRowCommand.id, removeRowCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')).toBe(null);
        });

        it('remove row command, before filter range', async () => {
            const removeRowCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', range: { startColumn: 0, endColumn: 3, startRow: 0, endRow: 0, type: RANGE_TYPE.ROW,
            }, direction: Direction.DOWN } as IRemoveRowColCommandParams;
            await commandService.executeCommand(RemoveRowCommand.id, removeRowCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 2, startRow: 0, endRow: 1 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([2]);
        });
    });

    describe('Test "move Command"', () => {
        it('move col command, filter column move to left', async () => {
            const moveColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', fromRange: { startColumn: 1, endColumn: 1, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN,
            }, toRange: { startColumn: 3, endColumn: 3, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN }, direction: Direction.RIGHT } as IMoveColsCommandParams;
            const selectionManagerService = get(SelectionManagerService);
            selectionManagerService.setCurrentSelection({ unitId: 'workbookId', sheetId: 'worksheetId', pluginName: NORMAL_SELECTION_PLUGIN_NAME });
            await commandService.executeCommand(SetSelectionsOperation.id, { unitId: 'workbookId', subUnitId: 'worksheetId', pluginName: NORMAL_SELECTION_PLUGIN_NAME, selections: [{ style: null, range: { startColumn: 1, endColumn: 1, startRow: 0, endRow: 4, rangeType: RANGE_TYPE.COLUMN }, primary: {} }] } as ISetSelectionsOperationParams);
            await commandService.executeCommand(MoveColsCommand.id, moveColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 2, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([1]);
        });
        it('move col command, filter column move to right', async () => {
            const moveColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', fromRange: { startColumn: 2, endColumn: 2, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN,
            }, toRange: { startColumn: 4, endColumn: 4, startRow: 0, endRow: 4, type: RANGE_TYPE.COLUMN }, direction: Direction.RIGHT } as IMoveColsCommandParams;
            const selectionManagerService = get(SelectionManagerService);
            selectionManagerService.setCurrentSelection({ unitId: 'workbookId', sheetId: 'worksheetId', pluginName: NORMAL_SELECTION_PLUGIN_NAME });
            await commandService.executeCommand(SetSelectionsOperation.id, { unitId: 'workbookId', subUnitId: 'worksheetId', pluginName: NORMAL_SELECTION_PLUGIN_NAME, selections: [{ style: null, range: { startColumn: 2, endColumn: 2, startRow: 0, endRow: 4, rangeType: RANGE_TYPE.COLUMN }, primary: {} }] } as ISetSelectionsOperationParams);
            await commandService.executeCommand(MoveColsCommand.id, moveColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([3]);
        });

        it('move row command', async () => {
            const moveColCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId', fromRange: { startColumn: 0, endColumn: 3, startRow: 1, endRow: 1, type: RANGE_TYPE.ROW,
            }, toRange: { startColumn: 0, endColumn: 3, startRow: 3, endRow: 3, type: RANGE_TYPE.ROW }, direction: Direction.RIGHT } as IMoveRowsCommandParams;
            const selectionManagerService = get(SelectionManagerService);
            selectionManagerService.setCurrentSelection({ unitId: 'workbookId', sheetId: 'worksheetId', pluginName: NORMAL_SELECTION_PLUGIN_NAME });
            await commandService.executeCommand(SetSelectionsOperation.id, { unitId: 'workbookId', subUnitId: 'worksheetId', pluginName: NORMAL_SELECTION_PLUGIN_NAME, selections: [{ style: null, range: { startColumn: 0, endColumn: 3, startRow: 1, endRow: 1, rangeType: RANGE_TYPE.ROW }, primary: {} }] } as ISetSelectionsOperationParams);
            await commandService.executeCommand(MoveRowsCommand.id, moveColCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getRange()).toStrictEqual({ startColumn: 1, endColumn: 2, startRow: 1, endRow: 2 });
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')!.getAllFilterColumns().map((x) => x[0])).toStrictEqual([2]);
        });
    });

    describe('Test "remove sheet Command"', () => {
        it('remove sheet command', async () => {
            const removeSheetCommandParams = { unitId: 'workbookId', subUnitId: 'worksheetId' } as IRemoveSheetCommandParams;
            await commandService.executeCommand(RemoveSheetCommand.id, removeSheetCommandParams);
            expect(sheetsFilterService.getFilterModel('workbookId', 'worksheetId')).toBe(null);
        });
    });
});

function createFilterTestUniver(dependencies?: Dependency[], workbookData?: IWorkbookData
) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'test-plugin';

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(injector: Injector): void {
            dependencies?.forEach((d) => injector.add(d));

            injector.add([SheetInterceptorService]);
            injector.add([SheetsFilterService]);
            injector.add([SelectionManagerService]);
            injector.add([RefRangeService]);
            injector.add([SheetsFilterController]);
        }
    }

    univer.registerPlugin(TestPlugin);

    univer.createUniverSheet(workbookData || testWorkbookDataFactory());

    const sheetsFilterService = injector.get(SheetsFilterService);

    // It should be registered later in avoid of time sequence problem.
    // injector.add([ISnapshotPersistenceService, { useClass: LocalSnapshotService }]);
    // injector.get(ISnapshotPersistenceService);

    const commandService = get(ICommandService);
    [
        InsertColMutation,
        RemoveColMutation,
        InsertColCommand,
        InsertRowMutation,
        RemoveRowMutation,
        InsertRowCommand,
        RemoveColCommand,
        RemoveRowCommand,
        MoveColsMutation,
        MoveColsCommand,
        MoveRowsCommand,
        MoveRowsMutation,
        SetSelectionsOperation,
        RemoveSheetCommand,
        RemoveSheetMutation,
    ].forEach((command) => {
        commandService.registerCommand(command);
    });

    return {
        univer,
        get,
        sheetsFilterService,
        commandService,
    };
}

function testWorkbookDataFactory(): IWorkbookData {
    return {
        id: 'workbookId',
        sheetOrder: ['worksheetId'],
        name: 'UniverSheet Demo',
        appVersion: '3.0.0-alpha',
        locale: 'zhCN' as LocaleType,
        styles: {},
        sheets: {
            worksheetId: {
                name: '工作表1',
                id: 'worksheetId',
                tabColor: '',
                hidden: 0,
                rowCount: 1000,
                columnCount: 20,
                zoomRatio: 1,
                scrollTop: 0,
                scrollLeft: 0,
                defaultColumnWidth: 73,
                defaultRowHeight: 19,
                mergeData: [],
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
                            v: 'A4',
                        },
                        1: {
                            v: 'B4',
                        },
                        2: {
                            v: 'C4',
                        },
                        3: {
                            v: 'D4',
                        },
                    },
                    4: {
                        0: {
                            v: 'A5',
                        },
                        1: {
                            v: 'B5',
                        },
                        2: {
                            v: 'C5',
                        },
                        3: {
                            v: 'D5',
                        },
                    },
                },
                showGridlines: 1,
                selections: ['A1'],
                rightToLeft: 0,
            },
            sheet1: {
                name: 'sheet1',
                id: 'sheet1',
                cellData: {},
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    worksheetId: {
                        ref: {
                            startColumn: 1,
                            endColumn: 2,
                            startRow: 1,
                            endRow: 2,
                        },

                        filterColumns: [{
                            colId: 2,
                            filters: {
                                filters: ['1'],
                            },
                        }],
                        cachedFilteredOut: [],
                    },
                }),
            },
        ],
    };
};
