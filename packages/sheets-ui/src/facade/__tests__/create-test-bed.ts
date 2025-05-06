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
import type { IRender } from '@univerjs/engine-render';
import {
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    set,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { Engine, IRenderingEngine, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';

import {
    SheetInterceptorService,
} from '@univerjs/sheets';

import '../f-sheet-hooks';

function getTestWorkbookDataDemo(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        3: {
                            f: '=SUM(A1)',
                            si: '3e4r5t',
                        },
                    },
                    1: {
                        3: {
                            f: '=SUM(A2)',
                            si: 'OSPtzm',
                        },
                    },
                    2: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                    3: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
        resources: [
            {
                name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
                data: '{"sheet-0011":[{"cfId":"AEGZdW8C","ranges":[{"startRow":2,"startColumn":1,"endRow":11,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false},{"cfId":"4ICEXdJj","ranges":[{"startRow":2,"startColumn":1,"endRow":11,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false},{"cfId":"geCv018z","ranges":[{"startRow":2,"startColumn":1,"endRow":11,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false}]}',
            },
        ],
    };
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: UnitModel<IWorkbookData>;
    univerAPI: FUniver;
    injector: Injector;
}

class RenderManagerServiceTestBed extends RenderManagerService {
    override createRender(unitId: string): IRender {
        const renderer = this._createRender(unitId, new Engine(unitId, {
            elementWidth: 100,
            elementHeight: 100,
        }));
        return renderer;
    }
}

export function createFacadeTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
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
            injector.add([SheetInterceptorService]);
            injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerServiceTestBed }]);
            injector.add([LexerTreeBuilder]);

            dependencies?.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
        }
    }

    // load theme service
    const themeService = injector.get(ThemeService);
    const theme = themeService.getCurrentTheme();
    const newTheme = set(theme, 'black', '#35322b');
    themeService.setTheme(newTheme);

    // register builtin plugins
    // note that UI plugins are not registered here, because the unit test environment does not have a UI
    univer.registerPlugin(TestPlugin);

    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData || getTestWorkbookDataDemo());
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    // set log level
    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // NOTE: change this to `LogLevel.VERBOSE` to debug tests via logs

    // init data validation
    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
        univerAPI,
        injector,
    };
}
