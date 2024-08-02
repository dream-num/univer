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

import type { Nullable } from '@univerjs/core';
import { Injector, LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { SheetUIController, UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniSheetsUIController } from '@univerjs/uni-sheets-ui';
import { UniverUniUIPlugin } from '@univerjs/uniui';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { FUniver } from '@univerjs/facade';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
import type { IThreadCommentMentionDataSource } from '@univerjs/thread-comment-ui';
import { IThreadCommentMentionDataService, UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';
import type { IUniverRPCMainThreadConfig } from '@univerjs/rpc';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { UniverDocUniFormulaPlugin } from '@univerjs/uni-formula';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniSlidesUIController } from '@univerjs/uni-slides-ui';
import { UniverSlidesPlugin } from '@univerjs/slides';
import { SlidesUIController, UniverSlidesUIPlugin } from '@univerjs/slides-ui';
import { DEFAULT_DOCUMENT_DATA_CN, DEFAULT_DOCUMENT_DATA_EN, DEFAULT_SLIDE_DATA, DEFAULT_WORKBOOK_DATA_DEMO1 } from '../data';
import { enUS } from '../locales';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '../data/sheets/demo/default-workbook-data-demo';

/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

const LOAD_LAZY_PLUGINS_TIMEOUT = 1_000;

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: enUS,
    },
    logLevel: LogLevel.VERBOSE,
});

registerBasicPlugins(univer);
registerSheetPlugins(univer);
registerSlidePlugins(univer);
registerUniPlugins(univer);

const mockUser = {
    userID: 'Owner_qxVnhPbQ',
    name: 'Owner',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};

class CustomMentionDataService implements IThreadCommentMentionDataService {
    dataSource: Nullable<IThreadCommentMentionDataSource>;
    trigger: string = '@';

    async getMentions() {
        return [
            {
                id: mockUser.userID,
                label: mockUser.name,
                type: 'user',
                icon: mockUser.avatar,
            },
            {
                id: '2',
                label: 'User2',
                type: 'user',
                icon: mockUser.avatar,
            },
        ];
    }
}

// create univer instances
if (!IS_E2E) {
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_EN);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO1);
    univer.createUnit(UniverInstanceType.UNIVER_SLIDE, DEFAULT_SLIDE_DATA);
}

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
    });
}, LOAD_LAZY_PLUGINS_TIMEOUT);

window.univer = univer;
window.univerAPI = FUniver.newAPI(univer);

function registerBasicPlugins(univer: Univer) {
    univer.registerPlugin(UniverDocsPlugin, {
        hasScroll: false,
    });
    univer.registerPlugin(UniverFormulaEnginePlugin, {
        notExecuteFormula: true,
    });
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverUniUIPlugin, {
        container: 'app',
    });

    univer.registerPlugin(UniverDocsUIPlugin);

    univer.registerPlugin(UniverRPCMainThreadPlugin, {
        workerURL: './worker.js',
    } as IUniverRPCMainThreadConfig);
    univer.registerPlugin(UniverThreadCommentUIPlugin, {
        overrides: [[IThreadCommentMentionDataService, { useClass: CustomMentionDataService }]],
    });

    univer.registerPlugin(UniverDocsDrawingUIPlugin);
}

function registerSheetPlugins(univer: Univer) {
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsUIPlugin, {
        override: [
            [SheetUIController, {
                useFactory: (injector) => {
                    injector.createInstance(UniSheetsUIController, {});
                }, deps: [Injector],
            }],
        ],
    });
    univer.registerPlugin(UniverSheetsNumfmtPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
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
