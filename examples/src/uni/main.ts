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

import { Injector, LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { DocUIController, UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_DOCUMENT_DATA_CN, DEFAULT_DOCUMENT_DATA_EN, DEFAULT_SLIDE_DATA, DEFAULT_WORKBOOK_DATA_DEMO, DEFAULT_WORKBOOK_DATA_DEMO1 } from '@univerjs/mockdata';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { SheetUIController, UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSlidesPlugin } from '@univerjs/slides';
import { SlidesUIController, UniverSlidesUIPlugin } from '@univerjs/slides-ui';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniDocsUIController } from '@univerjs/uni-docs-ui';
import { UniverDocUniFormulaPlugin } from '@univerjs/uni-formula';
import { UniSheetsUIController } from '@univerjs/uni-sheets-ui';
import { UniSlidesUIController } from '@univerjs/uni-slides-ui';
import { UniverUniUIPlugin } from '@univerjs/uniui';
import { enUS, faIR } from '../locales';

import '../global.css';

const LOAD_LAZY_PLUGINS_TIMEOUT = 4_000;

// univer
const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: enUS,
        [LocaleType.FA_IR]: faIR,
    },
    logLevel: LogLevel.VERBOSE,
});

registerBasicPlugins(univer);
registerSheetPlugins(univer);
registerSlidePlugins(univer);
registerUniPlugins(univer);

// create univer instances
univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_EN);
univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO1);

// debugger plugin
univer.registerPlugin(UniverDebuggerPlugin);

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: ReturnType<typeof FUniver.newAPI>;
    }
}

setTimeout(() => {
    import('./lazy').then((lazy) => {
        const plugins = lazy.default();
        plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));

        univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_CN);
        univer.createUnit(UniverInstanceType.UNIVER_SLIDE, DEFAULT_SLIDE_DATA);
    });
}, LOAD_LAZY_PLUGINS_TIMEOUT);

window.univer = univer;
window.univerAPI = FUniver.newAPI(univer);

function registerBasicPlugins(univer: Univer) {
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverFormulaEnginePlugin, {
        notExecuteFormula: true,
    });
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverUniUIPlugin, {
        container: 'app',
    });

    univer.registerPlugin(UniverDocsUIPlugin, {
        override: [
            [DocUIController, {
                useFactory: (injector) => {
                    injector.createInstance(UniDocsUIController, {});
                },
                deps: [Injector],
            }],
        ],
    });

    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    univer.registerPlugin(UniverRPCMainThreadPlugin, { workerURL: worker });
    univer.onDispose(() => worker.terminate());

    univer.registerPlugin(UniverThreadCommentUIPlugin);

    univer.registerPlugin(UniverDocsDrawingUIPlugin);
}

function registerSheetPlugins(univer: Univer) {
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsUIPlugin, {
        override: [
            [SheetUIController, {
                useFactory: (injector) => {
                    injector.createInstance(UniSheetsUIController, {});
                },
                deps: [Injector],
            }],
        ],
    });
    univer.registerPlugin(UniverSheetsNumfmtPlugin);
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    univer.registerPlugin(UniverSheetsFindReplacePlugin);
    univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);
    univer.registerPlugin(UniverSheetsSortUIPlugin);
    univer.registerPlugin(UniverSheetsThreadCommentPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);
    univer.registerPlugin(UniverSheetsDrawingUIPlugin);
}

function registerSlidePlugins(univer: Univer) {
    univer.registerPlugin(UniverSlidesPlugin);
    univer.registerPlugin(UniverSlidesUIPlugin, {
        override: [
            [SlidesUIController, {
                useClass: UniSlidesUIController,
            }],
        ],
    });
}

function registerUniPlugins(univer: Univer) {
    univer.registerPlugin(UniverDocUniFormulaPlugin);
}
