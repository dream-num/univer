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

import type { Dependency, IWorkbookData, UnitModel } from '@univerjs/core';
import type { IMessageProps } from '@univerjs/design';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    DefinedNamesService,
    FormulaDataModel,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
    SuperTableService,
} from '@univerjs/engine-formula';
import {
    RefRangeService,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { SheetsHyperLinkResolverService } from '@univerjs/sheets-hyper-link-ui';
import { IMessageService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-hyper-link-ui/facade';

class TestMessageService {
    readonly messages: IMessageProps[] = [];

    show(options: IMessageProps): void {
        this.messages.push(options);
    }
}

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Workbook',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {},
                rowCount: 20,
                columnCount: 20,
            },
        },
    };
}

function createHyperLinkFacadeTestBed(workbookData: IWorkbookData, dependencies: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();

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
            const injector = this._injector;
            injector.add([SheetsSelectionsService]);
            injector.add([SheetInterceptorService]);
            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([SheetSkeletonService]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([RefRangeService]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([ISuperTableService, { useClass: SuperTableService }]);
            dependencies.forEach((dependency) => injector.add(dependency));

            this._injector.get(SheetInterceptorService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData);
    injector.get(IUniverInstanceService).focusUnit(sheet.getUnitId());
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get: injector.get.bind(injector),
        univerAPI: FUniver.newAPI(injector),
    };
}

describe('sheets-hyper-link-ui workbook facade', () => {
    let testBed: ReturnType<typeof createHyperLinkFacadeTestBed>;

    beforeEach(() => {
        const dependencies: Dependency[] = [
            [SheetsHyperLinkParserService],
            [SheetsHyperLinkResolverService],
            [IMessageService, { useClass: TestMessageService }],
        ];
        testBed = createHyperLinkFacadeTestBed(createWorkbookData(), dependencies);
        testBed.get(ICommandService).registerCommand(SetWorksheetActiveOperation);
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('navigates hyperlinks through the workbook facade API', async () => {
        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);

        workbook.navigateToSheetHyperlink('https://univer.ai');
        await Promise.resolve();

        expect(open).toHaveBeenCalledWith('https://univer.ai', '_blank', 'noopener noreferrer');
        open.mockRestore();
    });
});
