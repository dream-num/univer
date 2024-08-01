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

import type { Dependency, DocumentDataModel, IDocumentData } from '@univerjs/core';
import {
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import enUS from '@univerjs/sheets-formula/locale/en-US';
import zhCN from '@univerjs/sheets-formula/locale/zh-CN';
import { DocSkeletonManagerService, DocStateChangeManagerService, IMEInputManagerService, TextSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService, ITextSelectionRenderManager, RenderManagerService, TextSelectionRenderManager } from '@univerjs/engine-render';
import { DocsRenderService } from '@univerjs/docs-ui';

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
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([TextSelectionManagerService]);
            injector.add([DocStateChangeManagerService]);
            injector.add([IMEInputManagerService]);
            injector.add([DocsRenderService]);
            injector.add([ITextSelectionRenderManager, { useClass: TextSelectionRenderManager }]);

            dependencies?.forEach((d) => injector.add(d));

            const renderManagerService = injector.get(IRenderManagerService);
            renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_DOC, [DocSkeletonManagerService] as Dependency);
        }
    }

    injector.get(LocaleService).load({ zhCN, enUS });

    univer.registerPlugin(TestPlugin);
    const doc = univer.createUniverDoc(documentConfig || getTestDocumentDataDemo());

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT);

    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        doc,
        univerAPI,
    };
}
