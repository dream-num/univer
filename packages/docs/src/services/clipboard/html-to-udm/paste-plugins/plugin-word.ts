import { BooleanNumber, IParagraph } from '@univerjs/core';

import { extractNodeStyle as getInlineStyle } from '../parse-node-style';
import { getParagraphStyle } from '../utils';
import { IPastePlugin } from './type';

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

export default wordPastePlugin;
