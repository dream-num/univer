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

import type { IParagraph } from '@univerjs/core';
import type { IPastePlugin } from './type';
import { BooleanNumber, createParagraphId } from '@univerjs/core';
import { extractNodeStyle } from '../parse-node-style';
import { getParagraphStyle } from '../utils';

const WORD_SPACE_PLACEHOLDER_ENTITY = '&#57344;';
const WORD_TAB_WIDTH = 4;

const WordPastePlugin: IPastePlugin = {
    name: 'univer-doc-paste-plugin-word',
    checkPasteType(html: string) {
        return /word|mso|wps|kingsoft/i.test(html);
    },

    preprocessHtml(html: string) {
        return html.replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (match, attributes, content) => {
            const isWordSpacer = /mso-spacerun\s*:\s*yes/i.test(attributes);
            const tabCount = readMsoTabCount(attributes);

            if (!isWordSpacer && tabCount == null) {
                return match;
            }

            const contentSpaceCount = countWordSpaces(content);
            const fallbackSpaceCount = tabCount == null ? 1 : Math.max(1, Math.round(tabCount * WORD_TAB_WIDTH));
            const spaceCount = Math.max(contentSpaceCount, fallbackSpaceCount);

            return WORD_SPACE_PLACEHOLDER_ENTITY.repeat(spaceCount);
        });
    },

    stylesRules: [
        {
            filter: ['b'],
            getStyle(node) {
                const inlineStyle = extractNodeStyle(node);

                return { bl: BooleanNumber.TRUE, ...inlineStyle };
            },
        },
    ],

    afterProcessRules: [
        {
            filter(el: HTMLElement) {
                return el.tagName === 'P';
            },
            handler(doc, el) {
                const body = doc.body!;
                if (body.paragraphs == null) {
                    body.paragraphs = [];
                }

                const paragraph: IParagraph = {
                    startIndex: body.dataStream.length,
                    paragraphId: createParagraphId(new Set(body.paragraphs.map((p) => p.paragraphId))),
                };

                const paragraphStyle = getParagraphStyle(el);

                if (paragraphStyle) {
                    paragraph.paragraphStyle = paragraphStyle;
                }

                body.paragraphs.push(paragraph);
                body.dataStream += '\r';
            },
        },
    ],
};

function readMsoTabCount(attributes: string): number | undefined {
    const match = attributes.match(/mso-tab-count\s*:\s*([0-9.]+)/i);
    if (!match) {
        return undefined;
    }

    const count = Number(match[1]);
    return Number.isFinite(count) ? count : undefined;
}

function countWordSpaces(content: string): number {
    const entitySpaceCount = content.match(/&nbsp;|&#160;|&#x0*a0;/gi)?.length ?? 0;
    const text = content
        .replace(/&nbsp;|&#160;|&#x0*a0;/gi, '\u00A0')
        .replace(/<[^>]*>/g, '');
    const literalSpaceCount = text.match(/[\u00A0\t]/g)?.reduce((count, char) => count + (char === '\t' ? WORD_TAB_WIDTH : 1), 0) ?? 0;

    if (entitySpaceCount || literalSpaceCount) {
        return literalSpaceCount;
    }

    return text.replace(/\r?\n/g, '').match(/ /g)?.length ?? 0;
}

export default WordPastePlugin;
