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

export const DEFAULT_WORKBOOK_DATA_DEMO1: IWorkbookData = {
    id: 'workbook-right',
    locale: LocaleType.ZH_CN,
    name: 'universheet',
    sheetOrder: ['sheet-0003'],
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
        56: {
            vt: 2,
            ht: 2,
            fs: 30,
            bl: 1,
            bg: {
                rgb: '#9fc5e8',
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
    },
    appVersion: '3.0.0-alpha',
    sheets: {
        'sheet-0003': {
            id: 'sheet-0003',
            name: 'sheet0003',
            cellData: {
                0: {
                    1: {
                        s: '56',
                        v: 'Purchase Orders ',
                    },
                    4: {
                        s: '31',
                    },
                    5: {
                        s: '32',
                        v: 'Number:',
                    },
                    6: {
                        s: '31',
                    },
                },
                1: {
                    4: {
                        s: '31',
                    },
                },
                2: {
                    4: {
                        s: '33',
                        v: '[Company]:',
                    },
                    5: {
                        s: '34',
                    },
                },
                3: {
                    4: {
                        s: '33',
                        v: '[Adress]:',
                    },
                    5: {
                        s: '34',
                    },
                },
                4: {
                    4: {
                        s: '33',
                        v: '[TEL]:',
                    },
                    5: {
                        s: '34',
                    },
                },
                5: {
                    4: {
                        s: '33',
                        v: '[FAX]:',
                    },
                    5: {
                        s: '34',
                    },
                },
                6: {
                    1: {
                        s: '32',
                    },
                },
                7: {
                    1: {
                        s: '32',
                        v: 'Subscriber:',
                    },
                    2: {
                        s: '34',
                    },
                    3: {
                        s: '32',
                        v: 'Order Date:',
                    },
                    4: {
                        s: '34',
                    },
                    5: {
                        s: '32',
                        v: 'Telephone:',
                    },
                    6: {
                        s: '34',
                    },
                },
                8: {
                    1: {
                        s: '32',
                        v: 'Payment:',
                    },
                    2: {
                        s: '34',
                    },
                    3: {
                        s: '32',
                        v: 'Delivery:',
                    },
                    4: {
                        s: '34',
                    },
                    5: {
                        s: '32',
                    },
                    6: {
                        s: '32',
                    },
                },
                9: {
                    1: {
                        s: '32',
                    },
                },
                10: {
                    1: {
                        s: '35',
                        v: 'SKU',
                    },
                    2: {
                        s: '35',
                        v: 'Product name ',
                    },
                    4: {
                        s: '35',
                        v: 'Quantity',
                    },
                    5: {
                        s: '35',
                        v: 'Price',
                    },
                    6: {
                        s: '35',
                        v: 'Amount',
                    },
                },
                11: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                        v: '1',
                    },
                    5: {
                        s: '36',
                        v: '10',
                    },
                    6: {
                        s: '36',
                        v: '10',
                    },
                },
                12: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                        v: '2',
                    },
                    5: {
                        s: '36',
                        v: '10',
                    },
                    6: {
                        s: '36',
                        v: '20',
                    },
                },
                13: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                        v: '2',
                    },
                    5: {
                        s: '36',
                        v: '2',
                    },
                    6: {
                        s: '36',
                    },
                },
                14: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                    },
                    5: {
                        s: '36',
                    },
                    6: {
                        s: '36',
                    },
                },
                15: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                    },
                    5: {
                        s: '36',
                    },
                    6: {
                        s: '36',
                    },
                },
                16: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                    },
                    5: {
                        s: '36',
                    },
                    6: {
                        s: '36',
                    },
                },
                17: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                    },
                    5: {
                        s: '36',
                    },
                    6: {
                        s: '36',
                    },
                },
                18: {
                    1: {
                        s: '36',
                    },
                    2: {
                        s: '36',
                    },
                    3: {
                        s: '36',
                    },
                    4: {
                        s: '36',
                    },
                    5: {
                        s: '36',
                    },
                    6: {
                        s: '36',
                    },
                },
                19: {
                    1: {
                        s: '37',
                        v: 'Remark ',
                    },
                    2: {
                        s: '38',
                        v: 'If there is any problem, please list the specific reasons in writing and fax to contact the company.',
                    },
                    5: {
                        s: '39',
                        v: 'Subtotal',
                    },
                    6: {
                        s: '36',
                    },
                },
                20: {
                    5: {
                        s: '39',
                        v: 'Tax',
                    },
                    6: {
                        s: '36',
                    },
                },
                21: {
                    5: {
                        s: '39',
                        v: 'Freight',
                    },
                    6: {
                        s: '36',
                    },
                },
                22: {
                    5: {
                        s: '39',
                        v: 'Total ',
                    },
                    6: {
                        s: '36',
                    },
                },
                23: {
                    1: {
                        s: '32',
                    },
                },
                24: {
                    1: {
                        s: '55',
                        v: 'Approval of Responsible Person:',
                    },
                    2: {
                        s: '34',
                    },
                    3: {
                        s: '55',
                        v: 'Accountant:',
                    },
                    4: {
                        s: '34',
                    },
                    5: {
                        s: '55',
                        v: 'Responsible Person:',
                    },
                    6: {
                        s: '34',
                    },
                },
                25: {
                    1: {
                        s: '55',
                        v: 'Company:',
                    },
                    2: {
                        s: '34',
                    },
                    3: {
                        s: '32',
                    },
                    4: {
                        s: '32',
                    },
                    5: {
                        s: '55',
                        v: 'Date:',
                    },
                    6: {
                        s: '34',
                    },
                },
                26: {
                    1: {
                        s: '54',
                    },
                },
            },
            tabColor: 'green',
            hidden: BooleanNumber.FALSE,
            rowCount: 27,
            columnCount: 8,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 25,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 5,
                    startColumn: 1,
                    endColumn: 3,
                },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 4,
                    endColumn: 6,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 5,
                    endColumn: 6,
                },
                {
                    startRow: 3,
                    endRow: 3,
                    startColumn: 5,
                    endColumn: 6,
                },
                {
                    startRow: 4,
                    endRow: 4,
                    startColumn: 5,
                    endColumn: 6,
                },
                {
                    startRow: 5,
                    endRow: 5,
                    startColumn: 5,
                    endColumn: 6,
                },
                {
                    startRow: 6,
                    endRow: 6,
                    startColumn: 1,
                    endColumn: 6,
                },
                {
                    startRow: 9,
                    endRow: 9,
                    startColumn: 1,
                    endColumn: 6,
                },
                {
                    startRow: 10,
                    endRow: 10,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 11,
                    endRow: 11,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 12,
                    endRow: 12,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 13,
                    endRow: 13,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 14,
                    endRow: 14,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 15,
                    endRow: 15,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 16,
                    endRow: 16,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 17,
                    endRow: 17,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 18,
                    endRow: 18,
                    startColumn: 2,
                    endColumn: 3,
                },
                {
                    startRow: 19,
                    endRow: 22,
                    startColumn: 1,
                    endColumn: 1,
                },
                {
                    startRow: 19,
                    endRow: 22,
                    startColumn: 2,
                    endColumn: 4,
                },
                {
                    startRow: 23,
                    endRow: 23,
                    startColumn: 1,
                    endColumn: 6,
                },
                {
                    startRow: 0,
                    endRow: 26,
                    startColumn: 0,
                    endColumn: 0,
                },
                {
                    startRow: 0,
                    endRow: 26,
                    startColumn: 7,
                    endColumn: 7,
                },
                {
                    startRow: 26,
                    endRow: 26,
                    startColumn: 1,
                    endColumn: 6,
                },
            ],
            rowData: {
                9: {
                    h: 10,
                },
                23: {
                    h: 30,
                },
                24: {
                    h: 70,
                },
            },
            columnData: {
                0: {
                    w: 30,
                },
                1: {
                    w: 80,
                },
                2: {
                    w: 120,
                },
                3: {
                    w: 80,
                },
                7: {
                    w: 30,
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
    //             sheetId: 'sheet-0003',
    //             range: {
    //                 startRow: 0,
    //                 startColumn: 0,
    //                 endRow: 1,
    //                 endColumn: 1,
    //             },
    //         },
    //   },
    // ],
};
