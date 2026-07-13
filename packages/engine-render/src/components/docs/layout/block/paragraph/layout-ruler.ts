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

import type { INumberUnit, IParagraphProperties, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    IDocumentSkeletonTable,
} from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, IParagraphTableCache, ISectionBreakConfig } from '../../../../../basics/interfaces';
import type {
    IFloatObject,
    ILayoutContext,
} from '../../tools';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentFlavor,
    GridType,
    NAMED_STYLE_SPACE_MAP,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SpacingRule,
    TableTextWrapType,
    WrapStrategy,
} from '@univerjs/core';
import { GlyphType, LineType } from '../../../../../basics/i-document-skeleton-cached';
import { getDocsCustomBlockRenderViewport } from '../../../custom-block-render-viewport';
import { BreakPointType } from '../../line-breaker/break';
import { addGlyphToDivide, createSkeletonBulletGlyph } from '../../model/glyph';
import {
    calculateLineTopByDrawings,
    collisionDetection,
    createAndUpdateBlockAnchor,
    createSkeletonLine,
    setLineMarginBottom,
    updateDivideInfo,
} from '../../model/line';
import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import {
    FloatObjectType,
    getCharSpaceApply,
    getCharSpaceConfig,
    getLastLineByColumn,
    getLastNotFullColumnInfo,
    getLastNotFullDivideInfo,
    getLastPage,
    getLastSection,
    getLineHeightConfig,
    getNumberUnitValue,
    getPositionHorizon,
    getPositionVertical,
    isBlankColumn,
    isColumnFull,
    lineIterator,
} from '../../tools';
import { createTableSkeletons, rollbackListCache } from '../table';

const LINE_LAYOUT_OVERFLOW_TOLERANCE = 2;
const FLOAT_OBJECT_RELAYOUT_LIMIT = 5;
const MIN_LINE_WIDTH_TOLERANCE = 1;
const MAX_LINE_WIDTH_TOLERANCE = 3;
const RELATIVE_LINE_WIDTH_TOLERANCE = 0.01;

function isBeyondDivideWidth(width: number, divideWidth: number) {
    const tolerance = Math.min(
        MAX_LINE_WIDTH_TOLERANCE,
        Math.max(MIN_LINE_WIDTH_TOLERANCE, divideWidth * RELATIVE_LINE_WIDTH_TOLERANCE)
    );

    return width - divideWidth > tolerance;
}

function isGlyphGroupBeyondDivideWidth(
    glyphGroup: IDocumentSkeletonGlyph[],
    offsetLeft: number,
    divideWidth: number
) {
    const width = __getGlyphGroupWidth(glyphGroup);
    const trailingShrinkability = glyphGroup[glyphGroup.length - 1]?.adjustability?.shrinkability?.[1] ?? 0;

    return isBeyondDivideWidth(offsetLeft + width - trailingShrinkability, divideWidth);
}

export function layoutParagraph(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal
) {
    if (isParagraphFirstShapedText) {
        // elementIndex === 0 means the first character at the beginning of a paragraph, needs a new line to distinguish from the previous paragraph
        if (paragraphConfig.bulletSkeleton) {
            const { bulletSkeleton, paragraphStyle = {} } = paragraphConfig;
            // If it is the beginning of a paragraph, bullet needs to be added
            const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 10.5 } = sectionBreakConfig;

            const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
            const bulletGlyph = createSkeletonBulletGlyph(glyphGroup[0], bulletSkeleton, charSpaceApply);
            const paragraphProperties = bulletSkeleton.paragraphProperties || {};
            const bulletParagraphStyle = {
                ...paragraphProperties,
                hanging: paragraphProperties.hanging ?? { v: bulletGlyph.width },
            } as IParagraphProperties;

            paragraphConfig.paragraphStyle = {
                ...bulletParagraphStyle,
                ...paragraphConfig.paragraphStyle,
            };

            _lineOperator(ctx, [bulletGlyph, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);
        } else {
            _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);
        }
    } else {
        _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);
    }

    return [...pages];
}

function isGlyphGroupEndWithWhiteSpaces(glyphGroup: IDocumentSkeletonGlyph[]) {
    if (glyphGroup.length <= 1) {
        return false;
    }

    let isInWhiteSpace = false;

    for (const g of glyphGroup) {
        if (g.content === DataStreamTreeTokenType.SPACE) {
            isInWhiteSpace = true;
        }

        if (isInWhiteSpace &&
            g.content !== DataStreamTreeTokenType.SPACE && g.content !== DataStreamTreeTokenType.PARAGRAPH && g.streamType !== DataStreamTreeTokenType.SECTION_BREAK) {
            return false;
        }
    }

    return isInWhiteSpace;
}

function isGlyphGroupBeyondContentBox(glyphGroup: IDocumentSkeletonGlyph[], left: number, divideWidth: number) {
    if (glyphGroup.length <= 1) {
        return false;
    }

    let width = left;
    let isBeyondContentBox = false;

    for (const g of glyphGroup) {
        if (
            g.content === DataStreamTreeTokenType.SPACE ||
            g.content === DataStreamTreeTokenType.PARAGRAPH ||
            g.streamType === DataStreamTreeTokenType.SECTION_BREAK
        ) {
            break;
        }
        width += g.width;

        if (width > divideWidth) {
            isBeyondContentBox = true;
            break;
        }
    }

    return isBeyondContentBox;
}

function shouldKeepOverflowingTextOnLine(sectionBreakConfig: ISectionBreakConfig): boolean {
    const wrapStrategy = sectionBreakConfig.renderConfig?.wrapStrategy;

    return wrapStrategy === WrapStrategy.CLIP || wrapStrategy === WrapStrategy.OVERFLOW;
}

// Gets the number of consecutive lines ending with a hyphen.
function _getConsecutiveHyphenLineCount(divide: IDocumentSkeletonDivide) {
    const column = divide.parent?.parent;

    if (column == null) {
        return 0;
    }

    let count = 0;

    for (let i = column.lines.length - 1; i >= 0; i--) {
        const line = column.lines[i];
        const lastDivide = line.divides[line.divides.length - 1];
        if (lastDivide.breakType === BreakPointType.Hyphen) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

function _popHyphenSlice(divide: IDocumentSkeletonDivide) {
    const glyphGroup: IDocumentSkeletonGlyph[] = [];

    let lastGlyph = divide.glyphGroup.pop();

    while (lastGlyph && lastGlyph.content !== ' ') {
        glyphGroup.unshift(lastGlyph);

        lastGlyph = divide.glyphGroup.pop();
    }

    // If the hyphenated word slice is the first word slice of the divide,
    // ignore this rule and recovery divide.
    if (divide.glyphGroup.length === 0) {
        divide.glyphGroup.push(...glyphGroup);

        glyphGroup.length = 0;
    }

    return glyphGroup;
}

function _divideOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const divideInfo = getLastNotFullDivideInfo(lastPage); // Get the first divide in the latest line that is not full.
    if (divideInfo) {
        const { divide, isLast } = divideInfo;
        const lastGlyph = divide?.glyphGroup?.[divide.glyphGroup.length - 1];
        const lastWidth = lastGlyph?.width || 0;
        const lastLeft = lastGlyph?.left || 0;
        const preOffsetLeft = lastWidth + lastLeft;
        const { hyphenationZone } = sectionBreakConfig;
        if (isGlyphGroupBeyondDivideWidth(glyphGroup, preOffsetLeft, divide.width)) {
            if (
                divide?.glyphGroup.length === 0 &&
                glyphGroup.length > 0 &&
                glyphGroup[0].streamType === DataStreamTreeTokenType.CUSTOM_BLOCK
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                updateDivideInfo(divide, { breakType: breakPointType });
                return;
            }

            if (shouldKeepOverflowingTextOnLine(sectionBreakConfig)) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                updateDivideInfo(divide, { breakType: breakPointType });
                return;
            }

            // width exceeds divide width
            updateDivideInfo(divide, {
                isFull: true,
            });
            const hyphenLineCount = _getConsecutiveHyphenLineCount(divideInfo.divide);
            const { consecutiveHyphenLimit = Number.POSITIVE_INFINITY } = sectionBreakConfig;

            // There are two main ways to deal with word or number strings exceeding divide width
            // 1. If you end with a line break(\r), you need to append a line break(\r) to the end of divide, even if it exceeds the divide width.
            // 2. In a blank line, if the English word or consecutive number exceeds the width of the divide, the English word and number string will be split, and some of them will be added to the previous line, and the rest will be placed in the new line.
            // There is a boundary case, that is, the width of the English character exceeds the width of the divide, and this character needs to be appended to the previous line.
            if (
                divideInfo.isLast &&
                glyphGroup.length === 1 &&
                (glyphGroup[0].content === DataStreamTreeTokenType.SPACE ||
                    glyphGroup[0].content === DataStreamTreeTokenType.PARAGRAPH)
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            } else if (
                // If a line of text ends with consecutive spaces, the spaces should not be placed on the second line.
                divideInfo.isLast && !isGlyphGroupBeyondContentBox(glyphGroup, preOffsetLeft, divide.width) && isGlyphGroupEndWithWhiteSpaces(glyphGroup)
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            } else if (
                !isLast &&
                divide?.glyphGroup.length === 0 &&
                glyphGroup.length === 1 &&
                glyphGroup[0].streamType === DataStreamTreeTokenType.CUSTOM_BLOCK &&
                glyphGroup[0].width > divide.width
            ) {
                addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                updateDivideInfo(divide, { breakType: breakPointType });
            } else if (divide?.glyphGroup.length === 0) {
                const sliceGlyphGroup: IDocumentSkeletonGlyph[] = [];

                while (glyphGroup.length) {
                    sliceGlyphGroup.push(glyphGroup.shift()!);

                    if (isGlyphGroupBeyondDivideWidth(sliceGlyphGroup, 0, divide.width)) {
                        // To avoid infinity loop when width is less than one char's width.
                        if (sliceGlyphGroup.length > 1) { // || (sliceGlyphGroup.length > 0 && sliceGlyphGroup[sliceGlyphGroup.length - 1].drawingId)) {
                            glyphGroup.unshift(sliceGlyphGroup.pop()!);
                        }
                        break;
                    }
                }

                if (sliceGlyphGroup.length > 0) {
                    addGlyphToDivide(divide, sliceGlyphGroup, preOffsetLeft);
                }

                if (glyphGroup.length) {
                    // Only Divide in the first paragraph is the beginning of the paragraph
                    _divideOperator(
                        ctx,
                        glyphGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        false,

                        breakPointType,
                        defaultSpanLineHeight
                    );
                }
            } else if (hyphenLineCount > consecutiveHyphenLimit) {
                const hyphenSliceGlyphGroup = _popHyphenSlice(divide);

                if (hyphenSliceGlyphGroup.length > 0) {
                    updateDivideInfo(divide, {
                        breakType: BreakPointType.Normal,
                    });

                    _divideOperator(ctx, hyphenSliceGlyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, BreakPointType.Hyphen);
                }

                _divideOperator(
                    ctx,
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    isParagraphFirstShapedText,

                    breakPointType,
                    defaultSpanLineHeight
                );
            } else {
                _divideOperator(
                    ctx,
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    isParagraphFirstShapedText,

                    breakPointType,
                    defaultSpanLineHeight
                );
            }
        } else if ( // Determine if first word slice appears inside the hyphenation zone.
            isLast &&
            hyphenationZone &&
            hyphenationZone > 0 &&
            preOffsetLeft >= divide.width - hyphenationZone &&
            breakPointType === BreakPointType.Hyphen &&
            divide.breakType === BreakPointType.Normal
        ) {
            updateDivideInfo(divide, {
                isFull: true,
            });

            _divideOperator(
                ctx,
                glyphGroup,
                pages,
                sectionBreakConfig,
                paragraphConfig,
                isParagraphFirstShapedText,

                breakPointType,
                defaultSpanLineHeight
            );
        } else {
            // w does not exceed divide width, add it to divide
            const currentLine = divide.parent;
            const maxBox = __maxFontBoundingBoxByGlyphGroup(glyphGroup);

            if (
                currentLine &&
                __isZeroWidthNonFlowFloatingAnchorLine(__getGlyphGroupByLine(currentLine), paragraphConfig.paragraphNonInlineSkeDrawings) &&
                __hasFlowGlyph(glyphGroup)
            ) {
                for (const lineDivide of currentLine.divides) {
                    updateDivideInfo(lineDivide, {
                        isFull: true,
                    });
                }
                _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, false, breakPointType);
                return;
            }

            if (
                currentLine &&
                maxBox &&
                !__isNullLine(currentLine) &&
                __hasFlowGlyph(__getGlyphGroupByLine(currentLine)) &&
                !__isZeroWidthNonFlowFloatingAnchorLine(glyphGroup, paragraphConfig.paragraphNonInlineSkeDrawings)
            ) {
                const { paragraphLineGapDefault, linePitch, lineSpacing, spacingRule, snapToGrid, gridType } =
                    getLineHeightConfig(sectionBreakConfig, paragraphConfig);
                const { boundingBoxAscent, boundingBoxDescent } = maxBox;
                const spanLineHeight = boundingBoxAscent + boundingBoxDescent;
                const { contentHeight } = getLineHeightMetrics(
                    spanLineHeight,
                    paragraphLineGapDefault,
                    linePitch,
                    gridType,
                    lineSpacing,
                    spacingRule,
                    snapToGrid,
                    paragraphConfig.useWordStyleLineHeight
                );

                if (contentHeight - currentLine.contentHeight > LINE_LAYOUT_OVERFLOW_TOLERANCE) {
                    // If the height of the new content exceeds the height of the line it joins, for mixed text and graphics layout, the entire line needs to be recalculated according to the new height
                    // If the height of the new content exceeds the height of the added row,
                    // the entire row needs to be recalculated according to the new height
                    // in order to handle the mixing of graphics and text
                    const spanGroupCached = __getGlyphGroupByLine(currentLine);
                    const spanGroupCachedLen = spanGroupCached.length;
                    let newGlyphGroup = [];
                    let startIndex = 1;

                    if (spanGroupCachedLen > 2 && spanGroupCached[0].glyphType === GlyphType.LIST) {
                        newGlyphGroup = [spanGroupCached[0], spanGroupCached[1]];
                        startIndex = 2;
                    } else {
                        newGlyphGroup = [spanGroupCached[0]];
                    }
                    const column = currentLine.parent!;

                    const { paragraphStart: lineIsStart } = column.lines.pop()!; // Delete the previous line and recalculate according to the maximum content height

                    _lineOperator(
                        ctx,
                        newGlyphGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        lineIsStart,

                        breakPointType,
                        boundingBoxAscent + boundingBoxDescent
                    );

                    for (let i = startIndex; i < spanGroupCached.length; i++) {
                        // TODO: @jocs Here you may see non-breakpoints appearing at the end of the line.
                        _divideOperator(
                            ctx,
                            [spanGroupCached[i]],
                            pages,
                            sectionBreakConfig,
                            paragraphConfig,
                            isParagraphFirstShapedText
                        );
                    }

                    _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType);

                    return;
                }
            }
            if (currentLine?.parent) {
                const anchorDrawings = __getZeroWidthNonFlowFloatingAnchorDrawings(glyphGroup, paragraphConfig.paragraphNonInlineSkeDrawings);
                if (anchorDrawings.length > 0) {
                    const paragraphAnchorLeft = __getParagraphAnchorLeft(sectionBreakConfig, paragraphConfig, paragraphConfig.paragraphStyle?.indentStart);
                    const drawings = __getDrawingPosition(
                        ctx,
                        currentLine.top,
                        currentLine.lineHeight,
                        currentLine.parent,
                        true,
                        paragraphConfig.pDrawingAnchor?.get(paragraphConfig.paragraphIndex)?.top,
                        anchorDrawings,
                        paragraphAnchorLeft,
                        false
                    );
                    __updateDrawingPosition(currentLine.parent, drawings);
                    addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
                    updateDivideInfo(divide, { breakType: breakPointType });
                    glyphGroup.length = 0;
                    return;
                }
            }

            addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            updateDivideInfo(divide, { breakType: breakPointType });
        }
    } else {
        _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanLineHeight);
    }
}

function _lineOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType: BreakPointType = BreakPointType.Normal,
    defaultGlyphLineHeight?: number
) {
    let lastPage = getLastPage(pages);
    let columnInfo = getLastNotFullColumnInfo(lastPage);
    if (!columnInfo || !columnInfo.column) {
        const lastSection = getLastSection(lastPage);
        const lastColumnIndex = lastSection.columns.length - 1;
        const lastColumn = lastSection.columns[lastColumnIndex];
        if (lastColumn && isBlankColumn(lastColumn)) {
            setColumnFullState(lastColumn, false);
            columnInfo = {
                column: lastColumn,
                index: lastColumnIndex,
                isLast: true,
            };
        }
    }
    if (!columnInfo || !columnInfo.column) {
        // If the column does not exist, use a fallback strategy and add a new page.
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, true, breakPointType);
        lastPage = getLastPage(pages);
        columnInfo = getLastNotFullColumnInfo(lastPage);
    }
    // Todo: columnInfo does not exist when demo4 is imported, return first
    if (!columnInfo) return;

    const column = columnInfo!.column;

    // If the page width < marginLeft + marginRight, will trigger infinity loop, so return it first.
    // The best solution is to do data checks and data repairs, and pass the correct data to the render layer.
    if (column.width <= 0) {
        console.error('The column width is less than 0, need to adjust page width to make it great than 0');
        return;
    }

    const preLine = getLastLineByColumn(column);

    const ascent = Math.max(...glyphGroup.map((glyph) => glyph.bBox.ba));
    const descent = Math.max(...glyphGroup.map((glyph) => glyph.bBox.bd));
    const glyphLineHeight = defaultGlyphLineHeight || (ascent + descent);

    const {
        paragraphStyle: originParagraphStyle = {},
        paragraphNonInlineSkeDrawings,
        skeTablesInParagraph,
        skeHeaders,
        skeFooters,
        pDrawingAnchor,
        paragraphIndex,
    } = paragraphConfig;
    const isZeroWidthNonFlowFloatingAnchorLine = __isZeroWidthNonFlowFloatingAnchorLine(glyphGroup, paragraphNonInlineSkeDrawings);
    const { namedStyleType } = originParagraphStyle;
    const namedStyle = namedStyleType !== undefined ? NAMED_STYLE_SPACE_MAP[namedStyleType] : null;
    const paragraphStyle = {
        ...originParagraphStyle,
        spaceAbove: originParagraphStyle.spaceAbove ?? namedStyle?.spaceAbove,
        spaceBelow: originParagraphStyle.spaceBelow ?? namedStyle?.spaceBelow,
    };

    const {
        // direction,
        spaceAbove,
        spaceBelow,
        indentFirstLine,
        hanging,
        indentStart,
        indentEnd,
    } = paragraphStyle;

    const {
        paragraphLineGapDefault,
        linePitch,
        lineSpacing,
        spacingRule,
        snapToGrid,
        gridType,
    } = getLineHeightConfig(
        sectionBreakConfig,
        paragraphConfig
    );

    const hasInlineCustomBlock = glyphGroup.some((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0);
    const positionedCustomBlockOnly = glyphGroup.length > 0 &&
        paragraphNonInlineSkeDrawings != null &&
        paragraphNonInlineSkeDrawings.size > 0 &&
        glyphGroup.every((glyph) => {
            if (!glyph) {
                return false;
            }

            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                return [...paragraphNonInlineSkeDrawings.values()].some((drawing) => drawing.drawingId === glyph.drawingId);
            }

            return glyph.streamType === DataStreamTreeTokenType.PARAGRAPH || glyph.raw === DataStreamTreeTokenType.PARAGRAPH;
        });
    const glyphGroupCustomBlockIds = new Set(glyphGroup
        .filter((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.drawingId != null)
        .map((glyph) => glyph.drawingId!));
    let { paddingTop, paddingBottom, contentHeight, lineSpacingApply } = getLineHeightMetrics(
        glyphLineHeight,
        paragraphLineGapDefault,
        linePitch,
        gridType,
        lineSpacing,
        spacingRule,
        snapToGrid,
        paragraphConfig.useWordStyleLineHeight,
        !hasInlineCustomBlock
    );

    if (positionedCustomBlockOnly) {
        paddingTop = 0;
        paddingBottom = 0;
        contentHeight = 0.01;
        lineSpacingApply = 0.01;
    }

    let { marginTop, spaceBelowApply } = __getParagraphSpace(
        ctx,
        lineSpacingApply,
        spaceAbove,
        spaceBelow,
        isParagraphFirstShapedText,
        preLine
    );

    if (positionedCustomBlockOnly) {
        spaceBelowApply = 0;
    }

    if (isZeroWidthNonFlowFloatingAnchorLine) {
        paddingTop = 0;
        paddingBottom = 0;
        contentHeight = 0;
        lineSpacingApply = 0;
        marginTop = 0;
        spaceBelowApply = 0;
    }

    const lineHeight = marginTop + paddingTop + contentHeight + paddingBottom;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const paragraphAnchorLeft = __getParagraphAnchorLeft(sectionBreakConfig, paragraphConfig, indentStart);

    let section = column.parent;
    if (!section) {
        // Fallback, point to the last section of the current page
        section = getLastSection(lastPage);
    }
    const preLineHeight = preLine?.lineHeight || 0;
    const preTop = preLine?.top || 0;
    const lineTop = preLineHeight + preTop;

    const { pageWidth, headerId, footerId, segmentId } = lastPage;
    const headerPage = skeHeaders?.get(headerId)?.get(pageWidth);
    const footerPage = skeFooters?.get(footerId)?.get(pageWidth);

    let needOpenNewPageByTableLayout = false;

    // Handle float object relative to line.
    // FIXME: @jocs, it will not update the last line's drawings.
    if (preLine) {
        const drawingsInLine = _getCustomBlockIdsInLine(preLine);
        if (drawingsInLine.length > 0) {
            const affectDrawings = ctx.paragraphConfigCache.get(segmentId)?.get(preLine.paragraphIndex)?.paragraphNonInlineSkeDrawings;
            const relativeLineDrawings = ([...(affectDrawings?.values() ?? [])])
                .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom === ObjectRelativeFromV.LINE)
                .filter((drawing) => drawingsInLine.includes(drawing.drawingId));

            if (relativeLineDrawings.length > 0) {
                __updateAndPositionDrawings(ctx, preLine.top, preLine.lineHeight, column, relativeLineDrawings, preLine.paragraphIndex, isParagraphFirstShapedText);
            }
        }
    }

    let deferredInlineGroupAnchorDrawings: IDocumentSkeletonDrawing[] = [];
    let deferredTopBottomAnchorDrawings: IDocumentSkeletonDrawing[] = [];

    if (paragraphNonInlineSkeDrawings != null && paragraphNonInlineSkeDrawings.size > 0) {
        let targetDrawings = [...paragraphNonInlineSkeDrawings.values()]
            .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom !== ObjectRelativeFromV.LINE);

        if (hasInlineCustomBlock) {
            deferredInlineGroupAnchorDrawings = targetDrawings.filter((drawing) =>
                glyphGroupCustomBlockIds.has(drawing.drawingId) &&
                drawing.drawingOrigin.docTransform.positionV.relativeFrom === ObjectRelativeFromV.LINE
            );
            targetDrawings = targetDrawings.filter((drawing) => !deferredInlineGroupAnchorDrawings.includes(drawing));
        }
        deferredTopBottomAnchorDrawings = targetDrawings.filter((drawing) =>
            glyphGroupCustomBlockIds.has(drawing.drawingId) &&
            drawing.drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        );
        targetDrawings = targetDrawings.filter((drawing) =>
            drawing.drawingOrigin.layoutType !== PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        );

        __updateAndPositionDrawings(ctx, lineTop, lineHeight, column, targetDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, pDrawingAnchor?.get(paragraphIndex)?.top, paragraphAnchorLeft, false, deferredTopBottomAnchorDrawings.length > 0);
    }

    if (skeTablesInParagraph != null && skeTablesInParagraph.length > 0) {
        needOpenNewPageByTableLayout = _updateAndPositionTable(ctx, lineTop, lineHeight, lastPage, column, section, skeTablesInParagraph, paragraphConfig.paragraphIndex, sectionBreakConfig, pDrawingAnchor?.get(paragraphIndex)?.top);
    }

    const calculatedLineTop = positionedCustomBlockOnly
        ? lineTop
        : calculateLineTopByDrawings(
            lineHeight,
            lineTop,
            lastPage,
            headerPage,
            footerPage
        ); // WRAP_TOP_AND_BOTTOM drawing and WRAP NONE table will change the starting top of the line
    const previousTopBottomCustomBlockFlowBottom = deferredTopBottomAnchorDrawings.length > 0
        ? paragraphConfig.topBottomCustomBlockFlowBottom
        : undefined;
    const newLineTop = previousTopBottomCustomBlockFlowBottom == null
        ? calculatedLineTop
        : Math.max(calculatedLineTop, previousTopBottomCustomBlockFlowBottom);

    const lineOverflowsSection = lineHeight + newLineTop - section.height > LINE_LAYOUT_OVERFLOW_TOLERANCE;

    if ((lineOverflowsSection && column.lines.length > 0 && lastPage.sections.length > 0) || needOpenNewPageByTableLayout) {
        // Line height exceeds column height, and there is more than one line in the column, and there is more than one section;
        // console.log('_lineOperator', { glyphGroup, pages, lineHeight, newLineTop, sectionHeight: section.height, lastPage });
        setColumnFullState(column, true);
        _columnOperator(
            ctx,
            glyphGroup,
            pages,
            sectionBreakConfig,
            paragraphConfig,
            isParagraphFirstShapedText,
            breakPointType,
            defaultGlyphLineHeight
        );

        if (isParagraphFirstShapedText && paragraphNonInlineSkeDrawings && paragraphNonInlineSkeDrawings.size > 0) {
            for (const drawing of paragraphNonInlineSkeDrawings.values()) {
                if (lastPage.skeDrawings.has(drawing.drawingId)) {
                    lastPage.skeDrawings.delete(drawing.drawingId);
                }

                if (ctx.floatObjectsCache.has(drawing.drawingId)) {
                    ctx.floatObjectsCache.delete(drawing.drawingId);
                    ctx.isDirty = false;
                    ctx.layoutStartPointer[segmentId] = null;
                }
            }
        }

        return;
    }

    // Line does not exceed column height, or line exceeds column height but there is no other content in the column, or line exceeds page height but there is no other content on the page;
    const lineIndex = preLine ? preLine.lineIndex + 1 : 0;
    let { paddingLeft, paddingRight } = __getIndentPadding(
        indentFirstLine,
        hanging,
        indentStart,
        indentEnd,
        charSpaceApply,
        isParagraphFirstShapedText
    );

    // If the width is insufficient to accommodate the margin, leave 1px width for placeholder.
    if (paddingLeft + paddingRight >= column.width) {
        const leftPercent = paddingLeft / (paddingLeft + paddingRight);
        paddingLeft = column.width * leftPercent - 0.5;
        paddingRight = column.width - paddingLeft - 0.5;
    }

    const newLine = createSkeletonLine(
        paragraphIndex,
        LineType.PARAGRAPH,
        {
            lineHeight,
            contentHeight,
            lineTop: newLineTop,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
            marginTop,
            spaceBelowApply,
        },
        column.width,
        lineIndex,
        isParagraphFirstShapedText,
        paragraphConfig,
        lastPage,
        headerPage,
        footerPage
    );

    column.lines.push(newLine);
    newLine.parent = column;
    const blockAnchorTop = deferredTopBottomAnchorDrawings.length > 0 ? newLineTop : lineTop;
    createAndUpdateBlockAnchor(paragraphIndex, newLine, blockAnchorTop, pDrawingAnchor);
    if (deferredTopBottomAnchorDrawings.length > 0) {
        __updateAndPositionDrawings(ctx, newLineTop, lineHeight, column, deferredTopBottomAnchorDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, blockAnchorTop, paragraphAnchorLeft, true, true);
        __updateTopBottomCustomBlockFlowBottom(paragraphConfig, deferredTopBottomAnchorDrawings);
    }

    _divideOperator(
        ctx,
        glyphGroup,
        pages,
        sectionBreakConfig,
        paragraphConfig,
        isParagraphFirstShapedText,

        breakPointType,
        defaultGlyphLineHeight
    );

    if (deferredInlineGroupAnchorDrawings.length > 0) {
        __updateAndPositionDrawings(ctx, lineTop, lineHeight, column, deferredInlineGroupAnchorDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, pDrawingAnchor?.get(paragraphIndex)?.top, paragraphAnchorLeft, true);
    }
}

function __updateAndPositionDrawings(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    targetDrawings: IDocumentSkeletonDrawing[],
    paragraphIndex: number,
    isParagraphFirstShapedText: boolean,
    drawingAnchorTop?: number,
    drawingAnchorLeft = 0,
    skipRelayoutCheck = false,
    overwriteTopBottomPosition = false
) {
    if (targetDrawings.length === 0) {
        return;
    }

    const drawings = __getDrawingPosition(
        ctx,
        lineTop,
        lineHeight,
        column,
        isParagraphFirstShapedText,
        drawingAnchorTop,
        targetDrawings,
        drawingAnchorLeft
    );

    if (drawings == null || drawings.size === 0) {
        return;
    }

    const floatObjects: IFloatObject[] = [...drawings.values()]
        .filter((drawing) => {
            const layoutType = drawing.drawingOrigin.layoutType;

            return layoutType !== PositionedObjectLayoutType.INLINE && layoutType !== PositionedObjectLayoutType.WRAP_NONE;
        })
        .map((drawing) => {
            const { drawingOrigin, drawingId: id, aTop: top, aLeft: left, width, height, angle } = drawing;
            const positionV = drawingOrigin.docTransform.positionV;

            return {
                id,
                top,
                left,
                width,
                height,
                angle,
                behindDoc: drawingOrigin.behindDoc,
                layoutType: drawingOrigin.layoutType,
                type: FloatObjectType.IMAGE,
                positionV,
            };
        });

    if (!skipRelayoutCheck) {
        _reLayoutCheck(ctx, floatObjects, column, paragraphIndex);
    }

    __updateDrawingPosition(
        column,
        drawings,
        overwriteTopBottomPosition
    );
}

function __updateWrapTablePosition(
    ctx: ILayoutContext,
    table: IDocumentSkeletonTable,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    paragraphIndex: number,
    drawingAnchorTop?: number
) {
    const wrapTablePosition = __getWrapTablePosition(table, column, lineTop, lineHeight, drawingAnchorTop);

    if (wrapTablePosition == null) {
        return;
    }

    const { tableId: id, width, height, tableSource } = table;
    const { left, top } = wrapTablePosition;

    const floatObject: IFloatObject = {
        id,
        top,
        left,
        width,
        height,
        angle: 0,
        type: FloatObjectType.TABLE,
        positionV: tableSource.position.positionV,
    };

    _reLayoutCheck(ctx, [floatObject], column, paragraphIndex);

    table.top = top;
    table.left = left;
}

function __getWrapTablePosition(
    table: IDocumentSkeletonTable,
    column: IDocumentSkeletonColumn,
    lineTop: number,
    lineHeight: number,
    drawingAnchorTop?: number
) {
    const page = column.parent?.parent;
    if (page == null) {
        return;
    }

    const isPageBreak = __checkPageBreak(column);
    const { tableSource, width, height } = table;
    const { positionH, positionV } = tableSource.position;

    const left = getPositionHorizon(positionH, column, page, width, isPageBreak) ?? 0;
    const top = getPositionVertical(
        positionV,
        page,
        lineTop,
        lineHeight,
        height,
        drawingAnchorTop,
        isPageBreak
    ) ?? 0;

    return { left, top };
}

function __avoidFlowAffectingDrawingsForTable(
    table: IDocumentSkeletonTable,
    page: IDocumentSkeletonPage,
    column: IDocumentSkeletonColumn
) {
    const tableTop = table.top;
    const tableBottom = table.top + table.height;
    const tableRight = table.left + table.width;

    for (const drawing of page.skeDrawings.values()) {
        const drawingOrigin = drawing.drawingOrigin;
        if (
            drawingOrigin == null ||
            drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE ||
            drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE ||
            drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        ) {
            continue;
        }

        const drawingTop = drawing.aTop;
        const drawingBottom = drawing.aTop + drawing.height;
        if (drawingTop >= tableBottom || drawingBottom <= tableTop) {
            continue;
        }

        const drawingRight = drawing.aLeft + drawing.width + (drawingOrigin.distR ?? 0);
        if (drawing.aLeft >= tableRight || drawingRight <= table.left) {
            continue;
        }

        if (drawingRight + table.width <= column.width) {
            table.left = Math.max(table.left, drawingRight);
        }
    }
}

function _updateAndPositionTable(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    page: IDocumentSkeletonPage,
    column: IDocumentSkeletonColumn,
    section: IDocumentSkeletonSection,
    skeTablesInParagraph: IParagraphTableCache[],
    paragraphIndex: number,
    sectionBreakConfig: ISectionBreakConfig,
    drawingAnchorTop?: number
): boolean {
    if (skeTablesInParagraph.length === 0) {
        return false;
    }

    // Paragraph will only have one table, but will have multiple table slices.
    const firstUnPositionedTable = skeTablesInParagraph.find((table) => table.hasPositioned === false);

    if (firstUnPositionedTable == null) {
        return false;
    }

    const { tableId, table } = firstUnPositionedTable;
    const { tableSource } = table;

    if (firstUnPositionedTable.isSlideTable === false) {
        switch (tableSource.textWrap) {
            case TableTextWrapType.NONE: {
                table.top = lineTop;
                __avoidFlowAffectingDrawingsForTable(table, page, column);
                break;
            }
            case TableTextWrapType.WRAP: {
                __updateWrapTablePosition(
                    ctx,
                    table,
                    lineTop,
                    lineHeight,
                    column,
                    paragraphIndex,
                    drawingAnchorTop
                );
                break;
            }
            default: {
                throw new Error(`Unsupported table text wrap type: ${tableSource.textWrap}`);
            }
        }
    }

    const { top, left, height } = table;

    if (!ctx.isDirty && top + height > section.height && firstUnPositionedTable.isSlideTable === false) {
        // Need split table.
        skeTablesInParagraph.pop();
        const availableHeight = section.height - top;
        // TODO: handle nested table.
        const { segmentId } = page;
        const viewModel = ctx.viewModel.getSelfOrHeaderFooterViewModel(segmentId);
        const tableNode = firstUnPositionedTable.tableNode;

        rollbackListCache(ctx.skeletonResourceReference.skeListLevel!, tableNode);

        const {
            fromCurrentPage,
            skeTables,
        } = createTableSkeletons(
            ctx,
            page,
            viewModel,
            tableNode,
            sectionBreakConfig,
            availableHeight
        );
        // Reset the position of the first table.
        skeTables.forEach((table, i) => {
            table.top = i === 0 && fromCurrentPage ? top : 0;
            table.left = left;
        });

        if (fromCurrentPage) {
            const firstTable = skeTables.shift()!;

            page.skeTables.set(firstTable.tableId, firstTable);
            firstTable.parent = page;
            skeTablesInParagraph.push({
                table: firstTable,
                tableId: firstTable.tableId,
                hasPositioned: true,
                isSlideTable: true,
                tableNode,

            });
        }

        skeTablesInParagraph.push(...skeTables.map((table) => {
            return {
                table,
                tableId: table.tableId,
                hasPositioned: false,
                isSlideTable: true,
                tableNode,
            };
        }));

        return true;
    } else {
        page.skeTables.set(tableId, table);
        table.parent = page;
        firstUnPositionedTable.hasPositioned = true;

        const isLastTable = firstUnPositionedTable === skeTablesInParagraph[skeTablesInParagraph.length - 1];

        return !isLastTable;
    }
}

function _getCustomBlockIdsInLine(line: IDocumentSkeletonLine) {
    const customBlockIds: string[] = [];

    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                customBlockIds.push(glyph.drawingId!);
            }
        }
    }

    return customBlockIds;
}

function __updateTopBottomCustomBlockFlowBottom(
    paragraphConfig: IParagraphConfig,
    drawings: IDocumentSkeletonDrawing[]
) {
    for (const drawing of drawings) {
        const { drawingOrigin } = drawing;
        if (
            drawingOrigin.layoutType !== PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM ||
            drawingOrigin.behindDoc === BooleanNumber.TRUE
        ) {
            continue;
        }

        const bottom = drawing.aTop + drawing.height + (drawingOrigin.distB ?? 0);
        paragraphConfig.topBottomCustomBlockFlowBottom = Math.max(
            paragraphConfig.topBottomCustomBlockFlowBottom ?? Number.NEGATIVE_INFINITY,
            bottom
        );
    }
}

function __isZeroWidthNonFlowFloatingAnchorLine(
    glyphGroup: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
) {
    return __getZeroWidthNonFlowFloatingAnchorDrawings(glyphGroup, paragraphNonInlineSkeDrawings).length > 0;
}

function __getZeroWidthNonFlowFloatingAnchorDrawings(
    glyphGroup: IDocumentSkeletonGlyph[],
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
) {
    const drawings: IDocumentSkeletonDrawing[] = [];

    for (const glyph of glyphGroup) {
        if (__isStructuralTerminatorGlyph(glyph)) {
            continue;
        }

        if (__isIgnorableZeroSizeGlyph(glyph)) {
            continue;
        }

        if (glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK || glyph.width !== 0 || glyph.drawingId == null) {
            return [];
        }

        const drawing = paragraphNonInlineSkeDrawings?.get(glyph.drawingId);
        const drawingOrigin = drawing?.drawingOrigin;
        if (drawing == null || drawingOrigin == null) {
            return [];
        }

        if (drawingOrigin.layoutType !== PositionedObjectLayoutType.WRAP_NONE) {
            return [];
        }

        drawings.push(drawing);
    }

    return drawings;
}

function __isIgnorableZeroSizeGlyph(glyph: IDocumentSkeletonGlyph) {
    return glyph.content === '' &&
        glyph.drawingId == null &&
        glyph.width === 0 &&
        glyph.bBox.ba + glyph.bBox.bd === 0;
}

function __isStructuralTerminatorGlyph(glyph: IDocumentSkeletonGlyph) {
    return (
        glyph.streamType === DataStreamTreeTokenType.PARAGRAPH ||
        glyph.streamType === DataStreamTreeTokenType.SECTION_BREAK ||
        glyph.streamType === DataStreamTreeTokenType.DOCS_END
    );
}

function __hasFlowGlyph(glyphGroup: IDocumentSkeletonGlyph[]) {
    return glyphGroup.some((glyph) => {
        if (__isStructuralTerminatorGlyph(glyph)) {
            return false;
        }

        if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK) {
            return glyph.width !== 0;
        }

        return glyph.content !== '' || glyph.width > 0 || glyph.bBox.ba + glyph.bBox.bd > 0;
    });
}

function _reLayoutCheck(
    ctx: ILayoutContext,
    floatObjects: IFloatObject[],
    column: IDocumentSkeletonColumn,
    paragraphIndex: number
) {
    const page = column.parent?.parent;
    const flowAffectingFloatObjects = floatObjects.filter((floatObject) =>
        floatObject.behindDoc !== BooleanNumber.TRUE ||
        (
            floatObject.layoutType != null &&
            floatObject.layoutType !== PositionedObjectLayoutType.WRAP_NONE
        )
    );

    if (flowAffectingFloatObjects.length === 0 || page == null) {
        return;
    }

    let needBreakLineIterator = false;

    // Handle situations where an image anchor paragraph is squeezed to the next page.
    for (const floatObject of flowAffectingFloatObjects) {
        const floatObjectCache = ctx.floatObjectsCache.get(floatObject.id);
        if (floatObjectCache == null || floatObjectCache.page.segmentId !== page.segmentId) {
            continue;
        }
        if (floatObjectCache.count >= FLOAT_OBJECT_RELAYOUT_LIMIT) {
            continue;
        }
        // TODO: How to determine if drawing is on the same page???
        const cachePageStartParagraphIndex = floatObjectCache.page.sections[0]?.columns[0]?.lines[0]?.paragraphIndex;
        const startIndex = page.sections[0]?.columns[0]?.lines[0]?.paragraphIndex;

        if (floatObjectCache.page && cachePageStartParagraphIndex && startIndex && cachePageStartParagraphIndex !== startIndex) {
            floatObjectCache.page.skeDrawings.delete(floatObject.id);
            ctx.floatObjectsCache.delete(floatObject.id);

            lineIterator([floatObjectCache.page], (line) => {
                const { lineHeight, top } = line;
                const column = line.parent;

                if (needBreakLineIterator || column == null) {
                    return;
                }

                const { width: columnWidth, left: columnLeft } = column;
                const collision = collisionDetection(floatObjectCache.floatObject, lineHeight, top, columnLeft, columnWidth);
                if (collision) {
                    // No need to loop next line.
                    needBreakLineIterator = true;
                    ctx.isDirty = true;
                    ctx.layoutStartPointer[floatObjectCache.page.segmentId] = Math.min(line.paragraphIndex, ctx.layoutStartPointer[floatObjectCache.page.segmentId] ?? Number.POSITIVE_INFINITY);
                    ctx.paragraphsOpenNewPage.add(paragraphIndex);
                }
            });
        }
    }

    needBreakLineIterator = false;

    lineIterator([page], (line) => {
        const { lineHeight, top } = line;
        const { width: columnWidth, left: columnLeft } = column;

        if (needBreakLineIterator) {
            return;
        }

        for (const floatObject of flowAffectingFloatObjects.values()) {
            let targetObject = floatObject;

            if (ctx.floatObjectsCache.has(floatObject.id)) {
                const drawingCache = ctx.floatObjectsCache.get(floatObject.id);
                const needRePosition = checkRelativeDrawingNeedRePosition(ctx, floatObject);

                if (drawingCache?.page.segmentId !== page.segmentId) {
                    continue;
                }

                if (needRePosition) {
                    targetObject = drawingCache?.floatObject ?? floatObject;
                } else {
                    continue;
                }
            }

            const collision = collisionDetection(targetObject, lineHeight, top, columnLeft, columnWidth);
            if (collision) {
                // No need to loop next line.
                needBreakLineIterator = true;

                ctx.isDirty = true;
                ctx.layoutStartPointer[page.segmentId] = Math.min(line.paragraphIndex, ctx.layoutStartPointer[page.segmentId] ?? Number.POSITIVE_INFINITY);

                let drawingCache = ctx.floatObjectsCache.get(floatObject.id);
                if (drawingCache == null) {
                    drawingCache = {
                        count: 0,
                        floatObject,
                        page,
                    };

                    ctx.floatObjectsCache.set(floatObject.id, drawingCache);
                }

                drawingCache.count++;
                drawingCache.floatObject = floatObject;
                drawingCache.page = page;
            }
        }
    });
}

// Detect the relative positioning of the image, whether the position needs to be repositioned.
function checkRelativeDrawingNeedRePosition(ctx: ILayoutContext, floatObject: IFloatObject) {
    const { relativeFrom } = floatObject.positionV;
    const drawingCache = ctx.floatObjectsCache.get(floatObject.id);

    if (drawingCache == null) {
        return false;
    }

    if (relativeFrom === ObjectRelativeFromV.PARAGRAPH || relativeFrom === ObjectRelativeFromV.LINE) {
        const { count, floatObject: prevObject } = drawingCache;
        // Floating elements can be positioned no more than 5 times,
        // and when the error is within 5 pixels, there is no need to re-layout
        if (count < FLOAT_OBJECT_RELAYOUT_LIMIT && Math.abs(floatObject.top - prevObject.top) > 5) {
            return true;
        }
    }

    return false;
}

export const __testing = {
    reLayoutCheck: _reLayoutCheck,
    avoidFlowAffectingDrawingsForTable: __avoidFlowAffectingDrawingsForTable,
    isGlyphGroupBeyondDivideWidth,
};

function _columnOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const columnIsFull = isColumnFull(lastPage);

    if (columnIsFull === true) {
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanLineHeight);
    } else {
        _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanLineHeight);
    }
}

function _pageOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    isParagraphFirstShapedText: boolean,
    breakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    const curSkeletonPage: IDocumentSkeletonPage = getLastPage(pages);
    const { skeHeaders, skeFooters } = paragraphConfig;

    pages.push(createSkeletonPage(ctx, sectionBreakConfig, { skeHeaders, skeFooters }, curSkeletonPage?.pageNumber + 1));
    _columnOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType, defaultSpanLineHeight);
}

/**
 * 17.3.1.12 ind (Paragraph Indentation)
 */
function __getIndentPadding(
    indentFirstLine: Nullable<INumberUnit>,
    hanging: Nullable<INumberUnit>,
    indentStart: Nullable<INumberUnit>,
    indentEnd: Nullable<INumberUnit>,
    charSpaceApply: number,
    isParagraphFirstShapedText = false
) {
    const indentFirstLineNumber = getNumberUnitValue(indentFirstLine, charSpaceApply);
    const hangingNumber = getNumberUnitValue(hanging, charSpaceApply);
    const indentStartNumber = getNumberUnitValue(indentStart, charSpaceApply);
    const indentEndNumber = getNumberUnitValue(indentEnd, charSpaceApply);

    let paddingLeft = indentStartNumber;
    const paddingRight = indentEndNumber;

    if (indentFirstLineNumber > 0 && isParagraphFirstShapedText) {
        paddingLeft += indentFirstLineNumber;
    }

    if (hangingNumber > 0 && !isParagraphFirstShapedText) {
        paddingLeft += hangingNumber;
    }

    return {
        paddingLeft,
        paddingRight,
    };
}

function __getParagraphSpace(
    ctx: ILayoutContext,
    lineSpacing: number = 0,
    spaceAbove: Nullable<INumberUnit>,
    spaceBelow: Nullable<INumberUnit>,
    isParagraphFirstShapedText: boolean,
    preLine?: IDocumentSkeletonLine
) {
    // Unable to read the paragraph information from the previous line,
    // So add the spaceBelowApply information to each line when creating a new line.
    // `SpaceBelowApply` will not participate in the current line height calculation.
    const spaceBelowApply = getNumberUnitValue(spaceBelow, lineSpacing);

    if (isParagraphFirstShapedText) {
        let marginTop = getNumberUnitValue(spaceAbove, lineSpacing);

        if (preLine) {
            const { spaceBelowApply: preSpaceBelowApply } = preLine;
            if (marginTop < preSpaceBelowApply) {
                const maxValue = Math.max(preSpaceBelowApply, marginTop);
                // spaceBelow and spaceAbove compare the size, the larger one takes effect
                // 17.3.1.33 spacing (Spacing Between Lines and Above/Below Paragraph)
                preLine.lineHeight += maxValue;
                setLineMarginBottom(preLine, maxValue);
                // Remove the marginTop of the current line.
                marginTop = 0;
            }
        }
        return {
            marginTop,
            spaceBelowApply,
        };
    }

    return {
        marginTop: 0,
        spaceBelowApply,
    };
}

function __getParagraphAnchorLeft(
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    indentStart: Nullable<INumberUnit>
) {
    const { paragraphStyle = {} } = paragraphConfig;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    const { gridType = GridType.LINES } = sectionBreakConfig;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const paragraphAnchorLeft = getNumberUnitValue(indentStart, charSpaceApply);

    if (paragraphAnchorLeft > 0) {
        return paragraphAnchorLeft;
    }

    return getNumberUnitValue(paragraphConfig.docxFallbackAnchorLeft, charSpaceApply);
}

export function getLineHeightMetrics(
    glyphLineHeight: number,
    paragraphLineGapDefault: number,
    linePitch: number,
    gridType: GridType,
    lineSpacing: number,
    spacingRule: SpacingRule,
    snapToGrid: BooleanNumber,
    useWordStyleLineHeight = true,
    scaleAutoLineSpacingByGlyphHeight = true
) {
    if (!useWordStyleLineHeight) {
        let paddingTop = paragraphLineGapDefault;
        let paddingBottom = paragraphLineGapDefault;

        if (gridType === GridType.DEFAULT || snapToGrid === BooleanNumber.FALSE) {
            if (spacingRule === SpacingRule.AUTO) {
                return {
                    paddingTop,
                    paddingBottom,
                    contentHeight: lineSpacing * glyphLineHeight,
                    lineSpacingApply: glyphLineHeight,
                };
            }

            return {
                paddingTop,
                paddingBottom,
                contentHeight: Math.max(lineSpacing, glyphLineHeight),
                lineSpacingApply: lineSpacing,
            };
        }

        let lineSpacingApply = 0;
        if (spacingRule === SpacingRule.AUTO) {
            lineSpacingApply = lineSpacing * linePitch;
        } else {
            lineSpacingApply = lineSpacing;
        }

        if (glyphLineHeight + paragraphLineGapDefault * 2 < lineSpacingApply) {
            paddingTop = paddingBottom = (lineSpacingApply - glyphLineHeight) / 2;
        } else {
            lineSpacingApply = glyphLineHeight;
        }

        return {
            paddingTop,
            paddingBottom,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }

    const usesDocumentGrid =
        spacingRule === SpacingRule.AUTO
        && snapToGrid === BooleanNumber.TRUE
        && gridType !== GridType.DEFAULT;

    if (spacingRule === SpacingRule.AUTO) {
        let lineSpacingApply = usesDocumentGrid
            ? lineSpacing * linePitch
            : scaleAutoLineSpacingByGlyphHeight
                ? lineSpacing * glyphLineHeight
                : glyphLineHeight;
        if (
            !usesDocumentGrid
            && scaleAutoLineSpacingByGlyphHeight
            && lineSpacing <= 1.05
            && glyphLineHeight >= 30
        ) {
            lineSpacingApply *= 1.18;
        }
        const padding = (lineSpacingApply - glyphLineHeight) / 2;

        return {
            paddingTop: padding,
            paddingBottom: padding,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }

    if (spacingRule === SpacingRule.AT_LEAST) {
        const lineSpacingApply = Math.max(lineSpacing, glyphLineHeight);
        const padding = (lineSpacingApply - glyphLineHeight) / 2;

        return {
            paddingTop: padding,
            paddingBottom: padding,
            contentHeight: glyphLineHeight,
            lineSpacingApply,
        };
    }

    const exactLineSpacingApply = snapToGrid === BooleanNumber.TRUE && gridType !== GridType.DEFAULT
        ? Math.max(lineSpacing, linePitch)
        : lineSpacing;

    // EXACT follows the requested line box height even when it is smaller than the glyph box.
    // Negative padding lets subsequent lines advance by the exact value, which is closer to Word.
    const exactPadding = (exactLineSpacingApply - glyphLineHeight) / 2;

    return {
        paddingTop: exactPadding,
        paddingBottom: exactPadding,
        contentHeight: glyphLineHeight,
        lineSpacingApply: exactLineSpacingApply,
    };
}

export function updateInlineDrawingPosition(
    line: IDocumentSkeletonLine,
    paragraphInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>,
    unitId = '',
    blockAnchorTop?: number,
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
) {
    const column = line.parent;
    const section = column?.parent;
    const page = line?.parent?.parent?.parent;

    if (page == null || column == null) {
        return;
    }

    const isPageBreak = __checkPageBreak(column);

    const drawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const { top, lineHeight, marginBottom = 0 } = line;
    const sectionTop = section?.top ?? 0;
    const lineTop = sectionTop + top;

    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0) {
                const { drawingId } = glyph;

                if (drawingId == null) {
                    continue;
                }

                const drawing = paragraphInlineSkeDrawings?.get(drawingId);

                const drawingOrigin = drawing?.drawingOrigin;

                if (drawingOrigin == null || drawing == null) {
                    continue;
                }

                const { docTransform } = drawingOrigin;

                const { size, angle } = docTransform;
                const { width = 0, height = 0 } = size;
                const glyphHeight = glyph.bBox.bd + glyph.bBox.ba;
                const glyphLeft = divide.left + divide.paddingLeft + glyph.left;
                const blockLeft = column.left + glyphLeft;
                const viewport = getDocsCustomBlockRenderViewport(unitId, drawingId, {
                    blockLeft,
                    fallbackHeight: height,
                    fallbackWidth: width,
                    pageMarginLeft: page.marginLeft,
                    pageMarginRight: page.marginRight,
                    pageWidth: page.pageWidth,
                });
                const drawingWidth = viewport?.width ?? width;
                const drawingHeight = viewport?.height ?? height;

                drawing.aLeft = viewport
                    ? blockLeft + (viewport.offsetLeft ?? 0)
                    : blockLeft + 0.5 * glyph.width - 0.5 * drawingWidth || 0;
                if (glyph.width > divide.width) {
                    for (const positionedDrawing of paragraphNonInlineSkeDrawings?.values() ?? []) {
                        const positionedOrigin = positionedDrawing.drawingOrigin;
                        if (
                            positionedOrigin == null ||
                            positionedOrigin.layoutType === PositionedObjectLayoutType.INLINE ||
                            positionedOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE ||
                            positionedOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
                        ) {
                            continue;
                        }

                        const positionedBottom = positionedDrawing.aTop + positionedDrawing.height;
                        const lineBottom = lineTop + lineHeight;
                        if (positionedDrawing.aTop >= lineBottom || positionedBottom <= lineTop) {
                            continue;
                        }

                        const positionedRight = positionedDrawing.aLeft + positionedDrawing.width;
                        const drawingRight = drawing.aLeft + drawingWidth;
                        if (positionedDrawing.aLeft < drawingRight && positionedRight > drawing.aLeft) {
                            drawing.aLeft = Math.max(
                                drawing.aLeft,
                                positionedDrawing.aLeft + positionedDrawing.width + (positionedOrigin.distR ?? 0)
                            );
                        }
                    }
                }
                drawing.width = drawingWidth;
                drawing.height = drawingHeight;
                drawing.aTop = lineTop + lineHeight - 0.5 * glyphHeight - 0.5 * drawingHeight - marginBottom;
                drawing.angle = angle;
                drawing.customBlockRenderViewport = viewport
                    ? {
                        bleedLeft: viewport.bleedLeft,
                        bleedWidth: viewport.bleedWidth,
                        contentHeight: viewport.contentHeight,
                        contentWidth: viewport.contentWidth,
                        height: viewport.height,
                        viewportHeight: viewport.viewportHeight,
                    }
                    : undefined;
                drawing.isPageBreak = isPageBreak;
                drawing.lineTop = lineTop;
                drawing.columnLeft = column.left;
                drawing.blockAnchorTop = blockAnchorTop == null ? lineTop : sectionTop + blockAnchorTop;
                drawing.lineHeight = line.lineHeight;

                drawings.set(drawing.drawingId, drawing);
            }
        }
    }
    const res = new Map([...page.skeDrawings, ...drawings]);
    page.skeDrawings = res;
}

function __getDrawingPosition(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    isParagraphFirstShapedText: boolean,
    blockAnchorTop?: number,
    needPositionDrawings: IDocumentSkeletonDrawing[] = [],
    blockAnchorLeft = 0,
    normalizeTraditionalColumnAnchor = true
) {
    const page = column.parent?.parent;
    if (
        page == null ||
        needPositionDrawings.length === 0
    ) {
        return;
    }

    const drawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const isPageBreak = __checkPageBreak(column);

    // TODO: @jocs In paragraph cross-page scenario (one paragraph across two pages), default to placing drawing on the previous page, and do not process drawing on the next page?
    if (isPageBreak && !isParagraphFirstShapedText) {
        return;
    }

    for (const drawing of needPositionDrawings) {
        const { drawingOrigin } = drawing;

        if (!drawingOrigin) {
            continue;
        }

        const { docTransform } = drawingOrigin;
        const { positionH, positionV, size, angle } = docTransform;
        const { width, height } = size;
        const fallbackWidth = width ?? 0;
        const fallbackHeight = height ?? 0;
        const viewport = drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
            ? getDocsCustomBlockRenderViewport(ctx.dataModel.getUnitId?.() ?? '', drawing.drawingId, {
                fallbackHeight,
                fallbackWidth,
                pageMarginLeft: page.marginLeft,
                pageMarginRight: page.marginRight,
                pageWidth: page.pageWidth,
            })
            : null;
        const drawingWidth = viewport?.width ?? fallbackWidth;
        const drawingHeight = viewport?.height ?? fallbackHeight;

        let aLeft = getPositionHorizon(positionH, column, page, drawingWidth, isPageBreak) ?? 0;
        if (
            positionH.relativeFrom === ObjectRelativeFromH.COLUMN &&
            blockAnchorLeft > 0
        ) {
            const renderedColumnOrigin = isPageBreak ? 0 : (column.left || page.marginLeft);
            aLeft += blockAnchorLeft - renderedColumnOrigin;
            if (
                normalizeTraditionalColumnAnchor &&
                ctx.dataModel.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL &&
                positionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH
            ) {
                aLeft -= page.marginLeft;
            }
        }
        drawing.aLeft = aLeft;
        drawing.aTop = getPositionVertical(
            positionV,
            page,
            lineTop,
            lineHeight,
            drawingHeight,
            blockAnchorTop,
            isPageBreak
        ) ?? 0;
        drawing.width = drawingWidth;
        drawing.height = drawingHeight;
        drawing.angle = angle;
        drawing.customBlockRenderViewport = viewport
            ? {
                bleedLeft: viewport.bleedLeft,
                bleedWidth: viewport.bleedWidth,
                contentHeight: viewport.contentHeight,
                contentWidth: viewport.contentWidth,
                height: viewport.height,
                viewportHeight: viewport.viewportHeight,
            }
            : undefined;
        drawing.initialState = true;
        drawing.columnLeft = column.left;
        drawing.lineTop = lineTop;
        drawing.lineHeight = lineHeight;
        drawing.isPageBreak = isPageBreak;
        drawing.blockAnchorTop = blockAnchorTop ?? lineTop;

        drawings.set(drawing.drawingId, drawing);
    }

    return drawings;
}

// Update the absolute position of paragraphNonInlineSkeDrawings, relative to the first line layout of the paragraph
function __updateDrawingPosition(
    column: IDocumentSkeletonColumn,
    drawings?: Map<string, IDocumentSkeletonDrawing>,
    overwriteTopBottomPosition = false
) {
    const page = column.parent?.parent;
    if (drawings == null || drawings.size === 0 || page == null) {
        return;
    }

    for (const drawing of drawings.values()) {
        const originDrawing = page.skeDrawings.get(drawing.drawingId);

        if (originDrawing) {
            // If it's a layout that splits the text up and down,
            // choose an image that is closer to the bottom for the layout.
            if (originDrawing.drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM) {
                if (overwriteTopBottomPosition) {
                    page.skeDrawings.set(drawing.drawingId, drawing);
                } else {
                    const lowerDrawing = originDrawing.aTop > drawing.aTop ? originDrawing : drawing;
                    page.skeDrawings.set(drawing.drawingId, lowerDrawing);
                }
            } else {
                page.skeDrawings.set(drawing.drawingId, drawing);
            }
        } else {
            page.skeDrawings.set(drawing.drawingId, drawing);
        }
    }
}

// Check whether there is a page-spreading scenario, if the line with paragraphStart === true cannot be searched upwards, it means a paragraph is spanning pages
// Cross-page requires pageBreak at critical point
function __checkPageBreak(column: IDocumentSkeletonColumn) {
    const section = column.parent;
    if (!section) {
        return false;
    }
    const columns = section?.columns;

    if (!columns) {
        return false;
    }

    const columnLength = columns.length;
    for (let c = columnLength - 1; c >= 0; c--) {
        const curColumn = columns[c];
        const lines = curColumn.lines;
        const lineLength = lines.length;
        if (lineLength <= 0) {
            continue;
        }
        for (let i = lineLength - 1; i >= 0; i--) {
            const line = lines[i];
            if (line.paragraphStart) {
                return false;
            }
        }
    }

    return true;
}

function __getGlyphGroupWidth(glyphGroup: IDocumentSkeletonGlyph[]) {
    const glyphGroupLen = glyphGroup.length;
    let width = 0;

    for (let i = 0; i < glyphGroupLen; i++) {
        const glyph = glyphGroup[i];
        width += glyph.width;
    }
    return width;
}

function __maxFontBoundingBoxByGlyphGroup(glyphGroup: IDocumentSkeletonGlyph[]) {
    const glyphGroupLen = glyphGroup.length;
    let height = Number.NEGATIVE_INFINITY;
    let maxBox;

    for (let i = 0; i < glyphGroupLen; i++) {
        const glyph = glyphGroup[i];
        const { ba: boundingBoxAscent, bd: boundingBoxDescent } = glyph.bBox;

        if (height < boundingBoxAscent + boundingBoxDescent) {
            maxBox = { boundingBoxAscent, boundingBoxDescent };
        }

        height = boundingBoxAscent + boundingBoxDescent;
    }

    return maxBox;
}

function __getGlyphGroupByLine({ divides }: IDocumentSkeletonLine) {
    return divides.flatMap((divide) => divide.glyphGroup);
}

function __isNullLine(line: IDocumentSkeletonLine) {
    const glyphGroup = __getGlyphGroupByLine(line);

    return glyphGroup.every((glyph) => !glyph.content && !glyph.drawingId);
}
