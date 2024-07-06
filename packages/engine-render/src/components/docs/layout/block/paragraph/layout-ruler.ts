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

import type { INumberUnit } from '@univerjs/core';
import { BooleanNumber, DataStreamTreeTokenType, GridType, ObjectRelativeFromV, PositionedObjectLayoutType, SpacingRule } from '@univerjs/core';
import type {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
} from '../../../../../basics/i-document-skeleton-cached';
import { GlyphType, LineType } from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../../basics/interfaces';
import {
    calculateLineTopByDrawings,
    collisionDetection,
    createAndUpdateBlockAnchor,
    createSkeletonLine,
    updateDivideInfo,
} from '../../model/line';
import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import { addGlyphToDivide, createSkeletonBulletGlyph } from '../../model/glyph';
import type {
    ILayoutContext,
} from '../../tools';
import {
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
    isColumnFull,
    lineIterator,
} from '../../tools';
import { BreakPointType } from '../../line-breaker/break';

export function layoutParagraph(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    breakPointType = BreakPointType.Normal
) {
    if (paragraphStart) {
        // elementIndex === 0 表示段落开始的第一个字符，需要新起一行，与之前的段落区分开
        if (paragraphConfig.bulletSkeleton) {
            const { bulletSkeleton, paragraphStyle = {} } = paragraphConfig;
            // 如果是一个段落的开头，需要加入bullet
            const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 10.5 } = sectionBreakConfig;

            const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);

            const bulletGlyph = createSkeletonBulletGlyph(glyphGroup[0], bulletSkeleton, charSpaceApply);
            _lineOperator(ctx, [bulletGlyph, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType);
        } else {
            _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType);
        }
    } else {
        _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType);
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
            g.content !== DataStreamTreeTokenType.SPACE && g.content !== DataStreamTreeTokenType.PARAGRAPH && g.streamType !== DataStreamTreeTokenType.SECTION_BREAK
        ) {
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
    paragraphStart = false,
    breakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const divideInfo = getLastNotFullDivideInfo(lastPage); // 取得最新一行里内容未满的第一个 divide.

    if (divideInfo) {
        const width = __getGlyphGroupWidth(glyphGroup);
        const { divide, isLast } = divideInfo;
        const lastGlyph = divide?.glyphGroup?.[divide.glyphGroup.length - 1];
        const lastWidth = lastGlyph?.width || 0;
        const lastLeft = lastGlyph?.left || 0;
        const preOffsetLeft = lastWidth + lastLeft;
        const { hyphenationZone } = sectionBreakConfig;

        if (preOffsetLeft + width > divide.width) {
            // width 超过 divide 宽度
            updateDivideInfo(divide, {
                isFull: true,
            });
            const hyphenLineCount = _getConsecutiveHyphenLineCount(divideInfo.divide);
            const { consecutiveHyphenLimit = Number.POSITIVE_INFINITY } = sectionBreakConfig;

            // 处理 word 或者数字串超过 divide width 的情况，主要分两种情况
            // 1. 以段落符号结尾时候，即使超过 divide 宽度，也需要将换行符追加到 divide 结尾。
            // 2. 空行中，英文单词或者连续数字超过 divide 宽度的情况，将把英文单词、数字串拆分，一部分追加到上一行，剩下的放在新的一行中，
            // 有个边界 case，就是一个英文字符宽度超过 divide 宽度，这个时候也需要把这个字符追加到上一行中。
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
            } else if (divide?.glyphGroup.length === 0) {
                const sliceGlyphGroup: IDocumentSkeletonGlyph[] = [];

                while (glyphGroup.length) {
                    sliceGlyphGroup.push(glyphGroup.shift()!);

                    const sliceGlyphGroupWidth = __getGlyphGroupWidth(sliceGlyphGroup);
                    if (sliceGlyphGroupWidth > divide.width) {
                        // To avoid infinity loop when width is less than one char's width.
                        if (sliceGlyphGroup.length > 1) {
                            glyphGroup.unshift(sliceGlyphGroup.pop()!);
                        }
                        break;
                    }
                }

                addGlyphToDivide(divide, sliceGlyphGroup, preOffsetLeft);

                if (glyphGroup.length) {
                    _divideOperator(
                        ctx,
                        glyphGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        paragraphStart,
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

                    _divideOperator(ctx, hyphenSliceGlyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, BreakPointType.Hyphen);
                }

                _divideOperator(
                    ctx,
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    paragraphStart,
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
                    paragraphStart,
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
                paragraphStart,
                breakPointType,
                defaultSpanLineHeight
            );
        } else {
            // w 不超过 divide 宽度，加入到 divide 中去
            const currentLine = divide.parent;
            const maxBox = __maxFontBoundingBoxByGlyphGroup(glyphGroup);

            if (currentLine && maxBox && !__isNullLine(currentLine)) {
                const { paragraphLineGapDefault, linePitch, lineSpacing, spacingRule, snapToGrid, gridType } =
                    getLineHeightConfig(sectionBreakConfig, paragraphConfig);
                const { boundingBoxAscent, boundingBoxDescent } = maxBox;
                const spanLineHeight = boundingBoxAscent + boundingBoxDescent;
                const { contentHeight } = __getLineHeight(
                    spanLineHeight,
                    paragraphLineGapDefault,
                    linePitch,
                    gridType,
                    lineSpacing,
                    spacingRule,
                    snapToGrid
                );

                if (currentLine.contentHeight < contentHeight) {
                    // 如果新内容的高度超过其加入行的高度，为了处理图文混排，整行都需要按照新高度重新计算
                    // If the height of the new content exceeds the height of the added row,
                    // the entire row needs to be recalculated according to the new height
                    // in order to handle the mixing of graphics and text
                    const spanGroupCached = __getSpanGroupByLine(currentLine);
                    const spanGroupCachedLen = spanGroupCached.length;
                    let newSpanGroup = [];
                    let startIndex = 1;

                    if (spanGroupCachedLen > 2 && spanGroupCached[0].glyphType === GlyphType.LIST) {
                        newSpanGroup = [spanGroupCached[0], spanGroupCached[1]];
                        startIndex = 2;
                    } else {
                        newSpanGroup = [spanGroupCached[0]];
                    }
                    const column = currentLine.parent;

                    // eslint-disable-next-line ts/no-non-null-asserted-optional-chain
                    const { paragraphStart: lineIsStart } = column?.lines.pop()!; // Delete the previous line and recalculate according to the maximum content height

                    _lineOperator(
                        ctx,
                        newSpanGroup,
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
                            paragraphStart
                        );
                    }

                    _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType);

                    return;
                }
            }

            addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
            updateDivideInfo(divide, { breakType: breakPointType });
        }
    } else {
        _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType, defaultSpanLineHeight);
    }
}

function _lineOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    breakPointType: BreakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    let lastPage = getLastPage(pages);
    let columnInfo = getLastNotFullColumnInfo(lastPage);
    if (!columnInfo || !columnInfo.column) {
        // 如果列不存在，则做一个兜底策略，新增一页。
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, undefined, breakPointType);
        lastPage = getLastPage(pages);
        columnInfo = getLastNotFullColumnInfo(lastPage);
    }
    // Todo: demo4导入的时候columnInfo会不存在,先return了
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
    const spanLineHeight = defaultSpanLineHeight || ascent + descent;

    const {
        paragraphStyle = {},
        paragraphAffectSkeDrawings,
        skeHeaders,
        skeFooters,
        drawingAnchor,
        paragraphIndex,
    } = paragraphConfig;

    const {
        // namedStyleType = NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED,
        // horizontalAlign = HorizontalAlign.UNSPECIFIED,

        // direction,
        spaceAbove = 0,
        spaceBelow = 0,

        // borderBetween,
        // borderTop,
        // borderBottom,
        // borderLeft,
        // borderRight,

        indentFirstLine = 0,
        hanging = 0,
        indentStart = 0,
        indentEnd = 0,
        // tabStops = [],

        // keepLines = BooleanNumber.FALSE,
        // keepNext = BooleanNumber.FALSE,
        // wordWrap = BooleanNumber.FALSE,
        // widowControl = BooleanNumber.FALSE,
        // shading,
    } = paragraphStyle;

    const { paragraphLineGapDefault, linePitch, lineSpacing, spacingRule, snapToGrid, gridType } = getLineHeightConfig(
        sectionBreakConfig,
        paragraphConfig
    );

    const { paddingTop, paddingBottom, contentHeight, lineSpacingApply } = __getLineHeight(
        spanLineHeight,
        paragraphLineGapDefault,
        linePitch,
        gridType,
        lineSpacing,
        spacingRule,
        snapToGrid
    );

    const { marginTop, spaceBelowApply } = __getParagraphSpace(
        lineSpacingApply,
        spaceAbove,
        spaceBelow,
        paragraphStart,
        preLine
    );

    const lineHeight = marginTop + paddingTop + contentHeight + paddingBottom;

    let section = column.parent;
    if (!section) {
        // 做一个兜底，指向当前页最后一个section
        section = getLastSection(lastPage);
    }
    const preLineHeight = preLine?.lineHeight || 0;
    const preTop = preLine?.top || 0;
    const lineTop = preLineHeight + preTop;

    const { pageWidth, headerId, footerId } = lastPage;
    const headersDrawings = skeHeaders?.get(headerId)?.get(pageWidth)?.skeDrawings;
    const footersDrawings = skeFooters?.get(footerId)?.get(pageWidth)?.skeDrawings;

    // Handle float object relative to line.
    // FIXME: @jocs, it will not update the last line's drawings.
    if (preLine) {
        const drawingsInLine = _getCustomBlockIdsInLine(preLine);
        if (drawingsInLine.length > 0) {
            const affectDrawings = ctx.paragraphConfigCache.get(preLine.paragraphIndex)?.paragraphAffectSkeDrawings;
            const relativeLineDrawings = ([...(affectDrawings?.values() ?? [])])
                .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom === ObjectRelativeFromV.LINE)
                .filter((drawing) => drawingsInLine.includes(drawing.drawingId));

            if (relativeLineDrawings.length > 0) {
                __updateAndPositionDrawings(ctx, preLine.top, preLine.lineHeight, column, relativeLineDrawings, preLine.paragraphIndex, paragraphStart);
            }
        }
    }

    if (paragraphAffectSkeDrawings != null && paragraphAffectSkeDrawings.size > 0) {
        const targetDrawings = [...paragraphAffectSkeDrawings.values()]
            .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom !== ObjectRelativeFromV.LINE);

        __updateAndPositionDrawings(ctx, lineTop, lineHeight, column, targetDrawings, paragraphConfig.paragraphIndex, paragraphStart, drawingAnchor?.get(paragraphIndex)?.top);
    }

    const newLineTop = calculateLineTopByDrawings(
        lineHeight,
        lineTop,
        lastPage.skeDrawings,
        headersDrawings,
        footersDrawings
    ); // WRAP_TOP_AND_BOTTOM 的 drawing 会改变行的起始 top

    if (lineHeight + newLineTop > section.height && column.lines.length > 0 && lastPage.sections.length > 0) {
        // 行高超过Col高度，且列中已存在一行以上，且section大于一个；
        // console.log('_lineOperator', { glyphGroup, pages, lineHeight, newLineTop, sectionHeight: section.height, lastPage });
        setColumnFullState(column, true);
        _columnOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType, defaultSpanLineHeight);

        if (paragraphStart && paragraphAffectSkeDrawings && paragraphAffectSkeDrawings.size > 0) {
            for (const drawing of paragraphAffectSkeDrawings.values()) {
                if (lastPage.skeDrawings.has(drawing.drawingId)) {
                    lastPage.skeDrawings.delete(drawing.drawingId);
                }

                if (ctx.drawingsCache.has(drawing.drawingId)) {
                    ctx.drawingsCache.delete(drawing.drawingId);
                    ctx.isDirty = false;
                    ctx.layoutStartPointer.paragraphIndex = null;
                }
            }
        }

        return;
    }

    // line不超过Col高度，或者行超列高列中没有其他内容，或者行超页高页中没有其他内容；
    const lineIndex = preLine ? preLine.lineIndex + 1 : 0;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const { paddingLeft, paddingRight } = __getIndentPadding(
        indentFirstLine,
        hanging,
        indentStart,
        indentEnd,
        charSpaceApply,
        paragraphStart
    );

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
        paragraphStart,
        lastPage.skeDrawings,
        headersDrawings,
        footersDrawings
    );

    column.lines.push(newLine);
    newLine.parent = column;
    createAndUpdateBlockAnchor(paragraphIndex, newLine, lineTop, drawingAnchor);
    _divideOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType, defaultSpanLineHeight);
}

function __updateAndPositionDrawings(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    targetDrawings: IDocumentSkeletonDrawing[],
    paragraphIndex: number,
    paragraphStart: boolean,
    drawingAnchorTop?: number
) {
    if (targetDrawings.length === 0) {
        return;
    }

    const drawings = __getDrawingPosition(
        lineTop,
        lineHeight,
        column,
        paragraphStart,
        drawingAnchorTop,
        targetDrawings
    );

    if (drawings == null || drawings.size === 0) {
        return;
    }

    _reLayoutCheck(ctx, drawings, column, paragraphIndex);

    __updateDrawingPosition(
        column,
        drawings
    );
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

function _reLayoutCheck(
    ctx: ILayoutContext,
    drawings: Map<string, IDocumentSkeletonDrawing>,
    column: IDocumentSkeletonColumn,
    paragraphIndex: number
) {
    const page = column.parent?.parent;
    const needUpdatedDrawings = new Map([...drawings]);

    if (drawings.size === 0 || page == null) {
        return drawings;
    }

    let needBreakLineIterator = false;

    // Handle situations where an image anchor paragraph is squeezed to the next page.
    for (const drawing of drawings.values()) {
        const drawingCache = ctx.drawingsCache.get(drawing.drawingId);
        if (drawingCache == null) {
            continue;
        }
        // TODO: 如何判断 drawing 是否在同一页？？？
        const cachePageStartParagraphIndex = drawingCache.page.sections[0]?.columns[0]?.lines[0]?.paragraphIndex;
        const startIndex = page.sections[0]?.columns[0]?.lines[0]?.paragraphIndex;
        if (drawingCache.page && cachePageStartParagraphIndex && startIndex && cachePageStartParagraphIndex !== startIndex) {
            drawingCache.page.skeDrawings.delete(drawing.drawingId);
            // console.log(paragraphIndex);
            // console.log('cache page: ', cachePageStartParagraphIndex, 'page', startIndex);

            lineIterator([drawingCache.page], (line) => {
                const { lineHeight, top } = line;
                const column = line.parent;

                if (needBreakLineIterator || column == null) {
                    return;
                }

                const { width: columnWidth, left: columnLeft } = column;
                const collision = collisionDetection(drawingCache.drawing, lineHeight, top, columnLeft, columnWidth);
                if (collision) {
                    // No need to loop next line.
                    needBreakLineIterator = true;
                    ctx.isDirty = true;
                    ctx.layoutStartPointer.paragraphIndex = Math.min(line.paragraphIndex, ctx.layoutStartPointer.paragraphIndex ?? Number.POSITIVE_INFINITY);
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

        for (const drawing of drawings.values()) {
            let targetDrawing = drawing;

            if (ctx.drawingsCache.has(drawing.drawingId)) {
                const needRePosition = checkRelativeDrawingNeedRePosition(ctx, drawing);

                if (needRePosition) {
                    targetDrawing = ctx.drawingsCache.get(drawing.drawingId)?.drawing ?? drawing;
                } else {
                    continue;
                }
            }

            const collision = collisionDetection(targetDrawing, lineHeight, top, columnLeft, columnWidth);
            if (collision) {
                // console.log(page, line.top + line.lineHeight, line.divides[0].glyphGroup[0].content);
                // console.log('drawing: ', targetDrawing, 'lineHeight: ', lineHeight, 'top: ', top, 'width: ', width);
                // No need to loop next line.
                needBreakLineIterator = true;

                ctx.isDirty = true;
                ctx.layoutStartPointer.paragraphIndex = Math.min(line.paragraphIndex, ctx.layoutStartPointer.paragraphIndex ?? Number.POSITIVE_INFINITY);

                let drawingCache = ctx.drawingsCache.get(drawing.drawingId);
                if (drawingCache == null) {
                    drawingCache = {
                        count: 0,
                        drawing,
                        page,
                    };

                    ctx.drawingsCache.set(drawing.drawingId, drawingCache);
                }

                drawingCache.count++;
                drawingCache.drawing = drawing;
                drawingCache.page = page;
            }
        }
    });

    return needUpdatedDrawings;
}

// Detect the relative positioning of the image, whether the position needs to be repositioned.
function checkRelativeDrawingNeedRePosition(ctx: ILayoutContext, drawing: IDocumentSkeletonDrawing) {
    const { relativeFrom } = drawing.drawingOrigin.docTransform.positionV;
    const drawingCache = ctx.drawingsCache.get(drawing.drawingId);

    if (drawingCache == null) {
        return false;
    }

    if (relativeFrom === ObjectRelativeFromV.PARAGRAPH || relativeFrom === ObjectRelativeFromV.LINE) {
        const { count, drawing: prevDrawing } = drawingCache;
        // Floating elements can be positioned no more than 5 times,
        // and when the error is within 5 pixels, there is no need to re-layout
        if (count < 5 && Math.abs(drawing.aTop - prevDrawing.aTop) > 5) {
            return true;
        }
    }

    return false;
}

function _columnOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    breakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const columnIsFull = isColumnFull(lastPage);

    if (columnIsFull === true) {
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType, defaultSpanLineHeight);
    } else {
        _lineOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType, defaultSpanLineHeight);
    }
}

function _pageOperator(
    ctx: ILayoutContext,
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    breakPointType = BreakPointType.Normal,
    defaultSpanLineHeight?: number
) {
    const curSkeletonPage: IDocumentSkeletonPage = getLastPage(pages);
    const { skeHeaders, skeFooters } = paragraphConfig;

    pages.push(createSkeletonPage(ctx, sectionBreakConfig, { skeHeaders, skeFooters }, curSkeletonPage?.pageNumber + 1));
    _columnOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, breakPointType, defaultSpanLineHeight);
}

/**
 * 17.3.1.12 ind (Paragraph Indentation)
 */
function __getIndentPadding(
    indentFirstLine: INumberUnit | number = 0,
    hanging: INumberUnit | number = 0,
    indentStart: INumberUnit | number = 0,
    indentEnd: INumberUnit | number = 0,
    charSpaceApply: number,
    paragraphStart = false
) {
    const indentFirstLineNumber = getNumberUnitValue(indentFirstLine, charSpaceApply);
    const hangingNumber = getNumberUnitValue(hanging, charSpaceApply);
    const indentStartNumber = getNumberUnitValue(indentStart, charSpaceApply);
    const indentEndNumber = getNumberUnitValue(indentEnd, charSpaceApply);

    let paddingLeft = indentStartNumber;
    const paddingRight = indentEndNumber;

    if (indentFirstLineNumber > 0 && paragraphStart) {
        paddingLeft += indentFirstLineNumber;
    }

    if (hangingNumber > 0 && !paragraphStart) {
        paddingLeft += hangingNumber;
    }

    return {
        paddingLeft,
        paddingRight,
    };
}

function __getParagraphSpace(
    lineSpacing: number = 0,
    spaceAbove: INumberUnit | number = 0,
    spaceBelow: INumberUnit | number = 0,
    paragraphStart: boolean,
    preLine?: IDocumentSkeletonLine
) {
    let marginTop = 0;
    let spaceBelowApply = 0;
    if (!paragraphStart) {
        return {
            marginTop,
            spaceBelowApply,
        };
    }

    marginTop = getNumberUnitValue(spaceAbove, lineSpacing);
    spaceBelowApply = getNumberUnitValue(spaceBelow, lineSpacing);

    if (preLine) {
        const { spaceBelowApply: PreSpaceBelowApply } = preLine;
        if (PreSpaceBelowApply > marginTop) {
            // spaceBelow and spaceAbove compare the size, the larger one takes effect
            // 17.3.1.33 spacing (Spacing Between Lines and Above/Below Paragraph)
            marginTop = 0;
            preLine.lineHeight += PreSpaceBelowApply;
            preLine.marginBottom = PreSpaceBelowApply;
        }
        // else {
        //     marginTop -= PreSpaceBelowApply;
        // }
    }

    return {
        marginTop,
        spaceBelowApply,
    };
}

function __makeColumnsFull(columns: IDocumentSkeletonColumn[] = []) {
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];

        setColumnFullState(column, true);
    }
}

function __getLineHeight(
    spanLineHeight: number,
    paragraphLineGapDefault: number,
    linePitch: number,
    gridType: GridType,
    lineSpacing: number,
    spacingRule: SpacingRule,
    snapToGrid: BooleanNumber
) {
    let paddingTop = paragraphLineGapDefault;
    let paddingBottom = paragraphLineGapDefault;

    if (gridType === GridType.DEFAULT || snapToGrid === BooleanNumber.FALSE) {
        // 不应用doc grid网格的场景，根据字符高度和宽度决定布局
        if (spacingRule === SpacingRule.AUTO) {
            // auto的情况下，lineSpacing代表行数
            return {
                paddingTop,
                paddingBottom,
                contentHeight: lineSpacing * spanLineHeight,
                lineSpacingApply: spanLineHeight,
            };
        }

        return {
            paddingTop,
            paddingBottom,
            contentHeight: Math.max(lineSpacing, spanLineHeight),
            lineSpacingApply: lineSpacing,
        };
    }

    // open xml $17.18.14 ST_DocGrid (Document Grid Types)
    let lineSpacingApply = 0;
    if (spacingRule === SpacingRule.AUTO) {
        // auto的情况下，lineSpacing代表行数
        lineSpacingApply = lineSpacing * linePitch;
    } else {
        lineSpacingApply = lineSpacing;
    }

    if (spanLineHeight + paragraphLineGapDefault * 2 < lineSpacingApply) {
        paddingTop = paddingBottom = (lineSpacingApply - spanLineHeight) / 2;
    }

    return {
        paddingTop,
        paddingBottom,
        contentHeight: spanLineHeight,
        lineSpacingApply,
    };
}

export function updateInlineDrawingPosition(
    line: IDocumentSkeletonLine,
    paragraphInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>,
    blockAnchorTop?: number
) {
    const column = line.parent;
    const page = line?.parent?.parent?.parent;

    if (page == null || column == null) {
        return;
    }

    const isPageBreak = __checkPageBreak(column);

    const drawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const { top, lineHeight } = line;

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

                drawing.aLeft = divide.left + glyph.left + 0.5 * glyph.width - 0.5 * width || 0;
                drawing.aTop = top + lineHeight - 0.5 * glyphHeight - 0.5 * height || 0;
                drawing.width = width;
                drawing.height = height;
                drawing.angle = angle;
                drawing.isPageBreak = isPageBreak;
                drawing.lineTop = top;
                drawing.columnLeft = column.left;
                drawing.blockAnchorTop = blockAnchorTop ?? top;
                drawing.lineHeight = line.lineHeight;

                drawings.set(drawing.drawingId, drawing);
            }
        }
    }

    page.skeDrawings = new Map([...page.skeDrawings, ...drawings]);
}

function __getDrawingPosition(
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    paragraphStart: boolean,
    blockAnchorTop?: number,
    needPositionDrawings: IDocumentSkeletonDrawing[] = []
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

    // TODO: @jocs 在段落跨页场景(一个段落在两页)，默认将 drawing 放到上一页，下一页不处理 drawing?
    if (isPageBreak && !paragraphStart) {
        return;
    }

    for (const drawing of needPositionDrawings) {
        const { drawingOrigin } = drawing;

        if (!drawingOrigin) {
            continue;
        }

        const { docTransform } = drawingOrigin;
        const { positionH, positionV, size, angle } = docTransform;
        const { width = 0, height = 0 } = size;

        drawing.aLeft = getPositionHorizon(positionH, column, page, width, isPageBreak) ?? 0;
        drawing.aTop = getPositionVertical(
            positionV, page, lineTop, lineHeight, height, blockAnchorTop, isPageBreak
        ) ?? 0;
        drawing.width = width;
        drawing.height = height;
        drawing.angle = angle;
        drawing.initialState = true;
        drawing.columnLeft = column.left;
        drawing.lineTop = lineTop;
        drawing.lineHeight = lineHeight;
        drawing.isPageBreak = isPageBreak;
        drawing.blockAnchorTop = blockAnchorTop ?? lineTop;

        drawings.set(drawing.drawingId, drawing);
    }

    // if (drawings.size) {
    //     console.log(`lineTop: ${lineTop}, blockAnchorTop: ${blockAnchorTop}`, drawings);
    // }

    return drawings;
}

// 更新 paragraphAffectSkeDrawings 的绝对位置，相对于段落的第一行布局
function __updateDrawingPosition(
    column: IDocumentSkeletonColumn,
    drawings?: Map<string, IDocumentSkeletonDrawing>
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
                const lowerDrawing = originDrawing.aTop > drawing.aTop ? originDrawing : drawing;
                page.skeDrawings.set(drawing.drawingId, lowerDrawing);
            } else {
                page.skeDrawings.set(drawing.drawingId, drawing);
            }
        } else {
            page.skeDrawings.set(drawing.drawingId, drawing);
        }
    }
}

// 检查是否跨页的场景，如果向上搜索不到paragraphStart === true 的行，则代表一个段落跨页了
// 跨页需要在临界点进行pageBreak
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

function __getSpanGroupByLine({ divides }: IDocumentSkeletonLine) {
    return divides.flatMap((divide) => divide.glyphGroup);
}

function __isNullLine(line: IDocumentSkeletonLine) {
    return !line.divides[0].glyphGroup[0];
}
