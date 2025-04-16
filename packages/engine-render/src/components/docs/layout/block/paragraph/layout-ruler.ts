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

import type { INumberUnit, IParagraphProperties, IParagraphStyle, Nullable } from '@univerjs/core';
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
import { BooleanNumber, DataStreamTreeTokenType, GridType, NAMED_STYLE_SPACE_MAP, ObjectRelativeFromV, PositionedObjectLayoutType, SpacingRule, TableTextWrapType } from '@univerjs/core';
import { GlyphType, LineType } from '../../../../../basics/i-document-skeleton-cached';
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
    isColumnFull,
    lineIterator,
    mergeByV,
} from '../../tools';
import { createTableSkeletons, rollbackListCache } from '../table';

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
        // elementIndex === 0 表示段落开始的第一个字符，需要新起一行，与之前的段落区分开
        if (paragraphConfig.bulletSkeleton) {
            const { bulletSkeleton, paragraphStyle = {} } = paragraphConfig;
            // 如果是一个段落的开头，需要加入bullet
            const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 10.5 } = sectionBreakConfig;

            const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
            const bulletGlyph = createSkeletonBulletGlyph(glyphGroup[0], bulletSkeleton, charSpaceApply);
            const paragraphProperties = bulletSkeleton.paragraphProperties || {};

            paragraphConfig.paragraphStyle = mergeByV<IParagraphStyle>(paragraphConfig.paragraphStyle, { ...paragraphProperties, hanging: { v: bulletGlyph.width } } as IParagraphProperties, 'max');

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
    isParagraphFirstShapedText: boolean,
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
                    const column = currentLine.parent;

                    // eslint-disable-next-line ts/no-non-null-asserted-optional-chain
                    const { paragraphStart: lineIsStart } = column?.lines.pop()!; // Delete the previous line and recalculate according to the maximum content height

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
        // 如果列不存在，则做一个兜底策略，新增一页。
        _pageOperator(ctx, glyphGroup, pages, sectionBreakConfig, paragraphConfig, true, breakPointType);
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

    const { paddingTop, paddingBottom, contentHeight, lineSpacingApply } = __getLineHeight(
        glyphLineHeight,
        paragraphLineGapDefault,
        linePitch,
        gridType,
        lineSpacing,
        spacingRule,
        snapToGrid
    );

    const { marginTop, spaceBelowApply } = __getParagraphSpace(
        ctx,
        lineSpacingApply,
        spaceAbove,
        spaceBelow,
        isParagraphFirstShapedText,
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

    if (paragraphNonInlineSkeDrawings != null && paragraphNonInlineSkeDrawings.size > 0) {
        const targetDrawings = [...paragraphNonInlineSkeDrawings.values()]
            .filter((drawing) => drawing.drawingOrigin.docTransform.positionV.relativeFrom !== ObjectRelativeFromV.LINE);

        __updateAndPositionDrawings(ctx, lineTop, lineHeight, column, targetDrawings, paragraphConfig.paragraphIndex, isParagraphFirstShapedText, pDrawingAnchor?.get(paragraphIndex)?.top);
    }

    if (skeTablesInParagraph != null && skeTablesInParagraph.length > 0) {
        needOpenNewPageByTableLayout = _updateAndPositionTable(ctx, lineTop, lineHeight, lastPage, column, section, skeTablesInParagraph, paragraphConfig.paragraphIndex, sectionBreakConfig, pDrawingAnchor?.get(paragraphIndex)?.top);
    }

    const newLineTop = calculateLineTopByDrawings(
        lineHeight,
        lineTop,
        lastPage,
        headerPage,
        footerPage
    ); // WRAP_TOP_AND_BOTTOM 的 drawing 和 WRAP NONE 的 table 会改变行的起始 top

    if ((lineHeight + newLineTop > section.height && column.lines.length > 0 && lastPage.sections.length > 0) || needOpenNewPageByTableLayout) {
        // 行高超过Col高度，且列中已存在一行以上，且section大于一个；
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

    // line不超过Col高度，或者行超列高列中没有其他内容，或者行超页高页中没有其他内容；
    const lineIndex = preLine ? preLine.lineIndex + 1 : 0;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    let { paddingLeft, paddingRight } = __getIndentPadding(
        indentFirstLine,
        hanging,
        indentStart,
        indentEnd,
        charSpaceApply,
        isParagraphFirstShapedText
    );

    // 如果宽度不足以容纳边距,这里留 1px 的宽度进行占位.
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
    createAndUpdateBlockAnchor(paragraphIndex, newLine, lineTop, pDrawingAnchor);
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
}

function __updateAndPositionDrawings(
    ctx: ILayoutContext,
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    targetDrawings: IDocumentSkeletonDrawing[],
    paragraphIndex: number,
    isParagraphFirstShapedText: boolean,
    drawingAnchorTop?: number
) {
    if (targetDrawings.length === 0) {
        return;
    }

    const drawings = __getDrawingPosition(
        lineTop,
        lineHeight,
        column,
        isParagraphFirstShapedText,
        drawingAnchorTop,
        targetDrawings
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
                type: FloatObjectType.IMAGE,
                positionV,
            };
        });

    _reLayoutCheck(ctx, floatObjects, column, paragraphIndex);

    __updateDrawingPosition(
        column,
        drawings
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

function _reLayoutCheck(
    ctx: ILayoutContext,
    floatObjects: IFloatObject[],
    column: IDocumentSkeletonColumn,
    paragraphIndex: number
) {
    const page = column.parent?.parent;

    if (floatObjects.length === 0 || page == null) {
        return;
    }

    let needBreakLineIterator = false;

    // Handle situations where an image anchor paragraph is squeezed to the next page.
    for (const floatObject of floatObjects) {
        const floatObjectCache = ctx.floatObjectsCache.get(floatObject.id);
        if (floatObjectCache == null || floatObjectCache.page.segmentId !== page.segmentId) {
            continue;
        }
        // TODO: 如何判断 drawing 是否在同一页？？？
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

        for (const floatObject of floatObjects.values()) {
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
        if (count < 5 && Math.abs(floatObject.top - prevObject.top) > 5) {
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

function __getLineHeight(
    glyphLineHeight: number,
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

    // open xml $17.18.14 ST_DocGrid (Document Grid Types)
    let lineSpacingApply = 0;
    if (spacingRule === SpacingRule.AUTO) {
        // auto 的情况下，lineSpacing代表行数
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
    const { top, lineHeight, marginBottom = 0 } = line;

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

                drawing.aLeft = divide.left + divide.paddingLeft + glyph.left + 0.5 * glyph.width - 0.5 * width || 0;
                drawing.aTop = top + lineHeight - 0.5 * glyphHeight - 0.5 * height - marginBottom;
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
    const res = new Map([...page.skeDrawings, ...drawings]);
    page.skeDrawings = res;
}

function __getDrawingPosition(
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    isParagraphFirstShapedText: boolean,
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
        const { width = 0, height = 0 } = size;

        drawing.aLeft = getPositionHorizon(positionH, column, page, width, isPageBreak) ?? 0;
        drawing.aTop = getPositionVertical(
            positionV,
            page,
            lineTop,
            lineHeight,
            height,
            blockAnchorTop,
            isPageBreak
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

    return drawings;
}

// 更新 paragraphNonInlineSkeDrawings 的绝对位置，相对于段落的第一行布局
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

function __getGlyphGroupByLine({ divides }: IDocumentSkeletonLine) {
    return divides.flatMap((divide) => divide.glyphGroup);
}

function __isNullLine(line: IDocumentSkeletonLine) {
    return !line.divides[0].glyphGroup[0];
}
