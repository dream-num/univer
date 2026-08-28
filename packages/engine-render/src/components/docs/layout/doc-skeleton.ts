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

import type { ColumnSeparatorType, ISectionColumnProperties, LocaleService, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonCached, IDocumentSkeletonColumn, IDocumentSkeletonColumnGroup, IDocumentSkeletonColumnGroupColumn, IDocumentSkeletonDivide, IDocumentSkeletonDrawing, IDocumentSkeletonDrawingAnchor, IDocumentSkeletonGlyph, IDocumentSkeletonLine, IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonSection, IDocumentSkeletonTable, ISkeletonResourceReference } from '../../../basics/i-document-skeleton-cached';
import type { IDocsConfig, INodeInfo, INodePosition, INodeSearch, ISectionBreakConfig } from '../../../basics/interfaces';
import type { IViewportInfo, Vector2 } from '../../../basics/vector2';
import type { IDocsCustomBlockRenderViewport } from '../custom-block-render-viewport';
import type { DataStreamTreeNode } from '../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../view-model/document-view-model';
import type { ISlicedTableSkeletonBuildState, ITableSkeletonBuildState } from './block/table';
import type { IDocumentSkeletonPagePatch } from './document-layout-page-patch';
import type { IDocumentLayoutBlockGeometryPublication, IDocumentLayoutDrawingAnchorPublication, IDocumentLayoutGeometryPublication, IDocumentLayoutPagePublication, IDocumentLayoutResourcePublication } from './document-layout-publication';
import type { DocumentLayoutMode, DocumentLayoutReason, IDocumentLayoutApplyResult, IDocumentLayoutInvalidation, IDocumentLayoutPageRange, IDocumentLayoutProgress, IDocumentLayoutProtectedPageRange, IDocumentLayoutProtectedRange } from './document-layout-types';
import type { IDocumentPaginationMetrics, ILayoutContext } from './tools';
import { BooleanNumber, DataStreamTreeNodeType, DataStreamTreeTokenType, DocumentFlavor, PRESET_LIST_TYPE, SectionType, Skeleton } from '@univerjs/core';
import { Subject } from 'rxjs';
import { BreakType, DocumentSkeletonPageType, GlyphType, LineType, PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import { getDocsCustomBlockRenderViewport } from '../custom-block-render-viewport';
import { getDocumentCompatibilityPolicy } from '../document-compatibility';
import { Liquid } from '../liquid';
import { getDocsTableRenderViewport, hasDocsTableHorizontalViewport } from '../table-render-viewport';
import { DocumentEditArea } from '../view-model/document-view-model';
import { dealWithSection } from './block/section';
import {
    cachePrecomputedSlicedTableSkeletons,
    cachePrecomputedTableSkeleton,
    getTableIdAndSliceIndex,

    startTableSkeletonBuild,
    startTableSkeletonsBuild,
    stepTableSkeletonBuild,
    stepTableSkeletonsBuild,
} from './block/table';
import { applyDocumentSkeletonContinuousBlock, hydrateDocumentSkeletonPage, hydrateDocumentSkeletonPageMaterializationPlaceholder, serializeDocumentSkeletonPage } from './document-layout-page-patch';
import { Hyphen } from './hyphenation/hyphen';
import { LanguageDetector } from './hyphenation/language-detector';
import { createSkeletonPage } from './model/page';
import { createSkeletonSection } from './model/section';
import {
    getLastNotFullColumnInfo,
    getLastPage,
    getNullSkeleton,
    getPageFromPath,

    prepareSectionBreakConfig,
    resetContext,
    setPageParent,
    updateBlockIndex,
    updateInlineDrawingCoordsAndBorder,
} from './tools';

function getEffectiveSectionType(sectionType: SectionType | undefined): SectionType {
    return sectionType == null || sectionType === SectionType.SECTION_TYPE_UNSPECIFIED
        ? SectionType.NEXT_PAGE
        : sectionType;
}

function hasCompatiblePageGeometry(page: IDocumentSkeletonPage, config: ReturnType<typeof prepareSectionBreakConfig>): boolean {
    const { pageSize, pageOrient, marginTop, marginBottom, marginLeft, marginRight } = config;
    return page.pageWidth === pageSize?.width &&
        page.pageHeight === pageSize?.height &&
        page.pageOrient === pageOrient &&
        page.originMarginTop === marginTop &&
        page.originMarginBottom === marginBottom &&
        page.marginLeft === marginLeft &&
        page.marginRight === marginRight;
}

function isSameLayoutMetric(left: number, right: number): boolean {
    return Math.abs(left - right) < 0.01;
}

function hasCompatiblePhysicalPage(page: IDocumentSkeletonPage, config: ReturnType<typeof prepareSectionBreakConfig>): boolean {
    const { pageSize, pageOrient } = config;
    return page.pageWidth === pageSize?.width &&
        page.pageHeight === pageSize?.height &&
        page.pageOrient === pageOrient;
}

function hasAvailableContinuousSectionSpace(page: IDocumentSkeletonPage): boolean {
    const lastSection = page.sections.at(-1);
    const contentHeight = page.pageHeight - page.marginTop - page.marginBottom;
    const flowHeight = Math.max(
        0,
        ...(lastSection?.columns ?? []).flatMap((column) =>
            column.lines.map((line) => line.top + line.lineHeight)
        )
    );
    return (lastSection?.top ?? 0) + flowHeight < contentHeight - 1e-6;
}

function hasOnlyExplicitPageBoundaryMarkers(page: IDocumentSkeletonPage): boolean {
    if ((page.skeTables?.size ?? 0) > 0) {
        return false;
    }
    return (page.sections ?? []).every((section) =>
        section.columns.every((column) =>
            column.lines.every((line) =>
                line.divides.every((divide) =>
                    divide.glyphGroup.every(({ raw, streamType }) =>
                        raw === DataStreamTreeTokenType.PARAGRAPH ||
                        streamType === DataStreamTreeTokenType.PARAGRAPH ||
                        raw === DataStreamTreeTokenType.PAGE_BREAK ||
                        streamType === DataStreamTreeTokenType.PAGE_BREAK ||
                        raw === DataStreamTreeTokenType.SECTION_BREAK ||
                        streamType === DataStreamTreeTokenType.SECTION_BREAK
                    )
                )
            )
        )
    );
}

interface IColumnFlowLine {
    line: IDocumentSkeletonLine;
    gapBefore: number;
}

function collectColumnFlowLines(columns: IDocumentSkeletonColumn[]): IColumnFlowLine[] {
    return columns.flatMap((column) => {
        let previousBottom = 0;
        return column.lines.map((line) => {
            const gapBefore = Math.max(0, line.top - previousBottom);
            previousBottom = line.top + line.lineHeight;
            return { line, gapBefore };
        });
    });
}

function takeBalancedColumnLineCount(
    flowLines: IColumnFlowLine[],
    startIndex: number,
    remainingColumnCount: number,
    targetHeight: number
): number {
    const maximumCount = flowLines.length - startIndex - (remainingColumnCount - 1);
    let count = 0;
    let height = 0;

    while (count < maximumCount) {
        const { line, gapBefore } = flowLines[startIndex + count];
        const nextHeight = height + gapBefore + line.lineHeight;
        if (count > 0 && Math.abs(targetHeight - height) <= Math.abs(targetHeight - nextHeight)) {
            break;
        }
        height = nextHeight;
        count++;
    }

    return Math.max(1, count);
}

function hasSameColumnGeometry(
    currentColumns: ISectionColumnProperties[],
    nextColumns: ISectionColumnProperties[]
): boolean {
    return currentColumns.length === nextColumns.length && currentColumns.every((column, index) => {
        const nextColumn = nextColumns[index];
        return nextColumn != null &&
            Math.abs(column.width - nextColumn.width) <= 0.01 &&
            Math.abs(column.paddingEnd - nextColumn.paddingEnd) <= 0.01;
    });
}

/**
 * Word balances the final page of a multi-column section before a continuous
 * section break. The normal page layout intentionally fills columns in flow
 * order, so rebalance the final line-only fragment once its complete height is
 * known. Tables, column groups, drawings, and unequal-width columns stay on
 * the regular layout path because moving those blocks requires a full relayout.
 */
function balanceFinalContinuousColumnSection(page: IDocumentSkeletonPage): void {
    const section = page.sections.at(-1);
    if (section == null || section.columns.length < 2 || section.columns.at(-1)?.isFull) {
        return;
    }
    const firstWidth = section.columns[0].width;
    if (
        section.columns.some((column) =>
            Math.abs(column.width - firstWidth) > 0.01 ||
            column.drawingLRIds.length > 0 ||
            column.lines.some((line) => line.type !== LineType.PARAGRAPH || line.tableId !== '')
        ) ||
        page.skeColumnGroups.size > 0 ||
        page.skeDrawings.size > 0
    ) {
        return;
    }

    const flowLines = collectColumnFlowLines(section.columns);
    if (flowLines.length < section.columns.length) {
        return;
    }

    let lineIndex = 0;
    let remainingHeight = flowLines.reduce(
        (height, { line, gapBefore }) => height + gapBefore + line.lineHeight,
        0
    );
    for (let columnIndex = 0; columnIndex < section.columns.length; columnIndex++) {
        const column = section.columns[columnIndex];
        const remainingColumnCount = section.columns.length - columnIndex;
        const lineCount = remainingColumnCount === 1
            ? flowLines.length - lineIndex
            : takeBalancedColumnLineCount(
                flowLines,
                lineIndex,
                remainingColumnCount,
                remainingHeight / remainingColumnCount
            );
        const assignedLines = flowLines.slice(lineIndex, lineIndex + lineCount);
        let columnHeight = 0;

        column.lines = assignedLines.map(({ line, gapBefore }) => {
            columnHeight += gapBefore;
            line.top = columnHeight;
            line.parent = column;
            columnHeight += line.lineHeight;
            return line;
        });
        column.height = columnHeight;
        column.isFull = false;
        remainingHeight -= assignedLines.reduce(
            (height, { line, gapBefore }) => height + gapBefore + line.lineHeight,
            0
        );
        lineIndex += lineCount;
    }

    section.height = Math.max(...section.columns.map((column) => column.height ?? 0));
}

function isTargetPageParity(pageNumber: number, sectionType: SectionType): boolean {
    return sectionType === SectionType.EVEN_PAGE ? pageNumber % 2 === 0 : pageNumber % 2 === 1;
}

export enum DocumentSkeletonState {
    PENDING = 'pending',
    CALCULATING = 'calculating',
    READY = 'ready',
    INVALID = 'invalid',
}

export interface IDocumentCustomBlockPresentationRefreshResult {
    didRefresh: boolean;
    requiresLayout: boolean;
}

interface IIncrementalLayoutState {
    generation: number;
    reason: DocumentLayoutReason;
    mode: DocumentLayoutMode;
    ctx: ILayoutContext;
    sectionIndex: number;
    paragraphIndex: number;
    sectionInitialized: boolean;
    sectionBreakConfig: Nullable<ISectionBreakConfig>;
    layoutAnchor: Nullable<number>;
    priorityAnchor: Nullable<number>;
    priorityPageIndex: number;
    priorityPageEnd: Nullable<number>;
    interactionPageTail: Nullable<IInteractionPageTail>;
    interactionPageComplete: boolean;
    interactionWindowComplete: boolean;
    interactionWindowResume: Nullable<IInteractionWindowResume>;
    invalidation: Nullable<IDocumentLayoutInvalidation>;
    laidOutThrough: number;
    stableLaidOutThrough: number;
    complete: boolean;
    cancelled: boolean;
    processedBlockCount: number;
    totalBlockCount: number;
    startedAt: number;
    maxBlockDuration: number;
    pendingTableBuild: Nullable<ITableSkeletonBuildState>;
    pendingSlicedTableBuild: Nullable<ISlicedTableSkeletonBuildState>;
    pendingParagraphCheckpoint: Nullable<IIncrementalParagraphCheckpoint>;
    stablePageCount: number;
    finalizedPageCount: number;
    anchorPublished: boolean;
    lastPublishedPageCount: number;
    lastPublishedBlockCount: number;
    publicationRevision: number;
    reuseUnaffectedTail: boolean;
    reusedTail: boolean;
    tailConvergencePageCount: number;
    dirtyRetryCount: number;
}

interface IInteractionPageTail {
    previousSkeleton: IDocumentSkeletonCached;
    previousPage: IDocumentSkeletonPage;
    anchorEnd: number;
    previousAnchorEnd: number;
    pageEnd: number;
    nextBlockIndex: number;
    nextSectionIndex: number;
    nextParagraphIndex: number;
    resumeBlockIndex: number;
    resumeSectionIndex: number;
    resumeParagraphIndex: number;
    terminal: boolean;
}

interface IInteractionWindowResume {
    anchorEnd: number;
    pageEnd: number;
    processedBlockCount: number;
    sectionIndex: number;
    paragraphIndex: number;
}

interface IIncrementalParagraphCheckpoint {
    pageIndex: number;
    page: IDocumentSkeletonPage;
    skeHeaders: IDocumentSkeletonCached['skeHeaders'];
    skeFooters: IDocumentSkeletonCached['skeFooters'];
    skeListLevel: NonNullable<ISkeletonResourceReference['skeListLevel']>;
    drawingAnchor: NonNullable<ISkeletonResourceReference['drawingAnchor']>;
    layoutStartPointer: ILayoutContext['layoutStartPointer'];
    isDirty: boolean;
    floatObjectsCache: ILayoutContext['floatObjectsCache'];
    paragraphConfigCache: ILayoutContext['paragraphConfigCache'];
    sectionBreakConfigCache: ILayoutContext['sectionBreakConfigCache'];
    paragraphsOpenNewPage: ILayoutContext['paragraphsOpenNewPage'];
    paginationMetrics: ILayoutContext['paginationMetrics'];
}

interface ITopLevelBlockEntry {
    block: DataStreamTreeNode;
    sectionIndex: number;
    paragraphIndex: number;
}

function getLayoutNow(): number {
    return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function mapCurrentOffsetToPrevious(
    offset: number,
    invalidation: IDocumentLayoutInvalidation | undefined
): number {
    if (invalidation == null || offset < invalidation.oldStart) {
        return offset;
    }
    if (offset < invalidation.newEnd) {
        return invalidation.oldStart;
    }
    return offset - (invalidation.newEnd - invalidation.oldEnd);
}

function mapPreviousOffsetToCurrent(
    offset: number,
    invalidation: IDocumentLayoutInvalidation | undefined
): number {
    if (invalidation == null || offset < invalidation.oldStart) {
        return offset;
    }
    if (offset < invalidation.oldEnd) {
        return invalidation.newEnd;
    }
    return offset + (invalidation.newEnd - invalidation.oldEnd);
}

function clonePageFlowForPublish(source: IDocumentSkeletonPage): IDocumentSkeletonPage {
    const page: IDocumentSkeletonPage = {
        ...source,
        sections: [],
        // Continuous-page merging translates drawing coordinates. Keep partial
        // publications isolated from the active layout graph so publishing the
        // same page fragment again cannot accumulate that translation.
        skeDrawings: new Map([...source.skeDrawings].map(([drawingId, drawing]) => [
            drawingId,
            { ...drawing },
        ])),
        skeTables: new Map([...source.skeTables].map(([tableId, table]) => [
            tableId,
            { ...table },
        ])),
        skeColumnGroups: new Map([...source.skeColumnGroups].map(([groupId, group]) => [
            groupId,
            { ...group },
        ])),
        parent: undefined,
    };

    const cloneFlowNodes = (sourcePage: IDocumentSkeletonPage, targetPage: IDocumentSkeletonPage) => {
        targetPage.sections = sourcePage.sections.map((sourceSection) => {
            const section: IDocumentSkeletonSection = {
                ...sourceSection,
                columns: [],
                parent: targetPage,
            };
            section.columns = sourceSection.columns.map((sourceColumn) => {
                const column: IDocumentSkeletonColumn = {
                    ...sourceColumn,
                    lines: [],
                    parent: section,
                };
                column.lines = sourceColumn.lines.map((sourceLine) => {
                    const line: IDocumentSkeletonLine = {
                        ...sourceLine,
                        divides: [],
                        parent: column,
                    };
                    if (sourceLine.bullet != null) {
                        line.bullet = { ...sourceLine.bullet };
                    }
                    line.divides = sourceLine.divides.map((sourceDivide): IDocumentSkeletonDivide => {
                        const divide: IDocumentSkeletonDivide = {
                            ...sourceDivide,
                            glyphGroup: [],
                            parent: line,
                        };
                        // Published flow nodes own a separate parent graph. Clone glyph containers
                        // so selection hit testing resolves positions against the published page.
                        divide.glyphGroup = sourceDivide.glyphGroup.map((glyph) => ({
                            ...glyph,
                            parent: divide,
                        }));
                        return divide;
                    });
                    return line;
                });
                return column;
            });
            return section;
        });
    };

    cloneFlowNodes(source, page);

    const cloneEmbeddedStructures = (sourcePage: IDocumentSkeletonPage, targetPage: IDocumentSkeletonPage) => {
        targetPage.skeTables = new Map([...sourcePage.skeTables].map(([tableId, sourceTable]) => {
            const table: IDocumentSkeletonTable = {
                ...sourceTable,
                rows: [],
                parent: targetPage,
            };
            table.rows = sourceTable.rows.map((sourceRow) => {
                const row: IDocumentSkeletonRow = {
                    ...sourceRow,
                    cells: [],
                    parent: table,
                };
                row.cells = sourceRow.cells.map((sourceCell) => {
                    const cell = {
                        ...sourceCell,
                        sections: [],
                        parent: row,
                    };
                    cloneFlowNodes(sourceCell, cell);
                    cloneEmbeddedStructures(sourceCell, cell);
                    return cell;
                });
                return row;
            });
            return [tableId, table];
        }));
        targetPage.skeColumnGroups = new Map([...sourcePage.skeColumnGroups].map(([groupId, sourceGroup]) => {
            const group: IDocumentSkeletonColumnGroup = {
                ...sourceGroup,
                columns: [],
                parent: targetPage,
            };
            group.columns = sourceGroup.columns.map((sourceColumn) => {
                const columnPage: IDocumentSkeletonPage = {
                    ...sourceColumn.page,
                    sections: [],
                };
                const column: IDocumentSkeletonColumnGroupColumn = {
                    ...sourceColumn,
                    parent: group,
                    page: columnPage,
                };
                columnPage.parent = column;
                cloneFlowNodes(sourceColumn.page, column.page);
                cloneEmbeddedStructures(sourceColumn.page, column.page);
                return column;
            });
            return [groupId, group];
        }));
    };

    cloneEmbeddedStructures(source, page);

    return page;
}

function copyPageBoundaryMetadata(
    target: IDocumentSkeletonPage,
    source: IDocumentSkeletonPage
): void {
    target.breakType = source.breakType;
    if (source.isExplicitPageBreak == null) {
        delete target.isExplicitPageBreak;
    } else {
        target.isExplicitPageBreak = source.isExplicitPageBreak;
    }
    if (source.isNaturalPageOverflow == null) {
        delete target.isNaturalPageOverflow;
    } else {
        target.isNaturalPageOverflow = source.isNaturalPageOverflow;
    }
}

function shiftPageCharacterOffsets(page: IDocumentSkeletonPage, delta: number): void {
    const shiftRange = (value: { st: number; ed: number }) => {
        value.st += delta;
        value.ed += delta;
    };
    const shiftFlow = (flowPage: IDocumentSkeletonPage) => {
        shiftRange(flowPage);
        for (const section of flowPage.sections) {
            shiftRange(section);
            for (const column of section.columns) {
                shiftRange(column);
                for (const line of column.lines) {
                    shiftRange(line);
                    line.paragraphIndex += delta;
                    if (line.bullet != null) {
                        line.bullet.startIndexItem += delta;
                    }
                    for (const divide of line.divides) {
                        shiftRange(divide);
                    }
                }
            }
        }
    };
    const shiftEmbeddedStructures = (flowPage: IDocumentSkeletonPage) => {
        for (const table of flowPage.skeTables.values()) {
            shiftRange(table);
            for (const row of table.rows) {
                shiftRange(row);
                for (const cell of row.cells) {
                    // Empty cells use the zero range as a sentinel. Populated cells
                    // retain body-absolute ranges and therefore follow the edit delta.
                    if (cell.st !== 0 || cell.ed !== 0) {
                        shiftFlow(cell);
                        shiftEmbeddedStructures(cell);
                    }
                }
            }
        }
        for (const group of flowPage.skeColumnGroups.values()) {
            shiftRange(group);
            for (const column of group.columns) {
                shiftRange(column);
                if (column.page.st !== 0 || column.page.ed !== 0) {
                    shiftFlow(column.page);
                    shiftEmbeddedStructures(column.page);
                }
            }
        }
    };

    shiftFlow(page);
    shiftEmbeddedStructures(page);
}

function clonePageLayoutPlaceholderForPublish(source: IDocumentSkeletonPage): IDocumentSkeletonPage {
    return {
        ...source,
        isLayoutPlaceholder: true,
        sections: [],
        st: -1,
        ed: -1,
        skeDrawings: new Map(),
        skeTables: new Map(),
        skeColumnGroups: new Map(),
        parent: undefined,
    };
}

function clonePageMaterializationPlaceholderForPublish(source: IDocumentSkeletonPage): IDocumentSkeletonPage {
    const placeholder = clonePageLayoutPlaceholderForPublish(source);
    delete placeholder.isLayoutPlaceholder;
    placeholder.isMaterializationPlaceholder = true;
    placeholder.st = source.st;
    placeholder.ed = source.ed;
    return placeholder;
}

function hasSamePageExitGeometry(
    previous: IDocumentSkeletonPage,
    current: IDocumentSkeletonPage
): boolean {
    const scalarKeys = [
        'sectionId',
        'pageWidth',
        'pageHeight',
        'pageOrient',
        'marginLeft',
        'marginRight',
        'marginTop',
        'marginBottom',
        'pageNumber',
        'pageNumberStart',
    ] as const;
    if (scalarKeys.some((key) => previous[key] !== current[key])) {
        return false;
    }

    return true;
}

function removeDupPages(ctx: ILayoutContext) {
    const hash = new Set();

    ctx.skeleton.pages = ctx.skeleton.pages.filter((page) => {
        const hasPage = hash.has(page);
        hash.add(page);

        return !hasPage;
    });
}

function mergeContinuousDuplicatePages(pages: IDocumentSkeletonPage[], mergeAll = false) {
    for (let index = 1; index < pages.length;) {
        const previousPage = pages[index - 1];
        const page = pages[index];

        if (!mergeAll && (previousPage.pageNumber !== page.pageNumber || previousPage.sectionId !== page.sectionId)) {
            index++;
            continue;
        }

        const topOffset = previousPage.height;

        for (const section of page.sections) {
            section.top += topOffset;
            section.parent = previousPage;
            previousPage.sections.push(section);
        }

        page.skeDrawings?.forEach((drawing, drawingId) => {
            drawing.aTop += topOffset;
            previousPage.skeDrawings.set(drawingId, drawing);
        });

        page.skeTables?.forEach((table, tableId) => {
            table.top += topOffset;
            table.parent = previousPage;
            previousPage.skeTables.set(tableId, table);
        });

        page.skeColumnGroups?.forEach((columnGroup, columnGroupId) => {
            columnGroup.top += topOffset;
            columnGroup.parent = previousPage;
            previousPage.skeColumnGroups.set(columnGroupId, columnGroup);
        });

        previousPage.height += page.height;
        previousPage.width = Math.max(previousPage.width, page.width);
        previousPage.ed = Math.max(previousPage.ed, page.ed);
        pages.splice(index, 1);
    }
}

interface IDistance {
    coordInPage: boolean;
    distance: number;
    nestLevel: number;
}

interface INearestCache {
    nearestNodeList: INodeInfo[];
    nearestNodeDistanceList: IDistance[];
}

export interface IFindNodeRestrictions {
    strict: boolean;
    segmentId: string;
    segmentPage: number;
}

function getPagePath(page: IDocumentSkeletonPage) {
    const path: (string | number)[] = [];

    // eslint-disable-next-line ts/no-explicit-any
    let skeNode: any = page;
    // eslint-disable-next-line ts/no-explicit-any
    let parent: any = skeNode.parent;
    while (parent) {
        if (parent.page === skeNode && parent.parent?.columns) {
            const index = parent.parent.columns.indexOf(parent);

            if (index !== -1) {
                path.unshift('columns', index, 'page');
            }

            skeNode = parent.parent;
            parent = skeNode?.parent;
            continue;
        }

        if (parent.pages) {
            const index = parent.pages.indexOf(skeNode);

            if (index !== -1) {
                path.unshift('pages', index);
            }
        } else if (parent.cells) {
            const index = parent.cells.indexOf(skeNode);

            if (index !== -1) {
                path.unshift('cells', index);
            }
        } else if (parent.rows) {
            const index = parent.rows.indexOf(skeNode);

            if (index !== -1) {
                path.unshift('rows', index);
            }
        } else if (parent.skeTables && parent.skeTables.has(skeNode.tableId)) {
            path.unshift('skeTables', skeNode.tableId);
        } else if (parent.skeColumnGroups && parent.skeColumnGroups.has(skeNode.columnGroupId)) {
            path.unshift('skeColumnGroups', skeNode.columnGroupId);
        }

        skeNode = parent;
        parent = parent?.parent;
    }

    return path;
}

function getBoundaryGlyphInPage(page: IDocumentSkeletonPage, useLast: boolean) {
    const sections = useLast ? [...page.sections].reverse() : page.sections;

    for (const section of sections) {
        const columns = useLast ? [...section.columns].reverse() : section.columns;
        for (const column of columns) {
            const lines = useLast ? [...column.lines].reverse() : column.lines;
            for (const line of lines) {
                const divides = useLast ? [...line.divides].reverse() : line.divides;
                for (const divide of divides) {
                    const glyphGroup = useLast ? [...divide.glyphGroup].reverse() : divide.glyphGroup;
                    const glyph = glyphGroup.find((item) => item.content?.length);

                    if (glyph) {
                        return {
                            section,
                            column,
                            line,
                            divide,
                            glyph,
                        };
                    }
                }
            }
        }
    }
}

function isHitTestAddressableGlyph(glyph: IDocumentSkeletonGlyph): boolean {
    return Boolean(glyph.content?.length) ||
        (glyph.streamType === DataStreamTreeTokenType.PARAGRAPH && glyph.count > 0);
}

function getFirstBodyFlowCharIndex(page: IDocumentSkeletonPage): number {
    for (const section of page.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                for (const divide of line.divides) {
                    let charIndex = divide.st;
                    for (const glyph of divide.glyphGroup) {
                        if (isHitTestAddressableGlyph(glyph)) {
                            return charIndex;
                        }
                        charIndex += glyph.count;
                    }
                }
            }
        }
    }

    // A pure table-continuation page has no top-level body glyph. Its aggregate
    // start remains the correct signal that the spanning table must be rebuilt.
    return page.st;
}

function getLastBodyFlowCharIndex(page: IDocumentSkeletonPage): number {
    for (const section of [...page.sections].reverse()) {
        for (const column of [...section.columns].reverse()) {
            for (const line of [...column.lines].reverse()) {
                for (const divide of [...line.divides].reverse()) {
                    let charIndex = divide.st;
                    let lastAddressableIndex: number | null = null;
                    for (const glyph of divide.glyphGroup) {
                        if (isHitTestAddressableGlyph(glyph)) {
                            lastAddressableIndex = charIndex + Math.max(1, glyph.count) - 1;
                        }
                        charIndex += glyph.count;
                    }
                    if (lastAddressableIndex != null) {
                        return lastAddressableIndex;
                    }
                }
            }
        }
    }

    return page.ed;
}

function serializePaginatedContinuationCheckpoint(page: IDocumentSkeletonPagePatch): string {
    return JSON.stringify({
        st: page.st,
        ed: page.ed,
        sectionId: page.sectionId,
        headerId: page.headerId,
        footerId: page.footerId,
        pageWidth: page.pageWidth,
        pageHeight: page.pageHeight,
        pageOrient: page.pageOrient,
        marginLeft: page.marginLeft,
        marginRight: page.marginRight,
        marginTop: page.marginTop,
        marginBottom: page.marginBottom,
        pageNumber: page.pageNumber,
        pageNumberStart: page.pageNumberStart,
        breakType: page.breakType,
        segmentId: page.segmentId,
        type: page.type,
        // Main owns the complete protected-page geometry. Internal line wraps do
        // not participate in the merge checkpoint because Worker pages after the
        // protected range are complete, self-contained page publications. The
        // checkpoint only needs to prove that the next page starts at the same
        // logical offset and with the same paginated section configuration.
        tables: page.skeTables.map(([tableId, table]) => ({
            tableId,
            st: table.st,
            ed: table.ed,
            rows: table.rows.map((row) => ({
                index: row.index,
                st: row.st,
                ed: row.ed,
                isRepeatRow: row.isRepeatRow,
                cells: row.cells.map((cell) => ({ st: cell.st, ed: cell.ed })),
            })),
        })),
        columnGroups: page.skeColumnGroups.map(([columnGroupId, group]) => ({
            columnGroupId,
            st: group.st,
            ed: group.ed,
            columns: group.columns.map((column) => ({
                columnId: column.columnId,
                st: column.st,
                ed: column.ed,
                pageSt: column.page.st,
                pageEd: column.page.ed,
            })),
        })),
    });
}

function resolveMostSpecificPageByCharIndex(page: IDocumentSkeletonPage, charIndex: number): IDocumentSkeletonPage {
    for (const table of page.skeTables?.values() ?? []) {
        for (const row of table.rows) {
            for (const cell of row.cells) {
                if (cell.isMergedCellCovered) {
                    continue;
                }

                const { st, ed } = cell;

                if (charIndex >= st && charIndex <= ed) {
                    return resolveMostSpecificPageByCharIndex(cell, charIndex);
                }
            }
        }
    }

    for (const columnGroup of page.skeColumnGroups?.values() ?? []) {
        for (const column of columnGroup.columns) {
            const { st, ed } = column;

            if (charIndex >= st && charIndex <= ed) {
                return resolveMostSpecificPageByCharIndex(column.page, charIndex);
            }
        }
    }

    return page;
}

function hasRenderedNodeAtCharIndex(page: IDocumentSkeletonPage, charIndex: number): boolean {
    const specificPage = resolveMostSpecificPageByCharIndex(page, charIndex);

    for (const section of specificPage.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                for (const divide of line.divides) {
                    if (charIndex >= divide.st && charIndex <= divide.ed) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function hydrateDrawingAnchors(
    publication: IDocumentLayoutDrawingAnchorPublication
): Map<string, Map<number, IDocumentSkeletonDrawingAnchor>> {
    return new Map(publication.map(([segmentId, anchors]) => [
        segmentId,
        new Map(anchors.map(([paragraphIndex, anchor]) => [
            paragraphIndex,
            {
                ...anchor,
                // Line objects are active-layout scratch references. They are rebuilt
                // by createAndUpdateBlockAnchor when the next layout starts and must
                // not force a full-document scan on the presentation thread.
                elements: [],
            },
        ])),
    ]));
}

function getSegmentPageFromRelativePath(
    skeletonData: IDocumentSkeletonCached,
    segmentPageIndex: number,
    path: (string | number)[]
): Nullable<IDocumentSkeletonPage> {
    const rootPage = skeletonData.pages[segmentPageIndex];
    if (rootPage == null) {
        return null;
    }

    const { headerId, footerId, pageWidth } = rootPage;
    const segmentPages = [
        headerId == null ? null : skeletonData.skeHeaders.get(headerId)?.get(pageWidth),
        footerId == null ? null : skeletonData.skeFooters.get(footerId)?.get(pageWidth),
    ];

    for (const segmentPage of segmentPages) {
        if (segmentPage == null) {
            continue;
        }

        const page = getPageFromPath({
            ...skeletonData,
            pages: [segmentPage],
        }, ['pages', 0, ...path]);

        if (page != null) {
            return page;
        }
    }

    return null;
}

export class DocumentSkeleton extends Skeleton {
    private _dirty$ = new Subject<boolean>();
    readonly dirty$ = this._dirty$.asObservable();

    private _layoutProgress$ = new Subject<IDocumentLayoutProgress>();
    readonly layoutProgress$ = this._layoutProgress$.asObservable();

    private _skeletonData: Nullable<IDocumentSkeletonCached>;

    private _findLiquid: Liquid = new Liquid();

    // Use for hyphenation.
    private _hyphen = Hyphen.getInstance();

    private _languageDetector = LanguageDetector.getInstance();

    private _iteratorCount = 0;

    private _initialWidth = 0;

    private _paginationMetrics: Nullable<IDocumentPaginationMetrics> = null;

    private _lastCompleteSkeletonData: Nullable<IDocumentSkeletonCached> = null;

    private _pendingInvalidationAnchor: Nullable<number> = null;

    private _layoutGeneration = 0;

    private _activeLayout: Nullable<IIncrementalLayoutState> = null;

    private _externalLayoutProgress: Nullable<IDocumentLayoutProgress> = null;

    private _externalProtectedPages: Nullable<{
        range: IDocumentLayoutProtectedPageRange;
        pages: Map<number, {
            page: IDocumentSkeletonPage;
            checkpoint: string;
        }>;
        divergenceStartPageIndex: number | null;
        pendingPages: Map<number, IDocumentSkeletonPage>;
        publishedPageIndexes: Set<number>;
    }> = null;

    private _externalProtectedContinuousLayout: Nullable<{
        range: Extract<IDocumentLayoutProtectedRange, { mode: 'continuous' }>;
        pendingPublications: IDocumentLayoutBlockGeometryPublication[];
    }> = null;

    private _topLevelBlockSections: DataStreamTreeNode[] | null = null;

    private _topLevelBlocks: ITopLevelBlockEntry[] = [];

    private readonly _isolateIncrementalPublications: boolean;

    constructor(
        private _docViewModel: DocumentViewModel,
        localeService: LocaleService,
        options: { isolateIncrementalPublications?: boolean } = {}
    ) {
        super(localeService);
        this._isolateIncrementalPublications = options.isolateIncrementalPublications !== false;
    }

    static create(
        docViewModel: DocumentViewModel,
        localeService: LocaleService,
        options?: { isolateIncrementalPublications?: boolean }
    ) {
        return new DocumentSkeleton(docViewModel, localeService, options);
    }

    override dispose(): void {
        this.cancelIncrementalLayout();
        super.dispose();
        this._layoutProgress$.complete();
        this._skeletonData = null;
        this._lastCompleteSkeletonData = null;
        this._pendingInvalidationAnchor = null;
        this._externalLayoutProgress = null;
        this._externalProtectedPages = null;
        this._externalProtectedContinuousLayout = null;
        this._topLevelBlockSections = null;
        this._topLevelBlocks = [];
        this._docViewModel.dispose();
        this._initialWidth = 0;
    }

    getViewModel() {
        return this._docViewModel;
    }

    /**
     * Layout the document.
     * PS: This method has significant impact on performance.
     */
    calculate(bounds?: IViewportInfo) {
        if (!this.dirty) {
            return;
        }

        this.cancelIncrementalLayout();
        this._externalLayoutProgress = null;
        this._externalProtectedPages = null;
        this._externalProtectedContinuousLayout = null;
        const ctx = this._prepareLayoutContext();
        this._skeletonData = this._createSkeleton(ctx, bounds);
        this._lastCompleteSkeletonData = this._skeletonData;
        this._pendingInvalidationAnchor = null;
        this._paginationMetrics = ctx.paginationMetrics ?? null;
        this._dirty$.next(true);
    }

    startIncrementalLayout(options?: {
        reason?: DocumentLayoutReason;
        anchor?: number;
        priorityAnchor?: number;
        invalidation?: IDocumentLayoutInvalidation;
        bounds?: IViewportInfo;
        reuseUnaffectedTail?: boolean;
        preserveInteractionWindow?: boolean;
    }): number {
        this.cancelIncrementalLayout();
        this._externalLayoutProgress = null;
        this._externalProtectedPages = null;
        this._externalProtectedContinuousLayout = null;

        const generation = ++this._layoutGeneration;
        const reason = options?.reason ?? (options?.anchor == null ? 'initial' : 'edit');
        const dataModel = this.getViewModel().getDataModel();
        const sections = this.getViewModel().getChildren();
        const topLevelBlocks = this._getTopLevelBlocks(sections);
        const mode: DocumentLayoutMode = dataModel.documentStyle.documentFlavor === DocumentFlavor.MODERN
            ? 'continuous'
            : 'paginated';
        const priorityAnchor = options?.priorityAnchor ?? options?.anchor;
        const hasPublishedCheckpoint = this._skeletonData != null || this._lastCompleteSkeletonData != null;
        const previousSkeleton = this._lastCompleteSkeletonData ?? this._skeletonData;
        const invalidation = options?.invalidation;
        const layoutAnchor = options?.anchor;
        const invalidationAnchor = layoutAnchor == null
            ? this._pendingInvalidationAnchor ?? undefined
            : Math.min(layoutAnchor, this._pendingInvalidationAnchor ?? layoutAnchor);
        // A cancelled typing generation leaves the last complete skeleton in the
        // coordinate space that existed before the first uncommitted edit. Map the
        // replacement physical page from that stable dirty anchor, not from the
        // latest logical caret, which may already have crossed the stale page end.
        const mutationDelta = invalidation == null ? 0 : invalidation.newEnd - invalidation.oldEnd;
        let priorityPageAnchor = priorityAnchor;
        if (priorityPageAnchor != null && invalidation != null) {
            if (priorityPageAnchor >= invalidation.newEnd) {
                priorityPageAnchor -= mutationDelta;
            } else if (priorityPageAnchor >= invalidation.oldStart) {
                priorityPageAnchor = invalidation.oldStart;
            }
        }
        priorityPageAnchor ??= invalidationAnchor;
        const priorityPageIndex = priorityPageAnchor == null || previousSkeleton == null
            ? -1
            : this._findBodyPageIndex(previousSkeleton.pages, priorityPageAnchor);
        const previousPriorityPage = priorityPageIndex < 0
            ? null
            : previousSkeleton?.pages[priorityPageIndex] ?? null;
        const previousPriorityPageEnd = previousPriorityPage == null
            ? null
            : getLastBodyFlowCharIndex(previousPriorityPage);
        const priorityPageEnd = previousPriorityPageEnd == null
            ? null
            : previousPriorityPageEnd + (
                invalidation != null && invalidation.oldStart <= previousPriorityPageEnd
                    ? mutationDelta
                    : 0
            );
        const incrementalStart = this._prepareIncrementalLayoutStart(
            invalidationAnchor,
            mode,
            invalidation,
            options?.preserveInteractionWindow === true,
            options?.reuseUnaffectedTail === false
        );
        // The first-open anchor only prioritizes the initial viewport; it does not
        // represent mutated content. Carry invalidation across generations only
        // after a publishable checkpoint already exists.
        this._pendingInvalidationAnchor = hasPublishedCheckpoint ? invalidationAnchor ?? null : null;

        this._activeLayout = {
            generation,
            reason,
            mode,
            ctx: incrementalStart.ctx,
            sectionIndex: incrementalStart.sectionIndex,
            paragraphIndex: incrementalStart.paragraphIndex,
            sectionInitialized: false,
            sectionBreakConfig: null,
            layoutAnchor: incrementalStart.layoutAnchor,
            priorityAnchor: priorityAnchor ?? null,
            priorityPageIndex,
            priorityPageEnd,
            interactionPageTail: incrementalStart.interactionPageTail,
            interactionPageComplete: false,
            interactionWindowComplete: false,
            interactionWindowResume: null,
            invalidation: invalidation ?? null,
            laidOutThrough: incrementalStart.laidOutThrough,
            stableLaidOutThrough: -1,
            complete: false,
            cancelled: false,
            processedBlockCount: incrementalStart.processedBlockCount,
            totalBlockCount: topLevelBlocks.length,
            startedAt: getLayoutNow(),
            maxBlockDuration: 0,
            pendingTableBuild: null,
            pendingSlicedTableBuild: null,
            pendingParagraphCheckpoint: null,
            stablePageCount: Math.max(0, incrementalStart.ctx.skeleton.pages.length - 1),
            finalizedPageCount: Math.max(0, incrementalStart.ctx.skeleton.pages.length - 1),
            anchorPublished: false,
            lastPublishedPageCount: incrementalStart.ctx.skeleton.pages.length > 0
                ? Math.max(0, incrementalStart.ctx.skeleton.pages.length - 1)
                : 0,
            lastPublishedBlockCount: incrementalStart.processedBlockCount,
            publicationRevision: 0,
            reuseUnaffectedTail: options?.reuseUnaffectedTail !== false,
            reusedTail: false,
            tailConvergencePageCount: incrementalStart.ctx.skeleton.pages.length,
            dirtyRetryCount: 0,
        };

        return generation;
    }

    private _prepareIncrementalLayoutStart(
        anchor: number | undefined,
        mode: DocumentLayoutMode,
        invalidation?: IDocumentLayoutInvalidation,
        preserveInteractionWindow = false,
        reuseInteractionPagePrefix = false
    ): {
        ctx: ILayoutContext;
        sectionIndex: number;
        paragraphIndex: number;
        layoutAnchor: Nullable<number>;
        laidOutThrough: number;
        processedBlockCount: number;
        interactionPageTail: Nullable<IInteractionPageTail>;
    } {
        const ctx = this._prepareLayoutContext();
        // Canonical suffix recovery starts from the last complete skeleton. Main's
        // protected interaction page may instead advance from the preceding edit's
        // published page so each typing generation maps only one mutation delta.
        const previousSkeleton = this._lastCompleteSkeletonData ?? this._skeletonData;
        const interactionSkeleton = reuseInteractionPagePrefix
            ? this._skeletonData ?? previousSkeleton
            : previousSkeleton;
        const sections = this.getViewModel().getChildren();
        const continuousPrefix = mode === 'continuous'
            ? this._prepareContinuousPrefix(ctx, previousSkeleton, sections, anchor)
            : null;
        if (continuousPrefix != null) {
            return continuousPrefix;
        }

        if (anchor == null || previousSkeleton == null || previousSkeleton.pages.length < 2) {
            return {
                ctx,
                sectionIndex: 0,
                paragraphIndex: 0,
                layoutAnchor: null,
                laidOutThrough: -1,
                processedBlockCount: 0,
                interactionPageTail: null,
            };
        }

        const blocks = this._getTopLevelBlocks(sections);
        const getBlockFlowStart = (block: (typeof blocks)[number]['block']) =>
            block.children.length === 1 && block.children[0].nodeType === DataStreamTreeNodeType.TABLE
                ? block.children[0].startIndex
                : block.startIndex;
        const blockContainsOffset = (block: (typeof blocks)[number]['block'], offset: number) =>
            (offset >= block.startIndex && offset <= block.endIndex) ||
            block.children.some((child) => offset >= child.startIndex && offset <= child.endIndex);
        const anchorBlockIndex = blocks.findIndex(({ block }) => blockContainsOffset(block, anchor));
        if (anchorBlockIndex < 0) {
            return {
                ctx,
                sectionIndex: 0,
                paragraphIndex: 0,
                layoutAnchor: null,
                laidOutThrough: -1,
                processedBlockCount: 0,
                interactionPageTail: null,
            };
        }

        const previousAnchor = mapCurrentOffsetToPrevious(anchor, invalidation);
        const anchorPageIndex = this._findBodyPageIndex(previousSkeleton.pages, previousAnchor);
        const hasEarlierOverlappingRange = anchorPageIndex > 0 && previousSkeleton.pages
            .slice(0, anchorPageIndex)
            .some((page) => previousAnchor >= page.st && previousAnchor <= page.ed);
        const anchorBlockOwnsTable = blocks[anchorBlockIndex].block.children.some(
            (child) => child.nodeType === DataStreamTreeNodeType.TABLE &&
                anchor >= child.startIndex &&
                anchor <= child.endIndex
        );
        const canResumePlainParagraph = blocks[anchorBlockIndex].block.nodeType === DataStreamTreeNodeType.PARAGRAPH &&
            blocks[anchorBlockIndex].block.children.length === 0;
        if (reuseInteractionPagePrefix && canResumePlainParagraph) {
            const interactionPreviousAnchor = mapCurrentOffsetToPrevious(anchor, invalidation);
            const interactionPageIndex = interactionSkeleton == null
                ? -1
                : this._findBodyPageIndex(interactionSkeleton.pages, interactionPreviousAnchor);
            const paginatedPrefix = this._preparePaginatedParagraphPrefix(
                ctx,
                interactionSkeleton ?? previousSkeleton,
                blocks[anchorBlockIndex],
                anchorBlockIndex,
                interactionPageIndex,
                invalidation
            );
            if (paginatedPrefix != null) {
                return paginatedPrefix;
            }
        }
        if (hasEarlierOverlappingRange && !anchorBlockOwnsTable && !canResumePlainParagraph) {
            return {
                ctx,
                sectionIndex: 0,
                paragraphIndex: 0,
                layoutAnchor: anchor,
                laidOutThrough: -1,
                processedBlockCount: 0,
                interactionPageTail: null,
            };
        }

        let startBlockIndex = anchorBlockIndex;
        let startPageIndex = this._findBodyPageIndex(
            previousSkeleton.pages,
            mapCurrentOffsetToPrevious(getBlockFlowStart(blocks[startBlockIndex].block), invalidation)
        );
        if (startPageIndex <= 0) {
            return {
                ctx,
                sectionIndex: 0,
                paragraphIndex: 0,
                layoutAnchor: null,
                laidOutThrough: -1,
                processedBlockCount: 0,
                interactionPageTail: null,
            };
        }

        // A block may span pages, and a page may start with the tail of an earlier block.
        // Walk back to the first top-level block contributing to the rebuild page so the
        // retained prefix and recomputed suffix meet only at a stable block boundary.
        while (startPageIndex > 0) {
            const pageStart = getFirstBodyFlowCharIndex(previousSkeleton.pages[startPageIndex]);
            const currentPageStart = mapPreviousOffsetToCurrent(pageStart, invalidation);
            const firstPageBlockIndex = blocks.findIndex(({ block }) => blockContainsOffset(block, currentPageStart));
            if (firstPageBlockIndex < 0 || firstPageBlockIndex >= startBlockIndex) {
                break;
            }

            startBlockIndex = firstPageBlockIndex;
            const earlierPageIndex = this._findBodyPageIndex(
                previousSkeleton.pages,
                mapCurrentOffsetToPrevious(getBlockFlowStart(blocks[startBlockIndex].block), invalidation)
            );
            if (earlierPageIndex < 0 || earlierPageIndex >= startPageIndex) {
                break;
            }
            startPageIndex = earlierPageIndex;
        }

        // The first top-level glyph on a table-continuation page may belong to a
        // cell paragraph rather than to the outer table block. A checkpoint made
        // there cannot restore the table iterator state and produces one-page row
        // fragments when the suffix is laid out. Rewind to the outermost table
        // that crosses the proposed checkpoint page so the rebuilt suffix starts
        // from a real document block boundary.
        const checkpointStart = getBlockFlowStart(blocks[startBlockIndex].block);
        const crossingTables = (ctx.dataModel.getBody()?.tables ?? [])
            .filter((table) => table.startIndex < checkpointStart && table.endIndex >= checkpointStart);
        crossingTables.sort((left, right) => left.startIndex - right.startIndex);
        const crossingTable = crossingTables[0];
        if (crossingTable != null) {
            // A paragraph that owns a table starts at the table's structural end
            // token. Resuming that paragraph after retaining the table lays the
            // table owner twice and creates a one-character, full-height page.
            // Table iterator checkpoints are not serializable yet, so rebuild
            // cooperatively from the start while the previous skeleton stays on
            // screen. This path converges exactly with synchronous pagination.
            return {
                ctx,
                sectionIndex: 0,
                paragraphIndex: 0,
                layoutAnchor: anchor,
                laidOutThrough: -1,
                processedBlockCount: 0,
                interactionPageTail: null,
            };
        }

        const start = blocks[startBlockIndex];
        const previousPage = previousSkeleton.pages[startPageIndex];
        const sectionBreakConfig = prepareSectionBreakConfig(ctx, start.sectionIndex);

        this._copySkeletonResources(
            previousSkeleton,
            ctx.skeletonResourceReference,
            checkpointStart
        );
        // A single contiguous body edit can project the retained interaction island.
        // Disjoint body edits deliberately take the canonical recovery path because
        // one scalar invalidation cannot map every retained offset without ambiguity.
        const retainedPages = previousSkeleton.pages.slice(0, startPageIndex).map((page) => {
            if (!preserveInteractionWindow || invalidation == null || page.ed < invalidation.oldStart) {
                return page;
            }
            if (page.st < invalidation.oldEnd) {
                return clonePageLayoutPlaceholderForPublish(page);
            }
            const retainedPage = clonePageFlowForPublish(page);
            shiftPageCharacterOffsets(retainedPage, invalidation.newEnd - invalidation.oldEnd);
            return retainedPage;
        });
        ctx.skeleton.pages.push(...retainedPages);
        const rebuiltPage = createSkeletonPage(
            ctx,
            sectionBreakConfig,
            ctx.skeletonResourceReference,
            previousPage.pageNumber
        );
        copyPageBoundaryMetadata(rebuiltPage, previousPage);
        ctx.skeleton.pages.push(rebuiltPage);

        return {
            ctx,
            sectionIndex: start.sectionIndex,
            paragraphIndex: start.paragraphIndex,
            layoutAnchor: start.block.endIndex,
            laidOutThrough: checkpointStart - 1,
            processedBlockCount: startBlockIndex,
            interactionPageTail: null,
        };
    }

    private _preparePaginatedParagraphPrefix(
        ctx: ILayoutContext,
        previousSkeleton: IDocumentSkeletonCached,
        anchorEntry: ITopLevelBlockEntry,
        anchorBlockIndex: number,
        anchorPageIndex: number,
        invalidation?: IDocumentLayoutInvalidation
    ): Nullable<{
        ctx: ILayoutContext;
        sectionIndex: number;
        paragraphIndex: number;
        layoutAnchor: Nullable<number>;
        laidOutThrough: number;
        processedBlockCount: number;
        interactionPageTail: Nullable<IInteractionPageTail>;
    }> {
        const previousPage = previousSkeleton.pages[anchorPageIndex];
        const previousSection = previousPage?.sections[0];
        const previousColumn = previousSection?.columns[0];
        if (
            previousPage == null ||
            previousPage.sections.length !== 1 ||
            previousSection?.columns.length !== 1 ||
            previousColumn == null ||
            previousPage.skeDrawings.size > 0 ||
            previousPage.skeTables.size > 0 ||
            previousPage.skeColumnGroups.size > 0
        ) {
            return null;
        }

        const previousAnchorStart = mapCurrentOffsetToPrevious(anchorEntry.block.startIndex, invalidation);
        const previousAnchorEnd = mapCurrentOffsetToPrevious(anchorEntry.block.endIndex, invalidation);
        const mappedPreviousAnchorEnd = mapPreviousOffsetToCurrent(previousAnchorEnd, invalidation);
        const previousParagraphEnd = previousColumn.lines.find(
            (line) => line.paragraphIndex >= previousAnchorStart
        )?.paragraphIndex;
        if (invalidation != null && invalidation.oldStart < previousAnchorStart) {
            return null;
        }
        const retainedLines = previousColumn.lines
            .filter((line) => line.ed < previousAnchorStart)
            .map((line) => ({ ...line }));
        if (retainedLines.length === 0) {
            return null;
        }

        const lastRetainedLine = retainedLines[retainedLines.length - 1];
        lastRetainedLine.lineHeight = Math.max(0, lastRetainedLine.lineHeight - lastRetainedLine.marginBottom);
        lastRetainedLine.marginBottom = 0;
        const retainedEnd = lastRetainedLine.ed;
        // The finalized source page stores aggregate metrics for every line that
        // used to follow this prefix. Reusing those metrics after filtering the
        // lines makes the next paragraph start from the old page bottom; Enter can
        // then move a paragraph to the following page until background layout
        // replaces it. Rebuild all mutable flow metrics from the retained lines.
        const retainedHeight = retainedLines.reduce(
            (height, line) => Math.max(height, line.top + line.lineHeight),
            0
        );
        const retainedColumn: IDocumentSkeletonColumn = {
            ...previousColumn,
            lines: retainedLines,
            ed: retainedEnd,
            height: retainedHeight,
            width: previousPage.pageWidth - previousPage.marginLeft - previousPage.marginRight,
            isFull: false,
            parent: undefined,
        };
        for (const line of retainedLines) {
            line.parent = retainedColumn;
        }
        const retainedSection: IDocumentSkeletonSection = {
            ...previousSection,
            columns: [retainedColumn],
            ed: retainedEnd,
            height: previousPage.pageHeight - previousPage.marginTop - previousPage.marginBottom,
            parent: undefined,
        };
        retainedColumn.parent = retainedSection;
        const retainedPage: IDocumentSkeletonPage = {
            ...previousPage,
            sections: [retainedSection],
            ed: retainedEnd,
            height: retainedHeight,
            skeDrawings: new Map(),
            skeTables: new Map(),
            skeColumnGroups: new Map(),
            parent: undefined,
        };
        retainedSection.parent = retainedPage;

        this._copySkeletonResources(
            previousSkeleton,
            ctx.skeletonResourceReference,
            anchorEntry.block.startIndex
        );
        ctx.skeleton.pages.push(...previousSkeleton.pages.slice(0, anchorPageIndex), retainedPage);

        const previousPageEnd = getLastBodyFlowCharIndex(previousPage);
        const pageEnd = mapPreviousOffsetToCurrent(previousPageEnd, invalidation);
        const blocks = this._getTopLevelBlocks(this.getViewModel().getChildren());
        const nextBlockIndex = blocks.findIndex(({ block }, index) =>
            index > anchorBlockIndex && block.startIndex > pageEnd
        );
        const pageTailEnd = nextBlockIndex < 0 ? blocks.length : nextBlockIndex;
        const pageTailBlocks = blocks.slice(anchorBlockIndex, pageTailEnd);
        const terminal = pageTailBlocks.some(({ block }) => block.endIndex > pageEnd);
        // Reusing the old page tail is valid only when the edited paragraph still
        // maps to the same paragraph boundary. Enter and paragraph-boundary deletes
        // change that boundary; old wrapped lines then contain text owned by a new
        // block and cannot be spliced behind the recomputed paragraph.
        const canReusePageTail = invalidation != null &&
            previousParagraphEnd === previousAnchorEnd &&
            anchorEntry.block.endIndex === mappedPreviousAnchorEnd &&
            anchorEntry.block.endIndex <= pageEnd &&
            pageTailBlocks.length > 0 &&
            pageTailBlocks.every(({ block }) =>
                block.nodeType === DataStreamTreeNodeType.PARAGRAPH &&
                block.children.length === 0
            ) &&
            previousColumn.lines
                .filter((line) => line.paragraphIndex > previousAnchorEnd)
                .every((line) => line.bullet == null);
        const nextBlock = nextBlockIndex < 0 ? null : blocks[nextBlockIndex];
        const resumeBlockIndex = anchorBlockIndex + 1;
        const resumeBlock = blocks[resumeBlockIndex];

        return {
            ctx,
            sectionIndex: anchorEntry.sectionIndex,
            paragraphIndex: anchorEntry.paragraphIndex,
            layoutAnchor: anchorEntry.block.endIndex,
            laidOutThrough: anchorEntry.block.startIndex - 1,
            processedBlockCount: anchorBlockIndex,
            interactionPageTail: canReusePageTail
                ? {
                    previousSkeleton,
                    previousPage,
                    anchorEnd: anchorEntry.block.endIndex,
                    previousAnchorEnd,
                    pageEnd,
                    nextBlockIndex: pageTailEnd,
                    nextSectionIndex: nextBlock?.sectionIndex ?? this.getViewModel().getChildren().length,
                    nextParagraphIndex: nextBlock?.paragraphIndex ?? 0,
                    resumeBlockIndex,
                    resumeSectionIndex: resumeBlock?.sectionIndex ?? this.getViewModel().getChildren().length,
                    resumeParagraphIndex: resumeBlock?.paragraphIndex ?? 0,
                    terminal,
                }
                : null,
        };
    }

    private _prepareContinuousPrefix(
        ctx: ILayoutContext,
        previousSkeleton: Nullable<IDocumentSkeletonCached>,
        sections: ReturnType<DocumentViewModel['getChildren']>,
        anchor?: number
    ): Nullable<{
        ctx: ILayoutContext;
        sectionIndex: number;
        paragraphIndex: number;
        layoutAnchor: Nullable<number>;
        laidOutThrough: number;
        processedBlockCount: number;
        interactionPageTail: Nullable<IInteractionPageTail>;
    }> {
        if (anchor == null || previousSkeleton?.pages.length !== 1 || sections.length !== 1) {
            return null;
        }

        const previousPage = previousSkeleton.pages[0];
        const previousSection = previousPage.sections[0];
        const previousColumn = previousSection?.columns[0];
        if (
            previousPage.sections.length !== 1 ||
            previousSection?.columns.length !== 1 ||
            previousColumn == null ||
            previousPage.skeDrawings.size > 0 ||
            previousPage.skeTables.size > 0 ||
            previousPage.skeColumnGroups.size > 0
        ) {
            return null;
        }

        const blocks = sections[0].children;
        const anchorBlockIndex = blocks.findIndex((block) => anchor >= block.startIndex && anchor <= block.endIndex);
        const anchorBlock = blocks[anchorBlockIndex];
        if (
            anchorBlockIndex <= 0 ||
            anchorBlock?.nodeType !== DataStreamTreeNodeType.PARAGRAPH
        ) {
            return null;
        }

        const retainedLines = previousColumn.lines
            .filter((line) => line.ed < anchorBlock.startIndex)
            .map((line) => ({ ...line }));
        if (retainedLines.length === 0) {
            return null;
        }

        const lastRetainedLine = retainedLines[retainedLines.length - 1];
        // The following paragraph applied its collapsed top/bottom spacing to this
        // line during the previous layout. Undo that one boundary contribution so
        // laying the anchor paragraph applies it exactly once again.
        lastRetainedLine.lineHeight = Math.max(0, lastRetainedLine.lineHeight - lastRetainedLine.marginBottom);
        lastRetainedLine.marginBottom = 0;
        const retainedEnd = retainedLines[retainedLines.length - 1].ed;
        const retainedHeight = retainedLines.reduce(
            (height, line) => Math.max(height, line.top + line.lineHeight),
            0
        );
        const retainedColumn: IDocumentSkeletonColumn = {
            ...previousColumn,
            lines: retainedLines,
            ed: retainedEnd,
            height: retainedHeight,
            width: previousPage.pageWidth - previousPage.marginLeft - previousPage.marginRight,
            isFull: false,
            parent: undefined,
        };
        for (const line of retainedLines) {
            line.parent = retainedColumn;
        }
        const retainedSection: IDocumentSkeletonSection = {
            ...previousSection,
            columns: [retainedColumn],
            ed: retainedEnd,
            height: previousPage.pageHeight - previousPage.marginTop - previousPage.marginBottom,
            parent: undefined,
        };
        retainedColumn.parent = retainedSection;
        const retainedPage: IDocumentSkeletonPage = {
            ...previousPage,
            sections: [retainedSection],
            ed: retainedEnd,
            height: retainedHeight,
            skeDrawings: new Map(),
            skeTables: new Map(),
            skeColumnGroups: new Map(),
            parent: undefined,
        };
        retainedSection.parent = retainedPage;

        this._copySkeletonResources(
            previousSkeleton,
            ctx.skeletonResourceReference,
            anchorBlock.startIndex
        );
        ctx.skeleton.pages.push(retainedPage);

        return {
            ctx,
            sectionIndex: 0,
            paragraphIndex: anchorBlockIndex,
            layoutAnchor: anchorBlock.endIndex,
            laidOutThrough: anchorBlock.startIndex - 1,
            processedBlockCount: anchorBlockIndex,
            interactionPageTail: null,
        };
    }

    private _findBodyPageIndex(pages: IDocumentSkeletonPage[], charIndex: number): number {
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            if (hasRenderedNodeAtCharIndex(pages[pageIndex], charIndex)) {
                return pageIndex;
            }
        }

        // Structural tokens do not always have a glyph. Fall back to the aggregate
        // page range for those nodes, but prefer the concrete rendered node above:
        // ranges overlap when a table spans pages and would otherwise select its
        // first page for content that is actually rendered later.
        return pages.findIndex((page) => charIndex >= page.st && charIndex <= page.ed);
    }

    private _getTopLevelBlocks(sections: DataStreamTreeNode[]): ITopLevelBlockEntry[] {
        if (this._topLevelBlockSections === sections) {
            return this._topLevelBlocks;
        }

        const blocks: ITopLevelBlockEntry[] = [];
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex];
            for (let paragraphIndex = 0; paragraphIndex < section.children.length; paragraphIndex++) {
                blocks.push({
                    block: section.children[paragraphIndex],
                    sectionIndex,
                    paragraphIndex,
                });
            }
        }
        this._topLevelBlockSections = sections;
        this._topLevelBlocks = blocks;
        return blocks;
    }

    private _copySkeletonResources(
        source: IDocumentSkeletonCached,
        target: ISkeletonResourceReference,
        endIndexExclusive: number
    ): void {
        for (const [key, value] of source.skeHeaders) {
            target.skeHeaders.set(key, value);
        }
        for (const [key, value] of source.skeFooters) {
            target.skeFooters.set(key, value);
        }
        for (const [key, value] of source.skeListLevel ?? []) {
            target.skeListLevel?.set(
                key,
                value.map((level) => level.filter(({ paragraph }) => paragraph.startIndex < endIndexExclusive))
            );
        }
        for (const [key, value] of source.drawingAnchor ?? []) {
            target.drawingAnchor?.set(key, new Map(
                [...value]
                    .filter(([paragraphIndex]) => paragraphIndex < endIndexExclusive)
                    .map(([paragraphIndex, anchor]) => [
                        paragraphIndex,
                        { ...anchor, elements: [...anchor.elements] },
                    ])
            ));
        }
    }

    cancelIncrementalLayout(generation?: number): void {
        const state = this._activeLayout;
        if (state == null || (generation != null && state.generation !== generation)) {
            return;
        }

        state.cancelled = true;
        this._activeLayout = null;
        this._layoutProgress$.next(this._getLayoutProgress(state));
    }

    stepIncrementalLayout(
        generation: number,
        budgetMs = 8,
        maxWorkUnits = Number.POSITIVE_INFINITY
    ): IDocumentLayoutProgress {
        return this._stepIncrementalLayout(generation, budgetMs, true, maxWorkUnits);
    }

    /**
     * Publishes at most one page that a previous layout slice has already
     * completed. It never advances shaping or pagination work.
     */
    publishIncrementalLayoutBacklog(generation: number): IDocumentLayoutProgress {
        const state = this._activeLayout;
        if (state?.generation === generation && state.mode === 'continuous') {
            const progress = this._getLayoutProgress(state);
            this._layoutProgress$.next(progress);
            return progress;
        }
        return this._stepIncrementalLayout(generation, 0, false, Number.POSITIVE_INFINITY);
    }

    private _stepIncrementalLayout(
        generation: number,
        budgetMs: number,
        advanceLayout: boolean,
        maxWorkUnits: number
    ): IDocumentLayoutProgress {
        const state = this._activeLayout;
        if (state == null || state.generation !== generation || state.cancelled) {
            return {
                generation,
                publicationRevision: 0,
                didPublish: false,
                didPublishAnchor: false,
                publishedPageCount: 0,
                reason: 'edit',
                mode: state?.mode ?? 'paginated',
                complete: false,
                cancelled: true,
                anchorReady: false,
                laidOutThrough: -1,
                stableLaidOutThrough: -1,
                pageCount: 0,
                processedBlockCount: 0,
                totalBlockCount: 0,
                estimatedPageCount: 0,
                estimatedHeight: 0,
                elapsedTime: 0,
                maxBlockDuration: 0,
                interactionWindowComplete: false,
            };
        }

        const sliceStartedAt = getLayoutNow();
        const normalizedMaxWorkUnits = Number.isFinite(maxWorkUnits)
            ? Math.max(1, Math.floor(maxWorkUnits))
            : Number.POSITIVE_INFINITY;
        let blocksProcessed = 0;

        if (advanceLayout) {
            while (!state.complete && !state.cancelled) {
                const blockStartedAt = getLayoutNow();
                this._advanceIncrementalLayout(state);
                const blockDuration = getLayoutNow() - blockStartedAt;
                state.maxBlockDuration = Math.max(state.maxBlockDuration, blockDuration);
                blocksProcessed++;

                if (
                    !state.complete &&
                    state.ctx.skeleton.pages.length > state.tailConvergencePageCount
                ) {
                    state.tailConvergencePageCount = state.ctx.skeleton.pages.length;
                    if (this._tryConvergeUnaffectedTail(state)) {
                        break;
                    }
                }

                if (
                    blocksProcessed >= normalizedMaxWorkUnits ||
                    (blocksProcessed > 0 && getLayoutNow() - sliceStartedAt >= budgetMs)
                ) {
                    break;
                }
            }
        }

        if (
            advanceLayout &&
            !state.complete &&
            !state.cancelled &&
            state.ctx.skeleton.pages.length > state.tailConvergencePageCount
        ) {
            state.tailConvergencePageCount = state.ctx.skeleton.pages.length;
            this._tryConvergeUnaffectedTail(state);
        }

        const anchorReady = this._isPriorityAnchorReady(state);
        const pageCount = state.ctx.skeleton.pages.length;
        const shouldPublishPriority = state.priorityAnchor != null && anchorReady && !state.anchorPublished;
        const currentPriorityPageIndex = this._findPublishablePriorityPageIndex(state);
        // A local edit can move the caret onto an adjacent physical page. Publishing
        // only through its page in the previous complete skeleton leaves the new
        // caret page private to the layout session and makes selection recreation
        // fail even though the anchor itself is already stable.
        const priorityPublishedPageCount = Math.max(
            state.priorityPageIndex + 1,
            currentPriorityPageIndex + 1
        );
        const stableComputedPageCount = state.complete
            ? pageCount
            : Math.max(
                Math.max(0, pageCount - 1),
                state.interactionPageComplete ? state.priorityPageIndex + 1 : 0
            );
        const hasStablePageToPublish = stableComputedPageCount > state.lastPublishedPageCount;
        const hasStableBlockToPublish = state.mode === 'continuous' &&
            state.processedBlockCount > state.lastPublishedBlockCount;
        const suppressPreAnchorPublication =
            state.reason === 'edit' &&
            state.priorityAnchor != null &&
            !state.anchorPublished;
        const canPublish = shouldPublishPriority || hasStablePageToPublish || hasStableBlockToPublish || state.complete;
        const publishedPageCount = state.mode === 'continuous'
            ? pageCount
            : state.complete
                ? state.reusedTail
                    ? pageCount
                    : shouldPublishPriority
                        ? Math.max(state.lastPublishedPageCount, priorityPublishedPageCount)
                        : Math.min(pageCount, state.lastPublishedPageCount + 1)
                : shouldPublishPriority
                    ? Math.max(state.lastPublishedPageCount, priorityPublishedPageCount)
                    : Math.min(stableComputedPageCount, state.lastPublishedPageCount + 1);
        let didPublish = false;
        let didPublishAnchor = false;
        if (
            !state.cancelled &&
            canPublish &&
            (!suppressPreAnchorPublication || shouldPublishPriority || state.complete)
        ) {
            if (state.mode === 'paginated') {
                this._finalizePaginatedPagesForPublication(state, publishedPageCount);
            }
            const isFinalPublication = state.complete && publishedPageCount >= pageCount;
            if (isFinalPublication) {
                this._lastCompleteSkeletonData = state.ctx.skeleton;
                this._pendingInvalidationAnchor = null;
            }
            this._skeletonData = isFinalPublication
                ? state.ctx.skeleton
                : !this._isolateIncrementalPublications && state.mode === 'paginated'
                    ? this._createSharedPublishablePartialSkeleton(state, publishedPageCount)
                    : this._createPublishablePartialSkeleton(state, publishedPageCount);
            this._paginationMetrics = state.ctx.paginationMetrics ?? null;
            this._dirty$.next(true);
            didPublish = true;
            didPublishAnchor = shouldPublishPriority;
            state.publicationRevision++;
            state.anchorPublished ||= shouldPublishPriority;
            state.lastPublishedPageCount = state.mode === 'continuous'
                ? Math.min(1, publishedPageCount)
                : publishedPageCount;
            state.lastPublishedBlockCount = state.processedBlockCount;
        }

        const progress = this._getLayoutProgress(state, didPublish, didPublishAnchor);
        this._layoutProgress$.next(progress);

        if (progress.complete || state.cancelled) {
            this._activeLayout = null;
        }

        return progress;
    }

    private _createPublishablePartialSkeleton(
        state: IIncrementalLayoutState,
        publishedPageCount: number
    ): IDocumentSkeletonCached {
        const source = state.ctx.skeleton;
        const previous = this._lastCompleteSkeletonData;
        const preservesPreviousPagination =
            state.mode === 'paginated' &&
            state.priorityAnchor != null &&
            state.priorityPageIndex >= 0 &&
            previous != null;
        const stablePages = source.pages.slice(0, state.stablePageCount);
        const activePages = source.pages
            .slice(state.stablePageCount, Math.max(state.stablePageCount, publishedPageCount))
            .map(clonePageFlowForPublish);
        const startIndex = stablePages.at(-1)?.ed ?? -1;

        updateBlockIndex(
            activePages,
            startIndex,
            state.ctx.docsConfig.documentCompatibilityPolicy
        );
        // Continuous sections are represented as same-number page fragments while
        // layout is in progress. Final layout merges them before publication; do
        // the same on cloned foreground pages so the temporary page list has the
        // same physical-page identity as the previous complete skeleton.
        mergeContinuousDuplicatePages(activePages, state.mode === 'continuous');

        const flowPages = [...stablePages, ...activePages];
        const currentPriorityPageIndex = state.priorityAnchor == null
            ? -1
            : this._findBodyPageIndex(flowPages, state.priorityAnchor);
        let publishedFlowPages = flowPages;
        if (
            preservesPreviousPagination &&
            currentPriorityPageIndex >= 0 &&
            publishedPageCount <= state.priorityPageIndex + 1
        ) {
            // A spanning table can temporarily paginate into extra fragments while
            // foreground layout is advancing toward the edit anchor. Publishing
            // those fragments changes the physical page beneath the viewport even
            // though every fragment is before the edited page. Keep the previously
            // completed bridge pages and atomically replace only the physical page
            // that contains the anchor. Background layout can then reconcile the
            // complete tail without making the caret page jump in the meantime.
            const retainedBridgePages = previous.pages
                .slice(state.stablePageCount, state.priorityPageIndex)
                .map(clonePageFlowForPublish);
            const priorityPage = clonePageFlowForPublish(flowPages[currentPriorityPageIndex]);
            const previousPriorityPage = previous.pages[state.priorityPageIndex];
            const priorityPageStartIndex = retainedBridgePages.at(-1)?.ed ?? stablePages.at(-1)?.ed ?? -1;

            updateBlockIndex(
                [priorityPage],
                priorityPageStartIndex,
                state.ctx.docsConfig.documentCompatibilityPolicy
            );
            if (previousPriorityPage != null) {
                priorityPage.pageNumber = previousPriorityPage.pageNumber;
            }
            publishedFlowPages = [...stablePages, ...retainedBridgePages, priorityPage];
        }
        const placeholderPages = preservesPreviousPagination
            ? previous.pages
                .slice(Math.max(state.priorityPageIndex + 1, publishedPageCount))
                .map(clonePageLayoutPlaceholderForPublish)
            : [];
        const published: IDocumentSkeletonCached = {
            ...source,
            pages: [...publishedFlowPages, ...placeholderPages],
        };
        const publishedActivePages = publishedFlowPages.slice(stablePages.length);
        setPageParent([...publishedActivePages, ...placeholderPages], published);

        return published;
    }

    private _createSharedPublishablePartialSkeleton(
        state: IIncrementalLayoutState,
        publishedPageCount: number
    ): IDocumentSkeletonCached {
        const source = state.ctx.skeleton;
        const previous = this._lastCompleteSkeletonData;
        let publishedPages = source.pages.slice(0, publishedPageCount);
        if (
            state.priorityAnchor == null ||
            state.priorityPageIndex < 0 ||
            previous == null
        ) {
            return { ...source, pages: publishedPages };
        }
        const currentPriorityPageIndex = this._findBodyPageIndex(
            source.pages,
            state.priorityAnchor
        );
        if (
            currentPriorityPageIndex >= 0 &&
            publishedPageCount <= state.priorityPageIndex + 1
        ) {
            const priorityPage = source.pages[currentPriorityPageIndex];
            const previousPriorityPage = previous.pages[state.priorityPageIndex];
            publishedPages = [
                ...source.pages.slice(0, state.stablePageCount),
                ...previous.pages.slice(state.stablePageCount, state.priorityPageIndex),
                previousPriorityPage == null
                    ? priorityPage
                    : { ...priorityPage, pageNumber: previousPriorityPage.pageNumber },
            ];
        }
        publishedPages.push(...previous.pages
            .slice(Math.max(state.priorityPageIndex + 1, publishedPageCount))
            .map(clonePageLayoutPlaceholderForPublish));
        return {
            ...source,
            pages: publishedPages,
        };
    }

    private _findPublishablePriorityPageIndex(state: IIncrementalLayoutState): number {
        const anchor = state.priorityAnchor;
        if (anchor == null) {
            return -1;
        }

        const directPageIndex = this._findBodyPageIndex(state.ctx.skeleton.pages, anchor);
        if (directPageIndex >= 0 || state.mode !== 'paginated') {
            return directPageIndex;
        }

        // Continuation pages keep block-relative indexes until publication. Resolve
        // the post-edit caret against finalized clones so an edit that moves it to
        // an adjacent page publishes that page, without exposing unrelated tail
        // pages or mutating the active layout session prematurely.
        const stablePages = state.ctx.skeleton.pages.slice(0, state.stablePageCount);
        const activePages = state.ctx.skeleton.pages
            .slice(state.stablePageCount)
            .map(clonePageFlowForPublish);
        updateBlockIndex(
            activePages,
            stablePages.at(-1)?.ed ?? -1,
            state.ctx.docsConfig.documentCompatibilityPolicy
        );
        return this._findBodyPageIndex([...stablePages, ...activePages], anchor);
    }

    private _finalizePaginatedPagesForPublication(
        state: IIncrementalLayoutState,
        publishedPageCount: number
    ): void {
        const { ctx } = state;
        const endPageIndex = state.reusedTail
            ? Math.min(publishedPageCount, state.priorityPageIndex + 1)
            : publishedPageCount;
        const pages = ctx.skeleton.pages.slice(state.finalizedPageCount, endPageIndex);
        if (pages.length > 0) {
            const startIndex = ctx.skeleton.pages[state.finalizedPageCount - 1]?.ed ?? -1;
            updateBlockIndex(pages, startIndex, ctx.docsConfig.documentCompatibilityPolicy);
            updateInlineDrawingCoordsAndBorder(ctx, pages);
        }
        state.finalizedPageCount = state.reusedTail
            ? publishedPageCount
            : Math.max(state.finalizedPageCount, endPageIndex);
    }

    getLayoutProgress(): Nullable<IDocumentLayoutProgress> {
        return this._activeLayout == null
            ? this._externalLayoutProgress
            : this._getLayoutProgress(this._activeLayout);
    }

    /**
     * Opens a presentation barrier before an external executor starts layout.
     * The Main interaction snapshot remains authoritative inside its protected
     * page or block range while the external executor publishes a newer tail.
     */
    beginExternalLayout(options: {
        reason: DocumentLayoutReason;
        protectedRange?: IDocumentLayoutProtectedRange;
    }): void {
        this.cancelIncrementalLayout();
        const pages = this._skeletonData?.pages ?? [];
        const protectedRange = options.protectedRange;
        const protectedPageRange: IDocumentLayoutProtectedPageRange | undefined = protectedRange?.mode === 'paginated'
            ? protectedRange
            : undefined;
        if (protectedPageRange == null) {
            this._externalProtectedPages = null;
        } else {
            const protectedPages = new Map<number, {
                page: IDocumentSkeletonPage;
                checkpoint: string;
            }>();
            for (
                let pageIndex = protectedPageRange.startPageIndex;
                pageIndex <= protectedPageRange.endPageIndex;
                pageIndex++
            ) {
                const page = pages[pageIndex];
                if (page == null || page.isLayoutPlaceholder || page.isMaterializationPlaceholder) {
                    continue;
                }
                protectedPages.set(pageIndex, {
                    page,
                    checkpoint: serializePaginatedContinuationCheckpoint(serializeDocumentSkeletonPage(page)),
                });
            }
            this._externalProtectedPages = {
                range: protectedPageRange,
                pages: protectedPages,
                divergenceStartPageIndex: null,
                pendingPages: new Map(),
                publishedPageIndexes: new Set(),
            };
        }
        this._externalProtectedContinuousLayout = protectedRange?.mode === 'continuous'
            ? {
                range: protectedRange,
                pendingPublications: [],
            }
            : null;
        const dataModel = this.getViewModel().getDataModel();
        const mode: DocumentLayoutMode = dataModel.documentStyle.documentFlavor === DocumentFlavor.MODERN
            ? 'continuous'
            : 'paginated';
        const totalBlockCount = this._getTopLevelBlocks(this.getViewModel().getChildren()).length;
        const firstPage = pages[0];
        this._externalLayoutProgress = {
            generation: ++this._layoutGeneration,
            publicationRevision: 0,
            didPublish: false,
            didPublishAnchor: false,
            publishedPageCount: pages.length,
            reason: options.reason,
            mode,
            complete: false,
            cancelled: false,
            anchorReady: false,
            laidOutThrough: -1,
            stableLaidOutThrough: -1,
            pageCount: pages.length,
            processedBlockCount: 0,
            totalBlockCount,
            estimatedPageCount: pages.length,
            estimatedHeight: mode === 'continuous'
                ? firstPage?.height ?? 0
                : pages.length * ((firstPage?.pageHeight ?? firstPage?.height ?? 0) + 14),
            elapsedTime: 0,
            maxBlockDuration: 0,
            interactionWindowComplete: false,
        };
        this._layoutProgress$.next(this._externalLayoutProgress);
    }

    cancelExternalLayout(): void {
        this._externalLayoutProgress = null;
        this._externalProtectedPages = null;
        this._externalProtectedContinuousLayout = null;
    }

    /**
     * Whether this skeleton owns a fully finalized layout that can be used as
     * stable geometry while a later incremental generation is still running.
     */
    hasCompleteLayout(): boolean {
        return this._lastCompleteSkeletonData != null;
    }

    getSkeletonData() {
        return this._skeletonData;
    }

    /**
     * Refreshes Custom Block viewport-only metrics without rebuilding document flow.
     * Pure presentation metrics are published as one batch. Flow metrics are only
     * replaced for compatible drawings; incompatible drawings retain their stable
     * flow geometry while callers schedule a normal layout generation.
     */
    refreshCustomBlockPresentationViewports(): IDocumentCustomBlockPresentationRefreshResult {
        const skeletonData = this._skeletonData;
        if (skeletonData == null) {
            return { didRefresh: false, requiresLayout: false };
        }

        const unitId = this._docViewModel.getDataModel().getUnitId();
        const updates: Array<{
            drawing: IDocumentSkeletonDrawing;
            flowCompatible: boolean;
            viewport: IDocsCustomBlockRenderViewport;
        }> = [];
        let requiresLayout = false;

        for (const page of skeletonData.pages) {
            if (page.isLayoutPlaceholder || page.isMaterializationPlaceholder) {
                continue;
            }

            for (const drawing of page.skeDrawings.values()) {
                if (drawing.customBlockRenderViewport == null) {
                    continue;
                }

                const fallbackWidth = drawing.drawingOrigin.docTransform.size.width ?? drawing.width;
                const fallbackHeight = drawing.drawingOrigin.docTransform.size.height ?? drawing.height;
                const viewport = getDocsCustomBlockRenderViewport(unitId, drawing.drawingId, {
                    blockLeft: drawing.aLeft,
                    fallbackHeight,
                    fallbackWidth,
                    pageMarginLeft: page.marginLeft,
                    pageMarginRight: page.marginRight,
                    pageWidth: page.pageWidth,
                });
                if (viewport == null) {
                    continue;
                }
                const flowCompatible = isSameLayoutMetric(viewport.width, drawing.width) &&
                    isSameLayoutMetric(viewport.height, drawing.height);
                requiresLayout ||= !flowCompatible;
                updates.push({ drawing, flowCompatible, viewport });
            }
        }

        for (const { drawing, flowCompatible, viewport } of updates) {
            const currentViewport = drawing.customBlockRenderViewport;
            drawing.customBlockRenderViewport = {
                bleedLeft: viewport.bleedLeft,
                bleedWidth: viewport.bleedWidth,
                contentHeight: flowCompatible ? viewport.contentHeight : currentViewport?.contentHeight,
                contentWidth: flowCompatible ? viewport.contentWidth : currentViewport?.contentWidth,
                height: flowCompatible ? viewport.height : currentViewport?.height,
                pageContentWidth: flowCompatible ? viewport.pageContentWidth : currentViewport?.pageContentWidth,
                viewScale: viewport.viewScale,
                viewportHeight: viewport.viewportHeight,
            };
        }
        if (updates.length > 0) {
            this._dirty$.next(true);
        }

        return { didRefresh: updates.length > 0, requiresLayout };
    }

    applyLayoutPublication(
        publication: IDocumentLayoutGeometryPublication,
        progress: IDocumentLayoutProgress,
        materializedPageRange?: IDocumentLayoutPageRange
    ): IDocumentLayoutApplyResult {
        const skeletonData: IDocumentSkeletonCached = this._skeletonData ?? {
            pages: [],
            left: publication.left,
            top: publication.top,
            st: publication.st,
            ...(publication.ed == null ? {} : { ed: publication.ed }),
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        const protectedContinuousLayout = publication.kind === 'block'
            ? this._externalProtectedContinuousLayout
            : null;
        if (publication.kind === 'block' && protectedContinuousLayout != null) {
            protectedContinuousLayout.pendingPublications.push(publication);
        }
        const commitsProtectedContinuousLayout = progress.complete && protectedContinuousLayout != null;
        const publicationToApply = publication.kind === 'block' && protectedContinuousLayout != null && !commitsProtectedContinuousLayout
            ? this._resolveProtectedContinuousPublication(skeletonData, publication, protectedContinuousLayout.range.endOffset)
            : publication;

        if (publicationToApply == null) {
            if (progress.complete) {
                setPageParent(skeletonData.pages, skeletonData);
                this._lastCompleteSkeletonData = skeletonData;
                this._pendingInvalidationAnchor = null;
                this._externalProtectedContinuousLayout = null;
            }
            this._externalLayoutProgress = progress.complete ? null : progress;
            this._layoutProgress$.next(progress);
            return { didReplaceProtectedPages: false };
        }

        skeletonData.left = publicationToApply.left;
        skeletonData.top = publicationToApply.top;
        skeletonData.st = publicationToApply.st;
        if (publicationToApply.ed == null) {
            delete skeletonData.ed;
        } else {
            skeletonData.ed = publicationToApply.ed;
        }
        if (publicationToApply.kind === 'block') {
            const publications = commitsProtectedContinuousLayout
                ? protectedContinuousLayout.pendingPublications
                : [publicationToApply];
            for (const pendingPublication of publications) {
                this._applyExternalLayoutResources(skeletonData, pendingPublication.resources);
                applyDocumentSkeletonContinuousBlock(
                    skeletonData,
                    pendingPublication.block,
                    this._docViewModel.getSnapshot()
                );
            }
        } else {
            this._applyExternalLayoutResources(skeletonData, publicationToApply.resources);
            for (const pagePublication of publicationToApply.pages) {
                const protectedPages = this._externalProtectedPages;
                const protectedPage = protectedPages?.pages.get(pagePublication.pageIndex);
                protectedPages?.publishedPageIndexes.add(pagePublication.pageIndex);
                // Reuse the Main page object only when the complete page geometry is
                // continuation-compatible. A divergent page inside the interaction
                // window stays behind the presentation barrier, while canonical pages
                // beyond that window remain independent and can publish progressively.
                // Completion replaces only the protected divergent pages atomically.
                if (protectedPage != null && protectedPages != null) {
                    skeletonData.pages[pagePublication.pageIndex] = protectedPage.page;
                    if (
                        protectedPage.checkpoint !==
                        serializePaginatedContinuationCheckpoint(pagePublication.page)
                    ) {
                        const hydratedPage = hydrateDocumentSkeletonPage(
                            pagePublication.page,
                            skeletonData,
                            this._docViewModel.getSnapshot()
                        );
                        protectedPages.divergenceStartPageIndex = Math.min(
                            protectedPages.divergenceStartPageIndex ?? pagePublication.pageIndex,
                            pagePublication.pageIndex
                        );
                        protectedPages.pendingPages.set(pagePublication.pageIndex, hydratedPage);
                    }
                } else if (
                    materializedPageRange == null ||
                    (
                        pagePublication.pageIndex >= materializedPageRange.startPageIndex &&
                        pagePublication.pageIndex <= materializedPageRange.endPageIndex
                    )
                ) {
                    skeletonData.pages[pagePublication.pageIndex] = hydrateDocumentSkeletonPage(
                        pagePublication.page,
                        skeletonData,
                        this._docViewModel.getSnapshot()
                    );
                } else {
                    skeletonData.pages[pagePublication.pageIndex] = hydrateDocumentSkeletonPageMaterializationPlaceholder(
                        pagePublication.page,
                        skeletonData
                    );
                }
            }
            if (materializedPageRange != null) {
                this._compactMaterializedPages(skeletonData, materializedPageRange);
            }
        }
        if (publicationToApply.kind === 'page' && progress.didPublishAnchor && !progress.complete) {
            const placeholderPages: IDocumentSkeletonPage[] = [];
            for (let pageIndex = progress.publishedPageCount; pageIndex < skeletonData.pages.length; pageIndex++) {
                const currentPage = skeletonData.pages[pageIndex];
                if (currentPage == null || currentPage.isLayoutPlaceholder) {
                    continue;
                }
                const protectedRange = this._externalProtectedPages?.range;
                if (
                    protectedRange != null &&
                    pageIndex >= protectedRange.startPageIndex &&
                    pageIndex <= protectedRange.endPageIndex
                ) {
                    continue;
                }

                const placeholderPage = clonePageLayoutPlaceholderForPublish(currentPage);
                skeletonData.pages[pageIndex] = placeholderPage;
                placeholderPages.push(placeholderPage);
            }
            setPageParent(placeholderPages, skeletonData);
        }
        const protectedPages = this._externalProtectedPages;
        const didReplaceProtectedPages = progress.complete && (
            protectedPages?.divergenceStartPageIndex != null ||
            (commitsProtectedContinuousLayout && protectedContinuousLayout.pendingPublications.length > 0)
        );
        if (progress.complete) {
            if (protectedPages?.divergenceStartPageIndex != null) {
                for (
                    let pageIndex = protectedPages.divergenceStartPageIndex;
                    pageIndex < progress.pageCount;
                    pageIndex++
                ) {
                    const pendingPage = protectedPages.pendingPages.get(pageIndex);
                    if (pendingPage == null) {
                        if (!protectedPages.publishedPageIndexes.has(pageIndex)) {
                            throw new Error(
                                `Paginated layout Worker completed without publishing page ${pageIndex} after a divergent Main boundary.`
                            );
                        }
                        continue;
                    }
                    skeletonData.pages[pageIndex] = pendingPage;
                }
            }
            skeletonData.pages.length = progress.pageCount;
            if (publicationToApply.resources.skeListLevel != null) {
                skeletonData.skeListLevel = new Map(
                    publicationToApply.resources.skeListLevel.map(([listId, levels]) => [
                        listId,
                        levels.map((level) => level.map(({ bullet, paragraph }) => ({ bullet, paragraph }))),
                    ])
                );
            }
            if (publicationToApply.resources.drawingAnchor != null) {
                skeletonData.drawingAnchor = hydrateDrawingAnchors(
                    publicationToApply.resources.drawingAnchor
                );
            }
            setPageParent(skeletonData.pages, skeletonData);
            this._lastCompleteSkeletonData = skeletonData;
            this._pendingInvalidationAnchor = null;
            this._externalProtectedPages = null;
            this._externalProtectedContinuousLayout = null;
        }

        this._skeletonData = skeletonData;
        this._externalLayoutProgress = progress.complete ? null : progress;
        this._dirty$.next(true);
        this._layoutProgress$.next(progress);
        return { didReplaceProtectedPages };
    }

    applyLayoutPagePublication(
        publication: IDocumentLayoutPagePublication,
        materializedPageRange: IDocumentLayoutPageRange
    ): boolean {
        const skeletonData = this._skeletonData;
        if (skeletonData == null || publication.pageIndex >= skeletonData.pages.length) {
            return false;
        }

        skeletonData.pages[publication.pageIndex] = hydrateDocumentSkeletonPage(
            publication.page,
            skeletonData,
            this._docViewModel.getSnapshot()
        );
        this._compactMaterializedPages(skeletonData, materializedPageRange);
        this._dirty$.next(true);
        return true;
    }

    private _compactMaterializedPages(
        skeletonData: IDocumentSkeletonCached,
        materializedPageRange: IDocumentLayoutPageRange
    ): void {
        const placeholders: IDocumentSkeletonPage[] = [];
        for (let pageIndex = 0; pageIndex < skeletonData.pages.length; pageIndex++) {
            if (
                pageIndex >= materializedPageRange.startPageIndex &&
                pageIndex <= materializedPageRange.endPageIndex
            ) {
                continue;
            }
            const page = skeletonData.pages[pageIndex];
            if (page.isLayoutPlaceholder || page.isMaterializationPlaceholder) {
                continue;
            }
            const placeholder = clonePageMaterializationPlaceholderForPublish(page);
            skeletonData.pages[pageIndex] = placeholder;
            placeholders.push(placeholder);
        }
        setPageParent(placeholders, skeletonData);
    }

    private _applyExternalLayoutResources(
        skeletonData: IDocumentSkeletonCached,
        resources: IDocumentLayoutResourcePublication
    ): void {
        if (resources.reset) {
            skeletonData.skeHeaders.clear();
            skeletonData.skeFooters.clear();
        }
        for (const [segmentId, pagesByWidth] of resources.skeHeaders) {
            let hydratedPagesByWidth = skeletonData.skeHeaders.get(segmentId);
            if (hydratedPagesByWidth == null) {
                hydratedPagesByWidth = new Map();
                skeletonData.skeHeaders.set(segmentId, hydratedPagesByWidth);
            }
            for (const [width, page] of pagesByWidth) {
                hydratedPagesByWidth.set(
                    width,
                    hydrateDocumentSkeletonPage(page, undefined, this._docViewModel.getSnapshot())
                );
            }
        }
        for (const [segmentId, pagesByWidth] of resources.skeFooters) {
            let hydratedPagesByWidth = skeletonData.skeFooters.get(segmentId);
            if (hydratedPagesByWidth == null) {
                hydratedPagesByWidth = new Map();
                skeletonData.skeFooters.set(segmentId, hydratedPagesByWidth);
            }
            for (const [width, page] of pagesByWidth) {
                hydratedPagesByWidth.set(
                    width,
                    hydrateDocumentSkeletonPage(page, undefined, this._docViewModel.getSnapshot())
                );
            }
        }
    }

    private _resolveProtectedContinuousPublication(
        skeletonData: IDocumentSkeletonCached,
        publication: IDocumentLayoutBlockGeometryPublication,
        protectedEndOffset: number
    ): IDocumentLayoutBlockGeometryPublication | null {
        const { flow } = publication.block;
        const firstUnprotectedLineOffset = flow.lines.findIndex((line) => line.st > protectedEndOffset);
        if (firstUnprotectedLineOffset < 0) {
            return null;
        }

        const existingColumn = skeletonData.pages[publication.block.pageIndex]
            ?.sections[flow.sectionIndex]
            ?.columns[flow.columnIndex];
        if (existingColumn == null) {
            throw new Error('Continuous layout cannot merge a Worker tail without the Main interaction boundary.');
        }

        const firstUnprotectedLine = flow.lines[firstUnprotectedLineOffset];
        const matchingTailLineIndex = existingColumn.lines.findIndex(
            (line) => line.st >= firstUnprotectedLine.st
        );
        const targetLineIndex = matchingTailLineIndex < 0
            ? existingColumn.lines.length
            : matchingTailLineIndex;

        if (firstUnprotectedLineOffset > 0) {
            const mainBoundaryLine = existingColumn.lines[targetLineIndex - 1];
            const workerBoundaryLine = flow.lines[firstUnprotectedLineOffset - 1];
            if (
                mainBoundaryLine == null ||
                mainBoundaryLine.st !== workerBoundaryLine.st ||
                mainBoundaryLine.ed !== workerBoundaryLine.ed
            ) {
                throw new Error(`Continuous layout Main and Worker boundaries do not share the same continuation checkpoint: Main ${mainBoundaryLine?.st}:${mainBoundaryLine?.ed}@${mainBoundaryLine?.top}/${mainBoundaryLine?.lineHeight}/${mainBoundaryLine?.width}, Worker ${workerBoundaryLine.st}:${workerBoundaryLine.ed}@${workerBoundaryLine.top}/${workerBoundaryLine.lineHeight}/${workerBoundaryLine.width}.`);
            }
            if (
                mainBoundaryLine.top !== workerBoundaryLine.top ||
                mainBoundaryLine.lineHeight !== workerBoundaryLine.lineHeight ||
                mainBoundaryLine.width !== workerBoundaryLine.width
            ) {
                // A Custom Block, font, or host viewport can finish measuring
                // after Main publishes the interaction window but before Worker
                // captures its geometry. The continuation identity still matches,
                // while every coordinate after it belongs to a different layout.
                // Keep Main visible and commit the canonical Worker result only
                // after completion instead of translating a partial collection of
                // lines, tables, drawings, and column groups independently.
                return null;
            }
        }

        return {
            ...publication,
            block: {
                ...publication.block,
                flow: {
                    ...flow,
                    lineIndex: targetLineIndex,
                    lines: flow.lines.slice(firstUnprotectedLineOffset),
                },
            },
        };
    }

    /**
     * Returns a cloned snapshot of the most recent layout's bounded pagination counters.
     * These diagnostics describe renderer work and are not part of the document model.
     */
    getPaginationMetrics(): Nullable<IDocumentPaginationMetrics> {
        return this._paginationMetrics == null ? null : { ...this._paginationMetrics };
    }

    resetInitialWidth() {
        this._initialWidth = 0;
    }

    getActualSize() {
        const skeletonData = this.getSkeletonData();
        let actualWidth = 0;
        let actualHeight = 0;

        skeletonData?.pages.forEach((page) => {
            const { width, height } = page;
            actualWidth = Math.max(this._initialWidth, width);
            this._initialWidth = actualWidth;
            actualHeight += height;
        });

        return {
            actualWidth,
            actualHeight,
        };
    }

    private _getPageActualWidth(page: IDocumentSkeletonPage) {
        let maxWidth = Number.NEGATIVE_INFINITY;
        for (const section of page.sections) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    let lineWidth = 0;
                    for (const divide of line.divides) {
                        for (const glyph of divide.glyphGroup) {
                            lineWidth += glyph.width;
                        }
                    }
                    maxWidth = Math.max(maxWidth, lineWidth);
                }
            }
        }

        return maxWidth;
    }

    getPageSize() {
        return this.getViewModel().getDataModel().documentStyle.pageSize;
    }

    findPositionByGlyph(glyph: IDocumentSkeletonGlyph, segmentPage: number): Nullable<INodeSearch> {
        const divide = glyph.parent;
        const line = divide?.parent;
        const column = line?.parent;
        const section = column?.parent;
        const page = section?.parent;
        const skeletonData = this.getSkeletonData();

        if (!divide || !column || !section || !page || !skeletonData) {
            return;
        }

        const pageType = page.type;

        const glyphIndex = divide.glyphGroup.indexOf(glyph);

        const divideIndex = line.divides.indexOf(divide);

        const lineIndex = column.lines.indexOf(line);

        const columnIndex = section.columns.indexOf(column);

        const sectionIndex = page.sections.indexOf(section);

        let pageIndex = -1;

        const path = getPagePath(page);

        switch (pageType) {
            case DocumentSkeletonPageType.HEADER:
            case DocumentSkeletonPageType.FOOTER: {
                pageIndex = 0;
                break;
            }

            case DocumentSkeletonPageType.BODY: {
                pageIndex = skeletonData.pages.indexOf(page);
                break;
            }

            case DocumentSkeletonPageType.CELL: {
                pageIndex = typeof path[1] === 'number' ? path[1] : segmentPage;
                break;
            }

            default: {
                throw new Error('Invalid page type');
            }
        }

        return {
            glyph: glyphIndex,
            divide: divideIndex,
            line: lineIndex,
            column: columnIndex,
            section: sectionIndex,
            page: pageIndex,
            segmentPage,
            pageType,
            path,
        };
    }

    findCharIndexByPosition(position: INodePosition): Nullable<number> {
        const glyph = this.findGlyphByPosition(position);
        const divide = glyph?.parent;

        if (divide == null) {
            return;
        }

        const { st, glyphGroup } = divide;

        let index = st;

        for (const g of glyphGroup) {
            if (g === glyph) {
                break;
            }

            index += g.count;
        }

        return position.isBack ? index : (index + glyph!.count);
    }

    findNodePositionByCharIndex(charIndex: number, isBack: boolean = true, segmentId = '', segmentPIndex = -1): Nullable<INodePosition> {
        const nodes = this._findNodeByIndex(charIndex, segmentId, segmentPIndex);

        if (nodes == null) {
            return;
        }

        const skeletonData = this.getSkeletonData();

        if (!skeletonData) {
            return;
        }

        const pages = skeletonData.pages;

        const { glyph, divide, line, column, section, page, segmentPageIndex, pageType } = nodes;

        const path = getPagePath(page);

        let pageIndex = -1;

        switch (pageType) {
            case DocumentSkeletonPageType.HEADER:
            case DocumentSkeletonPageType.FOOTER: {
                pageIndex = 0;
                break;
            }

            case DocumentSkeletonPageType.BODY: {
                pageIndex = pages.indexOf(page);
                break;
            }

            case DocumentSkeletonPageType.CELL: {
                pageIndex = typeof path[1] === 'number' ? path[1] : segmentPageIndex;
                break;
            }

            default: {
                throw new Error('Invalid page type');
            }
        }

        return {
            glyph: divide.glyphGroup.indexOf(glyph),
            divide: line.divides.indexOf(divide),
            line: column.lines.indexOf(line),
            column: section.columns.indexOf(column),
            section: page.sections.indexOf(section),
            page: pageIndex,
            pageType,
            segmentPage: segmentPageIndex,
            isBack,
            path,
        };
    }

    findBodyPageIndexByCharIndex(charIndex: number): number {
        return this._findBodyPageIndex(this._skeletonData?.pages ?? [], charIndex);
    }

    findNodeByCharIndex(charIndex: number, segmentId = '', segmentPageIndex = -1): Nullable<IDocumentSkeletonGlyph> {
        const nodes = this._findNodeByIndex(charIndex, segmentId, segmentPageIndex);

        return nodes?.glyph;
    }

    findGlyphByPosition(position: Nullable<INodePosition>) {
        if (position == null) {
            return;
        }

        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages, skeFooters, skeHeaders } = skeletonData;

        const { divide, line, column, section, segmentPage, pageType, path } = position;

        let { glyph } = position;

        let skePage: Nullable<IDocumentSkeletonPage> = null;

        if (pageType === DocumentSkeletonPageType.HEADER || pageType === DocumentSkeletonPageType.FOOTER) {
            skePage = pages[segmentPage];
            const { headerId, footerId, pageWidth } = skePage;

            if (pageType === DocumentSkeletonPageType.HEADER) {
                const skeHeader = skeHeaders.get(headerId)?.get(pageWidth);
                if (skeHeader == null) {
                    return;
                } else {
                    skePage = skeHeader;
                }
            } else if (pageType === DocumentSkeletonPageType.FOOTER) {
                const skeFooter = skeFooters.get(footerId)?.get(pageWidth);
                if (skeFooter == null) {
                    return;
                } else {
                    skePage = skeFooter;
                }
            }
        } else if (pageType === DocumentSkeletonPageType.CELL && path[0] !== 'pages') {
            skePage = getSegmentPageFromRelativePath(skeletonData, segmentPage, path);
        } else {
            skePage = getPageFromPath(skeletonData, path);
        }

        if (skePage == null) {
            return;
        }

        const glyphGroup =
            skePage.sections[section].columns[column].lines[line].divides[divide].glyphGroup;

        glyph = Math.min(glyph, glyphGroup.length - 1);

        if (glyphGroup[glyph].glyphType === GlyphType.LIST) {
            glyph += 1;
        }

        return glyphGroup[glyph];
    }

    findEditAreaByCoord(
        coord: Vector2,
        pageLayoutType: PageLayoutType,
        pageMarginLeft: number,
        pageMarginTop: number
    ): {
        editArea: DocumentEditArea;
        pageNumber: number;
        page: Nullable<IDocumentSkeletonPage>;
    } {
        const { x, y } = coord;
        let editArea = DocumentEditArea.BODY;
        let pageNumber = -1;
        let pageSkeleton = null;
        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return {
                editArea,
                page: pageSkeleton,
                pageNumber,
            };
        }

        this._findLiquid.reset();

        const { pages } = skeletonData;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];

            const { marginTop, marginBottom, pageWidth, pageHeight } = page;

            if (
                x > this._findLiquid.x && x < this._findLiquid.x + pageWidth &&
                y > this._findLiquid.y && y < this._findLiquid.y + marginTop
            ) {
                editArea = DocumentEditArea.HEADER;
                pageSkeleton = page;
                pageNumber = i;
                break;
            }

            if (
                x > this._findLiquid.x && x < this._findLiquid.x + pageWidth &&
                y > this._findLiquid.y + marginTop && y < this._findLiquid.y + pageHeight - marginBottom
            ) {
                editArea = DocumentEditArea.BODY;
                pageSkeleton = page;
                pageNumber = i;
                break;
            }

            if (
                x > this._findLiquid.x && x < this._findLiquid.x + pageWidth &&
                y > this._findLiquid.y + pageHeight - marginBottom && y < this._findLiquid.y + pageHeight
            ) {
                editArea = DocumentEditArea.FOOTER;
                pageSkeleton = page;
                pageNumber = i;
                break;
            }

            this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        return {
            editArea,
            page: pageSkeleton,
            pageNumber,
        };
    }

    findNodeByCoord(
        coord: Vector2,
        pageLayoutType: PageLayoutType,
        pageMarginLeft: number,
        pageMarginTop: number,
        restrictions?: IFindNodeRestrictions
    ): Nullable<INodeInfo> {
        const { x, y } = coord;

        const skeletonData = this.getSkeletonData();
        if (skeletonData == null) {
            return;
        }

        const cache: INearestCache = {
            nearestNodeList: [],
            nearestNodeDistanceList: [],
        };

        const { pages, skeHeaders, skeFooters } = skeletonData;
        const editArea = this.findEditAreaByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop).editArea;
        const pageLength = pages.length;

        this._findLiquid.reset();
        if (restrictions == null) {
            for (let pi = 0; pi < pageLength; pi++) {
                const page = pages[pi];
                const { headerId, footerId, pageWidth } = page;

                let exactMatch = null;

                if (editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER) {
                    const headerSke = skeHeaders.get(headerId)?.get(pageWidth) as IDocumentSkeletonPage;

                    if (headerSke) {
                        exactMatch = this._collectNearestNode(
                            headerSke,
                            DocumentSkeletonPageType.HEADER,
                            page,
                            headerId,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }

                    const footerSke = skeFooters.get(footerId)?.get(pageWidth) as IDocumentSkeletonPage;

                    if (footerSke) {
                        exactMatch = exactMatch ?? this._collectNearestNode(
                            footerSke,
                            DocumentSkeletonPageType.FOOTER,
                            page,
                            footerId,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }
                } else {
                    const BODY_SEGMENT_ID = '';
                    exactMatch = this._collectNearestNode(
                        page,
                        DocumentSkeletonPageType.BODY,
                        page,
                        BODY_SEGMENT_ID,
                        pi,
                        cache,
                        x,
                        y,
                        pageLength
                    );
                }

                if (exactMatch) {
                    return exactMatch;
                }

                this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
            }
        } else {
            const { segmentId, segmentPage, strict } = restrictions;
            let exactMatch = null;

            if (strict === false) {
                for (let pi = 0; pi < pageLength; pi++) {
                    const page = pages[pi];
                    const { headerId, footerId, pageWidth } = page;

                    if (segmentId !== '') {
                        const headerSke = skeHeaders.get(headerId)?.get(pageWidth) as IDocumentSkeletonPage;

                        if (headerSke) {
                            exactMatch = this._collectNearestNode(
                                headerSke,
                                DocumentSkeletonPageType.HEADER,
                                page,
                                headerId,
                                pi,
                                cache,
                                x,
                                y,
                                pageLength
                            );
                        }

                        const footerSke = skeFooters.get(footerId)?.get(pageWidth) as IDocumentSkeletonPage;

                        if (footerSke) {
                            exactMatch = exactMatch ?? this._collectNearestNode(
                                footerSke,
                                DocumentSkeletonPageType.FOOTER,
                                page,
                                footerId,
                                pi,
                                cache,
                                x,
                                y,
                                pageLength
                            );
                        }
                    } else {
                        const BODY_SEGMENT_ID = '';
                        exactMatch = this._collectNearestNode(
                            page,
                            DocumentSkeletonPageType.BODY,
                            page,
                            BODY_SEGMENT_ID,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }

                    if (exactMatch) {
                        return exactMatch;
                    }

                    this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                }
            } else {
                for (let pi = 0; pi < pageLength; pi++) {
                    const page = pages[pi];

                    if (segmentId) {
                        if (segmentPage !== pi) {
                            this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                            continue;
                        }

                        const { headerId, pageWidth } = page;

                        const segmentSke = segmentId === headerId ? skeHeaders.get(segmentId)?.get(pageWidth) : skeFooters.get(segmentId)?.get(pageWidth);
                        if (segmentSke) {
                            exactMatch = this._collectNearestNode(
                                segmentSke,
                                segmentId === headerId ? DocumentSkeletonPageType.HEADER : DocumentSkeletonPageType.FOOTER,
                                page,
                                segmentId,
                                segmentPage,
                                cache,
                                x,
                                y,
                                pageLength
                            );
                        }
                    } else {
                        const BODY_SEGMENT_ID = '';
                        exactMatch = this._collectNearestNode(
                            page,
                            DocumentSkeletonPageType.BODY,
                            page,
                            BODY_SEGMENT_ID,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }

                    if (exactMatch) {
                        return exactMatch;
                    }

                    this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                }
            }
        }

        return this._getNearestNode(cache.nearestNodeList, cache.nearestNodeDistanceList);
    }

    private _collectNearestNode(
        segmentPage: IDocumentSkeletonPage,
        pageType: DocumentSkeletonPageType,
        page: IDocumentSkeletonPage,
        segmentId: string,
        pi: number,
        cache: INearestCache,
        x: number,
        y: number,
        pageLength: number,
        nestLevel: number = 0
        // eslint-disable-next-line ts/no-explicit-any
    ): any {
        const { sections, skeTables, skeColumnGroups = new Map() } = segmentPage;
        this._findLiquid.translateSave();

        const pageLeft = this._findLiquid.x;
        const pageRight = pageLeft + page.pageWidth; // Use page.pageWidth instead of segmentPage.pageWidth, because the segmentPage not include the margin left and right.
        const pageTop = this._findLiquid.y + (pageType === DocumentSkeletonPageType.FOOTER ? page.pageHeight - segmentPage.pageHeight : 0);
        const pageBottom = pageTop + segmentPage.pageHeight;

        let pointInPage = x >= pageLeft
            && x <= pageRight
            && y >= pageTop
            && y <= pageBottom;

        // Handle the outmost page.
        if (nestLevel === 0 && pageType === DocumentSkeletonPageType.BODY) {
            const isFirstPage = pi === 0;
            const isLastPage = pi === pageLength - 1;
            // TODO: Use page margin top as page gap now, need to consider the page gap in the future.
            const halfMarginTop = page.originMarginTop / 2;

            // It's the only page, point always in page.
            if (isFirstPage && isLastPage) {
                pointInPage = true;
            } else if (isFirstPage) {
                pointInPage = y <= pageBottom + halfMarginTop;
            } else if (isLastPage) {
                pointInPage = y >= pageTop - halfMarginTop;
            } else {
                pointInPage = y >= pageTop - halfMarginTop && y <= pageBottom + halfMarginTop;
            }
        }

        switch (pageType) {
            case DocumentSkeletonPageType.HEADER: {
                this._findLiquid.translatePagePadding({
                    ...segmentPage,
                    marginLeft: page.marginLeft, // Because header or footer margin Left is 0.
                });
                break;
            }

            case DocumentSkeletonPageType.FOOTER: {
                const footerTop = page.pageHeight - segmentPage.height - segmentPage.marginBottom;
                this._findLiquid.translate(page.marginLeft, footerTop);
                break;
            }

            default: {
                this._findLiquid.translatePagePadding(page);
                break;
            }
        }

        if (pointInPage) {
            let nearestNodeDistanceY = Number.POSITIVE_INFINITY;

            for (const section of sections) {
                const { columns } = section;

                this._findLiquid.translateSave();
                this._findLiquid.translateSection(section);

                for (const column of columns) {
                    const { lines } = column;

                    this._findLiquid.translateSave();
                    this._findLiquid.translateColumn(column);

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const { divides, type, lineHeight = 0 } = line;

                        if (type === LineType.BLOCK) {
                            continue;
                        } else {
                            this._findLiquid.translateSave();
                            this._findLiquid.translateLine(line);

                            const { y: startY } = this._findLiquid;

                            const startY_fin = startY;

                            const endY_fin = startY + lineHeight;

                            const distanceY = Math.abs(y - endY_fin);

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { glyphGroup } = divide;

                                this._findLiquid.translateSave();
                                this._findLiquid.translateDivide(divide);

                                const { x: startX } = this._findLiquid;

                                for (const glyph of glyphGroup) {
                                    if (!isHitTestAddressableGlyph(glyph)) {
                                        continue;
                                    }

                                    const { width: glyphWidth, left: glyphLeft } = glyph;
                                    const startX_fin = startX + glyphLeft;
                                    const endX_fin = startX + glyphLeft + glyphWidth;
                                    const distanceX = Math.abs(x - endX_fin);

                                    // Handle pointer in the same line.
                                    if (y >= startY_fin && y <= endY_fin) {
                                        // Exact match glyph.
                                        if (x >= startX_fin && x <= endX_fin) {
                                            return {
                                                node: glyph,
                                                segmentPage: pageType === DocumentSkeletonPageType.BODY ? -1 : pi,
                                                segmentId,
                                                ratioX: x / (startX_fin + endX_fin),
                                                ratioY: y / (startY_fin + endY_fin),
                                            };
                                        }

                                        if (nearestNodeDistanceY !== Number.NEGATIVE_INFINITY) {
                                            cache.nearestNodeList = [];
                                            cache.nearestNodeDistanceList = [];
                                        }
                                        cache.nearestNodeList.push({
                                            node: glyph,
                                            segmentPage: pageType === DocumentSkeletonPageType.BODY ? -1 : pi,
                                            segmentId,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        cache.nearestNodeDistanceList.push({
                                            coordInPage: pointInPage,
                                            distance: distanceX,
                                            nestLevel,
                                        });

                                        nearestNodeDistanceY = Number.NEGATIVE_INFINITY;
                                        continue;
                                    }

                                    if (distanceY < nearestNodeDistanceY) {
                                        nearestNodeDistanceY = distanceY;
                                        cache.nearestNodeList = [];
                                        cache.nearestNodeDistanceList = [];
                                    }

                                    if (distanceY === nearestNodeDistanceY) {
                                        cache.nearestNodeList.push({
                                            node: glyph,
                                            segmentPage: pageType === DocumentSkeletonPageType.BODY ? -1 : pi,
                                            segmentId,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        cache.nearestNodeDistanceList.push({
                                            coordInPage: pointInPage,
                                            distance: distanceX,
                                            nestLevel,
                                        });
                                    }
                                }
                                this._findLiquid.translateRestore();
                            }
                            this._findLiquid.translateRestore();
                        }
                    }
                    this._findLiquid.translateRestore();
                }

                this._findLiquid.translateRestore();
            }
        }

        let exactMatch = null;
        if (pointInPage && skeTables.size > 0) {
            const unitId = this._docViewModel.getDataModel().getUnitId?.() ?? '';
            for (const table of skeTables.values()) {
                const { top: tableTop, left: tableLeft, rows } = table;
                const sourceTableId = getTableIdAndSliceIndex(table.tableId).tableId;
                const viewport = getDocsTableRenderViewport(unitId, sourceTableId);

                this._findLiquid?.translateSave();
                this._findLiquid?.translate(tableLeft, tableTop);
                if (hasDocsTableHorizontalViewport(viewport)) {
                    const visibleLeft = this._findLiquid.x + page.marginLeft - (viewport.leadingInsetLeft ?? 0);
                    const visibleRight = visibleLeft + viewport.viewportWidth;
                    if (x < visibleLeft || x > visibleRight) {
                        this._findLiquid?.translateRestore();
                        continue;
                    }

                    this._findLiquid?.translate(-viewport.scrollLeft, 0);
                }

                for (const row of rows) {
                    const { top: rowTop, cells, isRepeatRow } = row;

                    // Cursor should not in repeat row.
                    if (isRepeatRow) {
                        continue;
                    }

                    this._findLiquid?.translateSave();
                    this._findLiquid?.translate(0, rowTop);

                    for (const cell of cells) {
                        const { left: cellLeft } = cell;

                        this._findLiquid?.translateSave();
                        this._findLiquid?.translate(cellLeft, 0);

                        exactMatch = exactMatch ?? this._collectNearestNode(
                            cell,
                            DocumentSkeletonPageType.CELL,
                            cell,
                            segmentId,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength,
                            nestLevel + 1
                        );

                        this._findLiquid?.translateRestore();
                    }

                    this._findLiquid?.translateRestore();
                }

                this._findLiquid?.translateRestore();
            }
        }

        if (skeColumnGroups.size > 0) {
            for (const columnGroup of skeColumnGroups.values()) {
                const { top: columnGroupTop, left: columnGroupLeft, width: columnGroupWidth, height: columnGroupHeight, columns } = columnGroup;
                const absoluteColumnGroupLeft = this._findLiquid.x + columnGroupLeft;
                const absoluteColumnGroupTop = this._findLiquid.y + columnGroupTop;

                if (
                    x < absoluteColumnGroupLeft ||
                    x > absoluteColumnGroupLeft + columnGroupWidth ||
                    y < absoluteColumnGroupTop ||
                    y > absoluteColumnGroupTop + columnGroupHeight
                ) {
                    continue;
                }

                this._findLiquid?.translateSave();
                this._findLiquid?.translate(columnGroupLeft, columnGroupTop);

                for (const column of columns) {
                    const absoluteColumnLeft = absoluteColumnGroupLeft + column.left;
                    const absoluteColumnTop = absoluteColumnGroupTop + column.top;

                    if (
                        x < absoluteColumnLeft ||
                        x > absoluteColumnLeft + column.width ||
                        y < absoluteColumnTop ||
                        y > absoluteColumnTop + column.height
                    ) {
                        continue;
                    }

                    const nestedCache: INearestCache = {
                        nearestNodeList: [],
                        nearestNodeDistanceList: [],
                    };

                    this._findLiquid?.translateSave();
                    this._findLiquid?.translate(column.left, column.top);

                    exactMatch = exactMatch ?? this._collectNearestNode(
                        column.page,
                        DocumentSkeletonPageType.CELL,
                        column.page,
                        segmentId,
                        pi,
                        nestedCache,
                        x,
                        y,
                        pageLength,
                        nestLevel + 1
                    ) ?? this._getNearestNode(nestedCache.nearestNodeList, nestedCache.nearestNodeDistanceList);

                    this._findLiquid?.translateRestore();
                }

                this._findLiquid?.translateRestore();
            }
        }

        if (exactMatch) {
            this._findLiquid.translateRestore();
            return exactMatch;
        }

        this._findLiquid.translateRestore();
    }

    private _getNearestNode(nearestNodeList: INodeInfo[], nearestNodeDistanceList: IDistance[]) {
        if (nearestNodeDistanceList.length === 0) {
            return;
        }

        if (nearestNodeDistanceList.length === 1) {
            return nearestNodeList[0];
        }

        let miniValue = nearestNodeDistanceList[0];

        for (let i = 1; i < nearestNodeDistanceList.length; i++) {
            const { distance, nestLevel, coordInPage } = nearestNodeDistanceList[i];

            if (nestLevel > miniValue.nestLevel) {
                miniValue = nearestNodeDistanceList[i];
                continue;
            }

            if (nestLevel === miniValue.nestLevel) {
                if (coordInPage === miniValue.coordInPage) {
                    if (distance < miniValue.distance) {
                        miniValue = nearestNodeDistanceList[i];
                        continue;
                    }
                } else {
                    if (coordInPage) {
                        miniValue = nearestNodeDistanceList[i];
                        continue;
                    }
                }
            }
        }

        const miniValueIndex = nearestNodeDistanceList.indexOf(miniValue);

        return nearestNodeList[miniValueIndex];
    }

    private _getPageBoundingBox(page: IDocumentSkeletonPage, pageLayoutType: PageLayoutType) {
        const { pageWidth, pageHeight } = page;
        const { x: startX, y: startY } = this._findLiquid;

        let endX = -1;
        let endY = -1;
        if (pageLayoutType === PageLayoutType.VERTICAL) {
            endX = pageWidth;
            endY = startY + pageHeight;
        } else if (pageLayoutType === PageLayoutType.HORIZONTAL) {
            endX = startX + pageWidth;
            endY = pageHeight;
        }

        return {
            startX,
            startY,
            endX,
            endY,
        };
    }

    private _translatePage(
        page: IDocumentSkeletonPage,
        pageLayoutType: PageLayoutType,
        pageMarginLeft: number,
        pageMarginTop: number
    ) {
        this._findLiquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
    }

    private _getLayoutProgress(
        state: IIncrementalLayoutState,
        didPublish = false,
        didPublishAnchor = false
    ): IDocumentLayoutProgress {
        const pages = state.ctx.skeleton.pages;
        const pageCount = pages.length;
        const publicationComplete = state.complete && state.lastPublishedPageCount >= pageCount;
        const totalBlockCount = state.totalBlockCount;
        const processedBlockCount = state.processedBlockCount;
        const defaultEstimatedPageCount = Math.ceil(totalBlockCount / 20);
        const observedEstimatedPageCount = pageCount > 1 && processedBlockCount > 0
            ? Math.ceil(((pageCount - 1) * totalBlockCount) / processedBlockCount)
            : 0;
        const previousCompletePageCount = state.priorityAnchor == null
            ? 0
            : this._lastCompleteSkeletonData?.pages.length ?? 0;
        const estimatedPageCount = state.mode === 'paginated' && !publicationComplete
            ? previousCompletePageCount > 0
                ? Math.max(pageCount, previousCompletePageCount)
                : Math.max(
                    pageCount,
                    Math.min(
                        Math.max(defaultEstimatedPageCount, observedEstimatedPageCount),
                        Math.max(defaultEstimatedPageCount * 4, pageCount)
                    )
                )
            : pageCount;
        const firstPage = pages[0];
        const estimatedHeight = state.mode === 'continuous'
            ? publicationComplete
                ? (firstPage?.height ?? 0)
                : Math.max(
                    firstPage?.height ?? 0,
                    totalBlockCount * 32,
                    processedBlockCount > 0
                        ? ((firstPage?.height ?? 0) * totalBlockCount) / processedBlockCount
                        : 0
                )
            : estimatedPageCount * ((firstPage?.pageHeight ?? firstPage?.height ?? 0) + 14);

        return {
            generation: state.generation,
            publicationRevision: state.publicationRevision,
            didPublish,
            didPublishAnchor,
            publishedPageCount: state.lastPublishedPageCount,
            reason: state.reason,
            mode: state.mode,
            complete: publicationComplete,
            cancelled: state.cancelled,
            anchorReady: this._isPriorityAnchorReady(state),
            laidOutThrough: state.laidOutThrough,
            stableLaidOutThrough: state.complete ? state.laidOutThrough : state.stableLaidOutThrough,
            pageCount,
            processedBlockCount,
            totalBlockCount,
            estimatedPageCount,
            estimatedHeight,
            elapsedTime: getLayoutNow() - state.startedAt,
            maxBlockDuration: state.maxBlockDuration,
            interactionWindowComplete: state.interactionWindowComplete,
        };
    }

    private _tryConvergeUnaffectedTail(state: IIncrementalLayoutState): boolean {
        const invalidation = state.invalidation;
        const previous = this._lastCompleteSkeletonData;
        if (
            !state.reuseUnaffectedTail ||
            state.mode !== 'paginated' ||
            state.reason !== 'edit' ||
            invalidation == null ||
            previous == null ||
            state.priorityAnchor == null ||
            state.priorityPageIndex < 0 ||
            !this._isPriorityAnchorReady(state)
        ) {
            return false;
        }

        // Active pages carry block-local ranges until the normal publication
        // finalizer assigns body-absolute indexes. Finalize only the completed
        // prefix before comparing continuation checkpoints; the open last page
        // remains untouched and every page is finalized at most once.
        this._finalizePaginatedPagesForPublication(
            state,
            Math.max(0, state.ctx.skeleton.pages.length - 1)
        );

        const foreground = state.anchorPublished
            ? null
            : this._createPublishablePartialSkeleton(state, state.priorityPageIndex + 1);
        const currentPageIndex = foreground == null
            ? state.ctx.skeleton.pages.length - 2
            : state.priorityPageIndex;
        const currentPage = foreground?.pages[currentPageIndex] ?? state.ctx.skeleton.pages[currentPageIndex];
        if (currentPageIndex < state.priorityPageIndex || currentPage == null) {
            return false;
        }
        const currentPageEnd = currentPage.ed;
        const previousPageEnd = mapCurrentOffsetToPrevious(currentPageEnd, invalidation);
        const previousPageIndex = foreground == null
            ? previous.pages.findIndex((page, pageIndex) =>
                pageIndex >= state.priorityPageIndex &&
                page.ed === previousPageEnd
            )
            : state.priorityPageIndex;
        const previousPage = previous.pages[previousPageIndex];
        if (
            previousPage == null ||
            invalidation.oldEnd > previousPage.ed ||
            previousPage.skeDrawings.size > 0 ||
            previousPage.skeTables.size > 0 ||
            previousPage.skeColumnGroups.size > 0 ||
            currentPage.skeDrawings.size > 0 ||
            currentPage.skeTables.size > 0 ||
            currentPage.skeColumnGroups.size > 0 ||
            !hasSamePageExitGeometry(previousPage, currentPage)
        ) {
            return false;
        }

        const mutationDelta = invalidation.newEnd - invalidation.oldEnd;
        if (
            invalidation.newEnd > currentPageEnd ||
            currentPageEnd !== previousPage.ed + mutationDelta
        ) {
            return false;
        }

        const prefix = (foreground?.pages ?? state.ctx.skeleton.pages).slice(0, currentPageIndex + 1);
        const tail = previous.pages
            .slice(previousPageIndex + 1)
            .map((page) => {
                shiftPageCharacterOffsets(page, mutationDelta);
                return page;
            });

        state.ctx.skeleton.pages = [...prefix, ...tail];
        for (const [segmentId, pagesByWidth] of previous.skeHeaders) {
            state.ctx.skeleton.skeHeaders.set(segmentId, pagesByWidth);
        }
        for (const [segmentId, pagesByWidth] of previous.skeFooters) {
            state.ctx.skeleton.skeFooters.set(segmentId, pagesByWidth);
        }
        state.reusedTail = true;
        this._finishIncrementalLayout(state);
        return true;
    }

    private _isPriorityAnchorReady(state: IIncrementalLayoutState): boolean {
        const anchor = state.priorityAnchor;
        if (anchor == null || state.complete) {
            return true;
        }

        if (state.interactionPageComplete) {
            return true;
        }

        if (state.mode === 'continuous') {
            return state.laidOutThrough >= anchor;
        }

        // A paginated page is not publishable merely because the edited paragraph
        // has been shaped. Page-level vertical alignment and pagination depend on
        // every block that still fits on that physical page. Wait until layout has
        // crossed the previous complete page boundary and stabilized the caret's
        // block so the published page can resolve the post-edit selection instead
        // of exposing only the paragraph immediately before it.
        if (state.priorityPageEnd != null) {
            const requiredOffset = Math.max(
                anchor,
                state.priorityPageEnd,
                state.invalidation?.newEnd ?? anchor
            );
            return state.stableLaidOutThrough >= requiredOffset &&
                state.ctx.skeleton.pages.length > Math.max(
                    state.stablePageCount + 1,
                    state.priorityPageIndex + 1
                );
        }

        // First-open layout has no prior boundary. The first physical page becomes
        // stable as soon as layout has entered a second page.
        return state.laidOutThrough >= anchor && state.ctx.skeleton.pages.length > 1;
    }

    private _tryReuseInteractionPageTail(
        state: IIncrementalLayoutState,
        paragraphNode: DataStreamTreeNode
    ): boolean {
        const candidate = state.interactionPageTail;
        if (candidate == null || paragraphNode.endIndex !== candidate.anchorEnd) {
            return false;
        }

        state.interactionPageTail = null;
        const currentPage = state.ctx.skeleton.pages[state.priorityPageIndex];
        const currentSection = currentPage?.sections[0];
        const currentColumn = currentSection?.columns[0];
        if (
            currentPage == null ||
            currentPage.sections.length !== 1 ||
            currentSection?.columns.length !== 1 ||
            currentColumn == null ||
            currentPage.skeDrawings.size > 0 ||
            currentPage.skeTables.size > 0 ||
            currentPage.skeColumnGroups.size > 0
        ) {
            return false;
        }

        const shiftedPreviousPage = clonePageFlowForPublish(candidate.previousPage);
        shiftPageCharacterOffsets(
            shiftedPreviousPage,
            candidate.pageEnd - getLastBodyFlowCharIndex(candidate.previousPage)
        );
        const previousSection = shiftedPreviousPage.sections[0];
        const previousColumn = previousSection?.columns[0];
        if (shiftedPreviousPage.sections.length !== 1 || previousSection?.columns.length !== 1 || previousColumn == null) {
            return false;
        }

        const currentAnchorLines = currentColumn.lines.filter((line) => line.paragraphIndex === candidate.anchorEnd);
        const previousAnchorLines = previousColumn.lines.filter((line) => line.paragraphIndex === candidate.anchorEnd);
        const originalPreviousColumn = candidate.previousPage.sections[0]?.columns[0];
        const originalPreviousAnchorLines = originalPreviousColumn?.lines.filter(
            (line) => line.paragraphIndex === candidate.previousAnchorEnd
        ) ?? [];
        if (currentAnchorLines.length === 0 || currentAnchorLines.length !== previousAnchorLines.length) {
            return false;
        }

        const hasSameLineGeometry = currentAnchorLines.every((line, index) => {
            const previousLine = previousAnchorLines[index];
            return isSameLayoutMetric(line.top, previousLine.top) &&
                isSameLayoutMetric(line.contentHeight, previousLine.contentHeight) &&
                isSameLayoutMetric(line.paddingTop, previousLine.paddingTop) &&
                isSameLayoutMetric(line.paddingBottom, previousLine.paddingBottom) &&
                isSameLayoutMetric(line.marginTop, previousLine.marginTop) &&
                isSameLayoutMetric(
                    line.lineHeight - line.marginBottom,
                    previousLine.lineHeight - previousLine.marginBottom
                );
        });
        if (!hasSameLineGeometry) {
            return false;
        }

        for (let index = 0; index < currentAnchorLines.length; index++) {
            currentAnchorLines[index].asc = previousAnchorLines[index].asc;
            currentAnchorLines[index].dsc = previousAnchorLines[index].dsc;
            if (originalPreviousAnchorLines[index]?.bullet == null) {
                delete currentAnchorLines[index].bullet;
            }
        }

        const currentLastAnchorLine = currentAnchorLines[currentAnchorLines.length - 1];
        const previousLastAnchorLine = previousAnchorLines[previousAnchorLines.length - 1];
        currentLastAnchorLine.lineHeight = previousLastAnchorLine.lineHeight;
        currentLastAnchorLine.marginBottom = previousLastAnchorLine.marginBottom;
        currentLastAnchorLine.spaceBelowApply = previousLastAnchorLine.spaceBelowApply;

        const suffixLines = previousColumn.lines.filter((line) => line.paragraphIndex > candidate.anchorEnd);
        for (const line of suffixLines) {
            line.parent = currentColumn;
            currentColumn.lines.push(line);
        }
        const previousSkeleton = candidate.previousSkeleton;
        const previousPageEnd = getLastBodyFlowCharIndex(candidate.previousPage);
        for (const [segmentId, anchors] of previousSkeleton.drawingAnchor ?? []) {
            let targetAnchors = state.ctx.skeletonResourceReference.drawingAnchor?.get(segmentId);
            if (targetAnchors == null) {
                targetAnchors = new Map();
                state.ctx.skeletonResourceReference.drawingAnchor?.set(segmentId, targetAnchors);
            }
            for (const [paragraphIndex, anchor] of anchors) {
                if (paragraphIndex <= candidate.previousAnchorEnd || paragraphIndex > previousPageEnd) {
                    continue;
                }
                const currentParagraphIndex = mapPreviousOffsetToCurrent(
                    paragraphIndex,
                    state.invalidation ?? undefined
                );
                targetAnchors.set(
                    currentParagraphIndex,
                    {
                        ...anchor,
                        paragraphIndex: currentParagraphIndex,
                        elements: suffixLines.filter((line) => line.paragraphIndex === currentParagraphIndex),
                    }
                );
            }
        }
        currentColumn.ed = previousColumn.ed;
        currentColumn.height = previousColumn.height;
        currentColumn.isFull = previousColumn.isFull;
        currentSection.ed = previousSection.ed;
        currentSection.height = previousSection.height;
        currentPage.ed = shiftedPreviousPage.ed;
        currentPage.height = shiftedPreviousPage.height;
        copyPageBoundaryMetadata(currentPage, shiftedPreviousPage);

        state.interactionPageComplete = true;
        state.interactionWindowComplete = candidate.terminal;
        state.laidOutThrough = Math.max(state.laidOutThrough, candidate.pageEnd);
        state.stableLaidOutThrough = Math.max(state.stableLaidOutThrough, candidate.pageEnd);
        state.processedBlockCount = candidate.terminal ? candidate.resumeBlockIndex : candidate.nextBlockIndex;
        state.layoutAnchor = null;

        const sections = state.ctx.viewModel.getChildren();
        if (candidate.terminal) {
            state.sectionIndex = candidate.resumeSectionIndex;
            state.paragraphIndex = candidate.resumeParagraphIndex;
            state.interactionWindowResume = {
                anchorEnd: candidate.anchorEnd,
                pageEnd: candidate.pageEnd,
                processedBlockCount: candidate.resumeBlockIndex,
                sectionIndex: candidate.resumeSectionIndex,
                paragraphIndex: candidate.resumeParagraphIndex,
            };
            return true;
        }
        if (candidate.nextSectionIndex >= sections.length) {
            this._finishIncrementalLayout(state);
            return true;
        }

        const sectionChanged = state.sectionIndex !== candidate.nextSectionIndex;
        state.sectionIndex = candidate.nextSectionIndex;
        state.paragraphIndex = candidate.nextParagraphIndex;
        if (sectionChanged) {
            state.sectionInitialized = false;
            state.sectionBreakConfig = null;
        } else if (state.sectionBreakConfig != null) {
            const nextPage = createSkeletonPage(
                state.ctx,
                state.sectionBreakConfig,
                state.ctx.skeletonResourceReference,
                candidate.previousPage.pageNumber + 1
            );
            const previousNextPage = candidate.previousSkeleton.pages[state.priorityPageIndex + 1];
            if (previousNextPage != null) {
                copyPageBoundaryMetadata(nextPage, previousNextPage);
            }
            state.ctx.skeleton.pages.push(nextPage);
        }
        return true;
    }

    private _advanceIncrementalLayout(state: IIncrementalLayoutState): void {
        const { ctx } = state;

        if (state.interactionWindowResume != null) {
            this._resumeAfterSealedInteractionPage(state);
        }

        if (state.pendingSlicedTableBuild != null) {
            if (!stepTableSkeletonsBuild(state.pendingSlicedTableBuild)) {
                return;
            }

            const pending = state.pendingSlicedTableBuild;
            if (pending.result != null) {
                cachePrecomputedSlicedTableSkeletons(
                    ctx,
                    pending.tableNode.startIndex,
                    pending.availableHeight,
                    pending.result
                );
            }
            if (state.pendingParagraphCheckpoint != null) {
                this._restoreIncrementalParagraphCheckpoint(ctx, state.pendingParagraphCheckpoint);
            }
            state.pendingSlicedTableBuild = null;
            state.pendingParagraphCheckpoint = null;
            return;
        }

        const sections = ctx.viewModel.getChildren();

        if (state.sectionIndex >= sections.length) {
            this._finishIncrementalLayout(state);
            return;
        }

        const sectionNode = sections[state.sectionIndex];
        if (!state.sectionInitialized) {
            this._initializeIncrementalSection(state, sectionNode);
        }

        const sectionBreakConfig = state.sectionBreakConfig;
        const curSkeletonPage = getLastPage(ctx.skeleton.pages);
        if (sectionBreakConfig == null || curSkeletonPage == null) {
            throw new Error('Incremental document layout failed to initialize a section page.');
        }

        const paragraphNode = sectionNode.children[state.paragraphIndex];
        const tableNode = paragraphNode?.children.length === 1 &&
            paragraphNode.children[0].nodeType === DataStreamTreeNodeType.TABLE
            ? paragraphNode.children[0]
            : null;
        if (tableNode != null) {
            state.pendingTableBuild ??= startTableSkeletonBuild(
                ctx,
                curSkeletonPage,
                ctx.viewModel,
                tableNode,
                sectionBreakConfig
            );
            if (state.pendingTableBuild != null && !stepTableSkeletonBuild(state.pendingTableBuild)) {
                return;
            }
            if (state.pendingTableBuild != null) {
                const tableSkeleton = state.pendingTableBuild.tableSkeleton;
                cachePrecomputedTableSkeleton(
                    ctx,
                    tableNode.startIndex,
                    tableSkeleton
                );
            }
        }

        const checkpoint = tableNode == null || state.mode !== 'paginated'
            ? null
            : this._captureIncrementalParagraphCheckpoint(ctx, curSkeletonPage);
        if (checkpoint != null) {
            ctx.deferSlicedTableLayout = (request) => {
                const pending = startTableSkeletonsBuild(
                    ctx,
                    request.curPage,
                    request.viewModel,
                    request.tableNode,
                    request.sectionBreakConfig,
                    request.availableHeight
                );
                if (pending == null) {
                    return false;
                }

                state.pendingSlicedTableBuild = pending;
                state.pendingParagraphCheckpoint = checkpoint;
                return true;
            };
        }

        let result: ReturnType<typeof dealWithSection>;
        try {
            result = dealWithSection(
                ctx,
                ctx.viewModel,
                sectionNode,
                curSkeletonPage,
                sectionBreakConfig,
                state.layoutAnchor,
                {
                    startParagraphIndex: state.paragraphIndex,
                    maxParagraphs: 1,
                }
            );
        } finally {
            ctx.deferSlicedTableLayout = undefined;
        }

        if (state.pendingSlicedTableBuild != null) {
            // The provisional paragraph result is discarded. The deferred table
            // calculation continues from the exact split point on later slices.
            return;
        }

        state.pendingTableBuild = null;

        const lastPage = getLastPage(ctx.skeleton.pages);
        if (result.pages[0] === lastPage) {
            result.pages.shift();
        }
        ctx.skeleton.pages.push(...result.pages);

        state.paragraphIndex = result.nextParagraphIndex;
        // The anchor only selects the first block of a resumed section. Keeping it
        // would reset dealWithSection to that same block on every later slice.
        state.layoutAnchor = null;
        const previouslyLaidOutThrough = state.laidOutThrough;
        state.laidOutThrough = Math.max(state.laidOutThrough, paragraphNode?.endIndex ?? -1);
        if (paragraphNode != null) {
            // Laying out the current block finalizes the previous block's collapsed
            // spacing. The current block remains an unstable continuation boundary
            // until its successor has been laid out.
            state.stableLaidOutThrough = Math.max(state.stableLaidOutThrough, previouslyLaidOutThrough);
            state.processedBlockCount++;
        }

        if (ctx.isDirty) {
            this._restartDirtyIncrementalLayout(state);
            return;
        }

        if (paragraphNode != null && this._tryReuseInteractionPageTail(state, paragraphNode)) {
            return;
        }

        if (result.complete) {
            const nextColumnProperties = state.sectionIndex + 1 < sections.length
                ? prepareSectionBreakConfig(ctx, state.sectionIndex + 1).columnProperties ?? []
                : [];
            if (
                sectionBreakConfig.sectionTypeNext === SectionType.CONTINUOUS &&
                (sectionBreakConfig.columnProperties?.length ?? 0) > 0 &&
                !hasSameColumnGeometry(sectionBreakConfig.columnProperties!, nextColumnProperties)
            ) {
                const completedPage = getLastPage(ctx.skeleton.pages);
                if (completedPage != null) {
                    balanceFinalContinuousColumnSection(completedPage);
                }
            }
            state.sectionIndex++;
            state.paragraphIndex = 0;
            state.sectionInitialized = false;
            state.sectionBreakConfig = null;
            state.layoutAnchor = null;
            state.pendingTableBuild = null;
            state.pendingSlicedTableBuild = null;
            state.pendingParagraphCheckpoint = null;
        }

        if (state.sectionIndex >= sections.length) {
            this._finishIncrementalLayout(state);
        }
    }

    private _resumeAfterSealedInteractionPage(state: IIncrementalLayoutState): void {
        const resume = state.interactionWindowResume;
        if (resume == null) {
            return;
        }
        state.interactionWindowResume = null;
        state.interactionWindowComplete = false;
        state.interactionPageComplete = false;

        const page = state.ctx.skeleton.pages[state.priorityPageIndex];
        const section = page?.sections[0];
        const column = section?.columns[0];
        if (page == null || section == null || column == null) {
            return;
        }
        const firstSuffixLine = column.lines.findIndex((line) => line.paragraphIndex > resume.anchorEnd);
        if (firstSuffixLine >= 0) {
            column.lines.splice(firstSuffixLine);
        }
        const anchorLine = column.lines.at(-1);
        if (anchorLine != null) {
            anchorLine.lineHeight = Math.max(0, anchorLine.lineHeight - anchorLine.marginBottom);
            anchorLine.marginBottom = 0;
        }
        column.ed = resume.anchorEnd;
        column.isFull = false;
        section.ed = resume.anchorEnd;
        page.ed = resume.anchorEnd;
        for (const anchors of state.ctx.skeletonResourceReference.drawingAnchor?.values() ?? []) {
            for (const paragraphIndex of anchors.keys()) {
                if (paragraphIndex > resume.anchorEnd && paragraphIndex <= resume.pageEnd) {
                    anchors.delete(paragraphIndex);
                }
            }
        }
        state.sectionIndex = resume.sectionIndex;
        state.paragraphIndex = resume.paragraphIndex;
        state.processedBlockCount = resume.processedBlockCount;
        state.laidOutThrough = resume.anchorEnd;
        state.stableLaidOutThrough = Math.min(state.stableLaidOutThrough, resume.anchorEnd);
    }

    private _captureIncrementalParagraphCheckpoint(
        ctx: ILayoutContext,
        currentPage: IDocumentSkeletonPage
    ): IIncrementalParagraphCheckpoint {
        const pageIndex = ctx.skeleton.pages.indexOf(currentPage);
        if (pageIndex < 0) {
            throw new Error('Cannot checkpoint a page outside the active document skeleton.');
        }

        return {
            pageIndex,
            page: clonePageFlowForPublish(currentPage),
            skeHeaders: new Map(
                [...ctx.skeleton.skeHeaders].map(([key, pages]) => [key, new Map(pages)])
            ),
            skeFooters: new Map(
                [...ctx.skeleton.skeFooters].map(([key, pages]) => [key, new Map(pages)])
            ),
            skeListLevel: new Map(
                [...ctx.skeletonResourceReference.skeListLevel!].map(([key, levels]) => [
                    key,
                    levels.map((level) => [...level]),
                ])
            ),
            drawingAnchor: new Map(
                [...ctx.skeletonResourceReference.drawingAnchor!].map(([key, anchors]) => [
                    key,
                    new Map([...anchors].map(([index, anchor]) => [
                        index,
                        { ...anchor, elements: [...anchor.elements] },
                    ])),
                ])
            ),
            layoutStartPointer: { ...ctx.layoutStartPointer },
            isDirty: ctx.isDirty,
            floatObjectsCache: new Map(
                [...ctx.floatObjectsCache].map(([key, value]) => [key, { ...value }])
            ),
            paragraphConfigCache: new Map(
                [...ctx.paragraphConfigCache].map(([key, configs]) => [
                    key,
                    new Map([...configs].map(([index, config]) => [index, { ...config }])),
                ])
            ),
            sectionBreakConfigCache: new Map(ctx.sectionBreakConfigCache),
            paragraphsOpenNewPage: new Set(ctx.paragraphsOpenNewPage),
            paginationMetrics: ctx.paginationMetrics == null ? undefined : { ...ctx.paginationMetrics },
        };
    }

    private _restoreIncrementalParagraphCheckpoint(
        ctx: ILayoutContext,
        checkpoint: IIncrementalParagraphCheckpoint
    ): void {
        const replaceMap = <K, V>(target: Map<K, V>, source: Map<K, V>) => {
            target.clear();
            for (const [key, value] of source) {
                target.set(key, value);
            }
        };

        ctx.skeleton.pages.splice(
            checkpoint.pageIndex,
            ctx.skeleton.pages.length - checkpoint.pageIndex,
            checkpoint.page
        );
        checkpoint.page.parent = ctx.skeleton;
        replaceMap(ctx.skeleton.skeHeaders, checkpoint.skeHeaders);
        replaceMap(ctx.skeleton.skeFooters, checkpoint.skeFooters);
        replaceMap(ctx.skeletonResourceReference.skeListLevel!, checkpoint.skeListLevel);
        replaceMap(ctx.skeletonResourceReference.drawingAnchor!, checkpoint.drawingAnchor);

        for (const key of Object.keys(ctx.layoutStartPointer)) {
            delete ctx.layoutStartPointer[key];
        }
        Object.assign(ctx.layoutStartPointer, checkpoint.layoutStartPointer);
        ctx.isDirty = checkpoint.isDirty;
        replaceMap(ctx.floatObjectsCache, checkpoint.floatObjectsCache);
        replaceMap(ctx.paragraphConfigCache, checkpoint.paragraphConfigCache);
        replaceMap(ctx.sectionBreakConfigCache, checkpoint.sectionBreakConfigCache);
        ctx.paragraphsOpenNewPage.clear();
        for (const paragraphIndex of checkpoint.paragraphsOpenNewPage) {
            ctx.paragraphsOpenNewPage.add(paragraphIndex);
        }
        ctx.paginationMetrics = checkpoint.paginationMetrics == null
            ? undefined
            : { ...checkpoint.paginationMetrics };
    }

    private _initializeIncrementalSection(
        state: IIncrementalLayoutState,
        sectionNode: ReturnType<DocumentViewModel['getChildren']>[number]
    ): void {
        const { ctx } = state;
        const { skeleton, skeletonResourceReference, viewModel } = ctx;
        const allSkeletonPages = skeleton.pages;
        const sectionBreakConfig = prepareSectionBreakConfig(ctx, state.sectionIndex);
        const {
            sectionType,
            columnProperties,
            columnSeparatorType,
            pageNumberStart = 1,
            evenAndOddHeaders,
        } = sectionBreakConfig;
        const explicitPageNumberStart = viewModel.getSectionBreak(sectionNode.endIndex)?.pageNumberStart;
        const layoutAnchor = state.layoutAnchor;
        // Modern documents have one logical flow. Imported legacy section
        // metadata must append to that flow instead of creating physical page
        // fragments. Keep the anchored first section on its established restore
        // path; after the anchor is consumed, subsequent sections are continuous.
        const effectiveSectionType = state.mode === 'continuous' && layoutAnchor == null
            ? SectionType.CONTINUOUS
            : getEffectiveSectionType(sectionType);

        let curSkeletonPage = getLastPage(allSkeletonPages);
        let reuseNextColumn = false;

        ctx.sectionBreakConfigCache.set(sectionNode.endIndex, sectionBreakConfig);

        if (
            effectiveSectionType === SectionType.NEXT_COLUMN &&
            layoutAnchor == null &&
            curSkeletonPage != null &&
            hasCompatiblePageGeometry(curSkeletonPage, sectionBreakConfig)
        ) {
            updateBlockIndex(allSkeletonPages, -1, ctx.docsConfig.documentCompatibilityPolicy);
            reuseNextColumn = this._addNewSectionByNextColumn(
                curSkeletonPage,
                columnProperties!,
                columnSeparatorType!
            );
        }

        const hasCompatibleContinuousPage =
            effectiveSectionType === SectionType.CONTINUOUS &&
            curSkeletonPage != null &&
            hasCompatiblePhysicalPage(curSkeletonPage, sectionBreakConfig);
        if (hasCompatibleContinuousPage) {
            updateBlockIndex(allSkeletonPages, -1, ctx.docsConfig.documentCompatibilityPolicy);
        }

        if (
            hasCompatibleContinuousPage &&
            curSkeletonPage != null &&
            (layoutAnchor != null || hasAvailableContinuousSectionSpace(curSkeletonPage))
        ) {
            if (layoutAnchor != null) {
                this._restoreContinuousSection(curSkeletonPage, columnProperties!, columnSeparatorType!);
            } else {
                this._addNewSectionByContinuous(curSkeletonPage, columnProperties!, columnSeparatorType!);
            }
        } else if (!reuseNextColumn && (layoutAnchor == null || curSkeletonPage == null)) {
            const reuseExplicitPageBreak =
                effectiveSectionType === SectionType.NEXT_PAGE &&
                curSkeletonPage?.breakType === BreakType.PAGE &&
                hasOnlyExplicitPageBoundaryMarkers(curSkeletonPage);
            const previousSkeletonPage = allSkeletonPages.at(-2);
            const reuseOverflowedSectionBoundary =
                effectiveSectionType === SectionType.NEXT_PAGE &&
                curSkeletonPage?.breakType === BreakType.SECTION &&
                previousSkeletonPage?.sectionId === curSkeletonPage.sectionId &&
                hasOnlyExplicitPageBoundaryMarkers(curSkeletonPage);
            const reuseBoundaryPage = reuseExplicitPageBreak || reuseOverflowedSectionBoundary;
            let nextPageNumber = reuseBoundaryPage
                ? explicitPageNumberStart ?? curSkeletonPage.pageNumber
                : curSkeletonPage == null
                    ? pageNumberStart
                    : explicitPageNumberStart ?? curSkeletonPage.pageNumber + 1;
            if (reuseBoundaryPage) {
                allSkeletonPages.pop();
            }
            if (
                curSkeletonPage != null &&
                effectiveSectionType === SectionType.NEXT_PAGE &&
                explicitPageNumberStart != null &&
                evenAndOddHeaders === BooleanNumber.TRUE &&
                (allSkeletonPages.length + 1) % 2 !== explicitPageNumberStart % 2
            ) {
                allSkeletonPages.push(createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    skeletonResourceReference,
                    curSkeletonPage.pageNumber + 1
                ));
            }
            if (
                curSkeletonPage != null &&
                (effectiveSectionType === SectionType.EVEN_PAGE || effectiveSectionType === SectionType.ODD_PAGE) &&
                !isTargetPageParity(nextPageNumber, effectiveSectionType)
            ) {
                const fillerPage = createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    skeletonResourceReference,
                    nextPageNumber
                );
                allSkeletonPages.push(fillerPage);
                nextPageNumber++;
            }
            curSkeletonPage = createSkeletonPage(
                ctx,
                sectionBreakConfig,
                skeletonResourceReference,
                nextPageNumber
            );
            allSkeletonPages.push(curSkeletonPage);
        }

        state.sectionBreakConfig = sectionBreakConfig;
        state.sectionInitialized = true;

        if (layoutAnchor != null) {
            state.paragraphIndex = 0;
            for (let index = 0; index < sectionNode.children.length; index++) {
                if (sectionNode.children[index].endIndex === layoutAnchor) {
                    state.paragraphIndex = index;
                    break;
                }
            }
        }
    }

    private _restartDirtyIncrementalLayout(state: IIncrementalLayoutState): void {
        const { ctx } = state;
        const layoutAnchor = ctx.layoutStartPointer[''];

        // Match the established full-layout retry bound, but keep every retry on the
        // incremental scheduler. A wrapped floating object can invalidate lines that
        // precede its anchor; completing that retry synchronously would reintroduce the
        // exact long main-thread task that incremental pagination is meant to remove.
        if (layoutAnchor == null || state.dirtyRetryCount >= 10) {
            resetContext(ctx);
            this._finishIncrementalLayout(state);
            return;
        }

        state.dirtyRetryCount++;
        resetContext(ctx);
        ctx.layoutStartPointer[''] = null;

        const sections = ctx.viewModel.getChildren();
        let sectionIndex = sections.findIndex(({ startIndex, endIndex }) =>
            layoutAnchor >= startIndex && layoutAnchor <= endIndex
        );
        if (sectionIndex < 0) {
            sectionIndex = 0;
        }
        const section = sections[sectionIndex];
        const paragraphIndex = Math.max(
            0,
            section?.children.findIndex(({ endIndex }) => endIndex === layoutAnchor) ?? 0
        );
        const processedBeforeSection = sections
            .slice(0, sectionIndex)
            .reduce((count, item) => count + item.children.length, 0);

        // dealWithSection has already rolled the active skeleton back to this
        // paragraph. Resume from that checkpoint in a later scheduler slice.
        state.sectionIndex = sectionIndex;
        state.paragraphIndex = paragraphIndex;
        state.sectionInitialized = false;
        state.sectionBreakConfig = null;
        state.layoutAnchor = layoutAnchor;
        state.laidOutThrough = layoutAnchor - 1;
        state.stableLaidOutThrough = -1;
        state.processedBlockCount = processedBeforeSection + paragraphIndex;
        state.pendingTableBuild = null;
        state.pendingSlicedTableBuild = null;
        state.pendingParagraphCheckpoint = null;
        state.complete = false;
        state.reusedTail = false;
        state.tailConvergencePageCount = ctx.skeleton.pages.length;
        state.interactionPageTail = null;
        state.interactionPageComplete = false;
        state.interactionWindowComplete = false;
        state.interactionWindowResume = null;

        const dirtyPageIndex = this._findBodyPageIndex(ctx.skeleton.pages, layoutAnchor);
        const stablePrefixCount = Math.max(0, dirtyPageIndex);
        state.stablePageCount = Math.min(state.stablePageCount, stablePrefixCount);
        state.finalizedPageCount = Math.min(state.finalizedPageCount, stablePrefixCount);
        state.lastPublishedPageCount = Math.min(state.lastPublishedPageCount, stablePrefixCount);
        state.lastPublishedBlockCount = Math.min(state.lastPublishedBlockCount, state.processedBlockCount);
        if (state.priorityPageIndex >= stablePrefixCount) {
            state.anchorPublished = false;
        }
    }

    private _finishIncrementalLayout(state: IIncrementalLayoutState): void {
        const { ctx } = state;
        const { skeleton } = ctx;
        if (state.mode === 'continuous') {
            const fragmentGeometry = skeleton.pages.map(clonePageFlowForPublish);
            updateBlockIndex(fragmentGeometry, -1, ctx.docsConfig.documentCompatibilityPolicy);
            fragmentGeometry.forEach((geometry, index) => {
                const page = skeleton.pages[index];
                if (page != null) {
                    page.height = geometry.height;
                    page.width = geometry.width;
                }
            });
        }
        removeDupPages(ctx);
        mergeContinuousDuplicatePages(skeleton.pages, state.mode === 'continuous');
        if (state.mode === 'continuous') {
            updateBlockIndex(skeleton.pages, -1, ctx.docsConfig.documentCompatibilityPolicy);
            updateInlineDrawingCoordsAndBorder(ctx, skeleton.pages);
        }
        for (const hSkeMap of skeleton.skeHeaders.values()) {
            for (const page of hSkeMap.values()) {
                updateInlineDrawingCoordsAndBorder(ctx, [page]);
            }
        }
        for (const fSkeMap of skeleton.skeFooters.values()) {
            for (const page of fSkeMap.values()) {
                updateInlineDrawingCoordsAndBorder(ctx, [page]);
            }
        }
        setPageParent(skeleton.pages, skeleton);
        state.complete = true;
        state.stableLaidOutThrough = state.laidOutThrough;
        this._iteratorCount = 0;
    }

    private _prepareLayoutContext(): ILayoutContext {
        const viewModel = this.getViewModel();
        const dataModel = viewModel.getDataModel();
        const { headerTreeMap, footerTreeMap } = viewModel.getHeaderFooterTreeMap();
        const { documentStyle, drawings, lists: customLists = {} } = dataModel;
        const lists = {
            ...PRESET_LIST_TYPE,
            ...customLists,
        };
        const {
            paragraphLineGapDefault = 0,
            defaultTabStop = 10.5,
            textStyle = {},
            adjustLineHeightInTable = BooleanNumber.FALSE,
        } = documentStyle;

        const docsConfig: IDocsConfig = {
            headerTreeMap,
            footerTreeMap,
            lists,
            drawings,

            localeService: this._localeService,
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(documentStyle.documentFlavor),
            paragraphLineGapDefault,
            defaultTabStop,
            documentTextStyle: textStyle,
            adjustLineHeightInTable,
        };

        const skeleton = getNullSkeleton();

        const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeleton;

        const skeletonResourceReference: ISkeletonResourceReference = {
            skeHeaders,
            skeFooters,
            skeListLevel,
            drawingAnchor,
        };

        return {
            viewModel,
            dataModel,
            skeleton,
            skeletonResourceReference,
            docsConfig,
            layoutStartPointer: {
                '': null, // '' is the main document.
            },
            isDirty: false,
            floatObjectsCache: new Map(),
            paragraphConfigCache: new Map(),
            sectionBreakConfigCache: new Map(),
            paragraphsOpenNewPage: new Set(),
            paginationMetrics: {
                constrainedParagraphs: 0,
                noConstraintParagraphs: 0,
                measuredLineCount: 0,
                retryCount: 0,
                movedLineCount: 0,
                keepNextScanCount: 0,
                peakCheckpointLineCount: 0,
            },
            hyphen: this._hyphen,
            languageDetector: this._languageDetector,
        };
    }

    /**
     * \v COLUMN_BREAK
     * \f PAGE_BREAK
     * \0 DOCS_END
     * \t TAB
     *
     * Needs to be changed：
     * \r PARAGRAPH
     * \n SECTION_BREAK
     *
     * \b customBlock: Scenarios where customBlock, images, mentions, etc. do not participate in the document flow.
     *
     * Table
     * \x1A table start
     * \x1B table row start
     * \x1C table cell start
     * \x1D table cell end
     * \x1E table row end
     * \x1F table end
     *
     * Special ranges within the document flow:：hyperlinks，field，structured document tags， bookmark，comment
     * \x1F customRange start
     * \x1E customRange end
     *
     * Split the document according to SectionBreak and perform layout calculations.
     * @returns view model: skeleton
     */

    private _createSkeleton(ctx: ILayoutContext, _bounds?: IViewportInfo): IDocumentSkeletonCached {
        // console.log('createSkeleton: iterate ', this._iteratorCount, 'times');
        const { viewModel, skeleton, skeletonResourceReference } = ctx;

        const allSkeletonPages = skeleton.pages;

        let startSectionIndex = 0;

        const layoutAnchor = ctx.layoutStartPointer[''];

        // Reset layoutStartPointer.
        ctx.layoutStartPointer[''] = null;

        if (layoutAnchor != null) {
            for (let sectionIndex = 0; sectionIndex < viewModel.getChildren().length; sectionIndex++) {
                const sectionNode = viewModel.getChildren()[sectionIndex];
                const { endIndex, startIndex } = sectionNode;
                if (layoutAnchor >= startIndex && layoutAnchor <= endIndex) {
                    startSectionIndex = sectionIndex;
                    break;
                }
            }
        }

        // Loop the sections with the start section index.
        for (let i = startSectionIndex, len = viewModel.getChildren().length; i < len; i++) {
            const sectionNode = viewModel.getChildren()[i];
            const sectionLayoutAnchor = i === startSectionIndex ? layoutAnchor : null;
            const sectionBreakConfig = prepareSectionBreakConfig(ctx, i);
            const { sectionType, columnProperties, columnSeparatorType, sectionTypeNext, pageNumberStart = 1, evenAndOddHeaders } = sectionBreakConfig;
            const explicitPageNumberStart = viewModel.getSectionBreak(sectionNode.endIndex)?.pageNumberStart;
            const effectiveSectionType = getEffectiveSectionType(sectionType);

            let curSkeletonPage = getLastPage(allSkeletonPages);
            let reuseCurrentPage = false;
            let reuseNextColumn = false;

            ctx.sectionBreakConfigCache.set(sectionNode.endIndex, sectionBreakConfig);

            if (
                effectiveSectionType === SectionType.NEXT_COLUMN &&
                sectionLayoutAnchor == null &&
                curSkeletonPage != null &&
                hasCompatiblePageGeometry(curSkeletonPage, sectionBreakConfig)
            ) {
                updateBlockIndex(allSkeletonPages, -1, ctx.docsConfig.documentCompatibilityPolicy);
                reuseNextColumn = this._addNewSectionByNextColumn(
                    curSkeletonPage,
                    columnProperties!,
                    columnSeparatorType!
                );
            }

            const hasCompatibleContinuousPage =
                effectiveSectionType === SectionType.CONTINUOUS &&
                curSkeletonPage != null &&
                hasCompatiblePhysicalPage(curSkeletonPage, sectionBreakConfig);
            if (hasCompatibleContinuousPage) {
                updateBlockIndex(allSkeletonPages, -1, ctx.docsConfig.documentCompatibilityPolicy);
            }

            if (
                hasCompatibleContinuousPage &&
                curSkeletonPage != null &&
                (sectionLayoutAnchor != null || hasAvailableContinuousSectionSpace(curSkeletonPage))
            ) {
                if (sectionLayoutAnchor != null) {
                    this._restoreContinuousSection(curSkeletonPage, columnProperties!, columnSeparatorType!);
                } else {
                    this._addNewSectionByContinuous(curSkeletonPage, columnProperties!, columnSeparatorType!);
                }
                reuseCurrentPage = true;
            } else if (reuseNextColumn) {
                reuseCurrentPage = true;
            } else if (sectionLayoutAnchor == null || curSkeletonPage == null) {
                const reuseExplicitPageBreak =
                    effectiveSectionType === SectionType.NEXT_PAGE &&
                    curSkeletonPage?.breakType === BreakType.PAGE &&
                    hasOnlyExplicitPageBoundaryMarkers(curSkeletonPage);
                const previousSkeletonPage = allSkeletonPages.at(-2);
                const reuseOverflowedSectionBoundary =
                    effectiveSectionType === SectionType.NEXT_PAGE &&
                    curSkeletonPage?.breakType === BreakType.SECTION &&
                    previousSkeletonPage?.sectionId === curSkeletonPage.sectionId &&
                    hasOnlyExplicitPageBoundaryMarkers(curSkeletonPage);
                const reuseBoundaryPage = reuseExplicitPageBreak || reuseOverflowedSectionBoundary;
                let nextPageNumber = reuseBoundaryPage
                    ? explicitPageNumberStart ?? curSkeletonPage.pageNumber
                    : curSkeletonPage == null
                        ? pageNumberStart
                        : explicitPageNumberStart ?? curSkeletonPage.pageNumber + 1;
                if (reuseBoundaryPage) {
                    allSkeletonPages.pop();
                }
                if (
                    curSkeletonPage != null &&
                    effectiveSectionType === SectionType.NEXT_PAGE &&
                    explicitPageNumberStart != null &&
                    evenAndOddHeaders === 1 &&
                    (allSkeletonPages.length + 1) % 2 !== explicitPageNumberStart % 2
                ) {
                    allSkeletonPages.push(createSkeletonPage(
                        ctx,
                        sectionBreakConfig,
                        skeletonResourceReference,
                        curSkeletonPage.pageNumber + 1
                    ));
                }
                if (
                    curSkeletonPage != null &&
                    (effectiveSectionType === SectionType.EVEN_PAGE || effectiveSectionType === SectionType.ODD_PAGE) &&
                    !isTargetPageParity(nextPageNumber, effectiveSectionType)
                ) {
                    const fillerPage = createSkeletonPage(
                        ctx,
                        sectionBreakConfig,
                        skeletonResourceReference,
                        nextPageNumber
                    );
                    allSkeletonPages.push(fillerPage);
                    nextPageNumber++;
                }
                curSkeletonPage = createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    skeletonResourceReference,
                    nextPageNumber
                );
            }

            // Calculate page layout, block structure
            const { pages } = dealWithSection(
                ctx,
                viewModel,
                sectionNode,
                curSkeletonPage,
                sectionBreakConfig,
                sectionLayoutAnchor
            );

            const nextColumnProperties = i + 1 < len
                ? prepareSectionBreakConfig(ctx, i + 1).columnProperties ?? []
                : [];
            if (
                sectionTypeNext === SectionType.CONTINUOUS &&
                columnProperties!.length > 0 &&
                !hasSameColumnGeometry(columnProperties!, nextColumnProperties)
            ) {
                balanceFinalContinuousColumnSection(pages.at(-1) ?? curSkeletonPage);
            }

            if (reuseCurrentPage) {
                const reusedFirstPage = pages.shift();
                if (reusedFirstPage && allSkeletonPages.length > 0) {
                    allSkeletonPages[allSkeletonPages.length - 1] = reusedFirstPage;
                }
            }

            allSkeletonPages.push(...pages);

            // The page needs to be reflowed due to floating objects.
            if (ctx.isDirty) {
                break;
            }
        }

        // TODO: 10 is too small?
        if (ctx.isDirty && this._iteratorCount < 10) {
            this._iteratorCount++;
            resetContext(ctx);
            return this._createSkeleton(ctx, _bounds);
        } else {
            // Calculate page and section position information
            this._iteratorCount = 0;
            removeDupPages(ctx);
            updateBlockIndex(skeleton.pages, -1, ctx.docsConfig.documentCompatibilityPolicy);
            mergeContinuousDuplicatePages(
                skeleton.pages,
                ctx.dataModel.documentStyle.documentFlavor === DocumentFlavor.MODERN
            );
            // Calculate inline drawing position and update.
            updateInlineDrawingCoordsAndBorder(ctx, skeleton.pages);
            for (const hSkeMap of skeleton.skeHeaders.values()) {
                for (const page of hSkeMap.values()) {
                    updateInlineDrawingCoordsAndBorder(ctx, [page]);
                }
            }
            for (const fSkeMap of skeleton.skeFooters.values()) {
                for (const page of fSkeMap.values()) {
                    updateInlineDrawingCoordsAndBorder(ctx, [page]);
                }
            }
            setPageParent(skeleton.pages, skeleton);

            return skeleton;
        }
    }

    // A page with multiple sections only occurs in SectionType.CONTINUOUS
    private _addNewSectionByContinuous(
        curSkeletonPage: IDocumentSkeletonPage,
        columnProperties: ISectionColumnProperties[],
        columnSeparatorType: ColumnSeparatorType
    ) {
        const sections = curSkeletonPage.sections;
        const lastSection = sections[sections.length - 1];
        const {
            pageWidth,
            pageHeight,
            marginTop: curPageMT,
            marginBottom: curPageMB,
            marginLeft: curPageML,
            marginRight: curPageMR,
        } = curSkeletonPage;
        const pageContentWidth = pageWidth - curPageML - curPageMR;
        const pageContentHeight = pageHeight - curPageMT - curPageMB;
        const lastSectionBottom = (lastSection?.top || 0) + (lastSection?.height || 0);
        const newSection = createSkeletonSection(
            columnProperties,
            columnSeparatorType,
            lastSectionBottom,
            0,
            pageContentWidth,
            pageContentHeight - lastSectionBottom
        );
        newSection.parent = curSkeletonPage;
        sections.push(newSection);
    }

    private _addNewSectionByNextColumn(
        curSkeletonPage: IDocumentSkeletonPage,
        columnProperties: ISectionColumnProperties[],
        columnSeparatorType: ColumnSeparatorType
    ): boolean {
        const currentColumn = getLastNotFullColumnInfo(curSkeletonPage);
        const nextColumnIndex = currentColumn == null ? 0 : currentColumn.index + 1;
        const columnCount = columnProperties.length || 1;
        if (nextColumnIndex >= columnCount) {
            return false;
        }

        const {
            pageWidth,
            pageHeight,
            marginTop,
            marginBottom,
            marginLeft,
            marginRight,
        } = curSkeletonPage;
        const sectionTop = curSkeletonPage.sections[curSkeletonPage.sections.length - 1]?.top ?? 0;
        const newSection = createSkeletonSection(
            columnProperties,
            columnSeparatorType,
            sectionTop,
            0,
            pageWidth - marginLeft - marginRight,
            pageHeight - marginTop - marginBottom - sectionTop
        );
        newSection.columns.slice(0, nextColumnIndex).forEach((column) => {
            column.isFull = true;
        });
        newSection.parent = curSkeletonPage;
        curSkeletonPage.sections.push(newSection);
        return true;
    }

    private _restoreContinuousSection(
        curSkeletonPage: IDocumentSkeletonPage,
        columnProperties: ISectionColumnProperties[],
        columnSeparatorType: ColumnSeparatorType
    ) {
        const section = curSkeletonPage.sections[curSkeletonPage.sections.length - 1];
        if (section == null) {
            return;
        }

        const pageContentWidth = curSkeletonPage.pageWidth - curSkeletonPage.marginLeft - curSkeletonPage.marginRight;
        const pageContentHeight = curSkeletonPage.pageHeight - curSkeletonPage.marginTop - curSkeletonPage.marginBottom;
        const restoredSection = createSkeletonSection(
            columnProperties,
            columnSeparatorType,
            section.top,
            0,
            pageContentWidth,
            pageContentHeight - section.top
        );

        for (const column of restoredSection.columns.slice(section.columns.length)) {
            column.parent = section;
            section.columns.push(column);
        }
        section.colCount = restoredSection.colCount;
        section.height = restoredSection.height;
    }

    private _findNodeByIndex(charIndex: number, segmentId = '', segmentPageIndex = -1) {
        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages, skeFooters, skeHeaders } = skeletonData;

        for (const page of pages) {
            const curPageIndex = pages.indexOf(page);
            if (segmentId && curPageIndex !== segmentPageIndex) {
                continue;
            }

            const { pageWidth } = page;
            let segmentPage = page;

            if (segmentId) {
                const maybeHeaderSke = skeHeaders.get(segmentId)?.get(pageWidth);
                const maybeFooterSke = skeFooters.get(segmentId)?.get(pageWidth);
                if (maybeHeaderSke) {
                    segmentPage = maybeHeaderSke;
                } else if (maybeFooterSke) {
                    segmentPage = maybeFooterSke;
                } else {
                    continue;
                }
                segmentPage = resolveMostSpecificPageByCharIndex(segmentPage, charIndex);
            } else {
                segmentPage = resolveMostSpecificPageByCharIndex(page, charIndex);
            }

            const { sections, st, ed } = segmentPage;
            const segmentPageParent = segmentPage.parent as { page?: IDocumentSkeletonPage; parent?: { columnGroupId?: string } } | undefined;
            const isColumnSegmentPage = segmentId === '' &&
                segmentPageParent?.page === segmentPage &&
                segmentPageParent.parent?.columnGroupId;

            if (charIndex < st || charIndex > ed) {
                if (isColumnSegmentPage) {
                    const boundary = getBoundaryGlyphInPage(segmentPage, charIndex >= ed);

                    if (boundary) {
                        return {
                            page: segmentPage,
                            pageType: segmentPage.type,
                            segmentPageIndex,
                            ...boundary,
                        };
                    }
                }

                continue;
            }

            for (const section of sections) {
                const { columns, st, ed } = section;

                if (charIndex < st || charIndex > ed) {
                    continue;
                }

                for (const column of columns) {
                    const { lines, st, ed } = column;

                    if (charIndex < st || charIndex > ed) {
                        continue;
                    }

                    for (const line of lines) {
                        const { divides, st, ed } = line;
                        const divideLength = divides.length;

                        if (charIndex < st || charIndex > ed) {
                            continue;
                        }

                        for (let i = 0; i < divideLength; i++) {
                            const divide = divides[i];
                            const { glyphGroup, st, ed } = divide;

                            if (charIndex < st || charIndex > ed) {
                                continue;
                            }

                            // Some glyph.content's length maybe great than 1, so the charIndex is not equal to glyphIndex.
                            let delta = charIndex - st;

                            for (const glyph of glyphGroup) {
                                delta -= glyph.count;

                                if (delta < 0) {
                                    return {
                                        page: segmentPage,
                                        pageType: segmentPage.type,
                                        section,
                                        column,
                                        line,
                                        divide,
                                        glyph,
                                        segmentPageIndex,
                                    };
                                }
                            }
                        }
                    }
                }
            }

            if (isColumnSegmentPage) {
                const boundary = getBoundaryGlyphInPage(segmentPage, charIndex >= segmentPage.ed);

                if (boundary) {
                    return {
                        page: segmentPage,
                        pageType: segmentPage.type,
                        segmentPageIndex,
                        ...boundary,
                    };
                }
            }
        }
    }
}
