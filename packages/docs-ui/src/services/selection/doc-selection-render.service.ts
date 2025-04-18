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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type { Documents, Engine, IDocSelectionInnerParam, IFindNodeRestrictions, IMouseEvent, INodeInfo, INodePosition, IPointerEvent, IRenderContext, IRenderModule, IScrollObserverParam, ISuccinctDocRangeParam, ITextRangeWithStyle, ITextSelectionStyle } from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';
import type { RectRange } from './rect-range';
import { DataStreamTreeTokenType, DOC_RANGE_TYPE, ILogService, Inject, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { CURSOR_TYPE, getSystemHighlightColor, GlyphType, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, PageLayoutType, ScrollTimer, Vector2 } from '@univerjs/engine-render';
import { ILayoutService, KeyCode } from '@univerjs/ui';
import { BehaviorSubject, filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { getCanvasOffsetByEngine, getParagraphInfoByGlyph, getRangeListFromCharIndex, getRangeListFromSelection, getRectRangeFromCharIndex, getTextRangeFromCharIndex, serializeRectRange, serializeTextRange } from './selection-utils';
import { TextRange } from './text-range';

export interface IEditorInputConfig {
    event: Event | CompositionEvent | KeyboardEvent;
    content?: string;
    activeRange?: Nullable<ITextRangeWithStyle>;
    rangeList?: ITextRangeWithStyle[];
}

export class DocSelectionRenderService extends RxDisposable implements IRenderModule {
    private readonly _onInputBefore$ = new Subject<Nullable<IEditorInputConfig>>();
    readonly onInputBefore$ = this._onInputBefore$.asObservable();

    private readonly _onKeydown$ = new Subject<IEditorInputConfig>();
    readonly onKeydown$ = this._onKeydown$.asObservable();

    private readonly _onInput$ = new Subject<IEditorInputConfig>();
    readonly onInput$ = this._onInput$.asObservable();

    private readonly _onCompositionstart$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onCompositionstart$ = this._onCompositionstart$.asObservable();

    private readonly _onCompositionupdate$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onCompositionupdate$ = this._onCompositionupdate$.asObservable();

    private readonly _onCompositionend$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);
    readonly onCompositionend$ = this._onCompositionend$.asObservable();

    private readonly _onSelectionStart$ = new BehaviorSubject<Nullable<INodePosition>>(null);
    readonly onSelectionStart$ = this._onSelectionStart$.asObservable();

    readonly onChangeByEvent$ = merge(
        this._onInput$,
        this._onKeydown$.pipe(filter((e) => (e.event as KeyboardEvent).keyCode === KeyCode.BACKSPACE)),
        this._onCompositionend$
    );

    private readonly _onPaste$ = new Subject<IEditorInputConfig>();
    readonly onPaste$ = this._onPaste$.asObservable();

    private readonly _textSelectionInner$ = new BehaviorSubject<Nullable<IDocSelectionInnerParam>>(null);
    readonly textSelectionInner$ = this._textSelectionInner$.asObservable();

    private readonly _onFocus$ = new Subject<IEditorInputConfig>();
    readonly onFocus$ = this._onFocus$.asObservable();

    private readonly _onBlur$ = new Subject<IEditorInputConfig>();
    readonly onBlur$ = this._onBlur$.asObservable();

    private readonly _onPointerDown$ = new Subject<void>();
    readonly onPointerDown$ = this._onPointerDown$.asObservable();

    private _container!: HTMLDivElement;
    private _inputParent!: HTMLDivElement;
    private _input!: HTMLDivElement;
    private _scrollTimers: ScrollTimer[] = [];
    private _rangeList: TextRange[] = [];
    // Use to cache range list in moving.
    private _rangeListCache: TextRange[] = [];
    // Rect range list.
    private _rectRangeList: RectRange[] = [];
    // Use to cache rect range list in moving.
    private _rectRangeListCache: RectRange[] = [];
    private _anchorNodePosition: Nullable<INodePosition> = null;
    private _focusNodePosition: Nullable<INodePosition> = null;

    private _currentSegmentId: string = '';
    private _currentSegmentPage: number = -1;
    private _selectionStyle: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE;
    private _onPointerEvent = false;

    private _viewPortObserverMap = new Map<
        string,
        {
            scrollStop: Nullable<Subscription>;
            scrollBefore: Nullable<Subscription>;
        }
    >();

    private _isIMEInputApply = false;
    private _scenePointerMoveSubs: Array<Subscription> = [];
    private _scenePointerUpSubs: Array<Subscription> = [];
    // When the user switches editors, whether to clear the doc ranges.
    private _reserveRanges = false;

    get isOnPointerEvent() {
        return this._onPointerEvent;
    }

    get isFocusing() {
        return this._input === document.activeElement;
    }

    get canFocusing() {
        return this.isFocusing || document.activeElement === document.body || document.activeElement === null;
    }

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @ILogService private readonly _logService: ILogService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService
    ) {
        super();
        this._initDOM();
        this._registerContainer();
        this._setSystemHighlightColorToStyle();
        this._listenCurrentUnitChange();
    }

    private _listenCurrentUnitChange() {
        this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((documentModel) => {
                if (documentModel == null) {
                    return;
                }

                const unitId = documentModel.getUnitId();

                if (unitId !== this._context.unitId && !this._reserveRanges) {
                    this.removeAllRanges();
                }
            });
    }

    get activeViewPort() {
        return this._context.scene.getViewports()[0];
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

    setReserveRangesStatus(status: boolean) {
        this._reserveRanges = status;
    }

    private _setRangeStyle(style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE) {
        this._selectionStyle = style;
    }

    // eslint-disable-next-line max-lines-per-function
    addDocRanges(ranges: ISuccinctDocRangeParam[], isEditing = true, options?: { [key: string]: boolean }) {
        const {
            _currentSegmentId: segmentId,
            _currentSegmentPage: segmentPage,
            _selectionStyle: style,
        } = this;
        const { scene, mainComponent } = this._context;
        const document = mainComponent as Documents;
        const docSkeleton = this._docSkeletonManagerService.getSkeleton();

        const generalAddRange = (startOffset: number, endOffset: number) => {
            const rangeList = getRangeListFromCharIndex(
                startOffset,
                endOffset,
                scene,
                document,
                docSkeleton,
                style,
                segmentId,
                segmentPage
            );

            if (rangeList == null) {
                return;
            }

            const { textRanges, rectRanges } = rangeList;

            for (const textRange of textRanges) {
                this._addTextRange(textRange);
            }

            this._addRectRanges(rectRanges);
        };

        for (const range of ranges) {
            const { startOffset, endOffset, rangeType, startNodePosition, endNodePosition } = range as ITextRangeWithStyle;

            if (rangeType === DOC_RANGE_TYPE.RECT) {
                const rectRange = getRectRangeFromCharIndex(
                    startOffset,
                    endOffset,
                    scene,
                    document,
                    docSkeleton,
                    style,
                    segmentId,
                    segmentPage
                );

                if (rectRange) {
                    this._addRectRanges([rectRange]);
                }
            } else if (rangeType === DOC_RANGE_TYPE.TEXT) {
                // TODO: Remove try catch when text range in cell support across pages.
                try {
                    let textRange: Nullable<TextRange> = null;

                    if (startNodePosition && endNodePosition) {
                        textRange = getTextRangeFromCharIndex(
                            startNodePosition.isBack ? startOffset : startOffset - 1,
                            endNodePosition.isBack ? endOffset : endOffset - 1,
                            scene,
                            document,
                            docSkeleton,
                            style,
                            segmentId,
                            segmentPage,
                            startNodePosition.isBack,
                            endNodePosition.isBack
                        );
                    } else {
                        textRange = getTextRangeFromCharIndex(
                            startOffset,
                            endOffset,
                            scene,
                            document,
                            docSkeleton,
                            style,
                            segmentId,
                            segmentPage
                        );
                    }

                    if (textRange) {
                        this._addTextRange(textRange);
                    }
                    // eslint-disable-next-line unused-imports/no-unused-vars
                } catch (_e) {
                    generalAddRange(startOffset, endOffset);
                }
            } else {
                generalAddRange(startOffset, endOffset);
            }
        }

        this._textSelectionInner$.next({
            textRanges: this._getAllTextRanges(),
            rectRanges: this._getAllRectRanges(),
            segmentId,
            segmentPage,
            style,
            isEditing,
            options,
        });

        if (!ranges.length || options?.shouldFocus === false) return;
        this._updateInputPosition(options?.forceFocus);
    }

    setCursorManually(evtOffsetX: number, evtOffsetY: number) {
        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY, {
            strict: true,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });

        const position = this._getNodePosition(startNode);

        if (position == null) {
            this._removeAllRanges();

            return;
        }

        if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
            position.isBack = true;
        }

        this._createTextRangeByAnchorPosition(position);

        this._textSelectionInner$.next({
            textRanges: this._getAllTextRanges(),
            rectRanges: this._getAllRectRanges(),
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

    /**
     * @deprecated
     */
    activate(x: number, y: number, force = false) {
        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;
        this._container.style.zIndex = '1000';

        if (this.canFocusing || force) {
            this.focus();
        }
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
    /**
     * @deprecated
     */
    deactivate() {
        this._container.style.left = '0px';
        this._container.style.top = '0px';
    }

    // Handler double click.
    __handleDblClick(evt: IPointerEvent | IMouseEvent) {
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
            this.removeAllRanges();

            const textRanges = [
                {
                    startOffset,
                    endOffset,
                },
            ];

            this.addDocRanges(textRanges, false, { forceFocus: true });
        }
    }

    __handleTripleClick(evt: IPointerEvent | IMouseEvent) {
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

        this.removeAllRanges();

        const { st, ed } = paragraphInfo;

        const textRanges: ISuccinctDocRangeParam[] = [
            {
                startOffset: st,
                endOffset: ed,
            },
        ];

        this.addDocRanges(textRanges, false, { forceFocus: true });
    }

    // Handle pointer down.
    // eslint-disable-next-line max-lines-per-function, complexity
    __onPointDown(evt: IPointerEvent | IMouseEvent) {
        const { scene, mainComponent } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY, {
            strict: false,
            segmentId: this._currentSegmentId,
            segmentPage: this._currentSegmentPage,
        });

        const position = this._getNodePosition(startNode);

        if (position == null || startNode == null) {
            this._removeAllRanges();

            return;
        }

        if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
            position.isBack = true;
        }

        const docSelection = this._textSelectionInner$.value;
        if (startNode && evt.button === 2 && docSelection) {
            const nodeCharIndex = skeleton.findCharIndexByPosition(position);
            if (typeof nodeCharIndex === 'number' && docSelection.textRanges.some((textRange) => textRange.startOffset! <= nodeCharIndex && textRange.endOffset! > nodeCharIndex)) {
                return;
            }

            if (typeof nodeCharIndex === 'number' && docSelection.rectRanges.some((rectRange) => rectRange.startOffset! <= nodeCharIndex && rectRange.endOffset! >= nodeCharIndex)) {
                return;
            }
        }

        const { segmentId, segmentPage } = startNode;

        if (segmentId && this._currentSegmentId && segmentId !== this._currentSegmentId) {
            this.setSegment(segmentId);
        }

        if (segmentId && segmentPage !== this._currentSegmentPage) {
            this.setSegmentPage(segmentPage);
        }

        this._anchorNodePosition = position;

        if (evt.shiftKey && this._getActiveRangeInstance()) {
            this._updateActiveRangePosition(position);
        } else if (evt.ctrlKey) {
            this._removeAllCollapsedTextRanges();
        } else if (!this._isEmpty()) {
            this._removeAllRanges();
        }

        scene.disableObjectsEvent();

        const scrollTimer = ScrollTimer.create(scene);
        this._scrollTimers.push(scrollTimer);
        scrollTimer.startScroll(evtOffsetX, evtOffsetY);

        this._onSelectionStart$.next(this._getActiveRangeInstance()?.startNodePosition);

        scene.getTransformer()?.clearSelectedObjects();

        let preMoveOffsetX = evtOffsetX;

        let preMoveOffsetY = evtOffsetY;
        this._onPointerEvent = true;
        this._scenePointerMoveSubs.push(scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
            scene.setCursor(CURSOR_TYPE.TEXT);

            if (Math.sqrt((moveOffsetX - preMoveOffsetX) ** 2 + (moveOffsetY - preMoveOffsetY) ** 2) < 3) {
                return;
            }

            this._moving(moveOffsetX, moveOffsetY);

            scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                this._moving(moveOffsetX, moveOffsetY);
            });

            preMoveOffsetX = moveOffsetX;
            preMoveOffsetY = moveOffsetY;
        }));

        this._scenePointerUpSubs.push(scene.onPointerUp$.subscribeEvent(() => {
            [...this._scenePointerMoveSubs, ...this._scenePointerUpSubs].forEach((e) => {
                e.unsubscribe();
            });
            this._onPointerEvent = false;
            scene.enableObjectsEvent();

            // Add cursor.
            if (this._anchorNodePosition && !this._focusNodePosition) {
                if (evt.ctrlKey) {
                    // No need to add cursor when select multi text ranges by CTRL key.
                    this._disposeScrollTimers();
                    return;
                }

                const textRange = new TextRange(scene, mainComponent as Documents, skeleton, this._anchorNodePosition, undefined, this._selectionStyle, this._currentSegmentId, this._currentSegmentPage);
                this._addTextRange(textRange);
            } else if (this._anchorNodePosition && this._focusNodePosition) {
                for (const textRange of this._rangeListCache) {
                    if (evt.ctrlKey) {
                        if (textRange.collapsed) {
                            textRange.dispose();
                        } else {
                            this._addTextRange(textRange);
                        }
                    } else {
                        this._addTextRange(textRange);
                    }
                }

                this._addRectRanges(this._rectRangeListCache);

                this._rangeListCache = [];
                this._rectRangeListCache = [];
            }

            this._anchorNodePosition = null;
            this._focusNodePosition = null;

            const selectionInfo = {
                textRanges: this._getAllTextRanges(),
                rectRanges: this._getAllRectRanges(),
                segmentId: this._currentSegmentId,
                segmentPage: this._currentSegmentPage,
                style: this._selectionStyle,
                isEditing: false,
            };

            this._textSelectionInner$.next(selectionInfo);

            this._disposeScrollTimers();

            this._updateInputPosition(true);
        }));
    }

    removeAllRanges() {
        this._removeAllRanges();
        this.deactivate();
    }

    getActiveTextRange() {
        return this._getActiveRangeInstance();
    }

    private _disposeScrollTimers() {
        this._scrollTimers.forEach((timer) => {
            timer?.dispose();
        });

        this._scrollTimers = [];
    }

    private _setSystemHighlightColorToStyle() {
        const { r, g, b, a } = getSystemHighlightColor();

        // Only set selection use highlight color.
        const style: ITextSelectionStyle = {
            strokeWidth: 1,
            stroke: 'rgba(0, 0, 0, 0)',
            strokeActive: 'rgba(0, 0, 0, 1)',
            fill: `rgba(${r}, ${g}, ${b}, ${a ?? 0.3})`,
        };

        this._setRangeStyle(style);
    }

    private _getAllTextRanges() {
        return this._rangeList.map(serializeTextRange);
    }

    private _getAllRectRanges() {
        return this._rectRangeList.map(serializeRectRange);
    }

    getAllTextRanges() {
        return this._getAllTextRanges();
    }

    getAllRectRanges() {
        return this._getAllRectRanges();
    }

    private _getActiveRange(): Nullable<ITextRangeWithStyle> {
        const activeRange = this._rangeList.find((range) => range.isActive());

        if (activeRange == null) {
            return null;
        }

        const { startOffset, endOffset } = activeRange;

        if (startOffset == null || endOffset == null) {
            return null;
        }

        return serializeTextRange(activeRange);
    }

    private _getActiveRangeInstance() {
        return this._rangeList.find((range) => range.isActive());
    }

    override dispose() {
        super.dispose();
        this._detachEvent();
        this._removeAllRanges();
        this._container.remove();
    }

    private _initDOM() {
        const { unitId } = this._context;
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0px';
        container.style.top = '0px';

        container.id = `univer-doc-selection-container-${unitId}`;

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

    private _registerContainer() {
        this.disposeWithMe(
            // the content editable div should be regarded as part of the applications container
            this._layoutService.registerContainerElement(this._container)
        );
    }

    private _initInput() {
        this._inputParent.style.cssText = `
            position:absolute;
            height:1px;
            width:1px;
            overflow: hidden;
        `;

        this._input.contentEditable = 'true';

        // TODO: to be removed
        this._input.dataset.uComp = 'editor';
        this._input.id = `__editor_${this._context.unitId}`;
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

    private _getNodePosition(node: Nullable<INodeInfo>): Nullable<INodePosition> {
        if (node == null) {
            return;
        }

        const { node: glyph, ratioX, segmentPage } = node;

        const skeleton = this._docSkeletonManagerService.getSkeleton();
        const position = skeleton.findPositionByGlyph(glyph, segmentPage);

        if (position == null) {
            return;
        }

        const HALF = 0.5;
        let isBack = ratioX < HALF;

        if (glyph.glyphType === GlyphType.LIST) {
            isBack = true;
        }

        return {
            ...position,
            isBack,
        };
    }

    private _interactTextRanges(textRanges: TextRange[]) {
        const newTextRanges: TextRange[] = [];

        for (const range of this._rangeList) {
            if (textRanges.some((textRange) => textRange.isIntersection(range))) {
                range.dispose();
                continue;
            }

            newTextRanges.push(range);
        }

        this._rangeList = newTextRanges;
    }

    private _interactRectRanges(rectRanges: RectRange[]) {
        const newRanges: RectRange[] = [];

        for (const range of this._rectRangeList) {
            if (rectRanges.some((rectRange) => rectRange.isIntersection(range))) {
                range.dispose();
                continue;
            }

            newRanges.push(range);
        }

        this._rectRangeList = newRanges;
    }

    private _removeAllRanges() {
        this._removeAllTextRanges();
        this._removeAllRectRanges();
    }

    private _removeAllCacheRanges() {
        this._rangeListCache.forEach((range) => {
            range.dispose();
        });

        this._rectRangeListCache.forEach((range) => {
            range.dispose();
        });

        this._rangeListCache = [];
        this._rectRangeListCache = [];
    }

    private _removeAllTextRanges() {
        this._rangeList.forEach((range) => {
            range.dispose();
        });

        this._rangeList = [];
    }

    private _removeAllRectRanges() {
        this._rectRangeList.forEach((range) => {
            range.dispose();
        });

        this._rectRangeList = [];
    }

    private _removeAllCollapsedTextRanges() {
        for (const range of this._rangeList) {
            if (range.collapsed) {
                range.dispose();
            }
        }
    }

    private _deactivateAllTextRanges() {
        this._rangeList.forEach((range) => {
            range.deactivate();
        });
    }

    private _deactivateAllRectRanges() {
        this._rectRangeList.forEach((range) => {
            range.deactivate();
        });
    }

    private _addTextRangesToCache(textRanges: TextRange[]) {
        this._rangeListCache.push(...textRanges);
    }

    private _addTextRange(textRange: TextRange) {
        this._deactivateAllTextRanges();
        textRange.activate();

        this._rangeList.push(textRange);
    }

    private _addRectRangesToCache(rectRanges: RectRange[]) {
        this._rectRangeListCache.push(...rectRanges);
    }

    private _addRectRanges(rectRanges: RectRange[]) {
        if (rectRanges.length === 0) {
            return;
        }

        this._deactivateAllRectRanges();
        rectRanges[rectRanges.length - 1].activate();

        this._rectRangeList.push(...rectRanges);
    }

    private _createTextRangeByAnchorPosition(position: INodePosition) {
        this._removeAllRanges();

        const { scene, mainComponent } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        const lastRange = new TextRange(scene, mainComponent as Documents, skeleton, position, undefined, this._selectionStyle, this._currentSegmentId, this._currentSegmentPage);

        this._addTextRange(lastRange);
    }

    private _updateActiveRangePosition(position: INodePosition) {
        const activeTextRange = this._getActiveRangeInstance();

        if (activeTextRange == null || activeTextRange.anchorNodePosition == null) {
            this._logService.error(
                '[DocSelectionRenderService] _updateActiveRangeFocusPosition: active range has no anchor'
            );

            return;
        }

        this._removeAllRanges();

        this._anchorNodePosition = activeTextRange.anchorNodePosition;
        this._focusNodePosition = position;

        const { scene, mainComponent } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        const { _anchorNodePosition, _focusNodePosition, _selectionStyle, _currentSegmentId, _currentSegmentPage } = this;

        if (_anchorNodePosition == null || _focusNodePosition == null || mainComponent == null) {
            return;
        }

        const ranges = getRangeListFromSelection(
            _anchorNodePosition,
            _focusNodePosition,
            scene,
            mainComponent as Documents,
            skeleton,
            _selectionStyle,
            _currentSegmentId,
            _currentSegmentPage
        );

        if (ranges == null) {
            return;
        }

        const { textRanges, rectRanges } = ranges;

        this._addTextRangesToCache(textRanges);
        this._addRectRangesToCache(rectRanges);

        this.deactivate();
    }

    private _isEmpty() {
        return this._rangeList.length === 0 && this._rectRangeList.length === 0;
    }

    private _getCanvasOffset() {
        // This is quiet ambiguous, when did the engine's canvas offset changes?
        const engine = this._context.scene?.getEngine() as Engine;
        return getCanvasOffsetByEngine(engine);
    }

    private _updateInputPosition(forceFocus = false) {
        const activeRangeInstance = this._getActiveRangeInstance();
        const anchor = activeRangeInstance?.getAnchor();

        if (!anchor || (anchor && !anchor.visible) || this.activeViewPort == null) {
            this.focus();
            return;
        }

        const { left, top } = anchor;

        const absoluteCoord = this.activeViewPort.getAbsoluteVector(Vector2.FromArray([left, top]));

        const { x, y } = absoluteCoord;

        let { left: canvasLeft, top: canvasTop } = this._getCanvasOffset();

        canvasLeft += x;

        canvasTop += y;

        this.activate(canvasLeft, canvasTop, forceFocus);
    }

    private _moving(moveOffsetX: number, moveOffsetY: number) {
        const { _currentSegmentId: segmentId, _currentSegmentPage: segmentPage } = this;
        const focusNode = this._findNodeByCoord(moveOffsetX, moveOffsetY, {
            strict: true,
            segmentId,
            segmentPage,
        });

        const focusNodePosition = this._getNodePosition(focusNode);

        if (focusNodePosition == null || focusNode == null) {
            return;
        }

        const divide = focusNode?.node.parent;
        const nextGlyph = divide?.glyphGroup[divide.glyphGroup.indexOf(focusNode.node) + 1];

        // Should not select the last paragraph break.
        if (
            focusNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH &&
            nextGlyph?.streamType === DataStreamTreeTokenType.SECTION_BREAK
        ) {
            focusNodePosition.isBack = true;
        }

        this._focusNodePosition = focusNodePosition;

        this._removeAllCacheRanges();

        const { _anchorNodePosition, _selectionStyle } = this;
        const { scene, mainComponent } = this._context;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        if (_anchorNodePosition == null || mainComponent == null) {
            return;
        }

        const ranges = getRangeListFromSelection(
            _anchorNodePosition,
            focusNodePosition,
            scene,
            mainComponent as Documents,
            skeleton,
            _selectionStyle,
            segmentId,
            segmentPage
        );

        if (ranges == null) {
            return;
        }

        const { textRanges, rectRanges } = ranges;

        if (this._rangeList.length > 0 && textRanges.length > 0) {
            this._interactTextRanges(textRanges);
        }

        if (this._rectRangeList.length > 0 && rectRanges.length > 0) {
            this._interactRectRanges(rectRanges);
        }

        this._addTextRangesToCache(textRanges);
        this._addRectRangesToCache(rectRanges);

        this.deactivate();

        this._context.scene?.getEngine()?.setCapture();
    }

    __attachScrollEvent() {
        const viewport = this.activeViewPort;
        if (!viewport) {
            return;
        }

        const { unitId } = this._context;

        if (this._viewPortObserverMap.has(unitId)) {
            return;
        }

        const scrollBefore = viewport.onScrollAfter$.subscribeEvent((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const activeRangeInstance = this._getActiveRangeInstance();

            activeRangeInstance?.activeStatic();
        });

        const scrollStop = viewport.onScrollEnd$.subscribeEvent((param: IScrollObserverParam) => {
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

        this._viewPortObserverMap.set(unitId, {
            scrollBefore,
            scrollStop,
        });
    }

    // FIXME: listeners here are not correctly disposed
    // eslint-disable-next-line max-lines-per-function
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
                // Prevent input when there is any rect ranges.
                if ((e as InputEvent).inputType === 'historyUndo' || (e as InputEvent).inputType === 'historyRedo') {
                    return;
                }
                if (this._rectRangeList.length > 0) {
                    e.stopPropagation();
                    return e.preventDefault();
                }

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
                // Prevent input when there is any rect ranges.
                if (this._rectRangeList.length > 0) {
                    e.stopPropagation();
                    return e.preventDefault();
                }

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

        // this.disposeWithMe(
        //     fromEvent(this._input, 'pointerdown').subscribe((e) => {
        //         this._eventHandle(e, () => {
        //             this._onBlur$.next();
        //         });
        //     })
        // );

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
        const document = this._context.mainComponent as Documents;
        const { documentTransform } = document.getOffsetConfig();

        if (this.activeViewPort == null || documentTransform == null) {
            return;
        }

        const originCoord = this.activeViewPort.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

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

        const document = this._context.mainComponent as Documents;
        const skeleton = this._docSkeletonManagerService.getSkeleton();

        const {
            pageLayoutType = PageLayoutType.VERTICAL,
            pageMarginLeft,
            pageMarginTop,
        } = document.getOffsetConfig();

        const nodeInfo = skeleton.findNodeByCoord(
            coord,
            pageLayoutType,
            pageMarginLeft,
            pageMarginTop,
            restrictions
        );

        return nodeInfo;
    }

    private _detachEvent() {
        this._onInputBefore$.complete();
        this._onKeydown$.complete();
        this._onInput$.complete();
        this._onCompositionstart$.complete();
        this._onCompositionupdate$.complete();
        this._onCompositionend$.complete();
        this._onSelectionStart$.complete();
        this._textSelectionInner$.complete();
        this._onPaste$.complete();
        this._onFocus$.complete();
        this._onBlur$.complete();
        this._onPointerDown$.complete();
    }
}
