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

import type { INumberUnit, ITable, ITableCell, ITableRow, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonTable,
    IParagraphList,
    ISectionBreakConfig,
} from '../../../../basics';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import { BooleanNumber, TableAlignmentType, TableRowHeightRule, VerticalAlignmentType } from '@univerjs/core';
import { getDocumentCompatibilityPolicy } from '../../document-compatibility';
import { createNullCellPage, createSkeletonCellPages } from '../model/page';

export function createTableSkeleton(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): Nullable<IDocumentSkeletonTable> {
    const { startIndex, endIndex, children: rowNodes } = tableNode;
    const table = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (table == null) {
        console.warn('Table not found when creating table skeleton');
        return null;
    }

    const tableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
    let rowTop = 0;
    let tableWidth = 0;

    for (const rowNode of rowNodes) {
        const { children: cellNodes, startIndex, endIndex } = rowNode;
        const row = rowNodes.indexOf(rowNode);
        const rowSource = table.tableRows[row];
        const { trHeight } = rowSource;
        const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource, false, tableSkeleton);
        const { hRule, val } = trHeight;

        tableSkeleton.rows.push(rowSkeleton);
        let left = 0;
        let rowHeight = 0;

        for (const cellNode of cellNodes) {
            const col = cellNodes.indexOf(cellNode);
            const cellConfig = rowSource.tableCells[col];

            if (isCoveredTableCell(cellConfig)) {
                const cellPageSkeleton = createMergedCoveredCellPage(ctx, sectionBreakConfig, table, row, col, rowSkeleton);
                cellPageSkeleton.left = left;
                if (shouldAdvanceTableCellLeft(table, row, col)) {
                    left += cellPageSkeleton.pageWidth;
                }
                rowSkeleton.cells.push(cellPageSkeleton);
                continue;
            }

            const cellPageSkeleton = createSkeletonCellPages(
                ctx,
                viewModel,
                cellNode,
                sectionBreakConfig,
                table,
                row,
                col
            )[0];

            const { marginTop = 0, marginBottom = 0 } = cellPageSkeleton;
            const pageHeight = cellPageSkeleton.height + marginTop + marginBottom;
            cellPageSkeleton.left = left;
            left += cellPageSkeleton.pageWidth;
            cellPageSkeleton.parent = rowSkeleton;
            rowSkeleton.cells.push(cellPageSkeleton);
            rowHeight = Math.max(rowHeight, pageHeight);
        }

        if (hRule === TableRowHeightRule.AT_LEAST) {
            rowHeight = Math.max(rowHeight, val.v);
        } else if (hRule === TableRowHeightRule.EXACT) {
            rowHeight = Math.max(rowHeight, val.v);
        }

        // Set row height to cell page height.
        for (const cellPageSkeleton of rowSkeleton.cells) {
            cellPageSkeleton.pageHeight = rowHeight;
        }

        // Handle vertical alignment in cell.
        const rowConfig = table.tableRows[row];
        for (let i = 0; i < rowConfig.tableCells.length; i++) {
            const cellConfig = rowConfig.tableCells[i];
            const cellPageSkeleton = rowSkeleton.cells[i];
            const { vAlign = VerticalAlignmentType.CONTENT_ALIGNMENT_UNSPECIFIED } = cellConfig;
            const { pageHeight, height, originMarginTop, originMarginBottom } = cellPageSkeleton;

            let marginTop = originMarginTop;

            switch (vAlign) {
                case VerticalAlignmentType.TOP: {
                    marginTop = originMarginTop;
                    break;
                }
                case VerticalAlignmentType.CENTER: {
                    marginTop = (pageHeight - height) / 2;
                    break;
                }
                case VerticalAlignmentType.BOTTOM: {
                    marginTop = pageHeight - height - originMarginBottom;
                    break;
                }
                default:
                    break;
            }

            marginTop = Math.max(originMarginTop, marginTop);

            cellPageSkeleton.marginTop = marginTop;
        }

        rowSkeleton.height = rowHeight;
        rowSkeleton.top = rowTop;
        rowTop += rowHeight;

        tableWidth = Math.max(tableWidth, left);
    }

    tableSkeleton.width = tableWidth;
    tableSkeleton.height = rowTop;
    applyMergedCellSpanHeights(tableSkeleton);

    const { pageWidth, marginLeft = 0, marginRight = 0 } = curPage;

    tableSkeleton.left = _getTableLeft(pageWidth - marginLeft - marginRight, tableWidth, table.align, table.indent);

    return tableSkeleton;
}

export function rollbackListCache(listLevel: Map<string, IParagraphList[][]>, table: DataStreamTreeNode) {
    const { startIndex, endIndex } = table;

    for (const paragraphLists of listLevel.values()) {
        for (const paragraphList of paragraphLists) {
            if (paragraphList == null) {
                continue;
            }

            const paragraphListIndex = paragraphList.findIndex((p) => p.paragraph.startIndex > startIndex && p.paragraph.startIndex < endIndex);

            if (paragraphListIndex > -1) {
                paragraphList.splice(paragraphListIndex);
            }
        }
    }
}

export interface ISlicedTableSkeletonParams {
    skeTables: IDocumentSkeletonTable[];
    fromCurrentPage: boolean;
}

interface ICreateTableCache {
    rowTop: number;
    tableWidth: number;
    remainHeight: number;
    repeatRows: DataStreamTreeNode[];
    repeatRowsHeight: number;
}

// Create skeletons of a table, which may be divided into different pages according to the available height of the page.
export function createTableSkeletons(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    availableHeight: number
): ISlicedTableSkeletonParams {
    const skeTables: IDocumentSkeletonTable[] = [];
    const { startIndex, endIndex, children: rowNodes } = tableNode;

    const table = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (table == null) {
        console.warn('Table not found when creating table skeletons');
        return {
            skeTables,
            fromCurrentPage: false,
        };
    }

    const repeatRows = getLeadingRepeatHeaderRows(table, rowNodes);
    const curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);

    const createCache: ICreateTableCache = {
        rowTop: 0,
        tableWidth: 0,
        remainHeight: availableHeight,
        repeatRows,
        repeatRowsHeight: 0,
    };

    skeTables.push(curTableSkeleton);

    for (const rowNode of rowNodes) {
        const row = rowNodes.indexOf(rowNode);

        dealWithTableRow(
            ctx,
            curPage,
            skeTables,
            viewModel,
            sectionBreakConfig,
            rowNode,
            row,
            table,
            createCache
        );
    }

    updateTableSkeletonsPosition(createCache, curPage, skeTables, table);

    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const fromCurrentPage =
        skeTables[0].height <= availableHeight + documentCompatibilityPolicy.table.currentPageOverflowTolerance;

    return {
        skeTables,
        fromCurrentPage,
    };
}

function updateTableSkeletonsPosition(
    cache: ICreateTableCache,
    curPage: IDocumentSkeletonPage,
    skeTables: IDocumentSkeletonTable[],
    table: ITable
) {
    const { pageWidth, marginLeft = 0, marginRight = 0 } = curPage;
    const { tableWidth } = cache;
    const tableLeft = _getTableLeft(pageWidth - marginLeft - marginRight, tableWidth, table.align, table.indent);

    let tableIndex = 0;
    for (const tableSkeleton of skeTables) {
        applyMergedCellSpanHeights(tableSkeleton);

        // Update table width and left.
        tableSkeleton.width = tableWidth;
        tableSkeleton.left = tableLeft;

        // Reset table st and ed.
        tableSkeleton.st = tableSkeleton.rows[0].st - 1;
        tableSkeleton.ed = tableSkeleton.rows[tableSkeleton.rows.length - 1].ed + 1;

        // Reset table id.
        if (skeTables.length > 1) {
            tableSkeleton.tableId = getTableSliceId(table.tableId, tableIndex);
            tableIndex++;
        }
    }
}

function getCurTableSkeleton(skeTables: IDocumentSkeletonTable[]): IDocumentSkeletonTable {
    return skeTables[skeTables.length - 1];
}

function getAvailableHeight(curPage: IDocumentSkeletonPage, cache: ICreateTableCache, hasRepeatHeader: boolean) {
    const { marginTop, marginBottom, pageHeight } = curPage;
    let pageContentHeight = pageHeight - marginTop - marginBottom;

    if (hasRepeatHeader) {
        pageContentHeight -= cache.repeatRowsHeight;
    }

    return pageContentHeight;
}

function dealWithTableRow(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    skeTables: IDocumentSkeletonTable[],
    viewModel: DocumentViewModel,
    sectionBreakConfig: ISectionBreakConfig,
    rowNode: DataStreamTreeNode,
    row: number,
    table: ITable,
    cache: ICreateTableCache,
    isRepeatRow = false
) {
    const pageContentHeight = getAvailableHeight(curPage, cache, false);
    const availableHeight = getAvailableHeight(curPage, cache, true);
    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const { children: cellNodes, startIndex, endIndex } = rowNode;
    const rowSource = table.tableRows[row];
    const { trHeight, cantSplit } = rowSource;
    const rowSkeletons: IDocumentSkeletonRow[] = [];
    const { hRule, val } = trHeight;
    const canRowSplit = cantSplit !== BooleanNumber.TRUE && trHeight.hRule === TableRowHeightRule.AUTO;
    // If the remain height is less than 50 pixels, you can't fit the next line, so you can start typography directly from the second page.
    const MAX_FONT_SIZE = 72;
    const needOpenNewTable = cache.remainHeight <= MAX_FONT_SIZE;
    let curTableSkeleton = getCurTableSkeleton(skeTables);

    const rowHeights = [0];

    for (const cellNode of cellNodes) {
        const col = cellNodes.indexOf(cellNode);
        const cellConfig = rowSource.tableCells[col];
        if (isCoveredTableCell(cellConfig)) {
            if (rowSkeletons.length === 0) {
                rowSkeletons.push(createNullRowSkeletonWithCells(
                    ctx,
                    sectionBreakConfig,
                    table,
                    row,
                    startIndex,
                    endIndex,
                    rowSource,
                    isRepeatRow
                ));
            }
            continue;
        }

        const cellPageSkeletons = createSkeletonCellPages(
            ctx,
            viewModel,
            cellNode,
            sectionBreakConfig,
            table,
            row,
            col,
            canRowSplit && !needOpenNewTable ? cache.remainHeight : availableHeight,
            pageContentHeight
        );
        while (rowSkeletons.length < cellPageSkeletons.length) {
            rowSkeletons.push(createNullRowSkeletonWithCells(
                ctx,
                sectionBreakConfig,
                table,
                row,
                startIndex,
                endIndex,
                rowSource,
                isRepeatRow
            ));
        }

        while (rowHeights.length < cellPageSkeletons.length) {
            rowHeights.push(0);
        }

        for (const cellPageSkeleton of cellPageSkeletons) {
            const { marginTop: cellMarginTop = 0, marginBottom: cellMarginBottom = 0 } = cellPageSkeleton;
            const cellPageHeight = cellPageSkeleton.height + cellMarginTop + cellMarginBottom;
            const pageIndex = cellPageSkeletons.indexOf(cellPageSkeleton);
            const rowSke = rowSkeletons[pageIndex];

            cellPageSkeleton.parent = rowSke;
            rowSke.cells[col] = cellPageSkeleton;
            rowHeights[pageIndex] = Math.max(rowHeights[pageIndex], cellPageHeight);
        }
    }

    for (const rowSke of rowSkeletons) {
        // Update row height.
        const rowIndex = rowSkeletons.indexOf(rowSke);

        if (hRule === TableRowHeightRule.AT_LEAST) {
            rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], val.v);
        } else if (hRule === TableRowHeightRule.EXACT) {
            rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], val.v);
        }

        rowHeights[rowIndex] = Math.min(rowHeights[rowIndex], pageContentHeight);

        let left = 0;
        // Set row height to cell page height.
        for (let col = 0; col < rowSke.cells.length; col++) {
            const cellPageSkeleton = rowSke.cells[col];
            if (cellPageSkeleton == null) {
                continue;
            }

            cellPageSkeleton.left = left;
            cellPageSkeleton.pageHeight = rowHeights[rowIndex];

            if (shouldAdvanceTableCellLeft(table, rowSke.index, col)) {
                left += cellPageSkeleton.pageWidth;
            }

            cache.tableWidth = Math.max(cache.tableWidth, left);
        }

        // Set row Skeleton height.
        rowSke.height = rowHeights[rowIndex];
    }

    if (!isRepeatRow && row < cache.repeatRows.length) {
        cache.repeatRowsHeight += rowHeights.reduce((total, height) => total + height, 0);
    }

    // Handle vertical alignment in cell.
    for (const rowSkeleton of rowSkeletons) {
        _verticalAlignInCell(rowSkeleton, rowSource);
    }

    while (rowSkeletons.length > 0) {
        const rowSkeleton = rowSkeletons.shift()!;
        const lastRow = curTableSkeleton.rows[curTableSkeleton.rows.length - 1];
        const rowOverflowHeight = rowSkeleton.height - cache.remainHeight;
        const shouldOpenNewTable =
            cache.remainHeight < MAX_FONT_SIZE ||
            rowOverflowHeight > documentCompatibilityPolicy.table.rowOverflowTolerance;

        if (shouldOpenNewTable) {
            cache.remainHeight = getAvailableHeight(curPage, cache, row !== 0 && rowSkeleton.index !== lastRow.index);
            cache.rowTop = 0;

            if (curTableSkeleton.rows.length > 0) {
                curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
                skeTables.push(curTableSkeleton);

                // Repeat all leading header rows. If the current row crosses pages,
                // there is no need to repeat the header rows on the second slice.
                if (cache.repeatRows.length > 0 && isRepeatRow === false && row >= cache.repeatRows.length && rowSkeleton.index !== lastRow.index) {
                    cache.remainHeight = getAvailableHeight(curPage, cache, false);
                    cache.repeatRows.forEach((repeatRow, repeatRowIndex) => {
                        dealWithTableRow(
                            ctx,
                            curPage,
                            skeTables,
                            viewModel,
                            sectionBreakConfig,
                            repeatRow,
                            repeatRowIndex,
                            table,
                            cache,
                            true
                        );
                    });
                }
            }
        }

        curTableSkeleton = getCurTableSkeleton(skeTables);

        rowSkeleton.top = cache.rowTop;
        curTableSkeleton.height += rowSkeleton.height;

        curTableSkeleton.rows.push(rowSkeleton);
        rowSkeleton.parent = curTableSkeleton;
        cache.remainHeight -= rowSkeleton.height;

        cache.rowTop += rowSkeleton.height;
    }
}

function getLeadingRepeatHeaderRows(table: ITable, rowNodes: DataStreamTreeNode[]): DataStreamTreeNode[] {
    const repeatRows: DataStreamTreeNode[] = [];

    for (let index = 0; index < rowNodes.length; index++) {
        if (table.tableRows[index]?.repeatHeaderRow !== BooleanNumber.TRUE) {
            break;
        }

        repeatRows.push(rowNodes[index]);
    }

    return repeatRows;
}

function _verticalAlignInCell(
    rowSkeleton: IDocumentSkeletonRow,
    rowSource: ITableRow
) {
    for (let i = 0; i < rowSource.tableCells.length; i++) {
        const cellConfig = rowSource.tableCells[i];

        const cellPageSkeleton = rowSkeleton.cells[i];

        if (cellPageSkeleton == null) {
            continue;
        }

        const { vAlign = VerticalAlignmentType.CONTENT_ALIGNMENT_UNSPECIFIED } = cellConfig;
        const { pageHeight, height, originMarginTop, originMarginBottom } = cellPageSkeleton;

        let marginTop = originMarginTop;

        switch (vAlign) {
            case VerticalAlignmentType.TOP: {
                marginTop = originMarginTop;
                break;
            }
            case VerticalAlignmentType.CENTER: {
                marginTop = (pageHeight - height) / 2;
                break;
            }
            case VerticalAlignmentType.BOTTOM: {
                marginTop = pageHeight - height - originMarginBottom;
                break;
            }
            default:
                break;
        }

        marginTop = Math.max(originMarginTop, marginTop);

        cellPageSkeleton.marginTop = marginTop;
    }
}

function createNullRowSkeletonWithCells(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    table: ITable,
    row: number,
    startIndex: number,
    endIndex: number,
    rowSource: ITableRow,
    isRepeatRow = false
): IDocumentSkeletonRow {
    const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource, isRepeatRow);
    const colCount = rowSource.tableCells.length;

    rowSkeleton.cells = Array.from({ length: colCount }, (_, col) =>
        createMergedAwareNullCellPage(ctx, sectionBreakConfig, table, row, col, rowSkeleton));

    return rowSkeleton;
}

function createMergedCoveredCellPage(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    table: ITable,
    row: number,
    col: number,
    rowSkeleton: IDocumentSkeletonRow
): IDocumentSkeletonPage {
    return createMergedAwareNullCellPage(ctx, sectionBreakConfig, table, row, col, rowSkeleton);
}

function applyMergedCellSpanHeights(tableSkeleton: IDocumentSkeletonTable): void {
    const tableRows = tableSkeleton.tableSource?.tableRows ?? [];
    if (tableRows.length === 0) {
        return;
    }

    const skeletonRowsByIndex = new Map(tableSkeleton.rows.map((row) => [row.index, row]));

    tableRows.forEach((rowSource, rowIndex) => {
        rowSource.tableCells.forEach((cellConfig, columnIndex) => {
            const rowSpan = cellConfig.rowSpan ?? 1;
            const columnSpan = cellConfig.columnSpan ?? 1;
            if (rowSpan <= 1 && columnSpan <= 1) {
                return;
            }

            const masterRow = skeletonRowsByIndex.get(rowIndex);
            const masterCell = masterRow?.cells[columnIndex];
            if (!masterCell || (masterCell as IDocumentSkeletonPage & { isMergedCellCovered?: boolean }).isMergedCellCovered) {
                return;
            }

            let pageHeight = 0;
            for (let row = rowIndex; row < rowIndex + rowSpan; row++) {
                pageHeight += skeletonRowsByIndex.get(row)?.height ?? 0;
            }

            if (pageHeight > 0) {
                masterCell.pageHeight = pageHeight;
            }
        });
    });
}

function createMergedAwareNullCellPage(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    table: ITable,
    row: number,
    col: number,
    rowSkeleton: IDocumentSkeletonRow
): IDocumentSkeletonPage {
    const cellSkeleton = createNullCellPage(
        ctx,
        sectionBreakConfig,
        table,
        row,
        col
    ).page;

    cellSkeleton.parent = rowSkeleton;
    if (isCoveredTableCell(table.tableRows[row].tableCells[col])) {
        Object.assign(cellSkeleton, { isMergedCellCovered: true });
    }

    return cellSkeleton;
}

function shouldAdvanceTableCellLeft(table: ITable, row: number, col: number): boolean {
    const cellConfig = table.tableRows[row]?.tableCells[col];
    if (!isCoveredTableCell(cellConfig)) {
        return true;
    }

    const masterCell = findMergedMasterCell(table, row, col);
    if (masterCell == null) {
        return true;
    }

    return masterCell.row !== row;
}

function findMergedMasterCell(table: ITable, row: number, col: number): Nullable<{ row: number; col: number }> {
    for (let rowIndex = 0; rowIndex <= row; rowIndex++) {
        const rowSource = table.tableRows[rowIndex];
        if (rowSource == null) {
            continue;
        }

        for (let columnIndex = 0; columnIndex < rowSource.tableCells.length; columnIndex++) {
            const cellConfig = rowSource.tableCells[columnIndex];
            if (isCoveredTableCell(cellConfig)) {
                continue;
            }

            const rowSpan = Math.max(1, cellConfig.rowSpan ?? 1);
            const columnSpan = Math.max(1, cellConfig.columnSpan ?? 1);
            if (rowSpan <= 1 && columnSpan <= 1) {
                continue;
            }

            const containsRow = row >= rowIndex && row < rowIndex + rowSpan;
            const containsColumn = col >= columnIndex && col < columnIndex + columnSpan;
            if (containsRow && containsColumn) {
                return { row: rowIndex, col: columnIndex };
            }
        }
    }

    return null;
}

function isCoveredTableCell(cellConfig: ITableCell | undefined): boolean {
    return cellConfig?.rowSpan === 0 || cellConfig?.columnSpan === 0;
}

function _getTableLeft(pageWidth: number, tableWidth: number, align: TableAlignmentType, indent: INumberUnit = { v: 0 }) {
    switch (align) {
        case TableAlignmentType.START: {
            return indent.v;
        }
        case TableAlignmentType.END: {
            return Math.max(0, pageWidth - tableWidth);
        }
        case TableAlignmentType.CENTER: {
            return Math.max(0, (pageWidth - tableWidth) / 2);
        }
        default: {
            throw new Error('Unknown table alignment type');
        }
    }
}

export function getNullTableSkeleton(
    st: number,
    ed: number,
    table: ITable
): IDocumentSkeletonTable {
    return {
        rows: [],
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        st,
        ed,
        tableId: table.tableId,
        tableSource: table,
    };
}

function _getNullTableRowSkeleton(
    st: number,
    ed: number,
    index: number,
    rowSource: ITableRow,
    isRepeatRow = false,
    parent?: IDocumentSkeletonTable
): IDocumentSkeletonRow {
    return {
        cells: [],
        index,
        height: 0,
        top: 0,
        st,
        ed,
        parent,
        rowSource,
        isRepeatRow,
    };
}

export function getTableSliceId(tableId: string, sliceIndex: number) {
    return `${tableId}#-#${sliceIndex}`;
}

export function getTableIdAndSliceIndex(tableSliceId: string) {
    if (!tableSliceId.includes('#-#')) {
        return {
            tableId: tableSliceId,
            sliceIndex: 0,
        };
    }

    const [tableId, sliceIndex] = tableSliceId.split('#-#');
    return {
        tableId,
        sliceIndex: Number(sliceIndex),
    };
}
