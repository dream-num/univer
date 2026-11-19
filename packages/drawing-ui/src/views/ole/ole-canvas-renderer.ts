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

interface IOleGlyphPath {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillRule?: CanvasFillRule;
}

const GLYPHS: Record<string, IOleGlyphPath[]> = {
    image: [
        {
            d: 'M3 1.5h6l4 4v9H3z',
            fill: '#8E51FF',
        },
        {
            d: 'M9 1.5v4h4',
            fill: '#6E35D1',
        },
        {
            d: 'M5.0 8.0a1.0 1.0 0 1 0 2.0 0a1.0 1.0 0 1 0 -2.0 0',
            fill: 'white',
        },
        {
            d: 'M4.5 12.5l2.3-2.5 1.5 1.4 1.7-2.2 2 3.3z',
            fill: 'white',
        },
    ],
    zip: [
        {
            d: 'M3 1.5h6l4 4v9H3z',
            fill: '#E5A000',
        },
        {
            d: 'M9 1.5v4h4',
            fill: '#BD8200',
        },
        {
            d: 'M6 2h1v1H6zm1 1h1v1H7zM6 4h1v1H6zm1 1h1v1H7zM6 6h1v1H6zm1 1h1v1H7zM6 8h1v1H6zM6 10h2v2H6z',
            fill: 'white',
        },
    ],
    unknown: [
        {
            d: 'M3 1.5h6l4 4v9H3z',
            fill: '#F3F4F6',
            stroke: '#9CA3AF',
        },
        {
            d: 'M9 1.5v4h4M5 9h6M5 11h4',
            stroke: '#9CA3AF',
        },
    ],
};
const paths = new Map<IOleGlyphPath, Path2D>();
const warningShape: IOleGlyphPath = { d: 'M8 1L15 14H1Z' };
const warningMark: IOleGlyphPath = { d: 'M7.25 5H8.75V9.5H7.25ZM7.25 11H8.75V12.5H7.25Z' };

interface IOleCanvasWarning {
    label: string;
    color: () => string;
}

function getGlyph(mimeType: string): CanvasIconName | IOleGlyphPath[] {
    switch (getOleOfficeType(mimeType)) {
        case UniverInstanceType.UNIVER_SHEET: return 'sheets-multi-icon';
        case UniverInstanceType.UNIVER_DOC: return 'docs-multi-icon';
        case UniverInstanceType.UNIVER_SLIDE: return 'slides-multi-icon';
    }
    if (mimeType === 'application/pdf') {
        return 'pdf-multi-icon';
    }
    if (mimeType.startsWith('image/')) {
        return GLYPHS.image;
    }
    if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
        return GLYPHS.zip;
    }
    return GLYPHS.unknown;
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
    private readonly _glyph: CanvasIconName | IOleGlyphPath[];
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
        if (typeof this._glyph === 'string') {
            drawCanvasIcon(ctx._context, this._glyph, (width - layout.icon) / 2, layout.top, layout.icon);
        } else {
            ctx.save();
            ctx.translate((width - layout.icon) / 2, layout.top);
            ctx.scale(layout.icon / 16, layout.icon / 16);
            for (const part of this._glyph) {
                let path = paths.get(part);
                if (!path) {
                    path = new Path2D(part.d);
                    paths.set(part, path);
                }
                // File-brand colors are intrinsic artwork, like a native image; do not invert them in dark mode.
                if (part.fill) {
                    ctx._context.fillStyle = part.fill;
                    ctx.fill(path, part.fillRule ?? 'nonzero');
                }
                if (part.stroke) {
                    ctx._context.strokeStyle = part.stroke;
                    ctx.lineWidth = part.strokeWidth ?? 1;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke(path);
                }
            }
            ctx.restore();
        }
        if (this._warning && layout.icon >= 12) {
            ctx.save();
            const size = Math.min(16, layout.icon / 2);
            ctx.translate((width + layout.icon) / 2 - size, layout.top + layout.icon - size);
            ctx.scale(size / 16, size / 16);
            for (const part of [warningShape, warningMark]) {
                let path = paths.get(part);
                if (!path) {
                    path = new Path2D(part.d);
                    paths.set(part, path);
                }
                ctx._context.fillStyle = part === warningShape ? this._warning.color() : '#FFFFFF';
                ctx.fill(path);
            }
            ctx.restore();
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
