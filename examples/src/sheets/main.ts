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

import { ILogService, LocaleType, LogLevel, Univer, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDocsMentionUIPlugin } from '@univerjs/docs-mention-ui';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
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
import { UniverSheetsBindingSourcePlugin } from '@univerjs/sheets-source-binding';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { enUS, faIR, frFR, ruRU, viVN, zhCN, zhTW } from '../locales';

import { UniverSheetsCustomMenuPlugin } from './custom-menu';

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
import '@univerjs/sheets-source-binding/facade';
import '@univerjs/sheets-crosshair-highlight/facade';
import '@univerjs/sheets-sort/facade';

import '../global.css';
import './styles';

/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

const LOAD_LAZY_PLUGINS_TIMEOUT = 100;
const LOAD_VERY_LAZY_PLUGINS_TIMEOUT = 1_000;

export const mockUser = {
    userID: 'Owner_qxVnhPbQ',
    name: 'Owner',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};

// eslint-disable-next-line max-lines-per-function
function createNewInstance() {
    // univer
    const univer = new Univer({
        theme: defaultTheme,
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

    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    univer.registerPlugin(UniverRPCMainThreadPlugin, { workerURL: worker });

    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverRenderEnginePlugin);
    univer.registerPlugin(UniverUIPlugin, { container: 'app' });
    univer.registerPlugin(UniverDocsUIPlugin);
    univer.registerPlugin(UniverDocsDrawingUIPlugin);
    univer.registerPlugin(UniverDocsMentionUIPlugin);

    univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
    univer.registerPlugin(UniverSheetsUIPlugin);
    univer.registerPlugin(UniverSheetsNumfmtPlugin);
    univer.registerPlugin(UniverSheetsZenEditorPlugin);
    univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: true });
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin, { notExecuteFormula: true });
    univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    univer.registerPlugin(UniverSheetsDataValidationPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(UniverSheetsSortPlugin);
    univer.registerPlugin(UniverSheetsHyperLinkPlugin);
    univer.registerPlugin(UniverThreadCommentUIPlugin);
    univer.registerPlugin(UniverSheetsThreadCommentPlugin);
    univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);
    univer.registerPlugin(UniverSheetsBindingSourcePlugin);
    univer.registerPlugin(UniverSheetsCustomMenuPlugin);

    // If we are running in e2e platform, we should immediately register the debugger plugin.
    if (IS_E2E) {
        univer.registerPlugin(UniverDebuggerPlugin);
    }

    const injector = univer.__getInjector();
    const userManagerService = injector.get(UserManagerService);
    userManagerService.setCurrentUser(mockUser);

    // create univer sheet instance
    if (!IS_E2E) {
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'x-9NAO3P65qwrPT2dR_',
            rev: 1,
            name: 'money-manager-2',
            sheetOrder: [
                'uni1',
            ],
            appVersion: '16.0300',
            locale: 'enUS',
            sheets: {
                uni1: {
                    id: 'uni1',
                    name: 'Sheet1',
                    rowCount: 31,
                    columnCount: 10,
                    status: 1,
                    rowData: {
                        2: {
                            h: 20,
                        },
                        3: {
                            h: 20,
                        },
                        4: {
                            h: 20,
                        },
                        5: {
                            h: 20,
                        },
                        6: {
                            h: 20,
                        },
                        7: {
                            h: 20,
                        },
                        8: {
                            h: 20,
                        },
                        9: {
                            h: 20,
                        },
                        10: {
                            h: 20,
                        },
                        11: {
                            h: 20,
                        },
                        12: {
                            h: 20,
                        },
                        13: {
                            h: 20,
                        },
                        14: {
                            h: 20,
                        },
                        15: {
                            h: 21,
                        },
                        16: {
                            h: 22,
                        },
                        17: {
                            h: 22,
                        },
                        18: {
                            h: 21,
                        },
                        19: {
                            h: 21,
                        },
                        20: {
                            h: 21,
                        },
                        21: {
                            h: 21,
                        },
                        22: {
                            h: 21,
                        },
                        23: {
                            h: 21,
                        },
                        24: {
                            h: 21,
                        },
                        25: {
                            h: 21,
                        },
                        26: {
                            h: 21,
                        },
                        27: {
                            h: 21,
                        },
                        28: {
                            h: 22,
                        },
                        29: {
                            h: 20,
                        },
                    },
                    selections: [
                        {
                            startRow: 23,
                            startColumn: 6,
                            endRow: 23,
                            endColumn: 6,
                            startAbsoluteRefType: 0,
                            endAbsoluteRefType: 0,
                            rangeType: 0,
                        },
                    ],
                    freeze: {
                        xSplit: 0,
                        ySplit: 0,
                        startRow: -1,
                        startColumn: -1,
                    },
                    zoomRatio: 4,
                    defaultRowHeight: 19,
                    columnData: {
                        7: {
                            w: 51,
                            ia: 1,
                            aw: 51,
                        },
                    },
                    showGridlines: 1,
                    hidden: 0,
                    defaultColumnWidth: 70.56,
                    cellData: {
                        2: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '"NONE":                0,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 6,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 6,
                                                ed: 23,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 23,
                                                ed: 24,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 24,
                                                ed: 25,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 25,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 26,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R2',
                            },
                        },
                        3: {
                            2: {
                                s: 'R2',
                            },
                            7: {
                                s: 'R4',
                            },
                        },
                        4: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "THIN":                1,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 10,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 10,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R5',
                            },
                            7: {
                                s: 'R6',
                            },
                            8: {
                                s: 'R6',
                            },
                        },
                        5: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R7',
                            },
                        },
                        6: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "HAIR":                2,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 10,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 10,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R8',
                            },
                            7: {
                                s: 'R9',
                            },
                            8: {
                                s: 'R9',
                            },
                        },
                        7: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R10',
                            },
                            8: {
                                s: 'R10',
                            },
                        },
                        8: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "DOTTED":              3,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 12,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 12,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R1',
                            },
                            7: {
                                s: 'R11',
                            },
                            8: {
                                s: 'R11',
                            },
                        },
                        9: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R13',
                            },
                        },
                        10: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "DASHED":              4,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 12,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 12,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R12',
                            },
                            7: {
                                s: 'R14',
                            },
                            8: {
                                s: 'R14',
                            },
                        },
                        11: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R16',
                            },
                        },
                        12: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "DASH_DOT":            5,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 14,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 14,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R15',
                            },
                            7: {
                                s: 'R17',
                            },
                            8: {
                                s: 'R17',
                            },
                        },
                        13: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R19',
                            },
                        },
                        14: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "DASH_DOT_DOT":        6,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 18,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 18,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R18',
                            },
                            7: {
                                s: 'R20',
                            },
                            8: {
                                s: 'R20',
                            },
                        },
                        15: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R22',
                            },
                        },
                        16: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "DOUBLE":              7,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 12,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 12,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R21',
                            },
                            7: {
                                s: 'R23',
                            },
                            8: {
                                s: 'R23',
                            },
                        },
                        17: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R25',
                            },
                        },
                        18: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "MEDIUM":              8,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 12,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 12,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R24',
                            },
                            7: {
                                s: 'R26',
                            },
                            8: {
                                s: 'R26',
                            },
                        },
                        19: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R28',
                            },
                        },
                        20: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "MEDIUM_DASHED":       9,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 19,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 19,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 28,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 28,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 29,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R27',
                            },
                            7: {
                                s: 'R29',
                            },
                            8: {
                                s: 'R29',
                            },
                        },
                        21: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R31',
                            },
                        },
                        22: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "MEDIUM_DASH_DOT":     10,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 21,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 21,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 29,
                                                ed: 30,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 31,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R30',
                            },
                            7: {
                                s: 'R32',
                            },
                            8: {
                                s: 'R32',
                            },
                        },
                        23: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R34',
                            },
                        },
                        24: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "MEDIUM_DASH_DOT_DOT": 11,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 25,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 25,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 29,
                                                ed: 30,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 31,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R33',
                            },
                            7: {
                                s: 'R35',
                            },
                            8: {
                                s: 'R35',
                            },
                        },
                        25: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R37',
                            },
                        },
                        26: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "SLANT_DASH_DOT":      12,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 20,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 20,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 29,
                                                ed: 30,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 31,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R36',
                            },
                            7: {
                                s: 'R38',
                            },
                            8: {
                                s: 'R38',
                            },
                        },
                        27: {
                            2: {
                                s: 'R3',
                            },
                            7: {
                                s: 'R40',
                            },
                        },
                        28: {
                            2: {
                                t: 1,
                                p: {
                                    body: {
                                        dataStream: '    "THICK":               13,\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 11,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#E6DB74',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 11,
                                                ed: 27,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 27,
                                                ed: 29,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#AE81FF',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                            {
                                                st: 29,
                                                ed: 30,
                                                ts: {
                                                    ff: 'Consolas',
                                                    fs: 11,
                                                    cl: {
                                                        rgb: '#F8F8F2',
                                                        th: 0,
                                                    },
                                                },
                                            },
                                        ],
                                        tables: [],
                                        paragraphs: [
                                            {
                                                startIndex: 30,
                                            },
                                        ],
                                        sectionBreaks: [
                                            {
                                                startIndex: 31,
                                            },
                                        ],
                                        customBlocks: [],
                                        customRanges: [],
                                        customDecorations: [],
                                    },
                                    documentStyle: {
                                        textStyle: {},
                                        pageSize: {
                                            width: 0,
                                            height: 0,
                                        },
                                        renderConfig: {},
                                        documentFlavor: 0,
                                    },
                                    drawings: {},
                                    footers: {},
                                    headers: {},
                                    lists: {},
                                    settings: {},
                                },
                                s: 'R3',
                            },
                            6: {
                                s: 'R39',
                            },
                            7: {
                                s: 'R41',
                            },
                            8: {
                                s: 'R41',
                            },
                        },
                        29: {},
                    },
                },
            },
            styles: {
                R1: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R10: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R11: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R12: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R13: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 3,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R14: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R15: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R16: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 4,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R17: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R18: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R19: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 5,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R2: {
                    ff: 'Consolas',
                    fs: 11,
                    cl: {
                        rgb: '#E6DB74',
                        th: 0,
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R20: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R21: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R22: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 6,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R23: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R24: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R25: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 7,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R26: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R27: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R28: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 8,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R29: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R3: {
                    ff: 'Consolas',
                    fs: 11,
                    cl: {
                        rgb: '#F8F8F2',
                        th: 0,
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R30: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R31: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 9,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R32: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R33: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R34: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 10,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R35: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R36: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R37: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 11,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R38: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R39: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 13,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R4: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        b: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R40: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 12,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 13,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R41: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 13,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 13,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 13,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 13,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R5: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R6: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R7: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 1,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R8: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        r: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
                R9: {
                    ff: '等线',
                    fs: 11,
                    cl: {
                        rgb: '#000000',
                        th: 0,
                    },
                    bd: {
                        t: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        r: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        b: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                        l: {
                            s: 2,
                            cl: {
                                rgb: '#000000',
                                th: 0,
                            },
                        },
                    },
                    n: {
                        pattern: 'General',
                    },
                    vt: 2,
                },
            },
            resources: [
                {
                    name: 'SHEET_DEFINED_NAME_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_DATA_VALIDATION_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_FILTER_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_HYPER_LINK_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_DRAWING_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_TABLE_PLUGIN',
                    data: '{}',
                },
                {
                    name: 'SHEET_RANGE_THEME_MODEL_PLUGIN',
                    data: '{"rangeThemeStyleRuleMap":{},"rangeThemeStyleMapJson":{}}',
                },
            ],
            company: '',
            createdTime: '2025-02-24T03:37:47Z',
            lastModifiedBy: '刘润泽',
            modifiedTime: '2025-02-24T04:05:24Z',
        });
    }

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
        worker.terminate();
        window.univer = undefined;
        window.univerAPI = undefined;
    });

    window.univer = univer;
    window.univerAPI = FUniver.newAPI(univer);
}

createNewInstance();
window.createNewInstance = createNewInstance;

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: ReturnType<typeof FUniver.newAPI>;
        createNewInstance?: typeof createNewInstance;
    }
}

// eslint-disable-next-line max-lines-per-function, complexity
function initEvent() {
    const logService = window.univer!.__getInjector().get(ILogService);

    // Workbook Events
    window.univerAPI?.addEvent(window.univerAPI.Event.WorkbookCreated, (params) => {
        logService.log('===WorkbookCreated', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.WorkbookDisposed, (params) => {
        logService.log('===WorkbookDisposed', params);
    });

    // Sheet Lifecycle Events
    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetCreate, (params) => {
        logService.log('===BeforeSheetCreate', params);
    });
    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetCreated, (params) => {
        logService.log('===SheetCreated', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetDelete, (params) => {
        logService.log('===BeforeSheetDelete', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetDeleted, (params) => {
        logService.log('===SheetDeleted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetMove, (params) => {
        logService.log('===BeforeSheetMove', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetMoved, (params) => {
        logService.log('===SheetMoved', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetNameChange, (params) => {
        logService.log('===BeforeSheetNameChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetNameChanged, (params) => {
        logService.log('===SheetNameChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetHideChange, (params) => {
        logService.log('===BeforeSheetHideChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetHideChanged, (params) => {
        logService.log('===SheetHideChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellClicked, (params) => {
        logService.log('===CellClicked', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellHover, (params) => {
        logService.log('===CellHover', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellPointerDown, (params) => {
        logService.log('===CellPointerDown', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellPointerUp, (params) => {
        logService.log('===CellPointerUp', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellPointerMove, (params) => {
        logService.log('===CellPointerMove', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionChanged, (params) => {
        logService.log('===SelectionChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionMoveStart, (params) => {
        logService.log('===SelectionMoveStart', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionMoveEnd, (params) => {
        logService.log('===SelectionMoveEnd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionMoving, (params) => {
        logService.log('===SelectionMoving', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetEditStart, (params) => {
        logService.log('===BeforeSheetEditStart', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditStarted, (params) => {
        logService.log('===SheetEditStarted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditChanging, (params) => {
        logService.log('===SheetEditChanging', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetEditEnd, (params) => {
        logService.log('===BeforeSheetEditEnd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditEnded, (params) => {
        logService.log('===SheetEditEnded', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetValueChanged, (params) => {
        logService.log('===SheetValueChanged', params);
    });

    // Clipboard Events
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeClipboardChange, (params) => {
        logService.log('===BeforeClipboardChange', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.ClipboardChanged, (params) => {
        logService.log('===ClipboardChanged', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeClipboardPaste, (params) => {
        logService.log('===BeforeClipboardPaste', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.ClipboardPasted, (params) => {
        logService.log('===ClipboardPasted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeGridlineEnableChange, (params) => {
        logService.log('===BeforeGridlineEnableChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeGridlineColorChange, (params) => {
        logService.log('===BeforeGridlineColorChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.GridlineChanged, (params) => {
        logService.log('===GridlineChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetZoomChange, (params) => {
        logService.log('===BeforeSheetZoomChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetZoomChanged, (params) => {
        logService.log('===SheetZoomChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.Scroll, (params) => {
        logService.log('===Scroll', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetSkeletonChanged, (params) => {
        logService.log('===SheetSkeletonChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetDataValidationAdd, (params) => {
        logService.log('===BeforeSheetDataValidationAdd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetDataValidationChanged, (params) => {
        logService.log('===SheetDataValidationChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetDataValidatorStatusChanged, (params) => {
        logService.log('===SheetDataValidatorStatusChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetBeforeRangeFilter, (params) => {
        logService.log('===SheetBeforeRangeFilter', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetRangeFiltered, (params) => {
        logService.log('===SheetRangeFiltered', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetBeforeRangeSort, (params) => {
        logService.log('===SheetBeforeRangeSort', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetRangeSorted, (params) => {
        logService.log('===SheetRangeSorted', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.SheetBeforeRangeFilterClear, (params) => {
        logService.log('===SheetBeforeRangeFilterClear', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.SheetRangeFilterCleared, (params) => {
        logService.log('===SheetRangeFilterCleared', params);
    });

    // Image Events
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageInsert, (params) => {
        logService.log('===BeforeOverGridImageInsert', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageInserted, (params) => {
        logService.log('===OverGridImageInserted', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageChange, (params) => {
        logService.log('===BeforeOverGridImageChange', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageChanged, (params) => {
        logService.log('===OverGridImageChanged', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageRemove, (params) => {
        logService.log('===BeforeOverGridImageRemove', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageRemoved, (params) => {
        logService.log('===OverGridImageRemoved', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageSelect, (params) => {
        logService.log('===BeforeOverGridImageSelect', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageSelected, (params) => {
        logService.log('===OverGridImageSelected', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentAdd, (params) => {
        logService.log('===BeforeCommentAdd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentAdded, (params) => {
        logService.log('===CommentAdded', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentUpdate, (params) => {
        logService.log('===BeforeCommentUpdate', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentUpdated, (params) => {
        logService.log('===CommentUpdated', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentDeleted, (params) => {
        logService.log('===BeforeCommentDeleted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentDeleted, (params) => {
        logService.log('===CommentDeleted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentResolve, (params) => {
        logService.log('===BeforeCommentResolve', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentResolved, (params) => {
        logService.log('===CommentResolved', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderClick, (params) => {
        logService.log('===RowHeaderClick', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderHover, (params) => {
        logService.log('===RowHeaderHover', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderPointerDown, (params) => {
        logService.log('===RowHeaderPointerDown', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderPointerUp, (params) => {
        logService.log('===RowHeaderPointerUp', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderClick, (params) => {
        logService.log('===ColumnHeaderClick', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderHover, (params) => {
        logService.log('===ColumnHeaderHover', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderPointerDown, (params) => {
        logService.log('===ColumnHeaderPointerDown', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderPointerUp, (params) => {
        logService.log('===ColumnHeaderPointerUp', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetLinkAdd, (params) => {
        logService.log('===BeforeSheetLinkAdd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetLinkUpdate, (params) => {
        logService.log('===BeforeSheetLinkUpdate', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetLinkCancel, (params) => {
        logService.log('===BeforeSheetLinkCancel', params);
    });

    // Drag and Drop Events
    window.univerAPI?.addEvent(window.univerAPI.Event.DragOver, (params) => {
        logService.log('===DragOver', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.Drop, (params) => {
        logService.log('===Drop', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CrosshairHighlightColorChanged, (params) => {
        logService.log('===CrosshairHighlightColorChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CrosshairHighlightEnabledChanged, (params) => {
        logService.log('===CrosshairHighlightEnabledChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetEditStart, (params) => {
        const { row, column } = params;
        if (row === 0 && column === 0) {
            params.cancel = true;
        }
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ActiveSheetChanged, (params) => {
        logService.log('===active sheet changed', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditChanging, (params) => {
        logService.log('===SheetEditChanging', params);
    });
}

// initEvent();
