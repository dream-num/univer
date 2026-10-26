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
import { UniverInstanceType } from '@univerjs/core';
import { getOleOfficeType } from '@univerjs/drawing';

interface IOleGlyphPath {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillRule?: CanvasFillRule;
}

const GLYPHS: Record<string, IOleGlyphPath[]> = {
    sheet: [
        {
            d: 'M3.4535 1.12549C2.7002 1.12549 2.08954 1.73615 2.08954 2.48945V13.5104C2.08954 14.2637 2.7002 14.8744 3.4535 14.8744H12.5465C13.2998 14.8744 13.9105 14.2637 13.9105 13.5104V5.0992L10.0091 1.12549H3.4535Z',
            fill: '#35BD4B',
        },
        {
            d: 'M10.0075 1.12549L13.9104 5.09842H10.6742C10.306 5.09842 10.0075 4.79994 10.0075 4.43175V1.12549Z',
            fill: '#32A846',
        },
        {
            d: 'M4.7 7.05H11.1V12.05H4.7V7.05ZM5.5 7.85V9.2H7.35V7.85H5.5ZM8.15 7.85V9.2H10.3V7.85H8.15ZM5.5 10V11.25H7.35V10H5.5ZM8.15 10V11.25H10.3V10H8.15Z',
            fill: 'white',
            fillRule: 'evenodd',
        },
    ],
    doc: [
        {
            d: 'M3.4535 1.12549C2.7002 1.12549 2.08954 1.73615 2.08954 2.48945V13.5104C2.08954 14.2637 2.7002 14.8744 3.4535 14.8744H12.5465C13.2998 14.8744 13.9105 14.2637 13.9105 13.5104V5.0992L10.0091 1.12549H3.4535Z',
            fill: '#4B7DFF',
        },
        {
            d: 'M10.0075 1.12549L13.9104 5.09842H10.6742C10.306 5.09842 10.0075 4.79994 10.0075 4.43175V1.12549Z',
            fill: '#305CFA',
        },
        {
            d: 'M4.57245 7.27962C4.57245 7.09553 4.72169 6.94629 4.90578 6.94629H10.2391C10.4232 6.94629 10.5724 7.09553 10.5724 7.27962C10.5724 7.46372 10.4232 7.61296 10.2391 7.61296H4.90578C4.72169 7.61296 4.57245 7.46372 4.57245 7.27962Z',
            fill: 'white',
        },
        {
            d: 'M4.57245 9.62638C4.57245 9.44229 4.72169 9.29305 4.90578 9.29305H10.2391C10.4232 9.29305 10.5724 9.44229 10.5724 9.62638C10.5724 9.81048 10.4232 9.95972 10.2391 9.95972H4.90578C4.72169 9.95972 4.57245 9.81048 4.57245 9.62638Z',
            fill: 'white',
        },
        {
            d: 'M4.90578 11.6398C4.72169 11.6398 4.57245 11.789 4.57245 11.9731C4.57245 12.1572 4.72169 12.3065 4.90578 12.3065H7.57245C7.75654 12.3065 7.90578 12.1572 7.90578 11.9731C7.90578 11.789 7.75654 11.6398 7.57245 11.6398H4.90578Z',
            fill: 'white',
        },
    ],
    slide: [
        {
            d: 'M3.4535 1.12549C2.7002 1.12549 2.08954 1.73615 2.08954 2.48945V13.5104C2.08954 14.2637 2.7002 14.8744 3.4535 14.8744H12.5465C13.2998 14.8744 13.9105 14.2637 13.9105 13.5104V5.0992L10.0091 1.12549H3.4535Z',
            fill: '#FF6B4B',
        },
        {
            d: 'M10.0075 1.12549L13.9104 5.09842H10.6742C10.306 5.09842 10.0075 4.79994 10.0075 4.43175V1.12549Z',
            fill: '#EC4F2D',
        },
        {
            d: 'M7.76493 7.24535C7.76493 7.07967 7.63024 6.94371 7.46548 6.96123C7.01146 7.00953 6.57426 7.16714 6.19216 7.42245C5.72662 7.73351 5.36378 8.17564 5.14951 8.69292C4.93525 9.2102 4.87918 9.77941 4.98842 10.3285C5.09765 10.8777 5.36727 11.3821 5.76318 11.778C6.15909 12.1739 6.66351 12.4436 7.21265 12.5528C7.76179 12.662 8.33099 12.606 8.84828 12.3917C9.36556 12.1774 9.80769 11.8146 10.1188 11.349C10.3741 10.9669 10.5317 10.5297 10.58 10.0757C10.5975 9.91096 10.4615 9.77627 10.2958 9.77627L8.06493 9.77627C7.89925 9.77627 7.76493 9.64195 7.76493 9.47627L7.76493 7.24535Z',
            fill: 'white',
        },
        {
            d: 'M10.4097 9.35206C10.5753 9.35206 10.7115 9.21728 10.6918 9.05277C10.6645 8.82511 10.6062 8.60178 10.5181 8.38909C10.3917 8.08379 10.2063 7.80639 9.97264 7.57272C9.73897 7.33905 9.46157 7.1537 9.15627 7.02724C8.94358 6.93914 8.72024 6.88083 8.49259 6.85356C8.32808 6.83385 8.1933 6.97001 8.1933 7.13569V9.05206C8.1933 9.21774 8.32761 9.35206 8.4933 9.35206H10.4097Z',
            fill: 'white',
        },
    ],
    pdf: [
        {
            d: 'M3.4535 1.12549C2.7002 1.12549 2.08954 1.73615 2.08954 2.48945V13.5104C2.08954 14.2637 2.7002 14.8744 3.4535 14.8744H12.5465C13.2998 14.8744 13.9105 14.2637 13.9105 13.5104V5.0992L10.0091 1.12549H3.4535Z',
            fill: '#E5484D',
        },
        {
            d: 'M10.0075 1.12549L13.9104 5.09842H10.6742C10.306 5.09842 10.0075 4.79994 10.0075 4.43175V1.12549Z',
            fill: '#C62F35',
        },
        {
            d: 'M4.75 6.45H9.3L11.25 8.4V12.35H4.75V6.45Z',
            fill: 'white',
        },
        {
            d: 'M9.3 6.45V8.4H11.25L9.3 6.45Z',
            fill: '#F7C7C9',
        },
        {
            d: 'M4.15 8.65H11.75V11.35H4.15V8.65Z',
            fill: '#B9252D',
        },
        {
            d: 'M5.05 10.62V9.38H5.45C5.76 9.38 5.94 9.57 5.94 9.82C5.94 10.08 5.76 10.25 5.45 10.25H5.05M6.43 9.38V10.62H6.78C7.16 10.62 7.38 10.38 7.38 10C7.38 9.62 7.16 9.38 6.78 9.38H6.43ZM7.88 10.62V9.38H8.85M7.88 9.99H8.62',
            stroke: 'white',
            strokeWidth: 0.42,
        },
    ],
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

function glyphType(mimeType: string): string {
    switch (getOleOfficeType(mimeType)) {
        case UniverInstanceType.UNIVER_SHEET: return 'sheet';
        case UniverInstanceType.UNIVER_DOC: return 'doc';
        case UniverInstanceType.UNIVER_SLIDE: return 'slide';
    }
    if (mimeType === 'application/pdf') {
        return 'pdf';
    }
    if (mimeType.startsWith('image/')) {
        return 'image';
    }
    if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
        return 'zip';
    }
    return 'unknown';
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
    private readonly _glyph: IOleGlyphPath[];
    private _layout?: { width: number; height: number; font: number; lines: string[]; icon: number; top: number };

    constructor(name: string, mimeType: string, private readonly _textColor: () => string, private readonly _getName?: () => string, private readonly _warning?: IOleCanvasWarning) {
        this._name = name.slice(0, 2048).replace(/[\u0000-\u001F\u007F]/g, '');
        this._glyph = GLYPHS[glyphType(mimeType)];
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
