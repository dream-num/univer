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

import type { UniverRenderingContext } from '@univerjs/engine-render';
import type { CanvasIconName } from '@univerjs/icons-svg';
import { UniverInstanceType } from '@univerjs/core';
import { getOleOfficeType } from '@univerjs/drawing';
import { drawCanvasIcon } from '@univerjs/icons-svg';

interface IOleCanvasWarning {
    label: string;
    color: () => string;
}

function getGlyph(mimeType: string): CanvasIconName {
    switch (getOleOfficeType(mimeType)) {
        case UniverInstanceType.UNIVER_SHEET: return 'sheets-multi-icon';
        case UniverInstanceType.UNIVER_DOC: return 'docs-multi-icon';
        case UniverInstanceType.UNIVER_SLIDE: return 'slides-multi-icon';
    }
    if (mimeType === 'application/pdf') {
        return 'pdf-multi-icon';
    }
    if (mimeType.startsWith('image/')) {
        return 'file-image-multi-icon';
    }
    if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
        return 'file-zip-multi-icon';
    }
    return 'file-unknown-multi-icon';
}

function fittingPrefix(value: string, width: number, measure: (text: string) => number): string {
    const points = Array.from(value);
    let low = 0;
    let high = points.length;
    while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (measure(points.slice(0, middle).join('')) <= width) {
            low = middle;
        } else {
            high = middle - 1;
        }
    }
    return points.slice(0, low).join('');
}

function ellipsize(value: string, width: number, measure: (text: string) => number): string {
    if (measure(value) <= width) {
        return value;
    }
    const dot = value.lastIndexOf('.');
    const suffix = dot > 0 && value.length - dot <= 12 ? value.slice(dot) : '';
    if (measure(`…${suffix}`) > width) {
        return measure('…') <= width ? '…' : '';
    }
    return `${fittingPrefix(suffix ? value.slice(0, dot) : value, width - measure(`…${suffix}`), measure)}…${suffix}`;
}

function caption(value: string, width: number, maxLines: number, measure: (text: string) => number): string[] {
    if (measure(value) <= width || maxLines === 1) {
        return [ellipsize(value, width, measure)];
    }
    let first = fittingPrefix(value, width, measure);
    const dot = value.lastIndexOf('.');
    if (dot > 0 && dot < first.length && value.length - dot <= 12) {
        first = value.slice(0, dot);
    }
    const split = Math.max(first.lastIndexOf(' '), first.lastIndexOf('_'), first.lastIndexOf('-'));
    if (split > first.length / 2) {
        first = first.slice(0, split + 1);
    }
    if (!first) {
        return [ellipsize(value, width, measure)];
    }
    return [first.trimEnd(), ellipsize(value.slice(first.length).trimStart(), width, measure)];
}

/** Rasterize paths and text directly into the current canvas, at its current zoom and pixel ratio. */
export class OleCanvasRenderer {
    private _name: string;
    private readonly _glyph: CanvasIconName;
    private _layout?: { width: number; height: number; font: number; lines: string[]; icon: number; top: number };

    constructor(name: string, mimeType: string, private readonly _textColor: () => string, private readonly _getName?: () => string, private readonly _warning?: IOleCanvasWarning) {
        this._name = name.slice(0, 2048).replace(/[\u0000-\u001F\u007F]/g, '');
        this._glyph = getGlyph(mimeType);
    }

    draw = (ctx: UniverRenderingContext, width: number, height: number): void => {
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return;
        }
        const name = (this._getName?.() ?? this._name).slice(0, 2048).replace(/[\u0000-\u001F\u007F]/g, '');
        if (name !== this._name) {
            this._name = name;
            this._layout = undefined;
        }
        ctx.save();
        ctx.translate(-width / 2, -height / 2);
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();
        const font = 12;
        ctx.font = `${font}px Arial, "Microsoft YaHei", sans-serif`;
        let layout = this._layout;
        if (!layout || layout.width !== width || layout.height !== height) {
            const textWidth = Math.max(0, Math.min(240, width - 8));
            const measure = (text: string) => ctx.measureText(text).width;
            let lines = caption(this._name, textWidth, height < 64 ? 1 : 2, measure);
            if (this._warning) {
                lines = height < 64
                    ? [ellipsize(this._warning.label, textWidth, measure)]
                    : [ellipsize(this._name, textWidth, measure), ellipsize(this._warning.label, textWidth, measure)];
            }
            const icon = Math.max(0, Math.min(width - 4, height - lines.length * font * 1.2 - 4));
            layout = { width, height, font, lines, icon, top: Math.max(0, (height - icon - lines.length * font * 1.2 - 4) / 2) };
            this._layout = layout;
        }
        drawCanvasIcon(ctx._context, this._glyph, (width - layout.icon) / 2, layout.top, layout.icon);
        if (this._warning && layout.icon >= 12) {
            const size = Math.min(16, layout.icon / 2);
            drawCanvasIcon(ctx._context, 'warning-triangle-multi-icon', (width + layout.icon) / 2 - size, layout.top + layout.icon - size, size);
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        layout.lines.forEach((line, index) => {
            ctx.fillStyle = this._warning && index === layout.lines.length - 1 ? this._warning.color() : this._textColor();
            ctx.fillText(line, width / 2, layout.top + layout.icon + 4 + layout.font + index * layout.font * 1.2);
        });
        ctx.restore();
    };
}
