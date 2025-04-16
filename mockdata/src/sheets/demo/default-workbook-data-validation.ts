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

export const DEFAULT_WORKBOOK_DATA_VALIDATION = {
    id: 'workbook-01',
    sheetOrder: [
        '80FIpJ1SdQLVIUEbrnC3J',
    ],
    name: 'UniverSheet Demo',
    appVersion: '3.0.0-alpha',
    locale: 'zhCN',
    styles: {},
    sheets: {
        '80FIpJ1SdQLVIUEbrnC3J': {
            name: '工作表1',
            id: '80FIpJ1SdQLVIUEbrnC3J',
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
            defaultColumnWidth: 73,
            defaultRowHeight: 19,
            mergeData: [],
            cellData: {
                0: {
                    0: {
                        v: 'YES',
                        t: 1,
                    },
                    2: {
                        v: 'IF',
                        t: 1,
                    },
                    5: {
                        v: '中文',
                        t: 1,
                    },
                    6: {
                        v: '一',
                        t: 1,
                    },
                    7: {
                        v: '二',
                        t: 1,
                    },
                    8: {
                        v: '三',
                        t: 1,
                    },
                },
                1: {
                    5: {
                        v: '数字',
                        t: 1,
                    },
                    6: {
                        v: 1,
                        t: 2,
                    },
                    7: {
                        v: 2,
                        t: 2,
                    },
                    8: {
                        v: 3,
                        t: 2,
                    },
                },
                2: {
                    2: {
                        v: '级联',
                        t: 1,
                    },
                    3: {
                        v: '中文',
                        t: 1,
                    },
                    4: {
                        v: '一',
                        t: 1,
                    },
                    5: null,
                    6: null,
                    7: null,
                    8: null,
                },
                3: {
                    3: null,
                    4: null,
                    5: null,
                    6: null,
                    7: null,
                    8: null,
                },
            },
            rowData: {
                0: {
                    hd: 0,
                    h: 19,
                    ah: 20,
                },
                2: {
                    hd: 0,
                    h: 19,
                    ah: 20,
                },
                3: {
                    hd: 0,
                    h: 19,
                    ah: 19,
                },
            },
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
            name: 'SHEET_NUMFMT_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_DEFINED_NAME_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_DATA_VALIDATION',
            data: '{"sheet-0011":[{"uid":"xxx-1","type":"decimal","ranges":[{"startRow":0,"endRow":5,"startColumn":0,"endColumn":2}],"operator":"greaterThan","formula1":"111","errorStyle":1},{"uid":"xxx-0","type":"date","ranges":[{"startRow":0,"endRow":5,"startColumn":3,"endColumn":5}],"operator":"greaterThan","formula1":"100","errorStyle":1},{"uid":"xxx-2","type":"checkbox","ranges":[{"startRow":6,"endRow":10,"startColumn":0,"endColumn":5}]},{"uid":"xxx-3","type":"list","ranges":[{"startRow":11,"endRow":15,"startColumn":0,"endColumn":5}],"formula1":"1,2,3,hahaha"},{"uid":"xxx-4","type":"custom","ranges":[{"startRow":16,"endRow":20,"startColumn":0,"endColumn":5}],"formula1":"=A1"},{"uid":"xxx-5","type":"listMultiple","ranges":[{"startRow":21,"endRow":21,"startColumn":0,"endColumn":0}],"formula1":"1,2,3,4,5,哈哈哈哈"}],"80FIpJ1SdQLVIUEbrnC3J":[{"uid":"pQCe2q","type":"list","formula1":"=IF(A1=\\"YES\\",G1:I1,G2:I2)","ranges":[{"startRow":0,"endRow":0,"startColumn":3,"endColumn":3}],"formula2":""},{"uid":"JL6foF","type":"list","formula1":"=F1:F2","ranges":[{"startRow":2,"startColumn":3,"endRow":2,"endColumn":3,"rangeType":0}],"formula2":""},{"uid":"XlFuI6","type":"list","formula1":"=IF(D3=\\"中文\\",G1:I1,G2:I2)","ranges":[{"startRow":2,"startColumn":4,"endRow":2,"endColumn":4,"rangeType":0}],"formula2":""}]}',
        },
        {
            name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
            data: '',
        },
    ],
    __env__: {
        gitHash: '840580212',
        gitBranch: 'feat/dv-list-formula',
        buildTime: '2024-04-10T11:19:00.298Z',
    },
};
