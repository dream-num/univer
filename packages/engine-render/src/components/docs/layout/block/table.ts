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

import type { IDocumentData, INumberUnit, ITable, ITableCell, ITableCellBorder, ITableRow, Nullable } from '@univerjs/core';
import { BooleanNumber, DataStreamTreeTokenType, NumberUnitType, ObjectRelativeFromV, PositionedObjectLayoutType, SpacingRule, TableAlignmentType, TableRowHeightRule, TableSizeType, VerticalAlignmentType } from '@univerjs/core';
import type { IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, IParagraphList } from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { DocumentFootnoteLayout } from '../footnote-layout';
import type { ICellSkeletonBuildState } from '../model/page';
import type { ILayoutContext } from '../tools';
import { DocumentSkeletonPageType } from '../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy, isTraditionalDocumentCompatibility, shouldAllowImportedTableMarginOverflow } from '../../document-compatibility';
import { createNullCellPage, createSkeletonCellPages, getRowBorderInset, getRowVerticalInset, startSkeletonCellPagesBuild, stepSkeletonCellPagesBuild } from '../model/page';
import { resolveTableAutoFitColumns } from '../table-auto-fit';
import { getCellBorderWidth, getTableCellSpacing, getTableOuterBorder, hasTableCellSpacing, resolveTableCellSpacing } from '../table-cell-spacing';
// Body, header and footer streams can share both table IDs and character offsets.
const precomputedTableSkeletons = new WeakMap<ILayoutContext, WeakMap<DataStreamTreeNode, IDocumentSkeletonTable>>();
const precomputedSlicedTableSkeletons = new WeakMap<
    ILayoutContext,
    WeakMap<DataStreamTreeNode, { availableHeight: number; result: ISlicedTableSkeletonParams }>
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
    mergedCellContentHeights: Map<string, number>;
    currentCellBuild: Nullable<ICellSkeletonBuildState>;
}

export function startTableSkeletonBuild(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): Nullable<ITableSkeletonBuildState> {
    const tableSource = viewModel.getTableByStartIndex(tableNode.startIndex)?.tableSource;
    if (tableSource == null) {
        console.warn(`Table not found when creating table skeleton at index ${tableNode.startIndex}`);
        return null;
    }
    const table = resolveTableForLayout(ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource);

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
        mergedCellContentHeights: new Map(),
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
    tableNode: DataStreamTreeNode,
    tableSkeleton: IDocumentSkeletonTable
): void {
    let cache = precomputedTableSkeletons.get(ctx);
    if (cache == null) {
        cache = new WeakMap();
        precomputedTableSkeletons.set(ctx, cache);
    }
    cache.set(tableNode, tableSkeleton);
}

export function createTableSkeleton(
    ctx: ILayoutContext,
    curPage: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig
): Nullable<IDocumentSkeletonTable> {
    const cached = precomputedTableSkeletons.get(ctx)?.get(tableNode);
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

function getOmittedGridWidth(table: ITable, row: number, edge: 'before' | 'after'): number {
    const count = Math.max(0, edge === 'before' ? table.tableRows[row].gridBefore ?? 0 : table.tableRows[row].gridAfter ?? 0);
    if (count === 0) {
        return 0;
    }
    const columns = edge === 'before'
        ? table.tableColumns.slice(0, count)
        : table.tableColumns.slice(Math.max(0, table.tableColumns.length - count));
    return columns.reduce((width, column) => width + column.size.width.v, 0);
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
    state.currentRowLeft = getOmittedGridWidth(table, row, 'before');
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
        state.curPage.type === DocumentSkeletonPageType.CELL,
        state.viewModel,
        state.table.tableRows[row]
    );
    cellPageSkeleton.left = state.currentRowLeft;
    if (shouldAdvanceTableCellLeft(state.table, row, col)) {
        state.currentRowLeft += cellPageSkeleton.pageWidth;
    }
    cellPageSkeleton.parent = rowSkeleton;
    rowSkeleton.cells.push(cellPageSkeleton);
    const rowSpan = state.table.tableRows[row].tableCells[col].rowSpan ?? 1;
    if (rowSpan > 1) {
        state.mergedCellContentHeights.set(`${row}:${col}`, pageHeight);
    } else {
        state.currentRowHeight = Math.max(state.currentRowHeight, pageHeight);
    }
}

function _finishUnslicedTableRow(state: ITableSkeletonBuildState): void {
    const rowSkeleton = state.currentRowSkeleton!;
    const rowSource = state.table.tableRows[state.rowIndex];
    const { hRule, val } = rowSource.trHeight;
    let rowHeight = state.currentRowHeight;

    if (hRule === TableRowHeightRule.AT_LEAST) {
        const traditional = isTraditionalDocumentCompatibility(
            state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()
        );
        rowHeight = Math.max(rowHeight, getRowMinimumHeight(state.table, state.rowIndex, traditional));
    } else if (hRule === TableRowHeightRule.EXACT) {
        rowHeight = val.v + getSeparatedRowHeightInset(state.table, state.rowIndex);
    }
    for (const cellPageSkeleton of rowSkeleton.cells) {
        cellPageSkeleton.pageHeight = rowHeight;
    }
    _verticalAlignInCell(rowSkeleton, rowSource);

    rowSkeleton.height = rowHeight;
    rowSkeleton.top = state.rowTop;
    state.rowTop += rowHeight;
    state.tableWidth = Math.max(state.tableWidth, state.currentRowLeft + getOmittedGridWidth(state.table, state.rowIndex, 'after'));
    state.rowIndex++;
    state.currentRowNode = null;
    state.currentRowSkeleton = null;
    state.currentColumnIndex = 0;
    state.currentCellBuild = null;
}

function _finishTableSkeletonBuild(state: ITableSkeletonBuildState): void {
    const { curPage, table, tableSkeleton } = state;
    applyMergedCellContentHeights(tableSkeleton, state.mergedCellContentHeights);
    tableSkeleton.width = state.tableWidth;
    tableSkeleton.height = tableSkeleton.rows.reduce((height, row) => {
        row.top = height;
        return height + row.height;
    }, 0);
    if (isTraditionalDocumentCompatibility(state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy())) {
        resolveMergedRowHeights(tableSkeleton);
    }
    applyMergedCellSpanHeights(tableSkeleton);
    applyTableOuterBorderSpacing(tableSkeleton, state.sectionBreakConfig);

    for (const rowSkeleton of tableSkeleton.rows) {
        _verticalAlignInCell(rowSkeleton, table.tableRows[rowSkeleton.index]);
    }

    const { pageWidth, marginLeft = 0, marginRight = 0 } = curPage;
    tableSkeleton.left = getTableLeft(
        pageWidth - marginLeft - marginRight,
        tableSkeleton.width,
        table.align,
        table.indent,
        shouldAllowImportedTableMarginOverflow(state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy(), table)
    );
    state.complete = true;
}

function applyMergedCellContentHeights(
    tableSkeleton: IDocumentSkeletonTable,
    mergedCellContentHeights: Map<string, number>
): void {
    for (const [cellKey, contentHeight] of mergedCellContentHeights) {
        const [rowIndex, columnIndex] = cellKey.split(':').map(Number);
        const rowSpan =
            tableSkeleton.tableSource?.tableRows[rowIndex]?.tableCells[columnIndex]?.rowSpan ?? 1;
        const spannedRows = tableSkeleton.rows.slice(rowIndex, rowIndex + rowSpan);
        const spanHeight = spannedRows.reduce((height, row) => height + row.height, 0);
        const lastRow = spannedRows[spannedRows.length - 1];

        if (lastRow != null && contentHeight > spanHeight) {
            lastRow.height += contentHeight - spanHeight;
        }
    }

    for (const rowSkeleton of tableSkeleton.rows) {
        for (const cellPageSkeleton of rowSkeleton.cells) {
            cellPageSkeleton.pageHeight = rowSkeleton.height;
        }
    }
}

function rollbackListCache(listLevel: Map<string, IParagraphList[][]>, table: DataStreamTreeNode): void {
    const { startIndex, endIndex } = table;
    for (const paragraphLists of listLevel.values()) {
        for (const paragraphList of paragraphLists) {
            if (paragraphList == null) {
                continue;
            }
            const index = paragraphList.findIndex((item) => item.paragraph.startIndex > startIndex && item.paragraph.startIndex < endIndex);
            if (index > -1) {
                paragraphList.splice(index);
            }
        }
    }
}

function getTableBorderHeight(table: ITable, firstRow: ITableRow, lastRow: ITableRow, traditional: boolean, suppressTopSpacing = false, suppressBottomSpacing = false): number {
    const firstSpacing = getTableCellSpacing(table, firstRow);
    const lastSpacing = getTableCellSpacing(table, lastRow);
    const top = firstSpacing == null ? 0 : (suppressTopSpacing ? 0 : firstSpacing) + getRowBorderInset(firstRow, 'borderTop', true) * 2;
    const bottom = lastSpacing == null ? 0 : (suppressBottomSpacing ? 0 : lastSpacing) + getRowBorderInset(lastRow, 'borderBottom', true) * 2;
    return top + bottom
        + (firstSpacing == null && traditional ? getRowBorderInset(firstRow, 'borderTop', true) : 0)
        + (lastSpacing == null && traditional ? getRowBorderInset(lastRow, 'borderBottom', true) : 0);
}

function getTableHorizontalBorderInset(table: ITable): number {
    return hasTableCellSpacing(table)
        ? (getCellBorderWidth(getTableOuterBorder(table, 'left')) + getCellBorderWidth(getTableOuterBorder(table, 'right'))) / 2
        : 0;
}

function getSeparatedRowHeightInset(table: ITable, row: number): number {
    const spacing = getTableCellSpacing(table, row);
    return spacing == null
        ? 0
        : spacing * 2
        + (getRowBorderInset(table.tableRows[row], 'borderTop') + getRowBorderInset(table.tableRows[row], 'borderBottom')) * 2;
}

function getRowMinimumHeight(table: ITable, index: number, traditional: boolean): number {
    const row = table.tableRows[index];
    const minimum = row.trHeight.val.v;
    if (getTableCellSpacing(table, index) == null && (!traditional || minimum <= 0)) {
        return minimum;
    }
    // Word's authored minimum excludes cell padding, borders and cell spacing;
    // content measurement already includes them, so apply them only here.
    return minimum + getRowVerticalInset(table, index, 'top') + getRowVerticalInset(table, index, 'bottom');
}

function applyTableOuterBorderSpacing(table: IDocumentSkeletonTable, config: ISectionBreakConfig, continuation = false, continues = false): void {
    const separated = hasTableCellSpacing(table.tableSource);
    if ((!isTraditionalDocumentCompatibility(config.documentCompatibilityPolicy) && !separated) || table.rows.length === 0) {
        return;
    }
    const firstRow = table.rows[0].rowSource;
    const lastRow = table.rows[table.rows.length - 1].rowSource;
    const spacing = getTableCellSpacing(table.tableSource, firstRow);
    const traditional = isTraditionalDocumentCompatibility(config.documentCompatibilityPolicy);
    // Word omits the outer top gap on continuation pages. Repeated headers
    // retain their complete first-row spacing.
    const suppressTopSpacing = traditional && continuation && !table.rows[0].isRepeatRow;
    const top = spacing == null
        ? getRowBorderInset(firstRow, 'borderTop', true)
        : (suppressTopSpacing ? 0 : spacing) + getRowBorderInset(firstRow, 'borderTop', true) * 2;
    const left = separated ? getCellBorderWidth(getTableOuterBorder(table.tableSource, 'left')) / 2 : 0;
    for (const row of table.rows) {
        row.top += top;
        for (const cell of row.cells) {
            cell.left += left;
        }
    }
    table.height += getTableBorderHeight(table.tableSource, firstRow, lastRow, traditional, suppressTopSpacing, traditional && continues);
    if (separated) {
        table.width += left + getCellBorderWidth(getTableOuterBorder(table.tableSource, 'right')) / 2;
    }
}

function getCellPagesLayoutHeight(
    pages: IDocumentSkeletonPage[],
    includeContinuations: boolean,
    viewModel: DocumentViewModel,
    rowSource?: ITableRow
): number {
    const measuredPages = includeContinuations ? pages : pages.slice(0, 1);
    return measuredPages.reduce((total, page) => total + getCellPageLayoutHeight(page, viewModel, rowSource), 0);
}

function getCellPageLayoutHeight(page: IDocumentSkeletonPage, viewModel: DocumentViewModel, rowSource?: ITableRow): number {
    if (
        rowSource?.trHeight.hRule === TableRowHeightRule.AT_LEAST &&
        rowSource.trHeight.val.v > 0 &&
        isStructurallyEmptyCellPage(page, viewModel)
    ) {
        return 0;
    }

    const { marginTop = 0, marginBottom = 0 } = page;
    if (page.cellTextDirection === 'tbRlV') {
        return page.height + page.marginLeft + page.marginRight;
    }
    return page.height + marginTop + marginBottom;
}

function isStructurallyEmptyCellPage(page: IDocumentSkeletonPage, viewModel: DocumentViewModel): boolean {
    if (
        (page.skeTables?.size ?? 0) > 0 ||
        (page.skeDrawings?.size ?? 0) > 0 ||
        (page.skeColumnGroups?.size ?? 0) > 0
    ) {
        return false;
    }

    const lines = page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines));
    // An authored blank paragraph with fixed/minimum leading is content, not a table terminator.
    if (lines.some((line) => {
        const style = viewModel.getParagraph(line.paragraphIndex)?.paragraphStyle;
        return (style?.spacingRule === SpacingRule.EXACT || style?.spacingRule === SpacingRule.AT_LEAST) &&
            (style.lineSpacing ?? 0) > 0;
    })) {
        return false;
    }
    const glyphs = lines.flatMap((line) =>
        line.divides.flatMap((divide) => divide.glyphGroup)
    );
    // Only one empty paragraph can be the cell terminator. Additional blank
    // paragraphs are authored vertical content, even with automatic line spacing.
    if (glyphs.length === 0 || glyphs.filter((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH).length > 1) {
        return false;
    }

    return glyphs.every(
        (glyph) =>
            glyph.streamType === DataStreamTreeTokenType.PARAGRAPH ||
            glyph.streamType === DataStreamTreeTokenType.SECTION_BREAK ||
            glyph.streamType === DataStreamTreeTokenType.DOCS_END
    );
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
    cellPageHeights?: number[];
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
    notes?: ReturnType<DocumentFootnoteLayout['createTablePagination']>;
    fromCurrentPage?: boolean;
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
    const tableSource = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (tableSource == null) {
        return null;
    }
    const table = resolveTableForLayout(ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource);

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
            tableWidth: Math.max(0, (precomputedTableSkeletons.get(ctx)?.get(tableNode)?.width ?? 0) - getTableHorizontalBorderInset(table)),
            remainHeight: availableHeight,
            repeatRows: getLeadingRepeatHeaderRows(table, rowNodes),
            repeatRowsHeight: 0,
            notes: ctx.footnoteLayout?.createTablePagination(curPage, sectionBreakConfig, availableHeight),
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
    const traditional = isTraditionalDocumentCompatibility(state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy());
    const { firstBorderHeight, minimumHeight, firstCellPageHeight, pageContentHeight } = getTableRowPageHeights(
        state.curPage,
        state.skeTables,
        state.table,
        state.rowIndex,
        state.createCache,
        traditional
    );
    const precomputedRow = precomputedTableSkeletons.get(state.ctx)?.get(state.tableNode)?.rows[state.rowIndex];
    // Pagination uses the same current-generation measurements as the synchronous
    // path. Only cells in rows that actually need splitting must be laid out again.
    const reusePrecomputedRow = state.cellPageHeights == null && canReusePrecomputedTableRow(state.curPage, state.createCache, rowSource, precomputedRow, firstBorderHeight, minimumHeight);
    if (!reusePrecomputedRow && cellNode != null && !isCoveredTableCell(cellConfig)) {
        state.pendingCellBuild ??= startSkeletonCellPagesBuild(
            state.ctx,
            state.viewModel,
            cellNode,
            state.sectionBreakConfig,
            state.table,
            state.rowIndex,
            state.columnIndex,
            firstCellPageHeight,
            pageContentHeight,
            state.cellPageHeights
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
                pageContentHeight,
                state.cellPageHeights
            )
            : state.pendingCellBuild.pages;
        state.pendingCellBuild = null;
        state.preparedCellPages.set(state.columnIndex, pages);
    }

    state.columnIndex++;
    if (!reusePrecomputedRow && state.columnIndex < rowNode.children.length) {
        return false;
    }

    const nextHeights = dealWithTableRow(
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
        state.preparedCellPages,
        state.cellPageHeights
    );
    if (nextHeights) {
        state.cellPageHeights = nextHeights;
        state.columnIndex = 0;
        state.preparedCellPages = new Map();
        return false;
    }
    state.rowIndex++;
    state.cellPageHeights = undefined;
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
    tableNode: DataStreamTreeNode,
    availableHeight: number,
    result: ISlicedTableSkeletonParams
): void {
    let cache = precomputedSlicedTableSkeletons.get(ctx);
    if (cache == null) {
        cache = new WeakMap();
        precomputedSlicedTableSkeletons.set(ctx, cache);
    }
    cache.set(tableNode, { availableHeight, result });
}

function _finishTableSkeletonsBuild(state: ISlicedTableSkeletonBuildState): void {
    updateTableSkeletonsPosition(state.createCache, state.curPage, state.skeTables, state.table, state.sectionBreakConfig);
    state.skeTables.forEach((table, index) => applyTableOuterBorderSpacing(table, state.sectionBreakConfig, index > 0, index < state.skeTables.length - 1));
    const policy =
        state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    state.result = {
        skeTables: state.skeTables,
        fromCurrentPage:
            state.createCache.fromCurrentPage !== false &&
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
    const precomputedSliced = precomputedSlicedTableSkeletons.get(ctx)?.get(tableNode);
    if (
        precomputedSliced != null &&
        Math.abs(precomputedSliced.availableHeight - availableHeight) < 0.01
    ) {
        precomputedSlicedTableSkeletons.get(ctx)?.delete(tableNode);
        precomputedTableSkeletons.get(ctx)?.delete(tableNode);
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

    const tableSource = viewModel.getTableByStartIndex(startIndex)?.tableSource;
    if (tableSource == null) {
        console.warn(`Table not found when creating sliced table skeletons at index ${startIndex}`);
        return {
            skeTables,
            fromCurrentPage: false,
        };
    }
    const table = resolveTableForLayout(ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource);

    const repeatRows = getLeadingRepeatHeaderRows(table, rowNodes);
    const precomputedTable = precomputedTableSkeletons.get(ctx)?.get(tableNode);
    precomputedTableSkeletons.get(ctx)?.delete(tableNode);
    const curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);

    const createCache: ICreateTableCache = {
        rowTop: 0,
        tableWidth: Math.max(0, (precomputedTable?.width ?? 0) - getTableHorizontalBorderInset(table)),
        remainHeight: availableHeight,
        repeatRows,
        repeatRowsHeight: 0,
        notes: ctx.footnoteLayout?.createTablePagination(curPage, sectionBreakConfig, availableHeight),
    };

    skeTables.push(curTableSkeleton);

    for (const rowNode of rowNodes) {
        const row = rowNodes.indexOf(rowNode);

        let cellPageHeights: number[] | undefined;
        do {
            cellPageHeights = dealWithTableRow(
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
                precomputedTable?.rows[row],
                undefined,
                cellPageHeights
            );
        } while (cellPageHeights);
    }

    updateTableSkeletonsPosition(createCache, curPage, skeTables, table, sectionBreakConfig);
    skeTables.forEach((table, index) => applyTableOuterBorderSpacing(table, sectionBreakConfig, index > 0, index < skeTables.length - 1));

    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const fromCurrentPage =
        createCache.fromCurrentPage !== false &&
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
    table: ITable,
    sectionBreakConfig: ISectionBreakConfig
) {
    const { pageWidth, marginLeft = 0, marginRight = 0 } = curPage;
    const { tableWidth } = cache;
    const tableLeft = getTableLeft(
        pageWidth - marginLeft - marginRight,
        tableWidth + getTableHorizontalBorderInset(table),
        table.align,
        table.indent,
        shouldAllowImportedTableMarginOverflow(sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy(), table)
    );
    const rowFragments = new Map<number, number>();
    for (const part of skeTables) {
        for (const row of part.rows) {
            if (!row.isRepeatRow) {
                rowFragments.set(row.index, (rowFragments.get(row.index) ?? 0) + 1);
            }
        }
    }

    let tableIndex = 0;
    for (const tableSkeleton of skeTables) {
        applyMergedCellSpanHeights(tableSkeleton);
        // Pagination restores the visible merged height after aligning each row.
        // Re-align only merged masters; actual split-row content stays top-aligned.
        for (const row of tableSkeleton.rows) {
            _verticalAlignInCell(row, table.tableRows[row.index], (rowFragments.get(row.index) ?? 0) > 1, true);
        }

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

interface ITableRowPageHeights {
    firstBorderHeight: number;
    minimumHeight: number;
    firstCellPageHeight: number;
    pageContentHeight: number;
    availableHeight: number;
    canRowSplit: boolean;
    suppressContinuationTopSpacing: boolean;
}

function getTableRowPageHeights(
    curPage: IDocumentSkeletonPage,
    skeTables: IDocumentSkeletonTable[],
    table: ITable,
    row: number,
    cache: ICreateTableCache,
    traditional: boolean,
    isRepeatRow = false
): ITableRowPageHeights {
    const rowSource = table.tableRows[row];
    const currentTable = getCurTableSkeleton(skeTables);
    const firstRowSource = currentTable.rows[0]?.rowSource ?? rowSource;
    const suppressContinuationTopSpacing = traditional && cache.repeatRows.length === 0;
    const canRowSplit = rowSource.cantSplit !== BooleanNumber.TRUE && rowSource.trHeight.hRule !== TableRowHeightRule.EXACT;
    const hasFollowingRows = row < table.tableRows.length - 1;
    // Trial split rows can use the bottom gap that disappears at a page break.
    // Whole final rows still reserve the complete frame when they are appended.
    const firstBorderHeight = getTableBorderHeight(table, firstRowSource, rowSource, traditional, suppressContinuationTopSpacing && skeTables.length > 1, traditional && (canRowSplit || hasFollowingRows));
    const nextBorderHeight = getTableBorderHeight(table, rowSource, rowSource, traditional, suppressContinuationTopSpacing);
    const pageContentHeight = getAvailableHeight(curPage, cache, traditional && !isRepeatRow && row >= cache.repeatRows.length) - nextBorderHeight;
    const newRowContinuesTable = skeTables.length > 1 || currentTable.rows.length > 0;
    const newRowBorderHeight = getTableBorderHeight(table, rowSource, rowSource, traditional, suppressContinuationTopSpacing && newRowContinuesTable, traditional && hasFollowingRows);
    const availableHeight = getAvailableHeight(curPage, cache, true) - newRowBorderHeight;
    const minimumHeight = traditional && rowSource.trHeight.hRule === TableRowHeightRule.AT_LEAST ? getRowMinimumHeight(table, row, true) : 0;
    // An oversized minimum must not prevent a row from splitting across pages.
    const needOpenNewTable = cache.remainHeight <= firstBorderHeight ||
        (minimumHeight <= availableHeight && minimumHeight + firstBorderHeight > cache.remainHeight);
    const firstCellPageHeight = canRowSplit && !needOpenNewTable ? cache.remainHeight - firstBorderHeight : availableHeight;
    return { firstBorderHeight, minimumHeight, firstCellPageHeight, pageContentHeight, availableHeight, canRowSplit, suppressContinuationTopSpacing };
}

function canReusePrecomputedTableRow(
    curPage: IDocumentSkeletonPage,
    cache: ICreateTableCache,
    rowSource: ITableRow,
    precomputedRow?: IDocumentSkeletonRow,
    borderHeight = 0,
    minimumHeight = 0
): precomputedRow is IDocumentSkeletonRow {
    const canRowSplit = rowSource.cantSplit !== BooleanNumber.TRUE && rowSource.trHeight.hRule !== TableRowHeightRule.EXACT;
    return precomputedRow != null &&
        precomputedRow.parent?.hasPageBreak !== true &&
        precomputedRow.height + borderHeight <= getAvailableHeight(curPage, cache, false) &&
        (cache.remainHeight <= 0 || !canRowSplit || precomputedRow.height + borderHeight <= cache.remainHeight ||
            Math.max(minimumHeight, getRowFirstLineHeight(precomputedRow)) + borderHeight > cache.remainHeight);
}

function getRowFirstLineHeight(row: IDocumentSkeletonRow): number {
    let minimum = Number.POSITIVE_INFINITY;
    for (const [index, cell] of row.cells.entries()) {
        if (isCoveredTableCell(row.rowSource.tableCells[index])) {
            continue;
        }
        const line = cell.sections[0]?.columns[0]?.lines[0];
        if (!line || cell.cellTextDirection || cell.skeTables.size > 0 || cell.skeDrawings.size > 0 || cell.skeColumnGroups.size > 0) {
            return 0;
        }
        minimum = Math.min(minimum, cell.marginTop + line.top + line.lineHeight + cell.marginBottom);
    }
    // If no first line fits, keep the original row intact on the next page.
    // Splitting it first can move both fragments there and add a spurious border.
    return Number.isFinite(minimum) ? minimum : 0;
}

function reconcileTableRowFragments(
    rowSkeletons: IDocumentSkeletonRow[],
    rowHeights: number[],
    rowSource: ITableRow,
    viewModel: DocumentViewModel,
    lastCellPageIndexes: Map<number, number>,
    availableHeight: number,
    canRowSplit: boolean,
    traditional: boolean,
    precomputedRow?: IDocumentSkeletonRow
): void {
    if (traditional && rowSkeletons.length > 1 && precomputedRow &&
        precomputedRow.parent?.hasPageBreak !== true &&
        precomputedRow.height <= availableHeight &&
        rowSkeletons[0].cells.some((cell, column) =>
            !isCoveredTableCell(rowSource.tableCells[column]) &&
            cell.height === 0 && (precomputedRow.cells[column]?.height ?? 0) > 0
        )) {
        // A paragraph constraint can move all text in one cell off the first
        // fragment. Keep its sibling cells with it when the whole row fits.
        rowSkeletons.splice(0, rowSkeletons.length, precomputedRow);
        rowHeights.splice(0, rowHeights.length, precomputedRow.height);
    }

    if (traditional && canRowSplit && rowSkeletons.length > 1) {
        for (let index = 0; index < rowSkeletons.length - 1; index++) {
            const fragment = rowSkeletons[index];
            let trimmed = false;
            fragment.cells.forEach((cell, column) => {
                if (lastCellPageIndexes.get(column) === index && getCellPageLayoutHeight(cell, viewModel, rowSource) > availableHeight && trimCompletedCellAfterSpacing(cell)) {
                    trimmed = true;
                }
            });
            if (trimmed) {
                rowHeights[index] = fragment.cells.reduce((height, cell, column) => isCoveredTableCell(rowSource.tableCells[column])
                    ? height
                    : Math.max(height, getCellPageLayoutHeight(cell, viewModel, rowSource)), 0);
            }
        }
    }
}

function sizeTableRowFragments(
    rowSkeletons: IDocumentSkeletonRow[],
    rowHeights: number[],
    table: ITable,
    row: number,
    cache: ICreateTableCache,
    availableHeight: number,
    pageContentHeight: number,
    traditional: boolean
): void {
    const { hRule, val } = table.tableRows[row].trHeight;
    if (hRule === TableRowHeightRule.AT_LEAST && rowHeights.length > 0) {
        // Word also reserves the row minimum on its final continuation. Earlier
        // fragments can use the space left on their page without padding it again.
        const contentHeight = traditional
            ? rowHeights[rowHeights.length - 1]
            : rowHeights.reduce((total, height) => total + height, 0);
        rowHeights[rowHeights.length - 1] += Math.max(0, getRowMinimumHeight(table, row, traditional) - contentHeight);
    }

    for (const rowSke of rowSkeletons) {
        // Update row height.
        const rowIndex = rowSkeletons.indexOf(rowSke);

        if (hRule === TableRowHeightRule.EXACT) {
            rowHeights[rowIndex] = val.v + getSeparatedRowHeightInset(table, row);
        }

        rowHeights[rowIndex] = Math.min(rowHeights[rowIndex], rowIndex === 0 ? availableHeight : pageContentHeight);

        let left = getOmittedGridWidth(table, rowSke.index, 'before');
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

        cache.tableWidth = Math.max(cache.tableWidth, left + getOmittedGridWidth(table, rowSke.index, 'after'));

        // Set row Skeleton height.
        rowSke.height = rowHeights[rowIndex];
    }
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
    preparedCellPages?: Map<number, IDocumentSkeletonPage[]>,
    cellPageHeights?: readonly number[]
): number[] | undefined {
    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const { children: cellNodes, startIndex, endIndex } = rowNode;
    const rowSource = table.tableRows[row];
    const traditional = isTraditionalDocumentCompatibility(documentCompatibilityPolicy);
    const { firstBorderHeight, minimumHeight, firstCellPageHeight, pageContentHeight, availableHeight, canRowSplit, suppressContinuationTopSpacing } =
        getTableRowPageHeights(curPage, skeTables, table, row, cache, traditional, isRepeatRow);
    const precomputedRowFits = !isRepeatRow && cellPageHeights == null && canReusePrecomputedTableRow(curPage, cache, rowSource, precomputedRow, firstBorderHeight, minimumHeight);
    const rowSkeletons: IDocumentSkeletonRow[] = precomputedRowFits ? [precomputedRow] : [];
    let curTableSkeleton = getCurTableSkeleton(skeTables);

    const rowHeights = precomputedRowFits ? [precomputedRow.height] : [0];
    const forcedPageBreakRows = new WeakSet<IDocumentSkeletonRow>();
    const lastCellPageIndexes = new Map<number, number>();

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
                firstCellPageHeight,
                pageContentHeight,
                cellPageHeights
            );
        lastCellPageIndexes.set(col, cellPageSkeletons.length - 1);
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
            const cellPageHeight = getCellPageLayoutHeight(cellPageSkeleton, viewModel, rowSource);
            const pageIndex = cellPageSkeletons.indexOf(cellPageSkeleton);
            const rowSke = rowSkeletons[pageIndex];

            // A rendered page boundary inside a cell is a structural split, even when an
            // ancestor cell is measured with infinite height. Propagating that boundary
            // through each enclosing table keeps deeply nested DOCX tables on the same
            // physical pages without persisting any format-specific layout side channel.
            // A natural continuation also starts a page when the row is measured
            // against finite space; nested infinite-height measurement may combine it.
            if (pageIndex > 0 && (cellPageSkeleton.isExplicitPageBreak === true ||
                (traditional && Number.isFinite(cache.remainHeight) && cellPageSkeleton.isNaturalPageOverflow === true))) {
                forcedPageBreakRows.add(rowSke);
            }

            cellPageSkeleton.parent = rowSke;
            rowSke.cells[col] = cellPageSkeleton;
            rowHeights[pageIndex] = Math.max(rowHeights[pageIndex], cellPageHeight);
        }
    }

    reconcileTableRowFragments(rowSkeletons, rowHeights, rowSource, viewModel, lastCellPageIndexes, availableHeight, canRowSplit, traditional, precomputedRow);
    sizeTableRowFragments(rowSkeletons, rowHeights, table, row, cache, availableHeight, pageContentHeight, traditional);

    if (!isRepeatRow && cache.notes) {
        let nextHeights: number[] | undefined;
        if (canRowSplit) {
            nextHeights = cache.notes.measureRow(curTableSkeleton, rowSkeletons, cellPageHeights);
        } else if (cache.notes.renumberWholeRow(curTableSkeleton, rowSkeletons, cache.remainHeight)) {
            nextHeights = [];
        }
        if (nextHeights) {
            const lists = ctx.skeletonResourceReference.skeListLevel;
            if (lists) {
                rollbackListCache(lists, rowNode);
            }
            return nextHeights;
        }
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
        const suppressBottomSpacing = traditional && (rowSkeletons.length > 0 || row < table.tableRows.length - 1);
        const borderHeight = getTableBorderHeight(table, curTableSkeleton.rows[0]?.rowSource ?? rowSource, rowSource, traditional, suppressContinuationTopSpacing && skeTables.length > 1, suppressBottomSpacing);
        const rowOverflowHeight = rowSkeleton.height + borderHeight - cache.remainHeight;
        const hasTrailingParagraphSpace = rowSkeleton.cells.some((cell) => getCellTrailingParagraphSpacing(cell) > 0);
        const rowOverflowTolerance = traditional && hasTrailingParagraphSpace ? 1e-6 : documentCompatibilityPolicy.table.rowOverflowTolerance;
        const geometryOverflow =
            cache.remainHeight <= 0 ||
            forcedPageBreakRows.has(rowSkeleton) ||
            rowOverflowHeight > rowOverflowTolerance;
        let remainingWithNotes = geometryOverflow ? undefined : cache.notes?.append(curTableSkeleton, rowSkeleton);
        const shouldOpenNewTable = geometryOverflow || (cache.notes != null && remainingWithNotes == null);

        if (shouldOpenNewTable) {
            cache.notes?.nextPage();
            if ((cache.notes || hasTrailingParagraphSpace) && skeTables.length === 1 && curTableSkeleton.rows.length === 0) {
                cache.fromCurrentPage = false;
            }
            cache.remainHeight = getAvailableHeight(curPage, cache, row !== 0 && (traditional || rowSkeleton.index !== lastRow?.index));
            cache.rowTop = 0;

            if (curTableSkeleton.rows.length > 0) {
                curTableSkeleton = getNullTableSkeleton(startIndex, endIndex, table);
                skeTables.push(curTableSkeleton);

                // Word repeats leading headers even when the body row continues across pages.
                if (cache.repeatRows.length > 0 && isRepeatRow === false && row >= cache.repeatRows.length && (traditional || rowSkeleton.index !== lastRow.index)) {
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
            remainingWithNotes = cache.notes?.append(getCurTableSkeleton(skeTables), rowSkeleton);
            while (remainingWithNotes == null && cache.notes?.hasContinuation()) {
                cache.notes.nextPage();
                remainingWithNotes = cache.notes.append(getCurTableSkeleton(skeTables), rowSkeleton);
            }
        }

        curTableSkeleton = getCurTableSkeleton(skeTables);

        rowSkeleton.top = cache.rowTop;
        curTableSkeleton.height += rowSkeleton.height;

        curTableSkeleton.rows.push(rowSkeleton);
        rowSkeleton.parent = curTableSkeleton;
        cache.remainHeight = remainingWithNotes ?? cache.remainHeight - rowSkeleton.height;

        cache.rowTop += rowSkeleton.height;
    }
}

function getCellTrailingParagraphSpacing(cell: IDocumentSkeletonPage): number {
    const section = cell.sections[cell.sections.length - 1];
    const column = section?.columns[section.columns.length - 1];
    const line = column?.lines[column.lines.length - 1];
    const spacing = Math.max(0, line?.spaceBelowApply ?? 0);
    return section && line && Math.abs(cell.height - section.top - line.top - line.lineHeight - spacing) < 1e-6 ? spacing : 0;
}

function trimCompletedCellAfterSpacing(cell: IDocumentSkeletonPage): boolean {
    if (cell.skeTables.size > 0 || cell.skeDrawings.size > 0 || (cell.skeColumnGroups?.size ?? 0) > 0) {
        return false;
    }
    const section = cell.sections[cell.sections.length - 1];
    const column = section?.columns[section.columns.length - 1];
    const line = column?.lines[column.lines.length - 1];
    const spacing = getCellTrailingParagraphSpacing(cell);
    const capacity = cell.pageHeight - cell.marginTop - cell.marginBottom;
    if (!section || !line || spacing === 0 || !Number.isFinite(capacity) || cell.height <= capacity) {
        return false;
    }
    const contentBottom = section.top + line.top + line.lineHeight;
    const hasVisibleText = column!.lines.some((candidate) => candidate.paragraphIndex === line.paragraphIndex &&
        candidate.divides.some((divide) => divide.glyphGroup.some((glyph) => glyph.width > 0 && glyph.raw.trim().length > 0)));
    // Only remove measured trailing whitespace. Empty paragraphs, overflowing
    // text and embedded content must retain their complete layout extent.
    if (!hasVisibleText || contentBottom > capacity + 1e-6 || Math.abs(cell.height - contentBottom - spacing) > 1e-6) {
        return false;
    }
    cell.height = Math.max(contentBottom, capacity);
    return true;
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
    isSplitRow = false,
    mergedOnly = false
) {
    for (let i = 0; i < rowSource.tableCells.length; i++) {
        const cellConfig = rowSource.tableCells[i];
        if (mergedOnly && (cellConfig.rowSpan ?? 1) <= 1) {
            continue;
        }

        const cellPageSkeleton = rowSkeleton.cells[i];

        if (cellPageSkeleton == null) {
            continue;
        }

        const { vAlign = VerticalAlignmentType.CONTENT_ALIGNMENT_UNSPECIFIED } = cellConfig;
        const { originMarginTop, originMarginBottom } = cellPageSkeleton;
        const isVerticalCell = cellPageSkeleton.cellTextDirection === 'tbRlV';
        const pageHeight = isVerticalCell ? cellPageSkeleton.pageWidth : cellPageSkeleton.pageHeight;
        const height = isVerticalCell ? cellPageSkeleton.width : cellPageSkeleton.height;

        let marginTop = originMarginTop;

        // Word applies cell vertical alignment to an unsplit row as a whole. Centering or bottom-aligning
        // every continuation fragment independently creates large blank areas and clipped text.
        if (!isSplitRow) {
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
        }

        marginTop = Math.max(originMarginTop, marginTop);

        // Cell margins also carry text alignment. Page/margin anchors must stay fixed when that offset changes.
        const alignmentDelta = marginTop - cellPageSkeleton.marginTop;
        cellPageSkeleton.skeDrawings?.forEach((drawing) => {
            const { layoutType, docTransform } = drawing.drawingOrigin;
            const relativeFrom = docTransform.positionV.relativeFrom;
            if (
                layoutType !== PositionedObjectLayoutType.INLINE &&
                (relativeFrom === ObjectRelativeFromV.PAGE || relativeFrom === ObjectRelativeFromV.MARGIN)
            ) {
                drawing.aTop -= alignmentDelta;
            }
        });
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

function resolveMergedRowHeights(tableSkeleton: IDocumentSkeletonTable): boolean {
    const rows = tableSkeleton.rows;
    const sources = tableSkeleton.tableSource.tableRows;
    if (!sources.some((row) => row.tableCells.some((cell) => (cell.rowSpan ?? 1) > 1))) {
        return false;
    }

    // A merged cell constrains the combined height of its rows, not just the first row.
    // First measure independent cells and explicit row minima, then satisfy each span.
    const cellHeight = (cell: IDocumentSkeletonPage) =>
        cell.height + (cell.originMarginTop ?? 0) + (cell.originMarginBottom ?? 0);
    for (const row of rows) {
        const source = sources[row.index];
        const { hRule, val } = source.trHeight;
        const contentHeight = row.cells.reduce((height, cell, column) =>
            (source.tableCells[column].rowSpan ?? 1) > 1 || isCoveredTableCell(source.tableCells[column])
                ? height
                : Math.max(height, cellHeight(cell)), 0);
        row.height = contentHeight;
        if (hRule === TableRowHeightRule.EXACT) {
            row.height = val.v + getSeparatedRowHeightInset(tableSkeleton.tableSource, row.index);
        } else if (hRule === TableRowHeightRule.AT_LEAST) {
            row.height = Math.max(contentHeight, getRowMinimumHeight(tableSkeleton.tableSource, row.index, true));
        }
    }

    for (const row of rows) {
        sources[row.index].tableCells.forEach((source, column) => {
            if ((source.rowSpan ?? 1) <= 1) {
                return;
            }
            const span = rows.slice(row.index, row.index + source.rowSpan!);
            const extraHeight = cellHeight(row.cells[column]) - span.reduce((height, item) => height + item.height, 0);
            const expandable = span.filter((item) => sources[item.index].trHeight.hRule !== TableRowHeightRule.EXACT);
            if (extraHeight > 0 && expandable.length > 0) {
                // Extending a vertical merge must not move boundaries between its
                // preceding rows. Word puts the deficit into the final flexible row.
                expandable[expandable.length - 1].height += extraHeight;
            }
        });
    }

    let top = 0;
    for (const row of rows) {
        row.top = top;
        top += row.height;
        for (const cell of row.cells) {
            cell.pageHeight = row.height;
        }
    }
    tableSkeleton.height = top;
    return true;
}

function createMergedAwareNullCellPage(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    table: ITable,
    row: number,
    col: number,
    rowSkeleton: IDocumentSkeletonRow
): IDocumentSkeletonPage {
    const { page: cellSkeleton, verticalCellWidth } = createNullCellPage(
        ctx,
        sectionBreakConfig,
        table,
        row,
        col
    );
    if (verticalCellWidth != null) {
        cellSkeleton.pageHeight = cellSkeleton.pageWidth;
        cellSkeleton.pageWidth = verticalCellWidth;
        cellSkeleton.cellTextDirection = 'tbRlV';
    }

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

function getTableAvailableWidth(page: IDocumentSkeletonPage): number {
    return Math.max(0, page.pageWidth - (page.marginLeft ?? 0) - (page.marginRight ?? 0));
}

function resolveTableForLayout(
    ctx: ILayoutContext,
    page: IDocumentSkeletonPage,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    config: ISectionBreakConfig,
    source: ITable
): ITable {
    const table = resolveTableLayoutColumns(
        source,
        getTableAvailableWidth(page),
        isTraditionalDocumentCompatibility(config.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()),
        viewModel.getSnapshot?.()
    );
    const measured = precomputedTableSkeletons.get(ctx)?.get(tableNode);
    if (measured) {
        return { ...table, tableColumns: measured.tableSource.tableColumns };
    }
    return resolveTableAutoFitColumns(ctx, viewModel, tableNode, config, table, getTableAvailableWidth(page));
}

export function resolveTableLayoutColumns(
    source: ITable,
    availableWidth: number,
    traditional = false,
    document?: Partial<Pick<IDocumentData, 'styles' | 'documentStyle'>>
): ITable {
    let table = resolveTableBorderDefaults(resolveTableCellSpacing(source, document));
    const specified = table.size?.type === TableSizeType.SPECIFIED;
    let preferredWidth = specified
        ? table.size.width.u === NumberUnitType.PERCENT ? availableWidth * table.size.width.v / 100 : table.size.width.v
        : availableWidth;
    if (traditional && specified && table.size.width.u === NumberUnitType.PERCENT && table.legacyIndentAdjustment != null) {
        // Legacy Word percentage widths align cell text to the page margins;
        // the outer cell margins extend beyond that text width.
        const cells = table.tableRows[0]?.tableCells;
        const lastCell = cells?.[cells.length - 1];
        const endMargin = lastCell?.margin?.end?.v ?? table.cellMargin?.end?.v ?? 7.2;
        preferredWidth += Math.max(0, table.legacyIndentAdjustment.v) + Math.max(0, endMargin);
    }
    if (!Number.isFinite(preferredWidth) || preferredWidth <= 0) {
        return table;
    }
    preferredWidth -= getTableHorizontalBorderInset(table);
    if (table.tableColumns?.some((column) => !Number.isFinite(column.size?.width?.v) || column.size.width.v <= 0)) {
        // DOCX permits gridCol without w:w. Prefer cell widths before sharing
        // the unallocated table width among the remaining grid columns.
        const widths = table.tableColumns.map((column) => column.size?.width?.v > 0 ? column.size.width.v : 0);
        for (const row of table.tableRows) {
            let gridColumn = row.gridBefore ?? 0;
            for (const cell of row.tableCells) {
                const span = Math.max(0, cell.columnSpan ?? 1);
                const width = cell.size?.width;
                const cellWidth = width?.u === NumberUnitType.PERCENT ? preferredWidth * width.v / 100
                    // Imported pct values retain the source fiftieth-percent
                    // value in the same pixel conversion used for dxa widths.
                    : cell.tcWidthType === 'pct' ? preferredWidth * (width?.v ?? 0) * 15 / 5000 : width?.v ?? 0;
                if (Number.isFinite(cellWidth) && cellWidth > 0 && span > 0) {
                    const end = Math.min(widths.length, gridColumn + span);
                    const missing = widths.slice(gridColumn, end).filter((value) => value === 0).length;
                    const known = widths.slice(gridColumn, end).reduce((sum, value) => sum + value, 0);
                    const remaining = cellWidth - known;
                    if (missing > 0 && remaining > 0) {
                        for (let column = gridColumn; column < end; column++) {
                            widths[column] ||= remaining / missing;
                        }
                    }
                }
                gridColumn += span;
            }
        }
        const missing = widths.filter((width) => width === 0).length;
        const known = widths.reduce((sum, width) => sum + width, 0);
        const fallback = Math.max(1, preferredWidth - known) / Math.max(1, missing);
        table = {
            ...table,
            tableColumns: table.tableColumns.map((column, index) => ({ ...column, size: { ...column.size, type: TableSizeType.SPECIFIED, width: { ...column.size?.width, v: widths[index] || fallback } } })),
        };
    }
    if (!specified || !table.tableColumns?.length) {
        return table;
    }
    const gridWidth = table.tableColumns.reduce((sum, column) => sum + column.size.width.v, 0);
    if (!Number.isFinite(preferredWidth) || preferredWidth <= 0 || gridWidth <= 0 || Math.abs(preferredWidth - gridWidth) < 0.01) {
        return table;
    }

    const scale = preferredWidth / gridWidth;
    return {
        ...table,
        tableColumns: table.tableColumns.map((column) => ({
            ...column,
            size: {
                ...column.size,
                width: {
                    ...column.size.width,
                    v: column.size.width.v * scale,
                },
            },
        })),
    };
}

function resolveTableBorderDefaults(table: ITable): ITable {
    if (!table.borderDefaults && !table.tableRows.some((row) => row.borderDefaults)) {
        return table;
    }
    const columnCount = table.tableRows.reduce((maximum, row) => Math.max(
        maximum,
        (row.gridBefore ?? 0) + (row.gridAfter ?? 0) + row.tableCells.reduce((sum, cell) => sum + Math.max(0, cell.columnSpan ?? 1), 0)
    ), table.tableColumns.length);
    let changed = false;
    const tableRows = table.tableRows.map((row, rowIndex) => {
        const defaults = { ...table.borderDefaults, ...row.borderDefaults };
        let column = row.gridBefore ?? 0;
        let rowChanged = false;
        const tableCells = row.tableCells.map((cell, cellIndex) => {
            let span = Math.max(0, cell.columnSpan ?? 1);
            if (isCoveredTableCell(cell) && cell.rowSpan === 0) {
                const master = findMergedMasterCell(table, rowIndex, cellIndex);
                if (master && master.row < rowIndex) {
                    span = Math.max(1, table.tableRows[master.row].tableCells[master.col].columnSpan ?? 1);
                }
            }
            const start = column;
            column += span;
            if (isCoveredTableCell(cell) || (cell.borderTop && cell.borderBottom && cell.borderLeft && cell.borderRight)) {
                return cell;
            }
            const borders = {
                borderTop: rowIndex === 0 ? defaults.top : defaults.insideHorizontal,
                borderBottom: rowIndex + 1 === table.tableRows.length ? defaults.bottom : defaults.insideHorizontal,
                borderLeft: start === 0 ? defaults.left : defaults.insideVertical,
                borderRight: column >= columnCount ? defaults.right : defaults.insideVertical,
            };
            let resolved = cell;
            for (const key of ['borderTop', 'borderBottom', 'borderLeft', 'borderRight'] as const) {
                const border = borders[key];
                if (cell[key] || !border) {
                    continue;
                }
                let value: ITableCellBorder = border;
                if (key === 'borderTop' && rowIndex > 0) {
                    value = { ...border, tableTopBorder: defaults.top ?? { color: border.color, width: { v: 0 } } };
                } else if (key === 'borderBottom' && rowIndex + 1 < table.tableRows.length) {
                    value = { ...border, tableBottomBorder: defaults.bottom ?? { color: border.color, width: { v: 0 } } };
                }
                resolved = { ...resolved, [key]: value };
            }
            rowChanged ||= resolved !== cell;
            return resolved;
        });
        changed ||= rowChanged;
        return rowChanged ? { ...row, tableCells } : row;
    });
    return changed ? { ...table, tableRows } : table;
}

export function getTableLeft(
    pageWidth: number,
    tableWidth: number,
    align: TableAlignmentType,
    indent: INumberUnit = { v: 0 },
    allowMarginOverflow = false
) {
    switch (align) {
        case TableAlignmentType.START: {
            return indent.v;
        }
        case TableAlignmentType.END: {
            return allowMarginOverflow ? pageWidth - tableWidth : Math.max(0, pageWidth - tableWidth);
        }
        case TableAlignmentType.CENTER: {
            return allowMarginOverflow ? (pageWidth - tableWidth) / 2 : Math.max(0, (pageWidth - tableWidth) / 2);
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
