import { handleStringToStyle } from '@univerjs/base-ui';
import { ITextStyle, ObjectMatrix } from '@univerjs/core';

import { ICellDataWithSpanInfo, IClipboardPropertyItem, IParsedCellValue, IUniverSheetCopyDataModel } from '../type';

export interface IStyleRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    getStyle(node: HTMLElement): ITextStyle;
}

export interface IPasteExtension {
    name: string;
    checkPasteType(html: string): boolean;
    stylesRules: IStyleRule[];
    // afterProcessRules: IAfterProcessRule[];
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

export class HtmlToUSMService {
    private static extensionList: IPasteExtension[] = [];

    static use(extension: IPasteExtension) {
        if (this.extensionList.includes(extension)) {
            throw new Error(`Univer paste extension ${extension.name} already added`);
        }

        this.extensionList.push(extension);
    }

    private styleCache: Map<ChildNode, ITextStyle> = new Map();

    private styleRules: IStyleRule[] = [];

    // private afterProcessRules: IAfterProcessRule[] = [];

    convert(html: string): IUniverSheetCopyDataModel {
        const valueMatrix = new ObjectMatrix<ICellDataWithSpanInfo>();

        const colProperties = parseColGroup(html);
        const { rowProperties, rowCount, cellMatrix: parsedCellMatrix } = parseTableRows(html);

        parsedCellMatrix &&
            parsedCellMatrix.forValue((row, col, value) => {
                // TODO@Dushusir Temporarily use handleStringToStyle. After all replication and paste function is completed, fix the handleStringToStyle method
                const style = handleStringToStyle(undefined, value.properties?.style);

                valueMatrix.setValue(row, col, {
                    v: value.content,
                    s: style,
                    rowSpan: value.rowSpan,
                    colSpan: value.colSpan,
                });
            });
        return {
            rowProperties,
            colProperties,
            cellMatrix: valueMatrix,
        };
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
            const content = cellMatch[2].replace(/&nbsp;/g, ' '); // paste from excel
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

            // set value to matrix
            cellMatrix.setValue(rowIndex, colIndex, value);

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

    const PROPERTY_REGEX = /([\w-]+)="([^"]*)"/gi;
    const propertyMatches = propertyStr.matchAll(PROPERTY_REGEX);
    const property: IClipboardPropertyItem = {};
    Array.from(propertyMatches).forEach((m) => {
        const [_, key, val] = m;
        property[key] = val;
    });

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
