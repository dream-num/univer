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
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import {
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    RemoveSheetDrawingCommand,
    SetDrawingApplyMutation,
    SetSheetDrawingCommand,
} from '@univerjs/sheets-drawing';
import enUS from '@univerjs/sheets/locale/en-US';
import { vi } from 'vitest';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

export function createSheetsDrawingUiTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    const debounceRefreshControls = vi.fn();
    const renderManagerService = {
        getRenderById: () => ({
            scene: {
                getTransformer: () => ({
                    debounceRefreshControls,
                }),
                getObject: () => null,
            },
            with: <T>(token: T) => injector.get(token as never),
        }),
        getRenderUnitById: () => ({
            scene: {
                getTransformer: () => ({
                    debounceRefreshControls,
                }),
                getObject: () => null,
            },
            with: <T>(token: T) => injector.get(token as never),
        }),
    };
    const sheetSkeletonService = {
        getSkeleton: () => ({
            getOffsetRelativeToRowCol: (left: number, top: number) => ({
                row: Math.floor(top / 10),
                rowOffset: top % 10,
                column: Math.floor(left / 10),
                columnOffset: left % 10,
            }),
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
            this._injector.get(IUndoRedoService);

            ([
                [SheetInterceptorService],
                [IDrawingManagerService, { useClass: DrawingManagerService }],
                [ISheetDrawingService, { useClass: DrawingManagerService as never }],
                [IRenderManagerService, { useValue: renderManagerService as unknown as IRenderManagerService }],
                [SheetSkeletonService, { useValue: sheetSkeletonService as unknown as SheetSkeletonService }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

            dependencies?.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(workbookData ?? TEST_WORKBOOK_DATA)
    );

    get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    get(ILogService).setLogLevel(LogLevel.SILENT);
    get(LocaleService).load({ enUS });

    const commandService = get(ICommandService);
    [
        SetDrawingApplyMutation,
        InsertSheetDrawingCommand,
        RemoveSheetDrawingCommand,
        SetSheetDrawingCommand,
    ].forEach((command) => commandService.registerCommand(command));

    return {
        univer,
        injector,
        get,
        commandService,
        debounceRefreshControls,
    };
}
