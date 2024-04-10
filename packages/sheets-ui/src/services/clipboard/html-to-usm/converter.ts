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

import type { IDocumentBody, IDocumentData, ITextRun, ITextStyle, Nullable } from '@univerjs/core';
import { ObjectMatrix } from '@univerjs/core';
import { handleStringToStyle } from '@univerjs/ui';

import type { IPastePlugin } from '@univerjs/docs-ui';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetSkeletonManagerParam } from '../../sheet-skeleton-manager.service';
import type {
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    IParsedCellValueByClipboard,
    IUniverSheetCopyDataModel,
} from '../type';
import { extractNodeStyle } from './parse-node-style';
import type { IAfterProcessRule } from './paste-plugins/type';
import parseToDom, { generateParagraphs } from './utils';

export interface IStyleRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    getStyle(node: HTMLElement): ITextStyle;
}

export interface IParsedTablesInfo {
    index: number;
}

const sheetStyleRules: string[] =
    [
        'color',
        'background',
        'font-size',
        'border-left',
        'border-right',
        'border-top',
        'border-bottom',
        'text-align',
        'vertical-align',
        'font-weight',
        'font-style',
        'font-family',
        'text-decoration-line',
    ];

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

interface IHtmlToUSMServiceProps {
    getCurrentSkeleton: () => Nullable<ISheetSkeletonManagerParam>;
}

function hideIframe(iframe: HTMLIFrameElement) {
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'hidden iframe');
}

export class HtmlToUSMService {
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

    private htmlElement: HTMLIFrameElement;

    private getCurrentSkeleton: () => Nullable<ISheetSkeletonManagerParam>;

    constructor(props: IHtmlToUSMServiceProps) {
        this.getCurrentSkeleton = props.getCurrentSkeleton;
        this.htmlElement = document.createElement('iframe');
        this.htmlElement.style.display = 'none';
        document.body.appendChild(this.htmlElement);
        hideIframe(this.htmlElement);
    }

    convert(html: string): IUniverSheetCopyDataModel {
        if (this.htmlElement.contentDocument) {
            this.htmlElement.contentDocument.open();
            this.htmlElement.contentDocument.write(html);
            this.htmlElement.contentDocument.close();
        }
        html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/g, '');

        const pastePlugin = HtmlToUSMService.pluginList.find((plugin) => plugin.checkPasteType(html));
        if (pastePlugin) {
            this.styleRules = [...pastePlugin.stylesRules];
            this.afterProcessRules = [...pastePlugin.afterProcessRules];
        }
        const valueMatrix = new ObjectMatrix<ICellDataWithSpanInfo>();
        const dom = parseToDom(html);
        const newDocBody: IDocumentBody = {
            dataStream: '',
            textRuns: [],
        };

        const rowProperties: IClipboardPropertyItem[] = [];
        const colProperties: IClipboardPropertyItem[] = [];
        // pick tables
        const tableStrings = html.match(/<table\b[^>]*>([\s\S]*?)<\/table>/gi);
        const tables: IParsedTablesInfo[] = [];
        this.process(null, dom?.childNodes!, newDocBody, tables);
        const { paragraphs, dataStream, textRuns } = newDocBody;

        // use paragraph to split rows
        if (paragraphs) {
            const starts = paragraphs.map((p) => p.startIndex + 1);
            starts.unshift(0);
            for (let i = 0; i < starts.length; i++) {
                let cellDataStream;
                if (i === starts.length - 1) {
                    cellDataStream = `${dataStream.substring(starts[i])}\r\n`;
                } else {
                    cellDataStream = `${dataStream.substring(starts[i], starts[i + 1] - 1)}\r\n`;
                }
                const cellTextRuns: ITextRun[] = [];
                textRuns?.forEach((t) => {
                    if (t.st >= starts[i] && t.ed <= starts[i + 1]) {
                        cellTextRuns.push({
                            st: t.st - starts[i],
                            ed: t.ed - starts[i],
                            ts: t.ts,
                        });
                    }
                });
                // set rich format
                const p = this._generateDocumentDataModelSnapshot({
                    body: {
                        dataStream: cellDataStream,
                        textRuns: cellTextRuns,
                        paragraphs: generateParagraphs(cellDataStream),
                    },
                });
                valueMatrix.setValue(valueMatrix.getLength(), 0, {
                    v: cellDataStream,
                    p,
                });
                rowProperties.push({}); // TODO@yuhongz

                if (tableStrings) {
                    tables.forEach((t) => {
                        const curRow = valueMatrix.getDataRange().endRow + 1;
                        if (t.index === i) {
                            const tableString = tableStrings.shift();
                            const {
                                cellMatrix,
                                colProperties: tableColProp,
                                rowProperties: tableRowProp,
                            } = this._parseTable(tableString!);

                            cellMatrix &&
                                cellMatrix.forValue((row, col, value) => {
                                    valueMatrix.setValue(curRow + row, col, value);
                                });
                            if (tableColProp) {
                                colProperties.push(...tableColProp);
                            }
                            rowProperties.push(...tableRowProp);
                        }
                    });
                }
            }
        } else {
            if (dataStream) {
                const singleDataStream = `${dataStream}\r\n`;
                const singleDocBody: IDocumentBody = {
                    dataStream: singleDataStream,
                    textRuns,
                    paragraphs: generateParagraphs(singleDataStream),
                };
                const p = this._generateDocumentDataModelSnapshot({
                    body: singleDocBody,
                });
                valueMatrix.setValue(0, 0, {
                    v: dataStream,
                    p,
                });
                rowProperties.push({}); // TODO@yuhongz
            }

            if (tableStrings) {
                tableStrings.forEach((t) => {
                    const curRow = valueMatrix.getDataRange().endRow + 1;
                    const { cellMatrix, rowProperties: tableRowProp, colProperties: tableColProp } = this._parseTable(t!);
                    if (cellMatrix) {
                        cellMatrix.forValue((row, col, value) => {
                            valueMatrix.setValue(curRow + row, col, value);
                        });
                    }
                    if (tableColProp) {
                        colProperties.push(...tableColProp);
                    }
                    rowProperties.push(...tableRowProp);
                });
            }
        }
        return {
            rowProperties,
            colProperties,
            cellMatrix: valueMatrix,
        };
    }

    private _parseTable(html: string) {
        const valueMatrix = new ObjectMatrix<ICellDataWithSpanInfo>();
        const colProperties = parseColGroup(html);
        const { rowProperties } = parseTableRows(html);
        const parsedCellMatrix = parseTableByHtml(this.htmlElement, this.getCurrentSkeleton()?.skeleton);
        parsedCellMatrix &&
            parsedCellMatrix.forValue((row, col, value) => {
                const style = handleStringToStyle(undefined, value.style);
                const cellValue = value?.richTextParma?.p
                    ? {
                        v: value.richTextParma.v,
                        p: value.richTextParma.p,
                        s: style,
                        rowSpan: value.rowSpan,
                        colSpan: value.colSpan,
                    }
                    : {
                        v: value.content,
                        s: style,
                        rowSpan: value.rowSpan,
                        colSpan: value.colSpan,
                    };
                valueMatrix.setValue(row, col, cellValue);
            });
        return {
            rowProperties,
            colProperties,
            cellMatrix: valueMatrix,
        };
    }

    private _generateDocumentDataModelSnapshot(snapshot: Partial<IDocumentData>) {
        const currentSkeleton = this.getCurrentSkeleton();
        if (currentSkeleton == null) {
            return null;
        }
        const { skeleton } = currentSkeleton;
        const documentModel = skeleton.getBlankCellDocumentModel()?.documentModel;
        const p = documentModel?.getSnapshot();
        const documentData = { ...p, ...snapshot };
        documentModel?.reset(documentData);
        return documentModel?.getSnapshot();
    }

    private process(
        parent: Nullable<ChildNode>,
        nodes: NodeListOf<ChildNode>,
        doc: IDocumentBody,
        tables: IParsedTablesInfo[]
    ) {
        for (const node of nodes) {
            if (node.nodeName.toLowerCase() === 'table') {
                tables.push({
                    index: doc?.paragraphs?.length || 0,
                });
            } else if (node.nodeType === Node.TEXT_NODE) {
                // TODO: @JOCS, More characters need to be replaced, like `\b`
                const text = node.nodeValue?.replace(/[\r\n]/g, '');
                let style;

                if (parent && this.styleCache.has(parent)) {
                    style = this.styleCache.get(parent);
                }
                const newDoc: IDocumentBody = {
                    dataStream: '',
                    textRuns: [],
                };

                doc.dataStream += text;
                newDoc.dataStream += text;
                if (style && Object.getOwnPropertyNames(style).length) {
                    doc.textRuns!.push({
                        st: doc.dataStream.length - text!.length,
                        ed: doc.dataStream.length,
                        ts: style,
                    });
                    newDoc.textRuns!.push({
                        st: doc.dataStream.length - text!.length,
                        ed: doc.dataStream.length,
                        ts: style,
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.nodeName === 'STYLE') {
                    continue;
                }
                const parentStyles = parent ? this.styleCache.get(parent) : {};
                const styleRule = this.styleRules.find(({ filter }) => matchFilter(node as HTMLElement, filter));
                const nodeStyles = styleRule
                    ? styleRule.getStyle(node as HTMLElement)
                    : extractNodeStyle(node as HTMLElement);

                this.styleCache.set(node, { ...parentStyles, ...nodeStyles });

                const { childNodes } = node;

                this.process(node, childNodes, doc, tables);

                const afterProcessRule = this.afterProcessRules.find(({ filter }) =>
                    matchFilter(node as HTMLElement, filter)
                );

                if (afterProcessRule) {
                    afterProcessRule.handler(doc, node as HTMLElement);
                }
            }
        }
    }

    dispose() {
        document.body.removeChild(this.htmlElement);
    }
}

/**
 * This function parses <tr> elements in the table. So it would return several things.
 * @param html raw content
 * @returns
 */
function parseTableRows(html: string): {
    rowProperties: IClipboardPropertyItem[];
    rowCount: number;
} {
    const ROWS_REGEX = /<tr([\s\S]*?)>([\s\S]*?)<\/tr>/gi;
    const rowMatches = html.matchAll(ROWS_REGEX);
    if (!rowMatches) {
        return {
            rowProperties: [],
            rowCount: 0,
        };
    }

    const rowMatchesAsArray = Array.from(rowMatches);
    const rowProperties = rowMatchesAsArray.map((rowMatch) => parseProperties(rowMatch[1]));

    return {
        rowProperties,
        rowCount: rowProperties.length,
    };
}

function parseProperties(propertyStr: string): IClipboardPropertyItem {
    if (!propertyStr) {
        return {};
    }

    const property: IClipboardPropertyItem = {};
    const PROPERTY_REGEX = /([\w-]+)\s*=\s*(?:(['"])([^'"]*)\2|(\S+))/g;

    let match;

    while ((match = PROPERTY_REGEX.exec(propertyStr)) !== null) {
        const [, attributeName, , attributeValue1, attributeValue2] = match;
        const attributeValue = attributeValue1 !== undefined ? attributeValue1 : attributeValue2;
        property[attributeName] = attributeValue;
    }

    return property;
}

/**
 * Parse columns and their properties from colgroup element.
 *
 * @param raw content
 * @returns cols and their properties
 */
function parseColGroup(raw: string): IClipboardPropertyItem[] | null {
    const COLGROUP_TAG_REGEX = /<colgroup([\s\S]*?)>(.*?)<\/colgroup>/;
    const colgroupMatch = raw.match(COLGROUP_TAG_REGEX);
    if (!colgroupMatch || !colgroupMatch[2]) {
        return null;
    }

    const COL_TAG_REGEX = /<col([\s\S]*?)>/g;
    const colMatches = colgroupMatch[2].matchAll(COL_TAG_REGEX);
    if (!colMatches) {
        return null;
    }

    return Array.from(colMatches).map((colMatch) => parseProperties(colMatch[1]));
}

function childNodeToHTML(node: ChildNode) {
    const serializer = new XMLSerializer();
    const htmlString = serializer.serializeToString(node);
    return htmlString;
}

function decodeHTMLEntities(input: string): string {
    const entities: { [key: string]: string } = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': '\'',
        '&nbsp;': ' ',
    };

    return input.replace(/&lt;|&gt;|&amp;|&quot;|&#39;|&nbsp;|<br>/g, (match) => entities[match]);
}

function extractBordersAndKeepOthers(styleString: string, bordersToKeep: string[]) {
    if (!styleString) return '';
    const borderRegex = /border(-top|-right|-bottom|-left)?\s*:\s*([^;]+);/g;

    const extractedBorders: Record<string, string> = {};

    const withoutBorders = styleString.replace(borderRegex, (match, p1, p2) => {
        const borderType = `border${p1 || ''}`;
        extractedBorders[borderType] = p2.trim();
        return '';
    });

    let newStyleString = bordersToKeep
        .map((border) => {
            if (border === 'border' && extractedBorders[border]) {
                return `border: ${extractedBorders[border]};`;
            } else if (extractedBorders[border]) {
                return `${border}: ${extractedBorders[border]};`;
            }
            return '';
        })
        .filter((style) => style)
        .join(' ');

    newStyleString += ` ${withoutBorders.trim()}`;

    return newStyleString.trim();
}

function parseTableByHtml(htmlElement: HTMLIFrameElement, skeleton?: SpreadsheetSkeleton) {
    const cellMatrix = new ObjectMatrix<IParsedCellValueByClipboard>();
    const tableEle = htmlElement.contentDocument?.querySelector('table');
    if (!tableEle) {
        return cellMatrix;
    }
    const rows = tableEle?.querySelectorAll('tr');

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const cells = row.querySelectorAll('td, th');
        let colSetValueIndex = 0;
        for (let colIndex = 0; colIndex < cells.length;) {
            const cell = cells[colIndex];
            let cellStyle = '';
            let cellText;
            let cellRichStyle;
            const rowSpan = Number(cell.getAttribute('rowSpan')) || 1;
            const colSpan = Number(cell.getAttribute('colSpan')) || 1;

            // If there is a class attribute, use getComputedStyle
            const hasClass = cell.getAttribute('class');
            if (hasClass) {
                const computedStyle = getComputedStyle(cell);
                sheetStyleRules.forEach((rule) => {
                    const ruleValue = computedStyle.getPropertyValue(rule);
                    if (ruleValue) {
                        cellStyle += `${rule}:${ruleValue};`;
                    }
                });
            } else {
                const regex = /<\w+\s+[^>]*?style="([^"]*)"/gi;
                const match = regex.exec(cell.outerHTML);
                if (match?.[1]) {
                    cellStyle = match[1];
                }
            }
            if (rowSpan > 1 && colSpan > 1) {
                // compatible google sheet；The border style of merged cells in Google is set on the right and bottom sides of the merged cells
                if (!cellStyle.includes('border-top') && !cellStyle.includes('border-left')) {
                    const topStyle = extractStyleProperty(cellMatrix.getValue(rowIndex - 1, colIndex)?.style, 'border-bottom');
                    const leftStyle = extractStyleProperty(cellMatrix.getValue(rowIndex, colIndex - 1)?.style, 'border-right');
                    if (topStyle) {
                        cellStyle += `border-top:${topStyle};`;
                    }
                    if (leftStyle) {
                        cellStyle += `border-left:${leftStyle};`;
                    }
                }
            }

            // Determine whether it is rich text based on whether there are html tags
            const isRichText = /<[^>]+>/.test(cell.innerHTML);
            if (isRichText && skeleton) {
                const newDocBody: IDocumentBody = {
                    dataStream: '',
                    textRuns: [],
                };
                // Rich text parsing method, refer to the doc
                parseCellHtml(null, cell.childNodes, newDocBody);
                const documentModel = skeleton.getBlankCellDocumentModel()?.documentModel;
                const p = documentModel?.getSnapshot();
                const singleDataStream = `${newDocBody.dataStream}\r\n`;
                const documentData = {
                    ...p, ...{
                        body: {
                            dataStream: singleDataStream,
                            textRuns: newDocBody.textRuns,
                            paragraphs: generateParagraphs(singleDataStream),
                        },
                    },
                };
                documentModel?.reset(documentData);
                cellRichStyle = documentModel?.getSnapshot();
                cellText = newDocBody.dataStream;
            } else {
                cellText = cell.innerHTML.replace(/[\r\n]/g, '');
            }

            const cellValue = (rowSpan > 1 || colSpan > 1)
                ? {
                    rowSpan,
                    colSpan,
                    content: cellText,
                    style: cellStyle,
                    richTextParma: {
                        p: cellRichStyle,
                        v: cellText,
                    },
                }
                : {
                    content: cellText,
                    style: cellStyle,
                    richTextParma: {
                        p: cellRichStyle,
                        v: cellText,
                    },
                };

            if (cellMatrix.getValue(rowIndex, colSetValueIndex)) {
                colSetValueIndex += 1;
                continue;
            } else {
                // Clone the style of merged cells to each individual cell; switch to cloning only border styles if there are issues later.
                if ((rowSpan > 1 || colSpan > 1)) {
                    if (rowSpan === 1) {
                        for (let i = colSetValueIndex; i < colSetValueIndex + colSpan; i++) {
                            cellMatrix.setValue(rowIndex, i, { style: extractBordersAndKeepOthers(cellStyle, ['border-top', 'border-bottom']) });
                        }
                        cellMatrix.setValue(rowIndex, colSetValueIndex + colSpan - 1, { style: extractBordersAndKeepOthers(cellStyle, ['border-top', 'border-bottom', 'border-right']) });
                        cellMatrix.setValue(rowIndex, colSetValueIndex, { ...cellValue, style: extractBordersAndKeepOthers(cellStyle, ['border-top', 'border-bottom', 'border-left']) });
                    } else if (colSpan === 1) {
                        for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
                            cellMatrix.setValue(i, colSetValueIndex, { style: extractBordersAndKeepOthers(cellStyle, ['border-left', 'border-right']) });
                        }
                        cellMatrix.setValue(rowIndex + rowSpan - 1, colSetValueIndex, { style: extractBordersAndKeepOthers(cellStyle, ['border-left', 'border-right', 'border-bottom']) });
                        cellMatrix.setValue(rowIndex, colSetValueIndex, { ...cellValue, style: extractBordersAndKeepOthers(cellStyle, ['border-left', 'border-right', 'border-top']) });
                    } else {
                        for (let i = colSetValueIndex; i < colSetValueIndex + colSpan; i++) {
                            cellMatrix.setValue(rowIndex, i, { style: extractBordersAndKeepOthers(cellStyle, ['border-top']) });
                            cellMatrix.setValue(rowIndex + rowSpan - 1, i, { style: extractBordersAndKeepOthers(cellStyle, ['border-bottom']) });
                        }
                        for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
                            cellMatrix.setValue(i, colSetValueIndex, { style: extractBordersAndKeepOthers(cellStyle, ['border-left']) });
                            cellMatrix.setValue(i, colSetValueIndex + colSpan - 1, { style: extractBordersAndKeepOthers(cellStyle, ['border-right']) });
                        }
                        cellMatrix.setValue(rowIndex + rowSpan - 1, colSetValueIndex, { style: extractBordersAndKeepOthers(cellStyle, ['border-left', 'border-bottom']) });
                        cellMatrix.setValue(rowIndex, colSetValueIndex + colSpan - 1, { style: extractBordersAndKeepOthers(cellStyle, ['border-right', 'border-top']) });
                        cellMatrix.setValue(rowIndex + rowSpan - 1, colSetValueIndex + colSpan - 1, { style: extractBordersAndKeepOthers(cellStyle, ['border-right', 'border-bottom']) });
                        cellMatrix.setValue(rowIndex, colSetValueIndex, { ...cellValue, style: extractBordersAndKeepOthers(cellStyle, ['border-top', 'border-left']) });
                        for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
                            for (let j = colSetValueIndex; j < colSetValueIndex + colSpan; j++) {
                                if (!cellMatrix.getValue(i, j)) {
                                    cellMatrix.setValue(i, j, { style: extractBordersAndKeepOthers(cellStyle, []) });
                                }
                            }
                        }
                    }
                } else {
                    cellMatrix.setValue(rowIndex, colSetValueIndex, cellValue);
                }
                colSetValueIndex += colSpan;
                colIndex++;
            }
        }
    }
    return cellMatrix;
}

function parseCellHtml(parent: Nullable<ChildNode>, nodes: NodeListOf<ChildNode>, doc: IDocumentBody, styleCache: Map<ChildNode, ITextStyle> = new Map()) {
    for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue?.replace(/[\r\n]/g, '');
            let style;

            if (parent && styleCache.has(parent)) {
                style = styleCache.get(parent);
            }

            doc.dataStream += text;

            if (style && Object.getOwnPropertyNames(style).length) {
                doc.textRuns!.push({
                    st: doc.dataStream.length - text!.length,
                    ed: doc.dataStream.length,
                    ts: style,
                });
            }
        } else if (node.nodeType === Node.COMMENT_NODE || node.nodeName === 'STYLE') {
            continue;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const parentStyles = parent ? styleCache.get(parent) : {};
            const predefinedStyles = getComputedStyle(node as HTMLElement);
            const nodeStyles = extractNodeStyle(node as HTMLElement, predefinedStyles);

            styleCache.set(node, { ...parentStyles, ...nodeStyles });
            const { childNodes } = node;
            parseCellHtml(node, childNodes, doc, styleCache);
        }
    }
}

function extractStyleProperty(styleString?: string, propertyName?: string) {
    if (!styleString || !propertyName) return null;
    const regex = new RegExp(`(${propertyName}\\s*:\\s*[^;]+);`, 'i');
    const match = styleString.match(regex);
    if (match) {
        return match[1];
    }
    return null;
}
