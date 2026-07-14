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

// @vitest-environment jsdom

import type { IDisposable, IDocumentData } from '@univerjs/core';
import type { Mock } from 'vitest';
import { DataStreamTreeTokenType, DOC_RANGE_TYPE, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { GlyphType, RenderUnit } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedInteractionBoundaryService, EmbedRuntimeFocusCoordinator } from '../../doc-embed-integration.service';
import { DocSelectionRenderService } from '../doc-selection-render.service';
import { TextRange } from '../text-range';

const {
    getCanvasOffsetByEngineMock,
    getRangeListFromCharIndexMock,
    getRangeListFromSelectionMock,
    getRectRangeFromCharIndexMock,
    getTextRangeFromCharIndexMock,
} = vi.hoisted(() => ({
    getCanvasOffsetByEngineMock: vi.fn(),
    getRangeListFromCharIndexMock: vi.fn(),
    getRangeListFromSelectionMock: vi.fn(),
    getRectRangeFromCharIndexMock: vi.fn(),
    getTextRangeFromCharIndexMock: vi.fn(),
}));

vi.mock('../selection-utils', async () => {
    const actual = await vi.importActual<typeof import('../selection-utils')>('../selection-utils');

    return {
        ...actual,
        getCanvasOffsetByEngine: getCanvasOffsetByEngineMock,
        getRangeListFromCharIndex: getRangeListFromCharIndexMock,
        getRangeListFromSelection: getRangeListFromSelectionMock,
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
    _anchorNodePosition?: unknown;
    _focusNodePosition?: unknown;
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
    _moving(moveOffsetX: number, moveOffsetY: number): void;
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
    const engine = { name: 'engine', setCapture: vi.fn() };
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
        _container: {
            style: {},
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

class TestLayoutService {
    static root: HTMLDivElement;
    static registeredElements: HTMLElement[] = [];

    static reset() {
        this.root = document.createElement('div');
        document.body.appendChild(this.root);
        this.registeredElements = [];
    }

    get rootContainerElement() {
        return TestLayoutService.root;
    }

    registerContainerElement(element: HTMLElement): IDisposable {
        TestLayoutService.registeredElements.push(element);

        return {
            dispose: () => {
                const nextElements: HTMLElement[] = [];
                for (const current of TestLayoutService.registeredElements) {
                    if (current !== element) {
                        nextElements.push(current);
                    }
                }
                TestLayoutService.registeredElements = nextElements;
            },
        };
    }
}

class TestDocSkeletonManagerService {
    static skeleton: {
        findPositionByGlyph: () => unknown;
        findNodeByCoord: () => unknown;
    } = {
        findPositionByGlyph: () => null,
        findNodeByCoord: () => null,
    };

    static reset() {
        this.skeleton = {
            findPositionByGlyph: () => null,
            findNodeByCoord: () => null,
        };
    }

    getSkeleton() {
        return TestDocSkeletonManagerService.skeleton;
    }
}

class TestRenderEvent<T> {
    private readonly _listeners: Array<(param: T) => void> = [];

    subscribeEvent(listener: (param: T) => void) {
        this._listeners.push(listener);

        return {
            unsubscribe: () => {
                const nextListeners: Array<(param: T) => void> = [];
                for (const current of this._listeners) {
                    if (current !== listener) {
                        nextListeners.push(current);
                    }
                }
                this._listeners.length = 0;
                this._listeners.push(...nextListeners);
            },
        };
    }

    emit(param: T) {
        for (const listener of this._listeners) {
            listener(param);
        }
    }
}

function createRealSelectionRenderService(options: {
    embedInteractionBoundaryService?: Partial<EmbedInteractionBoundaryService>;
    embedRuntimeFocusCoordinator?: EmbedRuntimeFocusCoordinator;
    mainComponent?: unknown;
    scene?: unknown;
} = {}) {
    TestLayoutService.reset();
    TestDocSkeletonManagerService.reset();
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    if (options.embedInteractionBoundaryService) {
        injector.add([EmbedInteractionBoundaryService, { useValue: options.embedInteractionBoundaryService as never }]);
    }
    if (options.embedRuntimeFocusCoordinator) {
        injector.add([EmbedRuntimeFocusCoordinator, { useValue: options.embedRuntimeFocusCoordinator }]);
    }
    const documentData: IDocumentData = {
        id: 'selection-render-doc',
        body: {
            dataStream: 'Hello\r\n',
            paragraphs: [{ paragraphId: 'para_docs_ui_selection_fixture_1', startIndex: 5 }],
            sectionBreaks: [],
        },
        documentStyle: {},
    };
    const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, documentData);
    const renderUnit = injector.createInstance(RenderUnit, {
        engine: { name: 'engine' } as never,
        scene: (options.scene ?? {
            getViewports: () => [],
            getEngine: () => null,
        }) as never,
        isMainScene: true,
        unit: doc,
    });
    if (options.mainComponent) {
        renderUnit.mainComponent = options.mainComponent as never;
    }
    renderUnit.addRenderDependencies([
        [DocSkeletonManagerService, { useClass: TestDocSkeletonManagerService as never }],
        DocSelectionRenderService,
    ] as never);

    return {
        input: document.getElementById('__editor_selection-render-doc') as HTMLDivElement,
        renderUnit,
        service: renderUnit.with(DocSelectionRenderService),
        univer,
    };
}

describe('doc selection render service internals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getCanvasOffsetByEngineMock.mockReturnValue({ left: 8, top: 16 });
        getRangeListFromCharIndexMock.mockReturnValue(null);
        getRangeListFromSelectionMock.mockReturnValue(null);
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
        expect(service._rangeList).toEqual([expandedRange]);
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

    it('snaps reverse drag focus to the start of the first glyph so the first character remains selectable', () => {
        const { engine, mainComponent, scene, service, skeleton } = createService();
        const firstGlyph: {
            content: string;
            count: number;
            glyphType: GlyphType;
            parent?: unknown;
        } = {
            content: 'D',
            count: 1,
            glyphType: GlyphType.WORD,
        };
        const secondGlyph: {
            content: string;
            count: number;
            glyphType: GlyphType;
            parent?: unknown;
        } = {
            content: 'o',
            count: 1,
            glyphType: GlyphType.WORD,
        };
        const divide = {
            glyphGroup: [firstGlyph, secondGlyph],
        };
        firstGlyph.parent = divide;
        secondGlyph.parent = divide;

        const anchorPosition = {
            page: 0,
            section: 0,
            column: 0,
            line: 1,
            divide: 0,
            glyph: 4,
            isBack: false,
        };
        const focusPosition = {
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 0,
            isBack: false,
        };
        const textRange = createTextRange({ collapsed: false });

        service._anchorNodePosition = anchorPosition;
        service._findNodeByCoord.mockReturnValue({ node: firstGlyph });
        service._getNodePosition.mockReturnValue(focusPosition);
        getRangeListFromSelectionMock.mockReturnValue({
            textRanges: [textRange],
            rectRanges: [],
        });

        service._moving(120, 80);

        expect(focusPosition.isBack).toBe(true);
        expect(getRangeListFromSelectionMock).toHaveBeenCalledWith(
            anchorPosition,
            expect.objectContaining({
                glyph: 0,
                isBack: true,
            }),
            scene,
            mainComponent,
            skeleton,
            service._selectionStyle,
            'segment-1',
            2
        );
        expect(service._rangeListCache).toEqual([textRange]);
        expect(engine.setCapture).toHaveBeenCalledTimes(1);
    });

    it('disposes collapsed transient ranges while moving so they do not leak as extra cursors', () => {
        const { engine, service } = createService();
        const glyph = {
            content: 'D',
            count: 1,
            glyphType: GlyphType.WORD,
            parent: {
                glyphGroup: [] as unknown[],
            },
        };
        glyph.parent.glyphGroup = [glyph];
        const anchorPosition = {
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 0,
            isBack: true,
        };
        const focusPosition = { ...anchorPosition };
        const collapsedTextRange = createTextRange({ collapsed: true });

        service._anchorNodePosition = anchorPosition;
        service._findNodeByCoord.mockReturnValue({ node: glyph });
        service._getNodePosition.mockReturnValue(focusPosition);
        getRangeListFromSelectionMock.mockReturnValue({
            textRanges: [collapsedTextRange],
            rectRanges: [],
        });

        service._moving(120, 80);

        expect(collapsedTextRange.dispose).toHaveBeenCalledTimes(1);
        expect(service._focusNodePosition).toBeUndefined();
        expect(service._rangeListCache).toEqual([]);
        expect(engine.setCapture).not.toHaveBeenCalled();
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

describe('DocSelectionRenderService', () => {
    let cleanup: Array<() => void> = [];

    beforeEach(() => {
        vi.clearAllMocks();
        getCanvasOffsetByEngineMock.mockReturnValue({ left: 0, top: 0 });
        getRangeListFromCharIndexMock.mockReturnValue(null);
        getRangeListFromSelectionMock.mockReturnValue(null);
        getRectRangeFromCharIndexMock.mockReturnValue(null);
        getTextRangeFromCharIndexMock.mockReturnValue(null);
    });

    afterEach(() => {
        for (const dispose of cleanup) {
            dispose();
        }
        cleanup = [];
        document.body.innerHTML = '';
    });

    it('keeps the editable input inside the Univer layout root and registers it as an app container', () => {
        const { renderUnit, service, univer } = createRealSelectionRenderService();
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        const container = document.getElementById('univer-doc-selection-container-selection-render-doc');

        expect(container?.parentElement).toBe(TestLayoutService.root);
        expect(TestLayoutService.registeredElements).toEqual([container]);

        service.dispose();

        expect(document.getElementById('univer-doc-selection-container-selection-render-doc')).toBeNull();
        expect(TestLayoutService.registeredElements).toEqual([]);
    });

    it('does not steal focus back from an embedded runtime during selection sync', () => {
        const embedCanvas = document.createElement('canvas');
        embedCanvas.tabIndex = 0;
        document.body.appendChild(embedCanvas);
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const embedInteractionBoundaryService = {
            contains: vi.fn((_embedId: string | undefined, target: EventTarget | null | undefined) => target === embedCanvas),
            hasRecentInteraction: vi.fn(() => false),
            hasRecentInteractionFor: vi.fn(() => false),
        };
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        embedCanvas.focus();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'selection-render-doc',
        });
        cleanup.push(() => lease.dispose());

        service.sync();

        expect(document.activeElement).toBe(embedCanvas);
        expect(document.activeElement).not.toBe(input);
        expect(embedInteractionBoundaryService.contains).not.toHaveBeenCalledWith(undefined, embedCanvas);
    });

    it('keeps normal host document selection focus when an unrelated embed boundary exists', () => {
        const embedCanvas = document.createElement('canvas');
        embedCanvas.tabIndex = 0;
        document.body.appendChild(embedCanvas);
        const embedInteractionBoundaryService = {
            contains: vi.fn((_embedId: string | undefined, target: EventTarget | null | undefined) => target === embedCanvas),
            hasRecentInteraction: vi.fn(() => true),
            hasRecentInteractionFor: vi.fn(() => false),
        };
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({ embedInteractionBoundaryService });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        embedCanvas.focus();
        service.sync();

        expect(document.activeElement).toBe(input);
    });

    it('does not steal focus from an embed-owned child element inside the Univer layout root', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const embedInteractionBoundaryService = {
            contains: vi.fn(() => true),
            hasRecentInteraction: vi.fn(() => false),
            hasRecentInteractionFor: vi.fn(() => false),
        };
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService,
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        const runtimeCanvas = document.createElement('canvas');
        runtimeCanvas.tabIndex = 0;
        TestLayoutService.root.appendChild(runtimeCanvas);

        runtimeCanvas.focus();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'selection-render-doc',
        });
        cleanup.push(() => lease.dispose());

        service.sync();

        expect(document.activeElement).toBe(runtimeCanvas);
        expect(document.activeElement).not.toBe(input);
    });

    it('does not steal focus back while an embedded child editor owns an interaction lease', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => false),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        TestLayoutService.root.tabIndex = 0;
        TestLayoutService.root.focus();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
        });
        cleanup.push(() => lease.dispose());

        service.sync();

        expect(document.activeElement).toBe(TestLayoutService.root);
        expect(document.activeElement).not.toBe(input);
    });

    it('keeps host document focus suspended during a plain stage2 child session', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => false),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
        });
        cleanup.push(() => lease.dispose());

        input.blur();
        expect(document.activeElement).toBe(document.body);

        service.sync();

        expect(document.activeElement).toBe(document.body);
        expect(document.activeElement).not.toBe(input);
    });

    it('does not force-focus the host hidden editor while a child session owns the host document', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => false),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'selection-render-doc',
            childUnitId: 'child-sheet',
        });
        cleanup.push(() => lease.dispose());

        input.blur();
        expect(document.activeElement).toBe(document.body);

        service.activate(12, 34, true);

        expect(document.activeElement).toBe(document.body);
        expect(document.activeElement).not.toBe(input);
    });

    it('does not treat its own embedded runtime as external focus while a child editor lease is active', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => true),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        TestLayoutService.root.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        const runtimeCanvas = document.createElement('canvas');
        runtimeCanvas.tabIndex = 0;
        runtimeCanvas.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        input.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        input.parentElement?.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        TestLayoutService.root.appendChild(runtimeCanvas);
        runtimeCanvas.focus();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
        });
        cleanup.push(() => lease.dispose());

        expect(service.canFocusing).toBe(true);

        service.sync();

        expect(document.activeElement).toBe(input);
    });

    it('allows the internal sheet cell editor to refocus from an embed-owned canvas', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => true),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        const runtimeCanvas = document.createElement('canvas');
        runtimeCanvas.tabIndex = 0;
        runtimeCanvas.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        input.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        input.parentElement?.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        TestLayoutService.root.appendChild(runtimeCanvas);
        runtimeCanvas.focus();
        (service as unknown as { _context: { unitId: string } })._context.unitId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
        });
        cleanup.push(() => lease.dispose());

        expect(input.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(runtimeCanvas.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect((service as unknown as { _containsCurrentEmbedRuntimeElement(element: HTMLElement): boolean })._containsCurrentEmbedRuntimeElement(runtimeCanvas)).toBe(true);
        expect(service.canFocusing).toBe(true);

        service.activate(12, 34);

        expect(document.activeElement).toBe(input);
    });

    it('publishes hidden editor input, paste, focus, and blur events with the typed content', () => {
        const { input, renderUnit, service, univer } = createRealSelectionRenderService();
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const received: Array<{ type: string; content?: string }> = [];
        const subscriptions = [
            service.onInputBefore$.subscribe((config) => received.push({ type: 'before-input', content: config?.content })),
            service.onInput$.subscribe((config) => received.push({ type: 'input', content: config.content })),
            service.onPaste$.subscribe((config) => received.push({ type: 'paste', content: config.content })),
            service.onFocus$.subscribe((config) => received.push({ type: 'focus', content: config.content })),
            service.onBlur$.subscribe((config) => received.push({ type: 'blur', content: config.content })),
        ];
        cleanup.push(() => {
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        });

        input.textContent = 'typed text';
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
        input.textContent = 'pasted text';
        input.dispatchEvent(new Event('paste', { bubbles: true }));
        input.dispatchEvent(new Event('focus', { bubbles: true }));
        input.textContent = 'leaving editor';
        input.dispatchEvent(new Event('blur', { bubbles: true }));

        expect(received).toEqual([
            { type: 'before-input', content: 'typed text' },
            { type: 'input', content: 'typed text' },
            { type: 'paste', content: 'pasted text' },
            { type: 'focus', content: '' },
            { type: 'blur', content: 'leaving editor' },
        ]);
        expect(input.textContent).toBe('');
    });

    it('does not publish host hidden editor events while a child session owns the host document', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, service, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => false),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const received: string[] = [];
        const subscriptions = [
            service.onInputBefore$.subscribe(() => received.push('before-input')),
            service.onInput$.subscribe(() => received.push('input')),
            service.onKeydown$.subscribe(() => received.push('keydown')),
            service.onBlur$.subscribe(() => received.push('blur')),
        ];
        cleanup.push(() => {
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        });

        input.focus();
        const lease = focusCoordinator.acquireLease({
            embedId: 'docs-custom-block-sheet',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'selection-render-doc',
            childUnitId: 'child-sheet',
        });
        cleanup.push(() => lease.dispose());

        input.textContent = '=';
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '=' }));
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '=' }));
        input.textContent = 'leaving host editor';
        input.dispatchEvent(new Event('blur', { bubbles: true }));

        expect(received).toEqual([]);
        expect(input.textContent).toBe('leaving host editor');
    });

    it('blurs the host hidden editor when it is focused during a child session', () => {
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const { input, renderUnit, univer } = createRealSelectionRenderService({
            embedInteractionBoundaryService: {
                contains: vi.fn(() => false),
                hasRecentInteraction: vi.fn(() => false),
            },
            embedRuntimeFocusCoordinator: focusCoordinator,
        });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());

        input.tabIndex = 0;
        input.focus();
        expect(document.activeElement).toBe(input);
        input.blur();
        expect(document.activeElement).not.toBe(input);

        const lease = focusCoordinator.acquireLease({
            embedId: 'docs-custom-block-sheet',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'selection-render-doc',
            childUnitId: 'child-sheet',
        });
        cleanup.push(() => lease.dispose());

        input.focus();

        expect(document.activeElement).not.toBe(input);
    });

    it('suppresses normal keydown while IME composition is active, then resumes key events after composition ends', () => {
        const { input, renderUnit, service, univer } = createRealSelectionRenderService();
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const events: Array<{ type: string; content?: string }> = [];
        const subscriptions = [
            service.onKeydown$.subscribe((config) => events.push({ type: 'keydown', content: config.content })),
            service.onCompositionstart$.subscribe((config) => {
                if (config) {
                    events.push({ type: 'compositionstart', content: config.content });
                }
            }),
            service.onCompositionupdate$.subscribe((config) => {
                if (config) {
                    events.push({ type: 'compositionupdate', content: config.content });
                }
            }),
            service.onCompositionend$.subscribe((config) => {
                if (config) {
                    events.push({ type: 'compositionend', content: config.content });
                }
            }),
        ];
        cleanup.push(() => {
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        });

        input.textContent = '拼';
        input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '拼' }));
        input.textContent = 'pin';
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'p' }));
        input.dispatchEvent(new CompositionEvent('compositionupdate', { bubbles: true, data: '拼' }));
        input.textContent = '拼';
        input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '拼' }));
        input.textContent = 'done';
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));

        expect(events).toEqual([
            { type: 'compositionstart', content: '拼' },
            { type: 'compositionupdate', content: 'pin' },
            { type: 'compositionend', content: '拼' },
            { type: 'keydown', content: 'done' },
        ]);
    });

    it('keeps embed-owned select-all keydown inside the child editor without blocking editor input handling', () => {
        const { input, renderUnit, service, univer } = createRealSelectionRenderService();
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        input.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        const documentKeydown = vi.fn();
        const keydownEvents: Array<{ content?: string; defaultPrevented: boolean }> = [];
        document.addEventListener('keydown', documentKeydown);
        const subscription = service.onKeydown$.subscribe((config) => {
            keydownEvents.push({
                content: config.content,
                defaultPrevented: config.event.defaultPrevented,
            });
        });
        cleanup.push(
            () => document.removeEventListener('keydown', documentKeydown),
            () => subscription.unsubscribe()
        );

        input.textContent = 'cell text';
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a', metaKey: true }));

        expect(keydownEvents).toEqual([{ content: 'cell text', defaultPrevented: false }]);
        expect(documentKeydown).not.toHaveBeenCalled();
    });

    it('keeps segment state stable while the editor is reused by header, footer, and body selection flows', () => {
        const { renderUnit, service, univer } = createRealSelectionRenderService();
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const contexts: Array<{ segmentId: string; segmentPage: number }> = [];
        const subscription = service.segmentContext$.subscribe((context) => contexts.push(context));
        cleanup.push(() => subscription.unsubscribe());

        service.setSegment('header-1');
        service.setSegmentPage(3);
        service.setReserveRangesStatus(true);

        expect(service.getSegment()).toBe('header-1');
        expect(service.getSegmentPage()).toBe(3);

        service.setSegment('');
        service.setSegmentPage(-1);

        expect(service.getSegment()).toBe('');
        expect(service.getSegmentPage()).toBe(-1);
        expect(contexts).toEqual([
            { segmentId: '', segmentPage: -1 },
            { segmentId: 'header-1', segmentPage: -1 },
            { segmentId: 'header-1', segmentPage: 3 },
            { segmentId: '', segmentPage: 3 },
            { segmentId: '', segmentPage: -1 },
        ]);
    });

    it('selects the current word on double click and the paragraph on triple click', () => {
        const viewport = {
            transformVector2SceneCoord: () => ({ x: 8, y: 12 }),
            getAbsoluteVector: () => ({ x: 16, y: 24 }),
        };
        const scene = {
            getViewports: () => [viewport],
            getEngine: () => ({ name: 'engine' }),
        };
        const documentTransform = {
            clone: () => ({
                invert: () => ({
                    applyPoint: (point: unknown) => point,
                }),
            }),
        };
        const mainComponent = {
            getOffsetConfig: () => ({
                documentTransform,
                pageMarginLeft: 0,
                pageMarginTop: 0,
            }),
        };
        const { renderUnit, service, univer } = createRealSelectionRenderService({ mainComponent, scene });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const column = { lines: [] as unknown[] };
        const line = { paragraphIndex: 5, st: 0, parent: column, divides: [] as unknown[] };
        const divide = { parent: line, glyphGroup: [] as Array<{ content: string; count: number; glyphType: GlyphType; parent?: unknown }> };
        const glyphs: Array<{ content: string; count: number; glyphType: GlyphType; parent?: unknown }> = [];
        for (const content of ['H', 'e', 'l', 'l', 'o']) {
            glyphs.push({ content, count: 1, glyphType: GlyphType.WORD, parent: divide });
        }
        divide.glyphGroup = glyphs;
        line.divides = [divide];
        column.lines = [line];
        (service as unknown as { _findNodeByCoord: () => unknown })._findNodeByCoord = () => ({ node: glyphs[1], ratioX: 0.4, segmentPage: -1 });
        const wordRange = {
            ...createTextRange({ isActive: vi.fn(() => true) }),
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            rangeType: DOC_RANGE_TYPE.TEXT,
            segmentId: '',
            segmentPage: -1,
            direction: 'forward',
            startNodePosition: null,
            endNodePosition: null,
        };
        const paragraphRange = {
            ...createTextRange({ isActive: vi.fn(() => true) }),
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            rangeType: DOC_RANGE_TYPE.TEXT,
            segmentId: '',
            segmentPage: -1,
            direction: 'forward',
            startNodePosition: null,
            endNodePosition: null,
        };
        getRangeListFromCharIndexMock
            .mockReturnValueOnce({ textRanges: [wordRange], rectRanges: [] })
            .mockReturnValueOnce({ textRanges: [paragraphRange], rectRanges: [] });
        const selections: string[] = [];
        const subscription = service.textSelectionInner$.subscribe((selection) => {
            if (!selection) {
                return;
            }
            for (const range of selection.textRanges) {
                selections.push(`${range.startOffset}:${range.endOffset}`);
            }
        });
        cleanup.push(() => subscription.unsubscribe());

        service.__handleDblClick({ offsetX: 10, offsetY: 12 } as never);
        service.__handleTripleClick({ offsetX: 10, offsetY: 12 } as never);

        expect(selections).toEqual(['0:5', '0:5']);
    });

    it('moves the hidden editor to the active visible selection when syncing canvas selection to DOM input', () => {
        getCanvasOffsetByEngineMock.mockReturnValue({ left: 5, top: 7 });
        const viewport = {
            getAbsoluteVector: () => ({ x: 30, y: 40 }),
        };
        const scene = {
            getViewports: () => [viewport],
            getEngine: () => ({ name: 'engine' }),
        };
        const { renderUnit, service, univer } = createRealSelectionRenderService({ scene });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        vi.spyOn(TestLayoutService.root, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 200 } as DOMRect);
        const activeRange = {
            isActive: () => true,
            getAnchor: () => ({ left: 12, top: 20, visible: true }),
            dispose: vi.fn(),
        };
        (service as unknown as { _rangeList: TextRange[] })._rangeList = [activeRange as never];

        service.sync();

        const container = document.getElementById('univer-doc-selection-container-selection-render-doc')!;
        expect(container.style.left).toBe('35px');
        expect(container.style.top).toBe('47px');
        expect(container.style.zIndex).toBe('1000');
    });

    it('converts the hidden editor position for a fixed containing block', () => {
        const { renderUnit, service, univer } = createRealSelectionRenderService();
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const container = document.getElementById('univer-doc-selection-container-selection-render-doc')!;
        vi.spyOn(container, 'offsetParent', 'get').mockReturnValue(TestLayoutService.root);
        vi.spyOn(TestLayoutService.root, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 200 } as DOMRect);

        service.activate(35, 47);

        expect(container.style.left).toBe('-65px');
        expect(container.style.top).toBe('-153px');
    });

    it('parks the active selection while scrolling and restores the editor when the selection remains in view', () => {
        getCanvasOffsetByEngineMock.mockReturnValue({ left: 1, top: 2 });
        const scrollAfter$ = new TestRenderEvent<{ viewport: unknown }>();
        const scrollEnd$ = new TestRenderEvent<{ viewport: unknown }>();
        const activeStatic = vi.fn();
        const deactivateStatic = vi.fn();
        const viewport = {
            onScrollAfter$: scrollAfter$,
            onScrollEnd$: scrollEnd$,
            getAbsoluteVector: () => ({ x: 4, y: 8 }),
            getBounding: () => ({
                viewBound: {
                    left: 0,
                    top: 0,
                    right: 100,
                    bottom: 100,
                },
            }),
        };
        const scene = {
            getViewports: () => [viewport],
            getEngine: () => ({ name: 'engine' }),
        };
        const { renderUnit, service, univer } = createRealSelectionRenderService({ scene });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const activeRange = {
            isActive: () => true,
            activeStatic,
            deactivateStatic,
            getAnchor: () => ({ left: 10, top: 12, visible: true }),
            dispose: vi.fn(),
        };
        (service as unknown as { _rangeList: TextRange[] })._rangeList = [activeRange as never];

        service.__attachScrollEvent();
        scrollAfter$.emit({ viewport });
        scrollEnd$.emit({ viewport });

        const container = document.getElementById('univer-doc-selection-container-selection-render-doc')!;
        expect(activeStatic).toHaveBeenCalledTimes(1);
        expect(deactivateStatic).not.toHaveBeenCalled();
        expect(container.style.left).toBe('5px');
        expect(container.style.top).toBe('10px');
    });

    it('commits a dragged text selection when the pointer is released', () => {
        vi.spyOn(TextRange.prototype as unknown as Record<'_anchorBlink', () => void>, '_anchorBlink').mockImplementation(() => {});
        vi.spyOn(TextRange.prototype, 'refresh').mockImplementation(() => {});
        const pointerMove$ = new TestRenderEvent<{ offsetX: number; offsetY: number }>();
        const pointerUp$ = new TestRenderEvent<Record<string, never>>();
        const disableObjectsEvent = vi.fn();
        const enableObjectsEvent = vi.fn();
        const clearSelectedObjects = vi.fn();
        const setCursor = vi.fn();
        const scene = {
            getViewports: () => [],
            getEngine: () => ({ name: 'engine' }),
            findViewportByPosToScene: () => ({
                top: 0,
                left: 0,
                width: 500,
                height: 500,
                scrollByViewportDeltaVal: () => true,
                transScroll2ViewportScrollValue: () => ({ x: 0, y: 0 }),
            }),
            disableObjectsEvent,
            enableObjectsEvent,
            getTransformer: () => ({ clearSelectedObjects }),
            setCursor,
            onPointerMove$: pointerMove$,
            onPointerUp$: pointerUp$,
        };
        const { renderUnit, service, univer } = createRealSelectionRenderService({ scene });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        const dragRange = {
            ...createTextRange({ isActive: vi.fn(() => true) }),
            startOffset: 2,
            endOffset: 6,
            collapsed: false,
            rangeType: DOC_RANGE_TYPE.TEXT,
            segmentId: '',
            segmentPage: -1,
            direction: 'forward',
            startNodePosition: null,
            endNodePosition: null,
        };
        const focusNodePosition = {
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 6,
            isBack: false,
        };
        (service as unknown as { _findNodeByCoord: () => unknown })._findNodeByCoord = () => ({
            node: { streamType: DataStreamTreeTokenType.LETTER },
            segmentId: '',
            segmentPage: -1,
        });
        (service as unknown as { _getNodePosition: () => unknown })._getNodePosition = () => ({
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 2,
            isBack: true,
        });
        (service as unknown as { _moving: () => void })._moving = () => {
            (service as unknown as { _focusNodePosition: unknown })._focusNodePosition = focusNodePosition;
            (service as unknown as { _rangeListCache: TextRange[] })._rangeListCache = [dragRange as never];
        };
        const selections: string[] = [];
        const subscription = service.textSelectionInner$.subscribe((selection) => {
            if (!selection) {
                return;
            }
            for (const range of selection.textRanges) {
                selections.push(`${range.startOffset}:${range.endOffset}`);
            }
        });
        cleanup.push(() => subscription.unsubscribe());

        service.__onPointDown({ offsetX: 10, offsetY: 10, button: 0 } as never);
        pointerMove$.emit({ offsetX: 20, offsetY: 20 });
        pointerUp$.emit({});

        expect(disableObjectsEvent).toHaveBeenCalledTimes(1);
        expect(enableObjectsEvent).toHaveBeenCalledTimes(1);
        expect(clearSelectedObjects).toHaveBeenCalledTimes(1);
        expect(setCursor).toHaveBeenCalledWith('text');
        expect(selections.at(-1)).toBe('2:6');
    });

    it('places the manual cursor from transformed document coordinates', () => {
        vi.spyOn(TextRange.prototype as unknown as Record<'_anchorBlink', () => void>, '_anchorBlink').mockImplementation(() => {});
        vi.spyOn(TextRange.prototype, 'refresh').mockImplementation(() => {});
        const transformedPoint = { x: 3, y: 4 };
        const findNodeByCoord = vi.fn(() => ({
            node: {
                glyphType: GlyphType.LIST,
                streamType: DataStreamTreeTokenType.LETTER,
            },
            ratioX: 0.8,
            segmentPage: 2,
        }));
        const findPositionByGlyph = vi.fn(() => ({
            page: 0,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 1,
            isBack: false,
        }));
        const viewport = {
            transformVector2SceneCoord: () => ({ x: 30, y: 40 }),
            getAbsoluteVector: () => ({ x: 5, y: 6 }),
        };
        const scene = {
            getViewports: () => [viewport],
            getEngine: () => ({ name: 'engine' }),
        };
        const documentTransform = {
            clone: () => ({
                invert: () => ({
                    applyPoint: () => transformedPoint,
                }),
            }),
        };
        const mainComponent = {
            getOffsetConfig: () => ({
                documentTransform,
                pageMarginLeft: 9,
                pageMarginTop: 11,
            }),
        };
        const { renderUnit, service, univer } = createRealSelectionRenderService({ mainComponent, scene });
        cleanup.push(() => renderUnit.dispose(), () => univer.dispose());
        TestDocSkeletonManagerService.skeleton = {
            findNodeByCoord,
            findPositionByGlyph,
        };
        (service as unknown as { _getAllTextRanges: () => unknown[] })._getAllTextRanges = () => [{
            startNodePosition: { glyph: 1, isBack: true },
            segmentId: 'header-1',
            segmentPage: 2,
        }];
        (service as unknown as { _getAllRectRanges: () => unknown[] })._getAllRectRanges = () => [];
        service.setSegment('header-1');
        service.setSegmentPage(2);

        service.setCursorManually(12, 18);

        expect(findNodeByCoord).toHaveBeenCalledWith(
            transformedPoint,
            0,
            9,
            11,
            {
                strict: true,
                segmentId: 'header-1',
                segmentPage: 2,
            }
        );
        expect(service.getAllTextRanges()[0]).toMatchObject({
            startNodePosition: expect.objectContaining({ glyph: 1, isBack: true }),
            segmentId: 'header-1',
            segmentPage: 2,
        });
    });
});
