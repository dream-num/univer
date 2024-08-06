/**
 * Copyright 2023-present DreamNum Inc.
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
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

export const DEFAULT_DOCUMENT_DATA_CN: IDocumentData = {
    id: 'd',
    documentStyle: {
        pageSize: {
            width: 793.3333333333334,
            height: 1122.6666666666667,
        },
        documentFlavor: 0,
        marginTop: 66.66666666666667,
        marginBottom: 66.66666666666667,
        marginRight: 66.66666666666667,
        marginLeft: 66.66666666666667,
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
            background: {
                rgb: '#ccc',
            },
        },
        defaultHeaderId: '',
        defaultFooterId: '',
        evenPageHeaderId: '',
        evenPageFooterId: '',
        firstPageHeaderId: '',
        firstPageFooterId: '',
        evenAndOddHeaders: 0,
        useFirstPageHeaderFooter: 0,
        marginHeader: 30,
        marginFooter: 30,
    },
    tableSource: {},
    drawings: {},
    drawingsOrder: [],
    headers: {},
    footers: {},
    body: {
        dataStream: '这几天心里颇不宁静。今晚在院子里坐着乘凉，忽然想起日日走过的荷塘，在这满月的光里，总该另有一番样子吧。月亮渐渐地升高了，墙外马路上孩子们的欢笑，已经听不见了；妻在屋里拍着闰儿，迷迷糊糊地哼着眠歌。我悄悄地披了大衫，带上门出去。\r\n',
        textRuns: [
            {
                st: 0,
                ed: 114,
                ts: {
                    fs: 12,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: 0,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 113,
                bullet: {
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                    listType: 'CHECK_LIST_CHECKED',
                    listId: 'tPADQU',
                },
                paragraphStyle: {
                    spaceAbove: {
                        v: 0,
                    },
                    lineSpacing: 2,
                    spaceBelow: {
                        v: 0,
                    },
                    textStyle: {
                        st: {
                            s: 1,
                        },
                    },
                    hanging: {
                        v: 21,
                    },
                    indentStart: {
                        v: 0,
                    },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 114,
            },
        ],
        customBlocks: [],
        tables: [],
        customRanges: [],
        customDecorations: [],
    },
    resources: [
        {
            name: 'DOC_DRAWING_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_THREAD_COMMENT_PLUGIN',
            data: '{}',
        },
        {
            name: 'DOC_HYPER_LINK_PLUGIN',
            data: '{"links":[]}',
        },
        {
            name: 'DOC_MENTION_PLUGIN',
            data: '{"mentions":[]}',
        },
    ],
    __env__: {
        gitHash: '17b1a17c3',
        gitBranch: 'fix/table-comment',
        buildTime: '2024-08-06T12:03:46.073Z',
    },
};
