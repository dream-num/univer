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

import { CustomRangeType, type IDocumentBody } from '@univerjs/core';
import type { IThreadCommentMention } from '@univerjs/thread-comment';

export type TextNode = {
    type: 'text';
    content: string;
} | {
    type: 'mention';
    content: IThreadCommentMention;
};

export const parseMentions = (text: string): TextNode[] => {
    const regex = /@\[(.*?)\]\((.*?)\)|(\w+)/g;
    let match;
    let lastIndex = 0;
    const result: TextNode[] = [];

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            // Add the text between two user mentions or before the first user mention
            result.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
            });
        }

        if (match[1] && match[2]) {
            // User mention found
            result.push({
                type: 'mention',
                content: {
                    label: match[1],
                    id: match[2],
                },
            });
        } else if (match[3]) {
            // Text (numbers) found
            result.push({
                type: 'text',
                content: match[3],
            });
        }
        lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last mention (if any)
    if (lastIndex < text.length) {
        result.push({
            type: 'text',
            content: text.substring(lastIndex),
        });
    }

    return result;
};

export const transformTextNode2Text = (nodes: TextNode[]) => {
    return nodes.map((item) => {
        switch (item.type) {
            case 'mention':
                return `@[${item.content.label}](${item.content.id})`;
            default:
                return item.content;
        }
    }).join('');
};

export const transformDocument2TextNodes = (doc: IDocumentBody) => {
    const { dataStream, customRanges } = doc;
    const end = dataStream.length - 2;
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
                label: dataStream.slice(range.startIndex, range.endIndex).slice(1, -1),
                id: range.rangeId,
            },
        });
        lastIndex = range.endIndex;
    });

    textNodes.push({
        type: 'text',
        content: dataStream.slice(lastIndex, end),
    });
    return textNodes;
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
                str += `\x1F${node.content.label}\x1E`;
                const end = str.length;
                customRanges.push({
                    rangeId: node.content.id,
                    rangeType: CustomRangeType.MENTION,
                    startIndex: start,
                    endIndex: end,
                });
                break;
            }

            default:
                break;
        }
    });

    str += '\n\r';

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

export const transformMention = (mention: IThreadCommentMention) => ({
    display: mention.label,
    id: `${mention.id}`,
    raw: mention,
});
