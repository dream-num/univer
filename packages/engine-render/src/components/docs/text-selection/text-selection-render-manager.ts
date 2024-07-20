/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Nullable } from '@univerjs/core';
import { createIdentifier, DataStreamTreeTokenType, ILogService, RxDisposable } from '@univerjs/core';
import type { Observable, Subscription } from 'rxjs';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';

import { CURSOR_TYPE } from '../../../basics/const';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import { PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import type { IMouseEvent, IPointerEvent } from '../../../basics/i-events';
import type { INodeInfo, INodePosition } from '../../../basics/interfaces';
import { getOffsetRectForDom } from '../../../basics/position';
import type {
    ISuccinctTextRangeParam,
    ITextRangeWithStyle,
    ITextSelectionStyle,
    RANGE_DIRECTION,
} from '../../../basics/range';
import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '../../../basics/range';
import { Vector2 } from '../../../basics/vector2';
import type { Engine } from '../../../engine';
import type { Scene } from '../../../scene';
import { ScrollTimer } from '../../../scroll-timer';
import type { IScrollObserverParam, Viewport } from '../../../viewport';
import type { DocumentSkeleton, IFindNodeRestrictions } from '../layout/doc-skeleton';
import type { Documents } from '../document';
import { getSystemHighlightColor } from '../../../basics/tools';
import { cursorConvertToTextRange, TextRange } from './text-range';

export function getCanvasOffsetByEngine(engine: Nullable<Engine>) {
    const canvas = engine?.getCanvasElement();

    if (!canvas) {
        return {
            left: 0,
            top: 0,
        };
    }

    const { top, left } = getOffsetRectForDom(canvas);

    return {
        left,
        top,
    };
}

function getParagraphInfoByGlyph(node: IDocumentSkeletonGlyph) {
    const line = node.parent?.parent;
    const column = line?.parent;

    if (line == null || column == null) {
        return;
    }

    const { paragraphIndex } = line;
    const lines = column.lines.filter((line) => line.paragraphIndex === paragraphIndex);
    let nodeIndex = -1;
    let content = '';
    let hasFound = false;

    for (const line of lines) {
        for (const divide of line.divides) {
            for (const glyph of divide.glyphGroup) {
                if (!hasFound) {
                    nodeIndex += glyph.count;
                }
                if (glyph === node) {
                    hasFound = true;
                }

                content += glyph.count > 0 ? glyph.content : '';
            }
        }
    }

    return {
        st: lines[0].st,
        ed: paragraphIndex,
        content,
        nodeIndex,
    };
}

export interface ITextSelectionInnerParam {
    textRanges: TextRange[];
    segmentId: string;
    isEditing: boolean;
    style: ITextSelectionStyle;
    segmentPage: number;
    options?: { [key: string]: boolean };
}

export interface IActiveTextRange {
    startOffset: number;
    endOffset: number;
    collapsed: boolean;
    startNodePosition: Nullable<INodePosition>;
    endNodePosition: Nullable<INodePosition>;
    direction: RANGE_DIRECTION;
    segmentId: string;
    segmentPage: number;
    style: ITextSelectionStyle;
}

export interface ITextSelectionRenderManager {
    readonly onInputBefore$: Observable<Nullable<IEditorInputConfig>>;
    readonly onKeydown$: Observable<Nullable<IEditorInputConfig>>;
    readonly onInput$: Observable<Nullable<IEditorInputConfig>>;
    readonly onPointerDown$: Observable<void>;
    readonly onCompositionstart$: Observable<Nullable<IEditorInputConfig>>;
    readonly onCompositionupdate$: Observable<Nullable<IEditorInputConfig>>;
    readonly onCompositionend$: Observable<Nullable<IEditorInputConfig>>;
    readonly onSelectionStart$: Observable<Nullable<INodePosition>>;
    readonly onPaste$: Observable<Nullable<IEditorInputConfig>>;
    readonly onFocus$: Observable<Nullable<IEditorInputConfig>>;
    readonly onBlur$: Observable<Nullable<IEditorInputConfig>>;
    readonly textSelectionInner$: Observable<Nullable<ITextSelectionInnerParam>>;

    __getEditorContainer(): HTMLElement;
    getViewPort(): Viewport;
    enableSelection(): void;
    disableSelection(): void;
    setSegment(id: string): void;
    getSegment(): string;
    setSegmentPage(pageIndex: number): void;
    getSegmentPage(): number;
    setStyle(style: ITextSelectionStyle): void;
    resetStyle(): void;
    removeAllTextRanges(): void;

    addTextRanges(ranges: ISuccinctTextRangeParam[], isEditing?: boolean, options?: { [key: string]: boolean }): void;

    sync(): void;
    activate(x: number, y: number): void;
    deactivate(): void;
    hasFocus(): boolean;
    focus(): void;
    blur(): void;
    changeRuntime(docSkeleton: DocumentSkeleton, scene: Scene, document: Documents): void;
    dispose(): void;
    handleDblClick(evt: IPointerEvent | IMouseEvent): void;
    handleTripleClick(evt: IPointerEvent | IMouseEvent): void;
    eventTrigger(evt: IPointerEvent | IMouseEvent): void;
    setCursorManually(evtOffsetX: number, evtOffsetY: number): void;
}

export interface IEditorInputConfig {
    event: Event | CompositionEvent | KeyboardEvent;
    content?: string;
    activeRange?: Nullable<ITextRangeWithStyle>;
    rangeList?: TextRange[];
}

export class TextSelectionRenderManager extends RxDisposable implements ITextSelectionRenderManager {
    private readonly _onInputBefore$ = new Subject<Nullable<IEditorInputConfig>>();
    readonly onInputBefore$ = this._onInputBefore$.asObservable();

    private readonly _onKeydown$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onKeydown$ = this._onKeydown$.asObservable();

    private readonly _onInput$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onInput$ = this._onInput$.asObservable();

    private readonly _onCompositionstart$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onCompositionstart$ = this._onCompositionstart$.asObservable();

    private readonly _onCompositionupdate$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onCompositionupdate$ = this._onCompositionupdate$.asObservable();

    private readonly _onCompositionend$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onCompositionend$ = this._onCompositionend$.asObservable();

    private readonly _onSelectionStart$ = new BehaviorSubject<Nullable<INodePosition>>(null);
    readonly onSelectionStart$ = this._onSelectionStart$.asObservable();

    private readonly _onPaste$ = new Subject<Nullable<IEditorInputConfig>>();
    readonly onPaste$ = this._onPaste$.asObservable();

    private readonly _textSelectionInner$ = new BehaviorSubject<Nullable<ITextSelectionInnerParam>>(null);
    readonly textSelectionInner$ = this._textSelectionInner$.asObservable();

    private readonly _onFocus$ = new Subject<Nullable<IEditorInputConfig>>();
    readonly onFocus$ = this._onFocus$.asObservable();

    private readonly _onBlur$ = new Subject<Nullable<IEditorInputConfig>>();
    readonly onBlur$ = this._onBlur$.asObservable();

    private readonly _onPointerDown$ = new Subject<void>();
    readonly onPointerDown$ = this._onPointerDown$.asObservable();

    private _container!: HTMLDivElement;
    private _inputParent!: HTMLDivElement;
    private _input!: HTMLDivElement;
    private _scrollTimers: ScrollTimer[] = [];
    private _viewportScrollX: number = 0;
    private _viewportScrollY: number = 0;
    private _rangeList: TextRange[] = [];
    private _currentSegmentId: string = '';
    private _currentSegmentPage: number = -1;
    private _selectionStyle: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE;
    private _isSelectionEnabled: boolean = true;
    private _viewPortObserverMap = new Map<
        string,
        {
            scrollStop: Nullable<Subscription>;
            scrollBefore: Nullable<Subscription>;
        }
    >();

    private _isIMEInputApply = false;
    private _activeViewport!: Viewport;
    private _docSkeleton: Nullable<DocumentSkeleton>;
    private _scene: Nullable<Scene>;
    private _document: Nullable<Documents>;
    private _scenePointerMoveSubs: Array<Subscription> = [];
    private _scenePointerUpSubs: Array<Subscription> = [];

    constructor(@ILogService private readonly _logService: ILogService) {
        super();

        this._initDOM();

        this._setSystemHighlightColorToStyle();
    }

    __getEditorContainer(): HTMLElement {
        return this._container;
    }

    getViewPort() {
        return this._activeViewport;
    }

    setSegment(id: string) {
        this._currentSegmentId = id;
    }

    getSegment() {
        return this._currentSegmentId;
    }

    setSegmentPage(pageIndex: number) {
        this._currentSegmentPage = pageIndex;
    }

    getSegmentPage() {
        return this._currentSegmentPage;
    }

    setStyle(style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE) {
        this._selectionStyle = style;
    }

    resetStyle() {
        this.setStyle();
    }

    enableSelection() {
        this._isSelectionEnabled = true;
    }

    disableSelection() {
        this._isSelectionEnabled = false;
    }

    addTextRanges(ranges: ISuccinctTextRangeParam[], isEditing = true, options?: { [key: string]: boolean }) {
        const {
            _scene: scene, _docSkeleton: docSkeleton, _document: document,
            _currentSegmentId: segmentId, _currentSegmentPage: segmentPage,
            _selectionStyle: style,
        } = this;

        for (const range of ranges) {
            const textSelection = cursorConvertToTextRange(scene!, {
                style: this._selectionStyle,
                ...range,
                segmentId,
                segmentPage,
            }, docSkeleton!, document!);

            this._add(textSelection);
        }

        this._textSelectionInner$.next({
            textRanges: this._getAllTextRanges(),
            segmentId,
            segmentPage,
            style,
            isEditing,
            options,
        });

        this._updateInputPosition();
    }

    setCursorManually(evtOffsetX: number, evtOffsetY: number) {
        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY, {
            strict: true,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });

        const position = this._getNodePosition(startNode);

        if (position == null) {
            this._removeAllTextRanges();

            return;
        }

        if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
            position.isBack = true;
        }

        // TODO: @Jocs It's better to create a new textRange after remove all text ranges? because segment id will change.
        this._updateTextRangeAnchorPosition(position);

        this._activeSelectionRefresh();

        this._textSelectionInner$.next({
            textRanges: this._getAllTextRanges(),
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
            style: this._selectionStyle,
            isEditing: false,
        });
    }

    // Sync canvas selection to dom selection.
    sync() {
        this._updateInputPosition();
    }

    activate(x: number, y: number) {
        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;
        this._container.style.zIndex = '1000';

        this.focus();
    }

    hasFocus(): boolean {
        return document.activeElement === this._input;
    }

    focus(): void {
        this._input.focus();
    }

    blur() {
        this._input.blur();
    }

    // FIXME: for editor cell editor we don't need to blur the input element
    deactivate() {
        this._container.style.left = '0px';
        this._container.style.top = '0px';
    }

    changeRuntime(docSkeleton: DocumentSkeleton, scene: Scene, document: Documents) {
        // Need to empty text ranges when change doc.
        if (docSkeleton !== this._docSkeleton) {
            this.removeAllTextRanges();
        }

        this._docSkeleton = docSkeleton;

        this._scene = scene;

        this._activeViewport = scene.getViewports()[0];

        this._document = document;

        this._attachScrollEvent(this._activeViewport);
    }

    // Handler double click.
    handleDblClick(evt: IPointerEvent | IMouseEvent) {
        if (!this._scene || !this._isSelectionEnabled) {
            return;
        }

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY, {
            strict: false,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });
        if (startNode == null || startNode.node == null) {
            return;
        }

        const paragraphInfo = getParagraphInfoByGlyph(startNode.node);
        if (paragraphInfo == null) {
            return;
        }

        const { content, st, nodeIndex } = paragraphInfo;
        if (nodeIndex === -1) {
            return;
        }

        // Firefox do not support Segmenter in an old version, so you need a Segmenter polyfill if you want use it in Firefox.
        if (Intl.Segmenter == null) {
            return;
        }

        // Create a locale-specific word segmenter
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
        const segments = segmenter.segment(content);

        let startOffset = Number.NEGATIVE_INFINITY;
        let endOffset = Number.NEGATIVE_INFINITY;

        // Use that for segmentation
        for (const { segment, index, isWordLike } of segments) {
            if (index <= nodeIndex && nodeIndex < index + segment.length && isWordLike) {
                startOffset = index + st;
                endOffset = index + st + segment.length;

                break;
            }
        }

        if (Number.isFinite(startOffset) && Number.isFinite(endOffset)) {
            this.removeAllTextRanges();

            const textRanges = [
                {
                    startOffset,
                    endOffset,
                },
            ];

            this.addTextRanges(textRanges, false);
        }
    }

    handleTripleClick(evt: IPointerEvent | IMouseEvent) {
        if (!this._scene || !this._isSelectionEnabled) {
            return;
        }

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY, {
            strict: false,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });
        if (startNode == null || startNode.node == null) {
            return;
        }

        const paragraphInfo = getParagraphInfoByGlyph(startNode.node);
        if (paragraphInfo == null) {
            return;
        }

        this.removeAllTextRanges();

        const { st, ed } = paragraphInfo;

        const textRanges: ITextRangeWithStyle[] = [
            {
                startOffset: st,
                endOffset: ed,
                collapsed: st === ed,
            },
        ];

        this.addTextRanges(textRanges, false);
    }

    // Handle pointer down.
    eventTrigger(evt: IPointerEvent | IMouseEvent) {
        if (!this._scene || !this._isSelectionEnabled) {
            return;
        }

        const scene = this._scene;

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY, {
            strict: false,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });

        const position = this._getNodePosition(startNode);
        const textSelection = this._textSelectionInner$.value;
        if (startNode && evt.button === 2 && textSelection) {
            const index = this._getNodeIndex(startNode);
            if (textSelection.textRanges.some((textRange) => textRange.startOffset! <= index && textRange.endOffset! > index)) {
                return;
            }
        }

        if (position == null || startNode == null) {
            this._removeAllTextRanges();

            return;
        }
        const { segmentId, segmentPage } = startNode;

        if (segmentId && this._currentSegmentId && segmentId !== this._currentSegmentId) {
            this.setSegment(segmentId);
        }

        if (segmentId && segmentPage !== this._currentSegmentPage) {
            this.setSegmentPage(segmentPage);
        }

        if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
            position.isBack = true;
        }

        if (evt.shiftKey && this._getActiveRangeInstance()) {
            this._updateActiveRangeFocusPosition(position);
        } else if (evt.ctrlKey || this._isEmpty()) {
            const newTextSelection = new TextRange(scene, this._document!, this._docSkeleton!, position, undefined, this._selectionStyle);

            this._addTextRange(newTextSelection);
        } else {
            this._updateTextRangeAnchorPosition(position);
        }

        this._activeSelectionRefresh();

        scene.disableEvent();

        const scrollTimer = ScrollTimer.create(scene);
        this._scrollTimers.push(scrollTimer);
        scrollTimer.startScroll(evtOffsetX, evtOffsetY);

        this._onSelectionStart$.next(this._getActiveRangeInstance()?.startNodePosition);

        scene.getTransformer()?.clearSelectedObjects();

        let preMoveOffsetX = evtOffsetX;

        let preMoveOffsetY = evtOffsetY;

        this._scenePointerMoveSubs.push(scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
            scene.setCursor(CURSOR_TYPE.TEXT);

            if (Math.sqrt((moveOffsetX - preMoveOffsetX) ** 2 + (moveOffsetY - preMoveOffsetY) ** 2) < 3) {
                return;
            }

            this._moving(moveOffsetX, moveOffsetY);

            // scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
            // this._moving(moveOffsetX, moveOffsetY);
            // });

            preMoveOffsetX = moveOffsetX;
            preMoveOffsetY = moveOffsetY;
        }));

        this._scenePointerUpSubs.push(scene.onPointerUp$.subscribeEvent(() => {
            // scene.onPointerMoveObserver.remove(this._moveObserver);
            // scene.onPointerUpObserver.remove(this._upObserver);
            [...this._scenePointerMoveSubs, ...this._scenePointerUpSubs].forEach((e) => {
                e.unsubscribe();
            });

            scene.enableEvent();

            const selectionInfo = {
                textRanges: this._getAllTextRanges(),
                segmentId: this._currentSegmentId,
                segmentPage: this._currentSegmentPage,
                style: this._selectionStyle,
                isEditing: false,
            };

            this._textSelectionInner$.next(selectionInfo);

            this._scrollTimers.forEach((timer) => {
                timer?.dispose();
            });

            this._scrollTimers = [];

            this._updateInputPosition();
        }));
    }

    removeAllTextRanges() {
        this._removeAllTextRanges();
        this.deactivate();
    }

    private _setSystemHighlightColorToStyle() {
        const { r, g, b, a } = getSystemHighlightColor();

        // Only set selection use highlight color.
        const style: ITextSelectionStyle = {
            strokeWidth: 1.5,
            stroke: 'rgba(0, 0, 0, 0)',
            strokeActive: 'rgba(0, 0, 0, 1)',
            fill: `rgba(${r}, ${g}, ${b}, ${a ?? 0.3})`,
        };

        this.setStyle(style);
    }

    private _getAllTextRanges() {
        return this._rangeList;
    }

    private _getActiveRange(): Nullable<IActiveTextRange> {
        const activeRange = this._rangeList.find((range) => range.isActive());

        if (activeRange == null) {
            return null;
        }

        const { startOffset, endOffset, collapsed, startNodePosition, endNodePosition, direction } = activeRange;

        if (startOffset == null || endOffset == null) {
            return null;
        }

        return {
            startOffset,
            endOffset,
            collapsed,
            startNodePosition,
            endNodePosition,
            direction,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
            style: this._selectionStyle,
        };
    }

    private _add(textRange: Nullable<TextRange>) {
        if (textRange == null) {
            return;
        }

        this._addTextRange(textRange);

        // FIXME: @JOCS, why I need to refresh textRange? it already refreshed when create.
        textRange.refresh();
    }

    private _getActiveRangeInstance() {
        return this._rangeList.find((range) => range.isActive());
    }

    override dispose() {
        super.dispose();

        this._detachEvent();
        this._removeAllTextRanges();
        this._container.remove();
    }

    private _initDOM() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0px';
        container.style.top = '0px';

        const inputParent = document.createElement('div');
        const inputDom = document.createElement('div');

        inputParent.appendChild(inputDom);
        container.appendChild(inputParent);

        this._container = container;
        this._inputParent = inputParent;
        this._input = inputDom;

        this._initInput();
        this._initInputEvents();

        document.body.appendChild(container);
    }

    private _initInput() {
        this._inputParent.style.cssText = `
            position:absolute;
            height:1px;
            width:1px;
            overflow: hidden;
        `;

        this._input.contentEditable = 'true';

        this._input.classList.add('univer-editor');
        this._input.style.cssText = `
            position: absolute;
            overflow: hidden;
            opacity: 1;
            background: #000;
            color: transparent;
            outline: none;
            z-index: -2;
            caret-color: transparent;
            white-space: pre-wrap;
            user-select: text;
        `;
    }

    private _getNodePosition(node: Nullable<INodeInfo>) {
        if (node == null) {
            return;
        }

        const { node: glyph, ratioX, segmentPage } = node;

        const position = this._docSkeleton?.findPositionByGlyph(glyph, segmentPage);

        if (position == null) {
            return;
        }

        const HALF = 0.5;
        const isBack = ratioX < HALF;

        return {
            ...position,
            isBack,
        };
    }

    private _interactTextRange(textRange: TextRange) {
        const newTextSelection: TextRange[] = [];
        let hasIntersection = false;

        this._rangeList.forEach((range) => {
            if (range === textRange) {
                return true;
            }

            if (!textRange.isIntersection(range)) {
                newTextSelection.push(range);
            } else {
                hasIntersection = true;
                range.dispose();
            }
        });

        if (!hasIntersection) {
            return;
        }

        newTextSelection.push(textRange);

        this._rangeList = newTextSelection;
    }

    private _removeAllTextRanges() {
        this._rangeList.forEach((range) => {
            range.dispose();
        });

        this._rangeList = [];
    }

    private _deactivateAllTextRanges() {
        this._rangeList.forEach((range) => {
            range.deactivate();
        });
    }

    private _addTextRange(textRange: TextRange) {
        this._deactivateAllTextRanges();
        textRange.activate();

        this._rangeList.push(textRange);
    }

    private _updateTextRangeAnchorPosition(position: INodePosition) {
        if (!this._scene) {
            return;
        }

        let lastRange = this._rangeList.pop();

        if (!lastRange) {
            lastRange = new TextRange(this._scene, this._document!, this._docSkeleton!, position, undefined, this._selectionStyle);
        }

        this._removeAllTextRanges();
        lastRange.activate();
        lastRange.anchorNodePosition = position;
        lastRange.focusNodePosition = null;
        this._rangeList = [lastRange];
    }

    private _updateActiveRangeFocusPosition(position: INodePosition) {
        if (!this._scene) {
            this._logService.error('[TextSelectionRenderManager] _updateActiveRangeFocusPosition: scene is null');

            return;
        }

        const activeTextRange = this._getActiveRangeInstance();

        if (activeTextRange == null || activeTextRange.anchorNodePosition == null) {
            this._logService.error(
                '[TextSelectionRenderManager] _updateActiveRangeFocusPosition: active range has no anchor'
            );

            return;
        }

        this._removeAllTextRanges();
        activeTextRange.activate();
        activeTextRange.focusNodePosition = position;

        this.deactivate();
        this._rangeList = [activeTextRange];
    }

    private _isEmpty() {
        return this._rangeList.length === 0;
    }

    private _getCanvasOffset() {
        // This is quiet ambiguous, when did the engine's canvas offset changes?
        const engine = this._scene?.getEngine() as Engine;
        return getCanvasOffsetByEngine(engine);
    }

    private _updateInputPosition() {
        const activeRangeInstance = this._getActiveRangeInstance();
        const anchor = activeRangeInstance?.getAnchor();

        if (!anchor || (anchor && !anchor.visible) || this._activeViewport == null) {
            this.focus();
            return;
        }

        const { left, top } = anchor;

        const absoluteCoord = this._activeViewport.getAbsoluteVector(Vector2.FromArray([left, top]));

        const { x, y } = absoluteCoord;

        let { left: canvasLeft, top: canvasTop } = this._getCanvasOffset();

        canvasLeft += x;

        canvasTop += y;

        this.activate(canvasLeft, canvasTop);
    }

    private _moving(moveOffsetX: number, moveOffsetY: number) {
        if (this._docSkeleton == null) {
            return;
        }

        const endNode = this._findNodeByCoord(moveOffsetX, moveOffsetY, {
            strict: true,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });

        const focusNodePosition = this._getNodePosition(endNode);

        if (!focusNodePosition) {
            return;
        }

        const activeRangeInstance = this._getActiveRangeInstance();

        if (!activeRangeInstance) {
            return;
        }

        activeRangeInstance.focusNodePosition = focusNodePosition;

        activeRangeInstance.refresh();

        this.deactivate();

        this._interactTextRange(activeRangeInstance);

        this._scene?.getEngine()?.setRemainCapture();
    }

    private _attachScrollEvent(viewport: Nullable<Viewport>) {
        if (viewport == null || this._docSkeleton == null) {
            return;
        }
        const unitId = this._docSkeleton.getViewModel().getDataModel().getUnitId();
        const key = `${unitId}_${viewport.viewportKey}`;

        if (this._viewPortObserverMap.has(key)) {
            return;
        }

        const scrollBefore = viewport.onScrollBefore$.subscribeEvent((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const activeRangeInstance = this._getActiveRangeInstance();

            activeRangeInstance?.activeStatic();
        });

        const scrollStop = viewport.onScrollStop$.subscribeEvent((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const bounds = viewport.getBounding();

            const activeRangeInstance = this._getActiveRangeInstance();

            const anchor = activeRangeInstance?.getAnchor();

            if (!anchor || (anchor && !anchor.visible)) {
                return;
            }

            if (bounds) {
                const { left, top, right, bottom } = bounds.viewBound;

                if (anchor.left < left || anchor.left > right || anchor.top < top || anchor.top > bottom) {
                    activeRangeInstance?.deactivateStatic();
                    return;
                }
            }

            this._updateInputPosition();
        });

        this._viewPortObserverMap.set(key, {
            scrollBefore,
            scrollStop,
        });
    }

    // FIXME: listeners here are not correctly disposed
    private _initInputEvents() {
        this.disposeWithMe(
            fromEvent(this._input, 'keydown').subscribe((e) => {
                if (this._isIMEInputApply) {
                    return;
                }

                this._eventHandle(e, (config) => {
                    this._onKeydown$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'input').subscribe((e) => {
                if (this._isIMEInputApply) {
                    return;
                }

                this._eventHandle(e, (config) => {
                    this._onInputBefore$.next(config);
                    this._onInput$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'compositionstart').subscribe((e) => {
                this._isIMEInputApply = true;

                this._eventHandle(e, (config) => {
                    this._onCompositionstart$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'compositionend').subscribe((e) => {
                this._isIMEInputApply = false;

                this._eventHandle(e, (config) => {
                    this._onCompositionend$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'compositionupdate').subscribe((e) => {
                this._eventHandle(e, (config) => {
                    this._onInputBefore$.next(config);
                    this._onCompositionupdate$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'paste').subscribe((e) => {
                this._eventHandle(e, (config) => {
                    this._onPaste$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'focus').subscribe((e) => {
                this._eventHandle(e, (config) => {
                    this._onFocus$.next(config);
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'pointerdown').subscribe((e) => {
                this._eventHandle(e, () => {
                    this._onBlur$.next();
                });
            })
        );

        this.disposeWithMe(
            fromEvent(this._input, 'blur').subscribe((e) => {
                this._eventHandle(e, (config) => {
                    this._onBlur$.next(config);
                });
            })
        );
    }

    private _eventHandle(e: Event | CompositionEvent | KeyboardEvent, func: (config: IEditorInputConfig) => void) {
        const content = this._input.textContent || '';

        this._input.innerHTML = '';

        const activeRange = this._getActiveRange();
        const rangeList = this._getAllTextRanges();

        func({
            event: e,
            content,
            activeRange,
            rangeList,
        });
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const { documentTransform } = this._document!.getOffsetConfig();
        if (this._activeViewport == null || documentTransform == null) {
            return;
        }

        const originCoord = this._activeViewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        if (!originCoord) {
            return;
        }

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _findNodeByCoord(evtOffsetX: number, evtOffsetY: number, restrictions: IFindNodeRestrictions) {
        const coord = this._getTransformCoordForDocumentOffset(evtOffsetX, evtOffsetY);

        if (coord == null) {
            return;
        }

        const {
            pageLayoutType = PageLayoutType.VERTICAL,
            pageMarginLeft,
            pageMarginTop,
        } = this._document!.getOffsetConfig();

        const nodeInfo = this._docSkeleton?.findNodeByCoord(
            coord, pageLayoutType, pageMarginLeft, pageMarginTop, restrictions
        );

        return nodeInfo;
    }

    private _getNodeIndex(node: INodeInfo) {
        const index = node.node.parent!.st + node.node.parent!.glyphGroup.indexOf(node.node);
        return index;
    }

    private _detachEvent() {
        this._onInputBefore$.complete();
        this._onKeydown$.complete();
        this._onInput$.complete();
        this._onCompositionstart$.complete();
        this._onCompositionupdate$.complete();
        this._onCompositionend$.complete();
        this._onSelectionStart$.complete();
    }

    private _activeSelectionRefresh() {
        if (this._docSkeleton == null) {
            return;
        }
        const activeRangeInstance = this._getActiveRangeInstance();

        activeRangeInstance?.refresh();
    }
}

export const ITextSelectionRenderManager = createIdentifier<TextSelectionRenderManager>(
    'univer.doc.text-selection-render-manager'
);
