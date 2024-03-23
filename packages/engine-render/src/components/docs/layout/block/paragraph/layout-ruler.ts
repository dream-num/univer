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

import type { INumberUnit, IParagraphStyle } from '@univerjs/core';
import { BooleanNumber, DataStreamTreeTokenType, GridType, SpacingRule } from '@univerjs/core';

import type {
    IDocumentSkeletonBullet,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
} from '../../../../../basics/i-document-skeleton-cached';
import { GlyphType, LineType } from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../../basics/interfaces';
import {
    calculateLineTopByDrawings,
    createAndUpdateBlockAnchor,
    createSkeletonLine,
    setDivideFullState,
} from '../../model/line';

import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import { addGlyphToDivide, createSkeletonBulletGlyph } from '../../model/glyph';
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
} from '../../tools';

export function layoutParagraph(
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false
) {
    if (paragraphStart) {
        // elementIndex === 0 表示段落开始的第一个字符，需要新起一行，与之前的段落区分开
        if (paragraphConfig.bulletSkeleton) {
            const { bulletSkeleton, paragraphStyle = {} } = paragraphConfig;
            // 如果是一个段落的开头，需要加入bullet
            const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 1 } = sectionBreakConfig;

            const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);

            __bulletIndentHandler(paragraphStyle, bulletSkeleton, charSpaceApply);

            const bulletGlyph = createSkeletonBulletGlyph(glyphGroup[0], bulletSkeleton, charSpaceApply);
            _lineOperator([bulletGlyph, ...glyphGroup], pages, sectionBreakConfig, paragraphConfig, paragraphStart);
        } else {
            _lineOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart);
        }
    } else {
        _divideOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart);
    }

    return [...pages];
}

function _divideOperator(
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart = false,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const divideInfo = getLastNotFullDivideInfo(lastPage); // 取得最新一行里内容未满的第一个 divide.

    if (divideInfo) {
        const width = __getSpanGroupWidth(glyphGroup);
        const { divide } = divideInfo;
        const lastGlyph = divide?.glyphGroup?.[divide.glyphGroup.length - 1];
        const lastWidth = lastGlyph?.width || 0;
        const lastLeft = lastGlyph?.left || 0;
        const preOffsetLeft = lastWidth + lastLeft;

        if (preOffsetLeft + width > divide.width) {
            // width 超过 divide 宽度
            setDivideFullState(divide, true);
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
            } else if (divide?.glyphGroup.length === 0) {
                const sliceSpanGroup: IDocumentSkeletonGlyph[] = [];

                while (glyphGroup.length) {
                    sliceSpanGroup.push(glyphGroup.shift()!);

                    const sliceSpanGroupWidth = __getSpanGroupWidth(sliceSpanGroup);
                    if (sliceSpanGroupWidth > divide.width) {
                        break;
                    }
                }

                addGlyphToDivide(divide, sliceSpanGroup, preOffsetLeft);

                if (glyphGroup.length) {
                    _lineOperator(
                        glyphGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        paragraphStart,
                        defaultSpanLineHeight
                    );
                }
            } else {
                _lineOperator(
                    glyphGroup,
                    pages,
                    sectionBreakConfig,
                    paragraphConfig,
                    paragraphStart,
                    defaultSpanLineHeight
                );
            }
        } else {
            // w 不超过 divide 宽度，加入到 divide 中去
            const currentLine = divide.parent;
            const maxBox = __maxFontBoundingBoxBySpanGroup(glyphGroup);

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

                    const { paragraphStart: lineIsStart } = column?.lines.pop()!; // Delete the previous line and recalculate according to the maximum content height

                    _lineOperator(
                        newSpanGroup,
                        pages,
                        sectionBreakConfig,
                        paragraphConfig,
                        lineIsStart,
                        boundingBoxAscent + boundingBoxDescent
                    );

                    for (let i = startIndex; i < spanGroupCached.length; i++) {
                        _divideOperator(
                            [spanGroupCached[i]],
                            pages,
                            sectionBreakConfig,
                            paragraphConfig,
                            paragraphStart
                        );
                    }

                    _divideOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart);

                    return;
                }
            }

            addGlyphToDivide(divide, glyphGroup, preOffsetLeft);
        }
    } else {
        _lineOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, defaultSpanLineHeight);
    }
}

function _lineOperator(
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    defaultSpanLineHeight?: number
) {
    let lastPage = getLastPage(pages);
    let columnInfo = getLastNotFullColumnInfo(lastPage);
    if (!columnInfo || !columnInfo.column) {
        // 如果列不存在，则做一个兜底策略，新增一页。
        _pageOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig);
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

    const line = getLastLineByColumn(column);

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
        line
    );

    const lineHeight = marginTop + paddingTop + contentHeight + paddingBottom;
    let section = column.parent;
    if (!section) {
        // 做一个兜底，指向当前页最后一个section
        section = getLastSection(lastPage);
    }
    const preLineHeight = line?.lineHeight || 0;
    const preTop = line?.top || 0;
    const lineTop = preLineHeight + preTop;

    const { pageWidth, headerId, footerId } = lastPage;
    const headersDrawings = skeHeaders?.get(headerId)?.get(pageWidth)?.skeDrawings;
    const footersDrawings = skeFooters?.get(footerId)?.get(pageWidth)?.skeDrawings;

    __updateDrawingPosition(
        lineTop,
        lineHeight,
        column,
        drawingAnchor?.get(paragraphIndex)?.top,
        paragraphAffectSkeDrawings
    ); // 初始化paragraphAffectSkeDrawings的位置，drawing的布局参照Paragraph开始位置，如果段落中有换页的情况，换页之后的drawing参照位置是0， 0

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
        _columnOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, defaultSpanLineHeight);
        return;
    }

    // line不超过Col高度，或者行超列高列中没有其他内容，或者行超页高页中没有其他内容；
    const lineIndex = line ? line.lineIndex + 1 : 0;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const { paddingLeft, paddingRight, changeBulletWidth } = __getIndentPadding(
        glyphGroup[0],
        indentFirstLine,
        hanging,
        indentStart,
        indentEnd,
        charSpaceApply
    );
    if (changeBulletWidth.state) {
        // 为了保持__getIndentPadding的纯函数特性，把修改首行列表宽度的逻辑外置到这里
        glyphGroup[0].width = changeBulletWidth.hangingNumber;
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
        paragraphStart,
        lastPage.skeDrawings,
        headersDrawings,
        footersDrawings
    );

    column.lines.push(newLine);
    newLine.parent = column;
    createAndUpdateBlockAnchor(paragraphIndex, newLine, lineTop, drawingAnchor);
    _divideOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, defaultSpanLineHeight);
}

function _columnOperator(
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const columnIsFull = isColumnFull(lastPage);

    if (columnIsFull === true) {
        _pageOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, defaultSpanLineHeight);
    } else {
        _lineOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, defaultSpanLineHeight);
    }
}

function _pageOperator(
    glyphGroup: IDocumentSkeletonGlyph[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    paragraphStart: boolean = false,
    defaultSpanLineHeight?: number
) {
    const curSkeletonPage: IDocumentSkeletonPage = getLastPage(pages);
    const { skeHeaders, skeFooters } = paragraphConfig;

    pages.push(createSkeletonPage(sectionBreakConfig, { skeHeaders, skeFooters }, curSkeletonPage?.pageNumber));
    _columnOperator(glyphGroup, pages, sectionBreakConfig, paragraphConfig, paragraphStart, defaultSpanLineHeight);
}

/**
 * 17.3.1.12 ind (Paragraph Indentation)
 */
function __getIndentPadding(
    glyph: IDocumentSkeletonGlyph,
    indentFirstLine: INumberUnit | number = 0,
    hanging: INumberUnit | number = 0,
    indentStart: INumberUnit | number = 0,
    indentEnd: INumberUnit | number = 0,
    charSpaceApply: number
) {
    const { glyphType = GlyphType.LETTER, bBox } = glyph;
    const indentFirstLineNumber = getNumberUnitValue(indentFirstLine, charSpaceApply);
    const hangingNumber = getNumberUnitValue(hanging, charSpaceApply);
    const indentStartNumber = getNumberUnitValue(indentStart, charSpaceApply);
    const indentEndNumber = getNumberUnitValue(indentEnd, charSpaceApply);

    let paddingLeft = indentStartNumber;
    const paddingRight = indentEndNumber;
    const changeBulletWidth = {
        state: false,
        hangingNumber: 0,
    };

    if (glyphType === GlyphType.LIST) {
        // 首行的处理
        const { width: fontWidth } = bBox;

        if (indentFirstLineNumber > 0) {
            paddingLeft += indentFirstLineNumber;
        } else if (hangingNumber > 0 && hangingNumber > fontWidth) {
            // glyph.w = hangingNumber;
            changeBulletWidth.state = true;
            changeBulletWidth.hangingNumber = hangingNumber;
        }
    } else {
        paddingLeft += hangingNumber;
    }

    return {
        paddingLeft,
        paddingRight,
        changeBulletWidth,
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

// 更新paragraphAffectSkeDrawings的绝对位置，相对于段落的第一行布局
function __updateDrawingPosition(
    lineTop: number,
    lineHeight: number,
    column: IDocumentSkeletonColumn,
    blockAnchorTop?: number,
    paragraphAffectSkeDrawings?: Map<string, IDocumentSkeletonDrawing>
) {
    if (!paragraphAffectSkeDrawings) {
        return;
    }

    const page = column.parent?.parent;

    if (!page) {
        return;
    }

    const drawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const isPageBreak = __checkPageBreak(column);

    // console.log('__updateDrawingPosition', lineTop, lineHeight, column, blockAnchorTop, paragraphAffectSkeDrawings);

    paragraphAffectSkeDrawings.forEach((drawing) => {
        if (!drawing) {
            return;
        }

        const { initialState, drawingOrigin } = drawing;

        if (initialState || !drawingOrigin) {
            return;
        }

        const { objectTransform } = drawingOrigin;

        const { positionH, positionV, size, angle } = objectTransform;
        const { width = 0, height = 0 } = size;

        drawing.aLeft = getPositionHorizon(positionH, column, page, width, isPageBreak) || 0;
        drawing.aTop =
            getPositionVertical(positionV, page, lineTop, lineHeight, height, blockAnchorTop, isPageBreak) || 0;
        drawing.width = width;
        drawing.height = height;
        drawing.angle = angle;
        drawing.initialState = true;

        drawings.set(drawing.objectId, drawing);
    });

    page.skeDrawings = new Map([...page.skeDrawings, ...drawings]);
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

function __getSpanGroupWidth(glyphGroup: IDocumentSkeletonGlyph[]) {
    const spanGroupLen = glyphGroup.length;
    let width = 0;

    for (let i = 0; i < spanGroupLen; i++) {
        const glyph = glyphGroup[i];
        width += glyph.width;
    }
    return width;
}

function __maxFontBoundingBoxBySpanGroup(glyphGroup: IDocumentSkeletonGlyph[]) {
    const spanGroupLen = glyphGroup.length;
    let height = Number.NEGATIVE_INFINITY;
    let maxBox;

    for (let i = 0; i < spanGroupLen; i++) {
        const glyph = glyphGroup[i];
        const { ba: boundingBoxAscent, bd: boundingBoxDescent } = glyph.bBox;

        if (height < boundingBoxAscent + boundingBoxDescent) {
            maxBox = { boundingBoxAscent, boundingBoxDescent };
        }

        height = boundingBoxAscent + boundingBoxDescent;
    }

    return maxBox;
}

function __getSpanGroupByLine(line: IDocumentSkeletonLine) {
    const divides = line.divides;
    const dividesLen = divides.length;
    const glyphGroup = [];

    for (let i = 0; i < dividesLen; i++) {
        const divide = divides[i];
        glyphGroup.push(...divide.glyphGroup);
    }

    return glyphGroup;
}

function __bulletIndentHandler(
    paragraphStyle: IParagraphStyle,
    bulletSkeleton: IDocumentSkeletonBullet,
    charSpaceApply: number
) {
    const { hanging, indentStart } = paragraphStyle;

    const { hanging: hangingBullet, indentStart: indentStartBullet } = bulletSkeleton;

    // TODO: @JOCS, do not modify snapshot data directly.
    if (hanging === undefined) {
        paragraphStyle.hanging = hangingBullet;
    }

    // TODO: @JOCS, do not modify snapshot data directly.
    if (indentStart === undefined) {
        paragraphStyle.indentStart =
            getNumberUnitValue(indentStartBullet || 0, charSpaceApply) -
            getNumberUnitValue(hangingBullet || 0, charSpaceApply);
    }
}

function __isNullLine(line: IDocumentSkeletonLine) {
    return !line.divides[0].glyphGroup[0];
}
