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

import { describe, expect, it, vi } from 'vitest';
import { Path } from '../path';

describe('Path extra', () => {
    it('parses rich path commands and computes path lengths', () => {
        const parsed = Path.parsePathData('M0 0 L10 0 H15 V5 C15 10 20 10 20 5 Q25 0 30 5 A5 5 0 0 1 35 10 z');
        expect(parsed.length).toBeGreaterThan(5);
        expect(parsed[0].command).toBe('M');
        expect(parsed[parsed.length - 1].command).toBe('z');
        expect(parsed.some((item) => item.command === 'A')).toBe(true);

        expect(Path.parsePathData('')).toEqual([]);
        expect(Path.calcLength(0, 0, 'L', [3, 4])).toBe(5);
        expect(Path.calcLength(0, 0, 'Q', [5, 5, 10, 0])).toBeGreaterThan(0);
        expect(Path.calcLength(0, 0, 'C', [3, 3, 7, 3, 10, 0])).toBeGreaterThan(0);
        expect(Path.calcLength(0, 0, 'A', [5, 5, 3, 3, 0, Math.PI / 2, 0, 0])).toBeGreaterThan(0);
        expect(Path.calcLength(0, 0, 'X', [])).toBe(0);

        const lowerParsed = Path.parsePathData('m1 1 h2 v3 c1 1 2 2 3 3 s1 1 2 0 q1 1 2 2 t1 1 z m2 2 l3 0');
        expect(lowerParsed.some((item) => item.command === 'C')).toBe(true);
        expect(lowerParsed.some((item) => item.command === 'Q')).toBe(true);
        expect(lowerParsed[lowerParsed.length - 1].command).toBe('L');
    });

    it('supports point calculation helpers', () => {
        expect(Path.getLineLength(0, 0, 3, 4)).toBe(5);

        const linePoint = Path.getPointOnLine(5, 0, 0, 10, 0);
        expect(linePoint.x).toBeCloseTo(5);
        expect(linePoint.y).toBeCloseTo(0);

        const cubicPoint = Path.getPointOnCubicBezier(0.5, 0, 0, 3, 6, 7, 6, 10, 0);
        expect(cubicPoint.x).toBeGreaterThan(0);
        expect(cubicPoint.y).toBeGreaterThan(0);

        const quadPoint = Path.getPointOnQuadraticBezier(0.5, 0, 0, 5, 10, 10, 0);
        expect(quadPoint.x).toBeCloseTo(5);
        expect(quadPoint.y).toBeCloseTo(5);

        const arcPoint = Path.getPointOnEllipticalArc(10, 20, 5, 3, Math.PI / 2, 0);
        expect(arcPoint.x).toBeCloseTo(10);
        expect(arcPoint.y).toBeCloseTo(23);

        const verticalLinePoint = Path.getPointOnLine(2, 0, 0, 0, 10);
        expect(verticalLinePoint.x).toBe(0);

        const sameSlopePoint = Path.getPointOnLine(3, 0, 0, 10, 10, 2, 2);
        expect(sameSlopePoint.x).toBeGreaterThan(2);
        expect(sameSlopePoint.y).toBeGreaterThan(2);

        const projectionPoint = Path.getPointOnLine(6, 0, 0, 10, 0, 2, 5);
        expect(Number.isFinite(projectionPoint.x)).toBe(true);
        expect(Number.isFinite(projectionPoint.y)).toBe(true);

        const reversePoint = Path.getPointOnLine(4, 10, 0, 0, 0, 8, 2);
        expect(Number.isFinite(reversePoint.x)).toBe(true);
        expect(Number.isFinite(reversePoint.y)).toBe(true);
    });

    it('converts arc endpoint parameterization and handles edge cases', () => {
        const arc = Path.convertEndpointToCenterParameterization(0, 0, 10, 10, 0, 1, 4, 4, 45);
        expect(arc).toHaveLength(8);
        expect(arc[2]).toBeGreaterThan(0);
        expect(arc[3]).toBeGreaterThan(0);

        const fallbackArc = Path.convertEndpointToCenterParameterization(1, 1, 1, 1, 0, 0, 0, 0, 0);
        expect(fallbackArc).toHaveLength(8);
    });

    it('supports instance APIs: pointAtLength/state/json/rect', () => {
        const path = new Path('p1', { data: 'M0 0 L10 0 L10 10' } as any);
        expect(path.getLength()).toBeGreaterThan(0);

        const startPoint = path.getPointAtLength(0);
        expect(startPoint).toEqual({ x: 0, y: 0 });

        const midPoint = path.getPointAtLength(5);
        expect(midPoint?.x).toBeCloseTo(5);
        expect(midPoint?.y).toBeCloseTo(0);

        const endPoint = path.getPointAtLength(999);
        expect(endPoint).toEqual({ x: 10, y: 10 });

        const state = path.getState();
        expect(state).toEqual(expect.objectContaining({
            left: expect.any(Number),
            top: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
        }));

        const json = path.toJson();
        expect(json).toEqual(expect.objectContaining({
            dataArray: expect.any(Array),
        }));

        const rect = path.getRect();
        expect(rect.width).toBeGreaterThanOrEqual(0);
        expect(rect.height).toBeGreaterThanOrEqual(0);
    });

    it('covers drawWith and parse shorthand command branches', () => {
        const ctx = {
            beginPath: vi.fn(),
            lineTo: vi.fn(),
            moveTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            arc: vi.fn(),
            closePath: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            setLineDash: vi.fn(),
            setLineWidthByPrecision: vi.fn(),
            lineDashOffset: 0,
            lineJoin: 'round',
            lineCap: 'round',
            miterLimit: 10,
            fillStyle: '',
            strokeStyle: '',
        } as any;

        Path.drawWith(ctx, {
            dataArray: [
                { command: 'M', points: [0, 0], start: { x: 0, y: 0 }, pathLength: 0 },
                { command: 'L', points: [5, 5], start: { x: 0, y: 0 }, pathLength: 1 },
                { command: 'C', points: [5, 0, 10, 5, 15, 0], start: { x: 5, y: 5 }, pathLength: 1 },
                { command: 'Q', points: [16, 2, 18, 0], start: { x: 15, y: 0 }, pathLength: 1 },
                { command: 'A', points: [18, 0, 3, 2, 0, Math.PI / 2, 0, 0], start: { x: 18, y: 0 }, pathLength: 1 },
                { command: 'z', points: [], start: { x: 0, y: 0 }, pathLength: 0 },
            ],
            fill: '#f00',
            stroke: '#0f0',
            strokeWidth: 1,
            paintFirst: 'stroke',
        } as any);

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.bezierCurveTo).toHaveBeenCalled();
        expect(ctx.quadraticCurveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.closePath).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();

        const parsed = Path.parsePathData('M0 0 C10 0 10 10 20 10 S30 20 40 10 Q45 5 50 10 T60 10 m5 5 l5 0 z');
        expect(parsed.some((cmd) => cmd.command === 'C')).toBe(true);
        expect(parsed.some((cmd) => cmd.command === 'Q')).toBe(true);
        expect(parsed[parsed.length - 1].command).toBe('z');

        const parsedArc = Path.parsePathData('M0 0 a10 5 0 0 1 20 0');
        expect(parsedArc.some((cmd) => cmd.command === 'A')).toBe(true);
    });

    it('covers getPointAtLength fallback branches', () => {
        const noPathPoint = (Path.prototype as any).getPointAtLength.call({ dataArray: [] }, 1);
        expect(noPathPoint).toBeNull();

        const unknownPoint = (Path.prototype as any).getPointAtLength.call({
            dataArray: [{
                command: 'M',
                points: [0, 0],
                start: { x: 0, y: 0 },
                pathLength: 10,
            }],
        }, 5);
        expect(unknownPoint).toBeNull();
    });

    it('covers constructor dataArray path, resize re-calc and protected draw', () => {
        const fromArray = new Path('pa', {
            dataArray: [
                { command: 'M', points: [0, 0], start: { x: 0, y: 0 }, pathLength: 0 },
                { command: 'L', points: [10, 0], start: { x: 0, y: 0 }, pathLength: 10 },
                { command: 'L', points: [10, 10], start: { x: 10, y: 0 }, pathLength: 10 },
            ],
        } as any);
        expect(fromArray.getLength()).toBe(20);
        fromArray.resize(20, 10);
        expect(fromArray.scaleX).toBeGreaterThanOrEqual(0);
        expect(fromArray.scaleY).toBeGreaterThanOrEqual(0);

        const vertical = new Path('pv', { data: 'M0 0 L0 10' } as any);
        vertical.resize(10, 20);
        const horizontal = new Path('ph', { data: 'M0 0 L10 0' } as any);
        horizontal.resize(20, 10);
        expect(vertical.getRect().height).toBeGreaterThanOrEqual(0);
        expect(horizontal.getRect().width).toBeGreaterThanOrEqual(0);

        (fromArray as any)._reCalculateCache = false;
        (fromArray as any)._selfRectCache = { left: 1, top: 2, width: 3, height: 4 };
        expect((fromArray as any)._getSelfRect()).toEqual({ left: 1, top: 2, width: 3, height: 4 });

        const arcCurve = new Path('pc', { data: 'M0 0 C10 0 10 10 20 10 A5 5 0 0 0 30 10' } as any);
        const rect = arcCurve.getRect();
        expect(rect.width).toBeGreaterThanOrEqual(0);
        expect(rect.height).toBeGreaterThanOrEqual(0);

        const ctx = {
            beginPath: vi.fn(),
            lineTo: vi.fn(),
            moveTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            arc: vi.fn(),
            closePath: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            setLineDash: vi.fn(),
            setLineWidthByPrecision: vi.fn(),
            lineDashOffset: 0,
            lineJoin: 'round',
            lineCap: 'round',
            miterLimit: 10,
            fillStyle: '',
            strokeStyle: '',
        } as any;
        (arcCurve as any)._draw(ctx);
        expect(ctx.beginPath).toHaveBeenCalled();
    });
});
