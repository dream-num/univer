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

import type { INumberUnit, ITable, ITableRow, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, ISectionBreakConfig } from '../../../../basics';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import { TableAlignmentType, TableRowHeightRule, VerticalAlignmentType } from '@univerjs/core';
import { createSkeletonCellPage } from '../model/page';

export function createTableSkeleton(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): IDocumentSkeletonTable {
    const { startIndex, endIndex, children: rowNodes } = tableNode;
    const table = viewModel.getTable(startIndex);
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
        const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource, tableSkeleton);
        const { hRule, val } = trHeight;

        tableSkeleton.rows.push(rowSkeleton);
        let left = 0;
        let rowHeight = 0;

        for (const cellNode of cellNodes) {
            const col = cellNodes.indexOf(cellNode);
            const cellPageSkeleton = createSkeletonCellPage(
                ctx,
                viewModel,
                cellNode,
                sectionBreakConfig,
                table,
                row,
                col
            );

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

export interface ISlicedTableSkeletonParams {
    skeTables: IDocumentSkeletonTable[];
    fromCurrentPage: boolean;
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
    let fromCurrentPage = true;
    const skeTables: IDocumentSkeletonTable[] = [];
    const { pageWidth, marginLeft = 0, marginRight = 0, marginTop, marginBottom, pageHeight } = curPage;

    const { startIndex, endIndex, children: rowNodes } = tableNode;
    const table = viewModel.getTable(startIndex);
    if (table == null) {
        throw new Error('Table not found when creating table skeletons');
    }

    let curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
    let rowTop = 0;
    let tableWidth = 0;
    let remainHeight = availableHeight;

    skeTables.push(curTableSkeleton);

    for (const rowNode of rowNodes) {
        const { children: cellNodes, startIndex, endIndex } = rowNode;
        const row = rowNodes.indexOf(rowNode);
        const rowSource = table.tableRows[row];
        const { trHeight } = rowSource;
        const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource, curTableSkeleton);
        const { hRule, val } = trHeight;

        let left = 0;
        let rowHeight = 0;

        for (const cellNode of cellNodes) {
            const col = cellNodes.indexOf(cellNode);
            const cellPageSkeleton = createSkeletonCellPage(
                ctx,
                viewModel,
                cellNode,
                sectionBreakConfig,
                table,
                row,
                col
            );

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
        for (let i = 0; i < rowSource.tableCells.length; i++) {
            const cellConfig = rowSource.tableCells[i];
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

        if (remainHeight < rowHeight) {
            if (skeTables.length === 1 && curTableSkeleton.rows.length === 0) {
                fromCurrentPage = false;
            } else {
                curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
                skeTables.push(curTableSkeleton);
            }

            remainHeight = pageHeight - marginTop - marginBottom;
            rowTop = 0;
        }

        rowSkeleton.height = rowHeight;
        rowSkeleton.top = rowTop;
        rowTop += rowHeight;

        curTableSkeleton.rows.push(rowSkeleton);
        remainHeight -= rowHeight;
        curTableSkeleton.height = rowTop;

        tableWidth = Math.max(tableWidth, left);
    }

    const tableLeft = _getTableLeft(pageWidth - marginLeft - marginRight, tableWidth, table.align, table.indent);

    let tableIndex = 0;
    for (const tableSkeleton of skeTables) {
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

    return {
        skeTables,
        fromCurrentPage,
    };
}

// When a table spreads pages, you need to split the table into tables and place them on different pages,
// and if you allow the spread to break the rows, you also need to split the rows.
function splitTable(
    tableSke: IDocumentSkeletonTable,
    availableHeight: number
): Nullable<IDocumentSkeletonTable>[] {
    // 处理极端情况，表格第一行高度都大于可用高度，那么表格从下一页开始排版
    if (tableSke.rows[0].height > availableHeight) {
        return [null, tableSke];
    }

    const { tableId: tableSliceId, tableSource } = tableSke;
    const { tableId, sliceIndex } = getTableIdAndSliceIndex(tableSliceId);
    const newTable = getNullTableSkeleton(0, 0, tableSource);

    // Reset table id;
    newTable.tableId = getTableSliceId(tableId, sliceIndex);
    newTable.left = tableSke.left;
    newTable.width = tableSke.width;
    newTable.height = 0;
    newTable.top = tableSke.top;
    tableSke.top = 0;

    let remainHeight = availableHeight;

    while (tableSke.rows.length && remainHeight >= tableSke.rows[0].height) {
        const row = tableSke.rows.shift()!;

        newTable.rows.push(row);

        tableSke.height -= row.height;
        newTable.height += row.height;

        // Reset row's parent index.
        row.parent = newTable;
        remainHeight -= row.height;
    }

    // Reset st and ed.
    newTable.st = newTable.rows[0].st - 1;
    newTable.ed = newTable.rows[newTable.rows.length - 1].ed + 1;

    tableSke.tableId = getTableSliceId(tableId, sliceIndex + 1);

    if (tableSke.rows.length > 0) {
        tableSke.st = tableSke.rows[0].st - 1;
        tableSke.ed = tableSke.rows[tableSke.rows.length - 1].ed + 1;

        // Reset row top.
        for (const row of tableSke.rows) {
            row.top -= newTable.height;
        }
    }

    return [newTable, tableSke.rows.length > 0 ? tableSke : null];
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
    parent: IDocumentSkeletonTable
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
