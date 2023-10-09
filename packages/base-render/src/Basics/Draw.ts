/* eslint-disable no-magic-numbers */
import { BorderStyleTypes, IPosition } from '@univerjs/core';

import { BORDER_TYPE, ORIENTATION_TYPE } from './Const';
import { IDocumentSkeletonLine } from './IDocumentSkeletonCached';
import { createCanvasElement } from './Tools';
import { Vector2 } from './Vector2';

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
    return Math.ceil(_pixelRatio * 10) / 10;
}

export function drawLineByBorderType(ctx: CanvasRenderingContext2D, type: BORDER_TYPE, position: IPosition) {
    let drawStartX = 0;
    let drawStartY = 0;
    let drawEndX = 0;
    let drawEndY = 0;
    const { startX, startY, endX, endY } = position;
    if (type === BORDER_TYPE.TOP) {
        drawStartX = startX;
        drawStartY = startY;
        drawEndX = endX;
        drawEndY = startY;
    } else if (type === BORDER_TYPE.BOTTOM) {
        drawStartX = startX;
        drawStartY = endY;
        drawEndX = endX;
        drawEndY = endY;
    } else if (type === BORDER_TYPE.LEFT) {
        drawStartX = startX;
        drawStartY = startY;
        drawEndX = startX;
        drawEndY = endY;
    } else if (type === BORDER_TYPE.RIGHT) {
        drawStartX = endX;
        drawStartY = startY;
        drawEndX = endX;
        drawEndY = endY;
    }
    ctx.beginPath();
    ctx.moveTo(drawStartX, drawStartY);
    ctx.lineTo(drawEndX, drawEndY);
    ctx.stroke();
}

export function setLineType(ctx: CanvasRenderingContext2D, style: BorderStyleTypes) {
    if (style === BorderStyleTypes.HAIR) {
        ctx.setLineDash([1, 2]);
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
    return Math.ceil((width / getDevicePixelRatio()) * 10) / 10;
}

export function getLineWidth(style: BorderStyleTypes) {
    let lineWidth = getLineWith(1);
    if (
        style === BorderStyleTypes.MEDIUM ||
        style === BorderStyleTypes.MEDIUM_DASH_DOT ||
        style === BorderStyleTypes.MEDIUM_DASHED ||
        style === BorderStyleTypes.MEDIUM_DASH_DOT_DOT
    ) {
        lineWidth = getLineWith(2);
    } else if (style === BorderStyleTypes.THICK) {
        lineWidth = getLineWith(3);
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
    // const centerOffset = Vector2.create(width / 2, height / 2);

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
// eslint-disable-next-line max-lines-per-function
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

            const currentRotateHeight = (rectHeight / tanTheta + rectWidth) * sinTheta;

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

        let cumRotateHeightFix = lines[maxOffsetLineIndex].lineHeight || 0;

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
 * @param pixelRatio devicePixelRatio
 * @returns
 */
export function getTranslateInSpreadContextWithPixelRatio() {
    const offset = 0.5 - getLineOffset();
    return {
        left: offset,
        top: offset,
    };
}
