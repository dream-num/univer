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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import { AuthzIoLocalService, DisposableCollection, IAuthzIoService, ICommandService, Inject, Injector, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { ActiveDirtyManagerService, IActiveDirtyManagerService, ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import { ExclusiveRangeService, IExclusiveRangeService, RangeProtectionRuleModel, RefRangeService, SetWorksheetActiveOperation, SheetInterceptorService, SheetsSelectionsService, WorkbookPermissionService, WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter/commands/commands/sheets-filter.command.js';
import { IMenuManagerService, IPlatformService, IShortcutService, MenuManagerService, PlatformService, ShortcutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CloseFilterPanelOperation, OpenFilterPanelOperation } from '../../commands/operations/sheets-filter.operation';
import { ClearFilterCriteriaMenuItemFactory, ReCalcFilterMenuItemFactory, SmartToggleFilterMenuItemFactory } from '../sheets-filter.menu';

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
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'test-plugin';

        constructor(
            _config: unknown,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([IPlatformService, { useClass: PlatformService }]);
            injector.add([RefRangeService]);
            injector.add([SheetsSelectionsService]);
            injector.add([IShortcutService, { useClass: ShortcutService }]);
            injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([WorkbookPermissionService]);
            injector.add([IAuthzIoService, { useClass: AuthzIoLocalService }]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([SheetInterceptorService]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService, deps: [SheetsSelectionsService] }]);
            injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
            injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);

            const commandService = injector.get(ICommandService);
            [
                SmartToggleSheetsFilterCommand,
                ClearSheetsFilterCriteriaCommand,
                ReCalcSheetsFilterCommand,
                OpenFilterPanelOperation,
                CloseFilterPanelOperation,
            ].forEach((command) => commandService.registerCommand(command));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);

    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, TEST_WORKBOOK_DATA_DEMO);

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
        commandService.registerCommand(SetWorksheetActiveOperation);

        // Active sheet, prevent activeSheet from being initialized to null, causing activeFilterModel$ to also transmit null.
        expect(commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'sheet1' })).toBeTruthy();
    });

    afterEach(() => {
        univer.dispose();

        disposableCollection.dispose();
    });

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

        const menuItem = get(Injector).invoke(ClearFilterCriteriaMenuItemFactory);
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
