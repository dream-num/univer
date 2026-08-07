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

export interface IUnitPresenceLabelDrawingOptions {
    color: string;
    text: string;
    textColor: string;
}

export const UNIT_PRESENCE_LABEL_HEIGHT = 20;
export const UNIT_PRESENCE_POINTER_WIDTH = 212;
export const UNIT_PRESENCE_POINTER_HEIGHT = 42;
const UNIT_PRESENCE_LABEL_MAX_WIDTH = 200;
const UNIT_PRESENCE_LABEL_HORIZONTAL_PADDING = 4;
const UNIT_PRESENCE_LABEL_VERTICAL_PADDING = 5;
const UNIT_PRESENCE_LABEL_RADIUS = 4;
const UNIT_PRESENCE_LABEL_FONT = 'bold 13px Source Han Sans CN, Arial, sans-serif';
const UNIT_PRESENCE_POINTER_PATH = 'M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z';
let unitPresencePointerPath: Path2D | null = null;

export function drawUnitPresencePointer(
    ctx: CanvasRenderingContext2D,
    options: IUnitPresenceLabelDrawingOptions
): void {
    ctx.save();
    ctx.fillStyle = options.color;
    unitPresencePointerPath ??= new Path2D(UNIT_PRESENCE_POINTER_PATH);
    ctx.fill(unitPresencePointerPath);
    ctx.transform(1, 0, 0, 1, 12, 22);
    drawUnitPresenceLabel(ctx, options);
    ctx.restore();
}

export function drawUnitPresenceLabel(
    ctx: CanvasRenderingContext2D,
    options: IUnitPresenceLabelDrawingOptions
): void {
    const { color, text, textColor } = options;
    ctx.save();
    ctx.font = UNIT_PRESENCE_LABEL_FONT;

    const maxTextWidth = UNIT_PRESENCE_LABEL_MAX_WIDTH - 2 * UNIT_PRESENCE_LABEL_HORIZONTAL_PADDING;
    const displayText = truncateText(ctx, text, maxTextWidth);
    const labelWidth = Math.min(
        ctx.measureText(displayText).width + 2 * UNIT_PRESENCE_LABEL_HORIZONTAL_PADDING,
        UNIT_PRESENCE_LABEL_MAX_WIDTH
    );

    drawRoundedRect(ctx, labelWidth, UNIT_PRESENCE_LABEL_HEIGHT, UNIT_PRESENCE_LABEL_RADIUS);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.fillText(
        displayText,
        UNIT_PRESENCE_LABEL_HORIZONTAL_PADDING,
        UNIT_PRESENCE_LABEL_HEIGHT - UNIT_PRESENCE_LABEL_VERTICAL_PADDING
    );
    ctx.restore();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) {
        return text;
    }

    const ellipsis = '...';
    const availableWidth = maxWidth - ctx.measureText(ellipsis).width;
    let result = '';
    let width = 0;
    for (const character of text) {
        const characterWidth = ctx.measureText(character).width;
        if (width + characterWidth > availableWidth) {
            break;
        }
        result += character;
        width += characterWidth;
    }
    return `${result}${ellipsis}`;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, width: number, height: number, radius: number): void {
    const right = width;
    const bottom = height;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(right - radius, 0);
    ctx.quadraticCurveTo(right, 0, right, radius);
    ctx.lineTo(right, bottom - radius);
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
    ctx.lineTo(0, bottom);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
}
