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

import type { IPosition } from '@univerjs/core';
import type { UniverRenderingContext } from '../context';

import type { IDocumentSkeletonLine } from './i-document-skeleton-cached';
import { BorderStyleTypes } from '@univerjs/core';
import { BORDER_TYPE as BORDER_LTRB, ORIENTATION_TYPE } from './const';
import { createCanvasElement } from './tools';
import { Vector2 } from './vector2';

export interface IContext2D extends CanvasRenderingContext2D {
    webkitBackingStorePixelRatio: number;
    mozBackingStorePixelRatio: number;
    msBackingStorePixelRatio: number;
    oBackingStorePixelRatio: number;
    backingStorePixelRatio: number;
}

// calculate pixel ratio
export function getDevicePixelRatio(): number {
    let _pixelRatio: number = 1;
    const canvas = createCanvasElement();
    const context = canvas.getContext('2d') as IContext2D;
    _pixelRatio = (() => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio =
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio ||
            1;
        return devicePixelRatio / backingStoreRatio;
    })();

    if (_pixelRatio < 1) {
        return 1;
    }
    return _pixelRatio;
}

/**
 *
 * @param ctx canvas context
 * @param type top bottom left right
 * @param lineWidthBuffer Solving the problem of mitered corners in the drawing of borders thicker than 2 pixels, caused by the line segments being centered.
 * @param position border draw position
 */
export function drawLineByBorderType(ctx: UniverRenderingContext, type: BORDER_LTRB, lineWidthBuffer: number, position: IPosition) {
    let drawStartX = 0;
    let drawStartY = 0;
    let drawEndX = 0;
    let drawEndY = 0;
    const { startX, startY, endX, endY } = position;
    if (type === BORDER_LTRB.TOP) {
        drawStartX = startX - lineWidthBuffer;
        drawStartY = startY;
        drawEndX = endX + lineWidthBuffer;
        drawEndY = startY;
    } else if (type === BORDER_LTRB.BOTTOM) {
        drawStartX = startX - lineWidthBuffer;
        drawStartY = endY;
        drawEndX = endX - lineWidthBuffer;
        drawEndY = endY;
    } else if (type === BORDER_LTRB.LEFT) {
        drawStartX = startX;
        drawStartY = startY - lineWidthBuffer;
        drawEndX = startX;
        drawEndY = endY + lineWidthBuffer;
    } else if (type === BORDER_LTRB.RIGHT) {
        drawStartX = endX;
        drawStartY = startY - lineWidthBuffer;
        drawEndX = endX;
        drawEndY = endY + lineWidthBuffer;
    }

    // ctx.clearRect(drawStartX - 1, drawStartY - 1, drawEndX - drawStartX + 2, drawEndY - drawStartY + 2);
    ctx.beginPath();
    ctx.moveToByPrecision(drawStartX, drawStartY);
    ctx.lineToByPrecision(drawEndX, drawEndY);
    ctx.stroke();
    ctx.closePathByEnv();
}

export function drawDiagonalLineByBorderType(ctx: UniverRenderingContext, type: BORDER_LTRB, position: IPosition) {
    let drawStartX = 0;
    let drawStartY = 0;
    let drawEndX = 0;
    let drawEndY = 0;
    const { startX, startY, endX, endY } = position;
    switch (type) {
        case BORDER_LTRB.TL_BR:
            drawStartX = startX;
            drawStartY = startY;
            drawEndX = endX;
            drawEndY = endY;
            break;
        case BORDER_LTRB.TL_BC:
            drawStartX = startX;
            drawStartY = startY;
            drawEndX = (startX + endX) / 2;
            drawEndY = endY;
            break;
        case BORDER_LTRB.TL_MR:
            drawStartX = startX;
            drawStartY = startY;
            drawEndX = endX;
            drawEndY = (startY + endY) / 2;
            break;
        case BORDER_LTRB.BL_TR:
            drawStartX = startX;
            drawStartY = endY;
            drawEndX = endX;
            drawEndY = startY;
            break;
        case BORDER_LTRB.ML_TR:
            drawStartX = startX;
            drawStartY = (startY + endY) / 2;
            drawEndX = endX;
            drawEndY = startY;
            break;
        case BORDER_LTRB.BC_TR:
            drawStartX = (startX + endX) / 2;
            drawStartY = endY;
            drawEndX = endX;
            drawEndY = startY;
            break;
    }

    // ctx.clearRect(drawStartX - 1, drawStartY - 1, drawEndX - drawStartX + 2, drawEndY - drawStartY + 2);
    ctx.beginPath();
    ctx.moveToByPrecision(drawStartX, drawStartY);
    ctx.lineToByPrecision(drawEndX, drawEndY);
    ctx.closePathByEnv();
    ctx.stroke();
}

export function clearLineByBorderType(ctx: UniverRenderingContext, type: BORDER_LTRB, position: IPosition) {
    let drawStartX = 0;
    let drawStartY = 0;
    let drawEndX = 0;
    let drawEndY = 0;
    const { startX, startY, endX, endY } = position;
    switch (type) {
        case BORDER_LTRB.TOP:
            drawStartX = startX;
            drawStartY = startY;
            drawEndX = endX;
            drawEndY = startY;
            break;
        case BORDER_LTRB.BOTTOM:
            drawStartX = startX;
            drawStartY = endY;
            drawEndX = endX;
            drawEndY = endY;
            break;
        case BORDER_LTRB.LEFT:
            drawStartX = startX;
            drawStartY = startY;
            drawEndX = startX;
            drawEndY = endY;
            break;
        case BORDER_LTRB.RIGHT:
            drawStartX = endX;
            drawStartY = startY;
            drawEndX = endX;
            drawEndY = endY;
            break;
    }

    // ctx.beginPath();
    // ctx.strokeStyle = 'rgb(255,255,255)';
    // ctx.lineWidth = 1.5 / Math.max(scaleX, scaleY);
    // ctx.moveTo(drawStartX, drawStartY);
    // ctx.lineTo(drawEndX, drawEndY);
    // ctx.stroke();

    ctx.beginPath();
    ctx.clearRectForTexture(drawStartX, drawStartY, drawEndX - drawStartX, drawEndY - drawStartY);
}

export function setLineType(ctx: UniverRenderingContext, style: BorderStyleTypes) {
    if (style === BorderStyleTypes.HAIR) {
        ctx.setLineDash([1, 1]);
    } else if (style === BorderStyleTypes.DASH_DOT_DOT || style === BorderStyleTypes.MEDIUM_DASH_DOT_DOT) {
        ctx.setLineDash([2, 2, 5, 2, 2]);
    } else if (
        style === BorderStyleTypes.DASH_DOT ||
        style === BorderStyleTypes.MEDIUM_DASH_DOT ||
        style === BorderStyleTypes.SLANT_DASH_DOT
    ) {
        ctx.setLineDash([2, 5, 2]);
    } else if (style === BorderStyleTypes.DOTTED) {
        ctx.setLineDash([2]);
    } else if (style === BorderStyleTypes.DASHED || style === BorderStyleTypes.MEDIUM_DASHED) {
        ctx.setLineDash([3]);
    } else {
        ctx.setLineDash([0]);
    }
}

export function getLineOffset() {
    const ratio = getLineWith(1);
    return ratio - Math.floor(ratio);
}

export function getLineWith(width: number) {
    return Math.ceil((width / getDevicePixelRatio()) * 100) / 100;
}

export function getLineWidth(style: BorderStyleTypes) {
    let lineWidth = 1;
    if (
        style === BorderStyleTypes.MEDIUM ||
        style === BorderStyleTypes.MEDIUM_DASH_DOT ||
        style === BorderStyleTypes.MEDIUM_DASHED ||
        style === BorderStyleTypes.MEDIUM_DASH_DOT_DOT
    ) {
        lineWidth = 2;
    } else if (style === BorderStyleTypes.THICK) {
        lineWidth = 3;
    }

    return lineWidth;
}

export function calculateRectRotate(
    startPoint: Vector2,
    centerPoint: Vector2,
    radiusCenter: number,
    radiusVertex: number,
    offsetPoint: Vector2 = Vector2.create(0, 0)
) {
    const rotationVector = startPoint.add(centerPoint).rotateByPoint(radiusVertex);

    const newVector = rotationVector.subtract(centerPoint);

    const finalAngle = radiusVertex - radiusCenter;

    const finalXY = newVector.rotateByPoint(finalAngle, rotationVector);

    const newXY = finalXY.add(offsetPoint).transformCoordinateOnRotate(finalAngle);

    return newXY;
}

export function getRotateOrientation(angle: number) {
    return angle > 0 ? ORIENTATION_TYPE.DOWN : ORIENTATION_TYPE.UP;
}

// rotate calculate logic https://www.processon.com/view/link/630df928f346fb0714c9c4ec
// eslint-disable-next-line max-lines-per-function, complexity
export function getRotateOffsetAndFarthestHypotenuse(
    lines: IDocumentSkeletonLine[],
    rectWidth: number,
    vertexAngle: number
) {
    const rotateTranslateXList: number[] = [];
    let rotateTranslateY = 0;
    let rotatedHeight = 0;
    let rotatedWidth = 0;
    let fixOffsetX = 0;
    let fixOffsetY = 0;

    const orientation = getRotateOrientation(vertexAngle);
    const linesCount = lines.length;

    vertexAngle = Math.abs(vertexAngle);
    const tanTheta = Math.tan(vertexAngle);
    const sinTheta = Math.sin(vertexAngle);
    const cosTheta = Math.cos(vertexAngle);

    if (orientation === ORIENTATION_TYPE.UP) {
        let cumRectHeight = 0;

        for (let i = 0; i < linesCount; i++) {
            const line = lines[i];
            const { lineHeight: rectHeight = 0 } = line;
            cumRectHeight += i === 0 ? 0 : rectHeight;

            const currentRotateHeight = rectWidth * sinTheta + rectHeight * cosTheta;

            rotateTranslateXList.push(cumRectHeight / tanTheta);

            // rotatedHeight = Math.max(rotatedHeight, currentRotateHeight);

            if (currentRotateHeight > rotatedHeight) {
                rotatedHeight = currentRotateHeight;
            }

            if (i === 0) {
                rotatedWidth += rectHeight * sinTheta;
                fixOffsetY += rectHeight * cosTheta;
            }
            //else if (i === linesCount - 1) {
            //     rotatedWidth += rectWidth * cosTheta;
            // } else {
            //     rotatedWidth += cumRectHeight / sinTheta;
            // }
        }

        rotatedWidth += cumRectHeight / sinTheta + rectWidth * cosTheta;
        fixOffsetY -= rotatedHeight;
        // fixOffsetY = -rectHeight * cosTheta;
    } else {
        let maxOffsetX = 0;
        let maxOffsetLineIndex = -1;
        const rotateOffsetXList = [];
        for (let i = linesCount - 1; i >= 0; i--) {
            const line = lines[i];
            const { lineHeight: rectHeight = 0 } = line;

            const offsetX = rectHeight / tanTheta;
            const currentRotateHeight = (rectWidth + offsetX) * sinTheta;

            // if (i === linesCount - 1) {
            //     rotateTranslateXList.unshift(rectHeight * tanTheta);
            // } else {
            //     rotateTranslateXList.unshift(rectHeight / tanTheta);
            // }

            rotateOffsetXList.unshift(rectHeight / tanTheta);

            if (currentRotateHeight > rotatedHeight) {
                rotatedHeight = currentRotateHeight;
                maxOffsetX = offsetX;
                maxOffsetLineIndex = i;
            }

            if (i === 0) {
                rotatedWidth += rectHeight * sinTheta;
            } else if (i === linesCount - 1) {
                rotatedWidth += rectWidth * cosTheta + rectHeight / sinTheta;
            } else {
                rotatedWidth += rectHeight / sinTheta;
            }
        }

        let cumRotateHeightFix = lines[maxOffsetLineIndex]?.lineHeight || 0;

        let cumBlowValue = 0;
        for (let i = maxOffsetLineIndex + 1; i <= linesCount - 1; i++) {
            const line = lines[i];
            const { lineHeight: rectHeight = 0 } = line;
            // const preRotateTranslateX = i === maxOffsetLineIndex ? 0 : rotateTranslateXList[i - 1];
            // rotateTranslateXList[i] -= preRotateTranslateX;

            cumRotateHeightFix += rectHeight;

            cumBlowValue += rotateOffsetXList[i] || 0;

            rotateTranslateXList[i] = -cumBlowValue;
        }

        cumBlowValue = 0;
        for (let i = maxOffsetLineIndex - 1; i >= 0; i--) {
            const line = lines[i];
            const { lineHeight: rectHeight = 0 } = line;

            cumBlowValue += rotateOffsetXList[i + 1] || 0;
            rotateTranslateXList[i] = cumBlowValue;

            rotateTranslateY += rectHeight;
        }

        rotateTranslateXList[maxOffsetLineIndex] = 0;

        if (linesCount === 1) {
            rotatedWidth += rectWidth * cosTheta;
            // rotateTranslateXList[0] = 0;
        }

        fixOffsetX = cumRotateHeightFix / sinTheta - maxOffsetX * cosTheta;
    }

    return {
        rotateTranslateXList,
        rotatedHeight,
        rotatedWidth,
        fixOffsetX,
        fixOffsetY,
        rotateTranslateY,
    };
}

/**
 * Align the resolution, an alignment needs to be done in special cases where the resolution is 1.5, 1.25, etc.
 * @returns {left: number, top: number} offset
 */
export function getTranslateInSpreadContextWithPixelRatio() {
    const offset = 0.5 - getLineOffset();
    return {
        left: offset,
        top: offset,
    };
}
