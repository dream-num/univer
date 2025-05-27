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

import type { IKeyValue, Nullable } from '@univerjs/core';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { HorizontalAlign, VerticalAlign } from '@univerjs/core';
import { DocSimpleSkeleton } from '../components/docs/layout/doc-simple-skeleton';
import { Shape } from './shape';

export interface ITextProps extends IShapeProps {
    width: number;
    height: number;
    text: string;
    fontStyle: string;
    warp?: boolean;
    hAlign?: HorizontalAlign;
    vAlign?: VerticalAlign;
    color?: Nullable<string>;
    strokeLine?: boolean;
    underline?: boolean;
}

export const TEXT_OBJECT_ARRAY = ['text', 'fontStyle', 'warp', 'hAlign', 'vAlign', 'width', 'height', 'color'];

export class Text extends Shape<ITextProps> {
    text: string;
    fontStyle: string;
    warp: boolean;
    hAlign: HorizontalAlign;
    vAlign: VerticalAlign;
    skeleton: DocSimpleSkeleton;

    constructor(key: string, props: ITextProps) {
        super(key, props);

        this.width = props.width;
        this.height = props.height;
        this.text = props.text;
        this.fontStyle = props.fontStyle;
        this.warp = props.warp ?? false;
        this.hAlign = props.hAlign ?? HorizontalAlign.LEFT;
        this.vAlign = props.vAlign ?? VerticalAlign.TOP;
        this.skeleton = new DocSimpleSkeleton(
            props.text,
            props.fontStyle,
            Boolean(props.warp),
            props.width,
            props.height
        );
    }

    static override drawWith(ctx: UniverRenderingContext, props: ITextProps, _skeleton?: DocSimpleSkeleton) {
        const { text, fontStyle, warp, hAlign, vAlign, width, height, left = 0, top = 0 } = props;
        const skeleton = _skeleton ?? new DocSimpleSkeleton(text, fontStyle, Boolean(warp), width, vAlign === VerticalAlign.TOP ? height : Infinity);
        const lines = skeleton.calculate();
        const totalHeight = skeleton.getTotalHeight();
        const offsetY = vAlign === VerticalAlign.TOP ? 0 : vAlign === VerticalAlign.MIDDLE ? (height - totalHeight) / 2 : height - totalHeight;
        let lineTop = top + offsetY;

        // Set font once outside the loop for better performance
        ctx.save();
        ctx.font = fontStyle;

        ctx.fillStyle = props.color ?? '#000000';

        // Get font metrics using FontCache for consistency with height calculation
        for (const line of lines) {
            const lineHeight = line.height;
            const lineWidth = line.width;
            const lineX = (hAlign === HorizontalAlign.LEFT || hAlign === HorizontalAlign.UNSPECIFIED) ? 0 : (hAlign === HorizontalAlign.CENTER ? (width - lineWidth) / 2 : (width - lineWidth));
            const baselineY = lineTop + line.baseline;

            // Draw the text
            ctx.fillText(line.text, left + lineX, baselineY);

            // Draw underline if specified
            if (props.underline) {
                this._drawTextDecoration(ctx, {
                    x: left + lineX,
                    y: lineTop + lineHeight - 1, // Position underline near bottom of line
                    width: lineWidth,
                    color: props.color || '#000000',
                    lineWidth: 1,
                });
            }

            // Draw strikethrough if specified
            if (props.strokeLine) {
                this._drawTextDecoration(ctx, {
                    x: left + lineX,
                    y: lineTop + line.baseline - lineHeight * 0.3, // Position strikethrough roughly in middle
                    width: lineWidth,
                    color: props.color || '#000000',
                    lineWidth: 1,
                });
            }

            lineTop = lineTop + lineHeight;
        }

        ctx.restore();

        return totalHeight;
    }

    /**
     * Draw text decoration lines (underline, strikethrough, etc.)
     */
    private static _drawTextDecoration(ctx: UniverRenderingContext, options: {
        x: number;
        y: number;
        width: number;
        color: string;
        lineWidth: number;
    }) {
        const { x, y, width, color, lineWidth } = options;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();

        ctx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext) {
        this.skeleton.calculate();
        Text.drawWith(ctx, this, this.skeleton);
    }

    override makeDirty(state?: boolean): this | undefined {
        super.makeDirty(state);
        if (state) {
            this.skeleton.makeDirty();
        }
        return this;
    }

    override toJson() {
        const props: IKeyValue = {};
        TEXT_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Text]) {
                props[key] = this[key as keyof Text];
            }
        });

        return {
            ...super.toJson(),
            ...props,
        };
    }
}
