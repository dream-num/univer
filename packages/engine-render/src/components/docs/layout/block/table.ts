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

import type { INumberUnit, ITable, ITableRow } from '@univerjs/core';
import type { IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, ISectionBreakConfig } from '../../../../basics';
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
    const fromCurrentPage = true;
    const skeTables: IDocumentSkeletonTable[] = [];
    const { pageWidth, marginLeft = 0, marginRight = 0, marginTop, marginBottom, pageHeight } = curPage;
    const pageContentHeight = pageHeight - marginTop - marginBottom;

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
        const { trHeight, cantSplit } = rowSource;
        const rowSkeletons: IDocumentSkeletonRow[] = [];
        const { hRule, val } = trHeight;
        const canRowSplit = cantSplit === BooleanNumber.TRUE && trHeight.hRule === TableRowHeightRule.AUTO;

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
                canRowSplit ? remainHeight : Number.POSITIVE_INFINITY,
                canRowSplit ? pageContentHeight : Number.POSITIVE_INFINITY
            );

            while (rowSkeletons.length < cellPageSkeletons.length) {
                const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource);
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
            const rowIndex = rowSkeletons.indexOf(rowSke);

            if (hRule === TableRowHeightRule.AT_LEAST) {
                rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], val.v);
            } else if (hRule === TableRowHeightRule.EXACT) {
                rowHeights[rowIndex] = val.v;
            }

            let left = 0;
            // Set row height to cell page height.
            for (const cellPageSkeleton of rowSke.cells) {
                cellPageSkeleton.left = left;
                cellPageSkeleton.pageHeight = rowHeights[rowIndex];

                left += cellPageSkeleton.pageWidth;

                tableWidth = Math.max(tableWidth, left);
            }
        }

        // Handle vertical alignment in cell.
        for (let i = 0; i < rowSource.tableCells.length; i++) {
            const cellConfig = rowSource.tableCells[i];

            for (const rowSkeleton of rowSkeletons) {
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

        if (rowSkeletons.length > 1) {
            for (let i = 0; i < rowSkeletons.length; i++) {
                if (i !== 0) {
                    curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
                    skeTables.push(curTableSkeleton);
                }

                const rowSkeleton = rowSkeletons[i];
                const rowHeight = rowHeights[i];

                rowSkeleton.height = rowHeight;
                rowSkeleton.top = i === 0 ? rowTop : 0;

                curTableSkeleton.height += rowHeight;

                curTableSkeleton.rows.push(rowSkeleton);
                rowSkeleton.parent = curTableSkeleton;
                remainHeight = pageContentHeight - rowHeight;

                rowTop = rowHeight;
            }
        } else {
            const rowSkeleton = rowSkeletons[0];
            const rowHeight = rowHeights[0];

            rowSkeleton.height = rowHeight;
            rowSkeleton.top = rowTop;
            rowTop += rowHeight;

            curTableSkeleton.rows.push(rowSkeleton);
            rowSkeleton.parent = curTableSkeleton;
            remainHeight -= rowHeight;
            curTableSkeleton.height = rowTop;
        }
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
