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

import type { IPageBorders } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '../../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../../context';
import { describe, expect, it, vi } from 'vitest';
import { drawPageBorders } from '../page-borders';

function createContext(): UniverRenderingContext {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        clip: vi.fn(),
        fillRect: vi.fn(),
        setLineDash: vi.fn(),
        stroke: vi.fn(),
    } as unknown as UniverRenderingContext;
}

const page = {
    pageWidth: 800,
    pageHeight: 1120,
    marginLeft: 80,
    marginRight: 80,
    originMarginTop: 96,
    originMarginBottom: 96,
} as IDocumentSkeletonPage;

describe('section page borders', () => {
    it('keeps thin outer and thick inner lines on all four edges of the Word compound frame', () => {
        const ctx = createContext();
        const start = { style: 'thickThinSmallGap', width: 4, padding: 32 };
        const end = { ...start, style: 'thinThickSmallGap' };
        drawPageBorders(ctx, page, { offsetFrom: 'page', top: start, left: start, bottom: end, right: end }, 10, 20, true);
        expect(vi.mocked(ctx.fillRect).mock.calls).toEqual([
            [42, 52, 736, 1],
            [42, 54, 736, 4],
            [777, 52, 1, 1056],
            [772, 52, 4, 1056],
            [42, 1107, 736, 1],
            [42, 1102, 736, 4],
            [42, 52, 1, 1056],
            [44, 52, 4, 1056],
        ]);
        expect(ctx.save).toHaveBeenCalledTimes(4);
        expect(ctx.restore).toHaveBeenCalledTimes(4);
    });

    it('positions text-relative borders outside the text margins, not inside them', () => {
        const ctx = createContext();
        const edge = { width: 2, padding: 8 };
        drawPageBorders(ctx, page, { offsetFrom: 'text', top: edge, left: edge, right: edge, bottom: edge }, 0, 0, true);
        expect(vi.mocked(ctx.fillRect).mock.calls).toEqual([
            [70, 86, 660, 2],
            [728, 86, 2, 948],
            [70, 1032, 660, 2],
            [70, 86, 2, 948],
        ]);
    });

    it.each([
        ['firstPage', true, true],
        ['firstPage', false, false],
        ['notFirstPage', true, false],
        ['notFirstPage', false, true],
        ['allPages', true, true],
        ['allPages', false, true],
    ] as const)('honors %s on a section first page=%s', (display, first, visible) => {
        const ctx = createContext();
        drawPageBorders(ctx, page, { display, top: { width: 1 } }, 0, 0, first);
        expect(vi.mocked(ctx.fillRect).mock.calls.length > 0).toBe(visible);
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores invalid border width %s', (width) => {
        const ctx = createContext();
        drawPageBorders(ctx, page, { top: { width } }, 0, 0, true);
        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('does not replace disabled or unsupported art borders with solid lines', () => {
        const ctx = createContext();
        const borders: IPageBorders = { top: { style: 'nil' }, right: { style: 'apples' }, left: { style: 'none' } };
        drawPageBorders(ctx, page, borders, 0, 0, true);
        expect(ctx.fillRect).not.toHaveBeenCalled();
        expect(ctx.stroke).not.toHaveBeenCalled();
    });
});
