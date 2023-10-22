import { DataStreamTreeTokenType, Nullable, Observer, RxDisposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { CURSOR_TYPE } from '../../Basics/Const';
import { PageLayoutType } from '../../Basics/IDocumentSkeletonCached';
import { IMouseEvent, IPointerEvent } from '../../Basics/IEvents';
import { INodeInfo, INodePosition } from '../../Basics/Interfaces';
import { getOffsetRectForDom, transformBoundingCoord } from '../../Basics/Position';
import { getCurrentScrollXY } from '../../Basics/ScrollXY';
import {
    ITextSelectionRangeWithStyle,
    ITextSelectionStyle,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
} from '../../Basics/TextSelection';
import { checkStyle, injectStyle } from '../../Basics/Tools';
import { Transform } from '../../Basics/Transform';
import { Vector2 } from '../../Basics/Vector2';
import { Scene } from '../../Scene';
import { ScrollTimer } from '../../ScrollTimer';
import { IScrollObserverParam, Viewport } from '../../Viewport';
import { TextSelection } from './Common/TextSelection';
import { DocumentSkeleton } from './DocSkeleton';
import { IDocumentOffsetConfig } from './Document';

export interface ITextSelectionRenderManager {
    readonly onInputBefore$: Observable<Nullable<IEditorInputConfig>>;
    readonly onKeydown$: Observable<Nullable<IEditorInputConfig>>;
    readonly onInput$: Observable<Nullable<IEditorInputConfig>>;
    readonly onCompositionstart$: Observable<Nullable<IEditorInputConfig>>;
    readonly onCompositionupdate$: Observable<Nullable<IEditorInputConfig>>;
    readonly onCompositionend$: Observable<Nullable<IEditorInputConfig>>;
    readonly onSelectionStart$: Observable<Nullable<INodePosition>>;
    readonly onPaste$: Observable<Nullable<IEditorInputConfig>>;

    readonly textSelection$: Observable<TextSelection[]>;

    getViewPort(): Viewport;

    enableSelection(): void;

    disableSelection(): void;

    setSegment(id: string): void;

    setStyle(style: ITextSelectionStyle): void;

    resetStyle(): void;

    getActiveTextSelection(): Nullable<TextSelection>;

    getTextSelectionList(): TextSelection[];

    add(textSelection: Nullable<TextSelection>): void;

    remain(): Nullable<TextSelection>;

    sync(): void;

    scroll(): void;

    activate(x: number, y: number): void;

    focus(): void;

    blur(): void;

    deactivate(): void;

    changeRuntime(docSkeleton: DocumentSkeleton, scene: Scene): void;

    dispose(): void;

    reset(): void;

    getRanges(): Array<Nullable<ITextSelectionRangeWithStyle>>;

    getActiveRange(): Nullable<ITextSelectionRangeWithStyle>;

    eventTrigger(
        evt: IPointerEvent | IMouseEvent,
        documentOffsetConfig: IDocumentOffsetConfig,
        viewport: Nullable<Viewport>
    ): void;
}

export interface IEditorInputConfig {
    event: Event | CompositionEvent | KeyboardEvent;
    content?: string;
    activeRange?: Nullable<ITextSelectionRangeWithStyle>;
    selectionList?: TextSelection[];
}

export class TextSelectionRenderManager extends RxDisposable implements ITextSelectionRenderManager {
    // onKeydownObservable = new Observable<IEditorInputConfig>();

    // onInputObservable = new Observable<IEditorInputConfig>();

    // onCompositionstartObservable = new Observable<IEditorInputConfig>();

    // onCompositionupdateObservable = new Observable<IEditorInputConfig>();

    // onCompositionendObservable = new Observable<IEditorInputConfig>();

    // onSelectionStartObservable = new Observable<Nullable<INodePosition>>();

    private readonly _onInputBefore$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);

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

    private readonly _onPaste$ = new BehaviorSubject<Nullable<IEditorInputConfig>>(null);

    readonly onPaste$ = this._onPaste$.asObservable();

    private readonly _textSelection$ = new BehaviorSubject<TextSelection[]>([]);

    readonly textSelection$ = this._textSelection$.asObservable();

    // onPaste$!: RxObservable<ClipboardEvent>;

    private _container!: HTMLDivElement;

    private _inputParent!: HTMLDivElement;

    private _input!: HTMLDivElement;

    private _cursor!: HTMLDivElement;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    // private _skeletonObserver: Nullable<Observer<IDocumentSkeletonCached>>;

    private _viewportScrollX: number = 0;

    private _viewportScrollY: number = 0;

    private _textSelectionList: TextSelection[] = [];

    private _currentSegmentId: string = '';

    private _documentOffsetConfig: IDocumentOffsetConfig = {
        documentTransform: new Transform(),
        pageLayoutType: PageLayoutType.VERTICAL,
        pageMarginLeft: 0,
        pageMarginTop: 0,
        docsLeft: 0,
        docsTop: 0,
    };

    private _selectionStyle: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE;

    private _isSelectionEnabled: boolean = true;
    private _viewPortObserverMap = new Map<
        string,
        {
            scrollStop: Nullable<Observer<IScrollObserverParam>>;
            scrollBefore: Nullable<Observer<IScrollObserverParam>>;
        }
    >();

    private _isIMEInputApply = false;

    private _activeViewport!: Viewport;

    constructor(
        private _docSkeleton?: Nullable<DocumentSkeleton>,
        private _scene?: Nullable<Scene>,
        viewport?: Nullable<Viewport>
    ) {
        super();

        this._initDOM();
        // this.activeViewport = this._documents?.getFirstViewport();
        if (this._docSkeleton && this._scene) {
            this.changeRuntime(this._docSkeleton, this._scene, viewport);
        }
    }

    // set activeViewport(viewport: Nullable<Viewport>) {
    //     this._attachScrollEvent(viewport);
    //     this._activeViewport = viewport;
    // }

    getViewPort() {
        return this._activeViewport;
    }

    setSegment(id: string) {
        this._currentSegmentId = id;
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

    getActiveTextSelection() {
        const list = this._textSelectionList;
        for (const textSelection of list) {
            if (textSelection.isActive()) {
                return textSelection;
            }
        }
    }

    getTextSelectionList() {
        return this._textSelectionList;
    }

    add(textSelection: Nullable<TextSelection>) {
        if (textSelection == null) {
            return;
        }
        this._addTextSelection(textSelection);
    }

    remain() {
        const activeSelection = this.getActiveTextSelection();
        if (activeSelection == null) {
            return;
        }
        const index = this._textSelectionList.indexOf(activeSelection);

        return this._textSelectionList.splice(index, 1)[0];
    }

    sync() {
        this._syncDomToSelection();
    }

    scroll() {
        this._scrollToSelection();
    }

    getRanges(): Array<Nullable<ITextSelectionRangeWithStyle>> {
        return this.getTextSelectionList()
            .map((textSelection) => {
                const range = textSelection.getRange();
                if (range == null) {
                    return;
                }
                return {
                    ...range,
                    segmentId: this._currentSegmentId,
                    style: this._selectionStyle,
                };
            })
            .filter((x) => x != null);
    }

    getActiveRange(): Nullable<ITextSelectionRangeWithStyle> {
        const range = this.getActiveTextSelection()?.getRange();
        if (range == null) {
            return;
        }

        return {
            ...range,
            segmentId: this._currentSegmentId,
            style: this._selectionStyle,
        };
    }

    activate(x: number, y: number) {
        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;
        this._container.style.zIndex = `1000`;

        this._cursor.style.animation = 'univer_cursor_blinkStyle 1s steps(1) infinite';
        this._cursor.style.display = 'revert';

        setTimeout(() => {
            this.focus();
        }, 0);
    }

    focus(): void {
        this._input.focus();
    }

    blur() {
        this._input.blur();
    }

    // FIXME: for editor cell editor we don't need to blur the input element
    deactivate() {
        this._container.style.left = `0px`;
        this._container.style.top = `0px`;

        this._cursor.style.animation = '';
        this._cursor.style.display = 'none';

        // if (!withoutBlur) {
        //     this._input.blur();
        // }
    }

    changeRuntime(docSkeleton: DocumentSkeleton, scene: Scene, viewport?: Nullable<Viewport>) {
        // this._docSkeleton?.onRecalculateChangeObservable.remove(this._skeletonObserver);

        this._docSkeleton = docSkeleton;

        this._scene = scene;

        this._activeViewport = viewport || scene.getViewports()[0];

        // this._attachSelectionEvent(this._documents);
    }

    eventTrigger(
        evt: IPointerEvent | IMouseEvent,
        documentOffsetConfig: IDocumentOffsetConfig,
        viewportMain: Nullable<Viewport>
    ) {
        // this._moveInObserver = documents.onPointerEnterObserver.add(() => {
        //     documents.cursor = CURSOR_TYPE.TEXT;
        // });

        // this._moveOutObserver = documents.onPointerLeaveObserver.add(() => {
        //     documents.cursor = CURSOR_TYPE.DEFAULT;
        //     this._scene?.resetCursor();
        // });

        // this._downObserver = documents.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {

        // });

        if (!this._scene || !this._isSelectionEnabled) {
            return;
        }

        if (viewportMain != null) {
            this._activeViewport = viewportMain;
        }

        const scene = this._scene;

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        this._attachScrollEvent(
            viewportMain || scene.getActiveViewportByCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]))
        );

        this._documentOffsetConfig = documentOffsetConfig;

        const startNode = this._findNodeByCoord(evtOffsetX, evtOffsetY);

        const position = this._getNodePosition(startNode);

        console.log('startNode', startNode, position, evtOffsetX, evtOffsetY);

        if (position == null) {
            this._deleteAllTextSelection();
            return;
        }

        if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
            position.isBack = true;
        }

        if (evt.ctrlKey || this._isEmptyTextSelection()) {
            const newTextSelection = new TextSelection(scene, position);
            this._addTextSelection(newTextSelection);
        } else {
            this._updateTextSelection(position);
        }

        this._activeSelectionRefresh();

        scene.disableEvent();

        const scrollTimer = ScrollTimer.create(scene);
        scrollTimer.startScroll(evtOffsetX, evtOffsetY);

        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);

        this._viewportScrollX = scrollX;
        this._viewportScrollY = scrollY;

        this._onSelectionStart$.next(this.getActiveTextSelection()?.getStart());

        let preMoveOffsetX = evtOffsetX;

        let preMoveOffsetY = evtOffsetY;

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
            scene.setCursor(CURSOR_TYPE.TEXT);
            if (Math.sqrt((moveOffsetX - preMoveOffsetX) ** 2 + (moveOffsetY - preMoveOffsetY) ** 2) < 3) {
                return;
            }
            this._moving(moveOffsetX, moveOffsetY, scrollTimer);
            scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                this._moving(moveOffsetX, moveOffsetY, scrollTimer);
            });
            preMoveOffsetX = moveOffsetX;
            preMoveOffsetY = moveOffsetY;
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();

            this._textSelection$.next(this.getTextSelectionList());

            scrollTimer.dispose();
            this._syncDomToSelection();
        });

        // state.stopPropagation();
    }

    reset() {
        this._deleteAllTextSelection();
        this.deactivate();
    }

    override dispose() {
        super.dispose();

        this._detachEvent();

        this._container.remove();
    }

    private _initDOM() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = `0px`;
        container.style.top = `0px`;

        const inputParent = document.createElement('div');
        const inputDom = document.createElement('div');
        const cursorDom = document.createElement('div');

        inputParent.appendChild(inputDom);
        container.appendChild(inputParent);
        container.appendChild(cursorDom);

        this._container = container;
        this._inputParent = inputParent;
        this._input = inputDom;
        this._cursor = cursorDom;

        this._initInput();
        this._initDOMCursor();
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

    private _initDOMCursor() {
        this._cursor.style.cssText = `
            visibility: visible;
            position: absolute;
            background: #000;
            left: 0;
            top: 0;
            width: 1px;
            height: 20px;
            opacity: 0;
            z-index: 0;
            pointer-events: none;
            display: none
        `;

        if (!checkStyle('keyframes univer_cursor_blinkStyle')) {
            const styles = [
                `
                @-webkit-keyframes univer_cursor_blinkStyle {
                    0% {
                        opacity: 1;
                    }

                    13% {
                        opacity: 0;
                    }

                    50% {
                        opacity: 0;
                    }

                    63% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 1;
                    }
                }
            `,
                `
                @keyframes univer_cursor_blinkStyle {
                    0% {
                        opacity: 1;
                    }

                    13% {
                        opacity: 0;
                    }

                    50% {
                        opacity: 0;
                    }

                    63% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 1;
                    }
                }
            `,
            ];
            injectStyle(styles);
        }
    }

    private _getNodePosition(node: Nullable<INodeInfo>) {
        if (node == null) {
            return;
        }

        const { node: span, ratioX, ratioY } = node;

        const position = this._docSkeleton?.findPositionBySpan(span);

        if (position == null) {
            return;
        }

        let isBack = false;
        //|| (span.streamType === DataStreamTreeTokenType.PARAGRAPH && isStart)
        if (ratioX < 0.5) {
            isBack = true;
        }

        return {
            ...position,
            isBack,
        };
    }

    private _interactTextSelection(activeTextSelection: TextSelection) {
        const newTextSelection: TextSelection[] = [];
        let hasIntersection = false;
        this._textSelectionList.forEach((textSelection) => {
            if (textSelection === activeTextSelection) {
                return true;
            }
            if (!activeTextSelection.isIntersection(textSelection)) {
                newTextSelection.push(textSelection);
            } else {
                hasIntersection = true;
                textSelection.dispose();
            }
        });

        if (!hasIntersection) {
            return;
        }
        newTextSelection.push(activeTextSelection);
        this._textSelectionList = newTextSelection;
    }

    private _deleteAllTextSelection() {
        this._textSelectionList.forEach((textSelection) => {
            textSelection.dispose();
        });
        this._textSelectionList = [];
    }

    private _deactivateTextSelection() {
        this._textSelectionList.forEach((textSelection) => {
            textSelection.deactivate();
        });
    }

    private _addTextSelection(textSelection: TextSelection) {
        this._deactivateTextSelection();
        textSelection.activate();
        this._textSelectionList.push(textSelection);
    }

    private _updateTextSelection(position: INodePosition) {
        if (!this._scene) {
            return;
        }
        let lastTextSelection = this._textSelectionList.pop();
        if (!lastTextSelection) {
            lastTextSelection = new TextSelection(this._scene, position);
        }
        this._deleteAllTextSelection();
        lastTextSelection.activate();
        lastTextSelection.startNodePosition = position;
        lastTextSelection.endNodePosition = null;
        this._textSelectionList = [lastTextSelection];
    }

    private _isEmptyTextSelection() {
        return this._textSelectionList.length === 0;
    }

    private _getCanvasOffset() {
        const engine = this._scene?.getEngine();
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

    // Let the selection show on the current screen.
    private _scrollToSelection() {
        const activeTextSelection = this.getActiveTextSelection();
        const anchor = activeTextSelection?.getAnchor();
        if (!anchor || (anchor && !anchor.visible) || this._activeViewport == null) {
            return;
        }

        const { left, top } = anchor;

        const { tl, tr, bl } = this._activeViewport.getBounding();
        const constantOffset = 100;
        let offsetY = 0;
        let offsetX = 0;
        if (top < tl.y + constantOffset) {
            offsetY = top - tl.y - constantOffset;
        } else if (top > bl.y - constantOffset) {
            offsetY = top - bl.y + constantOffset;
        }

        if (left < tl.x + constantOffset) {
            offsetX = left - tl.x - constantOffset;
        } else if (left > tr.x - constantOffset) {
            offsetX = left - tr.x + constantOffset;
        }

        const config = this._activeViewport.getBarScroll(offsetX, offsetY);
        this._activeViewport.scrollBy(config);
    }

    private _syncDomToSelection() {
        const activeTextSelection = this.getActiveTextSelection();
        const anchor = activeTextSelection?.getAnchor();
        if (!anchor || (anchor && !anchor.visible) || this._activeViewport == null) {
            this.focus();
            return;
        }

        const { height, left, top } = anchor;

        const absoluteCoord = this._activeViewport.getAbsoluteVector(Vector2.FromArray([left, top]));

        const { x, y } = absoluteCoord;

        this._cursor.style.height = `${height}px`;

        // console.log('_syncDomToSelection', left, top, absoluteCoord?.x || 0, absoluteCoord?.y || 0);

        let { left: canvasLeft, top: canvasTop } = this._getCanvasOffset();

        canvasLeft += x;

        canvasTop += y;

        this.activate(canvasLeft, canvasTop);
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        // const endX = moveOffsetX - this._viewportScrollX + scrollX;
        // const endY = moveOffsetY - this._viewportScrollY + scrollY;

        if (this._docSkeleton == null) {
            return;
        }

        const endNode = this._findNodeByCoord(moveOffsetX, moveOffsetY);

        const endPosition = this._getNodePosition(endNode);

        // console.log('endNode', endNode, endPosition, { moveOffsetX, moveOffsetY, _viewportScrollY: this._viewportScrollY, scrollX });

        if (!endPosition) {
            return;
        }

        const activeTextSelection = this.getActiveTextSelection();

        if (!activeTextSelection) {
            return;
        }

        activeTextSelection.endNodePosition = endPosition;

        activeTextSelection.refresh(this._documentOffsetConfig, this._docSkeleton);

        this.deactivate();

        this._interactTextSelection(activeTextSelection);
    }

    private _attachScrollEvent(viewport: Nullable<Viewport>) {
        if (viewport == null) {
            return;
        }
        const key = viewport.viewPortKey;
        if (this._viewPortObserverMap.has(key)) {
            return;
        }

        const scrollBefore = viewport.onScrollBeforeObserver.add((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const textSelection = this.getActiveTextSelection();

            textSelection?.activeStatic();

            this._cursor.style.display = 'none';
        });

        const scrollStop = viewport.onScrollStopObserver.add((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const bounds = viewport.getBounding();

            const textSelection = this.getActiveTextSelection();

            const anchor = textSelection?.getAnchor();

            if (!anchor || (anchor && !anchor.visible)) {
                return;
            }

            if (bounds) {
                const { minX, maxX, minY, maxY } = transformBoundingCoord(anchor, bounds);

                if (anchor.strokeWidth < minX || maxX < 0 || anchor.strokeWidth < minY || maxY < 0) {
                    return;
                }
            }

            this._syncDomToSelection();

            textSelection?.deactivateStatic();

            this._cursor.style.display = 'revert';
        });

        this._viewPortObserverMap.set(key, {
            scrollBefore,
            scrollStop,
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _initInputEvents() {
        // TODO: emit these paste event

        this._input.addEventListener('keydown', (e) => {
            if (this._isIMEInputApply) {
                return;
            }

            this._eventHandle(e, (config) => {
                this._onKeydown$.next(config);
            });
        });

        this._input.addEventListener('input', (e) => {
            if (this._isIMEInputApply) {
                return;
            }

            this._eventHandle(e, (config) => {
                this._onInputBefore$.next(config);
                this._onInput$.next(config);
            });
        });

        this._input.addEventListener('compositionstart', (e) => {
            this._isIMEInputApply = true;

            this._eventHandle(e, (config) => {
                this._onCompositionstart$.next(config);
            });
        });

        this._input.addEventListener('compositionend', (e) => {
            this._isIMEInputApply = false;

            this._eventHandle(e, (config) => {
                this._onCompositionend$.next(config);
            });
        });

        this._input.addEventListener('compositionupdate', (e) => {
            this._eventHandle(e, (config) => {
                this._onInputBefore$.next(config);
                this._onCompositionupdate$.next(config);
            });
        });

        this._input.addEventListener('paste', (e) => {
            this._eventHandle(e, (config) => {
                this._onPaste$.next(config);
            });
        });
    }

    private _eventHandle(e: Event | CompositionEvent | KeyboardEvent, func: (config: IEditorInputConfig) => void) {
        const content = this._input.textContent || '';

        this._input.innerHTML = '';

        const activeRange = this.getActiveRange();
        const selectionList = this.getTextSelectionList();

        func({
            event: e,
            content,
            activeRange,
            selectionList,
        });
    }

    private _handlePaste(e: ClipboardEvent) {
        // TODO: emit the paste event to subscribers
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const { documentTransform } = this._documentOffsetConfig;
        if (this._activeViewport == null || documentTransform == null) {
            return;
        }

        const originCoord = this._activeViewport.getRelativeVector(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        if (!originCoord) {
            return;
        }

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _findNodeByCoord(evtOffsetX: number, evtOffsetY: number) {
        const coord = this._getTransformCoordForDocumentOffset(evtOffsetX, evtOffsetY);

        if (coord == null) {
            return;
        }

        const { pageLayoutType = PageLayoutType.VERTICAL, pageMarginLeft, pageMarginTop } = this._documentOffsetConfig;

        return this._docSkeleton?.findNodeByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop);
    }

    private _detachEvent() {
        // documents.onPointerEnterObserver.remove(this._moveInObserver);
        // documents.onPointerLeaveObserver.remove(this._moveOutObserver);
        // documents.onPointerDownObserver.remove(this._downObserver);
        // this._docSkeleton?.onRecalculateChangeObservable.remove(this._skeletonObserver);
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
        const activeSelection = this.getActiveTextSelection();

        activeSelection?.refresh(this._documentOffsetConfig, this._docSkeleton);

        // this._activeSelectionRefresh$.next(activeSelection);
    }
}

export const ITextSelectionRenderManager = createIdentifier<TextSelectionRenderManager>(
    'deprecated.univer.doc.text-selection-render-manager'
);
