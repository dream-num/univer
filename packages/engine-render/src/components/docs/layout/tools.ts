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

import type {
    DocumentDataModel,
    IBullet,
    IDocumentStyle,
    INumberUnit,
    IObjectPositionH,
    IObjectPositionV,
    IParagraph,
    IParagraphStyle,
    ISectionBreak,
    ITextStyle,
    Nullable,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonFontStyle,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonSection,
    IDocumentSkeletonTable,
    ISkeletonResourceReference,
} from '../../../basics/i-document-skeleton-cached';
import type { IDocsConfig, IParagraphConfig, ISectionBreakConfig } from '../../../basics/interfaces';
import type { IBoundRectNoAngle } from '../../../basics/vector2';
import type { IDocumentCompatibilityPolicy } from '../document-compatibility';
import type { DataStreamTreeNode } from '../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../view-model/document-view-model';
import type { Hyphen } from './hyphenation/hyphen';
import type { LanguageDetector } from './hyphenation/language-detector';
import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    ColumnSeparatorType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    GridType,
    HorizontalAlign,
    mergeWith,
    MODERN_DOCUMENT_DEFAULT_MARGIN,
    MODERN_DOCUMENT_WIDTH,
    ModernDocumentWidthMode,
    NAMED_STYLE_MAP,
    NumberUnitType,
    ObjectMatrix,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PageOrientType,
    resolveSectionHeaderFooterReferences,
    SectionType,
    SpacingRule,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { DEFAULT_DOCUMENT_FONTSIZE } from '../../../basics/const';
import { GlyphType, LineType } from '../../../basics/i-document-skeleton-cached';
import { getFontStyleString, isFunction } from '../../../basics/tools';
import { getDocumentCompatibilityPolicy } from '../document-compatibility';
import { getDocsTableRenderViewport, hasDocsTableHorizontalViewport } from '../table-render-viewport';
import { updateInlineDrawingPosition } from './block/paragraph/layout-ruler';
import { getCustomDecorationStyle } from './style/custom-decoration';
import { getCustomRangeStyle } from './style/custom-range';

export function getLastPage(pages: IDocumentSkeletonPage[]) {
    return pages[pages.length - 1];
}

export function getLastSection(page: IDocumentSkeletonPage) {
    return page.sections?.[page.sections.length - 1];
}

export function getLastColumn(page: IDocumentSkeletonPage) {
    const columns = getLastSection(page).columns;
    return columns?.[columns.length - 1];
}

export function getLastLine(page: IDocumentSkeletonPage) {
    const lines = getLastNotFullColumnInfo(page)?.column.lines;
    return lines?.[lines.length - 1];
}

export function getLastLineByColumn(column: IDocumentSkeletonColumn) {
    return column.lines[column.lines.length - 1];
}

export function getPageContentWidth(page: IDocumentSkeletonPage) {
    const { pageWidth, marginLeft: pageMarginLeft, marginRight: pageMarginRight } = page;

    return pageWidth - pageMarginLeft - pageMarginRight;
}

export function getPreLine(line: IDocumentSkeletonLine) {
    const column = line.parent;
    const index = column?.lines.indexOf(line);
    if (!index || index === -1 || index - 1 < 0) {
        return;
    }

    return column?.lines[index - 1];
}

export function getColumnByDivide(divide: IDocumentSkeletonDivide) {
    const column = divide.parent?.parent;
    if (column) {
        return column;
    }
}

export function getLastNotFullColumnInfo(page: IDocumentSkeletonPage) {
    const section = getLastSection(page);
    for (let i = 0; i < section.columns.length; i++) {
        const column = section.columns[i];
        if (!column.isFull) {
            return {
                column,
                isLast: i === section.columns.length - 1,
                index: i,
            };
        }
    }
}

export function getLastNotFullDivideInfo(page: IDocumentSkeletonPage) {
    const line = getLastLine(page);
    if (!line) {
        return;
    }
    for (let i = 0; i < line.divides.length; i++) {
        const divide = line.divides[i];
        if (!divide.isFull) {
            return {
                divide,
                isLast: i === line.divides.length - 1,
                index: i,
            };
        }
    }
}

export function getNextDivide(curLine: IDocumentSkeletonLine, curDivide: IDocumentSkeletonDivide) {
    const index = curLine.divides.indexOf(curDivide);
    if (index === -1) {
        return;
    }
    return curLine.divides[index + 1];
}

export function getLastRemainingDivide(curLine: IDocumentSkeletonLine) {
    // Except for divide, the other elements will not be created in advance.
    if (!curLine) {
        return;
    }
    for (let i = 0; i < curLine.divides.length; i++) {
        const curDivide = curLine.divides[i];
        const nextDivide = curLine.divides[i + 1];
        if (curDivide.glyphGroup.length === 0) {
            return curDivide;
        }
        if (!nextDivide || nextDivide.glyphGroup.length === 0) {
            return curDivide;
        }
    }
}

export function getLastSpan(page: IDocumentSkeletonPage) {
    const glyphGroup = getLastNotFullDivideInfo(page)?.divide.glyphGroup;
    return glyphGroup?.[glyphGroup.length - 1];
}

export function isColumnFull(page: IDocumentSkeletonPage) {
    const section = getLastSection(page);
    const columnsLen = section.columns.length;
    for (let i = 0; i < columnsLen; i++) {
        const column = section.columns[i];
        if (!column.isFull) {
            return false;
        }
    }
    return true;
}

export function isBlankPage(page: IDocumentSkeletonPage) {
    if (page.sections.length > 1) {
        return false;
    }

    const section = getLastSection(page);
    const columnsLen = section.columns.length;

    for (let i = 0; i < columnsLen; i++) {
        const column = section.columns[i];
        const state = isBlankColumn(column);

        if (!state) {
            return false;
        }
    }

    return true;
}

export function isBlankColumn(column: IDocumentSkeletonColumn) {
    const lines = column.lines;
    if (lines.length > 1) {
        return false;
    }

    const line = lines[lines.length - 1];

    return isLineBlank(line);
}

function isLineBlank(line?: IDocumentSkeletonLine) {
    if (!line) {
        return true;
    }

    for (let i = 0; i < line.divides.length; i++) {
        const spanCount = line.divides[i].glyphGroup.length;
        if (spanCount > 1) {
            return false;
        }
        if (spanCount === 1) {
            const lastSpan = line.divides[i].glyphGroup[0];
            const { glyphType, raw, streamType, width } = lastSpan;
            const isZeroWidthColumnBreak =
                width === 0 &&
                (raw === DataStreamTreeTokenType.COLUMN_BREAK ||
                    streamType === DataStreamTreeTokenType.COLUMN_BREAK);
            if (glyphType !== GlyphType.TAB && glyphType !== GlyphType.LIST && !isZeroWidthColumnBreak) {
                return false;
            }
        }
    }

    return true;
}

export function getNumberUnitValue(unitValue: Nullable<INumberUnit>, benchMark: number) {
    if (!unitValue) {
        return 0;
    }

    const { v: value, u: unit } = unitValue;

    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 0;
    }

    if (!unit) {
        return value;
    }

    if (unit === NumberUnitType.PIXEL) {
        return value;
    }

    return value * benchMark;
}

// Return charSpaceApply, choose between grid or font to calculate the length of a tab, where one tab represents a length of 1 character.
export function getCharSpaceApply(
    charSpace: number = 0,
    defaultTabStop: number,
    gridType = GridType.LINES,
    snapToGrid = BooleanNumber.TRUE
) {
    let charSpaceApply = 1;

    if (validationGrid(gridType, snapToGrid)) {
        // When the character grid is enabled, the reference for defaultTabStop is charSpace.
        charSpaceApply = charSpace;
    }
    charSpaceApply *= defaultTabStop; // Multiply it by the value set for defaultTabStop.

    return charSpaceApply;
}

export function validationGrid(gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE) {
    return (
        snapToGrid === BooleanNumber.TRUE &&
        (gridType === GridType.LINES_AND_CHARS || gridType === GridType.SNAP_TO_CHARS)
    );
}

export function getLineHeightConfig(sectionBreakConfig: ISectionBreakConfig, paragraphConfig: IParagraphConfig) {
    const { paragraphStyle = {}, useWordStyleLineHeight = false } = paragraphConfig;
    const { linePitch = 15.6, gridType = GridType.LINES, paragraphLineGapDefault = 0 } = sectionBreakConfig;
    const hasDocumentGrid = gridType === GridType.LINES_AND_CHARS || gridType === GridType.SNAP_TO_CHARS;
    const defaultSnapToGrid = useWordStyleLineHeight && !hasDocumentGrid ? BooleanNumber.FALSE : BooleanNumber.TRUE;
    const { lineSpacing = 0, spacingRule = SpacingRule.AUTO, snapToGrid = defaultSnapToGrid } = paragraphStyle;

    // Flavored docs use Word-style single spacing by default.
    // Embedded sheet/slides documents keep the legacy grid-based fallback.
    let lineSpacingApply = lineSpacing;
    if (useWordStyleLineHeight && lineSpacing === 0 && spacingRule === SpacingRule.AUTO) {
        lineSpacingApply = 1;
    } else if (
        !useWordStyleLineHeight &&
        (gridType === GridType.LINES || gridType === GridType.LINES_AND_CHARS) &&
        lineSpacing === 0 &&
        spacingRule === SpacingRule.AUTO
    ) {
        lineSpacingApply = 1;
    }

    return { paragraphLineGapDefault, linePitch, gridType, lineSpacing: lineSpacingApply, spacingRule, snapToGrid, useWordStyleLineHeight };
}

export function getCharSpaceConfig(sectionBreakConfig: ISectionBreakConfig, paragraphConfig: IParagraphConfig) {
    const { paragraphStyle = {} } = paragraphConfig;

    const {
        charSpace = 0,
        gridType = GridType.LINES,
        defaultTabStop = 36,
        documentTextStyle = {},
    } = sectionBreakConfig;

    const { fs: documentFontSize = DEFAULT_DOCUMENT_FONTSIZE } = documentTextStyle;

    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

    return {
        charSpace,
        documentFontSize,
        defaultTabStop,
        gridType,
        snapToGrid,
    };
}

export function updateBlockIndex(
    pages: IDocumentSkeletonPage[],
    start: number = -1,
    documentCompatibilityPolicy?: IDocumentCompatibilityPolicy
) {
    let prePageStartIndex = start;
    // Real docs declare a classic/modern compatibility mode, so their measured layout column
    // width can be reused. Embedded editors keep the mode unspecified and must fall back to
    // content width; otherwise a sheet cell editor may stretch to the far edge of the canvas.
    const shouldUseLayoutColumnWidth = documentCompatibilityPolicy?.mode !== 'unspecified';

    for (const page of pages) {
        const { sections, skeTables, skeColumnGroups = new Map() } = page;
        const pageStartIndex = prePageStartIndex;
        const pageEndIndex = pageStartIndex;
        let preSectionStartIndex = pageStartIndex;
        let maxContentWidth = Number.NEGATIVE_INFINITY;
        let contentHeight = 0;

        for (const section of sections) {
            collapseRedundantColumnBreakOverflow(section);
            const { columns } = section;
            const sectionStartIndex = preSectionStartIndex;
            const sectionEndIndex = pageStartIndex;
            let preColumnStartIndex = sectionStartIndex;
            let maxSectionHeight = Number.NEGATIVE_INFINITY;
            let sectionWidth = 0;

            for (const column of columns) {
                const { lines } = column;
                const columStartIndex = preColumnStartIndex;
                const columnEndIndex = columStartIndex;
                let preLineStartIndex = columStartIndex;
                let columnHeight = 0;
                let maxColumnWidth = Number.NEGATIVE_INFINITY;
                // const preLine: Nullable<IDocumentSkeletonLine> = null;

                for (const line of lines) {
                    const { divides, lineHeight, top, isBehindTable, tableId } = line;
                    let lineStartIndex = preLineStartIndex;
                    if (isBehindTable && tableId) {
                        const table = skeTables.get(tableId);
                        if (table) {
                            lineStartIndex = table.ed;
                        }
                    }

                    if (line.type === LineType.BLOCK && divides.length === 0) {
                        line.st = Math.max(line.st, lineStartIndex + 1);
                        line.ed = Math.max(line.ed, line.st);
                        line.width = 0;
                        line.asc = 0;
                        line.dsc = 0;
                        columnHeight = top + lineHeight;
                        preLineStartIndex = Math.max(preLineStartIndex, line.ed);
                        continue;
                    }

                    const lineEndIndex = lineStartIndex;
                    let preDivideStartIndex = lineStartIndex;
                    let actualWidth = 0;
                    let maxLineAsc = 0;
                    let macLineDsc = 0;
                    columnHeight = top + lineHeight;
                    const divideLength = divides.length;
                    let lineHasGlyph = false;

                    for (let i = 0; i < divideLength; i++) {
                        const divide = divides[i];
                        const { glyphGroup } = divide;

                        const divStartIndex = preDivideStartIndex;
                        let divEndIndex = divStartIndex;

                        for (const glyph of glyphGroup) {
                            const increaseValue = glyph.glyphType === GlyphType.LIST ? 0 : glyph.count;

                            divEndIndex += increaseValue;

                            const bBox = glyph.bBox;
                            const { ba, bd } = bBox;

                            maxLineAsc = Math.max(maxLineAsc, ba);
                            macLineDsc = Math.max(macLineDsc, bd);

                            if (i === divideLength - 1) {
                                actualWidth += glyph.width;
                            }
                        }

                        // When the width is set to Infinity, the last divide should also be Infinity, and an actual width needs to be calculated.
                        // Use to fix issue: https://github.com/dream-num/univer/issues/2002
                        // Because the Chinese punctuation marks at the beginning and end of the line are squeezed and narrowed,
                        // the extruded width needs to be added when calculating the overall width.
                        if (glyphGroup.length === 0) {
                            continue;
                        }

                        lineHasGlyph = true;

                        if (glyphGroup[0].xOffset !== 0 && i === divideLength - 1) {
                            actualWidth -= glyphGroup[0].xOffset;
                        }

                        if (i === divideLength - 1) {
                            // if (divide.width === Infinity) {
                            //     divide.width = actualWidth;
                            // } else {
                            //     actualWidth += divide.width;
                            // }
                            actualWidth += divide.left;
                        }

                        divide.st = divStartIndex + 1;
                        divide.ed = divEndIndex >= divide.st ? divEndIndex : divide.st;

                        preDivideStartIndex = divide.ed;
                    }

                    line.st = lineHasGlyph ? lineStartIndex + 1 : lineStartIndex;
                    line.ed = preDivideStartIndex >= line.st ? preDivideStartIndex : line.st;
                    line.width = actualWidth;
                    line.asc = maxLineAsc;
                    line.dsc = macLineDsc;
                    maxColumnWidth = Math.max(maxColumnWidth, actualWidth);
                    // Please do not use pre line's top and height to calculate the current's top,
                    // because of float objects will between lines.
                    preLineStartIndex = line.ed;
                }
                column.st = columStartIndex + 1;
                column.ed = preLineStartIndex >= column.st ? preLineStartIndex : column.st;
                column.height = columnHeight;

                const measuredColumnWidth = shouldUseLayoutColumnWidth && Number.isFinite(column.width) && column.width > 0
                    ? column.width
                    : maxColumnWidth;
                column.width = measuredColumnWidth;
                sectionWidth += measuredColumnWidth;

                maxSectionHeight = Math.max(maxSectionHeight, column.height);

                preColumnStartIndex = column.ed;
            }

            section.st = sectionStartIndex + 1;
            section.ed = preColumnStartIndex >= section.st ? preColumnStartIndex : section.st;
            section.height = maxSectionHeight;
            contentHeight += maxSectionHeight;

            maxContentWidth = Math.max(maxContentWidth, sectionWidth);

            preSectionStartIndex = section.ed;
        }

        // Some tables may across pages, so we need to calculate the page's end index by the tables.
        for (const table of skeTables.values()) {
            const { ed } = table;

            preSectionStartIndex = Math.max(preSectionStartIndex, ed);
        }

        for (const columnGroup of skeColumnGroups.values()) {
            const { ed } = columnGroup;

            preSectionStartIndex = Math.max(preSectionStartIndex, ed);
        }

        page.st = pageStartIndex + 1;
        page.ed = preSectionStartIndex >= page.st ? preSectionStartIndex : page.st;
        page.height = contentHeight;
        page.width = maxContentWidth;

        prePageStartIndex = page.ed;
    }
}

function collapseRedundantColumnBreakOverflow(section: IDocumentSkeletonSection) {
    const expectedColumnCount = section.colCount || section.columns.length;
    if (expectedColumnCount <= 0 || section.columns.length <= expectedColumnCount) {
        return;
    }

    const targetColumn = section.columns[expectedColumnCount - 1];
    if (!targetColumn) {
        return;
    }

    const overflowColumns = section.columns.slice(expectedColumnCount);
    if (!overflowColumns.some((column) => column.lines.length > 0)) {
        return;
    }

    const targetHeight = targetColumn.height ?? 0;
    const overflowLines = overflowColumns.flatMap((column) => column.lines);
    overflowLines.forEach((line) => {
        line.top += targetHeight;
        line.parent = targetColumn;
    });
    targetColumn.lines.push(...overflowLines);
    targetColumn.height = Math.max(
        ...overflowColumns.map((column) => targetHeight + (column.height ?? 0)),
        targetHeight
    );
    targetColumn.isFull = overflowColumns.some((column) => column.isFull);
    section.columns.splice(expectedColumnCount);
}

export function updateInlineDrawingCoordsAndBorder(ctx: ILayoutContext, pages: IDocumentSkeletonPage[]) {
    lineIterator(pages, (line, _, __, page) => {
        const { segmentId } = page;
        const paragraphConfig = ctx.paragraphConfigCache.get(segmentId)?.get(line.paragraphIndex);

        const affectInlineDrawings = paragraphConfig?.paragraphInlineSkeDrawings;
        const affectNonInlineDrawings = paragraphConfig?.paragraphNonInlineSkeDrawings;
        const drawingAnchor = ctx.skeletonResourceReference?.drawingAnchor?.get(segmentId)?.get(line.paragraphIndex);
        // Update inline drawings after the line is layout.
        if (affectInlineDrawings && affectInlineDrawings.size > 0) {
            updateInlineDrawingPosition(
                line,
                affectInlineDrawings,
                ctx.dataModel.getUnitId?.() ?? '',
                drawingAnchor?.top,
                affectNonInlineDrawings
            );
        }

        const paragraphStyle = paragraphConfig?.paragraphStyle;
        const paragraphBackgroundColor = paragraphStyle?.shading?.backgroundColor;
        if (paragraphBackgroundColor) {
            line.backgroundColor = paragraphBackgroundColor;
        }

        if (line.divides.length > 0) {
            const lastDivide = line.divides[line.divides.length - 1];
            const lastGlyph = lastDivide.glyphGroup[lastDivide.glyphGroup.length - 1];

            if (lastGlyph?.streamType === DataStreamTreeTokenType.PARAGRAPH && paragraphStyle?.borderBottom) {
                line.borderBottom = paragraphStyle.borderBottom;
            }
        }
    });
}

export function glyphIterator(
    pages: IDocumentSkeletonPage[],
    cb: (
        glyph: IDocumentSkeletonGlyph,
        divide: IDocumentSkeletonDivide,
        line: IDocumentSkeletonLine,
        column: IDocumentSkeletonColumn,
        section: IDocumentSkeletonSection,
        page: IDocumentSkeletonPage
    ) => void
) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                const { lines } = column;

                for (const line of lines) {
                    const { divides } = line;
                    const divideLength = divides.length;
                    for (let i = 0; i < divideLength; i++) {
                        const divide = divides[i];
                        const { glyphGroup } = divide;

                        for (const glyph of glyphGroup) {
                            if (cb && isFunction(cb)) {
                                cb(glyph, divide, line, column, section, page);
                            }
                        }
                    }
                }
            }
        }
    }
}

export function lineIterator(
    pagesOrCells: (IDocumentSkeletonPage)[],
    cb: (
        line: IDocumentSkeletonLine,
        column: IDocumentSkeletonColumn,
        section: IDocumentSkeletonSection,
        page: IDocumentSkeletonPage
    ) => void
) {
    for (const pageOrCell of pagesOrCells) {
        const { sections } = pageOrCell;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                const { lines } = column;

                for (const line of lines) {
                    if (cb && isFunction(cb)) {
                        cb(line, column, section, pageOrCell);
                    }
                }
            }
        }
    }
}

export type DocumentSkeletonLineSource = 'page' | 'table-cell' | 'column';

export interface IDocumentSkeletonLineIteratorOptions {
    docsLeft?: number;
    pageMarginTop?: number;
    tableCellInsetX?: number;
    unitId?: string;
}

export interface IDocumentSkeletonLineContext {
    clipLeft?: number;
    clipRight?: number;
    column: IDocumentSkeletonColumn;
    line: IDocumentSkeletonLine;
    lineWidth: number;
    page: IDocumentSkeletonPage;
    pageIndex: number;
    pageLeft: number;
    section: IDocumentSkeletonSection;
    sectionTop: number;
    source: DocumentSkeletonLineSource;
    visualLeft?: number;
    visualWidth?: number;
}

export type DocumentSkeletonTableSource = 'page' | 'column' | 'header' | 'footer';
type HeaderFooterSkeletonMap = Map<string, Map<number, IDocumentSkeletonPage>>;

export interface IDocumentSkeletonTableCellGeometry {
    cell: IDocumentSkeletonPage;
    cellRect: IBoundRectNoAngle;
    clipLeft: number;
    clipRight: number;
    columnIndex: number;
    pageLeft: number;
    pageTop: number;
    row: IDocumentSkeletonRow;
    rowIndex: number;
    visualLeft: number;
    visualWidth: number;
}

export interface IDocumentSkeletonTableContext {
    cells: IDocumentSkeletonTableCellGeometry[];
    page: IDocumentSkeletonPage;
    pageIndex: number;
    pageLeft: number;
    pageTop: number;
    rootPage: IDocumentSkeletonPage;
    source: DocumentSkeletonTableSource;
    table: IDocumentSkeletonTable;
    tableId: string;
    tableRect: IBoundRectNoAngle;
}

export interface IDocumentSkeletonTableIteratorOptions {
    docsLeft?: number;
    docsTop?: number;
    pageMarginTop?: number;
    resolveViewport?: boolean;
    skeFooters?: HeaderFooterSkeletonMap;
    skeHeaders?: HeaderFooterSkeletonMap;
    tableCellInsetX?: number;
    unitId?: string;
}

export function documentSkeletonTableIterator(
    pages: IDocumentSkeletonPage[],
    options: IDocumentSkeletonTableIteratorOptions = {}
): IDocumentSkeletonTableContext[] {
    const {
        docsLeft = 0,
        docsTop = 0,
        pageMarginTop = 0,
        resolveViewport = true,
        skeFooters,
        skeHeaders,
        tableCellInsetX = 0,
        unitId = '',
    } = options;
    const contexts: IDocumentSkeletonTableContext[] = [];

    pages.forEach((rootPage, pageIndex) => {
        const rootPageHeight = rootPage.pageHeight === Infinity ? 0 : rootPage.pageHeight;
        const rootPageTop = (rootPageHeight + pageMarginTop) * pageIndex + rootPage.marginTop + docsTop;
        const rootPageLeft = rootPage.marginLeft + docsLeft;

        collectPageTables({
            contexts,
            docsLeft,
            page: rootPage,
            pageIndex,
            pageLeft: rootPageLeft,
            pageTop: rootPageTop,
            rootPage,
            source: 'page',
            resolveViewport,
            tableCellInsetX,
            unitId,
        });

        const rootPageDocumentTop = rootPageTop - rootPage.marginTop;
        const rootPageDocumentLeft = docsLeft + rootPage.marginLeft;
        const headerPage = rootPage.headerId == null ? undefined : skeHeaders?.get(rootPage.headerId)?.get(rootPage.pageWidth);
        if (headerPage != null) {
            collectPageTables({
                contexts,
                docsLeft,
                page: headerPage,
                pageIndex,
                pageLeft: rootPageDocumentLeft,
                pageTop: rootPageDocumentTop + headerPage.marginTop,
                rootPage,
                source: 'header',
                resolveViewport,
                tableCellInsetX,
                unitId,
            });
        }

        const footerPage = rootPage.footerId == null ? undefined : skeFooters?.get(rootPage.footerId)?.get(rootPage.pageWidth);
        if (footerPage != null) {
            collectPageTables({
                contexts,
                docsLeft,
                page: footerPage,
                pageIndex,
                pageLeft: rootPageDocumentLeft,
                pageTop: rootPageDocumentTop + rootPage.pageHeight - footerPage.height - footerPage.marginBottom,
                rootPage,
                source: 'footer',
                resolveViewport,
                tableCellInsetX,
                unitId,
            });
        }

        rootPage.skeColumnGroups?.forEach((columnGroup) => {
            columnGroup.columns.forEach((columnGroupColumn) => {
                const nestedPage = columnGroupColumn.page;
                const nestedPageLeft = rootPageLeft + columnGroup.left + columnGroupColumn.left + nestedPage.marginLeft;
                const nestedPageTop = rootPageTop + columnGroup.top + columnGroupColumn.top + nestedPage.marginTop;

                collectPageTables({
                    contexts,
                    docsLeft,
                    page: nestedPage,
                    pageIndex,
                    pageLeft: nestedPageLeft,
                    pageTop: nestedPageTop,
                    rootPage,
                    source: 'column',
                    resolveViewport,
                    tableCellInsetX,
                    unitId,
                });
            });
        });
    });

    return contexts;
}

export function documentSkeletonLineIterator(
    pages: IDocumentSkeletonPage[],
    options: IDocumentSkeletonLineIteratorOptions,
    cb: (context: IDocumentSkeletonLineContext) => void
) {
    const {
        docsLeft = 0,
        pageMarginTop = 0,
        tableCellInsetX = 0,
        unitId = '',
    } = options;

    pages.forEach((page, pageIndex) => {
        const pageHeight = page.pageHeight === Infinity ? 0 : page.pageHeight;
        const pageTop = (pageHeight + pageMarginTop) * pageIndex + page.marginTop;
        const pageLeft = page.marginLeft;

        visitPageLines(page, {
            pageIndex,
            pageLeft,
            pageTop,
            source: 'page',
            getBounds: (linePage, column, section) => getPageLineBounds(linePage, column, section.columns.length, pageLeft),
        }, cb);

        page.skeTables?.forEach((table) => {
            const sourceTableId = getSourceTableId(table.tableId);
            const viewport = getDocsTableRenderViewport(unitId, sourceTableId);
            const hasHorizontalViewport = hasDocsTableHorizontalViewport(viewport);
            const tableViewportLeft = getTableViewportLeft(pageLeft, table.left, viewport, docsLeft);
            const tableViewportRight = tableViewportLeft + (hasHorizontalViewport ? viewport.viewportWidth : table.width);
            const tableScrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;

            table.rows.forEach((row) => {
                row.cells.forEach((cell) => {
                    const cellTop = pageTop + table.top + row.top + cell.marginTop;
                    const cellLeft = pageLeft + table.left + cell.left - tableScrollLeft + cell.marginLeft;
                    const cellContentRight = cellLeft + cell.pageWidth - cell.marginLeft - cell.marginRight;
                    const visualLeft = cellLeft + tableCellInsetX;
                    const visualRight = cellContentRight - tableCellInsetX;
                    const visualWidth = Math.max(0, visualRight - visualLeft);
                    const clipLeft = tableViewportLeft;
                    const clipRight = Math.min(cellContentRight, tableViewportRight);

                    if (visualWidth <= 0 || Math.min(visualRight, clipRight) <= Math.max(visualLeft, clipLeft)) {
                        return;
                    }

                    visitPageLines(cell, {
                        clipLeft,
                        clipRight,
                        pageIndex,
                        pageLeft: cellLeft,
                        pageTop: cellTop,
                        source: 'table-cell',
                        visualLeft,
                        visualWidth,
                    }, cb);
                });
            });
        });

        page.skeColumnGroups?.forEach((columnGroup) => {
            columnGroup.columns.forEach((columnGroupColumn) => {
                const nestedPage = columnGroupColumn.page;
                const nestedPageLeft = pageLeft + columnGroup.left + columnGroupColumn.left + nestedPage.marginLeft;
                const nestedPageTop = pageTop + columnGroup.top + columnGroupColumn.top + nestedPage.marginTop;
                const visualWidth = Math.max(0, columnGroupColumn.width - nestedPage.marginLeft - nestedPage.marginRight);

                visitPageLines(nestedPage, {
                    pageIndex,
                    pageLeft: nestedPageLeft,
                    pageTop: nestedPageTop,
                    source: 'column',
                    getBounds: (_linePage, column) => ({
                        lineWidth: Math.max(getFiniteWidth(column.width), visualWidth - column.left),
                        visualLeft: nestedPageLeft + column.left,
                        visualWidth: Math.max(getFiniteWidth(column.width), visualWidth - column.left),
                    }),
                }, cb);
            });
        });
    });
}

export function getDocumentSkeletonNestedPageOffset(page: IDocumentSkeletonPage): { left: number; top: number } | undefined {
    const parent = page.parent as {
        left?: number;
        page?: IDocumentSkeletonPage;
        parent?: {
            columnGroupId?: string;
            columns?: unknown[];
            left?: number;
            top?: number;
        };
        top?: number;
    } | undefined;

    if (parent?.page === page && parent.parent?.columnGroupId && parent.parent.columns?.includes(parent)) {
        return {
            left: (parent.parent.left ?? 0) + (parent.left ?? 0),
            top: (parent.parent.top ?? 0) + (parent.top ?? 0),
        };
    }
}

export interface IDocumentSkeletonColumnPagePathInfo {
    columnGroupId: string;
    columnIndex: number;
    pageIndex: number;
}

export function getDocumentSkeletonColumnPagePathInfo(
    position: { path?: (string | number)[] }
): IDocumentSkeletonColumnPagePathInfo | undefined {
    const { path } = position;
    const pagesIndex = path?.indexOf('pages') ?? -1;
    const columnGroupIndex = path?.indexOf('skeColumnGroups') ?? -1;
    const columnsIndex = path?.indexOf('columns') ?? -1;

    if (
        pagesIndex === -1 ||
        columnGroupIndex === -1 ||
        columnsIndex === -1 ||
        path?.[columnsIndex + 2] !== 'page'
    ) {
        return;
    }

    const pageIndex = path?.[pagesIndex + 1];
    const columnGroupId = path?.[columnGroupIndex + 1];
    const columnIndex = path?.[columnsIndex + 1];

    if (typeof pageIndex !== 'number' || typeof columnGroupId !== 'string' || typeof columnIndex !== 'number') {
        return;
    }

    return {
        columnGroupId,
        columnIndex,
        pageIndex,
    };
}

export function compareDocumentSkeletonNestedPagePathOrder(
    pos1: { path?: (string | number)[] },
    pos2: { path?: (string | number)[] }
): boolean | undefined {
    const columnGroupOrder1 = getDocumentSkeletonColumnPagePathInfo(pos1);
    const columnGroupOrder2 = getDocumentSkeletonColumnPagePathInfo(pos2);

    if (
        columnGroupOrder1 &&
        columnGroupOrder2 &&
        columnGroupOrder1.pageIndex === columnGroupOrder2.pageIndex &&
        columnGroupOrder1.columnGroupId === columnGroupOrder2.columnGroupId &&
        columnGroupOrder1.columnIndex !== columnGroupOrder2.columnIndex
    ) {
        return columnGroupOrder1.columnIndex < columnGroupOrder2.columnIndex;
    }
}

interface IVisitPageLineOptions {
    clipLeft?: number;
    clipRight?: number;
    getBounds?: (
        page: IDocumentSkeletonPage,
        column: IDocumentSkeletonColumn,
        section: IDocumentSkeletonSection
    ) => Partial<Pick<IDocumentSkeletonLineContext, 'lineWidth' | 'visualLeft' | 'visualWidth'>> | undefined;
    pageIndex: number;
    pageLeft: number;
    pageTop: number;
    source: DocumentSkeletonLineSource;
    visualLeft?: number;
    visualWidth?: number;
}

function visitPageLines(
    page: IDocumentSkeletonPage,
    options: IVisitPageLineOptions,
    cb: (context: IDocumentSkeletonLineContext) => void
) {
    page.sections.forEach((section) => {
        section.columns.forEach((column) => {
            column.lines.forEach((line) => {
                const bounds = options.getBounds?.(page, column, section);

                cb({
                    clipLeft: options.clipLeft,
                    clipRight: options.clipRight,
                    column,
                    line,
                    lineWidth: bounds?.lineWidth ?? bounds?.visualWidth ?? getFiniteWidth(column.width),
                    page,
                    pageIndex: options.pageIndex,
                    pageLeft: options.pageLeft,
                    section,
                    sectionTop: options.pageTop + section.top,
                    source: options.source,
                    visualLeft: bounds?.visualLeft ?? options.visualLeft,
                    visualWidth: bounds?.visualWidth ?? options.visualWidth,
                });
            });
        });
    });
}

function getPageLineBounds(
    page: IDocumentSkeletonPage,
    column: IDocumentSkeletonColumn,
    columnCount: number,
    pageLeft: number
): Pick<IDocumentSkeletonLineContext, 'lineWidth' | 'visualLeft' | 'visualWidth'> | undefined {
    if (columnCount !== 1 || !Number.isFinite(page.pageWidth)) {
        return;
    }

    const visualLeft = pageLeft + column.left;
    const visualRight = page.pageWidth - page.marginRight;
    const visualWidth = Math.max(0, visualRight - visualLeft);
    const lineWidth = Math.max(0, page.pageWidth - page.marginLeft - page.marginRight);
    return visualWidth > 0 ? { lineWidth, visualLeft, visualWidth } : undefined;
}

interface ICollectPageTablesOptions {
    contexts: IDocumentSkeletonTableContext[];
    docsLeft: number;
    page: IDocumentSkeletonPage;
    pageIndex: number;
    pageLeft: number;
    pageTop: number;
    rootPage: IDocumentSkeletonPage;
    resolveViewport: boolean;
    source: DocumentSkeletonTableSource;
    tableCellInsetX: number;
    unitId: string;
}

function collectPageTables(options: ICollectPageTablesOptions): void {
    const {
        contexts,
        docsLeft,
        page,
        pageIndex,
        pageLeft,
        pageTop,
        resolveViewport,
        rootPage,
        source,
        tableCellInsetX,
        unitId,
    } = options;

    page.skeTables?.forEach((table, tableId) => {
        const effectiveTableId = table.tableId ?? tableId;
        const tableLeft = pageLeft + table.left;
        const tableTop = pageTop + table.top;
        const sourceTableId = getSourceTableId(effectiveTableId);
        const viewport = resolveViewport ? getDocsTableRenderViewport(unitId, sourceTableId) : null;
        const hasHorizontalViewport = hasDocsTableHorizontalViewport(viewport);
        const tableViewportLeft = getTableViewportLeft(pageLeft, table.left, viewport, docsLeft);
        const tableViewportRight = tableViewportLeft + (hasHorizontalViewport ? viewport.viewportWidth : table.width);
        const tableScrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;
        const cells: IDocumentSkeletonTableCellGeometry[] = [];

        table.rows.forEach((row, rowIndex) => {
            row.cells.forEach((cell, columnIndex) => {
                if ((cell as IDocumentSkeletonPage & { isMergedCellCovered?: boolean }).isMergedCellCovered) {
                    return;
                }

                const cellMarginLeft = cell.marginLeft ?? 0;
                const cellMarginRight = cell.marginRight ?? 0;
                const cellMarginTop = cell.marginTop ?? 0;
                const cellMarginBottom = cell.marginBottom ?? 0;
                const cellPageWidth = cell.pageWidth ?? 0;
                const cellPageHeight = cell.pageHeight ?? 0;
                const cellTop = tableTop + (row.top ?? 0) + cellMarginTop;
                const cellLeft = tableLeft + (cell.left ?? 0) - tableScrollLeft + cellMarginLeft;
                const cellContentRight = cellLeft + cellPageWidth - cellMarginLeft - cellMarginRight;
                const visualLeft = cellLeft + tableCellInsetX;
                const visualRight = cellContentRight - tableCellInsetX;
                const visualWidth = Math.max(0, visualRight - visualLeft);
                const clipLeft = tableViewportLeft;
                const clipRight = Math.min(cellContentRight, tableViewportRight);

                if (visualWidth <= 0 || Math.min(visualRight, clipRight) <= Math.max(visualLeft, clipLeft)) {
                    return;
                }

                cells.push({
                    cell,
                    cellRect: {
                        bottom: cellTop + cellPageHeight - cellMarginBottom - cellMarginTop,
                        left: Math.max(cellLeft, tableViewportLeft),
                        right: Math.min(cellContentRight, tableViewportRight),
                        top: cellTop,
                    },
                    clipLeft,
                    clipRight,
                    columnIndex,
                    pageLeft: cellLeft,
                    pageTop: cellTop,
                    row,
                    rowIndex,
                    visualLeft,
                    visualWidth,
                });
            });
        });

        contexts.push({
            cells,
            page,
            pageIndex,
            pageLeft,
            pageTop,
            rootPage,
            source,
            table,
            tableId: effectiveTableId,
            tableRect: {
                bottom: tableTop + table.height,
                left: tableLeft,
                right: tableLeft + table.width,
                top: tableTop,
            },
        });
    });
}

function getTableViewportLeft(pageLeft: number, tableLeft: number, viewport: unknown, docsLeft: number): number {
    const viewportLeft = (viewport as Nullable<{ viewportLeft?: number }>)?.viewportLeft;
    return viewportLeft != null
        ? viewportLeft - docsLeft
        : pageLeft + tableLeft;
}

function getSourceTableId(tableId: string): string {
    return tableId.includes('#-#') ? tableId.split('#-#')[0] : tableId;
}

function getFiniteWidth(width: number | undefined): number {
    return Number.isFinite(width) ? width! : 0;
}

export function columnIterator(
    pages: IDocumentSkeletonPage[],
    iteratorFunction: (column: IDocumentSkeletonColumn) => void
) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                if (iteratorFunction && isFunction(iteratorFunction)) {
                    iteratorFunction(column);
                }
            }
        }
    }
}

export function getPositionHorizon(
    positionH: IObjectPositionH,
    column: IDocumentSkeletonColumn,
    page: IDocumentSkeletonPage,
    objectWidth: number,
    isPageBreak: boolean = false
) {
    const { relativeFrom, align, posOffset, percent } = positionH;

    if (align != null) {
        if (align === AlignTypeH.INSIDE || align === AlignTypeH.OUTSIDE) {
            if (relativeFrom === ObjectRelativeFromH.MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
                // TODO
            }
        } else {
            if (relativeFrom === ObjectRelativeFromH.COLUMN) {
                const { width, left } = column;
                let absoluteLeft = 0;
                if (align === AlignTypeH.LEFT) {
                    absoluteLeft = left;
                } else if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = left + width - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = left + width / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            }
            if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
                const { pageWidth, marginLeft, marginRight } = page;
                const marginWidth = pageWidth - marginLeft - marginRight;
                let absoluteLeft = marginLeft;
                if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = marginLeft + marginWidth - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = marginLeft + marginWidth / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
                const { pageWidth } = page;
                let absoluteLeft = 0;
                if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = pageWidth - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = pageWidth / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            }
        }
    } else if (posOffset != null) {
        let absoluteLeft = 0;
        const { marginLeft } = page;
        if (relativeFrom === ObjectRelativeFromH.COLUMN) {
            absoluteLeft = (isPageBreak ? 0 : column?.left || 0) + posOffset;
        } else if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            absoluteLeft = posOffset + marginLeft;
        } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            absoluteLeft = posOffset;
        }

        return absoluteLeft;
    } else if (percent) {
        const { pageWidth, marginLeft, marginRight } = page;
        if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            return percent * pageWidth;
        }
    }
}

export function getPositionVertical(
    positionV: IObjectPositionV,
    page: IDocumentSkeletonPage,
    lineTop: number,
    lineHeight: number,
    objectHeight: number,
    blockAnchorTop?: number,
    isPageBreak: boolean = false
) {
    const { relativeFrom, align, posOffset, percent } = positionV;

    if (align != null) {
        if (relativeFrom === ObjectRelativeFromV.LINE) {
            let absoluteTop = 0;
            if (align === AlignTypeV.BOTTOM) {
                absoluteTop = lineTop + lineHeight - objectHeight;
            } else if (align === AlignTypeV.TOP) {
                absoluteTop = lineTop;
            } else if (align === AlignTypeV.CENTER) {
                absoluteTop = lineTop + lineHeight / 2 - objectHeight / 2;
            }
            return absoluteTop;
        } else if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            const { pageHeight } = page;
            let absoluteTop = 0;
            if (align === AlignTypeV.BOTTOM) {
                absoluteTop = pageHeight - objectHeight;
            } else if (align === AlignTypeV.CENTER) {
                absoluteTop = pageHeight / 2 - objectHeight / 2;
            }
            return absoluteTop;
        }
    } else if (posOffset != null) {
        let absoluteTop = 0;
        const { marginTop } = page;

        if (relativeFrom === ObjectRelativeFromV.LINE) {
            absoluteTop = (lineTop || 0) + posOffset;
        } else if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            absoluteTop = posOffset;
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            absoluteTop = posOffset - marginTop;
        } else if (relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
            absoluteTop = (isPageBreak ? 0 : blockAnchorTop == null ? lineTop : blockAnchorTop) + posOffset;
        }
        return absoluteTop;
    } else if (percent != null) {
        const { pageHeight, marginBottom, marginTop } = page;
        if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            return percent * pageHeight;
        }
    }
}

export function getGlyphGroupWidth(divide: IDocumentSkeletonDivide) {
    let width = 0;

    for (const glyph of divide.glyphGroup) {
        width += glyph.width;
    }

    return width;
}

interface IFontCreateConfig {
    fontStyle: IDocumentSkeletonFontStyle;
    textStyle: ITextStyle;
    charSpace: number;
    gridType: GridType;
    snapToGrid: BooleanNumber;
    pageWidth: number;
}

const fontCreateConfigCache = new ObjectMatrix<IFontCreateConfig>();

export function clearFontCreateConfigCache() {
    fontCreateConfigCache.reset();
}

export function getFontConfigFromLastGlyph(
    glyph: IDocumentSkeletonGlyph,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const { ts, fontStyle } = glyph;
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginRight = 0,
        marginLeft = 0,
    } = sectionBreakConfig;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    const pageWidth = pageSize.width || Number.POSITIVE_INFINITY - marginLeft - marginRight;

    const result = {
        fontStyle: fontStyle!,
        textStyle: ts!,
        charSpace,
        gridType,
        snapToGrid,
        pageWidth,
    };

    return result;
}

function getBulletParagraphTextStyle(bullet: IBullet, viewModel: DocumentViewModel) {
    const { listType } = bullet;
    const lists = viewModel.getDataModel().getBulletPresetList();

    return lists[listType]?.nestingLevel?.[0]?.paragraphProperties?.textStyle;
}

const DEFAULT_TEXT_RUN = { ts: {}, st: 0, ed: 0 };

export function getFontCreateConfig(
    index: number,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        documentTextStyle = {},
        pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginRight = 0,
        marginLeft = 0,
        // localeService,
        renderConfig = {},
    } = sectionBreakConfig;
    const { paragraphStyle = {}, bullet } = paragraph;
    const { isRenderStyle } = renderConfig;
    const { startIndex } = paragraphNode;
    const originTextRun = viewModel.getTextRun(index + startIndex);

    const textRun = isRenderStyle === BooleanNumber.FALSE
        ? DEFAULT_TEXT_RUN
        : originTextRun ?? DEFAULT_TEXT_RUN;
    const customDecoration = viewModel.getCustomDecoration(index + startIndex);
    const showCustomDecoration = customDecoration && (customDecoration.show !== false);
    const customDecorationStyle = showCustomDecoration ? getCustomDecorationStyle(customDecoration) : null;
    const customRange = viewModel.getCustomRange(index + startIndex);
    const showCustomRange = customRange && (customRange.show !== false);
    const customRangeStyle = showCustomRange ? getCustomRangeStyle(customRange) : null;
    const hasAddonStyle = showCustomRange || showCustomDecoration || !!bullet || paragraphStyle?.namedStyleType;
    const { st, ed } = textRun;
    let { ts: textStyle = {} } = textRun;
    const cache = fontCreateConfigCache.getValue(st, ed);
    if (cache && !hasAddonStyle && originTextRun) {
        return cache;
    }

    const { snapToGrid = BooleanNumber.TRUE, namedStyleType } = paragraphStyle;
    const bulletTextStyle = bullet ? getBulletParagraphTextStyle(bullet, viewModel) : null;
    // Apply named style if it exists
    const namedStyle = namedStyleType ? NAMED_STYLE_MAP[namedStyleType] : null;

    textStyle = {
        ...documentTextStyle,
        ...namedStyle,
        ...textStyle,
        ...customDecorationStyle,
        ...customRangeStyle,
        ...bulletTextStyle,
    };

    const fontStyle = getFontStyleString(textStyle);

    const mixTextStyle: ITextStyle = {
        ...documentTextStyle,
        ...textStyle,
    };

    const pageWidth = pageSize.width || Number.POSITIVE_INFINITY - marginLeft - marginRight;

    const result = {
        fontStyle,
        textStyle: mixTextStyle,
        charSpace,
        gridType,
        snapToGrid,
        documentCompatibilityPolicy: sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy(),
        pageWidth,
    };

    if (!hasAddonStyle && originTextRun) {
        // TODO: cache should more precisely, take custom-range, custom-decoration, paragraphStyle into considering.
        fontCreateConfigCache.setValue(st, ed, result);
    }

    return result;
}

export function getCustomRangeGlyphWidth(
    index: number,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    config: IFontCreateConfig
): number | undefined {
    const customRange = viewModel.getCustomRange(index + paragraphNode.startIndex);
    const glyphWidthEm = customRange?.glyphWidthEm;
    if (typeof glyphWidthEm !== 'number' || !Number.isFinite(glyphWidthEm) || glyphWidthEm < 0) {
        return undefined;
    }

    return glyphWidthEm * config.fontStyle.originFontSize;
}

// Generate an empty doc skeleton with the initial states.
export function getNullSkeleton(): IDocumentSkeletonCached {
    return {
        pages: [],
        left: 0,
        top: 0,
        st: 0,
        skeHeaders: new Map(),
        skeFooters: new Map(),
        skeListLevel: new Map(), // TODO: Move to context management?
        drawingAnchor: new Map(), // TODO: Move to context management
    };
}

export function setPageParent(pages: IDocumentSkeletonPage[], parent: IDocumentSkeletonCached) {
    for (const page of pages) {
        page.parent = parent;
    }
}

export enum FloatObjectType {
    IMAGE = 'IMAGE',
    TABLE = 'TABLE',
}

export interface IFloatObject {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    angle: number;
    behindDoc?: BooleanNumber;
    layoutType?: PositionedObjectLayoutType;
    type: FloatObjectType;
    positionV: IObjectPositionV;
}

// The context state of the layout process, which is used to store some cache and intermediate states in the typesetting process,
// as well as identifying information such as the pointer of the layout.
export interface ILayoutContext {
    // The view model of current layout document.
    viewModel: DocumentViewModel;
    // The data model of current layout document.
    dataModel: DocumentDataModel;
    // The document style: pageSize, renderConfig, etc.
    // documentStyle: IDocumentStyle;
    // Configuration for document layout.
    docsConfig: IDocsConfig;
    // The initial layout skeleton, it will be the empty skeleton if it's the first layout.
    skeleton: IDocumentSkeletonCached;
    // The position coordinates of the layout,
    // which are used to indicate which section and paragraph are currently layout,
    // and used to support the starting point of the reflow when re-layout.
    // Layout from the beginning if the paragraphIndex is null.
    layoutStartPointer: Record<string, Nullable<number>>;
    // It is used to identify whether it is a re-layout,
    // and if it is a re-layout, the skeleton needs to be backtracked to the layoutStartPointer states.
    isDirty: boolean;
    // Used to store the resource of document and resource cache.
    skeletonResourceReference: ISkeletonResourceReference;
    // Positioned float objects cache.
    floatObjectsCache: Map<string, {
        count: number;
        page: IDocumentSkeletonPage;
        floatObject: IFloatObject;
    }>;
    paragraphConfigCache: Map<string, Map<number, IParagraphConfig>>;
    sectionBreakConfigCache: Map<number, ISectionBreakConfig>;
    paragraphsOpenNewPage: Set<number>;
    // Use for hyphenation.
    hyphen: Hyphen;
    // Use for detect language for paragraph content.
    languageDetector: LanguageDetector;
}

const DEFAULT_SECTION_BREAK: ISectionBreak = {
    sectionId: 'section_render_default',
    columnProperties: [],
    columnSeparatorType: ColumnSeparatorType.NONE,
    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
    startIndex: 0,
};

export const DEFAULT_PAGE_SIZE = { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY };

const DEFAULT_MODERN_DOCUMENT_STYLE: IDocumentStyle = {
    pageNumberStart: 1,
    pageSize: {
        width: MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM],
        height: Number.POSITIVE_INFINITY,
    },
    marginTop: MODERN_DOCUMENT_DEFAULT_MARGIN,
    marginBottom: MODERN_DOCUMENT_DEFAULT_MARGIN,
    marginRight: MODERN_DOCUMENT_DEFAULT_MARGIN,
    marginLeft: MODERN_DOCUMENT_DEFAULT_MARGIN,
    renderConfig: {
        vertexAngle: 0,
        centerAngle: 0,
        background: {
            rgb: '#FFFFFF',
        },
    },
    defaultHeaderId: '',
    defaultFooterId: '',
    evenPageHeaderId: '',
    evenPageFooterId: '',
    firstPageHeaderId: '',
    firstPageFooterId: '',
    evenAndOddHeaders: BooleanNumber.FALSE,
    useFirstPageHeaderFooter: BooleanNumber.FALSE,
    marginHeader: 0,
    marginFooter: 0,
};

const DEFAULT_MODERN_SECTION_BREAK: Partial<ISectionBreak> = {
    columnProperties: [],
    columnSeparatorType: ColumnSeparatorType.NONE,
    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
};

export function prepareSectionBreakConfig(ctx: ILayoutContext, nodeIndex: number) {
    const { viewModel, dataModel, docsConfig } = ctx;
    const sectionNode = viewModel.getChildren()[nodeIndex];
    let { documentStyle } = dataModel;
    const { documentFlavor } = documentStyle;
    let sectionBreak = viewModel.getSectionBreak(sectionNode.endIndex) || DEFAULT_SECTION_BREAK;
    const sectionBreaks = viewModel.getChildren().map((node) => viewModel.getSectionBreak(node.endIndex) || DEFAULT_SECTION_BREAK);
    sectionBreak = {
        ...sectionBreak,
        ...resolveSectionHeaderFooterReferences(documentStyle, sectionBreaks, nodeIndex),
    };

    // If the configuration is in modern mode, use the style configuration of modern mode to overwrite the original configuration.
    // In modern mode, there are no pages, no sections, no columns. There are no headers and footers, and margins are all defaults.
    if (documentFlavor === DocumentFlavor.MODERN) {
        const modernPageWidth = documentStyle.pageSize?.width ?? DEFAULT_MODERN_DOCUMENT_STYLE.pageSize!.width;
        sectionBreak = Object.assign({}, sectionBreak, DEFAULT_MODERN_SECTION_BREAK);
        documentStyle = Object.assign({}, documentStyle, DEFAULT_MODERN_DOCUMENT_STYLE, {
            pageSize: {
                ...DEFAULT_MODERN_DOCUMENT_STYLE.pageSize!,
                width: modernPageWidth,
            },
        });
    }

    const {
        pageNumberStart: global_pageNumberStart = 1, // pageNumberStart
        pageSize: global_pageSize = DEFAULT_PAGE_SIZE,
        pageOrient: global_pageOrient = PageOrientType.PORTRAIT,
        defaultHeaderId: global_defaultHeaderId,
        defaultFooterId: global_defaultFooterId,
        evenPageHeaderId: global_evenPageHeaderId,
        evenPageFooterId: global_evenPageFooterId,
        firstPageHeaderId: global_firstPageHeaderId,
        firstPageFooterId: global_firstPageFooterId,
        useFirstPageHeaderFooter: global_useFirstPageHeaderFooter,
        evenAndOddHeaders: global_evenAndOddHeaders,

        marginTop: global_marginTop = 0,
        marginBottom: global_marginBottom = 0,
        marginRight: global_marginRight = 0,
        marginLeft: global_marginLeft = 0,
        marginHeader: global_marginHeader = 0,
        marginFooter: global_marginFooter = 0,

        autoHyphenation = BooleanNumber.FALSE,
        doNotHyphenateCaps = BooleanNumber.FALSE,
        consecutiveHyphenLimit = Number.POSITIVE_INFINITY,
        hyphenationZone,

        renderConfig: global_renderConfig = {
            horizontalAlign: HorizontalAlign.LEFT,
            verticalAlign: VerticalAlign.TOP,
            centerAngle: 0,
            vertexAngle: 0,
            wrapStrategy: WrapStrategy.UNSPECIFIED,
        },
    } = documentStyle;
    const {
        sectionId,
        charSpace = 0, // charSpace
        linePitch = 15.6, // linePitch pt
        gridType = GridType.LINES, // gridType

        pageNumberStart = global_pageNumberStart,
        pageSize = global_pageSize,
        pageOrient = global_pageOrient,
        marginTop = global_marginTop,
        marginBottom = global_marginBottom,
        marginRight = global_marginRight,
        marginLeft = global_marginLeft,
        marginHeader = global_marginHeader,
        marginFooter = global_marginFooter,

        defaultHeaderId = global_defaultHeaderId,
        defaultFooterId = global_defaultFooterId,
        evenPageHeaderId = global_evenPageHeaderId,
        evenPageFooterId = global_evenPageFooterId,
        firstPageHeaderId = global_firstPageHeaderId,
        firstPageFooterId = global_firstPageFooterId,
        useFirstPageHeaderFooter = global_useFirstPageHeaderFooter,
        evenAndOddHeaders = global_evenAndOddHeaders,

        columnProperties = [],
        columnSeparatorType = ColumnSeparatorType.NONE,
        contentDirection,
        sectionType,
        textDirection,
        renderConfig = global_renderConfig,
    } = sectionBreak;

    const sectionNodeNext = viewModel.getChildren()[nodeIndex + 1];
    const sectionTypeNext = viewModel.getSectionBreak(sectionNodeNext?.endIndex)?.sectionType;

    const headerIds = { defaultHeaderId, evenPageHeaderId, firstPageHeaderId };
    const footerIds = { defaultFooterId, evenPageFooterId, firstPageFooterId };

    if (pageSize.width === null) {
        pageSize.width = Number.POSITIVE_INFINITY;
    }

    if (pageSize.height === null) {
        pageSize.height = Number.POSITIVE_INFINITY;
    }

    const sectionBreakConfig: ISectionBreakConfig = {
        sectionId,
        charSpace,
        linePitch,
        gridType,

        pageNumberStart,
        pageSize,
        pageOrient,
        marginTop,
        marginBottom,
        marginRight,
        marginLeft,
        marginHeader,
        marginFooter,

        headerIds,
        footerIds,

        useFirstPageHeaderFooter,
        evenAndOddHeaders,

        columnProperties,
        columnSeparatorType,
        contentDirection,
        sectionType,
        sectionTypeNext,
        textDirection,
        renderConfig,

        autoHyphenation,
        doNotHyphenateCaps,
        consecutiveHyphenLimit,
        hyphenationZone,

        ...docsConfig,
    };

    return sectionBreakConfig;
}

export function resetContext(ctx: ILayoutContext) {
    ctx.isDirty = false;
    ctx.skeleton.drawingAnchor?.clear();
}

export function mergeByV<T = unknown>(object: unknown, originObject: unknown, type: 'max' | 'min') {
    const mergeIterator = (obj: unknown, originObj: unknown, key: string) => {
        if (key !== 'v') {
            if (typeof originObj === 'object') {
                return mergeWith(obj, originObj, mergeIterator);
            } else {
                return originObj ?? obj;
            }
        }
        if (typeof originObj === 'number') {
            if (typeof obj === 'number') {
                return type === 'max' ? Math.max(originObj, obj) : Math.min(originObj, obj);
            }
        }
        return originObj ?? obj;
    };
    return mergeWith(object, originObject, mergeIterator) as T;
}

export function getPageFromPath(skeletonData: IDocumentSkeletonCached, path: (string | number)[]): Nullable<IDocumentSkeletonPage> {
    const pathCopy = [...path];
    let page: Nullable<IDocumentSkeletonPage> = null;

    while (pathCopy.length > 0) {
        const field = pathCopy.shift();

        if (field === 'pages') {
            const pageIndex = pathCopy.shift() as number;
            page = skeletonData.pages[pageIndex];
        } else if (field === 'skeTables') {
            if (page == null) {
                return null;
            }

            const tableId = pathCopy.shift() as string;
            pathCopy.shift(); // rows
            const rowIndex = pathCopy.shift() as number;
            pathCopy.shift(); // cells
            const cellIndex = pathCopy.shift() as number;

            page = page.skeTables?.get(tableId)?.rows[rowIndex]?.cells[cellIndex];
        } else if (field === 'skeColumnGroups') {
            if (page == null) {
                return null;
            }

            const columnGroupId = pathCopy.shift() as string;
            pathCopy.shift(); // columns
            const columnIndex = pathCopy.shift() as number;
            pathCopy.shift(); // page

            page = page.skeColumnGroups?.get(columnGroupId)?.columns[columnIndex]?.page;
        }
    }

    return page;
}
