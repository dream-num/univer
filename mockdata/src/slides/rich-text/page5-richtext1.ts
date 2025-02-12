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
                startIndex: 67,
            },
            {
                startIndex: 253,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                },
            },
            {
                startIndex: 404,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                },
            },
            {
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
