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

import type { DocumentSkeleton, IDocumentOffsetConfig, IDocumentSkeletonPage, IDocumentSkeletonRow, INodePosition, IPoint } from '@univerjs/engine-render';
import { type Nullable, Tools } from '@univerjs/core';
import { DocumentSkeletonPageType, getPageFromPath, getTableIdAndSliceIndex, Liquid } from '@univerjs/engine-render';
import { compareNodePositionLogic, pushToPoints } from './convert-text-range';

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

    const { tableId: anchorTableId, sliceIndex: anchorSliceIndex } = getTableIdAndSliceIndex(anchorPath[tableIdIndex] as string);
    const { tableId: focusTableId, sliceIndex: focusSliceIndex } = getTableIdAndSliceIndex(focusPath[tableIdIndex] as string);

    if (anchorTableId !== focusTableId) {
        return false;
    }

    const anchorRowIndex = anchorPath[rowIndex];
    const focusRowIndex = focusPath[rowIndex];
    const anchorCellIndex = anchorPath[cellIndex];
    const focusCellIndex = focusPath[cellIndex];

    if (anchorRowIndex === focusRowIndex && anchorCellIndex === focusCellIndex && anchorSliceIndex === focusSliceIndex) {
        return false;
    }

    return true;
}

// Determine whether the selection is in a table cell skeleton.
export function isInSameTableCell(anchorNodePosition: INodePosition, focusNodePosition: INodePosition): boolean {
    const { path: anchorPath } = anchorNodePosition;
    const { path: focusPath } = focusNodePosition;

    if (anchorPath.indexOf('cells') === -1 || focusPath.indexOf('cells') === -1) {
        return false;
    }

    if (anchorPath.length !== focusPath.length) {
        return false;
    }

    return Tools.diffValue(anchorPath, focusPath);
}

// Determine whether the selection is in the same table cell support across pages.
export function isInSameTableCellData(skeleton: DocumentSkeleton, anchorNodePosition: INodePosition, focusNodePosition: INodePosition): boolean {
    const { path: anchorPath } = anchorNodePosition;
    const { path: focusPath } = focusNodePosition;

    if (anchorPath.indexOf('cells') === -1 || focusPath.indexOf('cells') === -1) {
        return false;
    }

    const anchorGlyph = skeleton.findGlyphByPosition(anchorNodePosition);
    const focusGlyph = skeleton.findGlyphByPosition(focusNodePosition);

    const anchorCellPage = anchorGlyph?.parent?.parent?.parent?.parent?.parent;
    const focusCellPage = focusGlyph?.parent?.parent?.parent?.parent?.parent;

    if (anchorCellPage == null || focusCellPage == null) {
        return false;
    }

    const anchorRow = anchorCellPage.parent as IDocumentSkeletonRow;
    const focusRow = focusCellPage.parent as IDocumentSkeletonRow;

    const anchorColIndex = anchorRow.cells.indexOf(anchorCellPage);
    const focusColIndex = focusRow.cells.indexOf(focusCellPage);

    return anchorColIndex === focusColIndex && anchorRow.index === focusRow.index;
}

// Return true if a is before b.
export function compareNodePositionInTable(a: INodePosition, b: INodePosition): boolean {
    if (isInSameTableCell(a, b)) {
        return compareNodePositionLogic(a, b);
    }

    const { path: aPath } = a;
    const { path: bPath } = b;

    const aTableId = aPath[aPath.length - 5];
    const bTableId = bPath[bPath.length - 5];

    if (aTableId !== bTableId && typeof aTableId === 'string' && typeof bTableId === 'string') {
        const aSlideId = aTableId.split('#-#')[1];
        const bSlideId = bTableId.split('#-#')[1];

        return +aSlideId < +bSlideId;
    }

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

    return aCellCount <= bCellCount;
}

function isEmptyCellPage(cell: IDocumentSkeletonPage) {
    return cell.sections[0].columns[0].lines.length === 0;
}

function findNonEmptyCellPages(
    cells: IDocumentSkeletonPage[],
    startCol: number,
    endCol: number
): Nullable<IDocumentSkeletonPage[]> {
    let s = startCol;
    let e = endCol;
    let startCell = cells[s];
    let endCell = cells[e];

    while (s < e && (isEmptyCellPage(startCell) || isEmptyCellPage(endCell))) {
        if (isEmptyCellPage(startCell)) {
            s++;
            startCell = cells[s];
        } else if (isEmptyCellPage(endCell)) {
            e--;
            endCell = cells[e];
        }
    }

    if (!isEmptyCellPage(startCell) && !isEmptyCellPage(endCell)) {
        return [startCell, endCell];
    }
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

    // eslint-disable-next-line max-lines-per-function
    getRangePointData(startNodePosition: INodePosition, endNodePosition: INodePosition) {
        const pointGroup: IPoint[][] = [];
        const docSkeleton = this._docSkeleton;
        const skeletonData = docSkeleton.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages } = skeletonData;

        const { segmentPage: startSegmentPage, page: startPage, pageType } = startNodePosition;
        // const { segmentPage: endSegmentPage, page: endPage } = endNodePosition;

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

        // const endIndex = pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL ? endPage : endSegmentPage;

        for (let p = skipPageIndex; p < pages.length; p++) {
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
            const { left: tableLeft } = table;

            for (const row of table.rows) {
                if (row.index >= startRow && row.index <= endRow) {
                    const cells = findNonEmptyCellPages(row.cells, startColumn, endColumn);

                    if (cells == null) {
                        continue;
                    }

                    const [rowStartCell, rowEndCell] = cells;

                    const position = {
                        startX: x + rowStartCell.left + tableLeft,
                        startY: y + row.top,
                        endX: x + rowEndCell.left + rowEndCell.pageWidth + tableLeft,
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
            startRow,
            startColumn,
            endRow,
            endColumn,
            tableId,
        };
    }

    getNodePositionGroup(
        anchorNodePosition: INodePosition,
        focusNodePosition: INodePosition
    ): Nullable<IRectRangeNodePositions[]> {
        const nodePositionGroup: IRectRangeNodePositions[] = [];
        const anchorIndex = this._docSkeleton.findCharIndexByPosition(anchorNodePosition);
        const focusIndex = this._docSkeleton.findCharIndexByPosition(focusNodePosition);

        if (anchorIndex == null || focusIndex == null) {
            return;
        }

        const compare = anchorIndex < focusIndex;

        // Start segmentPage will equal to end segmentPage.
        const rectInfo = this._getTableRectRangeInfo(anchorNodePosition, focusNodePosition);

        if (rectInfo == null) {
            return;
        }

        const { tableId, startRowIndex, startColumnIndex, endRowIndex, endColumnIndex } = rectInfo;

        const tableNode = this._docSkeleton.getViewModel().findTableNodeById(tableId);

        if (tableNode == null) {
            return;
        }

        const totalColumns = tableNode.children[0].children.length;

        // Span entires row.
        const spanEntireRow = startColumnIndex === 0 && endColumnIndex === totalColumns - 1;

        if (spanEntireRow) {
            const startCellNode = tableNode.children[startRowIndex].children[startColumnIndex];
            const startNodePosition = this._docSkeleton.findNodePositionByCharIndex(startCellNode.startIndex + 1);
            const endCellNode = tableNode.children[endRowIndex].children[endColumnIndex];
            const endNodePosition = this._docSkeleton.findNodePositionByCharIndex(endCellNode.endIndex - 2);

            if (startNodePosition == null || endNodePosition == null) {
                return;
            }

            nodePositionGroup.push({
                anchor: compare ? startNodePosition : endNodePosition,
                focus: compare ? endNodePosition : startNodePosition,
            });
        } else {
            for (let i = startRowIndex; i <= endRowIndex; i++) {
                const rowNode = tableNode.children[i];
                const startCellNode = rowNode.children[startColumnIndex];
                const endCellNode = rowNode.children[endColumnIndex];

                const startNodePosition = this._docSkeleton.findNodePositionByCharIndex(startCellNode.startIndex + 1);
                const endNodePosition = this._docSkeleton.findNodePositionByCharIndex(endCellNode.endIndex - 2);

                if (startNodePosition == null || endNodePosition == null) {
                    return;
                }

                nodePositionGroup.push({
                    anchor: compare ? startNodePosition : endNodePosition,
                    focus: compare ? endNodePosition : startNodePosition,
                });
            }
        }

        return nodePositionGroup;
    }

    private _getTableRectRangeInfo(anchorPosition: INodePosition, focusPosition: INodePosition) {
        const docSkeleton = this._docSkeleton;
        const skeletonData = docSkeleton.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages } = skeletonData;

        const { path: anchorPath } = anchorPosition;
        const { path: focusPath } = focusPosition;
        const anchorCell = getPageFromPath(skeletonData, anchorPath);
        const focusCell = getPageFromPath(skeletonData, focusPath);

        if (anchorCell == null || focusCell == null) {
            return;
        }

        const tableId = anchorCell.segmentId;
        const anchorRow = (anchorCell.parent as IDocumentSkeletonRow).index;
        const anchorColumn = (anchorCell.parent as IDocumentSkeletonRow).cells.indexOf(anchorCell);

        const focusRow = (focusCell?.parent as IDocumentSkeletonRow).index;
        const focusColumn = (focusCell?.parent as IDocumentSkeletonRow).cells.indexOf(focusCell);

        const startRowIndex = Math.min(anchorRow, focusRow);
        const endRowIndex = Math.max(anchorRow, focusRow);

        const startColumnIndex = Math.min(anchorColumn, focusColumn);
        const endColumnIndex = Math.max(anchorColumn, focusColumn);

        return {
            pages,
            tableId,
            startRowIndex,
            startColumnIndex,
            endRowIndex,
            endColumnIndex,
        };
    }
}
