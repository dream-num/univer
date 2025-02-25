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
import { BooleanNumber } from '@univerjs/core';

import { extractNodeStyle as getInlineStyle } from '../parse-node-style';
import { getParagraphStyle } from '../utils';
import type { IPastePlugin } from './type';

const wordPastePlugin: IPastePlugin = {
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
                return el.tagName === 'P';
            },
            handler(doc, el) {
                const body = doc.body!;
                if (body.paragraphs == null) {
                    body.paragraphs = [];
                }

                const paragraph: IParagraph = {
                    startIndex: body.dataStream.length,
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

export default wordPastePlugin;
