import { BooleanNumber } from '@univerjs/core';

import { IPastePlugin } from './type';

const wordPastePlugin: IPastePlugin = {
    name: 'univer-doc-paste-plugin-word',
    checkPasteType(html: string) {
        return /word|mso/i.test(html);
    },

    stylesRules: [
        {
            filter: ['b'],
            getStyle(node, getInlineStyle) {
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
            handler(doc) {
                if (doc.paragraphs == null) {
                    doc.paragraphs = [];
                }

                doc.paragraphs.push({
                    startIndex: doc.dataStream.length,
                });
                doc.dataStream += '\r';
            },
        },
        {
            filter(el: HTMLElement) {
                return el.tagName === 'DIV' && /word/i.test(el.className);
            },
            handler(doc) {
                if (doc.sectionBreaks == null) {
                    doc.sectionBreaks = [];
                }

                doc.sectionBreaks.push({
                    startIndex: doc.dataStream.length,
                });
                doc.dataStream += '\n';
            },
        },
    ],
};

export default wordPastePlugin;
