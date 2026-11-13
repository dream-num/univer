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

import type { IRange } from '@univerjs/core';
import { BorderStyleTypes, Disposable } from '@univerjs/core';
import type { IBorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../../basics/const';
import { UniverRenderingContext } from '../../../context';

const MAX_ENTRIES = 128;
const MAX_COMMANDS = 16 * 1024;
const MAX_ROW_COMMANDS = 1024;
const PIXEL_METHODS = new Set(['stroke', 'fill', 'fillRect', 'strokeRect', 'clearRect', 'fillText', 'strokeText', 'putImageData', 'clip', 'reset', 'drawFocusIfNeeded']);

interface IBorderBlit {
    canvas: HTMLCanvasElement;
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Reuse native edge blits, preserving their order and individual alpha/clip composition. */
export class BorderRowCache extends Disposable {
    private readonly _rows = new Map<string, IBorderBlit[]>();
    private _commands = 0;

    draw(
        ctx: UniverRenderingContext,
        skeleton: SpreadsheetSkeleton,
        row: number,
        range: IRange,
        resolveColor: (color: string) => string,
        paint: (target: UniverRenderingContext) => void
    ): boolean {
        const native = ctx._context;
        const borderRow = skeleton.stylesCache.border?.getRow(row);
        if (ctx.__mode === 'printing' || !native || typeof document === 'undefined'
            || range.endColumn - range.startColumn < 7 || range.endColumn - range.startColumn >= 256
            || !borderRow || !skeleton.worksheet.getRowVisible(row) || skeleton.overflowCache.getRow(row)
            || native.globalAlpha !== 1 || native.globalCompositeOperation !== 'source-over'
            || native.shadowBlur || native.shadowOffsetX || native.shadowOffsetY
            || !['rgba(0, 0, 0, 0)', 'transparent', '#00000000'].includes(native.shadowColor)
            || (native.filter && native.filter !== 'none')
            || (native.getContextAttributes?.()?.colorSpace ?? 'srgb') !== 'srgb') {
            return false;
        }
        const m = native.getTransform();
        if (m.a !== m.d || m.a <= 0 || m.b || m.c) {
            return false;
        }
        const startY = row === 0 ? 0 : skeleton.rowHeightAccumulation[row - 1];
        const endY = skeleton.rowHeightAccumulation[row];
        if ((endY - startY) * m.d > 12 || endY <= startY) {
            return false;
        }
        const startX = range.startColumn === 0 ? 0 : skeleton.columnWidthAccumulation[range.startColumn - 1];
        const endX = skeleton.columnWidthAccumulation[range.endColumn];
        const left = Math.floor(Math.round(startX * m.a) + m.e);
        const top = Math.floor(Math.round(startY * m.d) + m.f);
        const width = Math.round(endX * m.a) - Math.round(startX * m.a);
        const height = Math.round(endY * m.d) - Math.round(startY * m.d);
        if (!Number.isFinite(width * height)) {
            return false;
        }
        const identity: unknown[] = [m.a, m.e - left, m.f + Math.round(startY * m.d) - top, width, height, native.lineCap, native.lineJoin, native.miterLimit];
        let edges = 0;
        let rowColor: string | undefined;
        for (let col = range.startColumn; col <= range.endColumn; col++) {
            const cell = skeleton.getCellWithCoordByIndex(row, col, false);
            if (cell.isMerged || cell.isMergedMainCell || !skeleton.worksheet.getColVisible(col)) {
                return false;
            }
            const border = borderRow[col];
            for (const key in border) {
                const item = border[key] as IBorderCacheItem;
                if (!item || item.style !== BorderStyleTypes.THIN
                    || ![BORDER_TYPE.TOP, BORDER_TYPE.BOTTOM, BORDER_TYPE.LEFT, BORDER_TYPE.RIGHT].includes(item.type)) {
                    return false;
                }
                const color = resolveColor(item.color || COLOR_BLACK_RGB);
                if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color) || (rowColor !== undefined && rowColor !== color)) {
                    return false;
                }
                rowColor = color;
                identity.push(color);
                edges++;
            }
            identity.push(Math.round(cell.startX * m.a) + m.e - left, Math.round(cell.endX * m.a) + m.e - left, border);
        }
        if (edges < 16 || edges > MAX_ROW_COMMANDS) {
            return false;
        }
        const key = JSON.stringify(identity);
        let commands = this._rows.get(key);
        if (commands && commands.some((item) => item.canvas.width !== item.width || item.canvas.height !== item.height)) {
            this._commands -= commands.length;
            this._rows.delete(key);
            return false;
        }
        if (!commands) {
            const captured: IBorderBlit[] = [];
            let unsupported = false;
            const methods = new Map<PropertyKey, (...args: unknown[]) => unknown>();
            const capture = new Proxy(native, {
                get: (target, property) => {
                    if (property === 'drawImage') {
                        return (canvas: HTMLCanvasElement, x: number, y: number, ...rest: unknown[]) => {
                            const transform = target.getTransform();
                            if (rest.length || !canvas?.width || !canvas.height || typeof canvas.getContext !== 'function'
                                || !Number.isFinite(x + y) || captured.length >= MAX_ROW_COMMANDS
                                || transform.a !== 1 || transform.d !== 1 || transform.b || transform.c || transform.e || transform.f
                                || target.globalAlpha !== 1 || target.globalCompositeOperation !== 'source-over') {
                                unsupported = true;
                                return;
                            }
                            captured.push({ canvas, x: x - left, y: y - top, width: canvas.width, height: canvas.height });
                        };
                    }
                    if (PIXEL_METHODS.has(String(property))) {
                        return () => {
                            unsupported = true;
                        };
                    }
                    const value = Reflect.get(target, property, target);
                    if (typeof value !== 'function') {
                        return value;
                    }
                    let method = methods.get(property);
                    if (!method) {
                        method = value.bind(target);
                        methods.set(property, method!);
                    }
                    return method;
                },
                set: (target, property, value) => Reflect.set(target, property, value, target),
            });
            ctx.save();
            try {
                paint(new UniverRenderingContext(capture, { canvasColorService: { getRenderColor: resolveColor } }));
            } finally {
                ctx.restore();
            }
            if (unsupported || !captured.length
                || captured.some((item) => item.canvas.width !== item.width || item.canvas.height !== item.height)) {
                return false;
            }
            commands = captured;
            while (this._rows.size && (this._rows.size >= MAX_ENTRIES || this._commands + commands.length > MAX_COMMANDS)) {
                const oldest = this._rows.keys().next().value!;
                this._commands -= this._rows.get(oldest)!.length;
                this._rows.delete(oldest);
            }
            this._rows.set(key, commands);
            this._commands += commands.length;
        }
        ctx.save();
        try {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.imageSmoothingEnabled = false;
            for (const command of commands) {
                ctx.drawImage(command.canvas, command.x + left, command.y + top);
            }
        } finally {
            ctx.restore();
        }
        return true;
    }

    clear(): void {
        this._rows.clear();
        this._commands = 0;
    }

    override dispose(): void {
        this.clear();
        super.dispose();
    }
}
