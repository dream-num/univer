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

import type { IShapeProps, IViewportInfo, UniverRenderingContext } from '@univerjs/engine-render';
import { CURSOR_TYPE, Rect, Shape } from '@univerjs/engine-render';

export interface IHeadingCollapseColors {
    normal: string;
    hover: string;
    tooltipBackground: string;
    tooltipText: string;
}

export class HeadingCollapseShape extends Shape<IShapeProps> {
    private _collapsed = false;
    private _label = '';
    private _colors: IHeadingCollapseColors;
    private _hovered = false;
    private _tooltipVisible = false;
    private _tooltipTimer: ReturnType<typeof setTimeout> | null = null;
    private _pressed = false;

    constructor(key: string, colors: IHeadingCollapseColors, activate: () => void) {
        super(key, { width: 24, height: 28, debounceParentDirty: false });
        this._colors = colors;
        this.cursor = CURSOR_TYPE.POINTER;
        this.disposeWithMe(this.onPointerEnter$.subscribeEvent((event) => {
            if (this._hovered || event.buttons) {
                return;
            }
            this._hovered = true;
            this._tooltipTimer = setTimeout(() => {
                this._tooltipTimer = null;
                this._tooltipVisible = true;
                this.makeDirty(true);
            }, 500);
            this.makeDirty(true);
        }));
        this.disposeWithMe(this.onPointerLeave$.subscribeEvent(() => this.resetHover()));
        this.disposeWithMe(this.onPointerDown$.subscribeEvent((event, state) => {
            state.stopPropagation();
            event.preventDefault();
            this._pressed = event.button === 0;
        }));
        this.disposeWithMe(this.onPointerUp$.subscribeEvent((event, state) => {
            state.stopPropagation();
            event.preventDefault();
            const activateButton = this._pressed && event.button === 0;
            this._pressed = false;
            this._hideTooltip();
            if (activateButton) {
                activate();
            }
        }));
        this.disposeWithMe(this.onClick$.subscribeEvent((_event, state) => state.stopPropagation()));
        this.disposeWithMe(this.onDblclick$.subscribeEvent((_event, state) => state.stopPropagation()));
    }

    update(collapsed: boolean, label: string, colors: IHeadingCollapseColors): void {
        if (collapsed === this._collapsed && label === this._label && colors === this._colors) {
            return;
        }
        this._collapsed = collapsed;
        this._label = label;
        this._colors = colors;
        this.makeDirty(true);
    }

    resetHover(): void {
        this._hideTooltip();
        this._pressed = false;
        if (this._hovered) {
            this._hovered = false;
            this.makeDirty(true);
        }
    }

    private _hideTooltip(): void {
        if (this._tooltipTimer !== null) {
            clearTimeout(this._tooltipTimer);
            this._tooltipTimer = null;
        }
        if (this._tooltipVisible) {
            this._tooltipVisible = false;
            this.makeDirty(true);
        }
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo): void {
        ctx.fillStyle = this._hovered ? this._colors.hover : this._colors.normal;
        ctx.beginPath();
        if (this._collapsed) {
            ctx.moveTo(9, 8);
            ctx.lineTo(16, 14);
            ctx.lineTo(9, 20);
        } else {
            ctx.moveTo(6, 11);
            ctx.lineTo(18, 11);
            ctx.lineTo(12, 18);
        }
        ctx.closePath();
        ctx.fill();
        if (!this._tooltipVisible) {
            return;
        }
        ctx.save();
        ctx.font = '12px sans-serif';
        const width = ctx.measureText(this._label).width + 20;
        const viewport = bounds?.viewBound;
        const centeredLeft = (this.width - width) / 2;
        const left = viewport
            ? Math.max(viewport.left - this.left, Math.min(centeredLeft, viewport.right - this.left - width))
            : centeredLeft;
        // Canvas clips at the viewport edge, so keep the tooltip readable when there is no room above.
        const below = viewport != null && this.top - 36 < viewport.top;
        ctx.translate(left, below ? this.height + 8 : -36);
        Rect.drawWith(ctx, { width, height: 28, radius: 6, fill: this._colors.tooltipBackground });
        ctx.fillStyle = this._colors.tooltipBackground;
        ctx.beginPath();
        const arrow = this.width / 2 - left;
        const arrowBase = below ? 0 : 28;
        ctx.moveTo(arrow - 4, arrowBase);
        ctx.lineTo(arrow, below ? -4 : 32);
        ctx.lineTo(arrow + 4, arrowBase);
        ctx.fill();
        ctx.fillStyle = this._colors.tooltipText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._label, width / 2, 14);
        ctx.restore();
    }

    override dispose(): void {
        this.resetHover();
        super.dispose();
    }
}
