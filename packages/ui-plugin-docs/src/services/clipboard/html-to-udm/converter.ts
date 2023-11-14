import { IDocumentBody, ITextStyle, Nullable } from '@univerjs/core';

import extractNodeStyle from './parse-node-style';
import parseToDom from './parse-to-dom';
import { IAfterProcessRule, IPastePlugin, IStyleRule } from './paste-plugins/type';

function matchFilter(node: HTMLElement, filter: IStyleRule['filter']) {
    const tagName = node.tagName.toLowerCase();

    if (typeof filter === 'string') {
        return tagName === filter;
    }

    if (Array.isArray(filter)) {
        return filter.some((name) => name === tagName);
    }

    return filter(node);
}

/**
 * Convert html strings into data structures in univer, IDocumentBody.
 * Support plug-in, add custom rules,
 */
class HtmlToUDMService {
    private static pluginList: IPastePlugin[] = [];

    static use(plugin: IPastePlugin) {
        if (this.pluginList.includes(plugin)) {
            throw new Error(`Univer paste plugin ${plugin.name} already added`);
        }

        this.pluginList.push(plugin);
    }

    private styleCache: Map<ChildNode, ITextStyle> = new Map();

    private styleRules: IStyleRule[] = [];

    private afterProcessRules: IAfterProcessRule[] = [];

    convert(html: string): IDocumentBody {
        const pastePlugin = HtmlToUDMService.pluginList.find((plugin) => plugin.checkPasteType(html));

        const dom = parseToDom(html);

        const newDocBody: IDocumentBody = {
            dataStream: '',
            textRuns: [],
        };

        if (pastePlugin) {
            this.styleRules = [...pastePlugin.stylesRules];
            this.afterProcessRules = [...pastePlugin.afterProcessRules];
        }

        this.styleCache.clear();
        this.process(null, dom?.childNodes!, newDocBody);
        this.styleCache.clear();
        this.styleRules = [];
        this.afterProcessRules = [];

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

                if (style && Object.getOwnPropertyNames(style).length) {
                    doc.textRuns!.push({
                        st: doc.dataStream.length - text!.length,
                        ed: doc.dataStream.length,
                        ts: style,
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const parentStyles = parent ? this.styleCache.get(parent) : {};
                const styleRule = this.styleRules.find(({ filter }) => matchFilter(node as HTMLElement, filter));
                const nodeStyles = styleRule
                    ? styleRule.getStyle(node as HTMLElement, extractNodeStyle)
                    : extractNodeStyle(node as HTMLElement);

                this.styleCache.set(node, { ...parentStyles, ...nodeStyles });

                const { childNodes } = node;

                this.process(node, childNodes, doc);

                const afterProcessRule = this.afterProcessRules.find(({ filter }) =>
                    matchFilter(node as HTMLElement, filter)
                );

                if (afterProcessRule) {
                    afterProcessRule.handler(doc);
                }
            }
        }
    }
}

export default HtmlToUDMService;
