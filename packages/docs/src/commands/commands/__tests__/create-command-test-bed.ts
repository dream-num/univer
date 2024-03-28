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

import type { IDocumentData } from '@univerjs/core';
import {
    BooleanNumber,
    ILogService,
    IUniverInstanceService,
    LogLevel,
    Plugin,
    PluginType,
    Univer,
} from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { DocViewModelManagerService } from '../../../services/doc-view-model-manager.service';
import { TextSelectionManagerService } from '../../../services/text-selection-manager.service';
import { DocStateChangeManagerService } from '../../../services/doc-state-change-manager.service';
import { IMEInputManagerService } from '../../../services/ime-input-manager.service';
import { ITextSelectionRenderManager, TextSelectionRenderManager } from './mock-text-selection-render-manager';

const TEST_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: 'What’s New in the 2022\r Gartner Hype Cycle for Emerging Technologies\r\n',
        textRuns: [
            {
                st: 0,
                ed: 22,
                ts: {
                    bl: BooleanNumber.FALSE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 23,
                ed: 68,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 22,
            },
            {
                startIndex: 68,
                paragraphStyle: {
                    spaceAbove: 20,
                    indentFirstLine: 20,
                },
            },
        ],
        sectionBreaks: [],
        customBlocks: [],
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

export function createCommandTestBed(workbookData?: IDocumentData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    /**
     * This plugin hooks into Doc's DI system to expose API to test scripts
     */
    class TestPlugin extends Plugin {
        static override type = PluginType.Univer;

        constructor(_config: undefined, @Inject(Injector) override readonly _injector: Injector) {
            super('test-plugin');
        }

        override onStarting(injector: Injector): void {
            injector.add([TextSelectionManagerService]);
            injector.add([DocViewModelManagerService]);
            injector.add([DocStateChangeManagerService]);
            injector.add([IMEInputManagerService]);
            injector.add([
                ITextSelectionRenderManager,
                {
                    useClass: TextSelectionRenderManager,
                },
            ]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);

    const doc = univer.createUniverDoc(workbookData || TEST_DOCUMENT_DATA_EN);
    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test-doc');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    return {
        univer,
        get,
        doc,
    };
}
