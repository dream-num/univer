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

import type { IDocumentBody, IDocumentData, IParagraph, ITable, ITableCell, ITableCellBorder, ITextStyle, Nullable } from '@univerjs/core';
import type { IAfterProcessRule, IPastePlugin, IStyleRule } from './paste-plugins/type';
import {
    ColorKit,
    createParagraphId,
    createSectionId,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    DrawingTypeEnum,
    generateRandomId,
    ImageSourceType,
    isSafeUrl,
    NamedStyleType,
    PositionedObjectLayoutType,
    PresetListType,
    skipParseTagNames,
    TableRowHeightRule,
    TableSizeType,
    Tools,
} from '@univerjs/core';
import { buildDocTransform } from '@univerjs/docs';
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
const WORD_SPACE_PLACEHOLDER = '\uE000';

interface ITableCache {
    table: ITable;
    startIndex: number;
}

interface IListContext {
    listId: string;
    listType: PresetListType;
    nestingLevel: number;
}

interface IParsedHtmlTableCell {
    element: HTMLElement | null;
    rowSpan: number;
    colSpan: number;
    covered?: boolean;
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

    private _createParagraphId(body: IDocumentBody): string {
        return createParagraphId(new Set(body.paragraphs?.map((paragraph) => paragraph.paragraphId)));
    }

    private _createSectionId(body: IDocumentBody): string {
        return createSectionId(new Set(body.sectionBreaks?.map((sectionBreak) => sectionBreak.sectionId)));
    }

    convert(html: string, metaConfig: { unitId?: string } = {}): Partial<IDocumentData> {
        const pastePlugin = HtmlToUDMService._pluginList.find((plugin) => plugin.checkPasteType(html));
        const normalizedHtml = pastePlugin?.preprocessHtml?.(html) ?? html;
        const dom = parseToDom(normalizedHtml)!;

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
                const text = normalizeTextNode(node);
                if (!text) {
                    continue;
                }

                let style;

                if (parent && this._styleCache.has(parent)) {
                    style = this._styleCache.get(parent);
                }

                body.dataStream += text;

                if (style && Object.getOwnPropertyNames(style).length) {
                    body.textRuns!.push({
                        st: body.dataStream.length - text.length,
                        ed: body.dataStream.length,
                        ts: style,
                    });
                }
            } else if (node.nodeName === 'IMG') {
                const element = node as HTMLImageElement;
                const imageSourceType = element.dataset.imageSourceType ?? (element.src ? inferImageSourceType(element.src) : undefined);
                const source = imageSourceType === ImageSourceType.UUID ? element.dataset.source : element.src;

                if (source && imageSourceType) {
                    const width = readImageSize(element, 'width') ?? 100;
                    const height = readImageSize(element, 'height') ?? 100;
                    const docTransformWidth = readCssSize(element.dataset.docTransformWidth || null, null, 'width') ?? width;
                    const docTransformHeight = readCssSize(element.dataset.docTransformHeight || null, null, 'height') ?? height;

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
                        docTransform: buildDocTransform(docTransformWidth, docTransformHeight),
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
                if (element.tagName.toUpperCase() === 'TABLE') {
                    this._processHtmlTable(element, doc);
                    continue;
                }

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
            blockType: DocumentBlockRangeType.CODE,
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
            this._applyListInfo(node, doc);
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
            paragraphId: this._createParagraphId(body),
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

    private _applyListInfo(node: HTMLElement, doc: Partial<IDocumentData>): void {
        const htmlListContext = this._listStack[this._listStack.length - 1];
        const wordListContext = extractWordListInfo(node);
        const listContext = htmlListContext ?? wordListContext;
        const paragraph = doc.body?.paragraphs?.[doc.body.paragraphs.length - 1];
        if (!listContext || !paragraph) {
            return;
        }

        paragraph.bullet = {
            listId: listContext.listId,
            listType: listContext.listType,
            nestingLevel: listContext.nestingLevel,
        };
        if (wordListContext) {
            paragraph.startIndex -= stripListMarkerFromCurrentParagraph(doc.body!);
        }
    }

    private _processHtmlTable(node: HTMLElement, doc: Partial<IDocumentData>): void {
        const body = doc.body!;
        if (body.dataStream[body.dataStream.length - 1] !== '\r') {
            body.dataStream += '\r';
            body.paragraphs ??= [];
            body.paragraphs.push({
                startIndex: body.dataStream.length - 1,
                paragraphId: this._createParagraphId(body),
            });
        }

        doc.tableSource ??= {};
        body.tables ??= [];
        body.sectionBreaks ??= [];

        const rows = collectHtmlTableRows(node);
        const grid = buildHtmlTableGrid(rows);
        const columnCount = Math.max(1, ...grid.map((row) => row.length));
        const table = genTableSource(0, columnCount, DEFAULT_TABLE_WIDTH);
        const tableWidth = readCssSize(node.getAttribute('width'), node.getAttribute('style'), 'width');
        const columnWidths = resolveHtmlTableColumnWidths(node, grid, columnCount, tableWidth);
        table.tableRows = [];
        table.tableColumns = columnWidths.map((width) => getTableColumn(width));
        table.size = {
            type: TableSizeType.SPECIFIED,
            width: { v: tableWidth ?? table.tableColumns.reduce((sum, column) => sum + column.size.width.v, 0) },
        };

        const startIndex = body.dataStream.length;
        body.dataStream += DataStreamTreeTokenType.TABLE_START;

        grid.forEach((row, rowIndex) => {
            const tableRow = getEmptyTableRow(0);
            const rowElement = rows[rowIndex];
            const height = rowElement ? readCssSize(rowElement.getAttribute('height'), rowElement.getAttribute('style'), 'height') : undefined;
            if (height != null) {
                tableRow.trHeight = {
                    val: { v: height },
                    hRule: TableRowHeightRule.EXACT,
                };
            }

            table.tableRows.push(tableRow);
            body.dataStream += DataStreamTreeTokenType.TABLE_ROW_START;

            for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                const parsedCell = row[columnIndex] ?? { element: null, rowSpan: 1, colSpan: 1, covered: true };
                const tableCell = parsedCell.covered
                    ? { ...getEmptyTableCell(), rowSpan: 0, columnSpan: 0 }
                    : createTableCellFromHtml(parsedCell.element!, parsedCell.rowSpan, parsedCell.colSpan);

                tableRow.tableCells.push(tableCell);
                this._appendHtmlTableCell(parsedCell, doc);
            }

            body.dataStream += DataStreamTreeTokenType.TABLE_ROW_END;
        });

        doc.tableSource[table.tableId] = table;
        body.dataStream += DataStreamTreeTokenType.TABLE_END;
        body.tables.push({
            startIndex,
            endIndex: body.dataStream.length,
            tableId: table.tableId,
        });
    }

    private _appendHtmlTableCell(cell: IParsedHtmlTableCell, doc: Partial<IDocumentData>): void {
        const body = doc.body!;
        body.dataStream += DataStreamTreeTokenType.TABLE_CELL_START;

        if (cell.element && !cell.covered) {
            this._process(cell.element, cell.element.childNodes, doc);
        }

        if (body.dataStream[body.dataStream.length - 1] !== '\r') {
            this._appendParagraph(doc, cell.element ?? document.createElement('td'));
        }

        body.sectionBreaks ??= [];
        body.sectionBreaks.push({
            sectionId: this._createSectionId(body),
            startIndex: body.dataStream.length,
        });

        body.dataStream += `\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
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
                        paragraphId: this._createParagraphId(body),
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
                        paragraphId: this._createParagraphId(body),
                    });

                    body.dataStream += '\r';
                }

                body.sectionBreaks?.push({
                    sectionId: this._createSectionId(body),
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

function collectHtmlTableRows(table: HTMLElement): HTMLElement[] {
    const rows: HTMLElement[] = [];
    Array.from(table.children).forEach((child) => {
        const tagName = child.tagName.toUpperCase();
        if (tagName === 'TR') {
            rows.push(child as HTMLElement);
        } else if (tagName === 'TBODY' || tagName === 'THEAD' || tagName === 'TFOOT') {
            rows.push(...Array.from(child.children).filter((row) => row.tagName.toUpperCase() === 'TR') as HTMLElement[]);
        }
    });

    return rows;
}

function normalizeTextNode(node: ChildNode): string {
    const value = node.nodeValue ?? '';
    if (value.includes(WORD_SPACE_PLACEHOLDER)) {
        return value
            .replace(/[\t\u00A0]+/g, ' ')
            .replace(/[ \r\n]+/g, ' ')
            .replace(/ *\uE000+ */g, (match) => ' '.repeat(Array.from(match).filter((char) => char === WORD_SPACE_PLACEHOLDER).length));
    }

    const hasExplicitSpacing = /[\t\u00A0]/.test(value);
    const text = value
        .replace(/[\t\u00A0]+/g, ' ')
        .replace(/[ \r\n]+/g, ' ');

    if (text.trim()) {
        return text;
    }

    if (!hasExplicitSpacing) {
        return '';
    }

    return hasTextSibling(node.previousSibling, 'previous') && hasTextSibling(node.nextSibling, 'next') ? ' ' : '';
}

function inferImageSourceType(src: string): ImageSourceType {
    return src.startsWith('data:image/') ? ImageSourceType.BASE64 : ImageSourceType.URL;
}

function hasTextSibling(node: ChildNode | null, direction: 'previous' | 'next'): boolean {
    let current = node;
    while (current) {
        if (current.nodeType === Node.TEXT_NODE && current.nodeValue?.trim()) {
            return true;
        }

        if (current.nodeType === Node.ELEMENT_NODE && (current.textContent ?? '').trim()) {
            return true;
        }

        current = direction === 'previous' ? current.previousSibling : current.nextSibling;
    }

    return false;
}

function buildHtmlTableGrid(rows: HTMLElement[]): IParsedHtmlTableCell[][] {
    const grid: IParsedHtmlTableCell[][] = [];
    const occupied = new Set<string>();

    rows.forEach((row, rowIndex) => {
        const parsedRow: IParsedHtmlTableCell[] = [];
        let columnIndex = 0;

        getHtmlTableCells(row).forEach((cellElement) => {
            while (occupied.has(`${rowIndex}:${columnIndex}`)) {
                parsedRow[columnIndex] = { element: null, rowSpan: 1, colSpan: 1, covered: true };
                columnIndex++;
            }

            const rowSpan = Math.max(1, Number(cellElement.getAttribute('rowspan') ?? 1));
            const colSpan = Math.max(1, Number(cellElement.getAttribute('colspan') ?? 1));
            parsedRow[columnIndex] = { element: cellElement, rowSpan, colSpan };

            for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
                for (let columnOffset = 0; columnOffset < colSpan; columnOffset++) {
                    if (rowOffset === 0 && columnOffset === 0) {
                        continue;
                    }

                    occupied.add(`${rowIndex + rowOffset}:${columnIndex + columnOffset}`);
                    if (rowOffset === 0) {
                        parsedRow[columnIndex + columnOffset] = { element: null, rowSpan: 1, colSpan: 1, covered: true };
                    }
                }
            }

            columnIndex += colSpan;
        });

        while (occupied.has(`${rowIndex}:${columnIndex}`)) {
            parsedRow[columnIndex] = { element: null, rowSpan: 1, colSpan: 1, covered: true };
            columnIndex++;
        }

        grid.push(parsedRow);
    });

    const columnCount = Math.max(0, ...grid.map((row) => row.length));
    grid.forEach((row) => {
        while (row.length < columnCount) {
            row.push({ element: null, rowSpan: 1, colSpan: 1, covered: true });
        }
    });

    return grid.length ? grid : [[]];
}

function getHtmlTableCells(row: HTMLElement): HTMLElement[] {
    return Array.from(row.children).filter((element) => {
        const tagName = element.tagName.toUpperCase();
        return tagName === 'TD' || tagName === 'TH';
    }) as HTMLElement[];
}

function collectHtmlTableColumnWidths(table: HTMLElement, grid: IParsedHtmlTableCell[][], columnCount: number): Array<number | undefined> {
    const widths: Array<number | undefined> = Array.from({ length: columnCount });
    Array.from(table.querySelectorAll('col')).forEach((col, index) => {
        if (index < widths.length) {
            widths[index] = readCssSize(col.getAttribute('width'), col.getAttribute('style'), 'width');
        }
    });

    grid.forEach((row) => {
        row.forEach((cell, columnIndex) => {
            if (!cell.element || widths[columnIndex] != null) {
                return;
            }

            const width = readCssSize(cell.element.getAttribute('width'), cell.element.getAttribute('style'), 'width');
            if (width != null && cell.colSpan <= 1) {
                widths[columnIndex] = width;
            }
        });
    });

    return widths;
}

function resolveHtmlTableColumnWidths(table: HTMLElement, grid: IParsedHtmlTableCell[][], columnCount: number, tableWidth?: number): number[] {
    const explicitWidths = collectHtmlTableColumnWidths(table, grid, columnCount);
    const fallbackTableWidth = tableWidth ?? DEFAULT_TABLE_WIDTH;
    const explicitTotal = explicitWidths.reduce<number>((sum, width) => sum + (width ?? 0), 0);
    const missingCount = explicitWidths.filter((width) => width == null).length;
    const fallbackColumnWidth = missingCount
        ? Math.max((fallbackTableWidth - explicitTotal) / missingCount, 1)
        : fallbackTableWidth / columnCount;

    return explicitWidths.map((width) => width ?? roundCssNumber(fallbackColumnWidth));
}

function createTableCellFromHtml(element: HTMLElement, rowSpan: number, colSpan: number): ITableCell {
    const cell = getEmptyTableCell();
    if (rowSpan > 1) {
        cell.rowSpan = rowSpan;
    }
    if (colSpan > 1) {
        cell.columnSpan = colSpan;
    }

    const style = element.getAttribute('style') ?? '';
    const width = readCssSize(element.getAttribute('width'), style, 'width');
    const backgroundColor = readCssColor(style, 'background-color') ?? readCssColor(style, 'background') ?? readHtmlAttributeColor(element, 'bgcolor');
    const borderTop = createTableCellBorder(style, 'top');
    const borderRight = createTableCellBorder(style, 'right');
    const borderBottom = createTableCellBorder(style, 'bottom');
    const borderLeft = createTableCellBorder(style, 'left');

    if (width != null) {
        cell.size = {
            type: TableSizeType.SPECIFIED,
            width: { v: width },
        };
    }
    if (backgroundColor) {
        cell.backgroundColor = { rgb: backgroundColor };
    }
    if (borderTop) {
        cell.borderTop = borderTop;
    }
    if (borderRight) {
        cell.borderRight = borderRight;
    }
    if (borderBottom) {
        cell.borderBottom = borderBottom;
    }
    if (borderLeft) {
        cell.borderLeft = borderLeft;
    }

    return cell;
}

function createTableCellBorder(style: string, side: 'top' | 'right' | 'bottom' | 'left'): ITableCellBorder | undefined {
    const sideStyle = readCssValue(style, `border-${side}`);
    const color = readCssColor(style, `border-${side}-color`) ??
        normalizeCssColor(sideStyle?.match(/(#[0-9a-f]{3,8}|rgb\([^)]+\))/i)?.[1]) ??
        readCssColor(style, 'border-color') ??
        normalizeCssColor(readCssValue(style, 'border')?.match(/(#[0-9a-f]{3,8}|rgb\([^)]+\))/i)?.[1]) ??
        readNamedBorderColor(style);
    const width = readCssLengthValue(readCssValue(style, `border-${side}-width`)) ??
        readCssLengthValue(sideStyle) ??
        readCssLengthValue(readCssValue(style, 'border-width')) ??
        readCssLengthValue(readCssValue(style, 'border'));

    if (!color && width == null) {
        return undefined;
    }

    return {
        color: { rgb: normalizeCssColor(color) ?? '#1f1f1f' },
        width: { v: width ?? 1 },
    };
}

function readNamedBorderColor(style: string): string | undefined {
    const match = style.match(/border(?:-[a-z]+)?\s*:\s*([^;]+)/i);
    if (!match) {
        return undefined;
    }

    const keyword = match[1].split(/\s+/).find((part) => {
        const normalized = part.toLowerCase();
        return normalized && !/^[0-9.]+/.test(normalized) && !['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'].includes(normalized);
    });

    return normalizeCssColor(keyword);
}

function readHtmlAttributeColor(element: HTMLElement, attributeName: string): string | undefined {
    return normalizeCssColor(element.getAttribute(attributeName));
}

function readCssColor(style: string, property: string): string | undefined {
    return normalizeCssColor(readCssValue(style, property));
}

function normalizeCssColor(value: string | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    try {
        const color = new ColorKit(value.trim());
        return color.isValid ? color.toRgbString() : undefined;
    } catch {
        return undefined;
    }
}

function readCssValue(style: string, property: string): string | undefined {
    const normalizedProperty = property.toLowerCase();
    const declaration = style
        .split(';')
        .map((part) => part.split(':'))
        .find(([name]) => name?.trim().toLowerCase() === normalizedProperty);

    return declaration?.slice(1).join(':').trim() || undefined;
}

function readCssSize(attributeValue: string | null, style: string | null, property: 'height' | 'width'): number | undefined {
    const styleMatch = readCssValue(style ?? '', property)?.match(/^([0-9.]+)\s*(px|pt|in|cm|mm)?$/i);
    if (styleMatch) {
        return toPixels(Number(styleMatch[1]), styleMatch[2]);
    }

    const attrMatch = attributeValue?.match(/([0-9.]+)\s*(px|pt|in|cm|mm)?/i);
    return attrMatch ? toPixels(Number(attrMatch[1]), attrMatch[2]) : undefined;
}

function readCssLengthValue(value: string | null | undefined): number | undefined {
    const match = value?.match(/(?:^|\s)([0-9.]+)\s*(px|pt|in|cm|mm)(?=\s|$)/i) ??
        value?.match(/^\s*([0-9.]+)\s*$/);

    return match ? toPixels(Number(match[1]), match[2]) : undefined;
}

function readImageSize(element: HTMLImageElement, property: 'height' | 'width'): number | undefined {
    const datasetValue = property === 'width' ? element.dataset.width : element.dataset.height;

    return readCssSize(datasetValue || null, null, property) ??
        readCssSize(element.getAttribute(property), element.getAttribute('style'), property);
}

function toPixels(value: number, unit?: string): number {
    switch (unit?.toLowerCase()) {
        case 'pt':
            return roundCssNumber(value * 4 / 3);
        case 'in':
            return roundCssNumber(value * 96);
        case 'cm':
            return roundCssNumber(value * 96 / 2.54);
        case 'mm':
            return roundCssNumber(value * 96 / 25.4);
        default:
            return roundCssNumber(value);
    }
}

function roundCssNumber(value: number): number {
    return Math.round(value * 100) / 100;
}

function getStructuredBlockType(node: HTMLElement): DocumentBlockRangeType | null {
    const docType = node.dataset.docType;
    if (docType === DocumentBlockRangeType.QUOTE) {
        return DocumentBlockRangeType.QUOTE;
    }

    if (docType === DocumentBlockRangeType.CALLOUT) {
        return DocumentBlockRangeType.CALLOUT;
    }

    const tagName = node.tagName.toUpperCase();
    if (tagName === 'BLOCKQUOTE') {
        return docType === DocumentBlockRangeType.CALLOUT ? DocumentBlockRangeType.CALLOUT : DocumentBlockRangeType.QUOTE;
    }

    if (tagName === 'ASIDE' && node.getAttribute('role') === 'note') {
        return DocumentBlockRangeType.CALLOUT;
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

    {
        const marker = (node.textContent ?? '').trim().match(/^([0-9]+[.)]|[a-zA-Z][.)]|[ivxlcdmIVXLCDM]+[.)]|[\u2022\u00B7\u25CF\u25CB\u25AA\u25AB-])/);
        const markerText = marker?.[1] ?? '';
        const ordered = Boolean(markerText && !/^[\u2022\u00B7\u25CF\u25CB\u25AA\u25AB-]$/.test(markerText));

        return {
            listId: match?.[1] ?? 'mso-list',
            listType: ordered ? PresetListType.ORDER_LIST : PresetListType.BULLET_LIST,
            nestingLevel: Math.max(0, Number(match?.[2] ?? 1) - 1),
        };
    }
}

function stripListMarkerFromCurrentParagraph(body: IDocumentBody): number {
    const paragraphEnd = body.dataStream.endsWith('\r') ? body.dataStream.length - 1 : body.dataStream.length;
    const paragraphStart = Math.max(0, body.dataStream.lastIndexOf('\r', paragraphEnd - 1) + 1);
    const text = body.dataStream.slice(paragraphStart, paragraphEnd);
    {
        const marker = text.match(/^(\s*(?:[0-9]+[.)]|[a-zA-Z][.)]|[ivxlcdmIVXLCDM]+[.)]|[\u2022\u00B7\u25CF\u25CB\u25AA\u25AB-])\s*)/);
        if (marker) {
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
    }

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
