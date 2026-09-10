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
    IBullet,
    IDocDrawingBase,
    IDocStyles,
    IDocumentBody,
    IDocumentStyle,
    IDrawings,
    ILists,
    IParagraph,
    IParagraphStyle,
    Nullable,
} from '@univerjs/core';
import type {
    IDocumentSkeletonBullet,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonPage,
    IDocumentSkeletonTable,
    IParagraphList,
} from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../../basics/interfaces';
import type { IDocumentCompatibilityPolicy } from '../../../document-compatibility';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { ILayoutContext } from '../../tools';
import type { IShapedText } from './shaping';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
    DocumentBlockRangeType,
    DocxBreakType,
    PositionedObjectLayoutType,
    resolveDocumentParagraphStyle,
} from '@univerjs/core';
import { BreakType, DocumentSkeletonPageType, GlyphType } from '../../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy, isTraditionalDocumentCompatibility } from '../../../document-compatibility';
import { BreakPointType } from '../../line-breaker/break';
import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import { getLastNotFullColumnInfo, getLastSection, getNumberUnitValue, hasSameParagraphBorderSet, isBlankColumn } from '../../tools';
import { dealWithBullet } from './bullet';
import { isNonFlowFloatingAnchor, layoutParagraph } from './layout-ruler';

const BLOCK_LAYOUT_OUTER_SPACING_MAP = new Map([
    [DocumentBlockRangeType.CALLOUT, 34],
    [DocumentBlockRangeType.CODE, 32],
    [DocumentBlockRangeType.QUOTE, 24],
]);
const MAX_KEEP_NEXT_LOOKAHEAD = 32;

function _endsWithToken(text: string, glyphs: IDocumentSkeletonGlyph[], token: DataStreamTreeTokenType): boolean {
    return text.endsWith(token) || glyphs[glyphs.length - 1]?.raw === token || glyphs[glyphs.length - 1]?.streamType === token;
}

function _isRenderedPageBreak(viewModel: DocumentViewModel, absoluteIndex: number): boolean {
    return viewModel.getBody?.()?.renderedPageBreaks?.includes(absoluteIndex) === true;
}

function _isInsideFlowTable(viewModel: DocumentViewModel, absoluteIndex: number): boolean {
    return viewModel.getBody?.()?.tables?.some(
        (table) => table.startIndex <= absoluteIndex && absoluteIndex < table.endIndex
    ) === true;
}

function _isMarkedColumnBreak(viewModel: DocumentViewModel, absoluteIndex: number): boolean {
    const customRange = viewModel.getCustomRange(absoluteIndex);

    return customRange?.properties?.breakType === DocxBreakType.COLUMN;
}

function _glyphCount(glyphs: IDocumentSkeletonGlyph[]): number {
    return glyphs.reduce((count, glyph) => count + glyph.count, 0);
}

function _isDocxColumnBreakVisuallyBlankColumn(column: IDocumentSkeletonColumn): boolean {
    return column.lines.every((line) =>
        line.divides.every((divide) =>
            divide.glyphGroup.every((glyph) => {
                const { glyphType, raw, streamType, width } = glyph;
                const isParagraphMark =
                    raw === DataStreamTreeTokenType.PARAGRAPH ||
                    streamType === DataStreamTreeTokenType.PARAGRAPH;
                const isColumnBreak =
                    width === 0 &&
                    (raw === DataStreamTreeTokenType.COLUMN_BREAK ||
                        streamType === DataStreamTreeTokenType.COLUMN_BREAK);

                return glyphType === GlyphType.TAB || glyphType === GlyphType.LIST || isParagraphMark || isColumnBreak;
            })
        )
    );
}

function _hasOnlyCustomBlockGlyphs(glyphs: IDocumentSkeletonGlyph[]): boolean {
    return glyphs.length > 0 && glyphs.every((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK);
}

function _mergeAdjacentCustomBlockShapedTexts(
    shapedTextList: IShapedText[],
    customBlockDrawings: Map<string, IDocumentSkeletonDrawing>
): IShapedText[] {
    const mergedShapedTextList: IShapedText[] = [];

    for (const originShapedText of shapedTextList) {
        const splitShapedTexts = _splitTopBottomCustomBlockShapedText(originShapedText, customBlockDrawings);

        for (const shapedText of splitShapedTexts) {
            const lastShapedText = mergedShapedTextList[mergedShapedTextList.length - 1];

            if (
                lastShapedText &&
                _hasOnlyCustomBlockGlyphs(lastShapedText.glyphs) &&
                _hasOnlyCustomBlockGlyphs(shapedText.glyphs) &&
                !_hasTopBottomCustomBlockGlyph(lastShapedText.glyphs, customBlockDrawings) &&
                !_hasTopBottomCustomBlockGlyph(shapedText.glyphs, customBlockDrawings)
            ) {
                lastShapedText.text += shapedText.text;
                lastShapedText.glyphs.push(...shapedText.glyphs);
                lastShapedText.breakPointType = shapedText.breakPointType;
                continue;
            }

            mergedShapedTextList.push({
                ...shapedText,
                glyphs: [...shapedText.glyphs],
            });
        }
    }

    return mergedShapedTextList;
}

function _splitTopBottomCustomBlockShapedText(
    shapedText: IShapedText,
    customBlockDrawings: Map<string, IDocumentSkeletonDrawing>
): IShapedText[] {
    const splitShapedTexts: IShapedText[] = [];
    let pendingGlyphs: IDocumentSkeletonGlyph[] = [];
    let pendingText = '';
    let textOffset = 0;

    const flushPending = () => {
        if (pendingGlyphs.length === 0) {
            return;
        }

        splitShapedTexts.push({
            ...shapedText,
            text: pendingText,
            glyphs: pendingGlyphs,
        });
        pendingGlyphs = [];
        pendingText = '';
    };

    for (const glyph of shapedText.glyphs) {
        const glyphText = shapedText.text.slice(textOffset, textOffset + glyph.count);
        textOffset += glyph.count;

        if (_isTopBottomCustomBlockGlyph(glyph, customBlockDrawings)) {
            flushPending();
            splitShapedTexts.push({
                ...shapedText,
                text: glyphText,
                glyphs: [glyph],
            });
            continue;
        }

        pendingGlyphs.push(glyph);
        pendingText += glyphText;
    }

    flushPending();
    return splitShapedTexts.length > 0 ? splitShapedTexts : [shapedText];
}

function _hasTopBottomCustomBlockGlyph(
    glyphs: IDocumentSkeletonGlyph[],
    customBlockDrawings: Map<string, IDocumentSkeletonDrawing>
): boolean {
    return glyphs.some((glyph) => _isTopBottomCustomBlockGlyph(glyph, customBlockDrawings));
}

function _isTopBottomCustomBlockGlyph(
    glyph: IDocumentSkeletonGlyph,
    customBlockDrawings: Map<string, IDocumentSkeletonDrawing>
): boolean {
    if (glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK || glyph.drawingId == null) {
        return false;
    }

    return customBlockDrawings.get(glyph.drawingId)?.drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM;
}

function _getListLevelAncestors(
    bullet?: IBullet,
    listLevel?: Map<string, IParagraphList[][]>
): Array<Nullable<IDocumentSkeletonBullet>> | undefined {
    if (!bullet || !listLevel) {
        return;
    }

    const { listId, nestingLevel } = bullet;

    const sameList = listLevel?.get(listId);

    let level = nestingLevel;

    if (level < 0) {
        level = 0;
    }

    const listLevelAncestors: Array<Nullable<IDocumentSkeletonBullet>> = [];

    for (let i = level; i >= 0; i--) {
        if (Array.isArray(sameList?.[i])) {
            const len = sameList[i].length;

            listLevelAncestors[i] = sameList[i][len - 1]?.bullet ?? null;
        } else {
            listLevelAncestors[i] = null;
        }
    }

    return listLevelAncestors;
}

function _updateListLevelAncestors(
    paragraph: IParagraph,
    bullet?: IBullet,
    bulletSkeleton?: IDocumentSkeletonBullet,
    listLevel?: Map<string, IParagraphList[][]>,
    lists?: ILists
) {
    if (!bullet || !bulletSkeleton) {
        return;
    }

    const { listId, nestingLevel } = bullet;

    const cacheItem: IParagraphList[][] = [...(listLevel?.get(listId) || [])];

    const nestingLevels = lists?.[bullet.listType]?.nestingLevel;
    for (let level = 0; level < nestingLevel; level++) {
        if (cacheItem[level]?.length || nestingLevels?.[level] == null) {
            continue;
        }

        cacheItem[level] = [{
            bullet: {
                ...bulletSkeleton,
                startIndexItem: 2,
                startNumber: nestingLevels[level].startNumber,
            },
            paragraph,
        }];
    }

    // [[nestingLevel, bulletSkeleton]];

    while (cacheItem.length <= nestingLevel) {
        cacheItem.push([]);
    }
    cacheItem[nestingLevel].push({
        bullet: bulletSkeleton,
        paragraph,
    });

    cacheItem.splice(nestingLevel + 1); // Document renders from top to bottom, if a level is updated, the startIndex of data below it needs to be reset

    listLevel?.set(listId, cacheItem);
}

function _withMinSpacing(style: IParagraphStyle, key: 'spaceAbove' | 'spaceBelow', value: number) {
    const current = style[key];
    const nextValue = Math.max(current?.v ?? 0, value);

    style[key] = {
        ...current,
        v: nextValue,
    };
}

function _getNextAdjacentBlockRange(blockRanges: IDocumentBody['blockRanges'], blockRange: NonNullable<IDocumentBody['blockRanges']>[number]) {
    let nextBlockRange: NonNullable<IDocumentBody['blockRanges']>[number] | undefined;
    for (const range of blockRanges ?? []) {
        if (range.startIndex > blockRange.endIndex && (!nextBlockRange || range.startIndex < nextBlockRange.startIndex)) {
            nextBlockRange = range;
        }
    }

    return nextBlockRange;
}

function _hasNextAdjacentLayoutBlockRange(blockRanges: IDocumentBody['blockRanges'], blockRange: NonNullable<IDocumentBody['blockRanges']>[number]): boolean {
    const nextBlockRange = _getNextAdjacentBlockRange(blockRanges, blockRange);

    return (
        nextBlockRange != null &&
        BLOCK_LAYOUT_OUTER_SPACING_MAP.has(nextBlockRange.blockType) &&
        nextBlockRange.startIndex === blockRange.endIndex + 1
    );
}

function _applyBlockRangeLayoutParagraphStyle(
    body: Nullable<IDocumentBody>,
    paragraph: IParagraph,
    paragraphStyle: IParagraphStyle,
    documentStyle: Nullable<IDocumentStyle>,
    useLegacyModernDefaults: boolean,
    styles: IDocStyles | undefined,
    paragraphStyleId: string | undefined
): IParagraphStyle {
    const blockRanges = body?.blockRanges;
    const resolveOptions = {
        useLegacyModernDefaults,
        styles,
        paragraphStyleId,
    };

    if (!blockRanges?.length) {
        return resolveDocumentParagraphStyle(documentStyle, paragraphStyle, resolveOptions);
    }

    const blockRange = blockRanges.find((range) =>
        BLOCK_LAYOUT_OUTER_SPACING_MAP.has(range.blockType) &&
        paragraph.startIndex > range.startIndex &&
        paragraph.startIndex < range.endIndex
    );

    if (!blockRange) {
        return resolveDocumentParagraphStyle(documentStyle, paragraphStyle, resolveOptions);
    }

    const style = resolveDocumentParagraphStyle(documentStyle, paragraphStyle, {
        ...resolveOptions,
        excludeDocumentOuterSpacing: true,
    });

    // Keep the existing block line-height fallback when neither the document
    // nor the paragraph provides one.
    if (style.lineSpacing == null) {
        style.lineSpacing = DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING;
    }

    const blockParagraphs = (body?.paragraphs ?? [])
        .filter((item) => item.startIndex > blockRange.startIndex && item.startIndex < blockRange.endIndex)
        .sort((left, right) => left.startIndex - right.startIndex);
    const firstParagraph = blockParagraphs[0];
    const lastParagraph = blockParagraphs[blockParagraphs.length - 1];
    const outerSpacing = BLOCK_LAYOUT_OUTER_SPACING_MAP.get(blockRange.blockType) ?? 0;

    if (firstParagraph?.startIndex === paragraph.startIndex) {
        _withMinSpacing(style, 'spaceAbove', outerSpacing);
    }

    if (lastParagraph?.startIndex === paragraph.startIndex && !_hasNextAdjacentLayoutBlockRange(blockRanges, blockRange)) {
        _withMinSpacing(style, 'spaceBelow', outerSpacing);
    }

    return style;
}

function _isOnlyFloatingCustomBlockParagraph(
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    drawings: IDrawings
): boolean {
    if (!paragraphNode.blocks?.length) {
        return false;
    }

    const content = paragraphNode.content ?? '';
    const hasOnlyCustomBlockContent = content.split('').every((char) =>
        char === DataStreamTreeTokenType.CUSTOM_BLOCK ||
        char === DataStreamTreeTokenType.PARAGRAPH ||
        char === DataStreamTreeTokenType.SECTION_BREAK
    );

    if (!hasOnlyCustomBlockContent) {
        return false;
    }

    return paragraphNode.blocks.every((charIndex) => {
        const customBlock = viewModel.getCustomBlock(charIndex);
        const drawing = customBlock == null ? null : drawings[customBlock.blockId];

        return drawing != null && drawing.layoutType !== PositionedObjectLayoutType.INLINE;
    });
}

function _getFollowingIndentedParagraphAnchorLeft(
    viewModel: DocumentViewModel,
    paragraph: IParagraph,
    paragraphNode: DataStreamTreeNode,
    drawings: IDrawings,
    isTraditionalDocument: boolean
): IParagraphStyle['indentStart'] | undefined {
    if (!isTraditionalDocument) {
        return;
    }

    if ((paragraph.paragraphStyle?.indentStart?.v ?? 0) > 0) {
        return;
    }

    if (!_isOnlyFloatingCustomBlockParagraph(viewModel, paragraphNode, drawings)) {
        return;
    }

    const paragraphs = [...(viewModel.getBody?.()?.paragraphs ?? [])]
        .filter((item) => item.startIndex > paragraph.startIndex)
        .sort((left, right) => left.startIndex - right.startIndex);

    return (paragraphs[0]?.paragraphStyle?.indentStart?.v ?? 0) > 0
        ? paragraphs[0].paragraphStyle?.indentStart
        : undefined;
}

function _changeDrawingToSkeletonFormat(
    drawingIds: string[],
    drawings: IDrawings
): Map<string, IDocumentSkeletonDrawing> {
    const skeDrawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    drawingIds.forEach((drawingId) => {
        const drawingOrigin = drawings[drawingId];
        drawingOrigin && skeDrawings.set(drawingId, _getDrawingSkeletonFormat(drawingOrigin));
    });
    return skeDrawings;
}

function _getDrawingSkeletonFormat(drawingOrigin: IDocDrawingBase): IDocumentSkeletonDrawing {
    const { drawingId } = drawingOrigin;

    return {
        drawingId,
        aLeft: 0,
        aTop: 0,
        width: 0,
        height: 0,
        angle: 0,
        initialState: false,
        drawingOrigin,
        columnLeft: 0,
        lineHeight: 0,
        lineTop: 0,
        blockAnchorTop: 0,
        isPageBreak: false,
    };
}

function _getNextPageNumber(lastPage: IDocumentSkeletonPage) {
    return lastPage.pageNumber + 1;
}

interface IParagraphLineRef {
    page: IDocumentSkeletonPage;
    column: IDocumentSkeletonColumn;
    line: IDocumentSkeletonPage['sections'][number]['columns'][number]['lines'][number];
}

function _getParagraphLineRefs(
    pages: IDocumentSkeletonPage[],
    paragraphIndex: number
): IParagraphLineRef[] {
    const refs: IParagraphLineRef[] = [];
    for (const page of pages) {
        for (const section of page.sections ?? []) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    if (line.paragraphIndex === paragraphIndex) {
                        refs.push({ page, column, line });
                    }
                }
            }
        }
    }
    return refs;
}

function _hasPageContent(page: IDocumentSkeletonPage): boolean {
    return (page.sections ?? []).some((section) =>
        section.columns.some((column) => !isBlankColumn(column))
    ) || (page.skeTables?.size ?? 0) > 0;
}

function _hasOnlyExplicitPageBoundaryMarkers(page: IDocumentSkeletonPage): boolean {
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
                        raw === DataStreamTreeTokenType.SECTION_BREAK ||
                        streamType === DataStreamTreeTokenType.SECTION_BREAK ||
                        raw === DataStreamTreeTokenType.PAGE_BREAK ||
                        streamType === DataStreamTreeTokenType.PAGE_BREAK
                    )
                )
            )
        )
    );
}

function _lineSpanHeight(lines: IParagraphLineRef['line'][], includeAfterSpacing = true): number {
    if (lines.length === 0) {
        return 0;
    }
    const firstTop = Math.min(...lines.map((line) => line.top));
    return Math.max(...lines.map((line) =>
        line.top + line.lineHeight + (includeAfterSpacing ? Math.max(0, line.spaceBelowApply ?? 0) : 0)
    )) - firstTop;
}

function _columnUsedHeight(column: IDocumentSkeletonColumn): number {
    return _lineSpanHeight(column.lines);
}

function _reindexColumnLines(column: IDocumentSkeletonColumn): void {
    column.lines.forEach((line, index) => {
        line.lineIndex = index;
        line.parent = column;
    });
}

function _prependLines(
    sourceColumn: IDocumentSkeletonColumn,
    targetColumn: IDocumentSkeletonColumn,
    lines: IParagraphLineRef['line'][],
    validateMove?: () => boolean,
    targetSpaceAbove = 0
): number {
    if (lines.length === 0 || lines.some((line) => !sourceColumn.lines.includes(line))) {
        return 0;
    }
    // Relocating lines within the same paragraph must not turn its cached
    // after-spacing into an extra gap at the join with the continuation.
    const continuesParagraph = lines[lines.length - 1].paragraphIndex === targetColumn.lines[0]?.paragraphIndex;
    const firstLine = lines[0];
    const targetPage = targetColumn.parent?.parent;
    // Traditional keep/widow moves must apply the same page-top spacing rule as fresh layout.
    const suppressedBefore = targetPage != null && targetPage.pageNumber > 1 &&
        targetPage.type !== DocumentSkeletonPageType.HEADER && targetPage.type !== DocumentSkeletonPageType.FOOTER &&
        targetColumn.parent?.top === 0 && firstLine.paragraphStart
        ? Math.max(0, firstLine.marginTop)
        : 0;
    const lastLine = lines[lines.length - 1];
    const targetFirstLine = targetColumn.lines[0];
    // The old page-top paragraph now follows the moved heading. Restore its
    // resolved before-spacing, collapsed with the heading's after-spacing.
    const restoredGap = !continuesParagraph && targetFirstLine != null
        ? Math.max(lastLine.spaceBelowApply ?? 0, targetSpaceAbove) -
            (lastLine.spaceBelowApply ?? 0) - targetFirstLine.marginTop
        : 0;
    const movedHeight = _lineSpanHeight(lines, !continuesParagraph) - suppressedBefore + restoredGap;
    const targetHeight = targetColumn.parent?.height ?? Number.POSITIVE_INFINITY;
    if (movedHeight + _columnUsedHeight(targetColumn) > targetHeight) {
        return 0;
    }

    const sourceLines = sourceColumn.lines.slice();
    const targetLines = targetColumn.lines.slice();
    const originalTops = validateMove ? new Map([...sourceLines, ...targetLines].map((line) => [line, line.top])) : undefined;
    const sourceWasFull = sourceColumn.isFull;
    const firstLineHeight = firstLine.lineHeight;
    const firstLineMarginTop = firstLine.marginTop;
    const firstTop = Math.min(...lines.map((line) => line.top));
    const moved = lines.map((line, index) => {
        line.top -= firstTop + (index === 0 ? 0 : suppressedBefore);
        return line;
    });
    firstLine.marginTop -= suppressedBefore;
    firstLine.lineHeight -= suppressedBefore;
    const movedSet = new Set(moved);
    sourceColumn.lines = sourceColumn.lines.filter((line) => !movedSet.has(line));
    for (const line of targetColumn.lines) {
        line.top += movedHeight;
    }
    targetColumn.lines.unshift(...moved);
    sourceColumn.isFull = false;
    _reindexColumnLines(sourceColumn);
    _reindexColumnLines(targetColumn);
    if (validateMove && !validateMove()) {
        sourceColumn.lines = sourceLines;
        targetColumn.lines = targetLines;
        sourceColumn.isFull = sourceWasFull;
        firstLine.marginTop = firstLineMarginTop;
        firstLine.lineHeight = firstLineHeight;
        originalTops?.forEach((top, line) => {
            line.top = top;
        });
        _reindexColumnLines(sourceColumn);
        _reindexColumnLines(targetColumn);
        validateMove();
        return 0;
    }
    return moved.length;
}

function _hasExplicitStructuralBreak(shapedTextList: IShapedText[], viewModel: DocumentViewModel, startIndex: number): boolean {
    let offset = startIndex;
    return shapedTextList.some(({ text, glyphs }) => {
        offset += _glyphCount(glyphs);
        return (_endsWithToken(text, glyphs, DataStreamTreeTokenType.PAGE_BREAK) &&
            (!_isRenderedPageBreak(viewModel, offset - 1) || _isInsideFlowTable(viewModel, offset - 1))) ||
            _endsWithToken(text, glyphs, DataStreamTreeTokenType.COLUMN_BREAK);
    });
}

function _applyKeepLines(
    pages: IDocumentSkeletonPage[],
    paragraphIndex: number,
    metrics: ILayoutContext['paginationMetrics'],
    validateMove?: () => boolean
): number {
    const refs = _getParagraphLineRefs(pages, paragraphIndex);
    if (metrics) {
        metrics.measuredLineCount += refs.length;
        metrics.peakCheckpointLineCount = Math.max(metrics.peakCheckpointLineCount, refs.length);
    }
    const paragraphPages = [...new Set(refs.map(({ page }) => page))];
    if (paragraphPages.length !== 2 ||
        paragraphPages.some((page) => page.sections.some((section) => section.columns.length !== 1))) {
        return 0;
    }

    const sourceRefs = refs.filter(({ page }) => page === paragraphPages[0]);
    const targetRefs = refs.filter(({ page }) => page === paragraphPages[1]);
    const sourceColumns = [...new Set(sourceRefs.map(({ column }) => column))];
    const targetColumns = [...new Set(targetRefs.map(({ column }) => column))];
    if (sourceColumns.length !== 1 || targetColumns.length !== 1) {
        return 0;
    }
    const movedLineCount = _prependLines(
        sourceColumns[0],
        targetColumns[0],
        sourceRefs.map(({ line }) => line),
        validateMove
    );
    if (metrics && movedLineCount > 0) {
        metrics.retryCount += 1;
        metrics.movedLineCount += movedLineCount;
    }
    return movedLineCount;
}

function _applyKeepNext(
    pages: IDocumentSkeletonPage[],
    originalPage: IDocumentSkeletonPage,
    paragraphIndex: number,
    paragraphConfigCache: Map<number, IParagraphConfig>,
    metrics: ILayoutContext['paginationMetrics'],
    validateMove?: () => boolean
): number {
    const refs = _getParagraphLineRefs(pages, paragraphIndex);
    if (metrics) {
        metrics.measuredLineCount += refs.length;
        metrics.peakCheckpointLineCount = Math.max(metrics.peakCheckpointLineCount, refs.length);
    }
    const targetPages = [...new Set(refs.map(({ page }) => page))];
    if (refs.length === 0 || targetPages.length !== 1 || targetPages[0] === originalPage ||
        targetPages[0].breakType === BreakType.PAGE ||
        targetPages[0].sections.some((section) => section.columns.length !== 1)) {
        return 0;
    }

    if (!originalPage.sections?.length) {
        return 0;
    }
    const sourceSection = getLastSection(originalPage);
    const sourceColumn = sourceSection?.columns.findLast((column) => column.lines.length > 0);
    const targetColumn = refs[0].column;
    if (!sourceColumn || refs.some(({ column }) => column !== targetColumn)) {
        return 0;
    }

    let start = sourceColumn.lines.length;
    let scannedParagraphs = 0;
    while (start > 0 && scannedParagraphs < MAX_KEEP_NEXT_LOOKAHEAD) {
        const paragraph = sourceColumn.lines[start - 1].paragraphIndex;
        if (paragraphConfigCache.get(paragraph)?.paragraphStyle?.keepNext !== BooleanNumber.TRUE) {
            break;
        }
        scannedParagraphs += 1;
        const paragraphStart = sourceColumn.lines.findLastIndex((line, index) =>
            index < start && line.paragraphIndex !== paragraph
        ) + 1;
        const pageRefs = _getParagraphLineRefs([originalPage], paragraph);
        if (metrics) {
            metrics.measuredLineCount += pageRefs.length;
            metrics.peakCheckpointLineCount = Math.max(metrics.peakCheckpointLineCount, pageRefs.length);
        }
        const tailLineCount = start - paragraphStart;
        if (pageRefs.length !== tailLineCount ||
            pageRefs.some(({ column }) => column !== sourceColumn)) {
            break;
        }
        start = paragraphStart;
    }
    if (metrics) {
        metrics.keepNextScanCount += scannedParagraphs;
    }
    if (start === sourceColumn.lines.length) {
        return 0;
    }
    const targetFirstLine = targetColumn.lines[0];
    const targetSpaceAbove = getNumberUnitValue(
        paragraphConfigCache.get(targetFirstLine.paragraphIndex)?.paragraphStyle?.spaceAbove,
        targetFirstLine.paddingTop + targetFirstLine.contentHeight + targetFirstLine.paddingBottom
    );
    const movedLineCount = _prependLines(sourceColumn, targetColumn, sourceColumn.lines.slice(start), validateMove, targetSpaceAbove);
    if (metrics && movedLineCount > 0) {
        metrics.retryCount += 1;
        metrics.movedLineCount += movedLineCount;
    }
    return movedLineCount;
}

function _applyWidowControl(
    pages: IDocumentSkeletonPage[],
    paragraphIndex: number,
    metrics: ILayoutContext['paginationMetrics'],
    validateMove?: () => boolean
): number {
    const refs = _getParagraphLineRefs(pages, paragraphIndex);
    if (metrics) {
        metrics.measuredLineCount += refs.length;
        metrics.peakCheckpointLineCount = Math.max(metrics.peakCheckpointLineCount, refs.length);
    }
    const paragraphPages = [...new Set(refs.map(({ page }) => page))];
    if (paragraphPages.length < 2 ||
        paragraphPages.some((page) => page.sections.some((section) => section.columns.length !== 1))) {
        return 0;
    }

    const sourcePage = paragraphPages[paragraphPages.length - 2];
    const targetPage = paragraphPages[paragraphPages.length - 1];
    const sourceRefs = refs.filter(({ page }) => page === sourcePage);
    const targetRefs = refs.filter(({ page }) => page === targetPage);
    if (sourceRefs.length === 1 && targetRefs.length >= 1) {
        const movedLineCount = _prependLines(sourceRefs[0].column, targetRefs[0].column, [sourceRefs[0].line], validateMove);
        if (metrics && movedLineCount > 0) {
            metrics.retryCount += 1;
            metrics.movedLineCount += movedLineCount;
        }
        return movedLineCount;
    }
    if (targetRefs.length === 1 && sourceRefs.length >= 2) {
        // A three-line paragraph must move together; moving only its second line creates an orphan.
        const movedRefs = sourceRefs.slice(sourceRefs.length === 2 ? 0 : -1);
        const movedLineCount = _prependLines(movedRefs[0].column, targetRefs[0].column, movedRefs.map(({ line }) => line), validateMove);
        if (metrics && movedLineCount > 0) {
            metrics.retryCount += 1;
            metrics.movedLineCount += movedLineCount;
        }
        return movedLineCount;
    }
    return 0;
}

interface IPreparedLineBreaking {
    documentCompatibilityPolicy: IDocumentCompatibilityPolicy;
    paragraphConfig: IParagraphConfig;
    paragraphNonInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing>;
    paragraphInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing>;
    paragraphNonInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>;
    paragraphInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>;
    resolvedParagraphStyle: IParagraphStyle;
    segmentParagraphCache: Map<number, IParagraphConfig>;
}

function _hasSameParagraphStyle(paragraph: IParagraph, adjacent: IParagraph | undefined): boolean {
    if (adjacent == null || paragraph.styleId !== adjacent.styleId) {
        return false;
    }
    return paragraph.styleId != null ||
        paragraph.paragraphStyle?.namedStyleType === adjacent.paragraphStyle?.namedStyleType;
}

function _prepareLineBreaking(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    curPage: IDocumentSkeletonPage,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    tableSkeleton: Nullable<IDocumentSkeletonTable>,
    nextParagraphNode?: DataStreamTreeNode
): IPreparedLineBreaking {
    const { skeletonResourceReference } = ctx;
    const {
        lists,
        drawings = {},
        localeService,
    } = sectionBreakConfig;
    const { endIndex, blocks = [], children } = paragraphNode;
    const { segmentId } = curPage;
    const paragraph = viewModel.getParagraph(endIndex) || { startIndex: 0, paragraphId: 'para_render_fallback' };
    const { paragraphStyle = {}, bullet } = paragraph;
    const documentSnapshot = viewModel.getSnapshot?.();
    const documentStyle = documentSnapshot?.documentStyle;
    const documentCompatibilityPolicy = sectionBreakConfig.documentCompatibilityPolicy ??
        getDocumentCompatibilityPolicy(documentStyle?.documentFlavor);
    const shouldApplyDocumentDefaults = documentCompatibilityPolicy.applyDocumentDefaultParagraphStyle;
    const useWordStyleLineHeight = documentCompatibilityPolicy.useWordStyleLineHeight;
    const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeletonResourceReference;
    const paragraphNonInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const paragraphInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const paragraphNonInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing> = new Map();
    const paragraphInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing> = new Map();
    let segmentDrawingAnchorCache = drawingAnchor?.get(segmentId);

    if (segmentDrawingAnchorCache == null) {
        segmentDrawingAnchorCache = new Map();
        drawingAnchor?.set(segmentId, segmentDrawingAnchorCache);
    }

    const body = viewModel.getBody?.() ?? null;
    const resolvedParagraphStyle = _applyBlockRangeLayoutParagraphStyle(
        body,
        paragraph,
        paragraphStyle,
        documentStyle,
        shouldApplyDocumentDefaults,
        documentSnapshot?.styles,
        paragraph.styleId
    );
    if (isTraditionalDocumentCompatibility(documentCompatibilityPolicy) &&
        resolvedParagraphStyle.contextualSpacing === BooleanNumber.TRUE && children.length === 0) {
        // Contextual spacing suppresses each paragraph's own spacing, not its neighbour's.
        // Exact stream adjacency prevents collapsing spacing across table/cell boundaries.
        const previousParagraph = viewModel.getParagraph(paragraphNode.startIndex - 1);
        if (_hasSameParagraphStyle(paragraph, previousParagraph)) {
            resolvedParagraphStyle.spaceAbove = { v: 0 };
        }
        if (nextParagraphNode?.startIndex === endIndex + 1 && nextParagraphNode.children.length === 0 &&
            _hasSameParagraphStyle(paragraph, viewModel.getParagraph(nextParagraphNode.endIndex))) {
            resolvedParagraphStyle.spaceBelow = { v: 0 };
        }
    }
    const borderTop = resolvedParagraphStyle.borderTop;
    const borderBottom = resolvedParagraphStyle.borderBottom;
    const borderBetween = resolvedParagraphStyle.borderBetween;
    const nextParagraph = borderBetween && nextParagraphNode
        ? viewModel.getParagraph(nextParagraphNode.endIndex)
        : undefined;
    const nextParagraphStyle = nextParagraph == null
        ? undefined
        : _applyBlockRangeLayoutParagraphStyle(
            body,
            nextParagraph,
            nextParagraph.paragraphStyle ?? {},
            documentStyle,
            shouldApplyDocumentDefaults,
            documentSnapshot?.styles,
            nextParagraph.styleId
        );

    if (borderTop) {
        _withMinSpacing(
            resolvedParagraphStyle,
            'spaceAbove',
            Math.max(0, borderTop.padding ?? 0) + Math.max(0, borderTop.width ?? 1) / 2
        );
    }

    const bottomBorder = borderBetween && nextParagraphStyle &&
        hasSameParagraphBorderSet(resolvedParagraphStyle, nextParagraphStyle)
        ? borderBetween
        : borderBottom;
    const bottomBorderClearance = bottomBorder
        ? Math.max(0, bottomBorder.padding ?? 0) + Math.max(0, bottomBorder.width ?? 1) / 2
        : 0;
    if (bottomBorderClearance > 0) {
        // Keep the stroke inside the paragraph's post-text region when spaceBelow is smaller.
        _withMinSpacing(resolvedParagraphStyle, 'spaceBelow', bottomBorderClearance);
    }

    const paragraphConfig: IParagraphConfig = {
        paragraphIndex: endIndex,
        isInsideTable: _isInsideFlowTable(viewModel, endIndex),
        documentCompatibilityPolicy,
        paragraphStyle: resolvedParagraphStyle,
        docxFallbackAnchorLeft: _getFollowingIndentedParagraphAnchorLeft(
            viewModel,
            paragraph,
            paragraphNode,
            drawings,
            isTraditionalDocumentCompatibility(documentCompatibilityPolicy)
        ),
        useWordStyleLineHeight,
        paragraphNonInlineSkeDrawings,
        paragraphInlineSkeDrawings,
        skeTablesInParagraph: tableSkeleton
            ? [
                {
                    tableId: tableSkeleton.tableId,
                    table: tableSkeleton,
                    hasPositioned: false,
                    isSlideTable: false,
                    tableNode: children[0],
                },
            ]
            : undefined,
        skeHeaders,
        skeFooters,
        pDrawingAnchor: segmentDrawingAnchorCache,
    };
    let segmentParagraphCache = ctx.paragraphConfigCache.get(segmentId);

    if (segmentParagraphCache == null) {
        segmentParagraphCache = new Map();
        ctx.paragraphConfigCache.set(segmentId, segmentParagraphCache);
    }

    if (segmentParagraphCache.has(endIndex)) {
        const bulletSkeleton = segmentParagraphCache.get(endIndex)?.bulletSkeleton;

        paragraphConfig.bulletSkeleton = bulletSkeleton;
    } else {
        const listLevelAncestors = _getListLevelAncestors(bullet, skeListLevel); // Get the cache of all levels of the list
        const bulletSkeleton = dealWithBullet(bullet, lists, listLevelAncestors, localeService); // Generate bullet

        _updateListLevelAncestors(paragraph, bullet, bulletSkeleton, skeListLevel, lists); // Update the latest level cache list

        paragraphConfig.bulletSkeleton = bulletSkeleton;
    }

    for (let i = 0, len = blocks.length; i < len; i++) {
        const charIndex = blocks[i];
        const customBlock = viewModel.getCustomBlock(charIndex);

        if (customBlock == null) {
            continue;
        }

        const { blockId } = customBlock;
        const drawingOrigin = drawings[blockId];

        if (drawingOrigin == null) {
            continue;
        }

        if (drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE) {
            paragraphInlineSkeDrawingsByBlockId.set(blockId, _getDrawingSkeletonFormat(drawingOrigin));
        } else {
            paragraphNonInlineSkeDrawingsByBlockId.set(blockId, _getDrawingSkeletonFormat(drawingOrigin));
        }
    }

    segmentParagraphCache.set(endIndex, paragraphConfig);

    return {
        documentCompatibilityPolicy,
        paragraphConfig,
        paragraphNonInlineSkeDrawings,
        paragraphInlineSkeDrawings,
        paragraphNonInlineSkeDrawingsByBlockId,
        paragraphInlineSkeDrawingsByBlockId,
        resolvedParagraphStyle,
        segmentParagraphCache,
    };
}

interface ILayoutShapedTextsParams {
    ctx: ILayoutContext;
    viewModel: DocumentViewModel;
    shapedTextList: IShapedText[];
    allPages: IDocumentSkeletonPage[];
    paragraphNode: DataStreamTreeNode;
    sectionBreakConfig: ISectionBreakConfig;
    paragraphConfig: IParagraphConfig;
    documentCompatibilityPolicy: IDocumentCompatibilityPolicy;
    paragraphNonInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing>;
    paragraphInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing>;
    paragraphNonInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>;
    paragraphInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>;
}

function _splitAtReferencePageBreaks(shapedTexts: IShapedText[], offsets: ReadonlySet<number> | undefined): IShapedText[] {
    if (!offsets?.size) {
        return shapedTexts;
    }
    const result: IShapedText[] = [];
    let offset = 0;
    for (const shaped of shapedTexts) {
        let start = 0;
        for (let index = 0; index < shaped.glyphs.length; index++) {
            if (index > start && offsets.has(offset)) {
                const glyphs = shaped.glyphs.slice(start, index);
                result.push({ ...shaped, glyphs, text: glyphs.map((glyph) => glyph.raw).join(''), breakPointType: BreakPointType.Normal });
                start = index;
            }
            offset += shaped.glyphs[index].count;
        }
        const glyphs = shaped.glyphs.slice(start);
        result.push(start === 0 ? shaped : { ...shaped, glyphs, text: glyphs.map((glyph) => glyph.raw).join('') });
    }
    return result;
}

function _layoutShapedTexts({
    ctx,
    viewModel,
    shapedTextList,
    allPages: initialPages,
    paragraphNode,
    sectionBreakConfig,
    paragraphConfig,
    documentCompatibilityPolicy,
    paragraphNonInlineSkeDrawings,
    paragraphInlineSkeDrawings,
    paragraphNonInlineSkeDrawingsByBlockId,
    paragraphInlineSkeDrawingsByBlockId,
}: ILayoutShapedTextsParams): IDocumentSkeletonPage[] {
    const { skeletonResourceReference } = ctx;
    const traditionalPagination = isTraditionalDocumentCompatibility(documentCompatibilityPolicy);
    let allPages = initialPages;
    let isParagraphFirstShapedText = true; // First shaped text
    let renderParagraphBullet = true;
    let startNewLine = false;
    let shapedTextOffset = 0;
    let deferredRenderedMarkers: IDocumentSkeletonGlyph[] = [];
    const retainedBreaks = ctx.footnoteLayout?.getReferencePageBreaks(paragraphNode.endIndex);
    const referencePageBreaks = retainedBreaks
        ? new Set(retainedBreaks.map((offset) => offset - paragraphNode.contentStartIndex))
        : undefined;
    const mergedShapedTextList = _mergeAdjacentCustomBlockShapedTexts(
        _splitAtReferencePageBreaks(shapedTextList, referencePageBreaks),
        paragraphNonInlineSkeDrawingsByBlockId
    );

    for (let shapedIndex = 0; shapedIndex < mergedShapedTextList.length; shapedIndex++) {
        const { text, glyphs, breakPointType } = mergedShapedTextList[shapedIndex];
        const textStartIndex = paragraphNode.contentStartIndex + shapedTextOffset;
        const lastPage = allPages[allPages.length - 1];
        if (referencePageBreaks?.has(shapedTextOffset) && _hasPageContent(lastPage)) {
            allPages.push(createSkeletonPage(ctx, sectionBreakConfig, skeletonResourceReference, _getNextPageNumber(lastPage)));
        }
        const textGlyphCount = _glyphCount(glyphs);
        const textEndIndex = textStartIndex + textGlyphCount;
        const pushPending = (pendingGlyphs = glyphs, layoutBreakPointType = breakPointType) => {
            if (pendingGlyphs.length === 0) {
                return;
            }

            if (deferredRenderedMarkers.length > 0) {
                pendingGlyphs = [...deferredRenderedMarkers, ...pendingGlyphs];
                deferredRenderedMarkers = [];
            }
            syncActiveParagraphDrawings(
                pendingGlyphs,
                paragraphNonInlineSkeDrawings,
                paragraphInlineSkeDrawings,
                paragraphNonInlineSkeDrawingsByBlockId,
                paragraphInlineSkeDrawingsByBlockId
            );

            const nonFlowAnchor = isNonFlowFloatingAnchor(pendingGlyphs, paragraphNonInlineSkeDrawings);
            const preserveParagraphStart = nonFlowAnchor && mergedShapedTextList.slice(shapedIndex + 1)
                .some(({ glyphs }) => glyphs.some((glyph) => glyph.width > 0 &&
                    glyph.streamType !== DataStreamTreeTokenType.PARAGRAPH &&
                    glyph.streamType !== DataStreamTreeTokenType.SECTION_BREAK &&
                    glyph.streamType !== DataStreamTreeTokenType.DOCS_END));
            allPages = layoutParagraph(
                ctx,
                pendingGlyphs,
                allPages,
                sectionBreakConfig,
                paragraphConfig,
                isParagraphFirstShapedText || (!nonFlowAnchor && hasOnlyFloatingCustomBlockGlyphs(pendingGlyphs, paragraphNonInlineSkeDrawingsByBlockId)),
                layoutBreakPointType,
                renderParagraphBullet && !preserveParagraphStart,
                startNewLine
            );

            // Zero-height drawing anchors do not consume the visible first line.
            if (!preserveParagraphStart) {
                isParagraphFirstShapedText = false;
                renderParagraphBullet = false;
            }
            startNewLine = false;
        };

        if (_endsWithToken(text, glyphs, DataStreamTreeTokenType.PAGE_BREAK)) {
            const isRenderedPageBreak =
                traditionalPagination && _isRenderedPageBreak(viewModel, textEndIndex - 1);
            if (isRenderedPageBreak) {
                // Cached pagination is round-trip metadata, not an authored line/page break.
                // Keep its stream position for selections without reserving a line of its own.
                if (textGlyphCount > 1) {
                    pushPending(glyphs, BreakPointType.Normal);
                } else {
                    deferredRenderedMarkers.push(...glyphs);
                }
                shapedTextOffset += textGlyphCount;
                continue;
            }
            let terminalParagraphGlyphs: IDocumentSkeletonGlyph[] | null = null;
            if (traditionalPagination &&
                viewModel.getDataModel().documentStyle.splitPageBreakAndParagraphMark !== BooleanNumber.TRUE) {
                const trailingGlyphs: IDocumentSkeletonGlyph[] = [];
                for (let index = shapedIndex + 1; index < mergedShapedTextList.length; index++) {
                    const tail = mergedShapedTextList[index];
                    if (index === mergedShapedTextList.length - 1 &&
                        _endsWithToken(tail.text, tail.glyphs, DataStreamTreeTokenType.PARAGRAPH) &&
                        (tail.glyphs.every(({ raw }) => raw === DataStreamTreeTokenType.PARAGRAPH || raw === DataStreamTreeTokenType.SECTION_BREAK) ||
                            isNonFlowFloatingAnchor(tail.glyphs, paragraphNonInlineSkeDrawingsByBlockId))) {
                        terminalParagraphGlyphs = [...trailingGlyphs, ...tail.glyphs];
                        break;
                    }
                    if (!isNonFlowFloatingAnchor(tail.glyphs, paragraphNonInlineSkeDrawingsByBlockId)) {
                        break;
                    }
                    trailingGlyphs.push(...tail.glyphs);
                }
            }
            // A terminal mark and its non-flow pictures belong to the manual-break
            // paragraph, not an otherwise empty continuation on the next page.
            if (terminalParagraphGlyphs?.some((glyph) => glyph.drawingId != null)) {
                pushPending(glyphs);
                pushPending(terminalParagraphGlyphs);
            } else {
                const retainParagraphHeight = _isInsideFlowTable(viewModel, textEndIndex - 1) &&
                    !_hasPageContent(allPages[allPages.length - 1]) &&
                    glyphs.every((glyph) => glyph.raw === DataStreamTreeTokenType.PAGE_BREAK);
                const terminalGlyphs = terminalParagraphGlyphs?.map((glyph) => retainParagraphHeight
                    ? glyph
                    : ({
                        ...glyph,
                        width: 0,
                        bBox: { ...glyph.bBox, width: 0, ba: 0, bd: 0, aba: 0, abd: 0, normalLineHeight: 0 },
                    }));
                pushPending(terminalGlyphs ? [...glyphs, ...terminalGlyphs] : glyphs);
            }
            if (terminalParagraphGlyphs) {
                shapedIndex = mergedShapedTextList.length - 1;
                shapedTextOffset += _glyphCount(terminalParagraphGlyphs);
            }
            const currentPage = allPages[allPages.length - 1];
            if (
                _hasPageContent(currentPage) &&
                !_hasOnlyExplicitPageBoundaryMarkers(currentPage)
            ) {
                const nextPage = createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    skeletonResourceReference,
                    _getNextPageNumber(currentPage),
                    BreakType.PAGE,
                    currentPage
                );
                nextPage.isExplicitPageBreak = true;
                allPages.push(nextPage);
            }
            paragraphNonInlineSkeDrawings.clear();
            isParagraphFirstShapedText = true;
            startNewLine = true;
            shapedTextOffset += textGlyphCount;
            continue;
        } else if (
            _endsWithToken(text, glyphs, DataStreamTreeTokenType.COLUMN_BREAK) &&
            (!traditionalPagination || _isMarkedColumnBreak(viewModel, textEndIndex - 1))
        ) {
            pushPending();
            // Column break mark, still within the same section
            const lastPage = allPages[allPages.length - 1];
            const columnInfo = getLastNotFullColumnInfo(lastPage);

            if (columnInfo && !columnInfo.isLast) {
                setColumnFullState(columnInfo.column, true);
            } else if (
                columnInfo &&
                columnInfo.isLast &&
                traditionalPagination &&
                (isBlankColumn(columnInfo.column) || _isDocxColumnBreakVisuallyBlankColumn(columnInfo.column))
            ) {
                // Word treats a DOCX column break at the start of the final column as redundant.
            } else if (traditionalPagination) {
                const lastColumn = getLastSection(lastPage)?.columns.slice(-1)[0];
                if (lastColumn && (isBlankColumn(lastColumn) || _isDocxColumnBreakVisuallyBlankColumn(lastColumn))) {
                    setColumnFullState(lastColumn, false);
                } else {
                    allPages.push(
                        createSkeletonPage(
                            ctx,
                            sectionBreakConfig,
                            skeletonResourceReference,
                            _getNextPageNumber(lastPage),
                            BreakType.COLUMN,
                            lastPage
                        )
                    );
                }
            } else {
                allPages.push(
                    createSkeletonPage(
                        ctx,
                        sectionBreakConfig,
                        skeletonResourceReference,
                        _getNextPageNumber(lastPage),
                        BreakType.COLUMN,
                        lastPage
                    )
                );
            }
            shapedTextOffset += textGlyphCount;
            continue;
        }

        pushPending();
        shapedTextOffset += textGlyphCount;
    }

    return allPages;
}

interface IApplyPaginationConstraintsParams {
    ctx: ILayoutContext;
    allPages: IDocumentSkeletonPage[];
    curPage: IDocumentSkeletonPage;
    endIndex: number;
    explicitStructuralBreak: boolean;
    forcePageBreakBefore: boolean;
    tableSkeleton: Nullable<IDocumentSkeletonTable>;
    paragraphNonInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>;
    resolvedParagraphStyle: IParagraphStyle;
    segmentParagraphCache: Map<number, IParagraphConfig>;
    traditionalPagination: boolean;
    sectionBreakConfig: ISectionBreakConfig;
}

function _applyPaginationConstraints({
    ctx,
    allPages,
    curPage,
    endIndex,
    explicitStructuralBreak,
    forcePageBreakBefore,
    tableSkeleton,
    paragraphNonInlineSkeDrawingsByBlockId,
    resolvedParagraphStyle,
    segmentParagraphCache,
    traditionalPagination,
    sectionBreakConfig,
}: IApplyPaginationConstraintsParams): void {
    let moved = false;
    const validateMove = ctx.footnoteLayout ? () => ctx.footnoteLayout!.reconcilePages(allPages, sectionBreakConfig) : undefined;
    const needsPaginationCheckpoint =
        forcePageBreakBefore ||
        (
            !explicitStructuralBreak &&
            tableSkeleton == null &&
            paragraphNonInlineSkeDrawingsByBlockId.size === 0 &&
            (
                resolvedParagraphStyle.keepLines === BooleanNumber.TRUE ||
                (
                    allPages.length > 1 &&
                    (
                        resolvedParagraphStyle.widowControl === BooleanNumber.TRUE ||
                        segmentParagraphCache.size > 1
                    )
                )
            )
        );
    if (traditionalPagination && ctx.paginationMetrics) {
        if (needsPaginationCheckpoint) {
            ctx.paginationMetrics.constrainedParagraphs += 1;
        } else {
            ctx.paginationMetrics.noConstraintParagraphs += 1;
        }
    }

    if (traditionalPagination &&
        !explicitStructuralBreak &&
        !forcePageBreakBefore &&
        tableSkeleton == null &&
        paragraphNonInlineSkeDrawingsByBlockId.size === 0) {
        // Apply Word-compatible soft constraints from strongest to weakest.
        // Each helper only relocates already-shaped local lines and remains bounded.
        if (resolvedParagraphStyle.keepLines === BooleanNumber.TRUE &&
            _applyKeepLines(allPages, endIndex, ctx.paginationMetrics, validateMove) > 0) {
            moved = true;
            ctx.paragraphsOpenNewPage.add(endIndex);
        }
        const keepNextMoved = allPages.length > 1
            ? _applyKeepNext(allPages, curPage, endIndex, segmentParagraphCache, ctx.paginationMetrics, validateMove)
            : 0;
        if (keepNextMoved > 0) {
            moved = true;
            ctx.paragraphsOpenNewPage.add(endIndex);
        }
        let widowMoved = 0;
        if (
            allPages.length > 1 &&
            resolvedParagraphStyle.widowControl === BooleanNumber.TRUE
        ) {
            widowMoved = _applyWidowControl(allPages, endIndex, ctx.paginationMetrics, validateMove);
        }
        moved ||= widowMoved > 0;
        // A widow adjustment must not orphan a stronger keep-next predecessor.
        // Re-check only when the first keep-next pass made no move.
        if (widowMoved > 0 &&
            keepNextMoved === 0 &&
            _applyKeepNext(allPages, curPage, endIndex, segmentParagraphCache, ctx.paginationMetrics, validateMove) > 0) {
            moved = true;
            ctx.paragraphsOpenNewPage.add(endIndex);
        }
    }
    if (moved) {
        ctx.footnoteLayout?.queueReferenceRelayout(allPages);
    }
}

export function lineBreaking(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    shapedTextList: IShapedText[],
    curPage: IDocumentSkeletonPage,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    tableSkeleton: Nullable<IDocumentSkeletonTable>,
    tablePageBreakBefore = false,
    nextParagraphNode?: DataStreamTreeNode
): IDocumentSkeletonPage[] {
    const { endIndex } = paragraphNode;
    const {
        documentCompatibilityPolicy,
        paragraphConfig,
        paragraphNonInlineSkeDrawings,
        paragraphInlineSkeDrawings,
        paragraphNonInlineSkeDrawingsByBlockId,
        paragraphInlineSkeDrawingsByBlockId,
        resolvedParagraphStyle,
        segmentParagraphCache,
    } = _prepareLineBreaking(
        ctx,
        viewModel,
        curPage,
        paragraphNode,
        sectionBreakConfig,
        tableSkeleton,
        nextParagraphNode
    );
    const traditionalPagination = isTraditionalDocumentCompatibility(documentCompatibilityPolicy);
    const explicitStructuralBreak = _hasExplicitStructuralBreak(shapedTextList, viewModel, paragraphNode.contentStartIndex);
    const forcePageBreakBefore =
        traditionalPagination &&
        (resolvedParagraphStyle.pageBreakBefore === BooleanNumber.TRUE || tablePageBreakBefore) &&
        _hasPageContent(curPage) &&
        !_hasOnlyExplicitPageBoundaryMarkers(curPage);
    let allPages = [curPage];

    if (forcePageBreakBefore) {
        const nextPage = createSkeletonPage(
            ctx,
            sectionBreakConfig,
            ctx.skeletonResourceReference,
            _getNextPageNumber(curPage),
            BreakType.PAGE,
            curPage
        );
        nextPage.isExplicitPageBreak = true;
        allPages.push(nextPage);
        ctx.paragraphsOpenNewPage.add(endIndex);
    }

    allPages = _layoutShapedTexts({
        ctx,
        viewModel,
        shapedTextList,
        allPages,
        paragraphNode,
        sectionBreakConfig,
        paragraphConfig,
        documentCompatibilityPolicy,
        paragraphNonInlineSkeDrawings,
        paragraphInlineSkeDrawings,
        paragraphNonInlineSkeDrawingsByBlockId,
        paragraphInlineSkeDrawingsByBlockId,
    });

    _applyPaginationConstraints({
        ctx,
        allPages,
        curPage,
        endIndex,
        explicitStructuralBreak: explicitStructuralBreak || allPages.slice(1).some((page) => page.isExplicitPageBreak),
        forcePageBreakBefore,
        tableSkeleton,
        paragraphNonInlineSkeDrawingsByBlockId,
        resolvedParagraphStyle,
        segmentParagraphCache,
        traditionalPagination,
        sectionBreakConfig,
    });

    return allPages;
}

function syncActiveParagraphDrawings(
    glyphs: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing>,
    paragraphInlineSkeDrawings: Map<string, IDocumentSkeletonDrawing>,
    paragraphNonInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>,
    paragraphInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>
) {
    for (const glyph of glyphs) {
        if (glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK || glyph.drawingId == null) {
            continue;
        }

        const inlineDrawing = paragraphInlineSkeDrawingsByBlockId.get(glyph.drawingId);
        if (inlineDrawing != null) {
            paragraphInlineSkeDrawings.set(glyph.drawingId, inlineDrawing);
            continue;
        }

        const nonInlineDrawing = paragraphNonInlineSkeDrawingsByBlockId.get(glyph.drawingId);
        if (nonInlineDrawing != null) {
            paragraphNonInlineSkeDrawings.set(glyph.drawingId, nonInlineDrawing);
        }
    }
}

function hasOnlyFloatingCustomBlockGlyphs(
    glyphs: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawingsByBlockId: Map<string, IDocumentSkeletonDrawing>
): boolean {
    return glyphs.length > 0 && glyphs.every((glyph) =>
        glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK &&
        glyph.drawingId != null &&
        paragraphNonInlineSkeDrawingsByBlockId.has(glyph.drawingId)
    );
}
