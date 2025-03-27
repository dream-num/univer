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
import {
    BooleanNumber,
    ColumnSeparatorType,
    DocumentFlavor,
    PresetListType,
    SectionType,
} from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

export const DEFAULT_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'd-en',
    drawings: {},
    drawingsOrder: [],
    body: {
        dataStream:
            'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\rEmerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and OPTIMIZED technologist delivery.\rThe 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: \rExpand immersive experiences\rAccelerate artificial intelligence (AI) automation\rOptimize technologist delivery \rThese technologies are expected to greatly impact business and society over the next two to 10 years, but will especially enable CIOs and IT leaders to deliver on digital business transformation. \rThree Hype Cycle themes to think about in 2022 and beyond\rThe 2022 Gartner Hype Cycle features emerging technologies and distills insights from more than 2,000 technologies into a succinct high-potential set. Most technologies have multiple use cases but enterprise architecture and technology innovation leaders should prioritize those with the greatest potential benefit for their organization. (They will also need to launch a proof-of-concept project to demonstrate the feasibility of a technology for their target use case. )\r\nThe benefit of these technologies is that they provide individuals with more control over their identities and data, and expand their range of experiences into virtual venues and ecosystems that can be integrated with digital currencies. These technologies also provide new ways to reach customers to strengthen or open up new revenue streams.\rDigital twin of the customer (DToC) is a dynamic virtual representation of a customer that simulates and learns to emulate and anticipate behavior. It can be used to modify and enhance the customer experience (CX) and support new digitalization efforts, products, services and opportunities. DToC will take five to 10 years until mainstream adoption but will be transformational to organizations.\rOther critical technologies in immersive experiences include the following:\rDecentralized identity (DCI) allows an entity (typically a human user) to control their own digital identity by leveraging technologies such as blockchain or other distributed ledger technologies (DLTs), along with digital wallets.\rDigital humans are interactive, AI-driven representations that have some of the characteristics, personality, knowledge and mindset of a human.\rInternal talent marketplaces match internal employees and, in some cases, a pool of contingent workers, to time-boxed projects and various work opportunities, with no recruiter involvement.\r\n',
        textRuns: [
            {
                st: 0,
                ed: 67,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 68,
                ed: 253,
                ts: {
                    fs: 18 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 254,
                ed: 404,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 405,
                ed: 433,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 434,
                ed: 484,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 485,
                ed: 516,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 517,
                ed: 679,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 680,
                ed: 713,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 0, 211)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 714,
                ed: 771,
                ts: {
                    fs: 24 * 0.75,
                    cl: {
                        rgb: 'rgb(255,255,255)',
                    },
                    bg: {
                        rgb: 'rgb(0,40,86)',
                    },
                },
            },
            {
                st: 772,
                ed: 1244,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 1246,
                ed: 1589,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 1590,
                ed: 1986,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 1987,
                ed: 2062,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 2063,
                ed: 2086,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 0, 211)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 2086,
                ed: 2294,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 2295,
                ed: 2310,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 0, 211)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 2310,
                ed: 2438,
                ts: {
                    fs: 16 * 0.75,
                },
            },
            {
                st: 2439,
                ed: 2468,
                ts: {
                    fs: 16 * 0.75,
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 2468,
                ed: 2628,
                ts: {
                    fs: 16 * 0.75,
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
                    spaceAbove: { v: 30 },
                    lineSpacing: 1.5,
                    suppressHyphenation: BooleanNumber.FALSE,
                },
            },
            {
                startIndex: 404,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 433,
                bullet: {
                    listType: PresetListType.ORDER_LIST,
                    listId: 'b',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                        cl: {
                            rgb: 'rgb(0, 255, 0)',
                        },
                    },
                },
                paragraphStyle: {
                    lineSpacing: 1.5,
                    spaceAbove: { v: 20 },
                },
            },
            {
                startIndex: 484,
                bullet: {
                    listType: PresetListType.ORDER_LIST,
                    listId: 'b',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 516,
                bullet: {
                    listType: PresetListType.ORDER_LIST,
                    listId: 'b',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 713,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 771,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 1244,
                paragraphStyle: {
                    spaceAbove: { v: 20 },
                    lineSpacing: 1.5,
                    indentFirstLine: { v: 20 },
                },
            },
            {
                startIndex: 1589,
                paragraphStyle: {
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 1986,
                paragraphStyle: {
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 2062,
                paragraphStyle: {
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
            },
            {
                startIndex: 2294,
                paragraphStyle: {
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
                bullet: {
                    listType: PresetListType.BULLET_LIST,
                    listId: 'a',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
            {
                startIndex: 2438,
                paragraphStyle: {
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
                bullet: {
                    listType: PresetListType.BULLET_LIST,
                    listId: 'a',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
            {
                startIndex: 2628,
                paragraphStyle: {
                    indentFirstLine: { v: 20 },
                    lineSpacing: 1.5,
                },
                bullet: {
                    listType: PresetListType.BULLET_LIST,
                    listId: 'a',
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 1245,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
            },
            {
                startIndex: 2629,
                columnProperties: [
                    {
                        width: 300,
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
        ],
    },
    documentStyle: {
        pageSize: {
            width: ptToPixel(595),
            height: ptToPixel(842),
        },
        documentFlavor: DocumentFlavor.TRADITIONAL,
        marginTop: ptToPixel(50),
        marginBottom: ptToPixel(50),
        marginRight: ptToPixel(50),
        marginLeft: ptToPixel(50),
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
        },
        autoHyphenation: BooleanNumber.TRUE,
        doNotHyphenateCaps: BooleanNumber.FALSE,
        consecutiveHyphenLimit: 2,
        // hyphenationZone: 50,
        // gridType: GridType.LINES_AND_CHARS,
        // linePitch: 24,
        // charSpace: 12,
    },
};
