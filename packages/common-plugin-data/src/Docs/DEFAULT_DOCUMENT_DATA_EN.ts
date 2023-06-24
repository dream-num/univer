import { BooleanNumber, ColumnSeparatorType, IDocumentData, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, SectionType, WrapTextType } from '@univerjs/core';
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
        dataStream:
            'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\rEmerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and optimized technologist delivery.\rThe 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: \rExpand immersive experiences\rAccelerate artificial intelligence (AI) automation\rOptimize technologist delivery \rThese technologies are expected to greatly impact business and society over the next two to 10 years, but will especially enable CIOs and IT leaders to deliver on\rThree Hype Cycle themes to think about in 2022 and beyond\rThe 2022 Gartner Hype Cycle features emerging technologies and distills insights from more than 2,000 technologies into a succinct high-potential set. Most technologies have multiple use cases but enterprise architecture and technology innovation leaders should prioritize those with the greatest potential benefit for their organization. (They will also need to launch a proof-of-concept project to demonstrate the feasibility of a technology for their target use case.)\b\r\nThe benefit of these technologies is that they provide individuals with more control over their identities and data, and expand their range of experiences into virtual venues and ecosystems that can be integrated with digital currencies. These technologies also provide new ways to reach customers to strengthen or open up new revenue streams.\rDigital twin of the customer (DToC) is a dynamic virtual representation of a customer that simulates and learns to emulate and anticipate behavior. It can be used to modify and enhance the customer experience (CX) and support new digitalization efforts, products, services and opportunities. DToC will take five to 10 years until mainstream adoption but will be transformational to organizations.\rOther critical technologies in immersive experiences include the following:\rDecentralized identity (DCI) allows an entity (typically a human user) to control their own digital identity by leveraging technologies such as blockchain or other distributed ledger technologies (DLTs), along with digital wallets.\rDigital humans are interactive, AI-driven representations that have some of the characteristics, personality, knowledge and mindset of a human.\rInternal talent marketplaces match internal employees and, in some cases, a pool of contingent workers, to time-boxed projects and various work opportunities, with no recruiter involvement.\r\n\0',
        textRuns: [
            {
                st: 0,
                ed: 66,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0,40,86)',
                    },
                },
            },
            {
                st: 68,
                ed: 252,
                ts: {
                    fs: 18,
                    cl: {
                        rgb: 'rgb(0,40,86)',
                    },
                },
            },
            {
                st: 254,
                ed: 403,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 405,
                ed: 432,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 434,
                ed: 483,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 485,
                ed: 515,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 517,
                ed: 678,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 679,
                ed: 711,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(0, 0, 211)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 713,
                ed: 769,
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
            {
                st: 1245,
                ed: 1587,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 1589,
                ed: 1984,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 1986,
                ed: 2060,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 2062,
                ed: 2084,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(0, 0, 211)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 2085,
                ed: 2292,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 2294,
                ed: 2308,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(0, 0, 211)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 2309,
                ed: 2436,
                ts: {
                    fs: 16,
                },
            },
            {
                st: 2438,
                ed: 2466,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 2467,
                ed: 2626,
                ts: {
                    fs: 16,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 67,
            },
            {
                startIndex: 253,
                paragraphStyle: {
                    spaceAbove: 20,
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 404,
                paragraphStyle: {
                    spaceAbove: 20,
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 433,
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
            },
            {
                startIndex: 484,
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
            },
            {
                startIndex: 516,
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
            },
            {
                startIndex: 712,
                paragraphStyle: {
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 770,
                paragraphStyle: {
                    spaceAbove: 20,
                },
            },
            {
                startIndex: 1243,
                paragraphStyle: {
                    spaceAbove: 20,
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 1588,
                paragraphStyle: {
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 1985,
                paragraphStyle: {
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 2061,
                paragraphStyle: {
                    indentFirstLine: 20,
                },
            },
            {
                startIndex: 2293,
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
            },
            {
                startIndex: 2437,
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
            },
            {
                startIndex: 2627,
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
            },
        ],
        sectionBreaks: [
            {
                startIndex: 1244,
                columnProperties: [],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
            },
            {
                startIndex: 2628,
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
        ],
        customBlocks: [
            {
                startIndex: 1242,
                blockId: 'shapeTest1',
            },
        ],
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
