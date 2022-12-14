import { BooleanNumber, GridType, HorizontalAlign, INumberUnit, IParagraphStyle, NamedStyleType, SpacingRule } from '@univer/core';
import {
    getCharSpaceApply,
    getCharSpaceConfig,
    getColumnByDivide,
    getLastLineByColumn,
    getLastNotFullColumnInfo,
    getLastNotFullDivideInfo,
    getLastPage,
    getLastSection,
    getLineHeightConfig,
    getNumberUnitValue,
    getPageContentWidth,
    getPositionHorizon,
    getPositionVertical,
    isBlankColumn,
    isBlankPage,
    isColumnFull,
} from '../../Common/Tools';
import { createSkeletonPage } from '../../Common/Page';
import { calculateLineTopByDrawings, createAndUpdateBlockAnchor, createSkeletonLine, isParagraphStart, setDivideFullState } from '../../Common/Line';
import { createSkeletonBulletSpan, setSpanGroupLeft } from '../../Common/Span';
import { setColumnFullState } from '../../Common/Section';
import {
    IDocumentSkeletonBullet,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSpan,
    LineType,
    SpanType,
} from '../../../../Basics/IDocumentSkeletonCached';
import { IParagraphConfig, ISectionBreakConfig } from '../../../../Basics/Interfaces';

export function calculateParagraphLayout(
    spanGroup: IDocumentSkeletonSpan[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    elementIndex: number = 0,
    isFirstSpan: boolean = false
) {
    if (isParagraphStart(elementIndex, isFirstSpan)) {
        // elementIndex === 0 表示段落开始的第一个字符，需要新起一行，与之前的段落区分开
        if (paragraphConfig.bulletSkeleton) {
            const { bulletSkeleton, paragraphStyle = {} } = paragraphConfig;
            // 如果是一个段落的开头，需要加入bullet
            const { gridType = GridType.LINES, charSpace = 0, defaultTabStop = 1 } = sectionBreakConfig;

            const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);

            __bulletIndentHandler(paragraphStyle, bulletSkeleton, charSpaceApply);

            const bulletSpan = createSkeletonBulletSpan(spanGroup[0], bulletSkeleton, charSpaceApply);
            _lineOperator([bulletSpan, ...spanGroup], pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
            // _divideOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
        } else {
            _lineOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
        }
    } else {
        _divideOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
    }
    return [...pages];
}

function _divideOperator(
    spanGroup: IDocumentSkeletonSpan[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    elementIndex: number = 0,
    isFirstSpan: boolean = false,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const divideInfo = getLastNotFullDivideInfo(lastPage); // 取得最新一行里内容未满的第一个divide
    if (divideInfo) {
        const width = __getSpanGroupWidth(spanGroup);
        const divide = divideInfo.divide;
        const lastSpan = divide?.spanGroup?.[divide.spanGroup.length - 1];
        // const { w: preWidth = 0, l: preLeft = 0 } = lastSpan;
        const preWidth = lastSpan?.width || 0;
        const preLeft = lastSpan?.left || 0;
        // const { width: pageWidth, marginLeft: pageMarginLeft, marginRight: pageMarginRight } = lastPage;
        const pageContentWidth = getPageContentWidth(lastPage);

        if (preWidth + preLeft + width > divide.width) {
            // w超过div宽度
            setDivideFullState(divide, true);
            const column = getColumnByDivide(divide);

            if (width > pageContentWidth) {
                // 一个字符超页内容宽
                if (isBlankPage(lastPage)) {
                    divide.spanGroup.push(...spanGroup);
                    __makeColumnsFull(column?.parent?.columns);
                } else {
                    _pageOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
                }
            } else if (column && width > column.width) {
                // 一个字符超列宽
                setColumnFullState(column, true);
                if (isBlankColumn(column)) {
                    console.log(spanGroup);
                    divide.spanGroup.push(...spanGroup);
                } else {
                    _columnOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
                }
            } else if (divideInfo.isLast) {
                // 最后一个divide
                _lineOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
            } else {
                // 不是最后一个divide
                _divideOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
            }
        } else {
            // w不超过div宽度，加入到divide中去
            const currentLine = divide.parent;
            const maxBox = __maxFontBoundingBoxBySpanGroup(spanGroup);
            if (currentLine && maxBox) {
                const { paragraphLineGapDefault, linePitch, lineSpacing, spacingRule, snapToGrid, gridType } = getLineHeightConfig(sectionBreakConfig, paragraphConfig);
                const { boundingBoxAscent, boundingBoxDescent } = maxBox;
                const spanLineHeight = boundingBoxAscent + boundingBoxDescent;
                const { contentHeight } = __getLineHeight(spanLineHeight, paragraphLineGapDefault, linePitch, gridType, lineSpacing, spacingRule, snapToGrid);
                if (currentLine.contentHeight < contentHeight) {
                    // 如果新内容的高度超过其加入行的高度，为了处理图文混排，整行都需要按照新高度重新计算
                    // If the height of the new content exceeds the height of the added row, the entire row needs to be recalculated according to the new height in order to handle the mixing of graphics and text
                    const spanGroupCached = __getSpanGroupByLine(currentLine);
                    const spanGroupCachedLen = spanGroupCached.length;
                    let newSpanGroup = [];
                    let startIndex = 1;
                    if (spanGroupCached[0].spanType === SpanType.LIST && spanGroupCachedLen > 2) {
                        newSpanGroup = [spanGroupCached[0], spanGroupCached[1]];
                        startIndex = 2;
                    } else {
                        newSpanGroup = [spanGroupCached[0]];
                    }
                    const column = currentLine.parent;
                    column?.lines.pop(); // Delete the previous line and recalculate according to the maximum content height
                    _lineOperator(newSpanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, boundingBoxAscent + boundingBoxDescent);
                    for (let i = startIndex; i < spanGroupCached.length; i++) {
                        _divideOperator([spanGroupCached[i]], pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
                    }
                    _divideOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan);
                    return;
                }
            }
            setSpanGroupLeft(spanGroup, preWidth + preLeft);
            for (let span of spanGroup) {
                span.parent = divide;
            }
            // console.log('spanGroup', spanGroup, spanGroup.length, spanGroup[0].content);
            divide.spanGroup.push(...spanGroup);
        }
    } else {
        _lineOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
    }
}

function _lineOperator(
    spanGroup: IDocumentSkeletonSpan[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    elementIndex: number = 0,
    isFirstSpan: boolean = false,
    defaultSpanLineHeight?: number
) {
    let lastPage = getLastPage(pages);
    let columnInfo = getLastNotFullColumnInfo(lastPage);
    if (!columnInfo || !columnInfo.column) {
        // 如果列不存在，则做一个兜底策略，新增一页。
        _pageOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex);
        lastPage = getLastPage(pages);
        columnInfo = getLastNotFullColumnInfo(lastPage);
    }
    // Todo: demo4导入的时候columnInfo会不存在,先return了
    if (!columnInfo) return;

    const column = columnInfo!.column;
    const line = getLastLineByColumn(column);

    const { ba: ascent, bd: descent } = spanGroup[0].bBox;
    const spanLineHeight = defaultSpanLineHeight || ascent + descent;

    const { paragraphStyle = {}, paragraphAffectSkeDrawings, skeHeaders, skeFooters, blockAnchor, blockId } = paragraphConfig;

    const {
        namedStyleType = NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED,
        horizontalAlign = HorizontalAlign.UNSPECIFIED,

        direction,
        spaceAbove = 0,
        spaceBelow = 0,

        borderBetween,
        borderTop,
        borderBottom,
        borderLeft,
        borderRight,

        indentFirstLine = 0,
        hanging = 0,
        indentStart = 0,
        indentEnd = 0,
        tabStops = [],

        keepLines = BooleanNumber.FALSE,
        keepNext = BooleanNumber.FALSE,
        wordWrap = BooleanNumber.FALSE,
        widowControl = BooleanNumber.FALSE,
        shading,
    } = paragraphStyle;

    const { paragraphLineGapDefault, linePitch, lineSpacing, spacingRule, snapToGrid, gridType } = getLineHeightConfig(sectionBreakConfig, paragraphConfig);

    const paragraphStart = isParagraphStart(elementIndex, isFirstSpan);
    const { paddingTop, paddingBottom, contentHeight, lineSpacingApply } = __getLineHeight(
        spanLineHeight,
        paragraphLineGapDefault,
        linePitch,
        gridType,
        lineSpacing,
        spacingRule,
        snapToGrid
    );

    const { marginTop, spaceBelowApply } = __getParagraphSpace(lineSpacingApply, spaceAbove, spaceBelow, paragraphStart, line);

    const lineHeight = marginTop + paddingTop + contentHeight + paddingBottom;
    let section = column.parent;
    if (!section) {
        // 做一个兜底，指向当前页最后一个section
        section = getLastSection(lastPage);
    }
    const preLineHeight = line?.lineHeight || 0;
    const preTop = line?.top || 0;
    const lineTop = preLineHeight + preTop;

    const { width, headerId, footerId } = lastPage;
    const headersDrawings = skeHeaders?.get(headerId)?.get(width)?.skeDrawings;
    const footersDrawings = skeFooters?.get(footerId)?.get(width)?.skeDrawings;

    __updateDrawingPosition(lineTop, lineHeight, column, blockAnchor?.get(blockId)?.top, paragraphAffectSkeDrawings); // 初始化paragraphAffectSkeDrawings的位置，drawing的布局参照Paragraph开始位置，如果段落中有换页的情况，换页之后的drawing参照位置是0， 0

    const newLineTop = calculateLineTopByDrawings(lineHeight, lineTop, elementIndex, lastPage.skeDrawings, headersDrawings, footersDrawings); // WRAP_TOP_AND_BOTTOM的drawing会改变行的起始top

    if (lineHeight + newLineTop > section.height && column.lines.length > 0 && lastPage.sections.length > 0) {
        // 行高超过Col高度，且列中已存在一行以上，且section大于一个；
        console.log('_lineOperator', { spanGroup, pages, lineHeight, newLineTop, sectionHeight: section.height, lastPage });
        setColumnFullState(column, true);
        _columnOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
        return;
    }

    // line不超过Col高度，或者行超列高列中没有其他内容，或者行超页高页中没有其他内容；
    const lineIndex = line ? line.lineIndex + 1 : 0;
    const { charSpace, defaultTabStop } = getCharSpaceConfig(sectionBreakConfig, paragraphConfig);
    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
    const { paddingLeft, paddingRight, changeBulletWidth } = __getIndentPadding(spanGroup[0], indentFirstLine, hanging, indentStart, indentEnd, charSpaceApply);
    if (changeBulletWidth.state) {
        // 为了保持__getIndentPadding的纯函数特性，把修改首行列表宽度的逻辑外置到这里
        spanGroup[0].width = changeBulletWidth.hangingNumber;
    }
    // console.log(spanGroup[0].content, isParagraphStart(elementIndex, isFirstSpan), elementIndex, isFirstSpan);
    const newLine = createSkeletonLine(
        blockId,
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
        elementIndex,
        isFirstSpan,
        lastPage.skeDrawings,
        headersDrawings,
        footersDrawings
    );
    column.lines.push(newLine);
    newLine.parent = column;
    createAndUpdateBlockAnchor(blockId, newLine, lineTop, blockAnchor);
    _divideOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
}

function _columnOperator(
    spanGroup: IDocumentSkeletonSpan[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    elementIndex: number = 0,
    isFirstSpan: boolean = false,
    defaultSpanLineHeight?: number
) {
    const lastPage = getLastPage(pages);
    const column = isColumnFull(lastPage);
    if (column === true) {
        _pageOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
    } else {
        _lineOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
    }
}

function _pageOperator(
    spanGroup: IDocumentSkeletonSpan[],
    pages: IDocumentSkeletonPage[],
    sectionBreakConfig: ISectionBreakConfig,
    paragraphConfig: IParagraphConfig,
    elementIndex: number = 0,
    isFirstSpan: boolean = false,
    defaultSpanLineHeight?: number
) {
    const curSkeletonPage: IDocumentSkeletonPage = getLastPage(pages);
    const { skeHeaders, skeFooters } = paragraphConfig;
    pages.push(createSkeletonPage(sectionBreakConfig, { skeHeaders, skeFooters }, curSkeletonPage?.pageNumber));
    _columnOperator(spanGroup, pages, sectionBreakConfig, paragraphConfig, elementIndex, isFirstSpan, defaultSpanLineHeight);
}

/**
 * 17.3.1.12 ind (Paragraph Indentation)
 */
function __getIndentPadding(
    span: IDocumentSkeletonSpan,
    indentFirstLine: INumberUnit | number = 0,
    hanging: INumberUnit | number = 0,
    indentStart: INumberUnit | number = 0,
    indentEnd: INumberUnit | number = 0,
    charSpaceApply: number
) {
    const { spanType = SpanType.LETTER, bBox } = span;
    let indentFirstLineNumber = getNumberUnitValue(indentFirstLine, charSpaceApply);
    let hangingNumber = getNumberUnitValue(hanging, charSpaceApply);
    let indentStartNumber = getNumberUnitValue(indentStart, charSpaceApply);
    let indentEndNumber = getNumberUnitValue(indentEnd, charSpaceApply);

    let paddingLeft = indentStartNumber;
    let paddingRight = indentEndNumber;
    let changeBulletWidth = {
        state: false,
        hangingNumber: 0,
    };

    if (spanType === SpanType.LIST) {
        // 首行的处理
        const { width: fontWidth } = bBox;

        if (indentFirstLineNumber > 0) {
            paddingLeft += indentFirstLineNumber;
        } else if (hangingNumber > 0 && hangingNumber > fontWidth) {
            // span.w = hangingNumber;
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

        const { objectProperties } = drawingOrigin;

        const { positionH, positionV, size, angle } = objectProperties;
        const { width = 0, height = 0 } = size;

        drawing.aLeft = getPositionHorizon(positionH, column, page, width, isPageBreak) || 0;
        drawing.aTop = getPositionVertical(positionV, page, lineTop, lineHeight, height, blockAnchorTop, isPageBreak) || 0;
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

function __getSpanGroupWidth(spanGroup: IDocumentSkeletonSpan[]) {
    const spanGroupLen = spanGroup.length;
    let width = 0;
    for (let i = 0; i < spanGroupLen; i++) {
        const span = spanGroup[i];
        width += span.width;
    }
    return width;
}

function __maxFontBoundingBoxBySpanGroup(spanGroup: IDocumentSkeletonSpan[]) {
    const spanGroupLen = spanGroup.length;
    let height = -Infinity;
    let maxBox;
    for (let i = 0; i < spanGroupLen; i++) {
        const span = spanGroup[i];
        const { ba: boundingBoxAscent, bd: boundingBoxDescent } = span.bBox;
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
    const spanGroup = [];
    for (let i = 0; i < dividesLen; i++) {
        const divide = divides[i];
        spanGroup.push(...divide.spanGroup);
    }
    return spanGroup;
}

function __bulletIndentHandler(paragraphStyle: IParagraphStyle, bulletSkeleton: IDocumentSkeletonBullet, charSpaceApply: number) {
    const { hanging, indentStart } = paragraphStyle;

    const { hanging: hangingBullet, indentStart: indentStartBullet } = bulletSkeleton;

    if (hanging === undefined) {
        paragraphStyle.hanging = hangingBullet;
    }

    if (indentStart === undefined) {
        paragraphStyle.indentStart = getNumberUnitValue(indentStartBullet || 0, charSpaceApply) - getNumberUnitValue(hangingBullet || 0, charSpaceApply);
    }
}
