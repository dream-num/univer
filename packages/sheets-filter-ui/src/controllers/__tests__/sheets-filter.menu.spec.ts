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

import type { IRange, IWorkbookData } from '@univerjs/core';
import { DisposableCollection, ICommandService, LocaleType, Plugin, PluginType, RANGE_TYPE, Univer } from '@univerjs/core';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService, SheetInterceptorService, SheetPermissionService } from '@univerjs/sheets';
import type { ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import { RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { DesktopMenuService, DesktopShortcutService, IMenuService, IShortcutService } from '@univerjs/ui';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterConditionsCommand, SmartToggleSheetsFilterCommand } from '../../commands/sheets-filter.command';
import { CloseFilterPanelOperation, OpenFilterPanelOperation } from '../../commands/sheets-filter.operation';
import { ClearFilterConditionsMenuItemFactory, ReCalcFilterMenuItemFactory, SmartToggleFilterMenuItemFactory } from '../sheets-filter.menu';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
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
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

function createSheetsFilterMenuTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(_config: unknown, override readonly _injector: Injector) {
            super('test-plugin');
        }

        override onStarting(injector: Injector): void {
            injector.add([SelectionManagerService]);
            injector.add([IShortcutService, { useClass: DesktopShortcutService }]);
            injector.add([IMenuService, { useClass: DesktopMenuService }]);
            injector.add([SheetPermissionService]);
            injector.add([SheetInterceptorService]);

            const commandService = injector.get(ICommandService);
            [
                SmartToggleSheetsFilterCommand,
                ClearSheetsFilterCriteriaCommand,
                ReCalcSheetsFilterConditionsCommand,
                OpenFilterPanelOperation,
                CloseFilterPanelOperation,
            ].forEach((command) => commandService.registerCommand(command));
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);

    const sheet = univer.createUniverSheet(TEST_WORKBOOK_DATA_DEMO);

    return { univer, get, sheet };
}

describe('test sheet filter menu items', () => {
    let univer: Univer;
    let get: Injector['get'];

    let disposableCollection: DisposableCollection;

    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createSheetsFilterMenuTestBed();

        univer = testBed.univer;
        get = testBed.get;

        disposableCollection = new DisposableCollection();

        commandService = get(ICommandService);
    });

    afterEach(() => {
        univer.dispose();

        disposableCollection.dispose();
    });

    function select(range: IRange) {
        const selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        const { startColumn, startRow, endColumn, endRow } = range;
        selectionManager.add([
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

    it('should "SmartToggleSheetsFilterMenu" change status correctly', () => {
        let activated = false;

        const menuItem = get(Injector).invoke(SmartToggleFilterMenuItemFactory);
        disposableCollection.add(menuItem.activated$!.subscribe((value) => (activated = value)));
        expect(activated).toBeFalsy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
        } as ISetSheetsFilterRangeMutationParams)).toBeTruthy();
        expect(activated).toBeTruthy();

        expect(commandService.syncExecuteCommand(RemoveSheetsFilterMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBeTruthy();
        expect(activated).toBeFalsy();
    });

    it('should "ClearSheetsFilterCriteriaCommand" be enabled when there is filter criteria', () => {
        let disabled = false;

        const menuItem = get(Injector).invoke(ClearFilterConditionsMenuItemFactory);
        disposableCollection.add(menuItem.disabled$!.subscribe((value) => (disabled = value)));
        expect(disabled).toBeTruthy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
        } as ISetSheetsFilterRangeMutationParams)).toBeTruthy();
        expect(disabled).toBeTruthy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            col: 0,
            criteria: {
                colId: 0,
                filters: ['123'],
            },
        } as ISetSheetsFilterCriteriaMutationParams)).toBeTruthy();
        expect(disabled).toBeFalsy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            col: 0,
            criteria: null,
        } as ISetSheetsFilterCriteriaMutationParams)).toBeTruthy();
        expect(disabled).toBeTruthy();
    });

    it('should "ReCalcFilterMenuItemFactory" be enabled when there is filter criteria', () => {
        let disabled = false;

        const menuItem = get(Injector).invoke(ReCalcFilterMenuItemFactory);
        disposableCollection.add(menuItem.disabled$!.subscribe((value) => (disabled = value)));
        expect(disabled).toBeTruthy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 },
        } as ISetSheetsFilterRangeMutationParams)).toBeTruthy();
        expect(disabled).toBeTruthy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            col: 0,
            criteria: {
                colId: 0,
                filters: ['123'],
            },
        } as ISetSheetsFilterCriteriaMutationParams)).toBeTruthy();
        expect(disabled).toBeFalsy();

        expect(commandService.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            col: 0,
            criteria: null,
        } as ISetSheetsFilterCriteriaMutationParams)).toBeTruthy();
        expect(disabled).toBeTruthy();
    });
});
