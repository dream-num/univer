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

import type { IDocumentBody, ITable, ITableCellBorder, ITableRow, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonHeaderFooter,
    IDocumentSkeletonPage,
    ISkeletonResourceReference,
} from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import {
    BooleanNumber,
    GridType,
    PageOrientType,
    PositionedObjectLayoutType,
    TableTextWrapType,
} from '@univerjs/core';
import { BreakType, DocumentSkeletonPageType } from '../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy, isTraditionalDocumentCompatibility } from '../../document-compatibility';
import { dealWithSection } from '../block/section';
import {
    getLastLine,
    resetContext,
    updateBlockIndex,
    updateInlineDrawingCoordsAndBorder,
} from '../tools';
import { createSkeletonSection } from './section';

function getHeaderFooterMaxHeight(pageHeight: number) {
    return (pageHeight - 100) / 2;
}

// New data structure framework
// Determine odd and even page numbers
export function createSkeletonPage(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    pageNumber = 1,
    breakType = BreakType.SECTION,
    pageContext?: Pick<IDocumentSkeletonPage, 'type' | 'segmentId'>
): IDocumentSkeletonPage {
    let page: IDocumentSkeletonPage;
    if (sectionBreakConfig.cellTableId) {
        page = _getNullPage(DocumentSkeletonPageType.CELL, sectionBreakConfig.cellTableId);
    } else if (ctx.noteSegmentId) {
        page = _getNullPage(DocumentSkeletonPageType.NOTE, ctx.noteSegmentId);
    } else {
        page = _getNullPage(pageContext?.type, pageContext?.segmentId);
    }

    const {
        sectionId,
        pageNumberStart = 1,
        pageSize = { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY },
        pageOrient = PageOrientType.PORTRAIT,
        headerIds = {},
        footerIds = {},
        useFirstPageHeaderFooter,
        evenAndOddHeaders,
        footerTreeMap,
        headerTreeMap,
        columnProperties = [],
        columnSeparatorType,
        marginTop = 0,
        marginBottom = 0,
        marginHeader: _marginHeader = 0,
        marginFooter: _marginFooter = 0,
        marginLeft = 0,
        marginRight = 0,
        renderConfig = {},
    } = sectionBreakConfig;

    const { skeHeaders, skeFooters } = skeletonResourceReference;

    const { width: pageWidth = Number.POSITIVE_INFINITY, height: configuredHeight = Number.POSITIVE_INFINITY } = pageSize;
    const pageHeight = sectionBreakConfig.cellPageHeights?.[pageNumber - 1] ?? configuredHeight;

    page.pageNumber = pageNumber;
    page.sectionId = sectionId;
    page.pageNumberStart = pageNumberStart;
    page.renderConfig = renderConfig;
    page.marginLeft = marginLeft;
    page.marginRight = marginRight;
    page.breakType = breakType;
    page.pageWidth = pageWidth;
    page.width = 0;
    page.pageHeight = pageHeight;
    page.height = 0;
    page.pageOrient = pageOrient;

    const { defaultHeaderId, evenPageHeaderId, firstPageHeaderId } = headerIds;
    const { defaultFooterId, evenPageFooterId, firstPageFooterId } = footerIds;

    let headerId = defaultHeaderId ?? '';
    let footerId = defaultFooterId ?? '';
    if (pageNumber === pageNumberStart && useFirstPageHeaderFooter === BooleanNumber.TRUE) {
        headerId = firstPageHeaderId ?? '';
        footerId = firstPageFooterId ?? '';
    } else if (pageNumber % 2 === 0 && evenAndOddHeaders === BooleanNumber.TRUE) {
        headerId = evenPageHeaderId ?? '';
        footerId = evenPageFooterId ?? '';
    }

    let header: Nullable<IDocumentSkeletonHeaderFooter>;
    let footer: Nullable<IDocumentSkeletonHeaderFooter>;
    if (headerId) {
        if (skeHeaders.get(headerId)?.has(pageWidth)) {
            header = skeHeaders.get(headerId)?.get(pageWidth);
        } else if (headerTreeMap && headerTreeMap.has(headerId)) {
            header = _createSkeletonHeaderFooter(
                ctx,
                headerTreeMap.get(headerId)!,
                sectionBreakConfig,
                skeletonResourceReference,
                headerId,
                true
            );

            skeHeaders.set(headerId, new Map([[pageWidth, header]]));
        }
        page.headerId = headerId;
    }

    if (footerId) {
        if (skeFooters.get(footerId)?.has(pageWidth)) {
            footer = skeFooters.get(footerId)?.get(pageWidth);
        } else if (footerTreeMap && footerTreeMap.has(footerId)) {
            footer = _createSkeletonHeaderFooter(
                ctx,
                footerTreeMap.get(footerId)!,
                sectionBreakConfig,
                skeletonResourceReference,
                footerId,
                false
            );

            skeFooters.set(footerId, new Map([[pageWidth, footer]]));
        }
        page.footerId = footerId;
    }

    page.originMarginTop = marginTop;
    page.originMarginBottom = marginBottom;
    page.marginTop = _getVerticalMargin(marginTop, header);
    page.marginBottom = _getVerticalMargin(marginBottom, footer);

    const sections = page.sections;
    const lastSection = sections[sections.length - 1];
    const { marginTop: curPageMT, marginBottom: curPageMB, marginLeft: curPageML, marginRight: curPageMR } = page;
    const pageContentWidth = pageWidth - curPageML - curPageMR;
    const pageContentHeight = pageHeight - curPageMT - curPageMB;
    let lastSectionBottom = 0;
    if (lastSection) {
        lastSectionBottom = lastSection.top + lastSection.height;
    }

    const newSection = createSkeletonSection(
        columnProperties,
        columnSeparatorType,
        lastSectionBottom,
        0,
        pageContentWidth,
        pageContentHeight - lastSectionBottom
    );
    newSection.parent = page;
    sections.push(newSection);

    return page;
}

function _getNullPage(
    type = DocumentSkeletonPageType.BODY,
    segmentId = ''
): IDocumentSkeletonPage {
    return {
        sections: [],
        headerId: '',
        footerId: '',
        // page
        pageWidth: 0,
        pageHeight: 0,
        pageOrient: PageOrientType.PORTRAIT,
        pageNumber: 1,
        pageNumberStart: 1,
        verticalAlign: false,
        angle: 0,
        width: 0,
        height: 0,
        // Only use in cell.
        left: 0,
        marginLeft: 0,
        marginRight: 0,
        originMarginTop: 0,
        marginTop: 0,
        originMarginBottom: 0,
        marginBottom: 0,
        breakType: BreakType.SECTION,
        st: 0,
        ed: 0,
        skeDrawings: new Map(),
        skeTables: new Map(),
        skeColumnGroups: new Map(),
        type,
        segmentId,
    };
}

function _createSkeletonHeaderFooter(
    ctx: ILayoutContext,
    headerOrFooterViewModel: DocumentViewModel,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    segmentId: string,
    isHeader = true,
    areaPage: Nullable<IDocumentSkeletonHeaderFooter>,
    count = 0
): IDocumentSkeletonHeaderFooter {
    const {
        sectionId,
        lists,
        footerTreeMap,
        headerTreeMap,
        localeService,
        pageSize,
        drawings,
        marginLeft = 0,
        marginRight = 0,
        marginHeader = 0,
        marginFooter = 0,
        documentCompatibilityPolicy,
        documentTextStyle,
        fontFamilyFallbacks,
        paragraphLineGapDefault,
        defaultTabStop,
        adjustLineHeightInTable,
        characterSpacingControl,
        useFELayout,
        balanceSingleByteDoubleByteWidth,
        spaceWidthEastAsian,
        autoHyphenation,
        consecutiveHyphenLimit,
        doNotHyphenateCaps,
        hyphenationZone,
        charSpace,
        linePitch,
        gridType,
        contentDirection,
        textDirection,
    } = sectionBreakConfig;
    const pageWidth = pageSize?.width || Number.POSITIVE_INFINITY;
    const pageHeight = pageSize?.height || Number.POSITIVE_INFINITY;
    const headerFooterConfig: ISectionBreakConfig = {
        sectionId,
        lists,
        footerTreeMap,
        headerTreeMap,
        pageSize: {
            width: pageWidth - marginLeft - marginRight,
            height: getHeaderFooterMaxHeight(pageHeight) - (isHeader ? marginHeader : marginFooter) - 5,
        },
        localeService,
        drawings,
        documentCompatibilityPolicy,
        documentTextStyle,
        fontFamilyFallbacks,
        paragraphLineGapDefault,
        defaultTabStop,
        adjustLineHeightInTable,
        characterSpacingControl,
        useFELayout,
        balanceSingleByteDoubleByteWidth,
        spaceWidthEastAsian,
        autoHyphenation,
        consecutiveHyphenLimit,
        doNotHyphenateCaps,
        hyphenationZone,
        charSpace,
        linePitch,
        gridType,
        contentDirection,
        textDirection,
    };

    if (areaPage == null) {
        areaPage = createSkeletonPage(ctx, headerFooterConfig, skeletonResourceReference);
        areaPage.type = isHeader ? DocumentSkeletonPageType.HEADER : DocumentSkeletonPageType.FOOTER;
        areaPage.segmentId = segmentId;
    }
    const layoutAnchor = ctx.layoutStartPointer[segmentId];
    // Reset layoutStartPointer.
    ctx.layoutStartPointer[segmentId] = null;

    const page = dealWithSection(
        ctx,
        headerOrFooterViewModel,
        headerOrFooterViewModel.getChildren()[0],
        areaPage,
        headerFooterConfig,
        layoutAnchor
    ).pages[0];

    if (ctx.isDirty && count < 10) {
        count++;
        resetContext(ctx);

        return _createSkeletonHeaderFooter(
            ctx,
            headerOrFooterViewModel,
            sectionBreakConfig,
            skeletonResourceReference,
            segmentId,
            isHeader,
            areaPage,
            count
        );
    }

    updateBlockIndex([page], -1, sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy());

    const traditional = isTraditionalDocumentCompatibility(
        sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()
    );
    // Word reserves the complete text flow, including the final paragraph's spacing,
    // but does not add the modern document's synthetic gap between stories.
    const trailingSpace = traditional ? Math.max(0, getLastLine(page)?.spaceBelowApply ?? 0) : 0;
    if (isHeader) {
        Object.assign(page, {
            marginTop: marginHeader,
            marginBottom: traditional ? trailingSpace : 5,
        });
    } else {
        Object.assign(page, {
            marginTop: traditional ? 0 : 5,
            marginBottom: marginFooter + trailingSpace,
        });
    }

    return page;
}

export function createNullCellPage(
    ctx: ILayoutContext,
    sectionBreakConfig: ISectionBreakConfig,
    tableConfig: ITable,
    row: number,
    col: number,
    availableHeight: number = Number.POSITIVE_INFINITY,
    maxCellPageHeight: number = Number.POSITIVE_INFINITY,
    inheritDocumentLinePitch = true,
    enableDocumentTableLineGrid = true,
    cellPageHeights?: readonly number[]
) {
    const {
        sectionId,
        lists,
        footerTreeMap,
        headerTreeMap,
        localeService,
        drawings,
        documentCompatibilityPolicy,
        documentTextStyle,
        fontFamilyFallbacks,
        paragraphLineGapDefault,
        defaultTabStop,
        adjustLineHeightInTable,
        characterSpacingControl,
        useFELayout,
        balanceSingleByteDoubleByteWidth,
        spaceWidthEastAsian,
        autoHyphenation,
        consecutiveHyphenLimit,
        doNotHyphenateCaps,
        hyphenationZone,
        charSpace,
        linePitch,
        gridType,
        contentDirection,
        textDirection,
        renderConfig,
    } = sectionBreakConfig;
    const { skeletonResourceReference } = ctx;
    const { cellMargin, tableRows, tableColumns, tableId } = tableConfig;
    const cellConfig = tableRows[row].tableCells[col];

    let {
        start = { v: 10 },
        end = { v: 10 },
        top = { v: 5 },
        bottom = { v: 5 },
    } = cellConfig.margin ?? cellMargin ?? {};
    if (isTraditionalDocumentCompatibility(documentCompatibilityPolicy)) {
        // Word aligns all cells to the row's largest vertical padding and border,
        // even when the tallest text is in a different, thinner-bordered cell.
        top = { ...top, v: getRowVerticalInset(tableConfig, row, 'top') };
        const lastRow = Math.min(tableRows.length - 1, row + Math.max(1, cellConfig.rowSpan ?? 1) - 1);
        bottom = { ...bottom, v: getRowVerticalInset(tableConfig, lastRow, 'bottom') };
    }
    const columnSpan = Math.max(1, cellConfig.columnSpan ?? 1);
    const gridColumn = getTableCellGridColumn(tableConfig, row, col);
    const pageWidth = tableColumns
        .slice(gridColumn, gridColumn + columnSpan)
        .reduce((sum, column) => sum + column.size.width.v, 0);
    if (start.v + end.v >= pageWidth) {
        const marginWidth = start.v + end.v;
        const availableMarginWidth = Math.max(0, pageWidth - 1);
        const startRatio = marginWidth > 0 ? start.v / marginWidth : 0.5;

        start = { ...start, v: availableMarginWidth * startRatio };
        end = { ...end, v: availableMarginWidth - start.v };
    }
    const pageHeight = maxCellPageHeight;
    const isVerticalCell = cellConfig.textDirection === 'tbRlV';
    const rowHeight = tableRows.slice(row, row + Math.max(1, cellConfig.rowSpan ?? 1))
        .reduce((sum, tableRow) => sum + Math.max(0, tableRow.trHeight?.val.v ?? 0), 0);
    // Shape vertical text along the row's height, then restore physical bounds for table layout.
    // ponytail: auto-height rows start from the cell width; content-driven height feedback needs a second layout pass.
    const layoutWidth = isVerticalCell
        ? Math.max(1, rowHeight || (Number.isFinite(availableHeight) ? availableHeight : pageWidth))
        : pageWidth;
    const layoutHeight = isVerticalCell ? Number.POSITIVE_INFINITY : pageHeight;

    const cellSectionBreakConfig: ISectionBreakConfig = {
        sectionId,
        cellTableId: tableId,
        cellPageHeights,
        lists,
        footerTreeMap,
        headerTreeMap,
        pageSize: {
            width: layoutWidth,
            height: layoutHeight,
        },
        marginTop: isVerticalCell ? end.v : top.v,
        marginBottom: isVerticalCell ? start.v : bottom.v,
        marginLeft: isVerticalCell ? top.v : start.v,
        marginRight: isVerticalCell ? bottom.v : end.v,
        localeService,
        drawings,
        documentCompatibilityPolicy,
        documentTextStyle,
        fontFamilyFallbacks,
        paragraphLineGapDefault,
        defaultTabStop,
        adjustLineHeightInTable: enableDocumentTableLineGrid ? adjustLineHeightInTable : undefined,
        characterSpacingControl,
        useFELayout,
        balanceSingleByteDoubleByteWidth,
        spaceWidthEastAsian,
        autoHyphenation,
        consecutiveHyphenLimit,
        doNotHyphenateCaps,
        hyphenationZone,
        charSpace,
        linePitch: inheritDocumentLinePitch ? linePitch : undefined,
        gridType,
        contentDirection,
        textDirection,
        renderConfig,
    };

    const areaPage = createSkeletonPage(
        ctx,
        // Set first page height to availableHeight.
        Object.assign({}, cellSectionBreakConfig, {
            pageSize: {
                width: layoutWidth,
                height: isVerticalCell ? layoutHeight : (Number.isFinite(availableHeight) ? availableHeight : pageHeight),
            },
        }),
        skeletonResourceReference
    );
    areaPage.type = DocumentSkeletonPageType.CELL;
    areaPage.segmentId = tableId;

    return {
        page: areaPage,
        sectionBreakConfig: cellSectionBreakConfig,
        verticalCellWidth: isVerticalCell ? pageWidth : undefined,
    };
}

function finishVerticalCellLayout(pages: IDocumentSkeletonPage[], physicalWidth: number | undefined): void {
    if (physicalWidth == null) {
        return;
    }
    for (const page of pages) {
        const logicalWidth = page.width;
        page.width = page.height;
        page.height = logicalWidth;
        page.pageHeight = page.pageWidth;
        page.pageWidth = physicalWidth;
        page.cellTextDirection = 'tbRlV';
    }
}

export function getCellBorderWidth(border: ITableCellBorder | undefined): number {
    return border == null || border.color?.rgb === 'transparent' ? 0 : Math.max(0, border.width?.v ?? 1);
}

export function getRowBorderInset(row: ITableRow, edge: 'borderTop' | 'borderBottom'): number {
    return row.tableCells.reduce((inset, cell) => Math.max(inset, getCellBorderWidth(cell[edge]) / 2), 0);
}

function getRowVerticalInset(table: ITable, index: number, edge: 'top' | 'bottom'): number {
    const row = table.tableRows[index];
    const padding = row.tableCells.reduce((max, cell) => {
        const margin = cell.margin?.[edge] ?? table.cellMargin?.[edge] ?? { v: 5 };
        return Math.max(max, margin.v ?? 0);
    }, 0);
    const borderEdge = edge === 'top' ? 'borderTop' : 'borderBottom';
    const neighbour = table.tableRows[index + (edge === 'top' ? -1 : 1)];
    const oppositeEdge = edge === 'top' ? 'borderBottom' : 'borderTop';
    const border = Math.max(getRowBorderInset(row, borderEdge), neighbour ? getRowBorderInset(neighbour, oppositeEdge) : 0);
    return padding + border;
}

function getTableCellGridColumn(table: ITable, row: number, col: number): number {
    const tableRow = table.tableRows[row];
    let gridColumn = tableRow?.gridBefore ?? 0;
    const cells = tableRow?.tableCells ?? [];

    for (let cellIndex = 0; cellIndex < col; cellIndex++) {
        const cell = cells[cellIndex];
        const columnSpan = cell.columnSpan ?? 1;
        if (columnSpan > 0) {
            gridColumn += columnSpan;
        } else if (isVerticallyCoveredGridColumn(table, row, gridColumn)) {
            gridColumn += 1;
        }
    }

    return gridColumn;
}

function isVerticallyCoveredGridColumn(table: ITable, row: number, gridColumn: number): boolean {
    for (let masterRow = 0; masterRow < row; masterRow++) {
        const cells = table.tableRows[masterRow]?.tableCells ?? [];
        for (let masterCol = 0; masterCol < cells.length; masterCol++) {
            const cell = cells[masterCol];
            const rowSpan = cell.rowSpan ?? 1;
            const columnSpan = cell.columnSpan ?? 1;
            if (rowSpan <= 1 || columnSpan <= 0 || masterRow + rowSpan <= row) {
                continue;
            }

            const masterGridColumn = getTableCellGridColumn(table, masterRow, masterCol);
            if (gridColumn >= masterGridColumn && gridColumn < masterGridColumn + columnSpan) {
                return true;
            }
        }
    }

    return false;
}

function getCellLineGridOptions(
    sectionBreakConfig: ISectionBreakConfig
): { inheritDocumentLinePitch: boolean; enableDocumentTableLineGrid: boolean } {
    const usesLineGrid = sectionBreakConfig.gridType === GridType.LINES ||
        sectionBreakConfig.gridType === GridType.LINES_AND_CHARS;
    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const isTraditionalLineGrid = isTraditionalDocumentCompatibility(documentCompatibilityPolicy) && usesLineGrid;
    // A cell inherits its section's grid, independently of spacing in other paragraphs.
    return {
        enableDocumentTableLineGrid: isTraditionalLineGrid,
        inheritDocumentLinePitch: isTraditionalLineGrid,
    };
}

export function createSkeletonCellPages(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    cellNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    tableConfig: ITable,
    row: number,
    col: number,
    availableHeight: number = Number.POSITIVE_INFINITY,
    maxCellPageHeight: number = Number.POSITIVE_INFINITY,
    cellPageHeights?: readonly number[]
) {
    // Table cell only has one section.
    const sectionNode = cellNode.children[0];
    const body = ctx.dataModel?.getBody?.();
    const { enableDocumentTableLineGrid, inheritDocumentLinePitch } = getCellLineGridOptions(
        sectionBreakConfig
    );

    const { page: areaPage, sectionBreakConfig: cellSectionBreakConfig, verticalCellWidth } = createNullCellPage(
        ctx,
        sectionBreakConfig,
        tableConfig,
        row,
        col,
        availableHeight,
        maxCellPageHeight,
        inheritDocumentLinePitch,
        enableDocumentTableLineGrid,
        cellPageHeights
    );

    if (tableConfig.tableRows[row].tableCells[col].tcHideMark === BooleanNumber.TRUE) {
        cellSectionBreakConfig.cellHiddenEndMarkIndex = sectionNode.children[sectionNode.children.length - 1]?.endIndex;
    }
    const segmentId = tableConfig.tableId;
    const retainedPages: IDocumentSkeletonPage[] = [];
    let currentPage = areaPage;
    let pages: IDocumentSkeletonPage[] = [];

    for (let count = 0; count <= 10; count++) {
        const layoutAnchor = ctx.layoutStartPointer[segmentId];
        ctx.layoutStartPointer[segmentId] = null;

        const result = dealWithSection(
            ctx,
            viewModel,
            sectionNode,
            currentPage,
            cellSectionBreakConfig,
            layoutAnchor
        );
        pages = [...retainedPages, ...result.pages];

        if (!ctx.isDirty || ctx.layoutStartPointer[segmentId] == null || count === 10) {
            break;
        }

        const retryPage = pages[pages.length - 1];
        if (retryPage == null) {
            break;
        }

        retainedPages.splice(0, retainedPages.length, ...pages.slice(0, -1));
        currentPage = retryPage;
        resetContext(ctx);
    }

    for (const p of pages) {
        p.type = DocumentSkeletonPageType.CELL;
        p.segmentId = segmentId;
    }

    updateBlockIndex(
        pages,
        cellNode.startIndex,
        sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()
    );

    applyTrailingBlockRangeSpaceBelow(pages, body, cellNode.endIndex);
    applyTrailingCellParagraphSpaceBelow(pages, body, cellNode.endIndex, cellSectionBreakConfig);

    updateInlineDrawingCoordsAndBorder(ctx, pages);
    expandCellPageHeightForInlineDrawings(pages);
    expandCellPageHeightForFlowTables(pages);
    finishVerticalCellLayout(pages, verticalCellWidth);

    return pages;
}

export interface ICellSkeletonBuildState {
    ctx: ILayoutContext;
    viewModel: DocumentViewModel;
    cellNode: DataStreamTreeNode;
    sectionNode: DataStreamTreeNode;
    sectionBreakConfig: ISectionBreakConfig;
    cellSectionBreakConfig: ISectionBreakConfig;
    tableConfig: ITable;
    verticalCellWidth?: number;
    paragraphIndex: number;
    layoutAnchor: Nullable<number>;
    pages: IDocumentSkeletonPage[];
    complete: boolean;
    requiresSyncFallback: boolean;
}

export function startSkeletonCellPagesBuild(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    cellNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    tableConfig: ITable,
    row: number,
    col: number,
    availableHeight: number = Number.POSITIVE_INFINITY,
    maxCellPageHeight: number = Number.POSITIVE_INFINITY,
    cellPageHeights?: readonly number[]
): ICellSkeletonBuildState {
    const sectionNode = cellNode.children[0];
    const { enableDocumentTableLineGrid, inheritDocumentLinePitch } = getCellLineGridOptions(
        sectionBreakConfig
    );
    const { page, sectionBreakConfig: cellSectionBreakConfig, verticalCellWidth } = createNullCellPage(
        ctx,
        sectionBreakConfig,
        tableConfig,
        row,
        col,
        availableHeight,
        maxCellPageHeight,
        inheritDocumentLinePitch,
        enableDocumentTableLineGrid,
        cellPageHeights
    );
    if (tableConfig.tableRows[row].tableCells[col].tcHideMark === BooleanNumber.TRUE) {
        cellSectionBreakConfig.cellHiddenEndMarkIndex = sectionNode.children[sectionNode.children.length - 1]?.endIndex;
    }
    page.type = DocumentSkeletonPageType.CELL;
    page.segmentId = tableConfig.tableId;

    const layoutAnchor = ctx.layoutStartPointer[tableConfig.tableId];
    ctx.layoutStartPointer[tableConfig.tableId] = null;

    return {
        ctx,
        viewModel,
        cellNode,
        sectionNode,
        sectionBreakConfig,
        cellSectionBreakConfig,
        tableConfig,
        paragraphIndex: 0,
        verticalCellWidth,
        layoutAnchor,
        pages: [page],
        complete: false,
        requiresSyncFallback: false,
    };
}

export function stepSkeletonCellPagesBuild(state: ICellSkeletonBuildState): boolean {
    if (state.complete) {
        return true;
    }

    const currentPage = state.pages[state.pages.length - 1];
    const result = dealWithSection(
        state.ctx,
        state.viewModel,
        state.sectionNode,
        currentPage,
        state.cellSectionBreakConfig,
        state.layoutAnchor,
        {
            startParagraphIndex: state.paragraphIndex,
            maxParagraphs: 1,
        }
    );

    if (result.pages[0] === currentPage) {
        result.pages.shift();
    }
    state.pages.push(...result.pages);
    state.paragraphIndex = result.nextParagraphIndex;
    state.layoutAnchor = null;

    if (state.ctx.isDirty) {
        state.requiresSyncFallback = true;
        state.complete = true;
        return true;
    }

    if (result.complete) {
        for (const page of state.pages) {
            page.type = DocumentSkeletonPageType.CELL;
            page.segmentId = state.tableConfig.tableId;
        }
        updateBlockIndex(
            state.pages,
            state.cellNode.startIndex,
            state.sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()
        );
        applyTrailingBlockRangeSpaceBelow(
            state.pages,
            state.ctx.dataModel?.getBody?.(),
            state.cellNode.endIndex
        );
        applyTrailingCellParagraphSpaceBelow(
            state.pages,
            state.ctx.dataModel?.getBody?.(),
            state.cellNode.endIndex,
            state.cellSectionBreakConfig
        );
        updateInlineDrawingCoordsAndBorder(state.ctx, state.pages);
        expandCellPageHeightForInlineDrawings(state.pages);
        expandCellPageHeightForFlowTables(state.pages);
        finishVerticalCellLayout(state.pages, state.verticalCellWidth);
        state.complete = true;
    }

    return state.complete;
}

function applyTrailingCellParagraphSpaceBelow(
    pages: IDocumentSkeletonPage[],
    body: Nullable<IDocumentBody>,
    containerEndIndex: number,
    sectionBreakConfig: ISectionBreakConfig
) {
    const page = pages[pages.length - 1];
    const lastSection = page?.sections[page.sections.length - 1];
    const lastColumn = lastSection?.columns[lastSection.columns.length - 1];
    const lastLine = lastColumn?.lines[lastColumn.lines.length - 1];
    if (!page || !lastLine) {
        return;
    }

    const spaceBelow = Math.max(0, lastLine.spaceBelowApply ?? 0);
    if (
        spaceBelow === 0 ||
        !isTraditionalDocumentCompatibility(sectionBreakConfig.documentCompatibilityPolicy!)
    ) {
        return;
    }

    const paragraphIndex = lastLine.paragraphIndex;
    const hasLaterParagraph = body?.paragraphs?.some(
        (paragraph) => paragraph.startIndex > paragraphIndex && paragraph.startIndex < containerEndIndex
    );
    const isBlockRangeParagraph = body?.blockRanges?.some(
        (range) => range.startIndex < paragraphIndex && paragraphIndex < range.endIndex
    );
    if (hasLaterParagraph || isBlockRangeParagraph) {
        return;
    }

    // Word includes the last paragraph's after-spacing in the cell's content height,
    // independently of document grids and the paragraph's line-spacing rule.
    page.height += spaceBelow;
}

export function expandCellPageHeightForInlineDrawings(pages: IDocumentSkeletonPage[]) {
    for (const page of pages) {
        const lastSection = page.sections?.[page.sections.length - 1];
        const lastColumn = lastSection?.columns[lastSection.columns.length - 1];
        const lastLine = lastColumn?.lines[lastColumn.lines.length - 1];
        const trailingDrawingIds = new Set(lastLine?.divides?.flatMap((divide) =>
            divide.glyphGroup.map((glyph) => glyph.drawingId).filter((id): id is string => id != null)) ?? []);
        page.skeDrawings?.forEach((drawing) => {
            if (drawing.drawingOrigin?.layoutType !== PositionedObjectLayoutType.INLINE) {
                return;
            }

            const trailingSpace = trailingDrawingIds.has(drawing.drawingId) ? (lastLine?.spaceBelowApply ?? 0) : 0;
            const drawingBottom = (drawing.aTop ?? 0) + (drawing.height ?? 0) +
                (drawing.drawingOrigin.effectExtent?.bottom ?? 0) + trailingSpace;
            if (drawingBottom > page.height) {
                page.height = drawingBottom;
            }
        });
    }
}

export function expandCellPageHeightForFlowTables(pages: IDocumentSkeletonPage[]) {
    for (const page of pages) {
        page.skeTables?.forEach((table) => {
            const textWrap = table.tableSource.textWrap ?? TableTextWrapType.NONE;
            if (textWrap !== TableTextWrapType.NONE) {
                return;
            }

            page.height = Math.max(page.height, table.top + table.height);
        });
    }
}

export function applyTrailingBlockRangeSpaceBelow(pages: IDocumentSkeletonPage[], body: Nullable<IDocumentBody>, containerEndIndex: number) {
    const blockRanges = body?.blockRanges;
    const trailingBlockRangeSpace = 28;
    if (!blockRanges?.length) {
        return;
    }

    for (const page of pages) {
        const lastSection = page.sections[page.sections.length - 1];
        const lastColumn = lastSection?.columns[lastSection.columns.length - 1];
        const lastLine = lastColumn?.lines[lastColumn.lines.length - 1];
        if (!lastLine) {
            continue;
        }

        const paragraphIndex = lastLine.paragraphIndex;
        const isBlockRangeParagraph = blockRanges.some((range) => range.startIndex < paragraphIndex && paragraphIndex < range.endIndex);
        if (!isBlockRangeParagraph) {
            continue;
        }

        const hasLaterParagraphInContainer = body?.paragraphs?.some((paragraph) => paragraph.startIndex > paragraphIndex && paragraph.startIndex < containerEndIndex);
        if (hasLaterParagraphInContainer) {
            continue;
        }

        page.height += lastLine.spaceBelowApply || trailingBlockRangeSpace;
    }
}

function _getVerticalMargin(
    marginTB: number,
    headerOrFooter: Nullable<IDocumentSkeletonHeaderFooter>
) {
    if (headerOrFooter == null) {
        return marginTB;
    }

    const { marginTop = 0, height = 0, marginBottom = 0 } = headerOrFooter;

    return Math.max(marginTB, marginTop + height + marginBottom);
}
