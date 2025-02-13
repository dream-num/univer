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

import type { IDistFromText, Nullable } from '@univerjs/core';
import type { IParagraphConfig } from '../../../../basics';

import type {
    IDocumentSkeletonDivide,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonDrawingAnchor,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonTable,
    LineType,
} from '../../../../basics/i-document-skeleton-cached';
import type { IFloatObject } from '../tools';
import { PositionedObjectLayoutType, TableTextWrapType, WrapTextType } from '@univerjs/core';
import { Path2 } from '../../../../basics/path2';
import { Transform } from '../../../../basics/transform';
import { Vector2 } from '../../../../basics/vector2';

interface IDrawingsSplit {
    left: number;
    width: number;
}

enum WrapTextRuler {
    BOTH,
    LEFT,
    RIGHT,
}

enum AxisType {
    X,
    Y,
}

interface ILineBoundingBox {
    lineHeight: number;
    lineTop: number;
    contentHeight: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    marginTop?: number;
    spaceBelowApply?: number;
}

// 处理divides， divideLen， lineIndex， 无序和有序列表标题， drawingTBIds 影响行的元素id集合
export function createSkeletonLine(
    paragraphIndex: number,
    lineType: LineType,
    lineBoundingBox: ILineBoundingBox,
    columnWidth: number,
    lineIndex: number = 0,
    isParagraphStart: boolean = false,
    paragraphConfig: IParagraphConfig,
    page: IDocumentSkeletonPage,
    headerPage: Nullable<IDocumentSkeletonPage>,
    footerPage: Nullable<IDocumentSkeletonPage>
): IDocumentSkeletonLine {
    const {
        lineHeight = 15.6,
        lineTop = 0,
        contentHeight = 0,
        paddingLeft = 0,
        paddingRight = 0,
        paddingTop = 0,
        paddingBottom = 0,
        marginTop = 0,
        spaceBelowApply = 0,
    } = lineBoundingBox;
    const { skeTablesInParagraph } = paragraphConfig;
    const pageSkeDrawings = page.skeDrawings ?? new Map();
    const pageSkeTables = page.skeTables ?? new Map();
    const headersDrawings = headerPage?.skeDrawings;
    const footersDrawings = footerPage?.skeDrawings;

    const lineSke = _getLineSke(lineType, paragraphIndex);

    lineSke.lineIndex = lineIndex;
    lineSke.paragraphStart = isParagraphStart; // 是否段落开始的第一行
    lineSke.contentHeight = contentHeight;
    lineSke.top = lineTop;
    lineSke.lineHeight = lineHeight;
    lineSke.paddingTop = paddingTop;
    lineSke.paddingBottom = paddingBottom;
    lineSke.marginTop = marginTop; // marginTop is initialized when it is created, and marginBottom is not calculated when it is created, it will be determined according to the situation of the next paragraph
    lineSke.spaceBelowApply = spaceBelowApply;

    if (isParagraphStart && Array.isArray(skeTablesInParagraph) && skeTablesInParagraph.length > 0) {
        const tableId = skeTablesInParagraph[skeTablesInParagraph.length - 1].tableId;

        lineSke.isBehindTable = true;
        lineSke.tableId = tableId;
    }

    const affectSkeDrawings = new Map(Array.from(pageSkeDrawings).filter(([_, drawing]) => drawing.drawingOrigin.layoutType !== PositionedObjectLayoutType.INLINE));
    const wrapTypeTables = new Map(Array.from(pageSkeTables).filter(([_, table]) => table.tableSource.textWrap === TableTextWrapType.WRAP));

    lineSke.divides = _calculateDividesByDrawings(
        lineHeight,
        lineTop,
        columnWidth,
        paddingLeft,
        paddingRight,
        page,
        headerPage,
        footerPage,
        affectSkeDrawings,
        headersDrawings,
        footersDrawings,
        wrapTypeTables
    );

    for (const divide of lineSke.divides) {
        divide.parent = lineSke;
    }

    return lineSke;
}

export function calculateLineTopByDrawings(
    lineHeight: number = 15.6,
    lineTop: number = 0,
    page: IDocumentSkeletonPage,
    headerPage: Nullable<IDocumentSkeletonPage>,
    footerPage: Nullable<IDocumentSkeletonPage>
) {
    let maxTop = lineTop;
    const pageSkeDrawings = page.skeDrawings;
    const skeNonWrapTables = new Map(Array.from(page.skeTables).filter(([_, table]) => table.tableSource.textWrap === TableTextWrapType.NONE));
    const headersDrawings = headerPage?.skeDrawings;
    const footersDrawings = footerPage?.skeDrawings;

    if (headerPage && headersDrawings) {
        headersDrawings.forEach((drawing) => {
            const transformedDrawing = translateHeaderFooterDrawingPosition(drawing, headerPage, page, true);
            const top = _getLineTopWidthWrapTopBottom(transformedDrawing, lineHeight, lineTop);
            if (top) {
                maxTop = Math.max(maxTop, top);
            }
        });
    }

    if (footerPage && footersDrawings) {
        footersDrawings.forEach((drawing) => {
            const transformedDrawing = translateHeaderFooterDrawingPosition(drawing, footerPage, page, false);
            const top = _getLineTopWidthWrapTopBottom(transformedDrawing, lineHeight, lineTop);
            if (top) {
                maxTop = Math.max(maxTop, top);
            }
        });
    }

    pageSkeDrawings?.forEach((drawing) => {
        const top = _getLineTopWidthWrapTopBottom(drawing, lineHeight, lineTop);
        if (top) {
            maxTop = Math.max(maxTop, top);
        }
    });

    skeNonWrapTables?.forEach((table) => {
        const top = _getLineTopWidthWrapNone(table, lineHeight, lineTop);
        if (top) {
            maxTop = Math.max(maxTop, top);
        }
    });

    return maxTop;
}

function _getLineTopWidthWrapNone(table: IDocumentSkeletonTable, lineHeight: number, lineTop: number) {
    const { top, height } = table;

    // No need to consider the dist.
    if (top + height < lineTop || top > lineHeight + lineTop) {
        return;
    }

    return top + height;
}

function _getLineTopWidthWrapTopBottom(drawing: IDocumentSkeletonDrawing, lineHeight: number, lineTop: number) {
    const { aTop, height, aLeft, width, angle = 0, drawingOrigin } = drawing;
    const { layoutType, distT = 0, distB = 0 } = drawingOrigin;

    if (layoutType !== PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM) {
        return;
    }

    // if (elementIndex && showElementIndex < elementIndex) {
    //     // drawing出现在特定element之后，一般会是同一个段落跨页的场景
    //     // 在对drawing进行操作时，如果跨页则设置showElementIndex
    //     return;
    // }

    if (angle === 0) {
        const newAtop = aTop - distT;
        const newHeight = distT + height + distB;

        if (newAtop + newHeight < lineTop || newAtop > lineHeight + lineTop) {
            return;
        }

        return newAtop + newHeight;
    }
    // 旋转的情况，要考虑行首位与drawing旋转后得到的最大区域
    let { top: sTop = 0, height: sHeight = 0 } = getBoundingBox(angle, aLeft, width, aTop, height);

    sTop -= distT;
    sHeight += distB;

    if (sTop + sHeight < lineTop || sTop > lineHeight + lineTop) {
        return;
    }
    return sTop + sHeight;
}

function _calculateDividesByDrawings(
    lineHeight: number,
    lineTop: number,
    columnWidth: number,
    paddingLeft: number,
    paddingRight: number,
    page: IDocumentSkeletonPage,
    headerPage: Nullable<IDocumentSkeletonPage>,
    footerPage: Nullable<IDocumentSkeletonPage>,
    paragraphNonInlineSkeDrawings?: Map<string, IDocumentSkeletonDrawing>,
    headersDrawings?: Map<string, IDocumentSkeletonDrawing>,
    footersDrawings?: Map<string, IDocumentSkeletonDrawing>,
    wrapTypeTables?: Map<string, IDocumentSkeletonTable>
): IDocumentSkeletonDivide[] {
    const drawingsMix: IDrawingsSplit[] = []; // 图文混排的情况
    // 插入indent占位
    drawingsMix.push(
        {
            left: 0,
            width: paddingLeft,
        },
        {
            left: columnWidth - paddingRight,
            width: paddingRight,
        }
    );

    if (headerPage && headersDrawings) {
        headersDrawings.forEach((drawing) => {
            const transformedDrawing = translateHeaderFooterDrawingPosition(drawing, headerPage, page, true);
            const split = _calculateSplit(transformedDrawing, lineHeight, lineTop, columnWidth);

            if (split) {
                drawingsMix.push(split);
            }
        });
    }

    if (footerPage && footersDrawings) {
        footersDrawings.forEach((drawing) => {
            const transformedDrawing = translateHeaderFooterDrawingPosition(drawing, footerPage, page, false);
            const split = _calculateSplit(transformedDrawing, lineHeight, lineTop, columnWidth);

            if (split) {
                drawingsMix.push(split);
            }
        });
    }

    paragraphNonInlineSkeDrawings?.forEach((drawing) => {
        const split = _calculateSplit(drawing, lineHeight, lineTop, columnWidth);

        if (split) {
            drawingsMix.push(split);
        }
    });

    if (wrapTypeTables && wrapTypeTables.size > 0) {
        wrapTypeTables.forEach((table) => {
            const { left, top, width, height, tableSource } = table;
            const { dist } = tableSource;
            const split = __getSplitWidthNoAngle(top, height, left, width, lineTop, lineHeight, columnWidth, dist);

            if (split) {
                drawingsMix.push(split);
            }
        });
    }

    return _calculateDivideByDrawings(columnWidth, drawingsMix);
}

export function updateDivideInfo(divide: IDocumentSkeletonDivide, states: Partial<IDocumentSkeletonDivide>) {
    Object.assign(divide, states);
}

export function setLineMarginBottom(line: IDocumentSkeletonLine, marginBottom: number) {
    line.marginBottom = marginBottom;
}

export function collisionDetection(
    floatObject: IFloatObject,
    lineHeight: number,
    lineTop: number,
    columnLeft: number,
    columnWidth: number
) {
    const { top: oTop, height: oHeight, left: oLeft, width: oWidth, angle = 0 } = floatObject;

    const { top = 0, left = 0, width = 0, height = 0 } = getBoundingBox(angle, oLeft, oWidth, oTop, oHeight);

    if (top + height < lineTop || top > lineHeight + lineTop) {
        return false;
    }

    if (left + width < columnLeft || left > columnLeft + columnWidth) {
        return false;
    }

    return true;
}

function _calculateSplit(
    drawing: IDocumentSkeletonDrawing,
    lineHeight: number,
    lineTop: number,
    columnWidth: number
): Nullable<IDrawingsSplit> {
    const { aTop, height, aLeft, width, angle = 0, drawingOrigin } = drawing;
    const { layoutType } = drawingOrigin;

    if (
        layoutType === PositionedObjectLayoutType.WRAP_NONE ||
        layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
    ) {
        return;
    }

    if (layoutType === PositionedObjectLayoutType.WRAP_POLYGON) {
        const { start = [0, 0], lineTo } = drawingOrigin;
        if (!lineTo) {
            return;
        }

        const points: Vector2[] = [];
        points.push(new Vector2(start[0], start[1]));
        for (let i = 0; i < lineTo.length; i++) {
            const point = lineTo[i];
            points.push(new Vector2(point[0], point[1]));
        }

        if (angle !== 0) {
            const transform = new Transform().rotate(angle); // 建一个旋转后的变换类
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                points[i] = transform.applyPoint(point);
            }
        }

        return __getCrossPoint(points, lineTop, lineHeight, columnWidth);
    }

    const { distL = 0, distT = 0, distB = 0, distR = 0, wrapText } = drawingOrigin;
    const dist = { distL, distT, distB, distR };

    if (angle === 0) {
        // 无旋转的情况， wrapSquare | wrapThrough | wrapTight
        return __getSplitWidthNoAngle(aTop, height, aLeft, width, lineTop, lineHeight, columnWidth, dist, layoutType, wrapText);
    }

    // 旋转的情况，要考虑行首位与drawing旋转后得到的最大区域
    const boundingBox = getBoundingBox(angle, aLeft, width, aTop, height);

    if (layoutType === PositionedObjectLayoutType.WRAP_SQUARE) {
        // WRAP_SQUARE的情况下，旋转后的图形会重新有一个rect，用这个新rect来决定split
        const { left: sLeft, width: sWidth, top: sTop, height: sHeight } = boundingBox;
        return __getSplitWidthNoAngle(
            sTop!,
            sHeight!,
            sLeft!,
            sWidth!,
            lineTop,
            lineHeight,
            columnWidth,
            dist,
            layoutType,
            wrapText
        );
    }

    // wrapThrough | wrapTight
    return __getCrossPoint(boundingBox.points, lineTop, lineHeight, columnWidth);
}

export function getBoundingBox(angle: number, left: number, width: number, top: number, height: number) {
    // 旋转的情况，要考虑行首位与drawing旋转后得到的最大区域
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // 建一个旋转后的变换类
    const transform = new Transform()
        .translate(centerX, centerY)
        .rotate(angle)
        .translate(-centerX, -centerY);
    // 把 drawing 四个端点分别进行旋转
    const lt = new Vector2(left, top);
    const lb = new Vector2(left, top + height);
    const rt = new Vector2(left + width, top);
    const rb = new Vector2(left + width, top + height);
    const boundingBox = transform.makeBoundingBoxFromPoints([lt, lb, rt, rb]); // 返回旋转后的点集合以及矩形选区

    return boundingBox;
}

// Converts the vertical position of the image in the header and footer to the position
// of the image relative to the body position.
function translateHeaderFooterDrawingPosition(
    drawing: IDocumentSkeletonDrawing,
    segmentPage: IDocumentSkeletonPage,
    page: IDocumentSkeletonPage,
    isHeader = true
) {
    const { aTop: prevATop } = drawing;

    let aTop = prevATop;

    if (isHeader) {
        aTop = prevATop + segmentPage.marginTop - page.marginTop;
    } else {
        aTop = prevATop + segmentPage.marginTop + page.pageHeight - page.marginBottom - page.marginTop;
    }

    return {
        ...drawing,
        aTop,
    };
}

function __getCrossPoint(points: Vector2[], lineTop: number, lineHeight: number, columnWidth: number) {
    const path = new Path2(points);
    const crossPointTop = path.intersection([new Vector2(0, lineTop), new Vector2(columnWidth, lineTop)]);
    const crossPointBottom = path.intersection([
        new Vector2(0, lineTop + lineHeight),
        new Vector2(columnWidth, lineTop + lineHeight),
    ]);

    if (!crossPointTop && !crossPointBottom) {
        return;
    }

    const range = ___getMaxAndMinAxis([...points, ...(crossPointTop || []), ...(crossPointBottom || [])]);
    return {
        left: range.min,
        width: range.max,
    };
}

function ___getMaxAndMinAxis(points: Vector2[], axis = AxisType.X) {
    const result = [];
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (axis === AxisType.X) {
            result.push(point.x);
        } else {
            result.push(point.y);
        }
    }
    return {
        max: Math.max(...result),
        min: Math.min(...result),
    };
}

function __getSplitWidthNoAngle(
    top: number,
    height: number,
    left: number,
    width: number,
    lineTop: number,
    lineHeight: number,
    columnWidth: number,
    dist: IDistFromText,
    layoutType: PositionedObjectLayoutType = PositionedObjectLayoutType.WRAP_SQUARE,
    wrapText: WrapTextType = WrapTextType.BOTH_SIDES
) {
    const {
        distL = 0,
        distR = 0,
        distT = 0,
        distB = 0,
    } = dist;

    const newAtop = top - (layoutType === PositionedObjectLayoutType.WRAP_SQUARE ? distT : 0);
    const newHeight = height + (layoutType === PositionedObjectLayoutType.WRAP_SQUARE ? distB + distT : 0);

    if (newAtop + newHeight <= lineTop || newAtop >= lineHeight + lineTop) {
        return;
    }

    let resultLeft = left - distL;
    let resultWidth = width + distL + distR;
    const ruler = ___getWrapTextRuler(wrapText, resultLeft, resultWidth, columnWidth);

    if (ruler === WrapTextRuler.LEFT) {
        resultWidth = columnWidth - resultLeft;
    } else if (ruler === WrapTextRuler.RIGHT) {
        resultLeft = 0;
        resultWidth = left + width + distR;
    }

    return {
        left: resultLeft,
        width: resultWidth,
    };
}

function ___getWrapTextRuler(wrapText: WrapTextType, resultLeft: number, resultWidth: number, columnWidth: number) {
    let ruler = WrapTextRuler.BOTH;
    if (wrapText === WrapTextType.LEFT) {
        // 保留左侧，占满右侧，返回很大的width
        ruler = WrapTextRuler.LEFT;
    } else if (wrapText === WrapTextType.RIGHT) {
        // 保留右侧，占满右侧，left从0开始
        ruler = WrapTextRuler.RIGHT;
    } else if (wrapText === WrapTextType.LARGEST) {
        // 保留间隔最大的那一端
        if (resultLeft > columnWidth - resultLeft - resultWidth) {
            // 左侧留空比较大
            ruler = WrapTextRuler.LEFT;
        } else {
            // 右侧留空比较大
            ruler = WrapTextRuler.RIGHT;
        }
    }
    return ruler;
}

function _calculateDivideByDrawings(columnWidth: number, drawingSplit: IDrawingsSplit[]): IDocumentSkeletonDivide[] {
    drawingSplit.sort((pre, next) => {
        if (pre.left > next.left) {
            return 1;
        }
        return -1;
    });

    const divideSkeleton: IDocumentSkeletonDivide[] = [];
    let start = 0;
    const splitLength = drawingSplit.length;

    for (let i = 0; i < splitLength; i++) {
        const split = drawingSplit[i];
        const { left, width } = split;

        if (left > start) {
            // 插入start到left的间隔divide
            let width = left - start;
            width = width < columnWidth ? width : columnWidth - start;
            const divide = __getDivideSKe(start, width);
            divideSkeleton.push(divide);
        }
        start = Math.max(left + width, start);

        if (i === splitLength - 1 && left + width < columnWidth) {
            // 最后一个split到右边界的divide
            const divide = __getDivideSKe(left + width, columnWidth - left - width);
            divideSkeleton.push(divide);
        }
    }

    return divideSkeleton;
}

function __getDivideSKe(left: number, width: number): IDocumentSkeletonDivide {
    return {
        // divide 分割，为了适配插入对象、图片、表格等，图文混排
        glyphGroup: [], // glyphGroup
        width, // width 被分割后的总宽度
        left, // left 被对象分割后的偏移位置 | d1 | | d2 |
        paddingLeft: 0, // paddingLeft 根据horizonAlign和width计算对齐偏移
        isFull: false, // isFull， // 内容是否装满
        st: 0, // startIndex
        ed: 0, // endIndex
    };
}

function _getLineSke(lineType: LineType, paragraphIndex: number): IDocumentSkeletonLine {
    return {
        paragraphIndex,
        type: lineType,
        divides: [], // /divides 受到对象影响，把行切分为 N 部分
        lineHeight: 0, // lineHeight =max(glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent, span2.....) + space
        contentHeight: 0, // contentHeight =max(glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent, span2.....)
        top: 0, // top paragraph(spaceAbove, spaceBelow, lineSpacing*PreLineHeight)
        asc: 0, // =max(glyph.textMetrics.ba) alphaBeta对齐，需要校准
        dsc: 0, // =max(glyph.textMetrics.bd) alphaBeta对齐，需要校准
        paddingTop: 0, // paddingTop 内容到顶部的距离
        paddingBottom: 0, // paddingBottom 内容到底部的距离
        marginTop: 0, // marginTop 针对段落的spaceAbove
        marginBottom: 0, // marginBottom 针对段落的spaceBelow
        spaceBelowApply: 0, // lineSpacingApply
        divideLen: 0, // divideLen 被对象分割为多少块
        st: -1, // startIndex 文本开始索引
        ed: -1, // endIndex 文本结束索引
        isBehindTable: false, // isBehindTable 是否在表格后面
        tableId: '', // tableId 表格id
        lineIndex: 0, // lineIndex 行号
        paragraphStart: false,
    };
}

export function createAndUpdateBlockAnchor(
    paragraphIndex: number,
    line: IDocumentSkeletonLine,
    top: number,
    drawingAnchor?: Map<number, IDocumentSkeletonDrawingAnchor>
) {
    if (!drawingAnchor) {
        return;
    }

    if (drawingAnchor.has(paragraphIndex)) {
        const anchor = drawingAnchor.get(paragraphIndex);
        anchor?.elements.push(line);
    } else {
        drawingAnchor.set(paragraphIndex, {
            elements: [line],
            paragraphIndex,
            top,
        });
    }
}
