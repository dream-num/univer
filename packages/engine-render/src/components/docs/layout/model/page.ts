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

import type { IDocumentBody, IParagraph, ITable, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonHeaderFooter,
    IDocumentSkeletonPage,
    ISkeletonResourceReference,
} from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import { BooleanNumber, GridType, PageOrientType, PositionedObjectLayoutType, SpacingRule, TableTextWrapType } from '@univerjs/core';
import { BreakType, DocumentSkeletonPageType } from '../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy, isTraditionalDocumentCompatibility } from '../../document-compatibility';
import { dealWithSection } from '../block/section';
import { reachesNextDocumentGridLine, resetContext, updateBlockIndex, updateInlineDrawingCoordsAndBorder } from '../tools';
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
    breakType = BreakType.SECTION
): IDocumentSkeletonPage {
    const page: IDocumentSkeletonPage = _getNullPage();

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

    const { width: pageWidth = Number.POSITIVE_INFINITY, height: pageHeight = Number.POSITIVE_INFINITY } = pageSize;

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
    const documentCompatibilityPolicy =
        sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    if (isTraditionalDocumentCompatibility(documentCompatibilityPolicy)) {
        // Word places body content at the configured page margins even when a tall
        // header or footer overlaps that area. Expanding the margins here changes
        // pagination and pushes page-anchored cover content into the body flow.
        page.marginTop = marginTop;
        page.marginBottom = marginBottom;
    } else {
        page.marginTop = _getVerticalMargin(marginTop, header);
        page.marginBottom = _getVerticalMargin(marginBottom, footer);
    }

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

    if (isHeader) {
        Object.assign(page, {
            marginTop: marginHeader,
            marginBottom: 5, // Space between header and content
        });
    } else {
        Object.assign(page, {
            marginTop: 5, // Space between content and footer
            marginBottom: marginFooter,
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
    enableDocumentTableLineGrid = true
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
        paragraphLineGapDefault,
        defaultTabStop,
        adjustLineHeightInTable,
        characterSpacingControl,
        useFELayout,
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

    const cellSectionBreakConfig: ISectionBreakConfig = {
        sectionId,
        lists,
        footerTreeMap,
        headerTreeMap,
        pageSize: {
            width: pageWidth,
            height: pageHeight,
        },
        marginTop: top.v,
        marginBottom: bottom.v,
        marginLeft: start.v,
        marginRight: end.v,
        localeService,
        drawings,
        documentCompatibilityPolicy,
        documentTextStyle,
        paragraphLineGapDefault,
        defaultTabStop,
        adjustLineHeightInTable: enableDocumentTableLineGrid ? adjustLineHeightInTable : undefined,
        characterSpacingControl,
        useFELayout,
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
                width: pageWidth,
                height: Number.isFinite(availableHeight) ? availableHeight : pageHeight,
            },
        }),
        skeletonResourceReference
    );
    areaPage.type = DocumentSkeletonPageType.CELL;
    areaPage.segmentId = tableId;

    return {
        page: areaPage,
        sectionBreakConfig: cellSectionBreakConfig,
    };
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

export function createSkeletonCellPages(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    cellNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    tableConfig: ITable,
    row: number,
    col: number,
    availableHeight: number = Number.POSITIVE_INFINITY,
    maxCellPageHeight: number = Number.POSITIVE_INFINITY
) {
    // Table cell only has one section.
    const sectionNode = cellNode.children[0];
    const body = ctx.dataModel?.getBody?.();
    const linePitch = sectionBreakConfig.linePitch ?? 0;
    const usesLineGrid = sectionBreakConfig.gridType === GridType.LINES || sectionBreakConfig.gridType === GridType.LINES_AND_CHARS;
    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy();
    const isTraditionalLineGrid = isTraditionalDocumentCompatibility(documentCompatibilityPolicy) &&
        usesLineGrid;
    const usesNextDocumentGridLine = (paragraph: IParagraph) => {
        const paragraphStyle = paragraph.paragraphStyle;
        const lineSpacing = paragraphStyle?.lineSpacing;
        return lineSpacing != null &&
            paragraphStyle?.spacingRule === SpacingRule.AUTO &&
            paragraphStyle.snapToGrid !== BooleanNumber.FALSE &&
            reachesNextDocumentGridLine(lineSpacing, paragraphStyle.spaceBelow?.v ?? 0, linePitch);
    };
    const inheritDocumentLinePitch = isTraditionalLineGrid &&
        body?.paragraphs?.some((paragraph) => {
            if (paragraph.startIndex <= cellNode.startIndex || paragraph.startIndex >= cellNode.endIndex) {
                return false;
            }

            return usesNextDocumentGridLine(paragraph);
        }) === true;
    const enableDocumentTableLineGrid = isTraditionalLineGrid &&
        body?.tables?.some((table) => body.paragraphs?.some(
            (paragraph) => paragraph.startIndex > table.startIndex &&
                paragraph.startIndex < table.endIndex &&
                usesNextDocumentGridLine(paragraph)
        )) === true;

    const { page: areaPage, sectionBreakConfig: cellSectionBreakConfig } = createNullCellPage(
        ctx,
        sectionBreakConfig,
        tableConfig,
        row,
        col,
        availableHeight,
        maxCellPageHeight,
        inheritDocumentLinePitch,
        enableDocumentTableLineGrid
    );

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

    return pages;
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

    const paragraphStyle = body?.paragraphs?.find((paragraph) => paragraph.startIndex === paragraphIndex)?.paragraphStyle;
    const lineSpacing = paragraphStyle?.lineSpacing;
    const spaceBelow = Math.max(0, lastLine.spaceBelowApply ?? 0);
    const linePitch = sectionBreakConfig.linePitch ?? 0;
    const usesLineGrid = sectionBreakConfig.gridType === GridType.LINES || sectionBreakConfig.gridType === GridType.LINES_AND_CHARS;
    if (
        lineSpacing == null ||
        paragraphStyle?.spacingRule !== SpacingRule.AUTO ||
        paragraphStyle.snapToGrid === BooleanNumber.FALSE ||
        !usesLineGrid ||
        linePitch <= 0 ||
        !reachesNextDocumentGridLine(lineSpacing, spaceBelow, linePitch) ||
        !isTraditionalDocumentCompatibility(sectionBreakConfig.documentCompatibilityPolicy!)
    ) {
        return;
    }

    page.height += spaceBelow;
}

export function expandCellPageHeightForInlineDrawings(pages: IDocumentSkeletonPage[]) {
    for (const page of pages) {
        page.skeDrawings?.forEach((drawing) => {
            if (drawing.drawingOrigin?.layoutType !== PositionedObjectLayoutType.INLINE) {
                return;
            }

            const drawingBottom = (drawing.aTop ?? 0) + (drawing.height ?? 0);
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
