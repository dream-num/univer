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

import type { Mock } from 'vitest';
import { DataStreamTreeTokenType, DOC_RANGE_TYPE } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocSelectionRenderService } from '../doc-selection-render.service';
import { TextRange } from '../text-range';

const {
    getCanvasOffsetByEngineMock,
    getRangeListFromCharIndexMock,
    getRectRangeFromCharIndexMock,
    getTextRangeFromCharIndexMock,
} = vi.hoisted(() => ({
    getCanvasOffsetByEngineMock: vi.fn(),
    getRangeListFromCharIndexMock: vi.fn(),
    getRectRangeFromCharIndexMock: vi.fn(),
    getTextRangeFromCharIndexMock: vi.fn(),
}));

vi.mock('../selection-utils', async () => {
    const actual = await vi.importActual<typeof import('../selection-utils')>('../selection-utils');

    return {
        ...actual,
        getCanvasOffsetByEngine: getCanvasOffsetByEngineMock,
        getRangeListFromCharIndex: getRangeListFromCharIndexMock,
        getRectRangeFromCharIndex: getRectRangeFromCharIndexMock,
        getTextRangeFromCharIndex: getTextRangeFromCharIndexMock,
    };
});

type VoidMock = Mock<() => void>;
type BooleanMock = Mock<() => boolean>;
type AnchorMock = Mock<() => { left: number; top: number; visible: boolean } | null>;
type IntersectionMock = Mock<(range: unknown) => boolean>;

interface IFakeTextRange {
    activate: VoidMock;
    deactivate: VoidMock;
    dispose: VoidMock;
    getAnchor: AnchorMock;
    isActive: BooleanMock;
    isIntersection: IntersectionMock;
    collapsed?: boolean;
    anchorNodePosition?: Record<string, unknown> | null;
    focusNodePosition?: Record<string, unknown> | null;
    style?: { strokeWidth: number };
    segmentId?: string;
    segmentPage?: number;
}

interface IFakeRectRange {
    activate: VoidMock;
    deactivate: VoidMock;
    dispose: VoidMock;
    isIntersection: IntersectionMock;
}

interface IServiceHarness {
    _rangeList: IFakeTextRange[];
    _rangeListCache: IFakeTextRange[];
    _rectRangeList: IFakeRectRange[];
    _rectRangeListCache: IFakeRectRange[];
    _selectionStyle: { strokeWidth: number };
    _textSelectionInner$: { next: Mock<(...args: unknown[]) => void> };
    focus: Mock<() => void>;
    _getAllTextRanges: Mock<() => string[]>;
    _getAllRectRanges: Mock<() => string[]>;
    _findNodeByCoord: Mock<(...args: unknown[]) => unknown>;
    _getNodePosition: Mock<(...args: unknown[]) => unknown>;
    _interactTextRanges(textRanges: IFakeTextRange[]): void;
    _interactRectRanges(rectRanges: IFakeRectRange[]): void;
    _removeAllRanges(): void;
    _removeAllCacheRanges(): void;
    _removeAllCollapsedTextRanges(): void;
    _addTextRangesToCache(textRanges: IFakeTextRange[]): void;
    _addTextRange(textRange: IFakeTextRange): void;
    _addRectRangesToCache(rectRanges: IFakeRectRange[]): void;
    _addRectRanges(rectRanges: IFakeRectRange[]): void;
    _createTextRangeByAnchorPosition(position: Record<string, unknown>): void;
    _isEmpty(): boolean;
    _getCanvasOffset(): { left: number; top: number };
    _updateInputPosition(): void;
    addDocRanges(ranges: Array<Record<string, unknown>>, isEditing?: boolean, options?: Record<string, boolean>): void;
    setCursorManually(evtOffsetX: number, evtOffsetY: number): void;
}

function createTextRange(overrides: Partial<IFakeTextRange> = {}): IFakeTextRange {
    return {
        activate: vi.fn(),
        deactivate: vi.fn(),
        dispose: vi.fn(),
        getAnchor: vi.fn(() => ({ left: 12, top: 34, visible: true })),
        isActive: vi.fn(() => false),
        isIntersection: vi.fn(() => false),
        collapsed: false,
        anchorNodePosition: { glyph: 1 },
        ...overrides,
    };
}

function createRectRange(overrides: Partial<IFakeRectRange> = {}): IFakeRectRange {
    return {
        activate: vi.fn(),
        deactivate: vi.fn(),
        dispose: vi.fn(),
        isIntersection: vi.fn(() => false),
        ...overrides,
    };
}

function createService() {
    const engine = { name: 'engine' };
    const skeleton = { name: 'skeleton' };
    const mainComponent = { name: 'doc-component' };
    const scene = {
        getEngine: vi.fn(() => engine),
        getViewports: vi.fn(() => []),
    };

    const service = Object.setPrototypeOf({
        _rangeList: [],
        _rangeListCache: [],
        _rectRangeList: [],
        _rectRangeListCache: [],
        _selectionStyle: { strokeWidth: 1 },
        _currentSegmentId: 'segment-1',
        _currentSegmentPage: 2,
        _context: {
            scene,
            mainComponent,
            unitId: 'unit-1',
        },
        _docSkeletonManagerService: {
            getSkeleton: vi.fn(() => skeleton),
        },
        _logService: {
            error: vi.fn(),
        },
        _textSelectionInner$: {
            next: vi.fn(),
        },
        _getAllTextRanges: vi.fn(() => ['serialized-text']),
        _getAllRectRanges: vi.fn(() => ['serialized-rect']),
        _findNodeByCoord: vi.fn(),
        _getNodePosition: vi.fn(),
        focus: vi.fn(),
    }, DocSelectionRenderService.prototype) as IServiceHarness;

    return {
        engine,
        mainComponent,
        scene,
        service,
        skeleton,
    };
}

describe('doc selection render service internals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getCanvasOffsetByEngineMock.mockReturnValue({ left: 8, top: 16 });
        getRangeListFromCharIndexMock.mockReturnValue(null);
        getRectRangeFromCharIndexMock.mockReturnValue(null);
        getTextRangeFromCharIndexMock.mockReturnValue(null);
        vi.spyOn(TextRange.prototype as unknown as Record<'_anchorBlink', () => void>, '_anchorBlink').mockImplementation(() => {});
        vi.spyOn(TextRange.prototype, 'refresh').mockImplementation(() => {});
    });

    it('drops intersecting text and rect ranges while keeping unrelated ones', () => {
        const { service } = createService();
        const overlappedText = createTextRange();
        const preservedText = createTextRange();
        const nextText = createTextRange();
        const overlappedRect = createRectRange();
        const preservedRect = createRectRange();
        const nextRect = createRectRange();

        nextText.isIntersection.mockImplementation((range) => range === overlappedText);
        nextRect.isIntersection.mockImplementation((range) => range === overlappedRect);

        service._rangeList = [overlappedText, preservedText];
        service._rectRangeList = [overlappedRect, preservedRect];

        service._interactTextRanges([nextText]);
        service._interactRectRanges([nextRect]);

        expect(overlappedText.dispose).toHaveBeenCalledTimes(1);
        expect(preservedText.dispose).not.toHaveBeenCalled();
        expect(service._rangeList).toEqual([preservedText]);
        expect(overlappedRect.dispose).toHaveBeenCalledTimes(1);
        expect(preservedRect.dispose).not.toHaveBeenCalled();
        expect(service._rectRangeList).toEqual([preservedRect]);
    });

    it('adds cache and active ranges, then clears them through shared cleanup', () => {
        const { service } = createService();
        const currentText = createTextRange();
        const currentRect = createRectRange();
        const cachedText = createTextRange();
        const cachedRect = createRectRange();
        const appendedText = createTextRange();
        const appendedRect = createRectRange();
        const appendedRectLast = createRectRange();

        service._rangeList = [currentText];
        service._rectRangeList = [currentRect];

        expect(service._isEmpty()).toBe(false);

        service._addTextRangesToCache([cachedText]);
        service._addRectRangesToCache([cachedRect]);
        service._addTextRange(appendedText);
        service._addRectRanges([appendedRect, appendedRectLast]);

        expect(currentText.deactivate).toHaveBeenCalledTimes(1);
        expect(appendedText.activate).toHaveBeenCalledTimes(1);
        expect(currentRect.deactivate).toHaveBeenCalledTimes(1);
        expect(appendedRect.activate).not.toHaveBeenCalled();
        expect(appendedRectLast.activate).toHaveBeenCalledTimes(1);
        expect(service._rangeListCache).toEqual([cachedText]);
        expect(service._rectRangeListCache).toEqual([cachedRect]);
        expect(service._rangeList).toEqual([currentText, appendedText]);
        expect(service._rectRangeList).toEqual([currentRect, appendedRect, appendedRectLast]);

        service._removeAllCacheRanges();

        expect(cachedText.dispose).toHaveBeenCalledTimes(1);
        expect(cachedRect.dispose).toHaveBeenCalledTimes(1);
        expect(service._rangeListCache).toEqual([]);
        expect(service._rectRangeListCache).toEqual([]);

        service._removeAllRanges();

        expect(currentText.dispose).toHaveBeenCalledTimes(1);
        expect(appendedText.dispose).toHaveBeenCalledTimes(1);
        expect(currentRect.dispose).toHaveBeenCalledTimes(1);
        expect(appendedRect.dispose).toHaveBeenCalledTimes(1);
        expect(appendedRectLast.dispose).toHaveBeenCalledTimes(1);
        expect(service._rangeList).toEqual([]);
        expect(service._rectRangeList).toEqual([]);
        expect(service._isEmpty()).toBe(true);
    });

    it('removes only collapsed text ranges and focuses when input anchor is unavailable', () => {
        const { service } = createService();
        const collapsedRange = createTextRange({
            collapsed: true,
            getAnchor: vi.fn(() => null),
            isActive: vi.fn(() => true),
        });
        const expandedRange = createTextRange({ collapsed: false });

        service._rangeList = [collapsedRange, expandedRange];

        service._removeAllCollapsedTextRanges();
        service._updateInputPosition();

        expect(collapsedRange.dispose).toHaveBeenCalledTimes(1);
        expect(expandedRange.dispose).not.toHaveBeenCalled();
        expect(service.focus).toHaveBeenCalledTimes(1);
    });

    it('creates a text range from anchor position with current skeleton and segment context', () => {
        const { service } = createService();
        const oldText = createTextRange();
        const oldRect = createRectRange();
        const position = { glyph: 9, line: 3 };

        service._rangeList = [oldText];
        service._rectRangeList = [oldRect];

        service._createTextRangeByAnchorPosition(position);

        expect(oldText.dispose).toHaveBeenCalledTimes(1);
        expect(oldRect.dispose).toHaveBeenCalledTimes(1);
        expect(service._rangeList[0]).toBeInstanceOf(TextRange);
        expect(service._rangeList[0].anchorNodePosition).toEqual(position);
        expect(service._rangeList[0].focusNodePosition).toBeUndefined();
        expect(service._rangeList[0].style).toBe(service._selectionStyle);
        expect(service._rangeList[0].segmentId).toBe('segment-1');
        expect(service._rangeList[0].segmentPage).toBe(2);
        expect(service._rangeList).toHaveLength(1);
        expect(service._rangeList[0].isActive()).toBe(true);
    });

    it('adds document ranges across rect, text, and fallback branches without focusing', () => {
        const { mainComponent, scene, service, skeleton } = createService();
        const rectRange = createRectRange();
        const textRange = createTextRange();
        const fallbackTextRange = createTextRange();
        const fallbackRectRange = createRectRange();
        const generalTextRange = createTextRange();
        const generalRectRange = createRectRange();
        const updateInputPositionSpy = vi.fn();

        service._updateInputPosition = updateInputPositionSpy;

        getRectRangeFromCharIndexMock.mockReturnValueOnce(rectRange);
        getTextRangeFromCharIndexMock
            .mockReturnValueOnce(textRange)
            .mockImplementationOnce(() => {
                throw new Error('split across pages');
            });
        getRangeListFromCharIndexMock
            .mockReturnValueOnce({
                textRanges: [fallbackTextRange],
                rectRanges: [fallbackRectRange],
            })
            .mockReturnValueOnce({
                textRanges: [generalTextRange],
                rectRanges: [generalRectRange],
            });

        service.addDocRanges([
            { startOffset: 10, endOffset: 14, rangeType: DOC_RANGE_TYPE.RECT },
            {
                startOffset: 21,
                endOffset: 25,
                rangeType: DOC_RANGE_TYPE.TEXT,
                startNodePosition: { isBack: false },
                endNodePosition: { isBack: true },
            },
            { startOffset: 31, endOffset: 35, rangeType: DOC_RANGE_TYPE.TEXT },
            { startOffset: 41, endOffset: 44, rangeType: 'other' },
        ], false, {
            fromToolbar: true,
            shouldFocus: false,
        });

        expect(getRectRangeFromCharIndexMock).toHaveBeenCalledWith(
            10,
            14,
            scene,
            mainComponent,
            skeleton,
            service._selectionStyle,
            'segment-1',
            2
        );
        expect(getTextRangeFromCharIndexMock).toHaveBeenNthCalledWith(
            1,
            20,
            25,
            scene,
            mainComponent,
            skeleton,
            service._selectionStyle,
            'segment-1',
            2,
            false,
            true
        );
        expect(getTextRangeFromCharIndexMock).toHaveBeenNthCalledWith(
            2,
            31,
            35,
            scene,
            mainComponent,
            skeleton,
            service._selectionStyle,
            'segment-1',
            2
        );
        expect(getRangeListFromCharIndexMock).toHaveBeenNthCalledWith(
            1,
            31,
            35,
            scene,
            mainComponent,
            skeleton,
            service._selectionStyle,
            'segment-1',
            2
        );
        expect(getRangeListFromCharIndexMock).toHaveBeenNthCalledWith(
            2,
            41,
            44,
            scene,
            mainComponent,
            skeleton,
            service._selectionStyle,
            'segment-1',
            2
        );
        expect(service._textSelectionInner$.next).toHaveBeenCalledWith({
            textRanges: ['serialized-text'],
            rectRanges: ['serialized-rect'],
            segmentId: 'segment-1',
            segmentPage: 2,
            style: service._selectionStyle,
            isEditing: false,
            options: {
                fromToolbar: true,
                shouldFocus: false,
            },
        });
        expect(updateInputPositionSpy).not.toHaveBeenCalled();
        expect(service._rangeList).toEqual([textRange, fallbackTextRange, generalTextRange]);
        expect(service._rectRangeList).toEqual([rectRange, fallbackRectRange, generalRectRange]);
    });

    it('sets the cursor manually from the resolved paragraph node and emits selection state', () => {
        const { service } = createService();
        const position = { glyph: 3 };
        const createTextRangeByAnchorPositionSpy = vi.fn();

        service._createTextRangeByAnchorPosition = createTextRangeByAnchorPositionSpy;
        service._findNodeByCoord.mockReturnValue({
            node: {
                streamType: DataStreamTreeTokenType.PARAGRAPH,
            },
        });
        service._getNodePosition.mockReturnValue(position);

        service.setCursorManually(12, 24);

        expect(service._findNodeByCoord).toHaveBeenCalledWith(12, 24, {
            strict: true,
            segmentId: 'segment-1',
            segmentPage: 2,
        });
        expect(position).toEqual({ glyph: 3, isBack: true });
        expect(createTextRangeByAnchorPositionSpy).toHaveBeenCalledWith(position);
        expect(service._textSelectionInner$.next).toHaveBeenCalledWith({
            textRanges: ['serialized-text'],
            rectRanges: ['serialized-rect'],
            segmentId: 'segment-1',
            segmentPage: 2,
            style: service._selectionStyle,
            isEditing: false,
        });
    });

    it('clears ranges when manual cursor placement cannot resolve a node position', () => {
        const { service } = createService();
        const removeAllRangesSpy = vi.fn();

        service._removeAllRanges = removeAllRangesSpy;
        service._getNodePosition.mockReturnValue(null);

        service.setCursorManually(4, 8);

        expect(removeAllRangesSpy).toHaveBeenCalledTimes(1);
        expect(service._textSelectionInner$.next).not.toHaveBeenCalled();
    });

    it('reads canvas offsets from the current engine', () => {
        const { engine, service } = createService();

        expect(service._getCanvasOffset()).toEqual({ left: 8, top: 16 });
        expect(getCanvasOffsetByEngineMock).toHaveBeenCalledWith(engine);
    });
});
