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
import { BooleanNumber } from '@univerjs/core';
import { extractNodeStyle as getInlineStyle } from '../parse-node-style';
import { getParagraphStyle } from '../utils';

export const WordPastePlugin: IPastePlugin = {
    name: 'univer-doc-paste-plugin-word',
    checkPasteType(html: string) {
        return /word|mso/i.test(html);
    },

    stylesRules: [
        {
            filter: ['b'],
            getStyle(node) {
                const inlineStyle = getInlineStyle(node);

                return { bl: BooleanNumber.TRUE, ...inlineStyle };
            },
        },
    ],

    afterProcessRules: [
        {
            filter(el: HTMLElement) {
                return el.tagName === 'P' && /mso/i.test(el.className);
            },
            handler(doc, el) {
                if (doc.paragraphs == null) {
                    doc.paragraphs = [];
                }

                const paragraph: IParagraph = {
                    startIndex: doc.dataStream.length,
                };

                const paragraphStyle = getParagraphStyle(el);

                if (paragraphStyle) {
                    paragraph.paragraphStyle = paragraphStyle;
                }

                doc.paragraphs.push(paragraph);
                doc.dataStream += '\r';
            },
        },
    ],
};
