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
import zhCN from '@univerjs/mockdata/locales/zh-CN';
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
import { UniverSheetsCustomShortcutPlugin } from './custom-plugin/custom-shortcut';
import ImportCSVButtonPlugin from './custom-plugin/import-csv-button';

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
            [LocaleType.ZH_CN]: zhCN,
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
            id: 'fbpG8l',
            sheetOrder: [
                'xeyZKmZIRXwhSzwbec9-c',
            ],
            sheets: {
                'xeyZKmZIRXwhSzwbec9-c': {
                    id: 'xeyZKmZIRXwhSzwbec9-c',
                    name: 'Sheet1',
                    tabColor: '',
                    hidden: 0,
                    rowCount: 1000,
                    columnCount: 20,
                    zoomRatio: 1,
                    freeze: {
                        xSplit: 0,
                        ySplit: 0,
                        startRow: -1,
                        startColumn: -1,
                    },
                    scrollTop: 0,
                    scrollLeft: 0,
                    defaultColumnWidth: 88,
                    defaultRowHeight: 24,
                    mergeData: [],
                    cellData: {},
                    rowData: {},
                    columnData: {},
                    showGridlines: 1,
                    rowHeader: {
                        width: 46,
                        hidden: 0,
                    },
                    columnHeader: {
                        height: 20,
                        hidden: 0,
                    },
                    rightToLeft: 0,
                },
            },
            resources: [
                {
                    name: 'SHEET_DATA_VALIDATION_PLUGIN',
                    data: '{"xeyZKmZIRXwhSzwbec9-c":[{"uid":"VvFh9x","type":"date","operator":"greaterThan","formula1":"2020-11-11","ranges":[{"startRow":0,"startColumn":0,"endRow":0,"endColumn":0,"rangeType":0}],"formula2":""},{"uid":"K2P_rg","type":"date","operator":"greaterThanOrEqual","formula1":"2025-11-12","ranges":[{"startRow":0,"startColumn":1,"endRow":0,"endColumn":1,"rangeType":0,"unitId":"fbpG8l","sheetId":"xeyZKmZIRXwhSzwbec9-c"}],"formula2":"","bizInfo":{"showTime":true}}]}',
                },
            ],
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
