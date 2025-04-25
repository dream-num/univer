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

import type { IDocumentBody } from '@univerjs/core';
import type { IThreadCommentMention } from '@univerjs/thread-comment';
import { CustomRangeType, getBodySlice } from '@univerjs/core';

export type TextNode = {
    type: 'text';
    content: string;
} | {
    type: 'mention';
    content: IThreadCommentMention;
};

const transformDocument2TextNodesInParagraph = (doc: IDocumentBody) => {
    const { dataStream, customRanges } = doc;
    const end = dataStream.endsWith('\r\n') ? dataStream.length - 2 : dataStream.length;
    const textNodes: TextNode[] = [];

    let lastIndex = 0;

    customRanges?.forEach((range) => {
        if (lastIndex < range.startIndex) {
            textNodes.push({
                type: 'text',
                content: dataStream.slice(lastIndex, range.startIndex),
            });
        }
        textNodes.push({
            type: 'mention',
            content: {
                label: dataStream.slice(range.startIndex, range.endIndex + 1),
                id: range.rangeId,
            },
        });
        lastIndex = range.endIndex + 1;
    });

    textNodes.push({
        type: 'text',
        content: dataStream.slice(lastIndex, end),
    });
    return textNodes;
};

export const transformDocument2TextNodes = (doc: IDocumentBody) => {
    const { paragraphs = [] } = doc;
    let lastIndex = 0;

    return paragraphs.map((paragraph) => {
        const body = getBodySlice(doc, lastIndex, paragraph.startIndex);
        lastIndex = paragraph.startIndex + 1;
        return transformDocument2TextNodesInParagraph(body);
    });
};

export const transformTextNodes2Document = (nodes: TextNode[]): IDocumentBody => {
    let str = '';
    const customRanges: Required<IDocumentBody['customRanges']> = [];

    nodes.forEach((node) => {
        switch (node.type) {
            case 'text':
                str += node.content;
                break;
            case 'mention': {
                const start = str.length;
                str += node.content.label;
                const end = str.length - 1;
                customRanges.push({
                    rangeId: node.content.id,
                    rangeType: CustomRangeType.MENTION,
                    startIndex: start,
                    endIndex: end,
                    properties: {},
                    wholeEntity: true,
                });
                break;
            }

            default:
                break;
        }
    });

    str += '\r\n';

    return {
        textRuns: [],
        paragraphs: [
            {
                startIndex: str.length - 2,
                paragraphStyle: {},
            },
        ],
        sectionBreaks: [
            {
                startIndex: str.length - 1,
            },
        ],
        dataStream: str,
        customRanges,
    };
};
