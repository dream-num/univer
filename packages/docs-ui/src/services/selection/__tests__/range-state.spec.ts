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
import { RectRange } from '../rect-range';
import { TextRange } from '../text-range';

function getGetter<T extends object>(target: T, key: keyof T) {
    return Object.getOwnPropertyDescriptor(target, key)?.get as () => unknown;
}

interface IFakeShape {
    dispose: ReturnType<typeof vi.fn>;
}

interface IFakeTextRange {
    _cursorList: Array<{ startOffset: number; endOffset: number; collapsed: boolean }>;
    _segmentId: string;
    _segmentPage: number;
    _current: boolean;
    _rangeShape: IFakeShape;
    _anchorShape: IFakeShape;
    _docSkeleton: Record<string, unknown>;
    anchorNodePosition: Record<string, unknown>;
    focusNodePosition: Record<string, unknown>;
}

interface IFakeRectRange {
    _startRow: number;
    _endRow: number;
    _startCol: number;
    _endCol: number;
    _tableId: string;
    _segmentId: string;
    _segmentPage: number;
    _current: boolean;
    _rangeShape: IFakeShape;
    _docSkeleton: Record<string, unknown>;
    anchorNodePosition: Record<string, unknown>;
    focusNodePosition: Record<string, unknown>;
}

describe('selection range state', () => {
    it('derives text range offsets, direction, and active state from prototype getters', () => {
        const fakeRange = Object.setPrototypeOf({
            _cursorList: [{ startOffset: 9, endOffset: 9, collapsed: true }],
            _segmentId: '',
            _segmentPage: -1,
            _current: false,
            _rangeShape: { dispose: vi.fn() },
            _anchorShape: { dispose: vi.fn() },
            _docSkeleton: {
                getViewModel: () => ({
                    getDataModel: () => ({
                        getSelfOrHeaderFooterModel: () => ({
                            getBody: () => ({ dataStream: 'Hello\r\n' }),
                        }),
                    }),
                }),
            },
            anchorNodePosition: { page: 0, section: 0, column: 0, line: 1, divide: 0, glyph: 0 },
            focusNodePosition: { page: 0, section: 0, column: 0, line: 0, divide: 0, glyph: 0 },
        }, TextRange.prototype) as IFakeTextRange;

        expect(getGetter(TextRange.prototype, 'startOffset').call(fakeRange)).toBe(5);
        expect(getGetter(TextRange.prototype, 'endOffset').call(fakeRange)).toBe(5);
        expect(getGetter(TextRange.prototype, 'collapsed').call(fakeRange)).toBe(true);
        expect(getGetter(TextRange.prototype, 'startNodePosition').call(fakeRange)).toEqual(fakeRange.focusNodePosition);
        expect(getGetter(TextRange.prototype, 'endNodePosition').call(fakeRange)).toEqual(fakeRange.anchorNodePosition);
        expect(getGetter(TextRange.prototype, 'direction').call(fakeRange)).toBe('none');

        expect(TextRange.prototype.isActive.call(fakeRange)).toBe(false);
        TextRange.prototype.activate.call(fakeRange);
        expect(TextRange.prototype.isActive.call(fakeRange)).toBe(true);
        TextRange.prototype.deactivate.call(fakeRange);
        expect(TextRange.prototype.isActive.call(fakeRange)).toBe(false);
        const textRangeShape = fakeRange._rangeShape;
        const textAnchorShape = fakeRange._anchorShape;
        TextRange.prototype.dispose.call(fakeRange);
        expect(textRangeShape.dispose).toHaveBeenCalled();
        expect(textAnchorShape.dispose).toHaveBeenCalled();
    });

    it('derives rect range table bounds, ordering, intersections, and active state', () => {
        const anchorNodePosition = {
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 0,
            path: ['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0],
        };
        const focusNodePosition = {
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 0,
            path: ['pages', 0, 'skeTables', 'table#-#0', 'rows', 1, 'cells', 1],
        };
        const fakeRange = Object.setPrototypeOf({
            _startRow: 0,
            _endRow: 1,
            _startCol: 0,
            _endCol: 1,
            _tableId: 'table-1',
            _segmentId: '',
            _segmentPage: -1,
            _current: false,
            _rangeShape: { dispose: vi.fn() },
            _docSkeleton: {
                findCharIndexByPosition: vi.fn((position) => position === anchorNodePosition ? 1 : 4),
                getViewModel: () => ({
                    getSnapshot: () => ({
                        tableSource: {
                            'table-1': {
                                tableColumns: [{}, {}],
                                tableRows: [{}, {}],
                            },
                        },
                    }),
                }),
            },
            anchorNodePosition,
            focusNodePosition,
        }, RectRange.prototype) as IFakeRectRange;

        expect(getGetter(RectRange.prototype, 'startOffset').call(fakeRange)).toBe(1);
        expect(getGetter(RectRange.prototype, 'endOffset').call(fakeRange)).toBe(4);
        expect(getGetter(RectRange.prototype, 'collapsed').call(fakeRange)).toBe(false);
        expect(getGetter(RectRange.prototype, 'startRow').call(fakeRange)).toBe(0);
        expect(getGetter(RectRange.prototype, 'endColumn').call(fakeRange)).toBe(1);
        expect(getGetter(RectRange.prototype, 'tableId').call(fakeRange)).toBe('table-1');
        expect(getGetter(RectRange.prototype, 'spanEntireRow').call(fakeRange)).toBe(true);
        expect(getGetter(RectRange.prototype, 'spanEntireColumn').call(fakeRange)).toBe(true);
        expect(getGetter(RectRange.prototype, 'spanEntireTable').call(fakeRange)).toBe(true);
        expect(getGetter(RectRange.prototype, 'startNodePosition').call(fakeRange)).toEqual(anchorNodePosition);
        expect(getGetter(RectRange.prototype, 'endNodePosition').call(fakeRange)).toEqual(focusNodePosition);
        expect(getGetter(RectRange.prototype, 'direction').call(fakeRange)).toBe('forward');

        const compareRange = {
            startRow: 1,
            startColumn: 1,
            endRow: 2,
            endColumn: 2,
        } as never;
        expect(RectRange.prototype.isIntersection.call(fakeRange, compareRange)).toBe(true);

        expect(RectRange.prototype.isActive.call(fakeRange)).toBe(false);
        RectRange.prototype.activate.call(fakeRange);
        expect(RectRange.prototype.isActive.call(fakeRange)).toBe(true);
        RectRange.prototype.deactivate.call(fakeRange);
        const rectShape = fakeRange._rangeShape;
        RectRange.prototype.dispose.call(fakeRange);
        expect(rectShape.dispose).toHaveBeenCalled();
    });
});
