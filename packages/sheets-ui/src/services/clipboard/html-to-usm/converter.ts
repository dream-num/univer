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
import { handleStringToStyle, textTrim } from '@univerjs/ui';

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
        // Rich Text Style Rules,
        'color',
        'background',
        'font-size',
        'text-align',
        'vertical-align',
        'font-weight',
        'font-style',
        'font-family',
        'text-decoration',
        'white-space',
        'word-wrap',
        // Border Style Rules,
        'border-left',
        'border-right',
        'border-top',
        'border-bottom',
        // Custom Style Rules, '--' needs to be used as a prefix.
        '--data-rotate',
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

export class HtmlToUSMService {
    private static pluginList: IPastePlugin[] = [];

    static use(plugin: IPastePlugin) {
        if (this.pluginList.includes(plugin)) {
            throw new Error(`Univer paste plugin ${plugin.name} already added`);
        }

        this.pluginList.push(plugin);
    }

    private _styleMap = new Map<string, CSSStyleDeclaration>();

    private _styleCache: Map<ChildNode, ITextStyle> = new Map();

    private _styleRules: IStyleRule[] = [];

    private _afterProcessRules: IAfterProcessRule[] = [];

    private _dom: HTMLElement | null = null;

    private _getCurrentSkeleton: () => Nullable<ISheetSkeletonManagerParam>;

    constructor(props: IHtmlToUSMServiceProps) {
        this._getCurrentSkeleton = props.getCurrentSkeleton;
    }

    // eslint-disable-next-line max-lines-per-function
    convert(html: string): IUniverSheetCopyDataModel {
        const pastePlugin = HtmlToUSMService.pluginList.find((plugin) => plugin.checkPasteType(html));
        if (pastePlugin) {
            this._styleRules = [...pastePlugin.stylesRules];
            this._afterProcessRules = [...pastePlugin.afterProcessRules];
        }
        const valueMatrix = new ObjectMatrix<ICellDataWithSpanInfo>();
        this._dom = parseToDom(html);
        // Convert stylesheets to map
        const style = this._dom.querySelector('style');
        if (style) {
            document.head.appendChild(style);
            for (const rule of style.sheet!.cssRules) {
                const cssRule = rule as CSSStyleRule;
                const selectorText = cssRule.selectorText;
                const style = cssRule.style;
                this._styleMap.set(selectorText, style);
            }
            style.remove();
        }
        const newDocBody: IDocumentBody = {
            dataStream: '',
            textRuns: [],
        };

        const rowProperties: IClipboardPropertyItem[] = [];
        const colProperties: IClipboardPropertyItem[] = [];
        // pick tables
        const tableStrings = html.match(/<table\b[^>]*>([\s\S]*?)<\/table>/gi);
        const tables: IParsedTablesInfo[] = [];
        this.process(null, this._dom.childNodes!, newDocBody, tables);
        const { paragraphs, dataStream, textRuns } = newDocBody;

        // use paragraph to split rows
        if (paragraphs) {
            const starts = paragraphs.map((p) => p.startIndex + 1);
            starts.unshift(0);
            for (let i = 0; i < starts.length; i++) {
                let cellDataStream;
                if (i === starts.length - 1) {
                    cellDataStream = `${dataStream.substring(starts[i])}\r\n`;
                    if (cellDataStream === '\r\n') {
                        continue;
                    }
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
                const isEmptyMatrix = Object.keys(valueMatrix.getMatrix()).length === 0;
                valueMatrix.setValue(isEmptyMatrix ? 0 : valueMatrix.getLength(), 0, {
                    v: cellDataStream,
                    p,
                });
                rowProperties.push({}); // TODO@yuhongz
            }
        } else {
            if (dataStream) {
                const singleDataStream = `${dataStream}\r\n`;
                const singleDocBody: IDocumentBody = {
                    dataStream: singleDataStream,
                    textRuns,
                    paragraphs: generateParagraphs(singleDataStream),
                };

                const dataStreamLength = dataStream.length;
                const textRunsLength = textRuns?.length ?? 0;
                if (!textRunsLength || (textRunsLength === 1 && textRuns![0].st === 0 && textRuns![0].ed === dataStreamLength)) {
                    valueMatrix.setValue(0, 0, {
                        v: dataStream,
                    });
                } else {
                    const p = this._generateDocumentDataModelSnapshot({
                        body: singleDocBody,
                    });
                    valueMatrix.setValue(0, 0, {
                        v: dataStream,
                        p,
                    });
                }

                rowProperties.push({}); // TODO@yuhongz
            }
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
        this.dispose();
        return {
            rowProperties,
            colProperties,
            cellMatrix: valueMatrix,
        };
    }

    private _getStyleBySelectorText(selectorText: string, cssText: string) {
        const css = this._styleMap.get(selectorText)?.getPropertyValue(cssText);
        if (!css) {
            return '';
        }
        return css;
    }

    // eslint-disable-next-line complexity
    private _getStyle(node: HTMLElement, styleStr: string) {
        const recordStyle: Record<string, string> = turnToStyleObject(styleStr);
        const style = node.style;
        // style represents inline styles with the highest priority, followed by selectorText which corresponds to stylesheet rules, and recordStyle pertains to inherited styles with the lowest priority.
        let newStyleStr = '';
        for (let l = 0; l < sheetStyleRules.length; l++) {
            const key = sheetStyleRules[l];

            // retrieve multiple sources for a node and compile them into a cohesive new style string.
            if (key === 'background') {
                const bgColor = style.getPropertyValue('background-color') || this._getStyleBySelectorText(`.${node.className}`, 'background-color') ||
                    this._getStyleBySelectorText(`.${node.className}`, key) ||
                    this._getStyleBySelectorText(node.nodeName.toLowerCase(), key) || this._getStyleBySelectorText(node.nodeName, 'background-color') || recordStyle['background-color'] || '';
                bgColor && (newStyleStr += `background:${bgColor};`);
                continue;
            }
            if (key === 'text-decoration') {
                const textDecoration = style.getPropertyValue('text-decoration-line') || style.getPropertyValue('text-decoration') || this._getStyleBySelectorText(`.${node.className}`, 'text-decoration-line') ||
                    this._getStyleBySelectorText(`.${node.className}`, key) ||
                    this._getStyleBySelectorText(node.nodeName.toLowerCase(), key) || this._getStyleBySelectorText(node.nodeName, 'text-decoration-line') || recordStyle['text-decoration-line'] || '';
                textDecoration && (newStyleStr += `text-decoration:${textDecoration};`);
                continue;
            }

            const value =
                style.getPropertyValue(key) ||
                this._getStyleBySelectorText(`.${node.className}`, key) ||
                this._getStyleBySelectorText(node.nodeName.toLowerCase(), key) ||
                recordStyle[key] ||
                '';
            value && (newStyleStr += `${key}:${value};`);
        }
        return newStyleStr;
    }

    private _parseTable(html: string) {
        const valueMatrix = new ObjectMatrix<ICellDataWithSpanInfo>();
        const colProperties = parseColGroup(html) ?? [];
        const { rowProperties = [] } = parseTableRows(html);
        const parsedCellMatrix = this._parseTableByHtml(this._dom!, this._getCurrentSkeleton()?.skeleton);
        parsedCellMatrix &&
            parsedCellMatrix.forValue((row, col, value) => {
                let style = handleStringToStyle(undefined, value.style);
                if (value?.richTextParma?.p?.body?.textRuns?.length) {
                    const textLen = value?.richTextParma?.v?.length;
                    for (let i = 0; i < value?.richTextParma?.p?.body?.textRuns?.length; i++) {
                        const textRunItem = value?.richTextParma?.p?.body?.textRuns[i];
                        if (textRunItem.st === 0 && textRunItem.ed === textLen) {
                            style = { ...textRunItem.ts, ...style };
                            value?.richTextParma?.p?.body?.textRuns.splice(i, 1);
                            i--;
                        }
                    }
                    if (value?.richTextParma?.p?.body?.textRuns?.length === 0) {
                        value.content = value?.richTextParma?.v;
                        delete value.richTextParma;
                    }
                }

                const cellValue = value?.richTextParma?.p?.body?.textRuns
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

    private _parseTableByHtml(htmlElement: HTMLElement, skeleton?: SpreadsheetSkeleton) {
        const cellMatrix = new ObjectMatrix<IParsedCellValueByClipboard>();
        const tableEle = htmlElement.querySelector('table');
        if (!tableEle) {
            return cellMatrix;
        }
        // user agent stylesheet can be provided here
        const tableStyle = this._getStyle(tableEle, '');
        const rows = tableEle?.querySelectorAll('tr');

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            const rowStyle = this._getStyle(row, tableStyle);
            const cells = row.querySelectorAll('td, th');
            let colSetValueIndex = 0;
            for (let colIndex = 0; colIndex < cells.length;) {
                const cell = cells[colIndex];
                let cellStyle = '';
                const rowSpan = Number(cell.getAttribute('rowSpan')) || 1;
                const colSpan = Number(cell.getAttribute('colSpan')) || 1;

                cellStyle = this._getStyle(cell as HTMLElement, rowStyle);

                // If the cell above has a border-bottom and its value is not 'none',
                // remove the border-top of the current cell.
                // If the cell to the left has a border-right and its value is not 'none',
                // remove the border-left of the current cell.
                // Check and remove borders based on adjacent merged cells
                if (rowIndex > 0) {
                    const cellValueAbove = cellMatrix.getValue(rowIndex - 1, colSetValueIndex);
                    if (cellValueAbove?.style?.includes('border-bottom') && cellStyle.includes('border-top')) {
                        const borderBottom = extractStyleProperty(cellValueAbove.style!, 'border-bottom');
                        if (borderBottom && textTrim(borderBottom.substr(borderBottom.indexOf(':') + 1)) !== 'none') {
                            cellStyle = cellStyle.replace(/border-top:[^;]+;/, '');
                        }
                    }
                }

                if (colIndex > 0) {
                    const cellValueLeft = cellMatrix.getValue(rowIndex, colSetValueIndex - 1);
                    if (cellValueLeft?.style?.includes('border-right') && cellStyle.includes('border-left')) {
                        const borderRight = extractStyleProperty(cellValueLeft.style!, 'border-right');
                        if (borderRight && textTrim(borderRight.substr(borderRight.indexOf(':') + 1)) !== 'none') {
                            cellStyle = cellStyle.replace(/border-left:[^;]+;/, '');
                        }
                    }
                }

                // Determine whether it is rich text based on whether there are html tags
                const { cellText, cellRichStyle } = this._getCellTextAndRichText(cell, cellStyle, skeleton);

                const cellValue = {
                    rowSpan,
                    colSpan,
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
                        setMergedCellStyle(cellMatrix, cellStyle, cellValue, { colSpan, rowSpan, rowIndex, colIndex, colSetValueIndex });
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

    private _parseCellHtml(parent: Nullable<ChildNode>, nodes: NodeListOf<ChildNode>, doc: IDocumentBody, styleCache: Map<ChildNode, ITextStyle> = new Map(), styleStr: string) {
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
                const currentNodeStyle = this._getStyle(node as HTMLElement, styleStr);
                const parentStyles = parent ? styleCache.get(parent) : {};
                const predefinedStyles = turnToStyleObject(currentNodeStyle);
                const nodeStyles = extractNodeStyle(node as HTMLElement, predefinedStyles);

                styleCache.set(node, { ...parentStyles, ...nodeStyles });
                const { childNodes } = node;
                this._parseCellHtml(node, childNodes, doc, styleCache, currentNodeStyle);
            }
        }
    }

    private _getCellTextAndRichText(cell: Element, styleStr: string, skeleton?: SpreadsheetSkeleton) {
        let cellText = '';
        let cellRichStyle;
        const isRichText = /<[^>]+>/.test(cell.innerHTML);
        if (isRichText && skeleton) {
            const newDocBody: IDocumentBody = {
                dataStream: '',
                textRuns: [],
            };
            // Rich text parsing method, refer to the doc
            this._parseCellHtml(null, cell.childNodes, newDocBody, undefined, styleStr);
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
            cellText = decodeHTMLEntities(cell.innerHTML.replace(/[\r\n]/g, ''));
        }
        return {
            cellText,
            cellRichStyle,
        };
    }

    private _generateDocumentDataModelSnapshot(snapshot: Partial<IDocumentData>) {
        const currentSkeleton = this._getCurrentSkeleton();
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

                if (parent && this._styleCache.has(parent)) {
                    style = this._styleCache.get(parent);
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
                const parentStyles = parent ? this._styleCache.get(parent) : {};
                const styleRule = this._styleRules.find(({ filter }) => matchFilter(node as HTMLElement, filter));
                const nodeStyles = styleRule
                    ? styleRule.getStyle(node as HTMLElement)
                    : extractNodeStyle(node as HTMLElement);

                this._styleCache.set(node, { ...parentStyles, ...nodeStyles });

                const { childNodes } = node;

                this.process(node, childNodes, doc, tables);

                const afterProcessRule = this._afterProcessRules.find(({ filter }) =>
                    matchFilter(node as HTMLElement, filter)
                );

                if (afterProcessRule) {
                    afterProcessRule.handler(doc, node as HTMLElement);
                }
            }
        }
    }

    dispose() {
        this._dom = null;
        this._styleCache.clear();
        this._styleMap.clear();
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

function turnToStyleObject(styleStr: string) {
    const styleObj: Record<string, string> = {};
    const styleArr = styleStr.split(';');
    styleArr.forEach((style) => {
        const [key, value] = style.split(':');
        styleObj[key] = value;
    });
    return styleObj;
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

    const COL_TAG_REGEX = /<col([\s\S]*?)>/g;
    let colMatches;
    if (colgroupMatch?.[2]) {
        colMatches = colgroupMatch[2].matchAll(COL_TAG_REGEX);
    } else {
        colMatches = raw.matchAll(COL_TAG_REGEX);
    }

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

function extractStyleProperty(styleString?: string, propertyName?: string) {
    if (!styleString || !propertyName) return null;
    const regex = new RegExp(`(${propertyName}\\s*:\\s*[^;]+);`, 'i');
    const match = styleString.match(regex);
    if (match) {
        return match[1];
    }
    return null;
}

function setMergedCellStyle(
    cellMatrix: ObjectMatrix<IParsedCellValueByClipboard>,
    cellStyle: string,
    cellValue: {
        content: string;
        style: string;
        richTextParma: {
            p?: IDocumentData;
            v: string;
        };
        rowSpan?: number;
        colSpan?: number;
    },
    indexParams: {
        colSpan: number;
        rowSpan: number;
        rowIndex: number;
        colIndex: number;
        colSetValueIndex: number;
    }) {
    const { rowSpan, colSpan, rowIndex, colSetValueIndex } = indexParams;

    for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
        for (let j = colSetValueIndex; j < colSetValueIndex + colSpan; j++) {
            // Set the value of the top-left cell with cellValue and style
            if (i === rowIndex && j === colSetValueIndex) {
                cellMatrix.setValue(i, j, { ...cellValue, style: cellStyle });
            } else {
                // Set the style for all other cells
                cellMatrix.setValue(i, j, { style: cellStyle });
            }
        }
    }
}
