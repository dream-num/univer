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

import type { Dependency, IOperation, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import { CommandType, ICommandService, IContextService, Inject, Injector, LocaleService, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { ActiveDirtyManagerService, IActiveDirtyManagerService, ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import { RefRangeService, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { SetSheetsFilterRangeMutation, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetsFilterPanelService } from '../../../services/sheets-filter-panel.service';
import { CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../sheets-filter.operation';

const SetCellEditVisibleOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible',
    type: CommandType.OPERATION,
    handler: () => {
        return true;
    },
};

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

function createFilterOperationTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class SheetsFilterOperationTestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'sheets-filter-operation-test';

        constructor(_config: unknown, @Inject(Injector) protected readonly _injector: Injector) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetInterceptorService],
                [SheetsFilterPanelService],
                [RefRangeService],
                [SheetsSelectionsService],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
            ] as Dependency[]).forEach((d) => this._injector.add(d));
        }
    }

    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(SheetsFilterOperationTestPlugin);

    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, testWorkbookDataFactory());

    get(LocaleService).load({});

    const commandService = get(ICommandService);

    [
        OpenFilterPanelOperation,
        CloseFilterPanelOperation,
        SetCellEditVisibleOperation,
    ].forEach((command) => commandService.registerCommand(command));

    return { univer, get };
}

describe('test sheets filter ui operations', () => {
    let univer: Univer;
    let get: Injector['get'];
    let contextService: IContextService;
    let commandService: ICommandService;
    let sheetsFilterPanelService: SheetsFilterPanelService;

    beforeEach(() => {
        const testBed = createFilterOperationTestBed();
        univer = testBed.univer;
        get = testBed.get;

        contextService = get(IContextService);
        commandService = get(ICommandService);
        sheetsFilterPanelService = get(SheetsFilterPanelService);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('test "OpenFilerPanelOperation"', () => {
        it('should return false when the filter model is not found', () => {
            const spy = vi.spyOn(sheetsFilterPanelService, 'setupCol');
            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            })).toBeFalsy();
            expect(spy).not.toHaveBeenCalled();
        });

        it('should open the filter panel and setup the filter model on the specific column', () => {
            const spy = vi.spyOn(sheetsFilterPanelService, 'setupCol');
            expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
            } as ISetSheetsFilterRangeMutationParams)).toBeTruthy();
            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            })).toBeTruthy();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('test "CloseFilterPanelOperation"', () => {
        it('should return false when the filter panel is not activated', () => {
            const spy = vi.spyOn(sheetsFilterPanelService, 'terminate');
            contextService.setContextValue(FILTER_PANEL_OPENED_KEY, false);
            expect(commandService.syncExecuteCommand(CloseFilterPanelOperation.id)).toBeFalsy();
            expect(spy).not.toHaveBeenCalled();
        });

        it('should call sheets filter panel service to close the panel is activated', () => {
            const spy = vi.spyOn(sheetsFilterPanelService, 'terminate');
            contextService.setContextValue(FILTER_PANEL_OPENED_KEY, true);
            expect(commandService.syncExecuteCommand(CloseFilterPanelOperation.id)).toBeTruthy();
            expect(contextService.getContextValue(FILTER_PANEL_OPENED_KEY)).toBeFalsy();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
