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

import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import type { IUniverRPCMainThreadConfig } from '@univerjs/rpc';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { UniverUIPlugin } from '@univerjs/ui';
import { SheetsConditionalFormatPlugin } from '@univerjs/sheets-conditional-format';
import { DebuggerPlugin } from '../plugins/debugger';
import { locales } from './locales';

const LOAD_LAZY_PLUGINS_TIMEOUT = 1_000;
// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales,
    logLevel: LogLevel.VERBOSE,
});

// core plugins
univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
});
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
    header: true,
    footer: true,
});

univer.registerPlugin(UniverDocsUIPlugin);

univer.registerPlugin(UniverSheetsPlugin, {
    notExecuteFormula: true,
});
univer.registerPlugin(UniverSheetsUIPlugin);

// sheet feature plugins

univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(DebuggerPlugin);
univer.registerPlugin(UniverSheetsZenEditorPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin, {
    notExecuteFormula: true,
});
univer.registerPlugin(UniverSheetsFormulaPlugin);
univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: './worker.js',
} as IUniverRPCMainThreadConfig);

// find replace
univer.registerPlugin(UniverFindReplacePlugin);
univer.registerPlugin(UniverSheetsFindReplacePlugin);

// create univer sheet instance
univer.createUniverSheet({
    id: 'test',
    sheetOrder: [
        'sheet1',
    ],
    name: '',
    appVersion: '3.0.0-alpha',
    locale: 'zhCN',
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    1: {
                        v: 1,
                        t: 2,
                    },
                    2: {
                        v: 2,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 4,
                        t: 2,
                    },
                    5: {
                        v: 5,
                        t: 2,
                    },
                    6: {
                        v: 6,
                        t: 2,
                    },
                    7: {
                        v: 7,
                        t: 2,
                    },
                },
                1: {
                    1: {
                        v: 1,
                        t: 2,
                    },
                    2: {
                        v: 2,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 4,
                        t: 2,
                    },
                    5: {
                        v: 5,
                        t: 2,
                    },
                    6: {
                        v: 6,
                        t: 2,
                    },
                    7: {
                        v: 7,
                        t: 2,
                    },
                },
                2: {
                    1: {
                        v: 1,
                        t: 2,
                    },
                    2: {
                        v: 2,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 4,
                        t: 2,
                    },
                    5: {
                        v: 5,
                        t: 2,
                    },
                    6: {
                        v: 6,
                        t: 2,
                    },
                    7: {
                        v: 7,
                        t: 2,
                    },
                },
                3: {
                    1: {
                        v: 1,
                        t: 2,
                    },
                    2: {
                        v: 2,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 4,
                        t: 2,
                    },
                    5: {
                        v: 5,
                        t: 2,
                    },
                    6: {
                        v: 6,
                        t: 2,
                    },
                    7: {
                        v: 7,
                        t: 2,
                    },
                },
                4: {
                    1: {
                        v: 1,
                        t: 2,
                    },
                    2: {
                        v: 2,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 4,
                        t: 2,
                    },
                    5: {
                        v: 5,
                        t: 2,
                    },
                    6: {
                        v: 6,
                        t: 2,
                    },
                    7: {
                        v: 7,
                        t: 2,
                    },
                },
                5: {
                    1: {
                        v: 1,
                        t: 2,
                    },
                    2: {
                        v: 2,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 4,
                        t: 2,
                    },
                    5: {
                        v: 5,
                        t: 2,
                    },
                    6: {
                        v: 6,
                        t: 2,
                    },
                    7: {
                        v: 7,
                        t: 2,
                    },
                },
                11: {
                    1: {},
                    7: {
                        v: 1,
                        t: 2,
                    },
                },
                12: {
                    7: {
                        v: 2,
                        t: 2,
                    },
                },
                13: {
                    7: {
                        v: 3,
                        t: 2,
                    },
                },
                14: {
                    0: {
                        v: 6,
                        t: 2,
                    },
                    1: {
                        v: -1.1234,
                        t: 2,
                    },
                    2: {
                        v: -100,
                        t: 2,
                    },
                    3: {
                        v: 1,
                        t: 2,
                    },
                    4: {
                        v: 11,
                        t: 2,
                    },
                    5: {
                        v: 111,
                        t: 2,
                    },
                    6: {
                        v: 45292,
                        t: 2,
                    },
                    7: {
                        f: '=SUM(H12:H14)',
                        v: 6,
                        t: 2,
                    },
                },
                15: {
                    0: {
                        v: 6,
                        t: 2,
                    },
                    1: {
                        v: -0.1234,
                        t: 2,
                    },
                    2: {
                        v: -99,
                        t: 2,
                    },
                    3: {
                        v: 2,
                        t: 2,
                    },
                    4: {
                        v: 12,
                        t: 2,
                    },
                    5: {
                        v: 112,
                        t: 2,
                    },
                    6: {
                        f: '=TODAY()',
                        v: 45371,
                        t: 2,
                    },
                    7: {
                        f: '=SUM(H13:H15)',
                        si: '-mF_8l',
                        v: 11,
                        t: 2,
                    },
                },
                16: {
                    0: {
                        v: 6,
                        t: 2,
                    },
                    1: {
                        v: 0.8766,
                        t: 2,
                    },
                    2: {
                        v: -98,
                        t: 2,
                    },
                    3: {
                        v: 3,
                        t: 2,
                    },
                    4: {
                        v: 13,
                        t: 2,
                    },
                    5: {
                        v: 113,
                        t: 2,
                    },
                    7: {
                        si: '-mF_8l',
                        v: 20,
                        t: 2,
                        f: '=SUM(H14:H16)',
                    },
                },
                17: {
                    0: {
                        v: 6,
                        t: 2,
                    },
                    1: {
                        v: 1.8766,
                        t: 2,
                    },
                    2: {
                        v: -97,
                        t: 2,
                    },
                    3: {
                        v: 4,
                        t: 2,
                    },
                    4: {
                        v: 14,
                        t: 2,
                    },
                    5: {
                        v: 114,
                        t: 2,
                    },
                    7: {
                        si: '-mF_8l',
                        f: '=1+6',
                        v: 7,
                        t: 2,
                    },
                },
                18: {
                    0: {
                        v: 6,
                        t: 2,
                    },
                    1: {
                        v: 2.8766,
                        t: 2,
                    },
                    2: {
                        v: -96,
                        t: 2,
                    },
                    3: {
                        v: 5,
                        t: 2,
                    },
                    4: {
                        v: 15,
                        t: 2,
                    },
                    5: {
                        v: 115,
                        t: 2,
                    },
                    7: {
                        si: '-mF_8l',
                        v: 38,
                        t: 2,
                        f: '=SUM(H16:H18)',
                    },
                },
                19: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                    8: {},
                },
                20: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                    8: {},
                },
                21: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                    8: {},
                },
                22: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                    8: {},
                },
                23: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                    8: {},
                },
                24: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                },
                25: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                },
                26: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                },
                27: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                },
                28: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                },
                29: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {},
                    7: {},
                },
            },
            name: 'Sheet1',
            tabColor: '',
            hidden: 0,
            rowCount: 1000,
            columnCount: 21,
            zoomRatio: 1,
            freeze: {
                startRow: -1,
                startColumn: -1,
                ySplit: 0,
                xSplit: 0,
            },
            scrollTop: 0,
            scrollLeft: 0,
            defaultColumnWidth: 73,
            defaultRowHeight: 19,
            mergeData: [],
            rowData: {
                11: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                12: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                13: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                14: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                15: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                16: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                17: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                18: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                19: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
                20: {
                    hd: 0,
                    h: 19,
                },
                21: {
                    hd: 0,
                    h: 19,
                },
                22: {
                    hd: 0,
                    h: 19,
                },
                23: {
                    hd: 0,
                    h: 19,
                },
                24: {
                    hd: 0,
                    h: 19,
                },
                25: {
                    hd: 0,
                    h: 19,
                },
                26: {
                    hd: 0,
                    h: 19,
                },
                27: {
                    hd: 0,
                    h: 19,
                },
                28: {
                    hd: 0,
                    h: 19,
                },
                29: {
                    hd: 0,
                    h: 19,
                },
            },
            columnData: {
                0: {
                    w: 73,
                    hd: 0,
                },
                1: {
                    w: 73,
                    hd: 0,
                },
                2: {
                    w: 73,
                    hd: 0,
                },
                3: {
                    w: 73,
                    hd: 0,
                },
                4: {
                    w: 73,
                    hd: 0,
                },
                5: {
                    w: 73,
                    hd: 0,
                },
                6: {
                    w: 111.39999389648438,
                    hd: 0,
                },
                7: {
                    w: 73,
                    hd: 0,
                },
            },
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            selections: [
                'A1',
            ],
            rightToLeft: 0,
        },
    },
    resources: [
        {
            name: 'SHEET_NUMFMT_PLUGIN',
            data: '{"model":{"sheet1":{"14":{"6":{"i":"1"}}}},"refModel":[{"count":1,"i":"1","pattern":"yyyy-mm-dd","type":"date"}]}',
        },
        {
            name: 'SHEET_CONDITION_FORMAT_PLUGIN',
            data: '{"sheet1":[{"cfId":"1","ranges":[{"startRow":14,"startColumn":0,"endRow":18,"endColumn":7,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"},"bl":0,"it":0,"st":{"s":0},"ul":{"s":0}},"value":"=A12:H19=6","type":"highlightCell","subType":"formula"},"stopIfTrue":false}]}',
        },
    ],
    __env__: {
        gitHash: '4776d69',
        gitBranch: 'feat-conditional-format-0124',
        buildTime: '2024-03-18T12:28:04.820Z',
    },
});

// sheet condition format
univer.registerPlugin(SheetsConditionalFormatPlugin);

declare global {
    interface Window {
        univer?: Univer;
    }
}

setTimeout(() => {
    import('./lazy').then((lazy) => {
        const plugins = lazy.default();
        plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
    });
}, LOAD_LAZY_PLUGINS_TIMEOUT);

window.univer = univer;
