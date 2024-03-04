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

import { ICommandService, LocaleType, Plugin, PluginType, Univer } from '@univerjs/core';
import { IContextService, type IWorkbookData } from '@univerjs/core';
import type { ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import { SetSheetsFilterRangeMutation, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetInterceptorService } from '@univerjs/sheets';
import { CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../sheets-filter.operation';
import { SheetsFilterPanelService } from '../../services/sheets-filter-panel.service';

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
        static override type = PluginType.Sheet;

        constructor(_config: unknown, @Inject(Injector) protected readonly _injector: Injector) {
            super('sheets-filter-operation-test');
        }

        override onStarting(injector: Injector): void {
            ([
                [SheetInterceptorService],
                [SheetsFilterPanelService],
            ] as Dependency[]).forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(SheetsFilterOperationTestPlugin);

    univer.createUniverSheet(testWorkbookDataFactory());

    const commandService = get(ICommandService);

    [
        OpenFilterPanelOperation,
        CloseFilterPanelOperation,
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
