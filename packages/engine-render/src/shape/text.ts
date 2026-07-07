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

import type { Nullable } from '@univerjs/core';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { CellValueType, HorizontalAlign, TextDecoration, VerticalAlign } from '@univerjs/core';
import { COLOR_BLACK_RGB } from '../basics';
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
    underlineType?: TextDecoration;
    cellValueType?: Nullable<CellValueType>;
}

export const TEXT_OBJECT_ARRAY = ['text', 'fontStyle', 'warp', 'hAlign', 'vAlign', 'width', 'height', 'color'];

export class Text extends Shape<ITextProps> {
    private static readonly _MAX_LAYOUT_CACHE_SIZE = 5000;
    private static readonly _layoutCache = new Map<string, {
        lines: ReturnType<DocSimpleSkeleton['calculate']>;
        totalHeight: number;
    }>();

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
        const { text, fontStyle, warp, hAlign, vAlign, width, height, left = 0, top = 0, cellValueType } = props;
        const cachedLayout = !_skeleton && !warp ? Text._getCachedLayout(text, fontStyle) : null;
        const skeleton = cachedLayout ? null : _skeleton ?? new DocSimpleSkeleton(text, fontStyle, Boolean(warp), width, vAlign === VerticalAlign.TOP ? height : Infinity);
        const lines = cachedLayout?.lines ?? skeleton!.calculate();
        const totalHeight = cachedLayout?.totalHeight ?? skeleton!.getTotalHeight();
        const offsetY = vAlign === VerticalAlign.TOP ? 0 : vAlign === VerticalAlign.MIDDLE ? (height - totalHeight) / 2 : height - totalHeight;
        let lineTop = top + offsetY;

        // Set font once outside the loop for better performance
        ctx.save();
        ctx.font = fontStyle;

        ctx.fillStyle = props.color ?? COLOR_BLACK_RGB;

        // Get font metrics using FontCache for consistency with height calculation
        for (const line of lines) {
            const lineHeight = line.height;
            const lineWidth = line.width;
            /**
             * Optimized number rendering when cell width is less than text width and does not wrap.
             * - Excel: The number rendering are automatically rounded as the cell width decreases, so the text width will always be less than the cell width.
             * - Google Sheets: The number rendering are left-aligned regardless of horizontal alignment when the cell width is less than text width.
             * - WPS: As the cell width decreases, the excess number will be displayed as "...", so the text width will always be less than the cell width.
             * We use google sheets behavior here, which is to left-align the text when the cell width is less than the text width and not wrapped.
             */
            let lineX: number = 0;
            if (!(!warp && width < lineWidth && cellValueType === CellValueType.NUMBER)) {
                switch (hAlign) {
                    case HorizontalAlign.CENTER:
                        lineX = (width - lineWidth) / 2;
                        break;
                    case HorizontalAlign.RIGHT:
                        lineX = width - lineWidth;
                        break;
                    default:
                        lineX = 0;
                }
            }

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
                    lineType: props.underlineType ?? TextDecoration.SINGLE,
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
                    lineType: TextDecoration.SINGLE,
                });
            }

            lineTop = lineTop + lineHeight;
        }

        ctx.restore();

        return totalHeight;
    }

    static drawPlainWith(ctx: UniverRenderingContext, props: ITextProps) {
        const { text, fontStyle, hAlign, vAlign, width, height, left = 0, top = 0, cellValueType } = props;
        const cachedLayout = Text._getCachedLayout(text, fontStyle);
        const { lines, totalHeight } = cachedLayout;
        const offsetY = vAlign === VerticalAlign.TOP ? 0 : vAlign === VerticalAlign.MIDDLE ? (height - totalHeight) / 2 : height - totalHeight;
        let lineTop = top + offsetY;

        ctx.font = fontStyle;
        ctx.fillStyle = props.color ?? COLOR_BLACK_RGB;

        for (const line of lines) {
            const lineWidth = line.width;
            let lineX = 0;
            if (!(width < lineWidth && cellValueType === CellValueType.NUMBER)) {
                switch (hAlign) {
                    case HorizontalAlign.CENTER:
                        lineX = (width - lineWidth) / 2;
                        break;
                    case HorizontalAlign.RIGHT:
                        lineX = width - lineWidth;
                        break;
                    default:
                        lineX = 0;
                }
            }

            ctx.fillText(line.text, left + lineX, lineTop + line.baseline);
            lineTop += line.height;
        }

        return totalHeight;
    }

    private static _getCachedLayout(text: string, fontStyle: string) {
        const cacheKey = `${fontStyle}\u0000${text}`;
        const cached = Text._layoutCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const skeleton = new DocSimpleSkeleton(text, fontStyle, false, 0, Infinity);
        const layout = {
            lines: skeleton.calculate(),
            totalHeight: skeleton.getTotalHeight(),
        };

        Text._layoutCache.set(cacheKey, layout);
        if (Text._layoutCache.size > Text._MAX_LAYOUT_CACHE_SIZE) {
            const oldestKey = Text._layoutCache.keys().next().value;
            if (oldestKey !== undefined) {
                Text._layoutCache.delete(oldestKey);
            }
        }

        return layout;
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
        lineType: TextDecoration;
    }) {
        const { x, y, width, color, lineWidth, lineType } = options;
        const offsetY = this._isDouble(lineType) ? y - 0.8 : y;

        ctx.save();
        ctx.strokeStyle = color;
        this._setLineType(ctx, lineType, lineWidth);
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        this._drawLine(ctx, x, offsetY, width, lineType);

        if (this._isDouble(lineType)) {
            ctx.moveTo(x, offsetY + 2);
            this._drawLine(ctx, x, offsetY + 2, width, lineType);
        }

        ctx.stroke();
        ctx.restore();
    }

    private static _drawLine(ctx: UniverRenderingContext, x: number, y: number, width: number, lineType: TextDecoration) {
        if (this._isWave(lineType)) {
            for (let i = 1; i < width + 1; i++) {
                ctx.lineTo(i, y + 0.8 * Math.sin(i * 1)); // y + amplitude * frequency
            }
        } else {
            ctx.lineTo(x + width, y);
        }
    }

    private static _setLineType(ctx: UniverRenderingContext, style: TextDecoration, lineWidth: number) {
        switch (style) {
            case TextDecoration.SINGLE:
            case TextDecoration.DOUBLE:
                ctx.lineWidth = 1;
                ctx.setLineDash([0]);
                return;
            case TextDecoration.DOTTED:
                ctx.lineWidth = 1;
                ctx.setLineDash([2]);
                return;
            case TextDecoration.DOTTED_HEAVY:
                ctx.lineWidth = 2;
                ctx.setLineDash([2]);
                return;
            case TextDecoration.DASH:
                ctx.lineWidth = 1;
                ctx.setLineDash([3]);
                return;
            case TextDecoration.DASHED_HEAVY:
                ctx.lineWidth = 2;
                ctx.setLineDash([3]);
                return;
            case TextDecoration.DASH_LONG:
                ctx.lineWidth = 1;
                ctx.setLineDash([6]);
                return;
            case TextDecoration.DASH_LONG_HEAVY:
                ctx.lineWidth = 2;
                ctx.setLineDash([6]);
                return;
            case TextDecoration.DOT_DASH:
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 5, 2]);
                return;
            case TextDecoration.DASH_DOT_HEAVY:
                ctx.lineWidth = 2;
                ctx.setLineDash([2, 5, 2]);
                return;
            case TextDecoration.DOT_DOT_DASH:
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 2, 5, 2, 2]);
                return;
            case TextDecoration.DASH_DOT_DOT_HEAVY:
                ctx.lineWidth = 2;
                ctx.setLineDash([2, 2, 5, 2, 2]);
                return;
            case TextDecoration.THICK:
                ctx.lineWidth = 2;
                ctx.setLineDash([0]);
                return;
            case TextDecoration.WAVE:
            case TextDecoration.WAVY_DOUBLE:
                ctx.lineWidth = 1;
                return;
            case TextDecoration.WAVY_HEAVY:
                ctx.lineWidth = 2;
                return;
            default:
                ctx.setLineDash([0]);
                ctx.lineWidth = lineWidth;
        }
    }

    private static _isWave(lineType: TextDecoration): boolean {
        return lineType === TextDecoration.WAVE || lineType === TextDecoration.WAVY_HEAVY || lineType === TextDecoration.WAVY_DOUBLE;
    }

    private static _isDouble(lineType: TextDecoration): boolean {
        return lineType === TextDecoration.DOUBLE || lineType === TextDecoration.WAVY_DOUBLE;
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
        const props: Record<string, any> = {};
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
