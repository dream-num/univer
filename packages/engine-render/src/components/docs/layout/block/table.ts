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

import type { INumberUnit, ITable } from '@univerjs/core';
import { TableAlignmentType } from '@univerjs/core';
import type { IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, ISectionBreakConfig } from '../../../../basics';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import { createSkeletonCellPage } from '../model/page';
import type { ILayoutContext } from '../tools';

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

    const tableSkeleton = _getNullTableSkeleton(startIndex, endIndex, table);
    let rowTop = 0;
    let tableWidth = 0;

    for (const rowNode of rowNodes) {
        const { children: cellNodes, startIndex, endIndex } = rowNode;
        const row = rowNodes.indexOf(rowNode);
        const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, tableSkeleton);
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

            cellPageSkeleton.left = left;
            left += cellPageSkeleton.pageWidth;
            cellPageSkeleton.parent = rowSkeleton;
            rowSkeleton.cells.push(cellPageSkeleton);
            rowHeight = Math.max(rowHeight, cellPageSkeleton.height);
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

function _getNullTableSkeleton(
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
    parent: IDocumentSkeletonTable
): IDocumentSkeletonRow {
    return {
        cells: [],
        height: 0,
        top: 0,
        st,
        ed,
        parent,
    };
}
