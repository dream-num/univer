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
import { pixelToPt } from '@univerjs/engine-render';
import { generateBody } from '../../../controllers/clipboard/utils';
import type { ISheetSkeletonManagerParam } from '../../sheet-skeleton-manager.service';
import type {
    ICellDataWithSpanInfo,
    IClipboardPropertyItem,
    IParsedCellValue,
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
                            const { rowSpan = 1, colSpan = 1 } = value;
                            for (let i = 0; i < rowSpan; i++) {
                                for (let j = 0; j < colSpan; j++) {
                                    valueMatrix.setValue(curRow + row + i, col + j, {
                                        v: '',
                                    });
                                }
                            }
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
        const { rowProperties, rowCount, cellMatrix: parsedCellMatrix } = parseTableRows(html);
        parsedCellMatrix &&
            parsedCellMatrix.forValue((row, col, value) => {
                let styleString = value.properties?.style;
                // TODO@Dushusir Temporarily use handleStringToStyle. After all replication and paste function is completed, fix the handleStringToStyle method

                const className = value.properties?.class;
                if (className) {
                    const dom = this.htmlElement.contentDocument?.getElementsByClassName(className)?.[0];
                    if (dom) {
                        const computedStyle = window.getComputedStyle(dom!, null);

                        const { fontSize, fontFamily, border, borderLeft, borderRight, borderTop, borderBottom, verticalAlign, background, color, textAlign, fontWeight } = computedStyle;
                        if (fontSize) {
                            styleString += `;font-size: ${pixelToPt(Number.parseInt(fontSize))}pt`;
                        }
                        if (fontFamily) {
                            styleString += `;font-family: ${fontFamily}`;
                        }
                        if (border) {
                            styleString += `;border: ${border}`;
                        }
                        if (borderLeft) {
                            styleString += `;border-left: ${borderLeft}`;
                        }
                        if (borderRight) {
                            styleString += `;border-right: ${borderRight}`;
                        }
                        if (borderTop) {
                            styleString += `;border-top: ${borderTop}`;
                        }
                        if (borderBottom) {
                            styleString += `;border-bottom: ${borderBottom}`;
                        }
                        if (verticalAlign) {
                            styleString += `;vertical-align: ${verticalAlign}`;
                        }
                        if (background) {
                            styleString += `;background: ${background}`;
                        }
                        if (color) {
                            styleString += `;color: ${color}`;
                        }
                        if (textAlign) {
                            styleString += `;text-align: ${textAlign}`;
                        }
                        if (fontWeight) {
                            styleString += `;font-weight: ${fontWeight}`;
                        }
                    }
                }
                const style = handleStringToStyle(undefined, styleString);

                // todo这里是有问题的 应该是判断里面有没有html标签 这里应该是直接赋值的逻辑了，解析p应该在上一步去做
                if (/\r|\n/.test(value.content)) {
                    const body = generateBody(value.content);
                    const p = this._generateDocumentDataModelSnapshot({
                        body,
                    });
                    if (!valueMatrix.getValue(row, col)) {
                        const newValue = (value.rowSpan || value.colSpan)
                            ? {
                                v: value.content,
                                p,
                                s: style,
                                rowSpan: value.rowSpan,
                                colSpan: value.colSpan,
                            }
                            : {
                                v: value.content,
                                p,
                                s: style,
                            };
                        valueMatrix.setValue(row, col, newValue);
                        if (value.rowSpan || value.colSpan) {
                            const rowSpan = value.rowSpan || 1;
                            const colSpan = value.colSpan || 1;
                            for (let i = 0; i < rowSpan; i++) {
                                for (let j = 0; j < colSpan; j++) {
                                    if (i === 0 && j === 0) { /* empty */ } else {
                                        valueMatrix.setValue(row + i, col + j, {
                                            s: style,
                                        });
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (!valueMatrix.getValue(row, col)) {
                        const newValue = (value.rowSpan || value.colSpan)
                            ? {
                                v: value.content,
                                s: style,
                                rowSpan: value.rowSpan,
                                colSpan: value.colSpan,
                            }
                            : {
                                v: value.content,
                                s: style,
                            };
                        valueMatrix.setValue(row, col, newValue);
                        if (value.rowSpan || value.colSpan) {
                            const rowSpan = value.rowSpan || 1;
                            const colSpan = value.colSpan || 1;
                            for (let i = 0; i < rowSpan; i++) {
                                for (let j = 0; j < colSpan; j++) {
                                    if (i === 0 && j === 0) { /* empty */ } else {
                                        valueMatrix.setValue(row + i, col + j, {
                                            s: style,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
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
    colCount: number;
    cellMatrix: ObjectMatrix<IParsedCellValue> | null;
} {
    const ROWS_REGEX = /<tr([\s\S]*?)>([\s\S]*?)<\/tr>/gi;
    const rowMatches = html.matchAll(ROWS_REGEX);
    if (!rowMatches) {
        return {
            rowProperties: [],
            rowCount: 0,
            colCount: 0,
            cellMatrix: null,
        };
    }

    const rowMatchesAsArray = Array.from(rowMatches);
    const rowProperties = rowMatchesAsArray.map((rowMatch) => parseProperties(rowMatch[1]));

    const { colCount, cellMatrix } = parseTableCells(rowMatchesAsArray.map((rowMatch) => rowMatch[2]));

    return {
        rowProperties,
        rowCount: rowProperties.length,
        colCount,
        cellMatrix,
    };
}

/**
 *
 * @param tdStrings
 */
function parseTableCells(tdStrings: string[]) {
    const cellMatrix = new ObjectMatrix<IParsedCellValue>();
    const maxRowOfCol = new Map<number, number>();
    const TDS_REGEX = /<td([\s\S]*?)>([\s\S]*?)<\/td>/gi;

    let colCount = 0;
    let colIndex = 0;
    let rowIndex = 0;

    tdStrings.forEach((trStr, r) => {
        const isFirstRow = r === 0;
        const cellMatches = trStr.matchAll(TDS_REGEX);

        colIndex = 0;

        Array.from(cellMatches).forEach((cellMatch) => {
            const cellProperties = parseProperties(cellMatch[1]);
            const content = decodeHTMLEntities(cellMatch[2].replace('<br>', '\r').replace(/<\/?[^>]*>/g, '')); // paste from excel
            const rowSpan = cellProperties.rowspan ? +cellProperties.rowspan : 1;
            const colSpan = cellProperties.colspan ? +cellProperties.colspan : 1;

            if (!isFirstRow) {
                for (let i = colIndex; i < colCount; i++) {
                    const thisPosOccupied = maxRowOfCol.get(i)! >= rowIndex;
                    if (!thisPosOccupied) {
                        colIndex = i;
                        break;
                    }
                }
            }

            const value: IParsedCellValue = {
                content,
                properties: cellProperties,
            };
            if (colSpan > 1) value.colSpan = +colSpan;
            if (rowSpan > 1) value.rowSpan = +rowSpan;

            // when iterating the first row, we should calc colCount as well
            if (isFirstRow) {
                colCount += colSpan;
            }

            // update maxRowOfCol
            for (let i = colIndex; i < colIndex + colSpan; i++) {
                maxRowOfCol.set(i, rowIndex + rowSpan - 1);
            }

            if ((rowSpan > 1 || colSpan > 1) && rowIndex === 0 && colIndex === 0) {
                for (let i = 0; i < colSpan; i++) {
                    if (rowSpan === 1) {
                        cellMatrix.setValue(rowIndex, i, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-top', 'border-bottom']) } });
                    } else {
                        cellMatrix.setValue(rowIndex, i, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-top']) } });
                        cellMatrix.setValue(rowSpan - 1, i, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-bottom']) } });
                    }
                }
                for (let i = 0; i < rowSpan; i++) {
                    if (colSpan === 1) {
                        cellMatrix.setValue(i, colIndex, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-left', 'border-right']) } });
                    } else {
                        cellMatrix.setValue(i, colIndex, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-left']) } });
                        cellMatrix.setValue(i, colSpan - 1, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-right']) } });
                    }
                }

                if (rowSpan === 1) {
                    cellMatrix.setValue(rowIndex, colSpan - 1, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-right', 'border-top', 'border-bottom']) } });
                    if (value?.properties?.style) {
                        value.properties.style = extractBordersAndKeepOthers(value.properties.style, ['border-left', 'border-top', 'border-bottom']);
                    }
                    cellMatrix.setValue(rowIndex, colIndex, value);
                } else if (colSpan === 1) {
                    cellMatrix.setValue(rowSpan - 1, colIndex, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-left', 'border-right', 'border-bottom']) } });
                    if (value?.properties?.style) {
                        value.properties.style = extractBordersAndKeepOthers(value.properties.style, ['border-top', 'border-left', 'border-right']);
                    }
                    cellMatrix.setValue(rowIndex, colIndex, value);
                } else {
                    cellMatrix.setValue(rowIndex, colSpan - 1, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-right', 'border-top']) } });
                    cellMatrix.setValue(rowSpan - 1, colIndex, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-left', 'border-bottom']) } });
                    cellMatrix.setValue(rowSpan - 1, colSpan - 1, { content: '', properties: { style: extractBordersAndKeepOthers(cellProperties.style, ['border-right', 'border-bottom']) } });
                    if (value?.properties?.style) {
                        value.properties.style = extractBordersAndKeepOthers(value.properties.style, ['border-top', 'border-left']);
                    }
                    cellMatrix.setValue(rowIndex, colIndex, value);
                }
            } else {
                cellMatrix.setValue(rowIndex, colIndex, value);
            }
            // set value to matrix
            // point to next colIndex
            colIndex += colSpan;
        });

        rowIndex += 1;
    });

    return {
        colCount,
        cellMatrix,
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
    if (!styleString || !bordersToKeep.length) return '';
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
