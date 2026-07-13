import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, ColumnSeparatorType, PresetListType, SectionType } from '@univerjs/core';

export const PAGE5_RICHTEXT_1: IDocumentData = {
    id: 'd',
    body: {
        dataStream:
            'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\rEmerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and optimized technologist delivery.\rThe 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: \rExpand immersive experiences\rAccelerate artificial intelligence (AI) automation\rOptimize technologist delivery \r\n',
        textRuns: [
            {
                st: 0,
                ed: 67,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24 * 0.75,
                    cl: {
                        rgb: 'rgb(205, 40, 86)',
                    },
                },
            },
            {
                st: 68,
                ed: 253,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 255, 86)',
                    },
                },
            },
            {
                st: 254,
                ed: 404,
                ts: {
                    fs: 14 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 255, 255)',
                    },
                },
            },
            {
                st: 405,
                ed: 433,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(255, 255, 86)',
                    },
                },
            },
            {
                st: 434,
                ed: 484,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 255, 186)',
                    },
                },
            },
            {
                st: 485,
                ed: 515,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(60, 255, 86)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                paragraphId: 'para_common_mockdata_src_slides_rich_text_page5_richtext1_1',
                startIndex: 67,
            },
            {
                paragraphId: 'para_common_mockdata_src_slides_rich_text_page5_richtext1_2',
                startIndex: 253,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                },
            },
            {
                paragraphId: 'para_common_mockdata_src_slides_rich_text_page5_richtext1_3',
                startIndex: 404,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                },
            },
            {
                paragraphId: 'para_common_mockdata_src_slides_rich_text_page5_richtext1_4',
                startIndex: 433,
                bullet: {
                    listType: PresetListType.BULLET_LIST,
                    listId: 'testBullet',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20 * 0.75,
                    },
                },
                paragraphStyle: {
                    lineSpacing: 1.5,
                },
            },
            {
                paragraphId: 'para_common_mockdata_src_slides_rich_text_page5_richtext1_5',
                startIndex: 484,
                bullet: {
                    listType: PresetListType.BULLET_LIST,
                    listId: 'testBullet',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20 * 0.75,
                    },
                },
                paragraphStyle: {
                    lineSpacing: 1.5,
                },
            },
            {
                paragraphId: 'para_common_mockdata_src_slides_rich_text_page5_richtext1_6',
                startIndex: 516,
                bullet: {
                    listType: PresetListType.BULLET_LIST,
                    listId: 'testBullet',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20 * 0.75,
                    },
                },
                paragraphStyle: {
                    lineSpacing: 1.5,
                },
            },
        ],
        sectionBreaks: [
            {
                sectionId: 'section_mockdata_slide_page5_richtext1_1',
                startIndex: 517,
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
