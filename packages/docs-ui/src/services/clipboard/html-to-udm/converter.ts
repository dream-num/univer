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

import type { IDocumentBody, IDocumentData, IParagraph, ITable, ITextStyle, Nullable } from '@univerjs/core';
import type { IAfterProcessRule, IPastePlugin, IStyleRule } from './paste-plugins/type';
import {
    CustomRangeType,
    DataStreamTreeTokenType,
    DrawingTypeEnum,
    generateRandomId,
    NamedStyleType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    PresetListType,
    skipParseTagNames,
    Tools,
} from '@univerjs/core';
import { ImageSourceType } from '@univerjs/drawing';
import { genTableSource, getEmptyTableCell, getEmptyTableRow, getTableColumn } from '../../../commands/commands/table/table';
import { extractNodeStyle } from './parse-node-style';
import parseToDom from './parse-to-dom';

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
const DEFAULT_TABLE_WIDTH = 660;

interface ITableCache {
    table: ITable;
    startIndex: number;
}

interface IListContext {
    listId: string;
    listType: PresetListType;
    nestingLevel: number;
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

    private _listStack: IListContext[] = [];

    private _lastParagraphIndex = -1;

    convert(html: string, metaConfig: { unitId?: string } = {}): Partial<IDocumentData> {
        const pastePlugin = HtmlToUDMService._pluginList.find((plugin) => plugin.checkPasteType(html));
        const dom = parseToDom(html)!;

        const body: IDocumentBody = {
            dataStream: '',
            paragraphs: [],
            sectionBreaks: [],
            tables: [],
            textRuns: [],
            customBlocks: [],
        };

        const docData: Partial<IDocumentData> = {
            body,
            tableSource: {},
            id: metaConfig?.unitId ?? '',
        };

        if (pastePlugin) {
            this._styleRules = [...pastePlugin.stylesRules];
            this._afterProcessRules = [...pastePlugin.afterProcessRules];
        }

        this._tableCache = [];
        this._listStack = [];
        this._lastParagraphIndex = -1;
        this._styleCache.clear();
        this._process(null, dom.childNodes, docData);
        this._styleCache.clear();
        this._styleRules = [];
        this._afterProcessRules = [];

        return docData;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _process(parent: Nullable<ChildNode>, nodes: NodeListOf<ChildNode>, doc: Partial<IDocumentData>) {
        const body = doc.body!;
        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue?.trim() === '') {
                    continue;
                }

                // TODO: @JOCS, More characters need to be replaced, like `\b`
                const text = node.nodeValue?.replace(/[\r\n]/g, '');
                let style;

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
            } else if (node.nodeName === 'IMG') {
                const element = node as HTMLImageElement;
                const imageSourceType = element.dataset.imageSourceType;
                const source = imageSourceType === ImageSourceType.UUID ? element.dataset.source : element.src;

                if (source && imageSourceType) {
                    const width = Number(element.dataset.width || 100);
                    const height = Number(element.dataset.height || 100);
                    const docTransformWidth = Number(element.dataset.docTransformWidth || width);
                    const docTransformHeight = Number(element.dataset.docTransformHeight || height);

                    const id = generateRandomId(6);
                    doc.body?.customBlocks?.push({ startIndex: body.dataStream.length, blockId: id });
                    body.dataStream += '\b';
                    if (!doc.drawings) {
                        doc.drawings = {};
                    }
                    doc.drawings[id] = {
                        drawingId: id,
                        title: '',
                        description: '',
                        imageSourceType,
                        source,
                        transform: { width, height, left: 0 },
                        docTransform: {
                            size: { width: docTransformWidth, height: docTransformHeight },
                            angle: 0,
                            positionH: {
                                relativeFrom: ObjectRelativeFromH.PAGE,
                                posOffset: 0,
                            },
                            positionV: {
                                relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                                posOffset: 0,
                            },
                        },
                        layoutType: PositionedObjectLayoutType.INLINE,
                        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                        unitId: doc.id || '',
                        subUnitId: doc.id || '',
                    } as any;
                }
            } else if (skipParseTagNames.includes(node.nodeName.toLowerCase())) {
                continue;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (this._processCodeBlock(element, doc)) {
                    continue;
                }

                const linkStart = this._processBeforeLink(element, doc);
                const blockStart = this._processBeforeStructuredBlock(element, doc);
                const listContext = this._processBeforeList(element);

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
                this._processAfterList(listContext);

                const afterProcessRule = this._afterProcessRules.find(({ filter }) =>
                    matchFilter(node as HTMLElement, filter)
                );

                const paragraphAddedByPlugin = Boolean(afterProcessRule);
                if (afterProcessRule) {
                    afterProcessRule.handler(doc, node as HTMLElement);
                }
                this._processAfterDefaultBlock(element, doc, paragraphAddedByPlugin);
                this._processAfterStructuredBlock(element, doc, blockStart);
                this._processAfterLink(element, doc, linkStart);
            }
        }
    }

    private _processCodeBlock(node: HTMLElement, doc: Partial<IDocumentData>): boolean {
        if (node.tagName.toUpperCase() !== 'PRE') {
            return false;
        }

        const body = doc.body!;
        const startIndex = body.dataStream.length;
        const text = node.textContent ?? '';
        body.dataStream += text;
        this._appendParagraph(doc, node);
        body.blockRanges ??= [];
        body.blockRanges.push({
            blockId: generateRandomId(6),
            blockType: 'code',
            startIndex,
            endIndex: body.dataStream.length - 1,
        });
        return true;
    }

    private _processBeforeStructuredBlock(node: HTMLElement, doc: Partial<IDocumentData>): number | null {
        const blockType = getStructuredBlockType(node);
        if (!blockType) {
            return null;
        }

        return doc.body!.dataStream.length;
    }

    private _processAfterStructuredBlock(node: HTMLElement, doc: Partial<IDocumentData>, startIndex: number | null): void {
        const blockType = getStructuredBlockType(node);
        const body = doc.body!;
        if (!blockType || startIndex == null || body.dataStream.length <= startIndex) {
            return;
        }

        body.blockRanges ??= [];
        body.blockRanges.push({
            blockId: generateRandomId(6),
            blockType,
            startIndex,
            endIndex: body.dataStream.length - 1,
        });
    }

    private _processBeforeList(node: HTMLElement): IListContext | null {
        const tagName = node.tagName.toUpperCase();
        if (tagName !== 'OL' && tagName !== 'UL') {
            return null;
        }

        const context: IListContext = {
            listId: generateRandomId(6),
            listType: tagName === 'OL' ? PresetListType.ORDER_LIST : PresetListType.BULLET_LIST,
            nestingLevel: this._listStack.length,
        };
        this._listStack.push(context);
        return context;
    }

    private _processAfterList(context: IListContext | null): void {
        if (!context) {
            return;
        }

        this._listStack.pop();
    }

    private _processAfterDefaultBlock(node: HTMLElement, doc: Partial<IDocumentData>, paragraphAddedByPlugin: boolean): void {
        if (paragraphAddedByPlugin) {
            this._applyWordListInfo(node, doc);
            this._lastParagraphIndex = doc.body!.dataStream.length - 1;
            return;
        }

        if (!isDefaultParagraphElement(node)) {
            return;
        }

        this._appendParagraph(doc, node);
    }

    private _appendParagraph(doc: Partial<IDocumentData>, node: HTMLElement): void {
        const body = doc.body!;
        if (body.dataStream[this._lastParagraphIndex] === '\r' && this._lastParagraphIndex === body.dataStream.length - 1) {
            return;
        }

        body.paragraphs ??= [];
        const paragraph: IParagraph = {
            startIndex: body.dataStream.length,
        };

        const heading = getHeadingNamedStyleType(node);
        if (heading != null) {
            paragraph.paragraphStyle = {
                ...paragraph.paragraphStyle,
                headingId: generateRandomId(6),
                namedStyleType: heading,
            };
        }

        const listContext = this._listStack[this._listStack.length - 1] ?? extractWordListInfo(node);
        if (listContext) {
            paragraph.bullet = {
                listId: listContext.listId,
                listType: listContext.listType,
                nestingLevel: listContext.nestingLevel,
            };
            paragraph.startIndex -= stripListMarkerFromCurrentParagraph(body);
        }

        body.paragraphs.push(paragraph);
        body.dataStream += '\r';
        this._lastParagraphIndex = body.dataStream.length - 1;
    }

    private _applyWordListInfo(node: HTMLElement, doc: Partial<IDocumentData>): void {
        const listContext = extractWordListInfo(node);
        const paragraph = doc.body?.paragraphs?.[doc.body.paragraphs.length - 1];
        if (!listContext || !paragraph) {
            return;
        }

        paragraph.bullet = {
            listId: listContext.listId,
            listType: listContext.listType,
            nestingLevel: listContext.nestingLevel,
        };
        paragraph.startIndex -= stripListMarkerFromCurrentParagraph(doc.body!);
    }

    private _processBeforeTable(node: HTMLElement, doc: Partial<IDocumentData>): void {
        const tagName = node.tagName.toUpperCase();
        const body = doc.body!;

        switch (tagName) {
            case 'TABLE': {
                if (body.dataStream[body.dataStream.length - 1] !== '\r') {
                    body.dataStream += '\r';

                    if (body.paragraphs == null) {
                        body.paragraphs = [];
                    }

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

    private _processAfterTable(node: HTMLElement, doc: Partial<IDocumentData>): void {
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
                    endIndex: body.dataStream.length,
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

    private _processBeforeLink(node: HTMLElement, doc: Partial<IDocumentData>) {
        const body = doc.body!;
        return body.dataStream.length;
    }

    private _processAfterLink(node: HTMLElement, doc: Partial<IDocumentData>, start: number) {
        const body = doc.body!;
        const element = node as HTMLElement;

        if (element.tagName.toUpperCase() === 'A') {
            const href = (element as HTMLAnchorElement).href;
            if (!isSafeUrl(href)) {
                return;
            }

            body.customRanges = body.customRanges ?? [];
            body.customRanges.push({
                startIndex: start,
                endIndex: body.dataStream.length - 1,
                rangeId: element.dataset.rangeid ?? generateRandomId(),
                rangeType: CustomRangeType.HYPERLINK,
                properties: { url: href },
            });
        }
    }
}

function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url, window.location.origin);
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

function getStructuredBlockType(node: HTMLElement): string | null {
    const docType = node.dataset.docType;
    if (docType === 'quote') {
        return 'quote';
    }

    if (docType === 'callout') {
        return 'callout';
    }

    const tagName = node.tagName.toUpperCase();
    if (tagName === 'BLOCKQUOTE') {
        return docType === 'callout' ? 'callout' : 'quote';
    }

    if (tagName === 'ASIDE' && node.getAttribute('role') === 'note') {
        return 'callout';
    }

    return null;
}

function isDefaultParagraphElement(node: HTMLElement): boolean {
    const tagName = node.tagName.toUpperCase();
    return ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(tagName);
}

function getHeadingNamedStyleType(node: HTMLElement): NamedStyleType | null {
    switch (node.tagName.toUpperCase()) {
        case 'H1': return NamedStyleType.HEADING_1;
        case 'H2': return NamedStyleType.HEADING_2;
        case 'H3': return NamedStyleType.HEADING_3;
        case 'H4': return NamedStyleType.HEADING_4;
        case 'H5': return NamedStyleType.HEADING_5;
        default: return null;
    }
}

function extractWordListInfo(node: HTMLElement): IListContext | null {
    const style = node.getAttribute('style') ?? '';
    const match = style.match(/mso-list:\s*([^ ;]+)\s+level(\d+)/i);
    if (!match && !/MsoListParagraph/i.test(node.className)) {
        return null;
    }

    const marker = (node.textContent ?? '').trim().match(/^([0-9]+\.|[a-zA-Z]\.|[ivxlcdmIVXLCDM]+\.|[·•●○\-])/);
    const ordered = Boolean(marker && !/[·•●○\-]/.test(marker[1]));

    return {
        listId: match?.[1] ?? 'mso-list',
        listType: ordered ? PresetListType.ORDER_LIST : PresetListType.BULLET_LIST,
        nestingLevel: Math.max(0, Number(match?.[2] ?? 1) - 1),
    };
}

function stripListMarkerFromCurrentParagraph(body: IDocumentBody): number {
    const paragraphEnd = body.dataStream.endsWith('\r') ? body.dataStream.length - 1 : body.dataStream.length;
    const paragraphStart = Math.max(0, body.dataStream.lastIndexOf('\r', paragraphEnd - 1) + 1);
    const text = body.dataStream.slice(paragraphStart, paragraphEnd);
    const marker = text.match(/^(\s*(?:[0-9]+\.|[a-zA-Z]\.|[ivxlcdmIVXLCDM]+\.|[·•●○\-])\s*)/);
    if (!marker) {
        return 0;
    }

    const length = marker[1].length;
    body.dataStream = body.dataStream.slice(0, paragraphStart) + body.dataStream.slice(paragraphStart + length);
    body.textRuns?.forEach((textRun) => {
        if (textRun.st >= paragraphStart + length) {
            textRun.st -= length;
            textRun.ed -= length;
        } else if (textRun.ed > paragraphStart) {
            textRun.ed = Math.max(textRun.st, textRun.ed - length);
        }
    });

    return length;
}
