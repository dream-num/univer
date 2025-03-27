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

import type { INumberUnit, ITable, ITableRow, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, IParagraphList, ISectionBreakConfig } from '../../../../basics';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import { BooleanNumber, TableAlignmentType, TableRowHeightRule, VerticalAlignmentType } from '@univerjs/core';
import { createNullCellPage, createSkeletonCellPages } from '../model/page';

export function createTableSkeleton(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): IDocumentSkeletonTable {
    const { startIndex, endIndex, children: rowNodes } = tableNode;
    const table = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (table == null) {
        throw new Error('Table not found');
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
            rowHeight = val.v;
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

    const { pageWidth, marginLeft = 0, marginRight = 0 } = curPage;

    tableSkeleton.left = _getTableLeft(pageWidth - marginLeft - marginRight, tableWidth, table.align, table.indent);

    return tableSkeleton;
}

export function rollbackListCache(listLevel: Map<string, IParagraphList[][]>, table: DataStreamTreeNode) {
    const { startIndex, endIndex } = table;

    for (const paragraphLists of listLevel.values()) {
        for (const paragraphList of paragraphLists) {
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
    repeatRow: Nullable<DataStreamTreeNode>;
    repeatRowHeight: number;
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
        throw new Error('Table not found when creating table skeletons');
    }

    const needRepeatHeader = table.tableRows[0].repeatHeaderRow === BooleanNumber.TRUE;
    const curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);

    const createCache: ICreateTableCache = {
        rowTop: 0,
        tableWidth: 0,
        remainHeight: availableHeight,
        repeatRow: needRepeatHeader ? rowNodes[0] : null,
        repeatRowHeight: 0,
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

    const fromCurrentPage = skeTables[0].height <= availableHeight;

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
        pageContentHeight -= cache.repeatRowHeight;
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
    const { children: cellNodes, startIndex, endIndex } = rowNode;
    const rowSource = table.tableRows[row];
    const { trHeight, cantSplit } = rowSource;
    const rowSkeletons: IDocumentSkeletonRow[] = [];
    const { hRule, val } = trHeight;
    const canRowSplit = cantSplit === BooleanNumber.TRUE && trHeight.hRule === TableRowHeightRule.AUTO;
    // If the remain height is less than 50 pixels, you can't fit the next line, so you can start typography directly from the second page.
    const MAX_FONT_SIZE = 72;
    const needOpenNewTable = cache.remainHeight <= MAX_FONT_SIZE;
    let curTableSkeleton = getCurTableSkeleton(skeTables);

    const rowHeights = [0];

    for (const cellNode of cellNodes) {
        const col = cellNodes.indexOf(cellNode);
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
            const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource, isRepeatRow);
            const colCount = cellNodes.length;

            // Fill the row with null cell pages.
            rowSkeleton.cells = [...new Array(colCount)].map((_, i) => {
                const cellSkeleton = createNullCellPage(
                    ctx,
                    sectionBreakConfig,
                    table,
                    row,
                    i
                ).page;

                cellSkeleton.parent = rowSkeleton;

                return cellSkeleton;
            });

            rowSkeletons.push(rowSkeleton);
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
            rowHeights[rowIndex] = val.v;
        }

        rowHeights[rowIndex] = Math.min(rowHeights[rowIndex], pageContentHeight);

        let left = 0;
        // Set row height to cell page height.
        for (const cellPageSkeleton of rowSke.cells) {
            cellPageSkeleton.left = left;
            cellPageSkeleton.pageHeight = rowHeights[rowIndex];

            left += cellPageSkeleton.pageWidth;

            cache.tableWidth = Math.max(cache.tableWidth, left);
        }

        // Set row Skeleton height.
        rowSke.height = rowHeights[rowIndex];
    }

    if (row === 0 && cache.repeatRow) {
        cache.repeatRowHeight = rowHeights[rowHeights.length - 1];
    }

    // Handle vertical alignment in cell.
    for (const rowSkeleton of rowSkeletons) {
        _verticalAlignInCell(rowSkeleton, rowSource);
    }

    while (rowSkeletons.length > 0) {
        const rowSkeleton = rowSkeletons.shift()!;
        const lastRow = curTableSkeleton.rows[curTableSkeleton.rows.length - 1];

        if (cache.remainHeight < MAX_FONT_SIZE || cache.remainHeight < rowSkeleton.height) {
            cache.remainHeight = getAvailableHeight(curPage, cache, row !== 0 && rowSkeleton.index !== lastRow.index);
            cache.rowTop = 0;

            if (curTableSkeleton.rows.length > 0) {
                curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
                skeTables.push(curTableSkeleton);

                // Handle repeat first row.
                // 如果当前行跨页，那么不用再第二页上面重复标题行了。
                if (cache.repeatRow && isRepeatRow === false && row !== 0 && rowSkeleton.index !== lastRow.index) {
                    const FIRST_ROW_INDEX = 0;
                    cache.remainHeight = getAvailableHeight(curPage, cache, false);
                    dealWithTableRow(
                        ctx,
                        curPage,
                        skeTables,
                        viewModel,
                        sectionBreakConfig,
                        cache.repeatRow,
                        FIRST_ROW_INDEX,
                        table,
                        cache,
                        true
                    );
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
