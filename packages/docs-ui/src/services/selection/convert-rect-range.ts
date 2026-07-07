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

import type { ITable, Nullable } from '@univerjs/core';
import type { DocumentSkeleton, IDocsTableRenderViewport, IDocumentOffsetConfig, IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, INodePosition, IPoint } from '@univerjs/engine-render';
import { DocumentSkeletonPageType, documentSkeletonTableIterator, getDocsTableRenderViewport, getPageFromPath, getTableIdAndSliceIndex, Liquid } from '@univerjs/engine-render';
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

    const anchorTableIdIndex = anchorPath.indexOf('skeTables') + 1;
    const anchorRowIndex = anchorPath.indexOf('rows') + 1;
    const anchorCellIndex = anchorPath.indexOf('cells') + 1;
    const focusTableIdIndex = focusPath.indexOf('skeTables') + 1;
    const focusRowIndex = focusPath.indexOf('rows') + 1;
    const focusCellIndex = focusPath.indexOf('cells') + 1;

    if (
        anchorTableIdIndex === 0 ||
        anchorRowIndex === 0 ||
        anchorCellIndex === 0 ||
        focusTableIdIndex === 0 ||
        focusRowIndex === 0 ||
        focusCellIndex === 0
    ) {
        return false;
    }

    return anchorPath[anchorTableIdIndex] === focusPath[focusTableIdIndex] &&
        anchorPath[anchorRowIndex] === focusPath[focusRowIndex] &&
        anchorPath[anchorCellIndex] === focusPath[focusCellIndex];
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

function getColumnBoundary(table: IDocumentSkeletonTable, column: number): Nullable<number> {
    const columns = table.tableSource?.tableColumns;
    if (columns && column >= 0 && column <= columns.length) {
        return columns
            .slice(0, column)
            .reduce((total, tableColumn) => total + (tableColumn.size?.width?.v ?? 0), 0);
    }

    const row = table.rows[0];
    const cell = row?.cells[column];
    if (cell) {
        return cell.left;
    }

    const previousCell = row?.cells[column - 1];
    if (previousCell) {
        return previousCell.left + previousCell.pageWidth;
    }

    return null;
}

function getDocumentUnitId(docSkeleton: DocumentSkeleton): string {
    const viewModel = docSkeleton.getViewModel() as {
        getDataModel?: () => {
            getUnitId?: () => string;
        };
    };

    return viewModel.getDataModel?.().getUnitId?.() ?? '';
}

function pushViewportClippedPoints(
    pointGroup: IPoint[][],
    position: { endX: number; endY: number; startX: number; startY: number },
    viewport: Nullable<IDocsTableRenderViewport>,
    tableLeft: number
): void {
    const scrollLeft = hasHorizontalTableViewport(viewport) ? viewport.scrollLeft : 0;
    const viewportWidth = hasHorizontalTableViewport(viewport) ? viewport.viewportWidth : null;
    const visibleLeft = tableLeft - (viewport?.leadingInsetLeft ?? 0);
    const startX = position.startX - scrollLeft;
    const endX = position.endX - scrollLeft;
    const clippedStartX = viewportWidth == null ? startX : Math.max(startX, visibleLeft);
    const clippedEndX = viewportWidth == null ? endX : Math.min(endX, visibleLeft + viewportWidth);

    if (clippedEndX <= clippedStartX) {
        return;
    }

    pointGroup.push(pushToPoints({
        ...position,
        startX: clippedStartX,
        endX: clippedEndX,
    }));
}

function hasHorizontalTableViewport(viewport: Nullable<IDocsTableRenderViewport>): viewport is IDocsTableRenderViewport {
    return viewport != null &&
        (viewport.leadingInsetLeft ?? 0) + viewport.contentWidth + (viewport.trailingInsetRight ?? 0) > viewport.viewportWidth;
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
            intersectsMergedCell,
        } = rectInfo;

        this._liquid.reset();

        const { pageLayoutType, pageMarginLeft, pageMarginTop } = this._documentOffsetConfig;
        const unitId = getDocumentUnitId(docSkeleton);
        const sourceTableId = getTableIdAndSliceIndex(tableId).tableId;
        const nestedTableContexts = documentSkeletonTableIterator(pages, {
            docsLeft: this._documentOffsetConfig.docsLeft ?? 0,
            docsTop: this._documentOffsetConfig.docsTop ?? 0,
            pageMarginTop,
            skeFooters: skeletonData?.skeFooters,
            skeHeaders: skeletonData?.skeHeaders,
            unitId,
        });

        const startRootPage = pageType === DocumentSkeletonPageType.CELL && pages[startPage] == null ? startSegmentPage : startPage;
        const skipPageIndex = pageType === DocumentSkeletonPageType.BODY || pageType === DocumentSkeletonPageType.CELL ? startRootPage : startSegmentPage;

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
                const nestedTableContext = nestedTableContexts.find((context) => (
                    context.pageIndex === p &&
                    (context.source === 'column' || context.source === 'header' || context.source === 'footer') &&
                    context.tableId.startsWith(tableId)
                ));
                if (nestedTableContext) {
                    const nestedTable = nestedTableContext.table;
                    const viewport = getDocsTableRenderViewport(unitId, sourceTableId);
                    const nestedX = nestedTableContext.tableRect.left - nestedTable.left - (this._documentOffsetConfig.docsLeft ?? 0);
                    const nestedY = nestedTableContext.tableRect.top - (this._documentOffsetConfig.docsTop ?? 0);

                    if (intersectsMergedCell) {
                        const rows = nestedTable.rows.filter((row) => row.index >= startRow && row.index <= endRow);
                        const firstRow = rows[0];
                        const lastRow = rows[rows.length - 1];
                        const startX = getColumnBoundary(nestedTable, startColumn);
                        const endX = getColumnBoundary(nestedTable, endColumn + 1);

                        if (firstRow && lastRow && startX != null && endX != null) {
                            pushViewportClippedPoints(pointGroup, {
                                startX: nestedX + nestedTable.left + startX,
                                startY: nestedY + firstRow.top,
                                endX: nestedX + nestedTable.left + endX,
                                endY: nestedY + lastRow.top + lastRow.height,
                            }, viewport, nestedX + nestedTable.left);
                        }

                        this._liquid.restorePagePadding(page);
                        this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                        continue;
                    }

                    for (const row of nestedTable.rows) {
                        if (row.index >= startRow && row.index <= endRow) {
                            const cells = findNonEmptyCellPages(row.cells, startColumn, endColumn);

                            if (cells == null) {
                                continue;
                            }

                            const [rowStartCell, rowEndCell] = cells;

                            const position = {
                                startX: nestedX + rowStartCell.left + nestedTable.left,
                                startY: nestedY + row.top,
                                endX: nestedX + rowEndCell.left + rowEndCell.pageWidth + nestedTable.left,
                                endY: nestedY + row.top + row.height,
                            };

                            pushViewportClippedPoints(pointGroup, position, viewport, nestedX + nestedTable.left);
                        }
                    }

                    this._liquid.restorePagePadding(page);
                    this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                    continue;
                }

                this._liquid.restorePagePadding(page);
                this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                continue;
            }

            this._liquid.translateSave();
            this._liquid.translate(0, table.top);

            const { x, y } = this._liquid;
            const { left: tableLeft } = table;
            const viewport = getDocsTableRenderViewport(unitId, sourceTableId);

            if (intersectsMergedCell) {
                const rows = table.rows.filter((row) => row.index >= startRow && row.index <= endRow);
                const firstRow = rows[0];
                const lastRow = rows[rows.length - 1];
                const startX = getColumnBoundary(table, startColumn);
                const endX = getColumnBoundary(table, endColumn + 1);

                if (firstRow && lastRow && startX != null && endX != null) {
                    pushViewportClippedPoints(pointGroup, {
                        startX: x + tableLeft + startX,
                        startY: y + firstRow.top,
                        endX: x + tableLeft + endX,
                        endY: y + lastRow.top + lastRow.height,
                    }, viewport, x + tableLeft);
                }

                this._liquid.translateRestore();
                this._liquid.restorePagePadding(page);
                this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                continue;
            }

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

                    pushViewportClippedPoints(pointGroup, position, viewport, x + tableLeft);
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

        const { tableId, startRowIndex, startColumnIndex, endRowIndex, endColumnIndex, intersectsMergedCell } = rectInfo;

        if (intersectsMergedCell) {
            return [{
                anchor: anchorNodePosition,
                focus: focusNodePosition,
            }];
        }

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
        if (anchorPath.indexOf('cells') === -1 || focusPath.indexOf('cells') === -1) {
            return;
        }

        const anchorCell = getCellPageFromPositionPath(skeletonData, anchorPosition);
        const focusCell = getCellPageFromPositionPath(skeletonData, focusPosition);

        if (anchorCell == null || focusCell == null) {
            return;
        }

        const anchorRow = anchorCell.parent as IDocumentSkeletonRow;
        const focusRow = focusCell.parent as IDocumentSkeletonRow;
        if (!Array.isArray(anchorRow?.cells) || !Array.isArray(focusRow?.cells)) {
            return;
        }

        const tableId = anchorCell.segmentId;
        const anchorRowIndex = anchorRow.index;
        const anchorColumn = anchorRow.cells.indexOf(anchorCell);

        const focusRowIndex = focusRow.index;
        const focusColumn = focusRow.cells.indexOf(focusCell);

        const sourceTableId = getTableIdAndSliceIndex(tableId).tableId;
        const tableSource = docSkeleton.getViewModel().getSnapshot().tableSource?.[sourceTableId];
        const rawRange = {
            startRowIndex: Math.min(anchorRowIndex, focusRowIndex),
            endRowIndex: Math.max(anchorRowIndex, focusRowIndex),
            startColumnIndex: Math.min(anchorColumn, focusColumn),
            endColumnIndex: Math.max(anchorColumn, focusColumn),
        };
        const intersectsMergedCell = rangeIntersectsMergedCell(tableSource, rawRange);
        const range = expandRangeByMergedCells(tableSource, rawRange);

        return {
            pages,
            tableId,
            intersectsMergedCell,
            ...range,
        };
    }
}

interface ITableRange {
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
}

function expandRangeByMergedCells(table: Nullable<ITable>, range: ITableRange): ITableRange {
    if (!table) {
        return range;
    }

    let expanded = normalizeRange(range);
    let changed = true;

    while (changed) {
        changed = false;

        table.tableRows.forEach((row, rowIndex) => {
            row.tableCells.forEach((cell, columnIndex) => {
                const rowSpan = cell.rowSpan ?? 1;
                const columnSpan = cell.columnSpan ?? 1;
                if (rowSpan <= 0 || columnSpan <= 0 || (rowSpan === 1 && columnSpan === 1)) {
                    return;
                }

                const mergedRange = {
                    startRowIndex: rowIndex,
                    endRowIndex: rowIndex + rowSpan - 1,
                    startColumnIndex: columnIndex,
                    endColumnIndex: columnIndex + columnSpan - 1,
                };

                if (!rangesIntersect(expanded, mergedRange)) {
                    return;
                }

                const next = {
                    startRowIndex: Math.min(expanded.startRowIndex, mergedRange.startRowIndex),
                    endRowIndex: Math.max(expanded.endRowIndex, mergedRange.endRowIndex),
                    startColumnIndex: Math.min(expanded.startColumnIndex, mergedRange.startColumnIndex),
                    endColumnIndex: Math.max(expanded.endColumnIndex, mergedRange.endColumnIndex),
                };

                if (!rangesEqual(expanded, next)) {
                    expanded = next;
                    changed = true;
                }
            });
        });
    }

    return expanded;
}

function rangeIntersectsMergedCell(table: Nullable<ITable>, range: ITableRange): boolean {
    if (!table) {
        return false;
    }

    const normalized = normalizeRange(range);

    return table.tableRows.some((row, rowIndex) => row.tableCells.some((cell, columnIndex) => {
        const rowSpan = cell.rowSpan ?? 1;
        const columnSpan = cell.columnSpan ?? 1;
        if (rowSpan <= 0 || columnSpan <= 0 || (rowSpan === 1 && columnSpan === 1)) {
            return false;
        }

        return rangesIntersect(normalized, {
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + rowSpan - 1,
            startColumnIndex: columnIndex,
            endColumnIndex: columnIndex + columnSpan - 1,
        });
    }));
}

function getCellPageFromPositionPath(
    skeletonData: Parameters<typeof getPageFromPath>[0],
    position: INodePosition
): Nullable<IDocumentSkeletonPage> {
    const { path, segmentPage } = position;
    if (path[0] === 'pages') {
        return getPageFromPath(skeletonData, path);
    }

    const rootPage = skeletonData.pages[segmentPage];
    if (rootPage == null) {
        return null;
    }

    const { headerId, footerId, pageWidth } = rootPage;
    const segmentPages = [
        headerId == null ? null : skeletonData.skeHeaders.get(headerId)?.get(pageWidth),
        footerId == null ? null : skeletonData.skeFooters.get(footerId)?.get(pageWidth),
    ];

    for (const segmentPage of segmentPages) {
        if (segmentPage == null) {
            continue;
        }

        const page = getPageFromPath({
            ...skeletonData,
            pages: [segmentPage],
        }, ['pages', 0, ...path]);

        if (page != null) {
            return page;
        }
    }

    return null;
}

function normalizeRange(range: ITableRange): ITableRange {
    return {
        startRowIndex: Math.min(range.startRowIndex, range.endRowIndex),
        endRowIndex: Math.max(range.startRowIndex, range.endRowIndex),
        startColumnIndex: Math.min(range.startColumnIndex, range.endColumnIndex),
        endColumnIndex: Math.max(range.startColumnIndex, range.endColumnIndex),
    };
}

function rangesIntersect(left: ITableRange, right: ITableRange): boolean {
    return left.startRowIndex <= right.endRowIndex &&
        left.endRowIndex >= right.startRowIndex &&
        left.startColumnIndex <= right.endColumnIndex &&
        left.endColumnIndex >= right.startColumnIndex;
}

function rangesEqual(left: ITableRange, right: ITableRange): boolean {
    return left.startRowIndex === right.startRowIndex &&
        left.endRowIndex === right.endRowIndex &&
        left.startColumnIndex === right.startColumnIndex &&
        left.endColumnIndex === right.endColumnIndex;
}
