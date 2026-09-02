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
} from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ICellSkeletonBuildState } from '../model/page';
import type { ILayoutContext } from '../tools';
import { BooleanNumber, TableAlignmentType, TableRowHeightRule, VerticalAlignmentType } from '@univerjs/core';
import { DocumentSkeletonPageType } from '../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy } from '../../document-compatibility';
import {
    createNullCellPage,
    createSkeletonCellPages,
    startSkeletonCellPagesBuild,
    stepSkeletonCellPagesBuild,
} from '../model/page';

const precomputedTableSkeletons = new WeakMap<ILayoutContext, Map<number, IDocumentSkeletonTable>>();
const precomputedSlicedTableSkeletons = new WeakMap<
    ILayoutContext,
    Map<number, { availableHeight: number; result: ISlicedTableSkeletonParams }>
>();

export interface ITableSkeletonBuildState {
    ctx: ILayoutContext;
    curPage: IDocumentSkeletonPage;
    viewModel: DocumentViewModel;
    tableNode: DataStreamTreeNode;
    sectionBreakConfig: ISectionBreakConfig;
    table: ITable;
    tableSkeleton: IDocumentSkeletonTable;
    rowIndex: number;
    rowTop: number;
    tableWidth: number;
    complete: boolean;
    currentRowNode: Nullable<DataStreamTreeNode>;
    currentRowSkeleton: Nullable<IDocumentSkeletonRow>;
    currentColumnIndex: number;
    currentRowLeft: number;
    currentRowHeight: number;
    currentCellBuild: Nullable<ICellSkeletonBuildState>;
}

export function startTableSkeletonBuild(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): Nullable<ITableSkeletonBuildState> {
    const table = viewModel.getTableByStartIndex(tableNode.startIndex)?.tableSource;
    if (table == null) {
        console.warn(`Table not found when creating table skeleton at index ${tableNode.startIndex}`);
        return null;
    }

    return {
        ctx,
        curPage,
        viewModel,
        tableNode,
        sectionBreakConfig,
        table,
        tableSkeleton: getNullTableSkeleton(tableNode.startIndex, tableNode.endIndex, table),
        rowIndex: 0,
        rowTop: 0,
        tableWidth: 0,
        complete: false,
        currentRowNode: null,
        currentRowSkeleton: null,
        currentColumnIndex: 0,
        currentRowLeft: 0,
        currentRowHeight: 0,
        currentCellBuild: null,
    };
}

export function stepTableSkeletonBuild(state: ITableSkeletonBuildState): boolean {
    if (state.complete) {
        return true;
    }

    if (state.currentRowNode == null || state.currentRowSkeleton == null) {
        const rowNode = state.tableNode.children[state.rowIndex];
        if (rowNode != null) {
            _startUnslicedTableRow(state, rowNode);
        }
    }

    if (state.currentRowNode != null && state.currentRowSkeleton != null) {
        if (!_stepUnslicedTableRow(state)) {
            return false;
        }
    }

    if (state.rowIndex >= state.tableNode.children.length) {
        _finishTableSkeletonBuild(state);
    }

    return state.complete;
}

export function cachePrecomputedTableSkeleton(
    ctx: ILayoutContext,
    tableStartIndex: number,
    tableSkeleton: IDocumentSkeletonTable
): void {
    let cache = precomputedTableSkeletons.get(ctx);
    if (cache == null) {
        cache = new Map();
        precomputedTableSkeletons.set(ctx, cache);
    }
    cache.set(tableStartIndex, tableSkeleton);
}

export function createTableSkeleton(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): Nullable<IDocumentSkeletonTable> {
    const cached = precomputedTableSkeletons.get(ctx)?.get(tableNode.startIndex);
    if (cached != null) {
        return cached;
    }

    const state = startTableSkeletonBuild(ctx, curPage, viewModel, tableNode, sectionBreakConfig);
    if (state == null) {
        return null;
    }
    while (!stepTableSkeletonBuild(state)) {
        // Compatibility path remains synchronous. Incremental callers step the same state row by row.
    }

    return state.tableSkeleton;
}

function _startUnslicedTableRow(state: ITableSkeletonBuildState, rowNode: DataStreamTreeNode): void {
    const { table, tableSkeleton } = state;
    const { startIndex, endIndex } = rowNode;
    const row = state.rowIndex;
    const rowSource = table.tableRows[row];
    const rowSkeleton = _getNullTableRowSkeleton(startIndex, endIndex, row, rowSource, false, tableSkeleton);
    tableSkeleton.rows.push(rowSkeleton);
    state.currentRowNode = rowNode;
    state.currentRowSkeleton = rowSkeleton;
    state.currentColumnIndex = 0;
    state.currentRowLeft = 0;
    state.currentRowHeight = 0;
}

function _stepUnslicedTableRow(state: ITableSkeletonBuildState): boolean {
    const { ctx, sectionBreakConfig, table, viewModel } = state;
    const rowNode = state.currentRowNode!;
    const rowSkeleton = state.currentRowSkeleton!;
    const row = state.rowIndex;
    const col = state.currentColumnIndex;
    const cellNode = rowNode.children[col];
    const cellConfig = table.tableRows[row].tableCells[col];

    if (cellNode != null) {
        if (isCoveredTableCell(cellConfig)) {
            const cellPageSkeleton = createMergedCoveredCellPage(
                ctx,
                sectionBreakConfig,
                table,
                row,
                col,
                rowSkeleton
            );
            _appendUnslicedCell(state, [cellPageSkeleton]);
        } else {
            state.currentCellBuild ??= startSkeletonCellPagesBuild(
                ctx,
                viewModel,
                cellNode,
                sectionBreakConfig,
                table,
                row,
                col
            );
            if (!stepSkeletonCellPagesBuild(state.currentCellBuild)) {
                return false;
            }
            const cellPageSkeletons = state.currentCellBuild.requiresSyncFallback
                ? createSkeletonCellPages(
                    ctx,
                    viewModel,
                    cellNode,
                    sectionBreakConfig,
                    table,
                    row,
                    col
                )
                : state.currentCellBuild.pages;
            state.currentCellBuild = null;
            _appendUnslicedCell(state, cellPageSkeletons);
        }
        state.currentColumnIndex++;
    }

    if (state.currentColumnIndex < rowNode.children.length) {
        return false;
    }

    _finishUnslicedTableRow(state);
    return true;
}

function _appendUnslicedCell(state: ITableSkeletonBuildState, cellPageSkeletons: IDocumentSkeletonPage[]): void {
    const rowSkeleton = state.currentRowSkeleton!;
    const row = state.rowIndex;
    const col = state.currentColumnIndex;
    const cellPageSkeleton = cellPageSkeletons[0];
    if (cellPageSkeletons.slice(1).some((page) => page.isExplicitPageBreak === true)) {
        state.tableSkeleton.hasPageBreak = true;
    }
    const pageHeight = getCellPagesLayoutHeight(
        cellPageSkeletons,
        state.curPage.type === DocumentSkeletonPageType.CELL
    );
    cellPageSkeleton.left = state.currentRowLeft;
    if (shouldAdvanceTableCellLeft(state.table, row, col)) {
        state.currentRowLeft += cellPageSkeleton.pageWidth;
    }
    cellPageSkeleton.parent = rowSkeleton;
    rowSkeleton.cells.push(cellPageSkeleton);
    state.currentRowHeight = Math.max(state.currentRowHeight, pageHeight);
}

function _finishUnslicedTableRow(state: ITableSkeletonBuildState): void {
    const rowSkeleton = state.currentRowSkeleton!;
    const rowSource = state.table.tableRows[state.rowIndex];
    const { hRule, val } = rowSource.trHeight;
    let rowHeight = state.currentRowHeight;

    if (hRule === TableRowHeightRule.AT_LEAST) {
        rowHeight = Math.max(rowHeight, val.v);
    } else if (hRule === TableRowHeightRule.EXACT) {
        rowHeight = val.v;
    }
    for (const cellPageSkeleton of rowSkeleton.cells) {
        cellPageSkeleton.pageHeight = rowHeight;
    }
    _verticalAlignInCell(rowSkeleton, rowSource);

    rowSkeleton.height = rowHeight;
    rowSkeleton.top = state.rowTop;
    state.rowTop += rowHeight;
    state.tableWidth = Math.max(state.tableWidth, state.currentRowLeft);
    state.rowIndex++;
    state.currentRowNode = null;
    state.currentRowSkeleton = null;
    state.currentColumnIndex = 0;
    state.currentCellBuild = null;
}

function _finishTableSkeletonBuild(state: ITableSkeletonBuildState): void {
    const { curPage, table, tableSkeleton } = state;
    tableSkeleton.width = state.tableWidth;
    tableSkeleton.height = state.rowTop;
    applyMergedCellSpanHeights(tableSkeleton);

    const { pageWidth, marginLeft = 0, marginRight = 0 } = curPage;
    tableSkeleton.left = getTableLeft(
        pageWidth - marginLeft - marginRight,
        state.tableWidth,
        table.align,
        table.indent
    );
    state.complete = true;
}

function getCellPagesLayoutHeight(pages: IDocumentSkeletonPage[], includeContinuations: boolean): number {
    const measuredPages = includeContinuations ? pages : pages.slice(0, 1);
    return measuredPages.reduce((total, page) => {
        const { marginTop = 0, marginBottom = 0 } = page;
        return total + page.height + marginTop + marginBottom;
    }, 0);
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

export interface ISlicedTableSkeletonBuildState {
    ctx: ILayoutContext;
    curPage: IDocumentSkeletonPage;
    viewModel: DocumentViewModel;
    tableNode: DataStreamTreeNode;
    sectionBreakConfig: ISectionBreakConfig;
    availableHeight: number;
    table: ITable;
    skeTables: IDocumentSkeletonTable[];
    createCache: ICreateTableCache;
    rowIndex: number;
    columnIndex: number;
    preparedCellPages: Map<number, IDocumentSkeletonPage[]>;
    pendingCellBuild: Nullable<ICellSkeletonBuildState>;
    complete: boolean;
    result: Nullable<ISlicedTableSkeletonParams>;
}

interface ICreateTableCache {
    rowTop: number;
    tableWidth: number;
    remainHeight: number;
    repeatRows: DataStreamTreeNode[];
    repeatRowsHeight: number;
}

export function startTableSkeletonsBuild(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    availableHeight: number
): Nullable<ISlicedTableSkeletonBuildState> {
    const { startIndex, endIndex, children: rowNodes } = tableNode;
    const table = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (table == null) {
        return null;
    }

    const skeTables = [getNullTableSkeleton(startIndex, endIndex, table)];
    return {
        ctx,
        curPage,
        viewModel,
        tableNode,
        sectionBreakConfig,
        availableHeight,
        table,
        skeTables,
        createCache: {
            rowTop: 0,
            tableWidth: precomputedTableSkeletons.get(ctx)?.get(startIndex)?.width ?? 0,
            remainHeight: availableHeight,
            repeatRows: getLeadingRepeatHeaderRows(table, rowNodes),
            repeatRowsHeight: 0,
        },
        rowIndex: 0,
        columnIndex: 0,
        preparedCellPages: new Map(),
        pendingCellBuild: null,
        complete: false,
        result: null,
    };
}

export function stepTableSkeletonsBuild(state: ISlicedTableSkeletonBuildState): boolean {
    if (state.complete) {
        return true;
    }

    const rowNode = state.tableNode.children[state.rowIndex];
    if (rowNode == null) {
        _finishTableSkeletonsBuild(state);
        return true;
    }

    const cellNode = rowNode.children[state.columnIndex];
    const rowSource = state.table.tableRows[state.rowIndex];
    const cellConfig = rowSource.tableCells[state.columnIndex];
    const precomputedRow = precomputedTableSkeletons.get(state.ctx)?.get(state.tableNode.startIndex)?.rows[state.rowIndex];
    // Pagination uses the same current-generation measurements as the synchronous
    // path. Only cells in rows that actually need splitting must be laid out again.
    const reusePrecomputedRow = canReusePrecomputedTableRow(state.curPage, state.createCache, rowSource, precomputedRow);
    if (!reusePrecomputedRow && cellNode != null && !isCoveredTableCell(cellConfig)) {
        const pageContentHeight = getAvailableHeight(state.curPage, state.createCache, false);
        const availableHeight = getAvailableHeight(state.curPage, state.createCache, true);
        const canRowSplit =
            rowSource.cantSplit !== BooleanNumber.TRUE &&
            rowSource.trHeight.hRule === TableRowHeightRule.AUTO;
        const needOpenNewTable = state.createCache.remainHeight <= 72;
        const firstCellPageHeight = canRowSplit && !needOpenNewTable
            ? state.createCache.remainHeight
            : availableHeight;
        state.pendingCellBuild ??= startSkeletonCellPagesBuild(
            state.ctx,
            state.viewModel,
            cellNode,
            state.sectionBreakConfig,
            state.table,
            state.rowIndex,
            state.columnIndex,
            firstCellPageHeight,
            pageContentHeight
        );
        if (!stepSkeletonCellPagesBuild(state.pendingCellBuild)) {
            return false;
        }
        const pages = state.pendingCellBuild.requiresSyncFallback
            ? createSkeletonCellPages(
                state.ctx,
                state.viewModel,
                cellNode,
                state.sectionBreakConfig,
                state.table,
                state.rowIndex,
                state.columnIndex,
                firstCellPageHeight,
                pageContentHeight
            )
            : state.pendingCellBuild.pages;
        state.pendingCellBuild = null;
        state.preparedCellPages.set(state.columnIndex, pages);
    }

    state.columnIndex++;
    if (!reusePrecomputedRow && state.columnIndex < rowNode.children.length) {
        return false;
    }

    dealWithTableRow(
        state.ctx,
        state.curPage,
        state.skeTables,
        state.viewModel,
        state.sectionBreakConfig,
        rowNode,
        state.rowIndex,
        state.table,
        state.createCache,
        false,
        precomputedRow,
        state.preparedCellPages
    );
    state.rowIndex++;
    state.columnIndex = 0;
    state.preparedCellPages = new Map();
    state.pendingCellBuild = null;

    if (state.rowIndex >= state.tableNode.children.length) {
        _finishTableSkeletonsBuild(state);
    }
    return state.complete;
}

export function cachePrecomputedSlicedTableSkeletons(
    ctx: ILayoutContext,
    tableStartIndex: number,
    availableHeight: number,
    result: ISlicedTableSkeletonParams
): void {
    let cache = precomputedSlicedTableSkeletons.get(ctx);
    if (cache == null) {
        cache = new Map();
        precomputedSlicedTableSkeletons.set(ctx, cache);
    }
    cache.set(tableStartIndex, { availableHeight, result });
}

function _finishTableSkeletonsBuild(state: ISlicedTableSkeletonBuildState): void {
    updateTableSkeletonsPosition(state.createCache, state.curPage, state.skeTables, state.table);
    const policy =
        state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    state.result = {
        skeTables: state.skeTables,
        fromCurrentPage:
            state.skeTables[0].height <=
            state.availableHeight + policy.table.currentPageOverflowTolerance,
    };
    state.complete = true;
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
    const precomputedSliced = precomputedSlicedTableSkeletons.get(ctx)?.get(startIndex);
    if (
        precomputedSliced != null &&
        Math.abs(precomputedSliced.availableHeight - availableHeight) < 0.01
    ) {
        precomputedSlicedTableSkeletons.get(ctx)?.delete(startIndex);
        precomputedTableSkeletons.get(ctx)?.delete(startIndex);
        return precomputedSliced.result;
    }

    if (
        ctx.deferSlicedTableLayout?.({
            curPage,
            viewModel,
            tableNode,
            sectionBreakConfig,
            availableHeight,
        }) === true
    ) {
        // The current paragraph attempt is transactional and will be discarded.
        // Returning an empty split lets the existing layout stack unwind without
        // publishing provisional geometry; the incremental coordinator restores
        // the paragraph checkpoint after the deferred calculation completes.
        return { skeTables: [], fromCurrentPage: false };
    }

    const table = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (table == null) {
        console.warn(`Table not found when creating sliced table skeletons at index ${startIndex}`);
        return {
            skeTables,
            fromCurrentPage: false,
        };
    }

    const repeatRows = getLeadingRepeatHeaderRows(table, rowNodes);
    const precomputedTable = precomputedTableSkeletons.get(ctx)?.get(startIndex);
    precomputedTableSkeletons.get(ctx)?.delete(startIndex);
    const curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);

    const createCache: ICreateTableCache = {
        rowTop: 0,
        tableWidth: precomputedTable?.width ?? 0,
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
            createCache,
            false,
            precomputedTable?.rows[row]
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
    const tableLeft = getTableLeft(pageWidth - marginLeft - marginRight, tableWidth, table.align, table.indent);

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

function canReusePrecomputedTableRow(
    curPage: IDocumentSkeletonPage,
    cache: ICreateTableCache,
    rowSource: ITableRow,
    precomputedRow?: IDocumentSkeletonRow
): precomputedRow is IDocumentSkeletonRow {
    const canRowSplit = rowSource.cantSplit !== BooleanNumber.TRUE && rowSource.trHeight.hRule !== TableRowHeightRule.EXACT;
    return precomputedRow != null &&
        precomputedRow.height <= getAvailableHeight(curPage, cache, false) &&
        (cache.remainHeight <= 0 || !canRowSplit || precomputedRow.height <= cache.remainHeight);
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
    isRepeatRow = false,
    precomputedRow?: IDocumentSkeletonRow,
    preparedCellPages?: Map<number, IDocumentSkeletonPage[]>
) {
    const pageContentHeight = getAvailableHeight(curPage, cache, false);
    const availableHeight = getAvailableHeight(curPage, cache, true);
    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const { children: cellNodes, startIndex, endIndex } = rowNode;
    const rowSource = table.tableRows[row];
    const { trHeight, cantSplit } = rowSource;
    const { hRule, val } = trHeight;
    const canRowSplit = cantSplit !== BooleanNumber.TRUE && trHeight.hRule !== TableRowHeightRule.EXACT;
    const needOpenNewTable = cache.remainHeight <= 0;
    const precomputedRowFits = !isRepeatRow && canReusePrecomputedTableRow(curPage, cache, rowSource, precomputedRow);
    const rowSkeletons: IDocumentSkeletonRow[] = precomputedRowFits ? [precomputedRow] : [];
    let curTableSkeleton = getCurTableSkeleton(skeTables);

    const rowHeights = precomputedRowFits ? [precomputedRow.height] : [0];
    const forcedPageBreakRows = new WeakSet<IDocumentSkeletonRow>();

    for (const cellNode of precomputedRowFits ? [] : cellNodes) {
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

        const cellPageSkeletons = preparedCellPages?.get(col) ??
            createSkeletonCellPages(
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

            // A rendered page boundary inside a cell is a structural split, even when an
            // ancestor cell is measured with infinite height. Propagating that boundary
            // through each enclosing table keeps deeply nested DOCX tables on the same
            // physical pages without persisting any format-specific layout side channel.
            if (pageIndex > 0 && cellPageSkeleton.isExplicitPageBreak === true) {
                forcedPageBreakRows.add(rowSke);
            }

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
    const isSplitRow = rowSkeletons.length > 1;
    for (const rowSkeleton of rowSkeletons) {
        _verticalAlignInCell(rowSkeleton, rowSource, isSplitRow);
    }

    while (rowSkeletons.length > 0) {
        const rowSkeleton = rowSkeletons.shift()!;
        const lastRow = curTableSkeleton.rows[curTableSkeleton.rows.length - 1];
        const rowOverflowHeight = rowSkeleton.height - cache.remainHeight;
        const shouldOpenNewTable =
            cache.remainHeight <= 0 ||
            forcedPageBreakRows.has(rowSkeleton) ||
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

    return repeatRows.length === rowNodes.length ? [] : repeatRows;
}

function _verticalAlignInCell(
    rowSkeleton: IDocumentSkeletonRow,
    rowSource: ITableRow,
    isSplitRow = false
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

        // Word applies cell vertical alignment to an unsplit row as a whole. Centering or bottom-aligning
        // every continuation fragment independently creates large blank areas and clipped text.
        if (isSplitRow) {
            cellPageSkeleton.marginTop = originMarginTop;
            continue;
        }

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

export function getTableLeft(pageWidth: number, tableWidth: number, align: TableAlignmentType, indent: INumberUnit = { v: 0 }) {
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
