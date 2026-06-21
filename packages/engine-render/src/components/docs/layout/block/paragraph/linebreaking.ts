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

import type { IBullet, IDocDrawingBase, IDocumentBody, IDrawings, IParagraph, IParagraphStyle, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonBullet, IDocumentSkeletonDrawing, IDocumentSkeletonGlyph, IDocumentSkeletonPage, IDocumentSkeletonTable, IParagraphList } from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { ILayoutContext } from '../../tools';
import type { IShapedText } from './shaping';
import {
    DataStreamTreeTokenType,
    DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW,
    DocumentBlockRangeType,
    DocumentFlavor,
    PositionedObjectLayoutType,
    Tools,
} from '@univerjs/core';
import { BreakType } from '../../../../../basics/i-document-skeleton-cached';
import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import { getLastNotFullColumnInfo } from '../../tools';
import { dealWithBullet } from './bullet';
import { layoutParagraph } from './layout-ruler';

const BLOCK_LAYOUT_OUTER_SPACING_MAP = new Map([
    [DocumentBlockRangeType.CALLOUT, 34],
    [DocumentBlockRangeType.CODE, 32],
    [DocumentBlockRangeType.QUOTE, 24],
]);

function _endsWithToken(text: string, glyphs: IDocumentSkeletonGlyph[], token: DataStreamTreeTokenType): boolean {
    return text.endsWith(token) || glyphs[glyphs.length - 1]?.raw === token || glyphs[glyphs.length - 1]?.streamType === token;
}

function _isMarkedDocxColumnBreak(viewModel: DocumentViewModel, absoluteIndex: number): boolean {
    const customRange = viewModel.getCustomRange(absoluteIndex);
    const properties = customRange?.properties as { docxBreakType?: unknown } | undefined;

    return properties?.docxBreakType === 'column';
}

function _glyphCount(glyphs: IDocumentSkeletonGlyph[]): number {
    return glyphs.reduce((count, glyph) => count + glyph.count, 0);
}

function _hasOnlyCustomBlockGlyphs(glyphs: IDocumentSkeletonGlyph[]): boolean {
    return glyphs.length > 0 && glyphs.every((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK);
}

function _mergeAdjacentCustomBlockShapedTexts(shapedTextList: IShapedText[]): IShapedText[] {
    const mergedShapedTextList: IShapedText[] = [];

    for (const shapedText of shapedTextList) {
        const lastShapedText = mergedShapedTextList[mergedShapedTextList.length - 1];

        if (
            lastShapedText &&
            _hasOnlyCustomBlockGlyphs(lastShapedText.glyphs) &&
            _hasOnlyCustomBlockGlyphs(shapedText.glyphs)
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

    return mergedShapedTextList;
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
    listLevel?: Map<string, IParagraphList[][]>
) {
    if (!bullet || !bulletSkeleton) {
        return;
    }

    const { listId, nestingLevel } = bullet;

    const cacheItem: IParagraphList[][] = [...(listLevel?.get(listId) || [])];

    // [[nestingLevel, bulletSkeleton]];

    if (cacheItem[nestingLevel] == null) {
        cacheItem[nestingLevel] = [];
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
    return blockRanges
        ?.filter((range) => range.startIndex > blockRange.endIndex)
        .sort((left, right) => left.startIndex - right.startIndex)[0];
}

function _hasNextAdjacentLayoutBlockRange(blockRanges: IDocumentBody['blockRanges'], blockRange: NonNullable<IDocumentBody['blockRanges']>[number]): boolean {
    const nextBlockRange = _getNextAdjacentBlockRange(blockRanges, blockRange);

    return (
        nextBlockRange != null &&
        BLOCK_LAYOUT_OUTER_SPACING_MAP.has(nextBlockRange.blockType) &&
        nextBlockRange.startIndex === blockRange.endIndex + 1
    );
}

function _applyDefaultLayoutParagraphStyle(style: IParagraphStyle, hasBlockRange: boolean) {
    if (style.lineSpacing == null) {
        style.lineSpacing = DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING;
    }

    if (hasBlockRange) {
        return;
    }

    if (style.spaceAbove == null) {
        style.spaceAbove = { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE };
    }

    if (style.spaceBelow == null) {
        style.spaceBelow = { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW };
    }
}

function _applyBlockRangeLayoutParagraphStyle(
    body: Nullable<IDocumentBody>,
    paragraph: IParagraph,
    paragraphStyle: IParagraphStyle,
    shouldApplyDocumentDefaults: boolean
): IParagraphStyle {
    const style = Tools.deepClone(paragraphStyle);
    const blockRanges = body?.blockRanges;

    if (!blockRanges?.length) {
        if (shouldApplyDocumentDefaults) {
            _applyDefaultLayoutParagraphStyle(style, false);
        }
        return style;
    }

    const blockRange = blockRanges.find((range) =>
        BLOCK_LAYOUT_OUTER_SPACING_MAP.has(range.blockType) &&
        paragraph.startIndex > range.startIndex &&
        paragraph.startIndex < range.endIndex
    );

    if (!blockRange) {
        if (shouldApplyDocumentDefaults) {
            _applyDefaultLayoutParagraphStyle(style, false);
        }
        return style;
    }

    _applyDefaultLayoutParagraphStyle(style, true);

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

function _shouldApplyDocumentDefaultParagraphStyle(viewModel: DocumentViewModel): boolean {
    const snapshot = viewModel.getSnapshot?.();

    if (snapshot == null) {
        return true;
    }

    return snapshot.documentStyle.documentFlavor === DocumentFlavor.MODERN;
}

function _shouldUseWordStyleLineHeight(viewModel: DocumentViewModel): boolean {
    const snapshot = viewModel.getSnapshot?.();
    const documentFlavor = snapshot?.documentStyle.documentFlavor;

    if (snapshot == null) {
        return true;
    }

    return documentFlavor != null && documentFlavor !== DocumentFlavor.UNSPECIFIED;
}

function _isTraditionalDoc(viewModel: DocumentViewModel): boolean {
    return viewModel.getSnapshot?.()?.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL;
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
    drawings: IDrawings
): IParagraphStyle['indentStart'] | undefined {
    if (!_isTraditionalDoc(viewModel)) {
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

export function lineBreaking(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    shapedTextList: IShapedText[],
    curPage: IDocumentSkeletonPage,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    tableSkeleton: Nullable<IDocumentSkeletonTable>
): IDocumentSkeletonPage[] {
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
    const shouldApplyDocumentDefaults = _shouldApplyDocumentDefaultParagraphStyle(viewModel);
    const useWordStyleLineHeight = _shouldUseWordStyleLineHeight(viewModel);

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

    const paragraphConfig: IParagraphConfig = {
        paragraphIndex: endIndex,
        paragraphStyle: _applyBlockRangeLayoutParagraphStyle(
            viewModel.getBody?.() ?? null,
            paragraph,
            paragraphStyle,
            shouldApplyDocumentDefaults
        ),
        docxFallbackAnchorLeft: _getFollowingIndentedParagraphAnchorLeft(viewModel, paragraph, paragraphNode, drawings),
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

        _updateListLevelAncestors(paragraph, bullet, bulletSkeleton, skeListLevel); // Update the latest level cache list

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

    let allPages = [curPage];
    let isParagraphFirstShapedText = true; // First shaped text
    let shapedTextOffset = 0;
    for (const [_index, { text, glyphs, breakPointType }] of _mergeAdjacentCustomBlockShapedTexts(shapedTextList).entries()) {
        const textStartIndex = paragraphNode.startIndex + shapedTextOffset;
        const textGlyphCount = _glyphCount(glyphs);
        const textEndIndex = textStartIndex + textGlyphCount;
        const pushPending = () => {
            if (glyphs.length === 0) {
                return;
            }

            syncActiveParagraphDrawings(
                glyphs,
                paragraphNonInlineSkeDrawings,
                paragraphInlineSkeDrawings,
                paragraphNonInlineSkeDrawingsByBlockId,
                paragraphInlineSkeDrawingsByBlockId
            );

            allPages = layoutParagraph(
                ctx,
                glyphs,
                allPages,
                sectionBreakConfig,
                paragraphConfig,
                isParagraphFirstShapedText || hasOnlyFloatingCustomBlockGlyphs(glyphs, paragraphNonInlineSkeDrawingsByBlockId),
                breakPointType
            );

            isParagraphFirstShapedText = false;
        };

        if (_endsWithToken(text, glyphs, DataStreamTreeTokenType.PAGE_BREAK)) {
            pushPending();
            allPages.push(
                createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    skeletonResourceReference,
                    _getNextPageNumber(allPages[allPages.length - 1]),
                    BreakType.PAGE
                )
            );
            paragraphNonInlineSkeDrawings.clear();
            isParagraphFirstShapedText = true;
            shapedTextOffset += textGlyphCount;
            continue;
        } else if (_endsWithToken(text, glyphs, DataStreamTreeTokenType.COLUMN_BREAK) && (
            viewModel.getDataModel().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL ||
            _isMarkedDocxColumnBreak(viewModel, textEndIndex - 1)
        )) {
            pushPending();
            // Column break mark, still within the same section
            const lastPage = allPages[allPages.length - 1];
            const columnInfo = getLastNotFullColumnInfo(lastPage);

            if (columnInfo && !columnInfo.isLast) {
                setColumnFullState(columnInfo.column, true);
            } else {
                allPages.push(
                    createSkeletonPage(
                        ctx,
                        sectionBreakConfig,
                        skeletonResourceReference,
                        _getNextPageNumber(lastPage),
                        BreakType.COLUMN
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
