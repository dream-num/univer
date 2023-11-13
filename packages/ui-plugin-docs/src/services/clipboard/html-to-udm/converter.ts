import { IDocumentBody, ITextStyle, Nullable } from '@univerjs/core';

import extractNodeStyle from './parse-node-style';
import parseToDom from './parse-to-dom';

/**
 * Convert html strings into data structures in univer, IDocumentBody.
 * Support plug-in, add custom rules,
 */
class HtmlToUDMService {
    private styleCache: Map<ChildNode, ITextStyle> = new Map();

    convert(html: string): IDocumentBody {
        const dom = parseToDom(html);
        const newDocBody: IDocumentBody = {
            dataStream: '',
            textRuns: [],
            paragraphs: [],
        };
        this.styleCache.clear();
        this.process(null, dom?.childNodes!, newDocBody);
        this.styleCache.clear();

        return newDocBody;
    }

    private process(parent: Nullable<ChildNode>, nodes: NodeListOf<ChildNode>, doc: IDocumentBody) {
        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                // TODO: @JOCS, More characters need to be replaced, like `\b`
                const text = node.nodeValue?.replace(/\r\n/g, '');
                let style;

                if (parent && this.styleCache.has(parent)) {
                    style = this.styleCache.get(parent);
                }

                doc.dataStream += text;

                if (style) {
                    doc.textRuns!.push({
                        st: doc.dataStream.length - text!.length,
                        ed: doc.dataStream.length,
                        ts: style,
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const parentStyles = parent ? this.styleCache.get(parent) : {};
                const nodeStyles = extractNodeStyle(node as HTMLElement);

                this.styleCache.set(node, { ...parentStyles, ...nodeStyles });

                const { childNodes } = node;

                this.process(node, childNodes, doc);

                // TODO: @JOCS, Use plugin
                if (node.nodeName.toLocaleLowerCase() === 'p') {
                    doc.paragraphs?.push({
                        startIndex: doc.dataStream.length,
                    });
                    doc.dataStream += '\r';
                }
            }
        }
    }
}

export default HtmlToUDMService;
