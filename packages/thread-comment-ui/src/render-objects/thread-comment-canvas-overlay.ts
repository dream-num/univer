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

import type { IViewportInfo, UniverRenderingContext, Vector2 } from '@univerjs/engine-render';
import { BaseObject } from '@univerjs/engine-render';

export interface IThreadCommentCanvasMarker {
    commentId: string;
    x: number;
    y: number;
}

export interface IThreadCommentCanvasUnderline {
    commentId: string;
    left: number;
    top: number;
    width: number;
}

export interface IThreadCommentCanvasOutline {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IThreadCommentCanvasOverlayState {
    accentColor: string;
    foregroundColor: string;
    outlineColor: string;
    zoomRatio: number;
    markers: readonly IThreadCommentCanvasMarker[];
    underlines: readonly IThreadCommentCanvasUnderline[];
    focusedCommentIds?: readonly string[];
    focusOutlines?: readonly IThreadCommentCanvasOutline[];
    previewMarker?: Omit<IThreadCommentCanvasMarker, 'commentId'> | null;
    previewUnderline?: Omit<IThreadCommentCanvasUnderline, 'commentId'> | null;
}

const MARKER_SIZE = 24;
const MARKER_IDLE_OPACITY = 0.58;
const MARKER_PREVIEW_OPACITY = 0.42;
const UNDERLINE_WIDTH = 2;
const UNDERLINE_HIT_PADDING = 4;
const OUTLINE_PADDING = 2;

export class ThreadCommentCanvasOverlay extends BaseObject {
    private _state: IThreadCommentCanvasOverlayState;
    private _hoveredCommentId: string | null = null;
    private _hitCommentId: string | null = null;

    constructor(key: string, state: IThreadCommentCanvasOverlayState) {
        super(key);
        this.evented = true;
        this._state = state;
        this.show();
    }

    get hitCommentId(): string | null {
        return this._hitCommentId;
    }

    updateState(state: Partial<IThreadCommentCanvasOverlayState>): void {
        this._state = { ...this._state, ...state };
        if (this._hitCommentId && !this._containsComment(this._hitCommentId)) {
            this._hitCommentId = null;
        }
        if (this._hoveredCommentId && !this._containsComment(this._hoveredCommentId)) {
            this._hoveredCommentId = null;
        }
        if ('previewMarker' in state || 'previewUnderline' in state) {
            this.makeDirtyNoDebounce(true);
        } else {
            this.makeDirty(true);
        }
    }

    clearHover(): void {
        if (this._hoveredCommentId) {
            this._hoveredCommentId = null;
            this.makeDirty(true);
        }
        this._hitCommentId = null;
    }

    override isHit(coord: Vector2): boolean {
        const zoomRatio = this._getZoomRatio();
        const halfSize = MARKER_SIZE / zoomRatio / 2;
        let marker: IThreadCommentCanvasMarker | undefined;
        for (let index = this._state.markers.length - 1; index >= 0; index -= 1) {
            const item = this._state.markers[index];
            if (!item) {
                continue;
            }
            if (
                coord.x >= item.x - halfSize
                && coord.x <= item.x + halfSize
                && coord.y >= item.y - halfSize
                && coord.y <= item.y + halfSize
            ) {
                marker = item;
                break;
            }
        }

        let underline: IThreadCommentCanvasUnderline | undefined;
        if (!marker) {
            for (let index = this._state.underlines.length - 1; index >= 0; index -= 1) {
                const item = this._state.underlines[index];
                if (!item) {
                    continue;
                }
                if (
                    coord.x >= item.left
                    && coord.x <= item.left + item.width
                    && Math.abs(coord.y - item.top) <= UNDERLINE_HIT_PADDING / zoomRatio
                ) {
                    underline = item;
                    break;
                }
            }
        }
        const commentId = marker?.commentId ?? underline?.commentId ?? null;

        this._hitCommentId = commentId;
        if (commentId !== this._hoveredCommentId) {
            this._hoveredCommentId = commentId;
            this.makeDirty(true);
        }
        return commentId !== null;
    }

    override render(ctx: UniverRenderingContext, _bounds: IViewportInfo): this {
        const zoomRatio = this._getZoomRatio();

        this._state.underlines.forEach((underline) => this._renderUnderline(ctx, underline, zoomRatio, 1));
        this._state.focusOutlines?.forEach((outline) => this._renderOutline(ctx, outline, zoomRatio));
        if (this._state.previewUnderline) {
            this._renderUnderline(ctx, this._state.previewUnderline, zoomRatio, MARKER_PREVIEW_OPACITY);
        }
        this._state.markers.forEach((marker) => this._renderMarker(
            ctx,
            marker,
            zoomRatio,
            marker.commentId === this._hoveredCommentId || this._state.focusedCommentIds?.includes(marker.commentId)
                ? 1
                : MARKER_IDLE_OPACITY
        ));
        if (this._state.previewMarker) {
            this._renderMarker(ctx, this._state.previewMarker, zoomRatio, MARKER_PREVIEW_OPACITY);
        }

        this.makeDirty(false);
        return this;
    }

    private _getZoomRatio(): number {
        return Number.isFinite(this._state.zoomRatio) && this._state.zoomRatio > 0
            ? this._state.zoomRatio
            : 1;
    }

    private _containsComment(commentId: string): boolean {
        return this._state.markers.some((marker) => marker.commentId === commentId)
            || this._state.underlines.some((underline) => underline.commentId === commentId);
    }

    private _renderUnderline(
        ctx: UniverRenderingContext,
        underline: Omit<IThreadCommentCanvasUnderline, 'commentId'>,
        zoomRatio: number,
        opacity: number
    ): void {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = this._state.accentColor;
        ctx.lineWidth = UNDERLINE_WIDTH / zoomRatio;
        ctx.beginPath();
        ctx.moveTo(underline.left, underline.top);
        ctx.lineTo(underline.left + underline.width, underline.top);
        ctx.stroke();
        ctx.restore();
    }

    private _renderOutline(
        ctx: UniverRenderingContext,
        outline: IThreadCommentCanvasOutline,
        zoomRatio: number
    ): void {
        const padding = OUTLINE_PADDING / zoomRatio;
        ctx.save();
        ctx.strokeStyle = this._state.accentColor;
        ctx.lineWidth = UNDERLINE_WIDTH / zoomRatio;
        ctx.strokeRect(
            outline.left - padding,
            outline.top - padding,
            outline.width + padding * 2,
            outline.height + padding * 2
        );
        ctx.restore();
    }

    private _renderMarker(
        ctx: UniverRenderingContext,
        marker: Omit<IThreadCommentCanvasMarker, 'commentId'>,
        zoomRatio: number,
        opacity: number
    ): void {
        const size = MARKER_SIZE / zoomRatio;
        const left = marker.x - size / 2;
        const top = marker.y - size / 2;
        const radius = 4 / zoomRatio;
        const tail = 4 / zoomRatio;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this._state.accentColor;
        ctx.strokeStyle = this._state.outlineColor;
        ctx.lineWidth = 1.5 / zoomRatio;
        ctx.beginPath();
        ctx.moveTo(left + radius, top);
        ctx.lineTo(left + size - radius, top);
        ctx.quadraticCurveTo(left + size, top, left + size, top + radius);
        ctx.lineTo(left + size, top + size - tail - radius);
        ctx.quadraticCurveTo(left + size, top + size - tail, left + size - radius, top + size - tail);
        ctx.lineTo(left + size / 2 + tail, top + size - tail);
        ctx.lineTo(left + size / 2, top + size);
        ctx.lineTo(left + size / 2 - tail, top + size - tail);
        ctx.lineTo(left + radius, top + size - tail);
        ctx.quadraticCurveTo(left, top + size - tail, left, top + size - tail - radius);
        ctx.lineTo(left, top + radius);
        ctx.quadraticCurveTo(left, top, left + radius, top);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this._state.foregroundColor;
        const dotRadius = 1.2 / zoomRatio;
        const dotY = top + size * 0.43;
        [0.32, 0.5, 0.68].forEach((ratio) => {
            ctx.beginPath();
            ctx.arc(left + size * ratio, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}
