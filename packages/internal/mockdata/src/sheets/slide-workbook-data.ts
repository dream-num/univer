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

import type { IWorkbookData } from '@univerjs/core';
import { BooleanNumber, BorderStyleTypes, LocaleType } from '@univerjs/core';

import { PAGE5_RICHTEXT_1 } from '../slides/rich-text/page5-richtext1';

export const SLIDE_WORKBOOK_DATA: IWorkbookData = {
    id: 'workbook-01',
    locale: LocaleType.ZH_CN,
    name: 'universheet',
    sheetOrder: ['sheet-0001'],
    styles: {
        1: {
            vt: 2,
            ht: 2,
            bl: 1,
            fs: 14 * 0.75,
            bg: {
                rgb: 'rgb(105,126,146)',
            },
            cl: {
                rgb: 'rgb(255,255,255)',
            },
        },
        2: {
            vt: 2,
            ht: 2,
            bl: 1,
            fs: 20 * 0.75,
            bg: {
                rgb: 'rgb(244,79,86)',
            },
            cl: {
                rgb: 'rgb(255,255,255)',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
            },
        },
        3: {
            vt: 2,
            bg: {
                rgb: 'rgb(105,126,146)',
            },
            cl: {
                rgb: 'rgb(255,255,255)',
            },
            fs: 14 * 0.75,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
            },
        },
        4: {
            fs: 12 * 0.75,
            vt: 2,
            pd: {
                l: 5,
            },
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
            },
        },
        5: {
            ht: 2,
            vt: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
            },
        },
        6: {
            ht: 1,
            vt: 2,
            tb: 3,
            bg: {
                rgb: 'rgba(244,79,86)',
            },
            cl: {
                rgb: 'rgb(255,255,255)',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(217,217,217)',
                    },
                },
            },
        },
    },
    appVersion: '3.0.0-alpha',
    sheets: {
        'sheet-0001': {
            id: 'sheet-0001',
            name: 'sheet-0001',
            tabColor: 'blue',
            hidden: BooleanNumber.FALSE,
            rowCount: 12,
            columnCount: 11,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 40,
            cellData: {
                1: {
                    1: {
                        v: 'Variants',
                        s: '2',
                    },
                    2: {
                        v: 'Platform',
                        s: '2',
                    },
                    3: {
                        v: 'UGC Buzz volume',
                        s: '2',
                    },
                    9: {
                        p: PAGE5_RICHTEXT_1,
                        s: '6',
                    },
                },
                2: {
                    3: {
                        v: "Jul'21",
                        s: '1',
                    },
                    4: {
                        v: "Aug'21",
                        s: '1',
                    },
                    5: {
                        v: "Sep'21",
                        s: '1',
                    },
                    6: {
                        v: "Oct'21",
                        s: '1',
                    },
                    7: {
                        v: "Nov'21",
                        s: '1',
                    },
                    8: {
                        v: "Dec'21",
                        s: '1',
                    },
                },
                3: {
                    1: {
                        v: 'Eleva',
                        s: '3',
                    },
                    2: {
                        v: 'Amazon',
                        s: '4',
                    },
                    3: {
                        v: '4',
                        s: '5',
                    },
                    4: {
                        v: '145',
                        s: '5',
                    },
                    5: {
                        v: '44',
                        s: '5',
                    },
                    6: {
                        v: '20',
                        s: '5',
                    },
                    7: {
                        v: '7',
                        s: '5',
                    },
                    8: {
                        v: '12',
                        s: '5',
                    },
                },
                4: {
                    2: {
                        v: 'Google',
                        s: '4',
                    },
                    3: {
                        v: '2',
                        s: '5',
                    },
                    4: {
                        v: '6',
                        s: '5',
                    },
                    5: {
                        v: '5',
                        s: '5',
                    },
                    6: {
                        v: '6',
                        s: '5',
                    },
                    7: {
                        v: '12',
                        s: '5',
                    },
                    8: {
                        v: '3113',
                        s: '5',
                    },
                },
                5: {
                    2: {
                        v: 'Amazon',
                        s: '4',
                    },
                    3: {
                        v: '14',
                        s: '5',
                    },
                    4: {
                        v: '13',
                        s: '5',
                    },
                    5: {
                        v: '6',
                        s: '5',
                    },
                    6: {
                        v: '6',
                        s: '5',
                    },
                    7: {
                        v: '11',
                        s: '5',
                    },
                    8: {
                        v: '2',
                        s: '5',
                    },
                },
                6: {
                    1: {
                        v: 'Similac',
                        s: '3',
                    },
                    2: {
                        v: 'SaleForce',
                        s: '4',
                    },
                    3: {
                        v: '451',
                        s: '5',
                    },
                    4: {
                        v: '255',
                        s: '5',
                    },
                    5: {
                        v: '72',
                        s: '5',
                    },
                    6: {
                        v: '23',
                        s: '5',
                    },
                    7: {
                        v: '163',
                        s: '5',
                    },
                    8: {
                        v: '22',
                        s: '5',
                    },
                },
                7: {
                    2: {
                        v: 'Oracle',
                        s: '4',
                    },
                    3: {
                        v: '0',
                        s: '5',
                    },
                    4: {
                        v: '1',
                        s: '5',
                    },
                    5: {
                        v: '1136',
                        s: '5',
                    },
                    6: {
                        v: '11',
                        s: '5',
                    },
                    7: {
                        v: '2',
                        s: '5',
                    },
                    8: {
                        v: '1',
                        s: '5',
                    },
                },
                8: {
                    2: {
                        v: 'Apple',
                        s: '4',
                    },
                    3: {
                        v: '7',
                        s: '5',
                    },
                    4: {
                        v: '2',
                        s: '5',
                    },
                    5: {
                        v: '10',
                        s: '5',
                    },
                    6: {
                        v: '5',
                        s: '5',
                    },
                    7: {
                        v: '6',
                        s: '5',
                    },
                    8: {
                        v: '3',
                        s: '5',
                    },
                },
                9: {
                    1: {
                        v: 'TC',
                        s: '3',
                    },
                    2: {
                        v: 'IBM',
                        s: '4',
                    },
                    3: {
                        v: '1',
                        s: '5',
                    },
                    4: {
                        v: '12',
                        s: '5',
                    },
                    5: {
                        v: '2',
                        s: '5',
                    },
                    6: {
                        v: '1',
                        s: '5',
                    },
                    7: {
                        v: '1',
                        s: '5',
                    },
                    8: {
                        v: '1',
                        s: '5',
                    },
                },
                10: {
                    2: {
                        v: 'Google',
                        s: '4',
                    },
                    3: {
                        v: '26',
                        s: '5',
                    },
                    4: {
                        v: '33',
                        s: '5',
                    },
                    5: {
                        v: '33',
                        s: '5',
                    },
                    6: {
                        v: '6',
                        s: '5',
                    },
                    7: {
                        v: '22',
                        s: '5',
                    },
                    8: {
                        v: '8',
                        s: '5',
                    },
                },
            },
            mergeData: [
                {
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                },
                {
                    startRow: 1,
                    endRow: 2,
                    startColumn: 2,
                    endColumn: 2,
                },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 3,
                    endColumn: 8,
                },
                {
                    startRow: 3,
                    endRow: 5,
                    startColumn: 1,
                    endColumn: 1,
                },
                {
                    startRow: 6,
                    endRow: 8,
                    startColumn: 1,
                    endColumn: 1,
                },
                {
                    startRow: 9,
                    endRow: 10,
                    startColumn: 1,
                    endColumn: 1,
                },
                {
                    startRow: 1,
                    endRow: 10,
                    startColumn: 9,
                    endColumn: 10,
                },
            ],

            rowData: {
                0: {
                    h: 20,
                },
            },
            columnData: {
                0: {
                    w: 20,
                },
                2: {
                    w: 120,
                },
                3: {
                    w: 60,
                },
                4: {
                    w: 60,
                },
                5: {
                    w: 60,
                },
                6: {
                    w: 60,
                },
                7: {
                    w: 60,
                },
                8: {
                    w: 60,
                },
            },
            showGridlines: 0,
            rowHeader: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnHeader: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            rightToLeft: BooleanNumber.FALSE,
        },
    },
    // namedRanges: [
    //     {
    //         namedRangeId: 'named-rang',
    //         name: 'namedRange',
    //         range: {
    //             sheetId: 'sheet-0001',
    //             range: {
    //                 startRow: 0,
    //                 startColumn: 0,
    //                 endRow: 1,
    //                 endColumn: 1,
    //             },
    //         },
    //     },
    // ],
};
