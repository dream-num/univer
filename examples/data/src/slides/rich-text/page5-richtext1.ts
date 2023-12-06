import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, ColumnSeparatorType, SectionType } from '@univerjs/core';

import { DEFAULT_LIST_TEST } from '../../docs/default-list';

export const PAGE5_RICHTEXT_1: IDocumentData = {
    id: 'd',
    lists: DEFAULT_LIST_TEST,
    body: {
        dataStream:
            'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\rEmerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and optimized technologist delivery.\rThe 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: \rExpand immersive experiences\rAccelerate artificial intelligence (AI) automation\rOptimize technologist delivery \r\n',
        textRuns: [
            {
                st: 0,
                ed: 67,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(205, 40, 86)',
                    },
                },
            },
            {
                st: 68,
                ed: 253,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(0, 255, 86)',
                    },
                },
            },
            {
                st: 254,
                ed: 404,
                ts: {
                    fs: 14,
                    cl: {
                        rgb: 'rgb(0, 255, 255)',
                    },
                },
            },
            {
                st: 405,
                ed: 433,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(255, 255, 86)',
                    },
                },
            },
            {
                st: 434,
                ed: 484,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(0, 255, 186)',
                    },
                },
            },
            {
                st: 485,
                ed: 515,
                ts: {
                    fs: 16,
                    cl: {
                        rgb: 'rgb(60, 255, 86)',
                    },
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
        ],
        sectionBreaks: [
            {
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
