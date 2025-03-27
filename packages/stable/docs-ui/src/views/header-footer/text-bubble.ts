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

import type {
    IRectProps,
    IShapeProps,
    Rect,
    UniverRenderingContext,
} from '@univerjs/engine-render';
import { Shape } from '@univerjs/engine-render';

export const COLLAB_CURSOR_LABEL_HEIGHT = 18;
export const COLLAB_CURSOR_LABEL_MAX_WIDTH = 200;
export const COLLAB_CURSOR_LABEL_TEXT_PADDING_LR = 6;
export const COLLAB_CURSOR_LABEL_TEXT_PADDING_TB = 4;

function drawBubble(ctx: CanvasRenderingContext2D, props: IRectProps | Rect): void {
    let { radius, width, height } = props;

    radius = radius ?? 0;
    width = width ?? 30;
    height = height ?? 30;
    let bottomRight = 0;
    bottomRight = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height - bottomRight);
    ctx.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
    ctx.closePath();

    if (props.fill) {
        ctx.save();
        ctx.fillStyle = props.fill!;
        if (props.fillRule === 'evenodd') {
            ctx.fill('evenodd');
        } else {
            ctx.fill();
        }
        ctx.restore();
    }
}

export interface ITextBubbleShapeProps extends IShapeProps {
    color: string;
    text: string;
}

/**
 * Render a single collaborated cursor on the canvas.
 */
export class TextBubbleShape<
    T extends ITextBubbleShapeProps = ITextBubbleShapeProps
> extends Shape<T> {
    color: string;
    text: string;

    constructor(key: string, props: T) {
        super(key, props);

        this.color = props?.color;
        this.text = props?.text;
    }

    static override drawWith(ctx: CanvasRenderingContext2D, props: ITextBubbleShapeProps): void {
        const { text, color } = props;
        ctx.save();
        // Measure the text width
        ctx.font = '13px Source Han Sans CN';
        const textWidth = ctx.measureText(text).width;
        const realInfoWidth = Math.min(
            textWidth + 2 * COLLAB_CURSOR_LABEL_TEXT_PADDING_LR,
            COLLAB_CURSOR_LABEL_MAX_WIDTH
        );

        // Draw the bubble. which is rect-like
        drawBubble(ctx, {
            height: COLLAB_CURSOR_LABEL_HEIGHT,
            width: realInfoWidth,
            radius: 4,
            fill: color,
            evented: false,
        });

        ctx.fillStyle = 'rgba(58, 96, 247, 1)';

        // Draw the text with truncation if needed
        const offsetX = COLLAB_CURSOR_LABEL_TEXT_PADDING_LR;
        const offsetY = COLLAB_CURSOR_LABEL_HEIGHT - COLLAB_CURSOR_LABEL_TEXT_PADDING_TB;
        const maxTextWidth = COLLAB_CURSOR_LABEL_MAX_WIDTH - 2 * COLLAB_CURSOR_LABEL_TEXT_PADDING_LR;
        if (textWidth > maxTextWidth) {
            let truncatedText = '';
            let currentWidth = 0;
            for (const element of text) {
                const charWidth = ctx.measureText(element).width;
                if (currentWidth + charWidth <= maxTextWidth - ctx.measureText('...').width) {
                    truncatedText += element;
                    currentWidth += charWidth;
                } else {
                    truncatedText += '...';
                    break;
                }
            }
            ctx.fillText(truncatedText, offsetX, offsetY);
        } else {
            ctx.fillText(text, offsetX, offsetY);
        }

        ctx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext) {
        TextBubbleShape.drawWith(ctx, this);
    }
}
