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

import { CellValueType, LocaleType, LogLevel, Univer, UserManagerService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDocsMentionUIPlugin } from '@univerjs/docs-mention-ui';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { enUS, faIR, frFR, ruRU, viVN, zhCN, zhTW } from '../locales';
import '@univerjs/sheets/facade';
import '@univerjs/ui/facade';
import '@univerjs/docs-ui/facade';
import '@univerjs/sheets-ui/facade';
import '@univerjs/sheets-data-validation/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets-filter/facade';
import '@univerjs/sheets-formula/facade';
import '@univerjs/sheets-numfmt/facade';
import '@univerjs/sheets-hyper-link-ui/facade';
import '@univerjs/sheets-thread-comment/facade';
import '@univerjs/sheets-conditional-formatting/facade';
import '@univerjs/sheets-find-replace/facade';
import '@univerjs/sheets-drawing-ui/facade';
import '@univerjs/sheets-zen-editor/facade';
import '@univerjs/sheets-crosshair-highlight/facade';
import '@univerjs/sheets-sort/facade';

import '../global.css';
import './styles';

const LOAD_LAZY_PLUGINS_TIMEOUT = 100;
const LOAD_VERY_LAZY_PLUGINS_TIMEOUT = 1_000;

export const mockUser = {
    userID: 'Owner_qxVnhPbQ',
    name: 'Owner',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};

    // univer
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
        [LocaleType.FR_FR]: frFR,
        [LocaleType.RU_RU]: ruRU,
        [LocaleType.ZH_TW]: zhTW,
        [LocaleType.VI_VN]: viVN,
        [LocaleType.FA_IR]: faIR,
    },
    logLevel: LogLevel.VERBOSE,
});

univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, { container: 'app' });
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverDocsDrawingUIPlugin);
univer.registerPlugin(UniverDocsMentionUIPlugin);

univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsUIPlugin);
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverSheetsZenEditorPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
univer.registerPlugin(UniverSheetsFormulaPlugin);
univer.registerPlugin(UniverSheetsFormulaUIPlugin);
univer.registerPlugin(UniverSheetsDataValidationPlugin);
univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
univer.registerPlugin(UniverSheetsFilterPlugin);
univer.registerPlugin(UniverSheetsSortPlugin);
univer.registerPlugin(UniverSheetsHyperLinkPlugin);
univer.registerPlugin(UniverThreadCommentUIPlugin);
univer.registerPlugin(UniverSheetsThreadCommentPlugin);
univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);

const injector = univer.__getInjector();
const userManagerService = injector.get(UserManagerService);
userManagerService.setCurrentUser(mockUser);

setTimeout(() => {
    import('./lazy').then((lazy) => {
        const plugins = lazy.default();
        plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
    });
}, LOAD_LAZY_PLUGINS_TIMEOUT);

setTimeout(() => {
    import('./very-lazy').then((lazy) => {
        const plugins = lazy.default();
        plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
    });
}, LOAD_VERY_LAZY_PLUGINS_TIMEOUT);

univer.onDispose(() => {
    window.univer = undefined;
    window.univerAPI = undefined;
});

window.univer = univer;
window.univerAPI = FUniver.newAPI(univer);

const univerAPI = window.univerAPI;

univerAPI.createWorkbook({
    id: 'workbook1',
    sheetOrder: ['sheet-01'],
    resources: [
    ],
    sheets: {
        'sheet-01': {
            id: 'sheet-01',
            name: 'Sheet 01',
            rowCount: 20,
            columnCount: 40,
            cellData: {
                0: {
                    1: { t: CellValueType.NUMBER, v: 10 },
                },
                5: {
                    0: {
                    },
                },
            },
        },
        'sheet-02': {
            id: 'sheet-02',
            name: 'foobar',
            rowCount: 20,
            columnCount: 40,
            cellData: {
                5: {
                    0: {
                    },
                },
            },
        },
    },
});

univerAPI.createWorkbook(
    {
        id: 'workbook2',
        sheetOrder: ['sheet-01'],
        sheets: {
            'sheet-01': {
                id: 'sheet-01',
                name: 'Sheet 01',
                rowCount: 20,
                columnCount: 40,
                cellData: {
                    0: {
                        0: { v: 1 },
                        1: { v: 2 },
                    },
                    1: {
                        0: { v: 3 },
                        1: { v: 4 },
                    },
                    5: {
                        0: {
                        },
                    },
                },
            },
            'sheet-02': {
                id: 'sheet-02',
                name: 'foobar',
                rowCount: 20,
                columnCount: 40,
                cellData: {
                    5: {
                        0: {
                        },
                    },
                },
            },
        },
    },
    {
        makeCurrent: false,
    }
);

univerAPI.createWorkbook({
    id: 'workbook3',
    sheetOrder: ['sheet-01'],
    sheets: {
        'sheet-01': {
            id: 'sheet-01',
            name: 'Sheet 01',
            rowCount: 20,
            columnCount: 40,
            cellData: {
                0: {
                    0: { v: 1 },
                    1: { v: 2 },
                },
                1: {
                    0: { v: 3 },
                    1: { v: 4 },
                },
                5: {
                    0: {
                        f: "='[workbook1]Sheet 01'!A5 * '[workbook2]Sheet 01'!A5 * '[workbook3]Sheet 01'!A5* '[workbook4]Sheet 01'!A5",
                    },
                },
            },
        },
        'sheet-02': {
            id: 'sheet-02',
            name: 'foobar',
            rowCount: 20,
            columnCount: 40,
            cellData: {
                5: {
                    0: {
                    },
                },
            },
        },
    },
});

univerAPI.createWorkbook({
    id: 'workbook4',
    sheetOrder: ['sheet-01'],
    sheets: {
        'sheet-01': {
            id: 'sheet-01',
            name: 'Sheet 01',
            rowCount: 20,
            columnCount: 40,
            cellData: {
                0: {
                    0: { v: 1 },
                    1: { v: 2 },
                },
                1: {
                    0: { v: 3 },
                    1: { v: 4 },
                },
                5: {
                    0: {
                        f: "='[workbook1]Sheet 01'!A5 * '[workbook2]Sheet 01'!A5 * '[workbook3]Sheet 01'!A5* '[workbook4]Sheet 01'!A5",
                    },
                },
            },
        },
        'sheet-02': {
            id: 'sheet-02',
            name: 'foobar',
            rowCount: 20,
            columnCount: 40,
            cellData: {
                5: {
                    0: {
                    },
                },
            },
        },
    },
});

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: ReturnType<typeof FUniver.newAPI>;
    }
}
