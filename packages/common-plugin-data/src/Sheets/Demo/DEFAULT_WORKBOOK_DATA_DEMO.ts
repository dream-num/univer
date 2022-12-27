import { BlockType, BooleanNumber, BorderStyleTypes, IDocumentData, IWorkbookConfig, LocaleType, ParagraphElementType, SheetTypes } from '@univer/core';
import { PAGE5_RICHTEXT_1 } from '../../Slides/RichText/PAGE5_RICHTEXT_1';

const richTextDemo: IDocumentData = {
    id: 'd',
    body: {
        blockElements: {
            oneParagraph: {
                blockId: 'oneParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Instructions:',
                                ts: {
                                    cl: {
                                        rgb: 'rgb(92,92,92)',
                                    },
                                },
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '①Project division - Fill in the specific division of labor after the project is disassembled:',
                                ts: {
                                    cl: {
                                        rgb: 'rgb(92,92,92)',
                                    },
                                },
                            },
                        },
                        threeElement: {
                            eId: 'threeElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: "②Responsible Person - Enter the responsible person's name here:",
                                ts: {
                                    cl: {
                                        rgb: 'rgb(92,92,92)',
                                    },
                                },
                            },
                        },
                        fourElement: {
                            eId: 'fourElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example,',
                                ts: {
                                    cl: {
                                        rgb: 'rgb(92,92,92)',
                                    },
                                },
                            },
                        },
                        fiveElement: {
                            eId: 'fiveElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'the specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. ',
                                ts: {
                                    cl: {
                                        rgb: 'rgb(92,92,92)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'breakElement',
                            paragraphElementType: ParagraphElementType.PAGE_BREAK,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'breakElement1',
                            paragraphElementType: ParagraphElementType.PAGE_BREAK,
                        },
                        {
                            elementId: 'threeElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'breakElement2',
                            paragraphElementType: ParagraphElementType.PAGE_BREAK,
                        },
                        {
                            elementId: 'fourElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'breakElement2',
                            paragraphElementType: ParagraphElementType.PAGE_BREAK,
                        },
                        {
                            elementId: 'fiveElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                    paragraphStyle: {
                        spaceAbove: 10,
                        lineSpacing: 1.2,
                    },
                },
            },
        },
        blockElementOrder: ['oneParagraph'],
    },
    documentStyle: {
        pageSize: {
            width: Infinity,
            height: Infinity,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

const richTextDemo1: IDocumentData = {
    id: 'd',
    body: {
        blockElements: {
            oneParagraph: {
                blockId: 'oneParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'No.',
                                ts: {
                                    cl: {
                                        rgb: '#000',
                                    },
                                    fs: 20,
                                },
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '2824163',
                                ts: {
                                    cl: {
                                        rgb: 'rgb(255,0,0)',
                                    },
                                    fs: 20,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
        },
        blockElementOrder: ['oneParagraph'],
    },
    documentStyle: {
        pageSize: {
            width: Infinity,
            height: Infinity,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

export const DEFAULT_WORKBOOK_DATA_DEMO: IWorkbookConfig = {
    id: 'workbook-01',
    theme: 'default',
    locale: LocaleType.EN,
    creator: 'univer',
    name: 'UniverSheet Demo',
    skin: 'default',
    socketUrl: '',
    socketEnable: BooleanNumber.FALSE,
    extensions: [],
    sheetOrder: [],
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
                v: 0,
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
        '56': {
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
        '57': {
            ht: 1,
            vt: 2,
            tb: 3,
            bg: {
                rgb: '#6fa8dc',
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
    timeZone: 'GMT+8',
    createdTime: '2021-11-28 12:10:10',
    modifiedTime: '2021-11-29 12:10:10',
    appVersion: '3.0.0-alpha',
    lastModifiedBy: 'univer',
    sheets: {
        'sheet-0004': {
            type: SheetTypes.GRID,
            id: 'sheet-0004',
            name: 'sheet0004',
            cellData: {
                '0': {
                    '0': {
                        s: '40',
                    },
                    '1': {
                        m: 'Travel Declaration Form',
                        s: '40',
                    },
                    '8': {
                        p: richTextDemo1,
                        s: '41',
                    },
                    '10': {
                        s: '52',
                    },
                },
                '1': {
                    '1': {
                        m: 'Department:',
                        s: '42',
                    },
                    '6': {
                        m: 'Application Date:',
                        s: '42',
                    },
                },
                '2': {
                    '1': {
                        m: 'Business Trip Employee',
                        s: '43',
                    },
                    '2': {
                        s: '46',
                    },
                    '3': {
                        m: 'Position',
                        s: '46',
                    },
                    '4': {
                        s: '46',
                    },
                    '6': {
                        s: '46',
                        m: 'Entourage',
                    },
                    '7': {
                        s: '47',
                    },
                    '10': {
                        m: 'Borrower write-off',
                        s: '53',
                    },
                },
                '3': {
                    '1': {
                        m: 'Business Trip Place',
                        s: '44',
                    },
                    '2': {
                        m: '                      To                      To                      To',
                        s: '48',
                    },
                },
                '4': {
                    '1': {
                        m: 'Amount',
                        s: '44',
                    },
                    '2': {
                        m: '(Capital)         万        仟        佰        拾        元        角        分',
                        s: '49',
                    },
                    '7': {
                        m: '(Lower) ¥',
                        s: '48',
                    },
                },
                '5': {
                    '1': {
                        m: 'Departure Time',
                        s: '44',
                    },
                    '2': {
                        s: '49',
                    },
                    '3': {
                        m: 'ETR',
                        s: '50',
                    },
                    '5': {
                        s: '50',
                    },
                    '8': {
                        m: 'Days',
                        s: '50',
                    },
                    '9': {
                        s: '48',
                    },
                },
                '6': {
                    '1': {
                        m: 'Reasons',
                        s: '44',
                    },
                    '2': {
                        s: '48',
                    },
                },
                '7': {
                    '1': {
                        m: 'Applicant For Travel',
                        s: '44',
                    },
                    '2': {
                        s: '50',
                    },
                    '3': {
                        m: 'Administrator',
                        s: '50',
                    },
                    '4': {
                        s: '50',
                    },
                    '6': {
                        m: 'Financial Manager',
                        s: '50',
                    },
                    '7': {
                        s: '50',
                    },
                    '9': {
                        m: 'Payee',
                        s: '51',
                    },
                },
                '8': {
                    '1': {
                        m: 'Department Head',
                        s: '44',
                    },
                    '2': {
                        s: '50',
                    },
                    '3': {
                        m: 'Manager',
                        s: '50',
                    },
                    '4': {
                        s: '50',
                    },
                    '6': {
                        m: 'Cashier',
                        s: '50',
                    },
                    '7': {
                        s: '50',
                    },
                    '9': {
                        s: '51',
                    },
                },
                '9': {
                    '1': {
                        m: 'Record: The loan is used exclusively for travel expenses, and the travel expenses will not be written off without a business trip application.',
                        s: '45',
                    },
                },
            },
            tabColor: 'blue',
            hidden: BooleanNumber.FALSE,
            freezeColumn: 1,
            rowCount: 10,
            columnCount: 11,
            freezeRow: 1,
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
                '0': {
                    h: 50,
                },
                '1': {
                    h: 20,
                },
                '6': {
                    h: 150,
                },
                '9': {
                    h: 30,
                },
            },
            columnData: {
                '0': {
                    w: 20,
                },
                '1': {
                    w: 180,
                },
                '2': {
                    w: 120,
                },
                '4': {
                    w: 60,
                },
                '5': {
                    w: 60,
                },
                '7': {
                    w: 30,
                },
                '8': {
                    w: 90,
                },
                '10': {
                    w: 40,
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
        'sheet-0003': {
            type: SheetTypes.GRID,
            id: 'sheet-0003',
            name: 'sheet0003',
            cellData: {
                '0': {
                    '1': {
                        m: 'Purchase Orders ',
                        s: '56',
                    },
                    '4': {
                        s: '31',
                    },
                    '5': {
                        m: 'Number:',
                        s: '32',
                    },
                    '6': {
                        s: '31',
                    },
                    '7': {
                        p: PAGE5_RICHTEXT_1,
                        s: '57',
                    },
                },
                '1': {
                    '4': {
                        s: '31',
                    },
                },
                '2': {
                    '4': {
                        m: '[Company]:',
                        s: '33',
                    },
                    '5': {
                        s: '34',
                    },
                },
                '3': {
                    '4': {
                        m: '[Adress]:',
                        s: '33',
                    },
                    '5': {
                        s: '34',
                    },
                },
                '4': {
                    '4': {
                        m: '[TEL]:',
                        s: '33',
                    },
                    '5': {
                        s: '34',
                    },
                },
                '5': {
                    '4': {
                        m: '[FAX]:',
                        s: '33',
                    },
                    '5': {
                        s: '34',
                    },
                },
                '6': {
                    '1': {
                        s: '32',
                    },
                },
                '7': {
                    '1': {
                        m: 'Subscriber:',
                        s: '32',
                    },
                    '2': {
                        s: '34',
                    },
                    '3': {
                        m: 'Order Date:',
                        s: '32',
                    },
                    '4': {
                        s: '34',
                    },
                    '5': {
                        m: 'Telephone:',
                        s: '32',
                    },
                    '6': {
                        s: '34',
                    },
                },
                '8': {
                    '1': {
                        m: 'Payment:',
                        s: '32',
                    },
                    '2': {
                        s: '34',
                    },
                    '3': {
                        m: 'Delivery:',
                        s: '32',
                    },
                    '4': {
                        s: '34',
                    },
                    '5': {
                        s: '32',
                    },
                    '6': {
                        s: '32',
                    },
                },
                '9': {
                    '1': {
                        s: '32',
                    },
                },
                '10': {
                    '1': {
                        m: 'SKU',
                        s: '35',
                    },
                    '2': {
                        m: 'Product name ',
                        s: '35',
                    },
                    '4': {
                        m: 'Quantity',
                        s: '35',
                    },
                    '5': {
                        m: 'Price',
                        s: '35',
                    },
                    '6': {
                        m: 'Amount',
                        s: '35',
                    },
                },
                '11': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                        m: '1',
                        v: '1',
                    },
                    '5': {
                        s: '36',
                        m: '10',
                        v: '10',
                    },
                    '6': {
                        s: '36',
                        m: '10',
                        v: '10',
                    },
                },
                '12': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                        m: '2',
                        v: '2',
                    },
                    '5': {
                        s: '36',
                        m: '10',
                        v: '10',
                    },
                    '6': {
                        s: '36',
                        m: '20',
                        v: '20',
                    },
                },
                '13': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                        m: '2',
                        v: '2',
                    },
                    '5': {
                        s: '36',
                        m: '2',
                        v: '2',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '14': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                    },
                    '5': {
                        s: '36',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '15': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                    },
                    '5': {
                        s: '36',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '16': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                    },
                    '5': {
                        s: '36',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '17': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                    },
                    '5': {
                        s: '36',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '18': {
                    '1': {
                        s: '36',
                    },
                    '2': {
                        s: '36',
                    },
                    '3': {
                        s: '36',
                    },
                    '4': {
                        s: '36',
                    },
                    '5': {
                        s: '36',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '19': {
                    '1': {
                        m: 'Remark ',
                        s: '37',
                    },
                    '2': {
                        m: 'If there is any problem, please list the specific reasons in writing and fax to contact the company.',
                        s: '38',
                    },
                    '5': {
                        m: 'Subtotal',
                        s: '39',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '20': {
                    '5': {
                        m: 'Tax',
                        s: '39',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '21': {
                    '5': {
                        m: 'Freight',
                        s: '39',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '22': {
                    '5': {
                        m: 'Total ',
                        s: '39',
                    },
                    '6': {
                        s: '36',
                    },
                },
                '23': {
                    '1': {
                        s: '32',
                    },
                },
                '24': {
                    '1': {
                        m: 'Approval of Responsible Person:',
                        s: '55',
                    },
                    '2': {
                        s: '34',
                    },
                    '3': {
                        m: 'Accountant:',
                        s: '55',
                    },
                    '4': {
                        s: '34',
                    },
                    '5': {
                        m: 'Responsible Person:',
                        s: '55',
                    },
                    '6': {
                        s: '34',
                    },
                },
                '25': {
                    '1': {
                        m: 'Company:',
                        s: '55',
                    },
                    '2': {
                        s: '34',
                    },
                    '3': {
                        s: '32',
                    },
                    '4': {
                        s: '32',
                    },
                    '5': {
                        m: 'Date:',
                        s: '55',
                    },
                    '6': {
                        s: '34',
                    },
                },
                '26': {
                    '1': {
                        s: '54',
                    },
                },
            },
            tabColor: 'green',
            hidden: BooleanNumber.FALSE,
            freezeColumn: 1,
            rowCount: 100,
            columnCount: 8,
            freezeRow: 1,
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
                '9': {
                    h: 10,
                },
                '23': {
                    h: 30,
                },
                '24': {
                    h: 70,
                },
            },
            columnData: {
                '0': {
                    w: 30,
                },
                '1': {
                    w: 80,
                },
                '2': {
                    w: 120,
                },
                '3': {
                    w: 80,
                },
                '7': {
                    w: 200,
                },
            },
            status: 0,
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
            status: 0,
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
        'sheet-0001': {
            type: SheetTypes.GRID,
            id: 'sheet-0001',
            cellData: {
                '0': {
                    '0': {
                        s: '1',
                        m: 'A Schedule of Items',
                    },
                },
                '1': {
                    '0': {
                        s: '2',
                        m: 'Division of Project',
                    },
                    '1': {
                        s: '3',
                        m: 'Responsible Person',
                    },
                    '2': {
                        s: '4',
                        m: 'Date',
                    },
                },
                '2': {
                    '0': {
                        m: 'General Project Manager',
                        s: '5',
                    },
                    '1': {
                        m: '@XXX',
                        s: '6',
                    },
                    '2': {
                        m: 'March 1',
                        s: '5',
                    },
                    '3': {
                        m: 'March 2',
                        s: '5',
                    },
                    '4': {
                        m: 'March 3',
                        s: '5',
                    },
                    '5': {
                        m: 'March 4',
                        s: '5',
                    },
                    '6': {
                        m: 'March 5',
                        s: '5',
                    },
                    '7': {
                        m: 'March 6',
                        s: '5',
                    },
                    '8': {
                        m: 'March 7',
                        s: '5',
                    },
                    '9': {
                        m: 'March 8',
                        s: '5',
                    },
                    '10': {
                        m: 'March 9',
                        s: '5',
                    },
                    '11': {
                        m: 'March 10',
                        s: '5',
                    },
                    '12': {
                        m: 'March 11',
                        s: '5',
                    },
                    '13': {
                        m: 'March 12',
                        s: '5',
                    },
                    '14': {
                        m: 'March 13',
                        s: '5',
                    },
                },
                '3': {
                    '0': {
                        m: '1、Responsible Person of Model Section',
                        s: '7',
                    },
                    '1': {
                        m: '@George',
                        s: '8',
                    },
                },
                '4': {
                    '0': {
                        m: 'Advertisement Signboard',
                        s: '9',
                    },
                    '1': {
                        m: '@Paul',
                        s: '6',
                    },
                    '4': {
                        s: '10',
                    },
                    '5': {
                        s: '10',
                    },
                    '6': {
                        s: '10',
                    },
                    '7': {
                        s: '10',
                    },
                    '8': {
                        s: '10',
                    },
                    '9': {
                        s: '10',
                    },
                    '10': {
                        s: '10',
                    },
                },
                '5': {
                    '0': {
                        m: 'Transport Ready',
                        s: '9',
                    },
                    '1': {
                        m: '@George',
                        s: '6',
                    },
                },
                '6': {
                    '0': {
                        m: '2、Head of Special Effects Section',
                        s: '7',
                    },
                    '1': {
                        m: '@Paul',
                        s: '8',
                    },
                },
                '7': {
                    '0': {
                        m: 'Render Output Parameter Test',
                        s: '9',
                    },
                    '1': {
                        m: '@Paul',
                        s: '6',
                    },
                    '3': {
                        s: '25',
                    },
                    '4': {
                        s: '25',
                    },
                    '5': {
                        s: '25',
                    },
                    '6': {
                        s: '25',
                    },
                    '7': {
                        s: '25',
                    },
                    '8': {
                        s: '25',
                    },
                    '9': {
                        s: '25',
                    },
                },
                '8': {
                    '0': {
                        m: 'Camera Moving Mirror',
                        s: '9',
                    },
                    '1': {
                        m: '@Paul',
                        s: '6',
                    },
                },
                '9': {
                    '0': {
                        m: '3、Responsible Person of Rendering Section',
                        s: '7',
                    },
                    '1': {
                        m: '@Jennifer',
                        s: '8',
                    },
                },
                '10': {
                    '0': {
                        m: 'Scene Dynamic Element Design',
                        s: '9',
                    },
                    '7': {
                        s: '27',
                    },
                    '8': {
                        s: '27',
                    },
                    '9': {
                        s: '27',
                    },
                    '10': {
                        s: '27',
                    },
                    '11': {
                        s: '27',
                    },
                },
                '11': {
                    '0': {
                        m: 'Sky Map Selection',
                        s: '9',
                    },
                },
                '12': {
                    '0': {
                        m: 'Reference Scenario Data Collection',
                        s: '9',
                    },
                },
                '13': {
                    '0': {
                        m: 'Scene Dynamic Element Design',
                        s: '9',
                    },
                    '2': {
                        s: '29',
                    },
                    '3': {
                        s: '29',
                    },
                    '4': {
                        s: '29',
                    },
                    '5': {
                        s: '29',
                    },
                    '6': {
                        s: '29',
                    },
                    '7': {
                        s: '29',
                    },
                },
                '14': {
                    '0': {
                        p: richTextDemo,
                    },
                },
            },
            name: 'sheet0001',
            tabColor: 'red',
            hidden: BooleanNumber.FALSE,
            freezeColumn: 1,
            rowCount: 15,
            columnCount: 15,
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
                    endColumn: 14,
                },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 2,
                    endColumn: 14,
                },
                {
                    startRow: 14,
                    endRow: 14,
                    startColumn: 0,
                    endColumn: 14,
                },
            ],
            rowData: {
                '0': {
                    h: 70,
                },
                '2': {
                    h: 20,
                },
                '3': {
                    h: 20,
                },
                '4': {
                    h: 20,
                },
                '5': {
                    h: 20,
                },
                '6': {
                    h: 20,
                },
                '7': {
                    h: 20,
                },
                '8': {
                    h: 20,
                },
                '9': {
                    h: 20,
                },
                '10': {
                    h: 20,
                },
                '11': {
                    h: 20,
                },
                '12': {
                    h: 20,
                },
                '13': {
                    h: 20,
                },
                '14': {
                    h: 200,
                },
            },
            columnData: {
                '0': {
                    w: 250,
                },
                '1': {
                    w: 130,
                },
                '2': {
                    w: 60,
                },
                '3': {
                    w: 60,
                },
                '4': {
                    w: 60,
                },
                '5': {
                    w: 60,
                },
                '6': {
                    w: 60,
                },
                '7': {
                    w: 60,
                },
                '8': {
                    w: 60,
                },
                '9': {
                    w: 60,
                },
                '10': {
                    w: 60,
                },
                '11': {
                    w: 60,
                },
                '12': {
                    w: 60,
                },
                '13': {
                    w: 60,
                },
                '14': {
                    w: 60,
                },
            },
            status: 0,
            showGridlines: 1,
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
