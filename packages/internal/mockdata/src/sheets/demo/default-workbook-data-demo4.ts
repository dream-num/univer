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

import type { IDocumentData, IWorkbookData } from '@univerjs/core';
import { BooleanNumber, BorderStyleTypes, LocaleType } from '@univerjs/core';

const richTextDemo1: IDocumentData = {
    id: 'd',
    body: {
        dataStream: 'No.2824163\r\n',
        textRuns: [
            {
                st: 0,
                ed: 2,
                ts: {
                    cl: {
                        rgb: '#000',
                    },
                    fs: 20,
                },
            },
            {
                st: 3,
                ed: 10,
                ts: {
                    cl: {
                        rgb: 'rgb(255,0,0)',
                    },
                    fs: 20,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 10,
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

export const DEFAULT_WORKBOOK_DATA_DEMO4: IWorkbookData = {
    id: 'workbook-04',
    locale: LocaleType.ZH_CN,
    name: 'universheet',
    sheetOrder: ['sheet-0004'],
    styles: {
        1: {
            fs: 30,
            vt: 2,
            bl: 1,
            pd: {
                l: 5,
            },
        },
        2: {
            vt: 2,
            bl: 1,
            bg: {
                rgb: 'rgb(255,226,102)',
            },
            pd: {
                l: 5,
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
            bl: 1,
            bg: {
                rgb: 'rgb(255,226,102)',
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
        4: {
            bl: 1,
            vt: 2,
            pd: {
                l: 5,
            },
            bg: {
                rgb: 'rgb(255,226,102)',
            },
            ht: 2,
        },
        5: {
            vt: 2,
            pd: {
                l: 5,
            },
        },
        6: {
            vt: 2,
            ht: 2,
            fs: 12,
            cl: {
                rgb: 'rgb(1,136,251)',
            },
        },
        7: {
            vt: 2,
            pd: {
                l: 5,
            },
            bg: {
                rgb: 'rgb(255,251,224)',
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
        8: {
            vt: 2,
            ht: 2,
            cl: {
                rgb: 'rgb(1,136,251)',
            },
            pd: {
                l: 5,
            },
            bg: {
                rgb: 'rgb(255,251,224)',
            },
        },
        9: {
            vt: 2,
            pd: {
                l: 25,
            },
        },
        10: {
            bg: {
                rgb: '#bf9000',
            },
            pd: {
                l: 5,
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        11: {
            vt: 2,
            ht: 2,
            fs: 24,
            bg: {
                rgb: 'rgb(183,83,119)',
            },
            cl: {
                rgb: '#fff',
            },
        },
        12: {
            bg: {
                rgb: 'rgb(248,237,241)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        13: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: 'rgb(244,186,112)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        14: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: 'rgb(248,237,241)',
            },
            bd: {
                b: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(218,170,186)',
                    },
                },
            },
        },
        15: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: 'rgb(246,131,131)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        16: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: 'rgb(207,98,170)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        17: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: 'rgb(172,135,188)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        18: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: 'rgb(97,170,206)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        19: {
            vt: 2,
            ht: 2,
            cl: {
                rgb: '#fff',
            },
            bg: {
                rgb: 'rgb(244,186,112,0.5)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        20: {
            vt: 2,
            ht: 2,
            cl: {
                rgb: '#fff',
            },
            bg: {
                rgb: 'rgb(246,131,131,0.5)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        21: {
            vt: 2,
            ht: 2,
            cl: {
                rgb: '#fff',
            },
            bg: {
                rgb: 'rgb(207,98,170,0.5)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        22: {
            vt: 2,
            ht: 2,
            cl: {
                rgb: '#fff',
            },
            bg: {
                rgb: 'rgb(172,135,188,0.5)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        23: {
            vt: 2,
            ht: 2,
            cl: {
                rgb: '#fff',
            },
            bg: {
                rgb: 'rgb(97,170,206,0.5)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        24: {
            bg: {
                rgb: '#3d85c6',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        25: {
            bg: {
                rgb: '#c27ba0',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        26: {
            bg: {
                rgb: 'rgb(224, 102, 102)',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        27: {
            bg: {
                rgb: '#f90',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        28: {
            bg: {
                rgb: '#76a5af',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        29: {
            bg: {
                rgb: '#38761d',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        30: {
            vt: 2,
            ht: 2,
            fs: 30,
            bl: 1,
            bg: {
                rgb: '#6fa8dc',
            },
            cl: {
                rgb: '#fff',
            },
            bd: {
                t: null,
                l: null,
                r: null,
                b: null,
            },
        },
        31: {
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        32: {
            vt: 2,
            tb: 3,
            bd: {
                t: null,
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        33: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        34: {
            vt: 2,
            bd: {
                t: null,
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
            },
        },
        35: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: '#6fa8dc',
            },
            cl: {
                rgb: '#fff',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
            },
        },
        36: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
            },
        },
        37: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: '#6fa8dc',
            },
            fs: 14,
            cl: {
                rgb: '#fff',
            },
            // tr: {
            //     a: 90,
            //     v: 1,
            // },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
            },
        },
        38: {
            vt: 2,
            tb: 3,
            bg: {
                rgb: '#6fa8dc',
            },
            cl: {
                rgb: '#fff',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
            },
        },
        39: {
            vt: 2,
            ht: 2,
            bg: {
                rgb: '#6fa8dc',
            },
            cl: {
                rgb: '#fff',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#000',
                    },
                },
            },
        },
        40: {
            vt: 2,
            ht: 2,
            fs: 24,
            cl: {
                rgb: 'rgb(125,133,22)',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        41: {
            ht: 3,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        42: {
            vt: 2,
            cl: {
                rgb: 'rgb(125,133,22)',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        43: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        44: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        45: {
            vt: 2,
            tb: 3,
            pd: {
                l: 10,
                r: 10,
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        46: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        47: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        48: {
            vt: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        49: {
            vt: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        50: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        51: {
            vt: 2,
            ht: 2,
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'rgb(125,133,22)',
                    },
                },
            },
        },
        52: {
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        53: {
            ht: 2,
            vt: 2,
            tr: {
                a: 90,
                v: 1,
            },
            cl: {
                rgb: 'rgb(125,133,22)',
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        54: {
            bd: {
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
        55: {
            ht: 3,
            vt: 3,
            tb: 3,
            bd: {
                t: null,
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: '#fff',
                    },
                },
            },
        },
    },
    appVersion: '3.0.0-alpha',
    sheets: {
        'sheet-0004': {
            id: 'sheet-0004',
            name: 'sheet0004',
            cellData: {
                0: {
                    0: {
                        s: '40',
                    },
                    1: {
                        v: 'Travel Declaration Form',
                        s: '40',
                    },
                    8: {
                        p: richTextDemo1,
                        s: '41',
                    },
                    10: {
                        s: '52',
                    },
                },
                1: {
                    1: {
                        v: 'Department:',
                        s: '42',
                    },
                    6: {
                        v: 'Application Date:',
                        s: '42',
                    },
                },
                2: {
                    1: {
                        v: 'Business Trip Employee',
                        s: '43',
                    },
                    2: {
                        s: '46',
                    },
                    3: {
                        v: 'Position',
                        s: '46',
                    },
                    4: {
                        s: '46',
                    },
                    6: {
                        s: '46',
                        v: 'Entourage',
                    },
                    7: {
                        s: '47',
                    },
                    10: {
                        v: 'Borrower write-off',
                        s: '53',
                    },
                },
                3: {
                    1: {
                        v: 'Business Trip Place',
                        s: '44',
                    },
                    2: {
                        v: '                      To                      To                      To',
                        s: '48',
                    },
                },
                4: {
                    1: {
                        v: 'Amount',
                        s: '44',
                    },
                    2: {
                        v: '(Capital)         万        仟        佰        拾        元        角        分',
                        s: '49',
                    },
                    7: {
                        v: '(Lower) ¥',
                        s: '48',
                    },
                },
                5: {
                    1: {
                        v: 'Departure Time',
                        s: '44',
                    },
                    2: {
                        s: '49',
                    },
                    3: {
                        v: 'ETR',
                        s: '50',
                    },
                    5: {
                        s: '50',
                    },
                    8: {
                        v: 'Days',
                        s: '50',
                    },
                    9: {
                        s: '48',
                    },
                },
                6: {
                    1: {
                        v: 'Reasons',
                        s: '44',
                    },
                    2: {
                        s: '48',
                    },
                },
                7: {
                    1: {
                        v: 'Applicant For Travel',
                        s: '44',
                    },
                    2: {
                        s: '50',
                    },
                    3: {
                        v: 'Administrator',
                        s: '50',
                    },
                    4: {
                        s: '50',
                    },
                    6: {
                        v: 'Financial Manager',
                        s: '50',
                    },
                    7: {
                        s: '50',
                    },
                    9: {
                        v: 'Payee',
                        s: '51',
                    },
                },
                8: {
                    1: {
                        v: 'Department Head',
                        s: '44',
                    },
                    2: {
                        s: '50',
                    },
                    3: {
                        v: 'Manager',
                        s: '50',
                    },
                    4: {
                        s: '50',
                    },
                    6: {
                        v: 'Cashier',
                        s: '50',
                    },
                    7: {
                        s: '50',
                    },
                    9: {
                        s: '51',
                    },
                },
                9: {
                    1: {
                        v: 'Record: The loan is used exclusively for travel expenses, and the travel expenses will not be written off without a business trip application.',
                        s: '45',
                    },
                },
            },
            tabColor: 'blue',
            hidden: BooleanNumber.FALSE,
            rowCount: 10,
            columnCount: 11,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 40,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 10,
                    endColumn: 10,
                },
                {
                    startRow: 0,
                    endRow: 9,
                    startColumn: 0,
                    endColumn: 0,
                },
                {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 1,
                    endColumn: 7,
                },
                {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 8,
                    endColumn: 9,
                },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 1,
                    endColumn: 4,
                },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 6,
                    endColumn: 9,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 4,
                    endColumn: 5,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 7,
                    endColumn: 9,
                },
                {
                    startRow: 3,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 9,
                },
                {
                    startRow: 4,
                    endRow: 4,
                    startColumn: 2,
                    endColumn: 6,
                },
                {
                    startRow: 4,
                    endRow: 4,
                    startColumn: 7,
                    endColumn: 9,
                },
                {
                    startRow: 5,
                    endRow: 5,
                    startColumn: 3,
                    endColumn: 4,
                },
                {
                    startRow: 5,
                    endRow: 5,
                    startColumn: 5,
                    endColumn: 7,
                },
                {
                    startRow: 6,
                    endRow: 6,
                    startColumn: 2,
                    endColumn: 9,
                },
                {
                    startRow: 7,
                    endRow: 7,
                    startColumn: 4,
                    endColumn: 5,
                },
                {
                    startRow: 8,
                    endRow: 8,
                    startColumn: 7,
                    endColumn: 8,
                },
                {
                    startRow: 8,
                    endRow: 8,
                    startColumn: 4,
                    endColumn: 5,
                },
                {
                    startRow: 7,
                    endRow: 7,
                    startColumn: 7,
                    endColumn: 8,
                },
                {
                    startRow: 9,
                    endRow: 9,
                    startColumn: 1,
                    endColumn: 9,
                },
                {
                    startRow: 2,
                    endRow: 9,
                    startColumn: 10,
                    endColumn: 10,
                },
            ],
            rowData: {
                0: {
                    h: 50,
                },
                1: {
                    h: 20,
                },
                6: {
                    h: 150,
                },
                9: {
                    h: 30,
                },
            },
            columnData: {
                0: {
                    w: 20,
                },
                1: {
                    w: 180,
                },
                2: {
                    w: 120,
                },
                4: {
                    w: 60,
                },
                5: {
                    w: 60,
                },
                7: {
                    w: 30,
                },
                8: {
                    w: 90,
                },
                10: {
                    w: 40,
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
