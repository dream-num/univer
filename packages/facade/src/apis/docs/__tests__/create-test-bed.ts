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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import {
    ILogService,
    IUniverInstanceService,
    LocaleService,
    LogLevel,
    Plugin,
    Univer,
} from '@univerjs/core';
import enUS from '@univerjs/sheets-formula/locale/en-US';
import zhCN from '@univerjs/sheets-formula/locale/zh-CN';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { DocStateChangeManagerService, DocViewModelManagerService, IMEInputManagerService, TextSelectionManagerService } from '@univerjs/docs';

import { IRenderManagerService, ITextSelectionRenderManager, RenderManagerService, TextSelectionRenderManager } from '@univerjs/engine-render';
import { FUniver } from '../../facade';

function getTestDocumentDataDemo(): IDocumentData {
    return {
        id: 'test',
        body: {
            dataStream: 'Hello,\r\n',
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    doc: DocumentDataModel;
    univerAPI: FUniver;
}

export function createTestBed(documentConfig?: IDocumentData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();

            this._injector = _injector;
        }

        override onStarting(injector: Injector): void {
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([TextSelectionManagerService]);
            injector.add([DocViewModelManagerService]);
            injector.add([DocStateChangeManagerService]);
            injector.add([IMEInputManagerService]);
            injector.add([ITextSelectionRenderManager, { useClass: TextSelectionRenderManager }]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    injector.get(LocaleService).load({ zhCN, enUS });

    univer.registerPlugin(TestPlugin);
    const doc = univer.createUniverDoc(documentConfig || getTestDocumentDataDemo());

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        doc,
        univerAPI,
    };
}
