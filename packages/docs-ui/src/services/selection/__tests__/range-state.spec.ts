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
import { NodePositionConvertToCursor } from '../convert-text-range';
import { RectRange } from '../rect-range';
import { cursorConvertToTextRange, TextRange } from '../text-range';

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

function createNodePosition(glyph = 0) {
    return {
        page: 0,
        section: 0,
        column: 0,
        line: 0,
        divide: 0,
        glyph,
        isBack: true,
    };
}

function createTextRangeHarness() {
    const addedObjects: unknown[] = [];
    const scene = {
        addObject: (object: unknown) => {
            addedObjects.push(object);
        },
    };
    const document = {
        getOffsetConfig: () => ({
            docsLeft: 5,
            docsTop: 7,
        }),
    };
    const skeleton = {
        findNodePositionByCharIndex: (index: number) => createNodePosition(index),
        findGlyphByPosition: () => ({
            ts: {},
        }),
        getViewModel: () => ({
            getDataModel: () => ({
                getSelfOrHeaderFooterModel: () => ({
                    getBody: () => ({ dataStream: 'abcdef\r\n' }),
                }),
            }),
        }),
    };

    return {
        addedObjects,
        document,
        scene,
        skeleton,
    };
}

describe('selection range state', () => {
    it('renders a collapsed cursor range and clamps cursor offsets before the final line break', () => {
        const { addedObjects, document, scene, skeleton } = createTextRangeHarness();
        const rangePointSpy = vi.spyOn(NodePositionConvertToCursor.prototype, 'getRangePointData').mockImplementation(() => ({
            contentBoxPointGroup: [[
                { x: 10, y: 20 },
                { x: 12, y: 20 },
                { x: 12, y: 25 },
                { x: 10, y: 25 },
            ]],
            borderBoxPointGroup: [],
            cursorList: [{ startOffset: 7, endOffset: 7, collapsed: true }],
        }) as never);

        const range = cursorConvertToTextRange(
            scene as never,
            { startOffset: 7, endOffset: 7, segmentId: '', segmentPage: -1 },
            skeleton as never,
            document as never
        )!;

        expect(range.startOffset).toBe(6);
        expect(range.endOffset).toBe(6);
        expect(range.collapsed).toBe(true);
        expect(range.getAbsolutePosition()).toEqual({
            left: 15,
            top: 27,
            width: 2,
            height: 5,
        });
        expect(addedObjects).toHaveLength(1);
        expect(range.getAnchor()).not.toBeNull();

        range.dispose();
        rangePointSpy.mockRestore();
    });

    it('renders expanded text ranges and reports document direction from anchor to focus', () => {
        const { addedObjects, document, scene, skeleton } = createTextRangeHarness();
        const rangePointSpy = vi.spyOn(NodePositionConvertToCursor.prototype, 'getRangePointData').mockImplementation(() => ({
            contentBoxPointGroup: [],
            borderBoxPointGroup: [[
                { x: 10, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 36 },
                { x: 10, y: 36 },
            ]],
            cursorList: [{ startOffset: 1, endOffset: 4, collapsed: false }],
        }) as never);

        const range = new TextRange(
            scene as never,
            document as never,
            skeleton as never,
            createNodePosition(1) as never,
            createNodePosition(4) as never,
            undefined,
            '',
            -1
        );

        expect(range.startOffset).toBe(1);
        expect(range.endOffset).toBe(4);
        expect(range.collapsed).toBe(false);
        expect(range.direction).toBe('forward');
        expect(range.getAbsolutePosition()).toEqual({
            left: 15,
            top: 27,
            width: 50,
            height: 16,
        });
        expect(addedObjects).toHaveLength(1);

        range.dispose();
        rangePointSpy.mockRestore();
    });

    it('returns empty positions for empty ranges and reports backward document selections', () => {
        const { document, scene, skeleton } = createTextRangeHarness();
        const emptyRange = new TextRange(scene as never, document as never, skeleton as never, null, null);

        expect(emptyRange.startNodePosition).toBeNull();
        expect(emptyRange.endNodePosition).toBeNull();
        expect(emptyRange.getAbsolutePosition()).toBeUndefined();
        expect(emptyRange.direction).toBe('none');
        emptyRange.dispose();

        const rangePointSpy = vi.spyOn(NodePositionConvertToCursor.prototype, 'getRangePointData').mockImplementation(() => ({
            contentBoxPointGroup: [],
            borderBoxPointGroup: [[
                { x: 10, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 36 },
                { x: 10, y: 36 },
            ]],
            cursorList: [{ startOffset: 1, endOffset: 4, collapsed: false }],
        }) as never);
        const anchor = createNodePosition(4);
        const focus = createNodePosition(1);
        const backwardRange = new TextRange(
            scene as never,
            document as never,
            skeleton as never,
            anchor as never,
            focus as never
        );

        expect(backwardRange.startNodePosition).toBe(focus);
        expect(backwardRange.endNodePosition).toBe(anchor);
        expect(backwardRange.direction).toBe('backward');

        backwardRange.dispose();
        rangePointSpy.mockRestore();
    });

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
