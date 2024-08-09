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

import type { IDocumentBody, IDocumentData, ITable, ITextStyle, Nullable } from '@univerjs/core';
import { CustomRangeType, DataStreamTreeTokenType, skipParseTagNames, Tools } from '@univerjs/core';

import { genTableSource, getEmptyTableCell, getEmptyTableRow, getTableColumn } from '@univerjs/docs';
import { extractNodeStyle } from './parse-node-style';
import parseToDom from './parse-to-dom';
import type { IAfterProcessRule, IPastePlugin, IStyleRule } from './paste-plugins/type';

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

// TODO: get from page width.
const DEFAULT_TABLE_WIDTH = 600;

interface ITableCache {
    table: ITable;
    startIndex: number;
}

/**
 * Convert html strings into data structures in univer, IDocumentBody.
 * Support plug-in, add custom rules,
 */
export class HtmlToUDMService {
    private static _pluginList: IPastePlugin[] = [];

    static use(plugin: IPastePlugin) {
        if (this._pluginList.includes(plugin)) {
            throw new Error(`Univer paste plugin ${plugin.name} already added`);
        }

        this._pluginList.push(plugin);
    }

    private _tableCache: ITableCache[] = [];

    private _styleCache: Map<ChildNode, ITextStyle> = new Map();

    private _styleRules: IStyleRule[] = [];

    private _afterProcessRules: IAfterProcessRule[] = [];

    convert(html: string): Partial<IDocumentData> {
        const pastePlugin = HtmlToUDMService._pluginList.find((plugin) => plugin.checkPasteType(html));
        const dom = parseToDom(html)!;

        const body: IDocumentBody = {
            dataStream: '',
            paragraphs: [],
            sectionBreaks: [],
            tables: [],
            textRuns: [],
        };

        const docData: Partial<IDocumentData> = {
            body,
            tableSource: {},
        };

        if (pastePlugin) {
            this._styleRules = [...pastePlugin.stylesRules];
            this._afterProcessRules = [...pastePlugin.afterProcessRules];
        }

        this._tableCache = [];
        this._styleCache.clear();
        this._process(null, dom.childNodes, docData);
        this._styleCache.clear();
        this._styleRules = [];
        this._afterProcessRules = [];

        return docData;
    }

    private _process(parent: Nullable<ChildNode>, nodes: NodeListOf<ChildNode>, doc: Partial<IDocumentData>) {
        const body = doc.body!;

        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue?.trim() === '') {
                    continue;
                }

                // TODO: @JOCS, More characters need to be replaced, like `\b`
                let text = node.nodeValue?.replace(/[\r\n]/g, '');
                let style;

                if (parent && parent.nodeType === Node.ELEMENT_NODE) {
                    if ((parent as Element).tagName.toUpperCase() === 'A') {
                        const id = Tools.generateRandomId();
                        text = `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${text}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`;
                        body.customRanges = [
                            ...(body.customRanges ?? []),
                            {
                                startIndex: body.dataStream.length,
                                endIndex: body.dataStream.length + text.length - 1,
                                rangeId: id,
                                rangeType: CustomRangeType.HYPERLINK,
                            },
                        ];
                        body.payloads = {
                            ...body.payloads,
                            [id]: (parent as HTMLAnchorElement).href,
                        };
                    }
                }

                if (parent && this._styleCache.has(parent)) {
                    style = this._styleCache.get(parent);
                }

                body.dataStream += text;

                if (style && Object.getOwnPropertyNames(style).length) {
                    body.textRuns!.push({
                        st: body.dataStream.length - text!.length,
                        ed: body.dataStream.length,
                        ts: style,
                    });
                }
            } else if (skipParseTagNames.includes(node.nodeName.toLowerCase())) {
                continue;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const parentStyles = parent ? this._styleCache.get(parent) : {};
                const styleRule = this._styleRules.find(({ filter }) => matchFilter(node as HTMLElement, filter));
                const nodeStyles = styleRule
                    ? styleRule.getStyle(node as HTMLElement)
                    : extractNodeStyle(node as HTMLElement);

                this._styleCache.set(node, { ...parentStyles, ...nodeStyles });

                const { childNodes } = node;

                this._processBeforeTable(node as HTMLElement, doc);

                this._process(node, childNodes, doc);

                this._processAfterTable(node as HTMLElement, doc);

                const afterProcessRule = this._afterProcessRules.find(({ filter }) =>
                    matchFilter(node as HTMLElement, filter)
                );

                if (afterProcessRule) {
                    afterProcessRule.handler(doc, node as HTMLElement);
                }
            }
        }
    }

    private _processBeforeTable(node: HTMLElement, doc: Partial<IDocumentData>) {
        const tagName = node.tagName.toUpperCase();
        const body = doc.body!;

        switch (tagName) {
            case 'TABLE': {
                if (body.dataStream[body.dataStream.length - 1] !== '\r') {
                    body.dataStream += '\r';
                    body.paragraphs?.push({
                        startIndex: body.dataStream.length - 1,
                    });
                }

                const table = genTableSource(0, 0, DEFAULT_TABLE_WIDTH);

                this._tableCache.push({
                    table,
                    startIndex: body.dataStream.length,
                });

                body.dataStream += DataStreamTreeTokenType.TABLE_START;

                break;
            }

            case 'TR': {
                const row = getEmptyTableRow(0);
                const lastTable = this._tableCache[this._tableCache.length - 1].table;

                lastTable.tableRows.push(row);

                body.dataStream += DataStreamTreeTokenType.TABLE_ROW_START;

                break;
            }

            case 'TD': {
                const cell = getEmptyTableCell();
                const lastTable = this._tableCache[this._tableCache.length - 1].table;
                const lastRow = lastTable.tableRows[lastTable.tableRows.length - 1];

                lastRow.tableCells.push(cell);

                body.dataStream += DataStreamTreeTokenType.TABLE_CELL_START;

                break;
            }
        }
    }

    private _processAfterTable(node: HTMLElement, doc: Partial<IDocumentData>) {
        const tagName = node.tagName.toUpperCase();
        const body = doc.body!;

        if (doc.tableSource == null) {
            doc.tableSource = {};
        }

        if (body.tables == null) {
            body.tables = [];
        }

        if (body.sectionBreaks == null) {
            body.sectionBreaks = [];
        }

        const { tableSource } = doc;

        switch (tagName) {
            case 'TABLE': {
                const tableCache = this._tableCache.pop()!;

                const { startIndex, table } = tableCache;

                const colCount = table.tableRows[0].tableCells.length!;
                const tableColumn = getTableColumn(DEFAULT_TABLE_WIDTH / colCount);
                const tableColumns = [...new Array(colCount).fill(null).map(() => Tools.deepClone(tableColumn))];

                table.tableColumns = tableColumns;

                tableSource[table.tableId] = table;

                body.dataStream += DataStreamTreeTokenType.TABLE_END;

                body.tables.push({
                    startIndex,
                    endIndex: body.dataStream.length - 1,
                    tableId: table.tableId,
                });

                break;
            }

            case 'TR': {
                body.dataStream += DataStreamTreeTokenType.TABLE_ROW_END;

                break;
            }

            case 'TD': {
                if (body.dataStream[body.dataStream.length - 1] !== '\r') {
                    body.paragraphs?.push({
                        startIndex: body.dataStream.length,
                    });

                    body.dataStream += '\r';
                }

                body.sectionBreaks?.push({
                    startIndex: body.dataStream.length,
                });

                body.dataStream += `\n${DataStreamTreeTokenType.TABLE_CELL_END}`;

                break;
            }
        }
    }
}
