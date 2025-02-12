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

import { BooleanNumber } from '@univerjs/core';

import { extractNodeStyle as getInlineStyle } from '../parse-node-style';
import type { IPastePlugin } from './type';

const wordPastePlugin: IPastePlugin = {
    name: 'univer-doc-paste-plugin-lark',
    checkPasteType(html: string) {
        return /lark-record-clipboard/i.test(html);
    },
    // TODO: @JOCS, support inline code copy from lark.
    stylesRules: [
        {
            filter: ['s'],
            getStyle(node) {
                const inlineStyle = getInlineStyle(node);

                return {
                    st: {
                        s: BooleanNumber.TRUE,
                    },
                    ...inlineStyle,
                };
            },
        },
    ],

    afterProcessRules: [
        {
            filter(el: HTMLElement) {
                return el.tagName === 'DIV' && /ace-line/i.test(el.className);
            },
            handler(doc) {
                const body = doc.body!;
                if (body.paragraphs == null) {
                    body.paragraphs = [];
                }

                body.paragraphs.push({
                    startIndex: body.dataStream.length,
                });
                body.dataStream += '\r';
            },
        },
    ],
};

export default wordPastePlugin;
