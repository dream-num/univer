import { BlockType, BooleanNumber, IDocumentData, ParagraphElementType } from '@univerjs/core';
import { DEFAULT_LIST_TEST } from '../../Docs/DEFAULT_LIST';

export const PAGE5_RICHTEXT_1: IDocumentData = {
    id: 'd',
    lists: DEFAULT_LIST_TEST,
    body: {
        blockElements: [
            {
                blockId: 'p1',
                st: 0,
                ed: 66,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    elements: [
                        {
                            eId: 'e1',
                            st: 0,
                            ed: 66,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies',
                                ts: {
                                    bl: BooleanNumber.TRUE,
                                    fs: 16,
                                    cl: {
                                        rgb: 'rgb(255,255,255)',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p2',
                st: 67,
                ed: 251,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        spaceAbove: 20,
                        indentFirstLine: 20,
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 67,
                            ed: 251,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Emerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and optimized technologist delivery.',
                                ts: {
                                    fs: 12,
                                    cl: {
                                        rgb: 'rgb(0,40,86)',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p3',
                st: 252,
                ed: 401,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        spaceAbove: 20,
                        indentFirstLine: 20,
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 252,
                            ed: 401,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'The 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: ',
                                ts: {
                                    fs: 12,
                                    cl: {
                                        rgb: 'rgb(249,249,249)',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p4',
                st: 402,
                ed: 429,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                            cl: {
                                rgb: 'rgb(249,249,249)',
                            },
                        },
                    },
                    paragraphStyle: {
                        lineSpacing: 1.5,
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 402,
                            ed: 429,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Expand immersive experiences',
                                ts: {
                                    fs: 12,
                                    cl: {
                                        rgb: 'rgb(249,249,249)',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p13',
                st: 2020 + 28,
                ed: 2250 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 2020 + 28,
                            ed: 2042 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Decentralized identity ',
                                ts: {
                                    fs: 12,
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p14',
                st: 2251 + 28,
                ed: 2393 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 2251 + 28,
                            ed: 2265 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Digital humans ',
                                ts: {
                                    fs: 12,

                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p5',
                st: 430,
                ed: 479,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                            cl: {
                                rgb: 'rgb(249,249,249)',
                            },
                        },
                    },
                    paragraphStyle: {
                        lineSpacing: 1.5,
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 430,
                            ed: 479,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Accelerate artificial intelligence (AI) automation',
                                ts: {
                                    fs: 12,
                                    cl: {
                                        rgb: 'rgb(249,249,249)',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p15',
                st: 2394 + 28,
                ed: 2582 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 2394 + 28,
                            ed: 2422 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Internal talent marketplaces ',
                                ts: {
                                    fs: 12,
                                    cl: {
                                        rgb: 'rgb(0, 0, 0)',
                                    },
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                    ],
                },
            },
            {
                blockId: 'p6',
                st: 480,
                ed: 510,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                            cl: {
                                rgb: 'rgb(249,249,249)',
                            },
                        },
                    },
                    paragraphStyle: {
                        lineSpacing: 1.5,
                    },
                    elements: [
                        {
                            eId: 'e1',
                            st: 480,
                            ed: 510,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Optimize technologist delivery ',
                                ts: {
                                    fs: 12,
                                    cl: {
                                        rgb: 'rgb(249,249,249)',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: undefined,
            height: undefined,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};
