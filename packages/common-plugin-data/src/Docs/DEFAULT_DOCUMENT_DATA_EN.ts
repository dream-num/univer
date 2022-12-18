import {
    BlockType,
    BooleanNumber,
    ColumnSeparatorType,
    IDocumentData,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    ParagraphElementType,
    PositionedObjectLayoutType,
    SectionType,
    WrapTextType,
} from '@univer/core';
import { DEFAULT_LIST_TEST } from './DEFAULT_LIST';

export const DEFAULT_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'd',
    drawings: {
        shapeTest1: {
            objectId: 'shapeTest1',
            objectProperties: {
                title: 'test shape',
                description: 'test shape',
                size: {
                    width: 1484 * 0.15,
                    height: 864 * 0.15,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 130,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 510,
                },
                angle: 0,
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/gartner-tech-2022.png',
                },
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
        shapeTest2: {
            objectId: 'shapeTest2',
            objectProperties: {
                title: 'test shape',
                description: 'test shape',
                size: {
                    width: 2548 * 0.1,
                    height: 2343 * 0.1,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 130,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 200,
                },
                angle: 0,
                imageProperties: {
                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/hype-cycle-for-emerging-tech-2022.png',
                },
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
    },
    lists: DEFAULT_LIST_TEST,
    body: {
        blockElements: {
            p1: {
                blockId: 'p1',
                st: 0,
                ed: 66,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 0,
                            ed: 66,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies',
                                ts: {
                                    bl: BooleanNumber.TRUE,
                                    fs: 24,
                                    cl: {
                                        rgb: 'rgb(0,40,86)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p2: {
                blockId: 'p2',
                st: 67,
                ed: 251,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        spaceAbove: 20,
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 67,
                            ed: 251,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Emerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and optimized technologist delivery.',
                                ts: {
                                    fs: 18,
                                    cl: {
                                        rgb: 'rgb(0,40,86)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p3: {
                blockId: 'p3',
                st: 252,
                ed: 401,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        spaceAbove: 20,
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 252,
                            ed: 401,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'The 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: ',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p4: {
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
                        },
                    },
                    paragraphStyle: {
                        lineSpacing: 1.5,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 402,
                            ed: 429,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Expand immersive experiences',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p5: {
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
                        },
                    },
                    paragraphStyle: {
                        lineSpacing: 1.5,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 430,
                            ed: 479,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Accelerate artificial intelligence (AI) automation',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p6: {
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
                        },
                    },
                    paragraphStyle: {
                        lineSpacing: 1.5,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 480,
                            ed: 510,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Optimize technologist delivery ',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p7: {
                blockId: 'p7',
                st: 511,
                ed: 705,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 511,
                            ed: 672,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'These technologies are expected to greatly impact business and society over the next two to 10 years, but will especially enable CIOs and IT leaders to deliver on',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                        e2: {
                            eId: 'e2',
                            st: 673,
                            ed: 705,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'digital business transformation. ',
                                ts: {
                                    fs: 16,
                                    cl: {
                                        rgb: 'rgb(0, 0, 211)',
                                    },
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'e2',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p8: {
                blockId: 'p8',
                st: 706,
                ed: 762,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        spaceAbove: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 706,
                            ed: 762,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Three Hype Cycle themes to think about in 2022 and beyond',
                                ts: {
                                    fs: 24,
                                    cl: {
                                        rgb: 'rgb(255,255,255)',
                                    },
                                    bg: {
                                        rgb: 'rgb(0,40,86)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p9: {
                blockId: 'p9',
                st: 763,
                ed: 1233,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        spaceAbove: 20,
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 763,
                            ed: 1233,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'The 2022 Gartner Hype Cycle features emerging technologies and distills insights from more than 2,000 technologies into a succinct high-potential set. Most technologies have multiple use cases but enterprise architecture and technology innovation leaders should prioritize those with the greatest potential benefit for their organization. (They will also need to launch a proof-of-concept project to demonstrate the feasibility of a technology for their target use case.)',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'shapeTest1',
                            paragraphElementType: ParagraphElementType.DRAWING,
                        },
                    ],
                },
            },
            oneSectionBreak: {
                blockId: 'oneSectionBreak',
                st: 0,
                ed: 0,
                blockType: BlockType.SECTION_BREAK,
                sectionBreak: {
                    columnProperties: [],
                    columnSeparatorType: ColumnSeparatorType.NONE,
                    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                    // textDirection: textDirectionDocument,
                    // contentDirection: textDirection!,
                },
            },
            p10: {
                blockId: 'p10',
                st: 1206 + 28,
                ed: 1548 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 1206 + 28,
                            ed: 1548 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'The benefit of these technologies is that they provide individuals with more control over their identities and data, and expand their range of experiences into virtual venues and ecosystems that can be integrated with digital currencies. These technologies also provide new ways to reach customers to strengthen or open up new revenue streams.',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p11: {
                blockId: 'p11',
                st: 1549 + 28,
                ed: 1944 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 1549 + 28,
                            ed: 1944 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Digital twin of the customer (DToC) is a dynamic virtual representation of a customer that simulates and learns to emulate and anticipate behavior. It can be used to modify and enhance the customer experience (CX) and support new digitalization efforts, products, services and opportunities. DToC will take five to 10 years until mainstream adoption but will be transformational to organizations.',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p12: {
                blockId: 'p12',
                st: 1945 + 28,
                ed: 2019 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 1945 + 28,
                            ed: 2019 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Other critical technologies in immersive experiences include the following:',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p13: {
                blockId: 'p13',
                st: 2020 + 28,
                ed: 2250 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    bullet: {
                        listId: 'unorderedTest',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 2020 + 28,
                            ed: 2042 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Decentralized identity ',
                                ts: {
                                    fs: 16,
                                    cl: {
                                        rgb: 'rgb(0, 0, 211)',
                                    },
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                        e2: {
                            eId: 'e2',
                            st: 2043 + 28,
                            ed: 2250 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '(DCI) allows an entity (typically a human user) to control their own digital identity by leveraging technologies such as blockchain or other distributed ledger technologies (DLTs), along with digital wallets.',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },

                        {
                            elementId: 'e2',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p14: {
                blockId: 'p14',
                st: 2251 + 28,
                ed: 2393 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    bullet: {
                        listId: 'unorderedTest',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 2251 + 28,
                            ed: 2265 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Digital humans ',
                                ts: {
                                    fs: 16,
                                    cl: {
                                        rgb: 'rgb(0, 0, 211)',
                                    },
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                        e2: {
                            eId: 'e2',
                            st: 2266 + 28,
                            ed: 2393 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'are interactive, AI-driven representations that have some of the characteristics, personality, knowledge and mindset of a human.',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'e2',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            p15: {
                blockId: 'p15',
                st: 2394 + 28,
                ed: 2582 + 28,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    paragraphStyle: {
                        indentFirstLine: 20,
                    },
                    bullet: {
                        listId: 'unorderedTest',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        e1: {
                            eId: 'e1',
                            st: 2394 + 28,
                            ed: 2422 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'Internal talent marketplaces ',
                                ts: {
                                    fs: 16,
                                    cl: {
                                        rgb: 'rgb(0, 0, 0)',
                                    },
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        },
                        e2: {
                            eId: 'e2',
                            st: 2423 + 28,
                            ed: 2582 + 28,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: 'match internal employees and, in some cases, a pool of contingent workers, to time-boxed projects and various work opportunities, with no recruiter involvement.',
                                ts: {
                                    fs: 16,
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'e1',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'e2',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            twoSectionBreak: {
                blockId: 'twoSectionBreak',
                st: 0,
                ed: 0,
                blockType: BlockType.SECTION_BREAK,
                sectionBreak: {
                    columnProperties: [
                        {
                            width: 200,
                            paddingEnd: 5,
                        },
                    ],
                    columnSeparatorType: ColumnSeparatorType.NONE,
                    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                    // textDirection: textDirectionDocument,
                    // contentDirection: textDirection!,
                },
            },
        },
        blockElementOrder: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'oneSectionBreak', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'twoSectionBreak'],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};
