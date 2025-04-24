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

import type { Meta } from '@storybook/react';
import type { IWorkbookData } from '@univerjs/core';
import type {
    ISetSelectionsOperationParams,
} from '@univerjs/sheets';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    registerDependencies,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import {
    IConfirmService,
    IShortcutService,
    IUIPartsService,
    RediContext,
    ShortcutService,
    TestConfirmService,
    UIPartsService,
} from '@univerjs/ui';
import React, { useState } from 'react';
import { SortRangeCustomCommand } from '../commands/commands/sheets-sort.command';
import enUS from '../locale/en-US';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';
import { CustomSortPanel } from './CustomSortPanel';

const meta: Meta<typeof CustomSortPanel> = {
    title: 'CustomSortPanel',
    component: CustomSortPanel,
    tags: ['autodocs'],
};

export default meta;

function createSortStorybookBed(workbookData: IWorkbookData, locale: LocaleType = LocaleType.EN_US) {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: enUS,
        },
    });

    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'test-plugin';

        constructor(
            _config: unknown,
            @Inject(Injector) protected readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            registerDependencies(this._injector, [
                [IShortcutService, { useClass: ShortcutService }],
                [IUIPartsService, { useClass: UIPartsService }],
                [SheetsSortUIService],
                [IConfirmService, { useClass: TestConfirmService }],
            ]);

            const commandService = this._injector.get(ICommandService);
            [
                SortRangeCustomCommand,
            ].forEach((command) => commandService.registerCommand(command));
        }

        override onReady(): void {
            const commandService = this._injector.get(ICommandService);
            commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet-01',
                selections: [{
                    range: { endRow: 2, startColumn: 0, endColumn: 0, startRow: 0 },
                    primary: { endRow: 0, startColumn: 0, endColumn: 0, startRow: 0, actualColumn: 0, actualRow: 0, isMerged: false, isMergedMainCell: false },
                }],
            } as ISetSelectionsOperationParams);
            commandService.executeCommand(SortRangeCustomCommand.id);
        }
    }

    univer.registerPlugin(UniverSheetsSortPlugin);
    univer.registerPlugin(TestPlugin);

    injector.get(LocaleService).setLocale(locale);
    // injector.get(LocaleService).load({ enUS, zhCN, ruRU });
    injector.get(ILogService).setLogLevel(LogLevel.VERBOSE);

    const sheet = univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData);

    //

    return { univer, injector, sheet };
}

export const Demo = {
    render() {
        const [bed] = useState(() => createSortStorybookBed(createSortSnapshot()));
        const { injector } = bed;

        return (
            <RediContext.Provider value={{ injector }}>
                <div className="univer-w-[640px]">
                    <CustomSortPanel />
                </div>
            </RediContext.Provider>
        );
    },
};

function createSortSnapshot(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '',
        name: 'Sort Storybook',
        locale: LocaleType.EN_US,
        sheetOrder: ['sheet-01'],
        styles: {},
        sheets: {
            'sheet-01': {
                name: 'Sheet 1',
                id: 'sheet-01',
                cellData: {
                    0: {
                        0: { v: 1 },
                    },
                    1: {
                        0: { v: 2 },
                    },
                    2: {
                        0: { v: 3 },
                    },
                },
            },
        },
    };
}
