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
import {
    ICommandService,
    Inject,
    Injector as InjectorIdentifier,
    IUniverInstanceService,
    LocaleType,
    Plugin,
    RANGE_TYPE,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { MarkDirtyFilterChangeMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsFilterService } from '../../../services/sheet-filter.service';
import {
    ReCalcSheetsFilterMutation,
    RemoveSheetsFilterMutation,
    SetSheetsFilterCriteriaMutation,
    SetSheetsFilterRangeMutation,
} from '../../mutations/sheets-filter.mutation';
import {
    ClearSheetsFilterCriteriaCommand,
    ReCalcSheetsFilterCommand,
    RemoveSheetFilterCommand,
    SetSheetFilterRangeCommand,
    SetSheetsFilterCriteriaCommand,
    SmartToggleSheetsFilterCommand,
} from '../sheets-filter.command';

const unitId = 'filter-command-workbook';
const subUnitId = 'sheet1';

function createWorkbookData(): IWorkbookData {
    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'filter command workbook',
        sheetOrder: [subUnitId],
        styles: {},
        sheets: {
            [subUnitId]: {
                id: subUnitId,
                name: 'Sheet 1',
                cellData: {
                    0: {
                        0: { v: 'Fruit' },
                    },
                    1: {
                        0: { v: 'Apple' },
                    },
                    2: {
                        0: { v: 'Banana' },
                    },
                    3: {
                        0: { v: 'Apple' },
                    },
                },
            },
        },
    };
}

class SheetsFilterCommandTestPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = 'SheetsFilterCommandTestPlugin';

    constructor(_config: unknown, @Inject(InjectorIdentifier) protected readonly _injector: Injector) {
        super();
    }

    override onStarting(): void {
        this._injector.add([SheetsFilterService]);
        this._injector.add([SheetsSelectionsService]);
    }
}

describe('sheet filter commands', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commandService: ICommandService;
    let sheetsFilterService: SheetsFilterService;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(SheetsFilterCommandTestPlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(unitId);
        commandService = injector.get(ICommandService);
        sheetsFilterService = injector.get(SheetsFilterService);

        const commands = [
            SetSheetsFilterRangeMutation,
            SetSheetsFilterCriteriaMutation,
            RemoveSheetsFilterMutation,
            ReCalcSheetsFilterMutation,
            MarkDirtyFilterChangeMutation,
            SetSheetFilterRangeCommand,
            RemoveSheetFilterCommand,
            SetSheetsFilterCriteriaCommand,
            ClearSheetsFilterCriteriaCommand,
            ReCalcSheetsFilterCommand,
            SmartToggleSheetsFilterCommand,
        ];

        for (const command of commands) {
            commandService.registerCommand(command);
        }
    });

    afterEach(() => {
        univer.dispose();
    });

    it('sets a filter range and applies criteria to the filtered rows', async () => {
        const range = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 0 };

        const setRangeResult = await commandService.executeCommand(SetSheetFilterRangeCommand.id, {
            unitId,
            subUnitId,
            range,
        });
        const criteriaResult = await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId,
            subUnitId,
            col: 0,
            criteria: {
                colId: 0,
                filters: {
                    filters: ['Apple'],
                },
            },
        });

        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        const filterColumn = filterModel?.getFilterColumn(0);

        expect(setRangeResult).toBe(true);
        expect(criteriaResult).toBe(true);
        expect(filterModel?.getRange()).toEqual(range);
        expect(filterColumn?.serialize()).toMatchObject({
            colId: 0,
            filters: {
                filters: ['Apple'],
            },
        });
        expect(filterModel?.isRowFiltered(1)).toBe(false);
        expect(filterModel?.isRowFiltered(2)).toBe(true);
        expect(filterModel?.isRowFiltered(3)).toBe(false);
    });

    it('clears criteria without removing the filter range', async () => {
        const range = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 0 };

        await commandService.executeCommand(SetSheetFilterRangeCommand.id, {
            unitId,
            subUnitId,
            range,
        });
        await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId,
            subUnitId,
            col: 0,
            criteria: {
                colId: 0,
                filters: {
                    filters: ['Apple'],
                },
            },
        });

        const result = await commandService.executeCommand(ClearSheetsFilterCriteriaCommand.id, {
            unitId,
            subUnitId,
        });
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);

        expect(result).toBe(true);
        expect(filterModel?.getRange()).toEqual(range);
        expect(filterModel?.getFilterColumn(0)).toBeNull();
        expect(filterModel?.filteredOutRows.size).toBe(0);
    });

    it('removes an existing filter model from the worksheet', async () => {
        await commandService.executeCommand(SetSheetFilterRangeCommand.id, {
            unitId,
            subUnitId,
            range: { startRow: 0, startColumn: 0, endRow: 3, endColumn: 0 },
        });

        const result = await commandService.executeCommand(RemoveSheetFilterCommand.id, {
            unitId,
            subUnitId,
        });

        expect(result).toBe(true);
        expect(sheetsFilterService.getFilterModel(unitId, subUnitId)).toBeNull();
    });

    it('toggles the current selection into and out of a sheet filter', async () => {
        const selectionManager = univer.__getInjector().get(SheetsSelectionsService);
        const selectedRange = {
            startRow: 0,
            startColumn: 0,
            endRow: 3,
            endColumn: 0,
            rangeType: RANGE_TYPE.NORMAL,
        };
        selectionManager.addSelections([{
            range: selectedRange,
            primary: {
                actualRow: 0,
                actualColumn: 0,
                startRow: 0,
                startColumn: 0,
                endRow: 3,
                endColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        const openResult = await commandService.executeCommand(SmartToggleSheetsFilterCommand.id);
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        const closeResult = await commandService.executeCommand(SmartToggleSheetsFilterCommand.id);

        expect(openResult).toBe(true);
        expect(filterModel?.getRange()).toEqual(selectedRange);
        expect(closeResult).toBe(true);
        expect(sheetsFilterService.getFilterModel(unitId, subUnitId)).toBeNull();
    });

    it('recalculates an existing filter after sheet data changes', async () => {
        const worksheet = workbook.getSheetBySheetId(subUnitId);

        await commandService.executeCommand(SetSheetFilterRangeCommand.id, {
            unitId,
            subUnitId,
            range: { startRow: 0, startColumn: 0, endRow: 3, endColumn: 0 },
        });
        await commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
            unitId,
            subUnitId,
            col: 0,
            criteria: {
                colId: 0,
                filters: {
                    filters: ['Apple'],
                },
            },
        });

        worksheet?.getCellMatrix().setValue(2, 0, { v: 'Apple' });
        const result = await commandService.executeCommand(ReCalcSheetsFilterCommand.id, {
            unitId,
            subUnitId,
        });
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);

        expect(result).toBe(true);
        expect(filterModel?.isRowFiltered(2)).toBe(false);
    });
});
