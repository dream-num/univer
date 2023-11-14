import { BooleanNumber } from '@univerjs/core';

import { IPastePlugin } from './type';

const wordPastePlugin: IPastePlugin = {
    name: 'univer-doc-paste-plugin-feishu',
    checkPasteType(html: string) {
        return /lark-record-clipboard/i.test(html);
    },
    // TODO: @JOCS, support inline code copy from feishu.
    stylesRules: [
        {
            filter: ['s'],
            getStyle(node, getInlineStyle) {
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
                if (doc.paragraphs == null) {
                    doc.paragraphs = [];
                }

                doc.paragraphs.push({
                    startIndex: doc.dataStream.length,
                });
                doc.dataStream += '\r';
            },
        },
    ],
};

export default wordPastePlugin;
