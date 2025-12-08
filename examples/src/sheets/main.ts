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

import { LocaleType, LogLevel, Univer, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import caES from '@univerjs/mockdata/locales/ca-ES';
import enUS from '@univerjs/mockdata/locales/en-US';
import esES from '@univerjs/mockdata/locales/es-ES';
import faIR from '@univerjs/mockdata/locales/fa-IR';
import frFR from '@univerjs/mockdata/locales/fr-FR';
import jaJP from '@univerjs/mockdata/locales/ja-JP';
import koKR from '@univerjs/mockdata/locales/ko-KR';
import ruRU from '@univerjs/mockdata/locales/ru-RU';
import viVN from '@univerjs/mockdata/locales/vi-VN';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import zhTW from '@univerjs/mockdata/locales/zh-TW';
import { UniverNetworkPlugin } from '@univerjs/network';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsTablePlugin } from '@univerjs/sheets-table';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';
import { UniverWebComponentAdapterPlugin } from '@univerjs/ui-adapter-web-component';
import { customRegisterEvent } from './custom/custom-register-event';
import { UniverSheetsCustomShortcutPlugin } from './custom/custom-shortcut';
import ImportCSVButtonPlugin from './custom/import-csv-button';

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
import '@univerjs/sheets-formula-ui/facade';
import '@univerjs/sheets-table/facade';
import '@univerjs/sheets-sort/facade';
import '@univerjs/network/facade';
import '@univerjs/sheets-note/facade';
import '../global.css';

/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

const LOAD_LAZY_PLUGINS_TIMEOUT = 50;
const LOAD_VERY_LAZY_PLUGINS_TIMEOUT = 100;

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
        // theme: greenTheme,
        darkMode: localStorage.getItem('local.darkMode') === 'dark',
        locale: LocaleType.ZH_CN,
        locales: {
            [LocaleType.CA_ES]: caES,
            [LocaleType.EN_US]: enUS,
            [LocaleType.ES_ES]: esES,
            [LocaleType.FA_IR]: faIR,
            [LocaleType.FR_FR]: frFR,
            [LocaleType.JA_JP]: jaJP,
            [LocaleType.KO_KR]: koKR,
            [LocaleType.RU_RU]: ruRU,
            [LocaleType.VI_VN]: viVN,
            [LocaleType.ZH_CN]: zhCN,
            [LocaleType.ZH_TW]: zhTW,
        },
        logLevel: LogLevel.VERBOSE,
    });

    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

    univer.registerPlugins([
        [UniverRPCMainThreadPlugin, { workerURL: worker }],
        [UniverDocsPlugin],
        [UniverRenderEnginePlugin],
        [UniverUIPlugin, {
            container: 'app',
            // ribbonType: 'classic',
            customFontFamily: [
                { value: 'PingFang SC', label: '苹方（简）', category: 'sans-serif' },
                { value: 'Helvetica Neue', label: 'Helvetica Neue', category: 'sans-serif' },
            ],
        }],
        [UniverWebComponentAdapterPlugin],
        [UniverVue3AdapterPlugin],
        [UniverDocsUIPlugin],
        [UniverSheetsPlugin, {
            notExecuteFormula: true,
            autoHeightForMergedCells: true,
        }],
        [UniverSheetsUIPlugin],
        [UniverSheetsNumfmtPlugin],
        [UniverSheetsZenEditorPlugin],
        [UniverFormulaEnginePlugin, { notExecuteFormula: true }],
        [UniverSheetsFormulaPlugin, { notExecuteFormula: true }],
        [UniverSheetsDataValidationPlugin],
        [UniverSheetsConditionalFormattingPlugin],
        [UniverSheetsFilterPlugin],
        [UniverSheetsSortPlugin],
        [UniverSheetsHyperLinkPlugin],
        [UniverSheetsThreadCommentPlugin],
        [UniverSheetsTablePlugin],
        [UniverNetworkPlugin],
        [UniverSheetsNotePlugin],
        [ImportCSVButtonPlugin],
        [UniverSheetsCustomShortcutPlugin],
    ]);

    // If we are running in e2e platform, we should immediately register the debugger plugin.
    if (IS_E2E) {
        univer.registerPlugin(UniverDebuggerPlugin, {
            fab: false,
            performanceMonitor: {
                enabled: false,
            },
        });
    }

    const injector = univer.__getInjector();
    const userManagerService = injector.get(UserManagerService);
    userManagerService.setCurrentUser(mockUser);

    // create univer sheet instance
    if (!IS_E2E) {
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'YSvbxFMCTxugbku-IWNyxQ',
            sheetOrder: [
                'U_wr1DEF84N_mbesFNmxR',
            ],
            name: 'New Sheet By Univer',
            appVersion: '1',
            locale: LocaleType.EN_US,
            styles: {
                '152X2f': {
                    bd: {
                        b: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                        l: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                        r: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                        t: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                    },
                    bg: {
                        rgb: '#f4f4f5',
                    },
                    vt: 2,
                },
                '7FmyNp': {
                    n: {
                        pattern: 'yyyy/m/d',
                    },
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 0,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 1,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                '7XO3nr': {
                    bd: {
                        b: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                        l: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                        r: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                        t: {
                            s: 1,
                            cl: {
                                rgb: '#b2b2b2',
                            },
                        },
                    },
                    bg: {
                        rgb: '#eceeff',
                    },
                    bl: 1,
                    vt: 2,
                },
                '9SFcMu': {
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 0,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 1,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                EyKJCZ: {
                    bg: {
                        rgb: 'rgb(255,255,0)',
                    },
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 0,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 1,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                FyTrrV: {
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 2,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 1,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                IrI1it: {
                    n: {
                        pattern: 'yyyy/mm/dd',
                    },
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 0,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 1,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                OdkELx: {
                    bg: {
                        rgb: 'rgb(68,114,196)',
                    },
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 0,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 1,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                VYPA_J: {
                    bg: {
                        rgb: 'rgb(255,0,0)',
                    },
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 2,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 0,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                bB0NY3: {
                    bl: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ff: '等线',
                    fs: 11,
                    ht: 0,
                    it: 0,
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    pd: {
                        b: 1,
                        l: 2,
                        r: 2,
                        t: 0,
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tb: 0,
                    td: 0,
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    vt: 2,
                },
                grdSj3: {
                    bd: null,
                    bg: {
                        rgb: '#1d32e9',
                    },
                    bl: 1,
                    cl: {
                        rgb: '#FFFFFF',
                    },
                    vt: 2,
                },
                vRtCqS: {
                    ff: 'Arial',
                    fs: 10,
                    it: 0,
                    bl: 0,
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    td: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ht: 0,
                    vt: 0,
                    tb: 3,
                    pd: {
                        t: 0,
                        b: 1,
                        l: 2,
                        r: 2,
                    },
                },
                b_xNmg: {
                    ff: '等线',
                    fs: 11,
                    it: 0,
                    bl: 0,
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tr: {
                        a: 0,
                    },
                    td: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ht: 0,
                    vt: 2,
                    tb: 3,
                    pd: {
                        t: 0,
                        b: 1,
                        l: 2,
                        r: 2,
                    },
                },
                'TL-w0i': {
                    ff: 'Arial',
                    fs: 10,
                    it: 0,
                    bl: 0,
                    ul: {
                        s: 0,
                    },
                    st: {
                        s: 0,
                    },
                    ol: {
                        s: 0,
                    },
                    tr: {
                        a: 0,
                        v: 0,
                    },
                    td: 0,
                    ht: 0,
                    vt: 0,
                    tb: 0,
                    pd: {
                        t: 0,
                        b: 1,
                        l: 2,
                        r: 2,
                    },
                },
                '9EuDtV': {
                    ff: 'Arial',
                    fs: 10,
                    it: 0,
                    bl: 0,
                    ul: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    st: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    ol: {
                        s: 0,
                        cl: {
                            rgb: 'rgb(0,0,0)',
                        },
                    },
                    tr: {
                        a: 0,
                    },
                    td: 0,
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    ht: 0,
                    vt: 0,
                    tb: 3,
                    pd: {
                        t: 0,
                        b: 1,
                        l: 2,
                        r: 2,
                    },
                },
            },
            sheets: {
                U_wr1DEF84N_mbesFNmxR: {
                    id: 'U_wr1DEF84N_mbesFNmxR',
                    name: '工作表2',
                    rowCount: 998,
                    columnCount: 20,
                    freeze: {
                        xSplit: 0,
                        ySplit: 0,
                        startRow: -1,
                        startColumn: -1,
                    },
                    hidden: 0,
                    rowData: {
                        2: {
                            h: 24,
                            ah: 24,
                            hd: 0,
                        },
                        6: {
                            h: 28,
                            hd: 0,
                        },
                        7: {
                            h: 28,
                            hd: 0,
                        },
                        8: {
                            h: 28,
                            hd: 0,
                        },
                        9: {
                            h: 28,
                            hd: 0,
                        },
                        10: {
                            h: 28,
                            ah: 24,
                            hd: 0,
                        },
                        11: {
                            h: 28,
                            ah: 24,
                            hd: 0,
                        },
                        12: {
                            h: 28,
                            hd: 0,
                        },
                        13: {
                            h: 28,
                            hd: 0,
                        },
                        14: {
                            h: 28,
                            hd: 0,
                        },
                        15: {
                            h: 28,
                            hd: 0,
                        },
                        16: {
                            h: 28,
                            hd: 0,
                        },
                        17: {
                            h: 28,
                            hd: 0,
                        },
                        18: {
                            h: 28,
                            hd: 0,
                        },
                        19: {
                            h: 28,
                            hd: 0,
                        },
                        20: {
                            h: 28,
                            hd: 0,
                        },
                        21: {
                            h: 28,
                            hd: 0,
                        },
                        27: {
                            hd: 0,
                            h: 28,
                        },
                        28: {
                            hd: 0,
                            h: 24,
                            ah: 24,
                        },
                        29: {
                            hd: 0,
                            h: 24,
                        },
                        30: {
                            hd: 0,
                            h: 24,
                        },
                        41: {
                            hd: 0,
                            h: 28,
                        },
                        42: {
                            hd: 0,
                            h: 24,
                        },
                        43: {
                            hd: 0,
                            h: 28,
                        },
                        44: {
                            hd: 0,
                            h: 28,
                        },
                    },
                    tabColor: '',
                    mergeData: [
                        {
                            startRow: 11,
                            endRow: 13,
                            startColumn: 11,
                            endColumn: 13,
                        },
                        {
                            startRow: 18,
                            endRow: 19,
                            startColumn: 13,
                            endColumn: 17,
                        },
                        {
                            startRow: 11,
                            endRow: 12,
                            startColumn: 3,
                            endColumn: 5,
                            rangeType: 0,
                        },
                        {
                            startRow: 3,
                            endRow: 7,
                            startColumn: 7,
                            endColumn: 7,
                            rangeType: 0,
                        },
                        {
                            startRow: 28,
                            endRow: 29,
                            startColumn: 7,
                            endColumn: 8,
                            rangeType: 0,
                        },
                        {
                            startRow: 42,
                            endRow: 43,
                            startColumn: 5,
                            endColumn: 7,
                        },
                        {
                            startRow: 28,
                            endRow: 29,
                            startColumn: 17,
                            endColumn: 19,
                        },
                        {
                            startRow: 30,
                            endRow: 30,
                            startColumn: 13,
                            endColumn: 17,
                        },
                    ],
                    rowHeader: {
                        width: 46,
                        hidden: 0,
                    },
                    scrollTop: 0,
                    zoomRatio: 1,
                    columnData: {
                        4: {
                            w: 88,
                            hd: 0,
                        },
                        5: {
                            w: 88,
                            hd: 0,
                        },
                        6: {
                            w: 88,
                            hd: 0,
                        },
                        7: {
                            w: 69,
                            hd: 0,
                        },
                        8: {
                            w: 88,
                            hd: 0,
                        },
                        9: {
                            w: 88,
                            hd: 0,
                        },
                        10: {
                            w: 88,
                            hd: 0,
                        },
                        11: {
                            w: 88,
                            hd: 0,
                        },
                        12: {
                            w: 88,
                            hd: 0,
                        },
                        13: {
                            w: 88,
                            hd: 0,
                        },
                        14: {
                            w: 88,
                            hd: 0,
                        },
                        15: {
                            w: 88,
                            hd: 0,
                        },
                        16: {
                            w: 88,
                            hd: 0,
                        },
                        17: {
                            w: 88,
                            hd: 0,
                        },
                        18: {
                            w: 88,
                            hd: 0,
                        },
                        19: {
                            w: 88,
                            hd: 0,
                        },
                        20: {
                            w: 88,
                            hd: 0,
                        },
                    },
                    scrollLeft: 0,
                    rightToLeft: 0,
                    columnHeader: {
                        height: 20,
                        hidden: 0,
                    },
                    showGridlines: 1,
                    defaultRowHeight: 24,
                    defaultColumnWidth: 88,
                    cellData: {
                        2: {
                            8: {
                                v: 111,
                                t: 2,
                            },
                        },
                        3: {
                            7: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                        },
                        6: {
                            5: {
                                v: '北部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '辽宁',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {},
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '西红柿',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 86,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        7: {
                            5: {
                                v: '西部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '河南',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {},
                            8: {
                                v: 'fruit',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '葡萄',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 26,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        8: {
                            5: {
                                v: '西部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '河南',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '洛阳',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '茄子',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 36,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        9: {
                            5: {
                                v: '西部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '陕西',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '咸阳',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'fruit',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '梨子',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 88,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        10: {
                            2: {
                                v: 111,
                                t: 2,
                            },
                            3: {
                                v: 111,
                                t: 2,
                            },
                            5: {
                                v: '东部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '广西',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '南宁',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'fruit',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '梨子',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 6,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: 111,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        11: {
                            2: {
                                v: 11,
                                t: 2,
                            },
                            3: {
                                s: 'bB0NY3',
                            },
                            4: {},
                            5: {},
                            6: {
                                v: '黑龙江',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '哈尔滨',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '黄瓜',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 95,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: 11,
                                t: 2,
                                s: 'FyTrrV',
                            },
                            12: {
                                s: 'FyTrrV',
                            },
                            13: {
                                s: 'FyTrrV',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        12: {
                            3: {},
                            4: {},
                            5: {},
                            6: {
                                v: '辽宁',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '鞍山',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '西红柿',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 10,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                s: 'FyTrrV',
                            },
                            12: {
                                s: 'FyTrrV',
                            },
                            13: {
                                s: 'FyTrrV',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        13: {
                            5: {
                                v: '北部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '辽宁',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '鞍山',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'fruit',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '葡萄',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 7,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                s: 'FyTrrV',
                            },
                            12: {
                                s: 'FyTrrV',
                            },
                            13: {
                                s: 'FyTrrV',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        14: {
                            5: {
                                v: '东部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '福建',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '厦门',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'fruit',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '橘子',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 0,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: 11,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        15: {
                            5: {
                                v: '西部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '陕西',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '西安',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '西红柿',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 34,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        16: {
                            5: {
                                v: '东部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '福建',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '泉州',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '西红柿',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 56,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: 11,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        17: {
                            5: {
                                v: '北部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '辽宁',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '鞍山',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '白菜',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 16,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        18: {
                            5: {
                                v: '西部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '河南',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '郑州',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'fruit',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '橘子',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 90,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '　',
                                t: 1,
                                s: 'VYPA_J',
                            },
                            14: {
                                s: 'VYPA_J',
                            },
                            15: {
                                s: 'VYPA_J',
                            },
                            16: {
                                s: 'VYPA_J',
                            },
                            17: {
                                s: 'VYPA_J',
                            },
                        },
                        19: {
                            5: {
                                v: '东部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '福建',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '厦门',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '西红柿',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 89,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                s: 'VYPA_J',
                            },
                            14: {
                                s: 'VYPA_J',
                            },
                            15: {
                                s: 'VYPA_J',
                            },
                            16: {
                                s: 'VYPA_J',
                            },
                            17: {
                                s: 'VYPA_J',
                            },
                        },
                        20: {
                            5: {
                                v: '北部',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '黑龙江',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '齐齐哈尔',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: 'vegetable',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '土豆',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: 65,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        21: {
                            5: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            6: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            7: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            8: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            9: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            10: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            11: {
                                v: '',
                                t: 1,
                                s: 'bB0NY3',
                            },
                            12: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            13: {
                                v: 111,
                                t: 2,
                                s: 'bB0NY3',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                            17: {
                                v: '',
                                t: 1,
                                s: '9SFcMu',
                            },
                        },
                        27: {
                            6: {
                                v: '陕西',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            7: {
                                v: '西安',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            16: {
                                v: 111,
                                t: 2,
                                s: '9EuDtV',
                            },
                            17: {
                                v: 111,
                                t: 2,
                                s: '9EuDtV',
                            },
                            18: {
                                v: '',
                                t: 1,
                                s: '9EuDtV',
                            },
                            19: {
                                v: '东部',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            20: {
                                v: '陕西',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        28: {
                            6: {
                                v: '福建',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            7: {
                                v: '',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            9: {
                                v: 11,
                                t: 2,
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            16: {
                                v: 11,
                                t: 2,
                                s: '9EuDtV',
                            },
                            17: {
                                s: 'b_xNmg',
                            },
                            18: {
                                s: 'b_xNmg',
                            },
                            19: {
                                s: 'b_xNmg',
                            },
                            20: {
                                v: '福建',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        29: {
                            6: {
                                v: '辽宁',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            7: {},
                            13: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            14: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            15: {
                                v: '',
                                t: 1,
                                s: 'TL-w0i',
                            },
                            16: {
                                v: '',
                                t: 1,
                                s: '9EuDtV',
                            },
                            17: {
                                s: 'b_xNmg',
                            },
                            18: {
                                s: 'b_xNmg',
                            },
                            19: {
                                s: 'b_xNmg',
                            },
                            20: {
                                v: '辽宁',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        30: {
                            6: {
                                v: '河南',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            7: {
                                v: '郑州',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            13: {
                                v: '',
                                t: 1,
                                s: '9EuDtV',
                            },
                            14: {
                                s: '9EuDtV',
                            },
                            15: {
                                s: '9EuDtV',
                            },
                            16: {
                                s: '9EuDtV',
                            },
                            17: {
                                s: '9EuDtV',
                            },
                            18: {
                                v: '',
                                t: 1,
                                s: '9EuDtV',
                            },
                            19: {
                                v: '北部',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            20: {
                                v: '河南',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        41: {
                            4: {
                                v: 111,
                                t: 2,
                                s: 'vRtCqS',
                            },
                            5: {
                                v: 111,
                                t: 2,
                                s: 'vRtCqS',
                            },
                            6: {
                                v: '',
                                t: 1,
                                s: 'vRtCqS',
                            },
                            7: {
                                v: '东部',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            8: {
                                v: '陕西',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        42: {
                            4: {
                                v: 11,
                                t: 2,
                                s: 'vRtCqS',
                            },
                            5: {
                                v: '',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            6: {
                                s: 'b_xNmg',
                            },
                            7: {
                                s: 'b_xNmg',
                            },
                            8: {
                                v: '福建',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        43: {
                            4: {
                                v: '',
                                t: 1,
                                s: 'vRtCqS',
                            },
                            5: {
                                s: 'b_xNmg',
                            },
                            6: {
                                s: 'b_xNmg',
                            },
                            7: {
                                s: 'b_xNmg',
                            },
                            8: {
                                v: '辽宁',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                        44: {
                            4: {
                                v: '',
                                t: 1,
                                s: 'vRtCqS',
                            },
                            5: {
                                v: '',
                                t: 1,
                                s: 'vRtCqS',
                            },
                            6: {
                                v: '',
                                t: 1,
                                s: 'vRtCqS',
                            },
                            7: {
                                v: '北部',
                                t: 1,
                                s: 'b_xNmg',
                            },
                            8: {
                                v: '河南',
                                t: 1,
                                s: 'b_xNmg',
                            },
                        },
                    },
                },
            },
            resources: [
                {
                    data: '{}',
                    name: 'SHEET_THREAD_COMMENT_PLUGIN',
                },
                {
                    data: '{}',
                    name: 'SHEET_WORKSHEET_PROTECTION_PLUGIN',
                },
                {
                    data: '{}',
                    name: 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN',
                },
                {
                    data: '',
                    name: 'SHEET_RANGE_PROTECTION_PLUGIN',
                },
                {
                    data: '',
                    name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
                },
                {
                    data: '{}',
                    name: 'SHEET_HYPER_LINK_PLUGIN',
                },
                {
                    data: '',
                    name: 'SHEET_DRAWING_PLUGIN',
                },
                {
                    data: "{\"dataFieldManagerConfig\":{\"YSvbxFMCTxugbku-IWNyxQ\":{\"collections\":{\"6A9814C2\":{\"fields\":{\"87333\":{\"id\":\"87333\",\"name\":\"省份\",\"hexCode\":\"6B6\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!A1:A34\"},\"90719\":{\"id\":\"90719\",\"name\":\"城市\",\"hexCode\":\"4F5\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!C1:C34\"},\"483B3\":{\"id\":\"483B3\",\"name\":\"省份\",\"hexCode\":\"32C\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!B1:B34\"},\"9F632\":{\"id\":\"9F632\",\"name\":\"类别\",\"hexCode\":\"E0A\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!D1:D34\"},\"F5D56\":{\"id\":\"F5D56\",\"name\":\"商品\",\"hexCode\":\"BBF\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!E1:E34\"},\"51E60\":{\"id\":\"51E60\",\"name\":\"数量\",\"hexCode\":\"2F9\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!F1:F34\"},\"EE056\":{\"id\":\"EE056\",\"name\":\" 销售日期\",\"hexCode\":\"4E3\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!G1:G34\"}},\"fieldIds\":[\"87333\",\"483B3\",\"90719\",\"9F632\",\"F5D56\",\"51E60\",\"EE056\"],\"displayNameRecord\":{\"87333\":\"省份\",\"90719\":\"城市\",\"483B3\":\"省份(1)\",\"9F632\":\"类别\",\"F5D56\":\"商品\",\"51E60\":\"数量\",\"EE056\":\" 销售日期\"},\"customFields\":[],\"dataRecordCount\":33,\"range\":{\"range\":{\"startRow\":0,\"startColumn\":0,\"endRow\":33,\"endColumn\":6,\"rangeType\":0,\"unitId\":\"YSvbxFMCTxugbku-IWNyxQ\",\"sheetId\":\"J5WIXlyBa4F-jGg7lMoZ2\"},\"unitId\":\"YSvbxFMCTxugbku-IWNyxQ\",\"sheetName\":\"Sheet1\",\"subUnitId\":\"J5WIXlyBa4F-jGg7lMoZ2\"}}},\"dataFields\":{\"87333\":{\"id\":\"87333\",\"name\":\"省份\",\"hexCode\":\"6B6\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!A1:A34\"},\"90719\":{\"id\":\"90719\",\"name\":\"城市\",\"hexCode\":\"4F5\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!C1:C34\"},\"483B3\":{\"id\":\"483B3\",\"name\":\"省份\",\"hexCode\":\"32C\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!B1:B34\"},\"9F632\":{\"id\":\"9F632\",\"name\":\"类别\",\"hexCode\":\"E0A\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!D1:D34\"},\"F5D56\":{\"id\":\"F5D56\",\"name\":\"商品\",\"hexCode\":\"BBF\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!E1:E34\"},\"51E60\":{\"id\":\"51E60\",\"name\":\"数量\",\"hexCode\":\"2F9\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!F1:F34\"},\"EE056\":{\"id\":\"EE056\",\"name\":\" 销售日期\",\"hexCode\":\"4E3\",\"rangeKey\":\"'[YSvbxFMCTxugbku-IWNyxQ]Sheet1'!G1:G34\"}}}},\"pivotTableConfigs\":{\"YSvbxFMCTxugbku-IWNyxQ\":{\"J5WIXlyBa4F-jGg7lMoZ2\":{\"6A9814C2\":{\"targetCellInfo\":{\"row\":5,\"col\":12,\"unitId\":\"YSvbxFMCTxugbku-IWNyxQ\",\"subUnitId\":\"J5WIXlyBa4F-jGg7lMoZ2\",\"sheetName\":\"Sheet1\"},\"sourceRangeInfo\":{\"range\":{\"startRow\":0,\"startColumn\":0,\"endRow\":33,\"endColumn\":6,\"rangeType\":0,\"unitId\":\"YSvbxFMCTxugbku-IWNyxQ\",\"sheetId\":\"J5WIXlyBa4F-jGg7lMoZ2\"},\"unitId\":\"YSvbxFMCTxugbku-IWNyxQ\",\"sheetName\":\"Sheet1\",\"subUnitId\":\"J5WIXlyBa4F-jGg7lMoZ2\"},\"fieldsConfig\":{\"columnFields\":[],\"dimension\":{\"16\":{\"id\":\"16\",\"dataFieldId\":\"87333\",\"displayName\":\"省份\",\"sourceName\":\"省份\"}},\"measure\":{},\"filterFields\":[],\"hiddenFields\":[],\"rowFields\":[\"16\"],\"valueFields\":[],\"layout\":3,\"valueIndex\":-1,\"valuePosition\":-1,\"collapseInfo\":{},\"options\":{\"pageWrap\":1,\"pageOverThenDown\":false}},\"isEmpty\":false}}}}}",
                    name: 'SHEET_PIVOT_TABLE_PLUGIN',
                },
                {
                    data: '',
                    name: 'SHEET_DEFINED_NAME_PLUGIN',
                },
                {
                    data: '{}',
                    name: 'SHEET_DATA_VALIDATION_PLUGIN',
                },
                {
                    data: '{"J5WIXlyBa4F-jGg7lMoZ2":{"ref":{"startRow":0,"startColumn":0,"endRow":33,"endColumn":6,"rangeType":0},"filterColumns":[],"cachedFilteredOut":[]}}',
                    name: 'SHEET_FILTER_PLUGIN',
                },
            ],
            rev: 44,
        });
    }

    setTimeout(() => {
        import('./lazy').then((lazy) => {
            const plugins = lazy.default();
            univer.registerPlugins(plugins);
        });
    }, LOAD_LAZY_PLUGINS_TIMEOUT);

    setTimeout(() => {
        import('./very-lazy').then((lazy) => {
            const plugins = lazy.default();
            univer.registerPlugins(plugins);
        });
    }, LOAD_VERY_LAZY_PLUGINS_TIMEOUT);

    univer.onDispose(() => {
        worker.terminate();
        window.univer = undefined;
        window.univerAPI = undefined;
    });

    window.univer = univer;
    window.univerAPI = FUniver.newAPI(univer);
    // window.univerAPI.addFonts([
    //     { value: 'PingFang SC', label: '苹方（简）', category: 'sans-serif' },
    //     { value: 'Helvetica Neue', label: 'Helvetica Neue', category: 'sans-serif' },
    // ]);

    customRegisterEvent(univer, window.univerAPI!);
    // customRangePopups(univer, window.univerAPI!);
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
