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

import { type Nullable, Tools } from '@univerjs/core';
import type { IDocumentSkeletonGlyph, IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, INodePosition, IPoint } from '../../../basics';
import { DocumentSkeletonPageType } from '../../../basics';
import type { IDocumentOffsetConfig } from '../document';
import type { DocumentSkeleton } from '../layout/doc-skeleton';
import { Liquid } from '../liquid';
import { getTableIdAndSliceIndex } from '../layout/block/table';
import { getPageFromPath, pushToPoints } from './convert-cursor';

// The anchor and focus need to be in the same table,
// and cannot be in the same cell, start node must be the first glyph in the cell,
// and end node must be the last glyph in the cell.
export function isValidRectRange(anchorNodePosition: INodePosition, focusNodePosition: INodePosition): boolean {
    const { path: anchorPath } = anchorNodePosition;
    const { path: focusPath } = focusNodePosition;

    if (anchorPath.length !== focusPath.length) {
        return false;
    }

    if (anchorPath.indexOf('cells') === -1) {
        return false;
    }

    const tableIdIndex = anchorPath.indexOf('skeTables') + 1;
    const rowIndex = anchorPath.indexOf('rows') + 1;
    const cellIndex = anchorPath.indexOf('cells') + 1;

    const anchorTableId = getTableIdAndSliceIndex(anchorPath[tableIdIndex] as string).tableId;
    const focusTableId = getTableIdAndSliceIndex(focusPath[tableIdIndex] as string).tableId;

    if (anchorTableId !== focusTableId) {
        return false;
    }

    const anchorRowIndex = anchorPath[rowIndex];
    const focusRowIndex = focusPath[rowIndex];
    const anchorCellIndex = anchorPath[cellIndex];
    const focusCellIndex = focusPath[cellIndex];

    if (anchorRowIndex === focusRowIndex && anchorCellIndex === focusCellIndex) {
        return false;
    }

    return true;
}

export function isInSameTableCell(anchorNodePosition: INodePosition, focusNodePosition: INodePosition): boolean {
    const { path: anchorPath } = anchorNodePosition;
    const { path: focusPath } = focusNodePosition;

    if (anchorPath.indexOf('cells') === -1 || focusPath.indexOf('cells') === -1) {
        return false;
    }

    return Tools.diffValue(anchorPath, focusPath);
}

// Return true if a is before b.
export function compareNodePositionInTable(a: INodePosition, b: INodePosition): boolean {
    const { path: aPath } = a;
    const { path: bPath } = b;

    const aRowCount = aPath[aPath.length - 3];
    const bRowCount = bPath[bPath.length - 3];
    const aCellCount = aPath[aPath.length - 1];
    const bCellCount = bPath[bPath.length - 1];

    if (aRowCount < bRowCount) {
        return true;
    }

    if (aRowCount > bRowCount) {
        return false;
    }

    return aCellCount < bCellCount;
}

function firstGlyphInCellPage(cellPage: IDocumentSkeletonPage): Nullable<IDocumentSkeletonGlyph> {
    return cellPage.sections[0].columns[0].lines[0].divides[0].glyphGroup[0];
}

interface IRectRangeNodePositions {
    anchor: INodePosition;
    focus: INodePosition;
}

export class NodePositionConvertToRectRange {
    private _liquid = new Liquid();

    constructor(
        private _documentOffsetConfig: IDocumentOffsetConfig,
        private _docSkeleton: DocumentSkeleton
    ) {
        // super
    }

    getRangePointData(startNodePosition: INodePosition, endNodePosition: INodePosition) {
        const pointGroup: IPoint[][] = [];
        const docSkeleton = this._docSkeleton;
        const skeletonData = docSkeleton.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages } = skeletonData;

        const { segmentPage: startSegmentPage, page: startPage, pageType } = startNodePosition;
        const { segmentPage: endSegmentPage, page: endPage } = endNodePosition;

        const rectInfo = this._getTableRectRangeInfo(startNodePosition, endNodePosition);

        if (rectInfo == null) {
            return;
        }

        const {
            tableId,
            startRowIndex: startRow,
            startColumnIndex: startColumn,
            endRowIndex: endRow,
            endColumnIndex: endColumn,
        } = rectInfo;

        this._liquid.reset();

        const { pageLayoutType, pageMarginLeft, pageMarginTop } = this._documentOffsetConfig;

        const skipPageIndex = pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL ? startPage : startSegmentPage;

        for (let p = 0; p < skipPageIndex; p++) {
            const page = pages[p];
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        const endIndex = pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL ? endPage : endSegmentPage;

        for (let p = skipPageIndex; p <= endIndex; p++) {
            const page = pages[p];
            this._liquid.translatePagePadding(page);
            const { skeTables } = page;

            let table = null;

            for (const [id, tableSke] of skeTables.entries()) {
                if (id.startsWith(tableId)) {
                    table = tableSke;
                }
            }

            if (table == null) {
                this._liquid.restorePagePadding(page);
                this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                continue;
            }

            this._liquid.translateSave();
            this._liquid.translate(0, table.top);

            const { x, y } = this._liquid;

            for (const row of table.rows) {
                if (row.index >= startRow && row.index <= endRow) {
                    const rowStartCell = row.cells[startColumn];
                    const rowEndCell = row.cells[endColumn];

                    const position = {
                        startX: x + rowStartCell.left,
                        startY: y + row.top,
                        endX: x + rowEndCell.left + rowEndCell.pageWidth,
                        endY: y + row.top + row.height,
                    };

                    pointGroup.push(pushToPoints(position));
                }
            }

            this._liquid.translateRestore();
            this._liquid.restorePagePadding(page);
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        return {
            pointGroup,
        };
    }

    getNodePositionGroup(anchorNodePosition: INodePosition, focusNodePosition: INodePosition): Nullable<IRectRangeNodePositions[]> {
        const nodePositionGroup: IRectRangeNodePositions[] = [];
        const compare = compareNodePositionInTable(anchorNodePosition, focusNodePosition);
        const startNodePosition = compare ? anchorNodePosition : focusNodePosition;
        const endNodePosition = compare ? focusNodePosition : anchorNodePosition;

        // Start segmentPage will equal to end segmentPage.
        const { segmentPage } = startNodePosition;
        const rectInfo = this._getTableRectRangeInfo(startNodePosition, endNodePosition);

        if (rectInfo == null) {
            return;
        }

        const { tableId, pages, startRowIndex, startColumnIndex, endRowIndex, endColumnIndex } = rectInfo;

        const tables: IDocumentSkeletonTable[] = [];

        // TODO: @JOCS handle table in header and footer.
        for (const page of pages) {
            const { skeTables } = page;

            for (const [id, table] of skeTables.entries()) {
                if (id.startsWith(tableId)) {
                    tables.push(table);
                }
            }
        }

        if (tables.length === 0) {
            return;
        }

        const totalColumns = tables[0].rows[0].cells.length;

        // Span entires row.
        if (startColumnIndex === 0 && endColumnIndex === totalColumns - 1) {
            nodePositionGroup.push({
                anchor: anchorNodePosition,
                focus: focusNodePosition,
            });

            return nodePositionGroup;
        }

        for (const table of tables) {
            this._collectPositionGroup(table, nodePositionGroup, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, segmentPage, compare);
        }

        return nodePositionGroup;
    }

    private _collectPositionGroup(
        table: IDocumentSkeletonTable,
        nodePositionGroup: IRectRangeNodePositions[],
        startRowIndex: number,
        endRowIndex: number,
        startColumnIndex: number,
        endColumnIndex: number,
        segmentPage: number,
        compare: boolean
    ) {
        // Not span entires row.
        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];

            if (row.index < startRowIndex) {
                continue;
            }

            if (row.index > endRowIndex) {
                break;
            }

            const startCellInRow = row.cells[startColumnIndex];
            const endCellInRow = row.cells[endColumnIndex];

            const startCellGlyph = firstGlyphInCellPage(startCellInRow);
            const endCellGlyph = firstGlyphInCellPage(endCellInRow);

            if (startCellGlyph == null || endCellGlyph == null) {
                continue;
            }

            const startPosition = this._docSkeleton.findPositionByGlyph(startCellGlyph, segmentPage);
            const endPosition = this._docSkeleton.findPositionByGlyph(endCellGlyph, segmentPage);

            if (startPosition == null || endPosition == null) {
                continue;
            }

            const anchor = compare ? startPosition : endPosition;
            const focus = compare ? endPosition : startPosition;

            nodePositionGroup.push({
                anchor: {
                    ...anchor,
                    isBack: true, // true or false is the same.
                },
                focus: {
                    ...focus,
                    isBack: true,
                },
            });
        }
    }

    private _getTableRectRangeInfo(startNodePosition: INodePosition, endNodePosition: INodePosition) {
        const docSkeleton = this._docSkeleton;
        const skeletonData = docSkeleton.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages } = skeletonData;

        const { path: startPath } = startNodePosition;
        const { path: endPath } = endNodePosition;
        const startCell = getPageFromPath(skeletonData, startPath);
        const endCell = getPageFromPath(skeletonData, endPath);

        if (startCell == null || endCell == null) {
            return;
        }

        const tableId = startCell.segmentId;
        const startRow = (startCell.parent as IDocumentSkeletonRow).index;
        const startColumn = (startCell.parent as IDocumentSkeletonRow).cells.indexOf(startCell);

        const endRow = (endCell?.parent as IDocumentSkeletonRow).index;
        const endColumn = (endCell?.parent as IDocumentSkeletonRow).cells.indexOf(endCell);

        return {
            pages,
            tableId,
            startCell,
            endCell,
            startRowIndex: startRow,
            startColumnIndex: startColumn,
            endRowIndex: endRow,
            endColumnIndex: endColumn,
        };
    }
}
