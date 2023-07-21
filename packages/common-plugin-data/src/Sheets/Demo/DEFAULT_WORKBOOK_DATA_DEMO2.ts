import { BooleanNumber, BorderStyleTypes, ISpreadsheetConfig, LocaleType, SheetTypes } from '@univerjs/core';

export const DEFAULT_WORKBOOK_DATA_DEMO2: ISpreadsheetConfig = {
    id: 'workbook-01',
    theme: 'default',
    locale: LocaleType.EN,
    creator: 'univer',
    name: 'universheet',
    skin: 'default',
    socketUrl: '',
    socketEnable: BooleanNumber.FALSE,
    extensions: [],
    sheetOrder: ['sheet-0002'],
    pluginMeta: {},
    styles: {
        '1': {
            fs: 30,
            vt: 2,
            bl: 1,
            pd: {
                l: 5,
            },
        },
        '2': {
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
        '3': {
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
        '4': {
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
        '5': {
            vt: 2,
            pd: {
                l: 5,
            },
        },
        '6': {
            vt: 2,
            ht: 2,
            fs: 12,
            cl: {
                rgb: 'rgb(1,136,251)',
            },
        },
        '7': {
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
        '8': {
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
        '9': {
            vt: 2,
            pd: {
                l: 25,
            },
        },
        '10': {
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
        '11': {
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
        '12': {
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
        '13': {
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
        '14': {
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
        '15': {
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
        '16': {
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
        '17': {
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
        '18': {
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
        '19': {
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
        '20': {
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
        '21': {
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
        '22': {
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
        '23': {
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
        '24': {
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
        '25': {
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
        '26': {
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
        '27': {
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
        '28': {
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
        '29': {
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
        '30': {
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
        '31': {
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
        '32': {
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
        '33': {
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
        '34': {
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
        '35': {
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
        '36': {
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
        '37': {
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
        '38': {
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
        '39': {
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
        '40': {
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
        '41': {
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
        '42': {
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
        '43': {
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
        '44': {
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
        '45': {
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
        '46': {
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
        '47': {
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
        '48': {
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
        '49': {
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
        '50': {
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
        '51': {
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
        '52': {
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
        '53': {
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
        '54': {
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
        '55': {
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
    timeZone: 'GMT+8',
    createdTime: '2021-11-28 12:10:10',
    modifiedTime: '2021-11-29 12:10:10',
    appVersion: '3.0.0-alpha',
    lastModifiedBy: 'univer',
    sheets: {
        'sheet-0002': {
            type: SheetTypes.GRID,
            id: 'sheet-0002',
            name: 'sheet0003',
            cellData: {
                '0': {
                    '0': {
                        m: 'Annual Work Schedule',
                        s: '11',
                    },
                },
                '1': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '16': {
                        s: '12',
                    },
                },
                '2': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        m: '1/2',
                        s: '13',
                    },
                    '4': {
                        m: '3/8',
                        s: '15',
                    },
                    '7': {
                        m: '1/4',
                        s: '16',
                    },
                    '10': {
                        m: '1/4',
                        s: '17',
                    },
                    '13': {
                        m: '1/4',
                        s: '18',
                    },
                    '16': {
                        s: '12',
                    },
                },
                '3': {
                    '1': {
                        s: '12',
                    },
                },
                '4': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: 'Go to the party',
                        s: '14',
                    },
                    '3': {
                        m: '√',
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        m: '√',
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        m: '√',
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        m: '√',
                        s: '14',
                    },
                },
                '5': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: 'Purchase  Products',
                        s: '14',
                    },
                    '3': {
                        m: '√',
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        m: '√',
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        m: '√',
                        s: '14',
                    },
                },
                '6': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: '×××××',
                        s: '14',
                    },
                    '3': {
                        m: '√',
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        s: '14',
                    },
                },
                '7': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: '×××××',
                        s: '14',
                    },
                    '3': {
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        s: '14',
                    },
                },
                '8': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: '×××××',
                        s: '14',
                    },
                    '3': {
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        s: '14',
                    },
                },
                '9': {
                    '1': {
                        s: '12',
                    },
                },
                '10': {
                    '1': {
                        s: '12',
                    },
                    '2': {
                        s: '19',
                        m: 'January',
                    },
                    '3': {
                        s: '12',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        s: '20',
                        m: 'February',
                    },
                    '6': {
                        s: '12',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        s: '21',
                        m: 'March',
                    },
                    '9': {
                        s: '12',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        s: '22',
                        m: 'April',
                    },
                    '12': {
                        s: '12',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        s: '23',
                        m: 'May',
                    },
                    '15': {
                        s: '12',
                    },
                },
                '11': {
                    '1': {
                        s: '12',
                    },
                },
                '12': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        m: '1/3',
                        s: '13',
                    },
                    '4': {
                        m: '3/5',
                        s: '15',
                    },
                    '7': {
                        m: '1/2',
                        s: '16',
                    },
                    '10': {
                        m: '3/4',
                        s: '17',
                    },
                    '13': {
                        m: '5/6',
                        s: '18',
                    },
                    '16': {
                        s: '12',
                    },
                },
                '13': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: 'Go to the party',
                        s: '14',
                    },
                    '3': {
                        m: '√',
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        m: '√',
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        m: '√',
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        m: '√',
                        s: '14',
                    },
                },
                '14': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: 'Purchase Products',
                        s: '14',
                    },
                    '3': {
                        m: '√',
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        m: '√',
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        m: '√',
                        s: '14',
                    },
                },
                '15': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: '×××××',
                        s: '14',
                    },
                    '3': {
                        m: '√',
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        s: '14',
                    },
                },
                '16': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: '×××××',
                        s: '14',
                    },
                    '3': {
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        s: '14',
                    },
                },
                '17': {
                    '0': {
                        s: '12',
                    },
                    '1': {
                        s: '12',
                    },
                    '2': {
                        m: '×××××',
                        s: '14',
                    },
                    '3': {
                        s: '14',
                    },
                    '4': {
                        s: '12',
                    },
                    '5': {
                        m: '×××××',
                        s: '14',
                    },
                    '6': {
                        s: '14',
                    },
                    '7': {
                        s: '12',
                    },
                    '8': {
                        m: '×××××',
                        s: '14',
                    },
                    '9': {
                        s: '14',
                    },
                    '10': {
                        s: '12',
                    },
                    '11': {
                        m: '×××××',
                        s: '14',
                    },
                    '12': {
                        s: '14',
                    },
                    '13': {
                        s: '12',
                    },
                    '14': {
                        m: '×××××',
                        s: '14',
                    },
                    '15': {
                        s: '14',
                    },
                },
                '18': {
                    '0': {
                        s: '12',
                    },
                },
                '25': {
                    '0': {
                        m: '·',
                        s: '123',
                    },
                },
            },
            tabColor: 'yellow',
            hidden: BooleanNumber.FALSE,
            freezeColumn: 1,
            rowCount: 26,
            columnCount: 17,
            freezeRow: 1,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 32,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 16,
                },
                {
                    startRow: 1,
                    endRow: 17,
                    startColumn: 0,
                    endColumn: 0,
                },
                {
                    startRow: 1,
                    endRow: 17,
                    startColumn: 16,
                    endColumn: 16,
                },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 1,
                    endColumn: 15,
                },
                {
                    startRow: 3,
                    endRow: 3,
                    startColumn: 1,
                    endColumn: 15,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 3,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 4,
                    endColumn: 6,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 7,
                    endColumn: 9,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 10,
                    endColumn: 12,
                },
                {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 13,
                    endColumn: 15,
                },
                {
                    startRow: 9,
                    endRow: 9,
                    startColumn: 1,
                    endColumn: 15,
                },
                {
                    startRow: 11,
                    endRow: 11,
                    startColumn: 1,
                    endColumn: 15,
                },
                {
                    startRow: 12,
                    endRow: 12,
                    startColumn: 1,
                    endColumn: 3,
                },
                {
                    startRow: 12,
                    endRow: 12,
                    startColumn: 4,
                    endColumn: 6,
                },
                {
                    startRow: 12,
                    endRow: 12,
                    startColumn: 7,
                    endColumn: 9,
                },
                {
                    startRow: 12,
                    endRow: 12,
                    startColumn: 10,
                    endColumn: 12,
                },
                {
                    startRow: 12,
                    endRow: 12,
                    startColumn: 13,
                    endColumn: 15,
                },
                {
                    startRow: 18,
                    endRow: 22,
                    startColumn: 0,
                    endColumn: 16,
                },
            ],
            rowData: {
                '0': {
                    h: 70,
                },
                '3': {
                    h: 20,
                },
                '9': {
                    h: 20,
                },
                '10': {
                    h: 40,
                },
                '11': {
                    h: 20,
                },
            },
            columnData: {
                '0': {
                    w: 50,
                },
                '1': {
                    w: 20,
                },
                '2': {
                    w: 150,
                },
                '3': {
                    w: 30,
                },
                '4': {
                    w: 20,
                },
                '5': {
                    w: 150,
                },
                '6': {
                    w: 30,
                },
                '7': {
                    w: 20,
                },
                '8': {
                    w: 150,
                },
                '9': {
                    w: 30,
                },
                '10': {
                    w: 20,
                },
                '11': {
                    w: 150,
                },
                '12': {
                    w: 30,
                },
                '13': {
                    w: 20,
                },
                '14': {
                    w: 150,
                },
                '15': {
                    w: 30,
                },
                '16': {
                    w: 50,
                },
            },
            status: 1,
            showGridlines: 0,
            hideRow: [],
            hideColumn: [],
            rowTitle: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnTitle: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            selections: ['A2'],
            rightToLeft: BooleanNumber.FALSE,
            pluginMeta: {},
        },
    },
    namedRanges: [
        {
            namedRangeId: 'named-rang',
            name: 'namedRange',
            range: {
                sheetId: 'sheet-0001',
                rangeData: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 1,
                },
            },
        },
    ],
};
