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

import type { IWorkbookData } from '@univerjs/core';
import type { ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '../sheets-filter.mutation';
import { ICommandService, Inject, Injector, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { SHEET_FILTER_SNAPSHOT_ID, SheetsFilterService } from '../../../services/sheet-filter.service';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '../sheets-filter.mutation';

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
                        1: {
                            v: 'B1',
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
                            v: 'header',
                        },
                        1: {
                            v: 'A',
                        },
                        2: {
                            v: 'B',
                        },
                        3: {
                            v: 'C',
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
                        ref: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
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

function createFilterMutationTestBed(workbookData?: IWorkbookData) {
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
            this._injector.add([SheetsFilterService]);
        }
    }

    univer.registerPlugin(SheetsFilterTestPlugin);

    const sheet = univer.createUniverSheet(workbookData || testWorkbookDataFactory());

    const sheetsFilterService = get(SheetsFilterService);
    const commandService = get(ICommandService);

    // It should be registered later in avoid of time sequence problem.
    // injector.add([ISnapshotPersistenceService, { useClass: LocalSnapshotService }]);
    // injector.get(ISnapshotPersistenceService);

    ([
        SetSheetsFilterRangeMutation,
        SetSheetsFilterCriteriaMutation,
        RemoveSheetsFilterMutation,
        ReCalcSheetsFilterMutation,
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

describe('test mutations of sheets filter', () => {
    let univer: Univer;

    afterEach(() => {
        univer.dispose();
    });

    describe('test set sheets filter range mutations', () => {
        it('should set filter range work when there is no filter range', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataFactory());
            const { commandService, sheetsFilterService } = testBed;
            univer = testBed.univer;

            expect(sheetsFilterService.getFilterModel('test', 'sheet1')).toBeNull();

            expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
            } as ISetSheetsFilterRangeMutationParams)).toBeTruthy();
            expect(sheetsFilterService.getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
        });

        it('should load filter info to the service and support changing its range', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataWithFilterFactory());
            const { commandService, sheetsFilterService } = testBed;
            univer = testBed.univer;

            const filterModel = sheetsFilterService.getFilterModel('test', 'sheet1');
            expect(filterModel).toBeTruthy();
            expect(filterModel!.getRange()).toEqual({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });

            expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 5, startColumn: 5, endRow: 8, endColumn: 8 },
            } as ISetSheetsFilterRangeMutationParams)).toBeTruthy();
            expect(sheetsFilterService.getFilterModel('test', 'sheet1')!.getRange())
                .toEqual({ startRow: 5, startColumn: 5, endRow: 8, endColumn: 8 });
        });
    });

    describe('test set sheets filter criteria mutations', () => {
        it('should re calc when set filter criteria', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataWithFilterFactory());
            const { commandService, sheetsFilterService } = testBed;
            univer = testBed.univer;

            const filterModel = sheetsFilterService.getFilterModel('test', 'sheet1');
            expect(filterModel).toBeTruthy();
            expect(filterModel!.getRange()).toEqual({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(filterModel!.filteredOutRows.size).toBe(0);

            expect(commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
                criteria: {
                    colId: 0,
                    filters: ['A'],
                },
            } as ISetSheetsFilterCriteriaMutationParams)).toBeTruthy();
            expect(filterModel!.filteredOutRows.size).toBe(5);
        });

        it('should return false when set filter criteria on a non-existing filter model', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataWithFilterFactory());
            const { commandService, sheetsFilterService } = testBed;
            univer = testBed.univer;

            const filterModel = sheetsFilterService.getFilterModel('test', 'sheet1');
            expect(filterModel).toBeTruthy();
            expect(filterModel!.getRange()).toEqual({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(filterModel!.filteredOutRows.size).toBe(0);

            expect(commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet2',
                colId: 0,
                criteria: {
                    colId: 0,
                    filters: ['A'],
                },
            })).toBeFalsy();
        });

        it('should throw error when set filter criteria outside of filter range', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataWithFilterFactory());
            const { commandService, sheetsFilterService } = testBed;
            univer = testBed.univer;

            const filterModel = sheetsFilterService.getFilterModel('test', 'sheet1');
            expect(filterModel).toBeTruthy();
            expect(filterModel!.getRange()).toEqual({ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 });
            expect(filterModel!.filteredOutRows.size).toBe(0);

            expect(() => commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                colId: 10,
                criteria: {
                    colId: 10,
                    filters: ['A'],
                },
            })).toThrowError();
        });
    });

    describe('test remove sheets filter mutations', () => {
        it('should return true when there is a filter', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataWithFilterFactory());
            const { commandService, sheetsFilterService } = testBed;
            univer = testBed.univer;

            expect(commandService.syncExecuteCommand(RemoveSheetsFilterMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();
            expect(sheetsFilterService.getFilterModel('test', 'sheet1')).toBeNull();
        });

        it('should return false when there is no filter', () => {
            const testBed = createFilterMutationTestBed(testWorkbookDataFactory());
            const { commandService } = testBed;
            univer = testBed.univer;

            expect(commandService.syncExecuteCommand(RemoveSheetsFilterMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeFalsy();
        });
    });
});
