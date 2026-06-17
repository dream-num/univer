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
    ICommand,
} from '@univerjs/core';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    Disposable,
    ICommandService,
    IConfigService,
    IConfirmService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    RANGE_TYPE,
    TestConfirmService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsSortService, SortType } from '@univerjs/sheets-sort';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import zhCN from '../../locale/zh-CN';
import { EXTEND_TYPE, SheetsSortUIService } from '../sheets-sort-ui.service';

class RecordingCommandService {
    readonly commands: Array<{ id: string; params?: unknown }> = [];

    executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.commands.push({ id, params });
        return Promise.resolve(true);
    }

    registerCommand(_command: ICommand): Disposable {
        return new Disposable();
    }
}

class RecordingConfirmService {
    readonly confirmOptions$ = new Subject<unknown[]>();
    readonly confirmations: unknown[] = [];
    result = true;
    extendType = EXTEND_TYPE.KEEP;

    open(params: unknown): Disposable {
        this.confirmations.push(params);
        return new Disposable();
    }

    confirm(params: { children?: { title?: { props?: { onChange?: (value: string) => void } } } }): Promise<boolean> {
        this.confirmations.push(params);
        if (this.extendType === EXTEND_TYPE.EXTEND) {
            params.children?.title?.props?.onChange?.('1');
        }
        return Promise.resolve(this.result);
    }

    close(_id: string): void {}
}

class RecordingSheetsSortService {
    readonly appliedSorts: Array<{ option: unknown; unitId?: string; subUnitId?: string }> = [];
    failedCheck: 'single' | 'merge' | 'formula' | 'empty' | null = null;

    singleCheck(): boolean {
        return this.failedCheck !== 'single';
    }

    mergeCheck(): boolean {
        return this.failedCheck !== 'merge';
    }

    formulaCheck(): boolean {
        return this.failedCheck !== 'formula';
    }

    emptyCheck(): boolean {
        return this.failedCheck !== 'empty';
    }

    applySort(option: unknown, unitId?: string, subUnitId?: string): void {
        this.appliedSorts.push({ option, unitId, subUnitId });
    }
}

function createService(useRecordingServices = false) {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ICommandService, { useClass: (useRecordingServices ? RecordingCommandService : CommandService) as never }]);
    injector.add([IConfirmService, { useClass: (useRecordingServices ? RecordingConfirmService : TestConfirmService) as never }]);
    injector.add([LexerTreeBuilder]);
    injector.add([FormulaDataModel]);
    injector.add([SheetsSelectionsService]);
    if (useRecordingServices) {
        injector.add([SheetsSortService, { useClass: RecordingSheetsSortService as never }]);
    } else {
        injector.add([SheetsSortService]);
    }
    injector.add([LocaleService]);
    injector.add([SheetsSortUIService]);
    injector.get(LocaleService).load({ zhCN });
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                cellData: {
                    0: {
                        1: { v: '0:1' },
                        2: { v: '0:2' },
                        3: { v: '0:3' },
                    },
                },
            },
        },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');
    return {
        injector,
        service: injector.get(SheetsSortUIService),
        sortService: injector.get(SheetsSortService) as unknown as RecordingSheetsSortService,
        commandService: injector.get(ICommandService) as unknown as RecordingCommandService,
        confirmService: injector.get(IConfirmService) as unknown as RecordingConfirmService,
        selectionsService: injector.get(SheetsSelectionsService),
    };
}

describe('SheetsSortUIService', () => {
    it('tracks the custom sort panel location and derives column titles from the selected range', () => {
        const { service } = createService();
        const location = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            colIndex: 1,
            range: { startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 },
        };

        service.showCustomSortPanel(location);
        expect(service.customSortState()).toEqual({ location, show: true });
        expect(service.getTitles(true)).toEqual([
            { index: 1, label: '0:1' },
            { index: 2, label: '0:2' },
            { index: 3, label: '0:3' },
        ]);

        service.closeCustomSortPanel();
        expect(service.customSortState()).toEqual({ show: false });
    });

    it('sorts the current selection directly with the requested direction', async () => {
        const { service, sortService, selectionsService } = createService(true);

        selectionsService.addSelections([{
            range: { startRow: 0, endRow: 2, startColumn: 1, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
            primary: {
                actualRow: 0,
                actualColumn: 2,
                startRow: 0,
                endRow: 2,
                startColumn: 1,
                endColumn: 3,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        expect(await service.triggerSortDirectly(false, false)).toBe(true);
        expect(sortService.appliedSorts).toEqual([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            option: {
                orderRules: [{ type: SortType.DESC, colIndex: 2 }],
                range: { startRow: 0, endRow: 2, startColumn: 1, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
            },
        }]);
    });

    it('extends a partial selection before opening custom sort when the user chooses extend', async () => {
        const { service, sortService, commandService, confirmService, selectionsService } = createService(true);
        confirmService.extendType = EXTEND_TYPE.EXTEND;

        selectionsService.addSelections([{
            range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
            primary: {
                actualRow: 0,
                actualColumn: 1,
                startRow: 0,
                endRow: 0,
                startColumn: 1,
                endColumn: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        expect(await service.triggerSortCustomize()).toBe(true);
        expect(commandService.commands[0]).toMatchObject({
            id: 'sheet.operation.set-selections',
            params: {
                selections: [{
                    range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 3 },
                }],
            },
        });
        expect(service.customSortState()?.location?.range).toMatchObject({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 3,
        });
        expect(sortService.appliedSorts).toEqual([]);
    });

    it('cancels custom sort when the extend prompt is rejected', async () => {
        const { service, confirmService, selectionsService } = createService(true);
        confirmService.result = false;

        selectionsService.addSelections([{
            range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
            primary: {
                actualRow: 0,
                actualColumn: 1,
                startRow: 0,
                endRow: 0,
                startColumn: 1,
                endColumn: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        expect(await service.triggerSortCustomize()).toBe(false);
        expect(service.customSortState()).toBeNull();
    });

    it('blocks sorting and shows a check error when the selected range is invalid', async () => {
        const { service, sortService, confirmService } = createService(true);
        const location = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            colIndex: 1,
            range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 3 },
        };
        sortService.failedCheck = 'single';

        expect(await service.triggerSortDirectly(true, false, location)).toBe(false);
        expect(sortService.appliedSorts).toEqual([]);
        expect(confirmService.confirmations).toMatchObject([{ id: 'sort-range-check-error' }]);
    });
});
