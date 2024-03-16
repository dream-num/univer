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

import React, { useState } from 'react';
import type { Meta } from '@storybook/react';
import { RediContext } from '@wendellhu/redi/react-bindings';
import type { Injector } from '@wendellhu/redi';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import type { IWorkbookData } from '@univerjs/core';
import { CustomFilterOperator, ICommandService, ILogService, LocaleService, LocaleType, LogLevel, Plugin, PluginType, Univer } from '@univerjs/core';
import { SelectionManagerService, SheetInterceptorService, SheetPermissionService } from '@univerjs/sheets';
import { DesktopMenuService, DesktopShortcutService, IMenuService, IShortcutService } from '@univerjs/ui';
import { SheetsFilterPanelService } from '../../services/sheets-filter-panel.service';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterConditionsCommand, SetSheetsFilterCriteriaCommand, SmartToggleSheetsFilterCommand } from '../../commands/sheets-filter.command';
import type { IOpenFilterPanelOperationParams } from '../../commands/sheets-filter.operation';
import { ChangeFilterByOperation, CloseFilterPanelOperation, OpenFilterPanelOperation } from '../../commands/sheets-filter.operation';
import zhCN from '../../locale/zh-CN';
import { FilterPanel } from './SheetsFilterPanel';

const meta: Meta<typeof FilterPanel> = {
    title: 'Components / FilterPanel',
    component: FilterPanel,
    tags: ['autodocs'],
};

export default meta;

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
            autoFilter: {
                ref: { startColumn: 0, startRow: 0, endColumn: 5, endRow: 5 },
                filterColumns: [
                    {
                        colId: 0,
                        customFilters: {
                            customFilters: [{ val: '123', operator: CustomFilterOperator.GREATER_THAN }],
                        },
                    },
                ],
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

function createStorybookBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    const commandService = get(ICommandService);

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
            injector.add([SheetsFilterPanelService]);

            [
                SmartToggleSheetsFilterCommand,
                SetSheetsFilterCriteriaCommand,
                ClearSheetsFilterCriteriaCommand,
                ReCalcSheetsFilterConditionsCommand,
                OpenFilterPanelOperation,
                CloseFilterPanelOperation,
                ChangeFilterByOperation,
            ].forEach((command) => commandService.registerCommand(command));
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);

    injector.get(LocaleService).setLocale(LocaleType.ZH_CN);
    injector.get(LocaleService).load({ zhCN });
    injector.get(ILogService).setLogLevel(LogLevel.VERBOSE);

    const sheet = univer.createUniverSheet(TEST_WORKBOOK_DATA_DEMO);

    commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
        unitId: 'test',
        subUnitId: 'sheet1',
        col: 0,
    } as IOpenFilterPanelOperationParams);

    return { univer, injector, sheet };
}

export const FilterPanelBasic = {
    render() {
        const [bed] = useState(() => createStorybookBed());
        const { injector } = bed;

        return (
            <RediContext.Provider value={{ injector }}>
                <FilterPanel />
            </RediContext.Provider>
        );
    },
};
