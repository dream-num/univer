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

import type { Dependency, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    LogLevel,
    Plugin,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { CellPopupManagerService, ISheetClipboardService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { AddCommentMutation, DeleteCommentMutation, IThreadCommentDataSourceService, ThreadCommentDataSourceService, ThreadCommentModel } from '@univerjs/thread-comment';
import { vi } from 'vitest';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1', 'sheet2'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
        sheet2: {
            id: 'sheet2',
            name: 'Sheet2',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

export function createThreadCommentUiTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    let clipboardHook: {
        onBeforeCopy: (unitId: string, subUnitId: string, range: ISelectionWithStyle['range']) => void;
        onPasteCells: (...args: any[]) => { redos: Array<{ id: string; params: unknown }>; undos: Array<{ id: string; params: unknown }> };
    } | undefined;

    const popupDisposable = {
        dispose: vi.fn(),
    };
    const cellPopupManagerService = {
        showPopup: vi.fn(() => popupDisposable),
    };
    const sheetClipboardService = {
        addClipboardHook: vi.fn((hook) => {
            clipboardHook = hook;
            return {
                dispose: vi.fn(),
            };
        }),
    };

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }],
                [ThreadCommentModel],
                [SheetsThreadCommentModel],
                [ISheetClipboardService, { useValue: sheetClipboardService as unknown as ISheetClipboardService }],
                [CellPopupManagerService, { useValue: cellPopupManagerService as unknown as CellPopupManagerService }],
                [SheetCanvasPopManagerService, { useValue: {} as SheetCanvasPopManagerService }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

            dependencies?.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(workbookData ?? TEST_WORKBOOK_DATA)
    );

    get(ILogService).setLogLevel(LogLevel.SILENT);
    get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    get(LifecycleService).stage = LifecycleStages.Rendered;
    get(ICommandService).registerCommand(AddCommentMutation);
    get(ICommandService).registerCommand(DeleteCommentMutation);

    return {
        univer,
        injector,
        get,
        workbook,
        commandService: get(ICommandService),
        cellPopupManagerService,
        popupDisposable,
        getClipboardHook: () => clipboardHook,
    };
}
