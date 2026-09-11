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

import type { DocumentDataModel, ICommandInfo } from '@univerjs/core';
import type {
    IMouseEvent,
    IPointerEvent,
    IRenderContext,
    IRenderModule,
    RenderComponentType,
} from '@univerjs/engine-render';
import type { ISetDocZoomRatioOperationParams } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import type { MobileDocSelectionRenderService } from '../../../services/mobile/doc-selection-render.service';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    ICommandService,
    IContextService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    Optional,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import {
    CURSOR_TYPE,
    DocumentEditArea,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    PageLayoutType,
    Vector2,
} from '@univerjs/engine-render';
import { IContextMenuService } from '@univerjs/ui';
import { filter, fromEvent, take } from 'rxjs';
import { neoGetDocObject } from '../../../basics/component-tools';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { findFirstCursorOffset } from '../../../basics/selection';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { DOC_CARET_MENU_ID, MOBILE_DOC_PINCH_ZOOMING } from '../../../consts/mobile-context';
import {
    IDocEmbedInteractionBoundaryService,
    IDocEmbedRuntimeFocusCoordinator,
} from '../../../services/doc-embed-integration.service';
import { DocMobileElementMenuService } from '../../../services/doc-mobile-element-menu.service';
import { IEditorService } from '../../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { getEventClientPoint, isEmbedInteractionEvent } from '../doc-selection-render.util';

const DOUBLE_TAP_INTERVAL = 450;
const DOUBLE_TAP_DISTANCE = 28;
const DRAG_THRESHOLD = 12;
const INERTIA_DECELERATION_RATE = 0.992;
const INERTIA_MIN_VELOCITY = 0.22;
const INERTIA_MAX_VELOCITY = 12;

export class MobileDocSelectionRenderController extends Disposable implements IRenderModule {
    private _loadedMap = new WeakSet<RenderComponentType>();
    private _deferredEditorFocusTimer: ReturnType<typeof setTimeout> | null = null;
    private _gestureTimer: ReturnType<typeof setTimeout> | null = null;
    private _gestureDisposables: Array<{ unsubscribe(): void }> = [];
    private _lastTap: { x: number; y: number; time: number } | null = null;
    private _inertiaAnimationId: number | null = null;
    private _inertiaLastFrameTime = 0;
    private _inertiaVelocity = { x: 0, y: 0 };
    private _initialSelectionReady = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: MobileDocSelectionRenderService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @Inject(DocMobileElementMenuService) private readonly _mobileElementMenuService: DocMobileElementMenuService,
        @Optional(IDocEmbedInteractionBoundaryService) _embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService,
        @Optional(IDocEmbedRuntimeFocusCoordinator) private readonly _embedRuntimeFocusCoordinator?: IDocEmbedRuntimeFocusCoordinator
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._init();
        this._refreshListener();
        this._syncSelection();
        this._skeletonListener();
        this._commandExecutedListener();
    }

    private _init(): void {
        const { unitId } = this._context;
        const docObject = neoGetDocObject(this._context);
        if (docObject == null || docObject.document == null) {
            return;
        }

        if (!this._loadedMap.has(docObject.document)) {
            this._initialMain(unitId);
            this._loadedMap.add(docObject.document);
        }
    }

    private _refreshListener(): void {
        this.disposeWithMe(
            this._docSelectionManagerService.refreshSelection$.subscribe((params) => {
                if (params == null) {
                    return;
                }

                const { unitId, docRanges, isEditing, options } = params;
                if (unitId !== this._context.unitId) {
                    return;
                }

                this._docSelectionRenderService.replaceDocRanges(docRanges, isEditing, options);
            })
        );
    }

    private _syncSelection(): void {
        this.disposeWithMe(
            this._docSelectionRenderService.textSelectionInner$.subscribe((params) => {
                if (params == null) {
                    return;
                }

                if (!isInternalEditorID(this._context.unitId) && this._isEmbedChildInteractionActive(this._context.unitId)) {
                    return;
                }

                this._docSelectionManagerService.__replaceTextRangesWithNoRefresh(params, {
                    unitId: this._context.unitId,
                    subUnitId: this._context.unitId,
                });
            })
        );
    }

    private _initialMain(unitId: string): void {
        this.disposeWithMe(fromEvent<MouseEvent>(this._context.engine.getCanvasElement(), 'mousedown').subscribe((event) => {
            // A compatibility mouse event must not steal focus after a WebKit touch.
            if (event.button === 0 && this._docSelectionRenderService.isFocusing) {
                event.preventDefault();
            }
        }));

        if (isInternalEditorID(unitId)) {
            this._initialEditor(unitId);
            return;
        }

        const { document, scene } = neoGetDocObject(this._context);
        this._docSelectionRenderService.exitMobileEditMode();
        this.disposeWithMe(scene.onPointerDown$.subscribeEvent((event: IPointerEvent | IMouseEvent, state) => {
            if (event.cancelable) {
                event.preventDefault();
            }
            this._startGesture(event, this._docSelectionRenderService.isMobileEditMode, this._getDocumentOffset(event), false);
            state.stopPropagation();
        }));
        this.disposeWithMe(document.onPointerDown$.subscribeEvent((event: IPointerEvent | IMouseEvent, state) => {
            if (this._isEditorReadOnly(unitId) || this._isEmbedInteractionEvent(event, unitId)) {
                return;
            }

            const current = this._instanceSrv.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            if (current?.getUnitId() !== unitId) {
                this._instanceSrv.setCurrentUnitForType(unitId);
            }
            if (!this._editorService.getEditorRenderConfig(unitId)?.preserveHostFocus) {
                this._instanceSrv.focusUnit(unitId);
            }

            const offset = this._getDocumentOffset(event);
            this._syncEditArea(offset.offsetX, offset.offsetY);
            if (event.cancelable) {
                event.preventDefault();
            }
            this._startGesture(event, this._docSelectionRenderService.isMobileEditMode, offset);
            if (event.button !== 2) {
                state.stopPropagation();
            }
        }));
    }

    private _initialEditor(unitId: string): void {
        const { document, scene } = neoGetDocObject(this._context);
        this.disposeWithMe(document.onPointerEnter$.subscribeEvent(() => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }
            document.cursor = CURSOR_TYPE.TEXT;
        }));

        this.disposeWithMe(document.onPointerLeave$.subscribeEvent(() => {
            document.cursor = CURSOR_TYPE.DEFAULT;
            scene.resetCursor();
        }));

        this.disposeWithMe(document.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (this._isEditorReadOnly(unitId) || this._isEmbedInteractionEvent(evt, unitId)) {
                return;
            }

            const docDataModel = this._instanceSrv.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            if (docDataModel?.getUnitId() !== unitId) {
                this._instanceSrv.setCurrentUnitForType(unitId);
            }
            const isSheetEditor = unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY || unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;
            if (!isSheetEditor && !this._editorService.getEditorRenderConfig(unitId)?.preserveHostFocus) {
                this._instanceSrv.focusUnit(unitId);
            }

            const { offsetX, offsetY } = evt;
            this._syncEditArea(offsetX, offsetY);
            this._docSelectionRenderService.__onPointDown(evt, true);

            if (this._editorService.getEditor(unitId)) {
                this._setEditorFocus(unitId);
                if (this._deferredEditorFocusTimer != null) {
                    clearTimeout(this._deferredEditorFocusTimer);
                }
                this._deferredEditorFocusTimer = setTimeout(() => {
                    this._deferredEditorFocusTimer = null;
                    if (unitId === this._editorService.getFocusId() || this._docSelectionRenderService.isOnPointerEvent) {
                        return;
                    }
                    this._setEditorFocus(unitId);
                    this._docSelectionRenderService.setCursorManually(offsetX, offsetY);
                }, 0);
            }

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        this.disposeWithMe(document.onDblclick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            if (this._isEditorReadOnly(unitId) || this._isEmbedInteractionEvent(evt, unitId)) {
                return;
            }

            if (this._editorService.getEditor(unitId)) {
                this._setEditorFocus(unitId);
            }
            this._docSelectionRenderService.__handleDblClick(evt);
        }));

        this.disposeWithMe(document.onTripleClick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            if (this._isEditorReadOnly(unitId) || this._isEmbedInteractionEvent(evt, unitId)) {
                return;
            }

            this._docSelectionRenderService.__handleTripleClick(evt);
        }));
    }

    override dispose(): void {
        this._clearGesture();
        this._stopInertia();
        if (this._deferredEditorFocusTimer != null) {
            clearTimeout(this._deferredEditorFocusTimer);
            this._deferredEditorFocusTimer = null;
        }
        super.dispose();
    }

    private _syncEditArea(offsetX: number, offsetY: number): void {
        const coord = this._getTransformCoordForDocumentOffset(offsetX, offsetY);
        if (coord == null) {
            return;
        }

        const { document } = neoGetDocObject(this._context);
        const {
            pageLayoutType = PageLayoutType.VERTICAL,
            pageMarginLeft,
            pageMarginTop,
        } = document.getOffsetConfig();
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        const { editArea } = skeleton.findEditAreaByCoord(
            coord,
            pageLayoutType,
            pageMarginLeft,
            pageMarginTop
        );
        const viewModel = this._docSkeletonManagerService.getViewModel();
        const preEditArea = viewModel.getEditArea();

        if (preEditArea !== DocumentEditArea.BODY && editArea !== DocumentEditArea.BODY && editArea !== preEditArea) {
            viewModel.setEditArea(editArea);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _startGesture(
        evt: IPointerEvent | IMouseEvent,
        startedWhileEditing: boolean,
        documentOffset: { offsetX: number; offsetY: number },
        allowTextInteraction = true
    ): void {
        this._clearGesture();
        this._stopInertia();
        const elementTarget = allowTextInteraction ? this._mobileElementMenuService.takeTarget(this._context.unitId) : null;
        this._mobileElementMenuService.close();
        if (this._contextMenuService.visible) {
            this._contextMenuService.hideContextMenu();
        }
        const scene = this._context.scene;
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN) ?? scene.getViewports()[0];
        const isModernDocument = this._context.unit.getSnapshot().documentStyle.documentFlavor === DocumentFlavor.MODERN;
        const { x: startX, y: startY } = getGesturePoint(evt);
        let [previousX, previousY] = [startX, startY];
        let moved = false;
        let selected = false;
        const inertiaTracker = createInertiaTracker(isModernDocument);
        const activeRange = this._docSelectionRenderService.getActiveTextRange();
        const activeOffset = activeRange?.collapsed ? activeRange.startOffset ?? null : null;
        const inputWasFocused = this._docSelectionRenderService.isFocusing;

        if (allowTextInteraction && !elementTarget?.onTap && !elementTarget?.onDrag) {
            this._gestureTimer = setTimeout(() => {
                this._gestureTimer = null;
                if (this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                    return;
                }
                selected = true;
                this._selectWord(evt, startedWhileEditing);
            }, 420);
        }

        const moveDisposable = scene.onPointerMove$.subscribeEvent((moveEvent: IPointerEvent | IMouseEvent) => {
            if (selected || this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                return;
            }
            const { x: moveX, y: moveY } = getGesturePoint(moveEvent);
            const deltaX = moveX - previousX;
            const deltaY = moveY - previousY;
            if (!moved && Math.hypot(moveX - startX, moveY - startY) < DRAG_THRESHOLD) {
                return;
            }

            moved = true;
            this._lastTap = null;
            this._clearGestureTimer();
            if (elementTarget?.onDrag) {
                elementTarget.onDrag(moveEvent);
            } else {
                this._scrollDocument(viewport, isModernDocument, deltaX, deltaY);
                inertiaTracker.track(deltaX, deltaY);
            }
            previousX = moveX;
            previousY = moveY;
        });
        const upDisposable = scene.onPointerUp$.subscribeEvent(() => {
            if (this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                this._clearGesture();
                return;
            }
            if (allowTextInteraction && !moved && !selected) {
                if (elementTarget) {
                    if (elementTarget.onTap) {
                        elementTarget.onTap(documentOffset);
                    } else {
                        this._mobileElementMenuService.show(elementTarget);
                    }
                } else {
                    this._handleTap(evt, documentOffset, startedWhileEditing, inputWasFocused, activeOffset);
                }
            }
            if (moved && !elementTarget?.onDrag) {
                this._startInertia(viewport, inertiaTracker.getVelocity());
            }
            this._clearGesture();
        });
        const cancelDisposable = scene.onPointerCancel$.subscribeEvent(() => this._clearGesture());
        this._gestureDisposables = [moveDisposable, upDisposable, cancelDisposable];
    }

    private _handleTap(
        evt: IPointerEvent | IMouseEvent,
        documentOffset: { offsetX: number; offsetY: number },
        startedWhileEditing: boolean,
        inputWasFocused: boolean,
        activeOffset: number | null
    ): void {
        const { offsetX, offsetY } = documentOffset;
        this._context.scene.getTransformer()?.clearSelectedObjects();
        if (startedWhileEditing) {
            this._docSelectionRenderService.setCursorManually(offsetX, offsetY, true, true, { strict: false });
            const nextRange = this._docSelectionRenderService.getActiveTextRange();
            if (inputWasFocused && activeOffset != null && nextRange?.collapsed && nextRange.startOffset === activeOffset) {
                this._showCaretMenu(evt);
            }
            return;
        }

        const now = Date.now();
        const lastTap = this._lastTap;
        const isDoubleTap = lastTap != null &&
            now - lastTap.time <= DOUBLE_TAP_INTERVAL &&
            Math.hypot(offsetX - lastTap.x, offsetY - lastTap.y) <= DOUBLE_TAP_DISTANCE;
        if (isDoubleTap) {
            this._lastTap = null;
            this._enterEditing(this._context.unitId, evt);
        } else {
            this._lastTap = { x: offsetX, y: offsetY, time: now };
        }
    }

    private _selectWord(evt: IPointerEvent | IMouseEvent, startedWhileEditing: boolean): void {
        this._context.scene.getTransformer()?.clearSelectedObjects();
        this._lastTap = null;
        this._docSelectionRenderService.__handleDblClick(evt, false, false);
        if (startedWhileEditing) {
            this._docSelectionRenderService.suspendMobileEditingInput();
        }
    }

    private _scrollDocument(
        viewport: ReturnType<IRenderContext<DocumentDataModel>['scene']['getViewports']>[number] | undefined,
        isModernDocument: boolean,
        deltaX: number,
        deltaY: number
    ): void {
        const { scaleX, scaleY } = this._context.scene;
        viewport?.scrollByViewportDeltaVal({
            viewportScrollX: isModernDocument ? 0 : normalizeScrollDelta(-deltaX, scaleX),
            viewportScrollY: normalizeScrollDelta(-deltaY, scaleY),
        });
    }

    private _startInertia(
        viewport: ReturnType<IRenderContext<DocumentDataModel>['scene']['getViewports']>[number] | undefined,
        velocity: { x: number; y: number }
    ): void {
        const maxVelocity = INERTIA_MAX_VELOCITY;
        this._inertiaVelocity = {
            x: Math.max(-maxVelocity, Math.min(maxVelocity, velocity.x)),
            y: Math.max(-maxVelocity, Math.min(maxVelocity, velocity.y)),
        };
        if (Math.hypot(this._inertiaVelocity.x, this._inertiaVelocity.y) <= INERTIA_MIN_VELOCITY * 2) {
            return;
        }

        this._inertiaLastFrameTime = 0;
        const scroll = (currentTime: number) => {
            if (this._inertiaLastFrameTime === 0) {
                this._inertiaLastFrameTime = currentTime;
                this._inertiaAnimationId = requestAnimationFrame(scroll);
                return;
            }

            const deltaTime = currentTime - this._inertiaLastFrameTime;
            this._inertiaLastFrameTime = currentTime;
            const decelerationRate = INERTIA_DECELERATION_RATE;
            const decelerationFactor = decelerationRate ** deltaTime;
            this._inertiaVelocity.x *= decelerationFactor;
            this._inertiaVelocity.y *= decelerationFactor;
            const dampingFactor = -Math.log(decelerationRate);
            const { scaleX, scaleY } = this._context.scene;
            viewport?.scrollByViewportDeltaVal({
                viewportScrollX: normalizeScrollDelta(
                    this._inertiaVelocity.x * (1 - decelerationFactor) / dampingFactor,
                    scaleX
                ),
                viewportScrollY: normalizeScrollDelta(
                    this._inertiaVelocity.y * (1 - decelerationFactor) / dampingFactor,
                    scaleY
                ),
            });

            if (Math.hypot(this._inertiaVelocity.x, this._inertiaVelocity.y) > INERTIA_MIN_VELOCITY) {
                this._inertiaAnimationId = requestAnimationFrame(scroll);
            } else {
                this._inertiaAnimationId = null;
                this._inertiaLastFrameTime = 0;
            }
        };
        this._inertiaAnimationId = requestAnimationFrame(scroll);
    }

    private _stopInertia(): void {
        if (this._inertiaAnimationId != null) {
            cancelAnimationFrame(this._inertiaAnimationId);
        }
        this._inertiaAnimationId = null;
        this._inertiaLastFrameTime = 0;
        this._inertiaVelocity = { x: 0, y: 0 };
    }

    private _enterEditing(unitId: string, evt: IPointerEvent | IMouseEvent): void {
        if (this._editorService.getEditor(unitId)) {
            this._setEditorFocus(unitId);
        }
        this._docSelectionRenderService.enterMobileEditMode();
        const { offsetX, offsetY } = this._getDocumentOffset(evt);
        this._docSelectionRenderService.setCursorManually(offsetX, offsetY, true, true, { strict: false });
    }

    private _getDocumentOffset(evt: IPointerEvent | IMouseEvent): { offsetX: number; offsetY: number } {
        const engine = this._context.scene.getEngine();
        const canvas = engine?.getCanvasElement();
        if (!engine || !canvas || !Number.isFinite(evt.clientX) || !Number.isFinite(evt.clientY)) {
            return { offsetX: evt.offsetX, offsetY: evt.offsetY };
        }

        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
            return { offsetX: evt.offsetX, offsetY: evt.offsetY };
        }

        return {
            offsetX: (evt.clientX - rect.left) * engine.width / rect.width,
            offsetY: (evt.clientY - rect.top) * engine.height / rect.height,
        };
    }

    private _showCaretMenu(evt: IPointerEvent | IMouseEvent): void {
        const point = getEventClientPoint(evt, null);
        this._contextMenuService.triggerContextMenu({
            clientX: point?.clientX ?? evt.offsetX,
            clientY: point?.clientY ?? evt.offsetY,
            stopPropagation() {},
        }, DOC_CARET_MENU_ID, {
            caretAnchor: true,
            unitId: this._context.unitId,
            subUnitId: this._context.unitId,
        });
    }

    private _clearGestureTimer(): void {
        if (this._gestureTimer == null) {
            return;
        }
        clearTimeout(this._gestureTimer);
        this._gestureTimer = null;
    }

    private _clearGesture(): void {
        this._clearGestureTimer();
        this._gestureDisposables.forEach((disposable) => disposable.unsubscribe());
        this._gestureDisposables = [];
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const { document, scene } = neoGetDocObject(this._context);
        const { documentTransform } = document.getOffsetConfig();
        const activeViewport = scene.getViewports()[0];
        if (activeViewport == null) {
            return;
        }

        const originCoord = activeViewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));
        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _isEditorReadOnly(unitId: string): boolean {
        return this._editorService.getEditor(unitId)?.isReadOnly() ?? false;
    }

    private _setEditorFocus(unitId: string): void {
        this._editorService.focus(unitId);
    }

    private _isEmbedInteractionEvent(evt: IPointerEvent | IMouseEvent, unitId: string): boolean {
        if (isInternalEditorID(unitId)) {
            return false;
        }

        const target = (evt as Event).target;
        if (this._embedRuntimeFocusCoordinator?.isChildUnitRuntimeEvent(unitId, target, evt as Event)) {
            return false;
        }
        if (this._embedRuntimeFocusCoordinator?.isChildUnitInActiveSession(unitId)) {
            return false;
        }
        if (this._embedRuntimeFocusCoordinator?.shouldSuppressHostInteraction(unitId, target, evt as Event)) {
            return true;
        }

        return isEmbedInteractionEvent(evt);
    }

    private _isEmbedChildInteractionActive(unitId: string): boolean {
        return this._embedRuntimeFocusCoordinator?.shouldSuppressHostInteraction(unitId) === true;
    }

    private _commandExecutedListener(): void {
        const updateCommandList = [SetDocZoomRatioOperation.id];
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (!updateCommandList.includes(command.id)) {
                return;
            }

            const params = command.params as ISetDocZoomRatioOperationParams;
            const { unitId: documentId } = params;
            if (this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                return;
            }

            const unitId = this._docSelectionManagerService.__getCurrentSelection()?.unitId;
            if (documentId !== unitId || this._isEmbedChildInteractionActive(documentId)) {
                return;
            }

            this._docSelectionManagerService.refreshSelection();
        }));
    }

    private _skeletonListener(): void {
        this.disposeWithMe(this._docSkeletonManagerService.currentSkeleton$.subscribe((skeleton) => {
            if (!skeleton || this._initialSelectionReady) {
                return;
            }

            const { unitId } = this._context;
            if (isInternalEditorID(unitId) || this._isEmbedChildInteractionActive(unitId)) {
                return;
            }
            this._initialSelectionReady = true;

            const snapshot = this._context.unit.getSnapshot();
            const offset = findFirstCursorOffset(snapshot);
            const selectionTarget = { unitId, subUnitId: unitId };
            this._docSelectionManagerService.replaceSelectionInfoWithoutRefresh({
                textRanges: [{
                    startOffset: offset,
                    endOffset: offset,
                    collapsed: true,
                    isActive: true,
                }],
                rectRanges: [],
                segmentId: '',
                segmentPage: -1,
                isEditing: false,
                style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            }, selectionTarget);
            this._docSelectionManagerService.refreshSelection(selectionTarget, false);
            if (this._docSelectionRenderService.getActiveTextRange() == null) {
                this.disposeWithMe(skeleton.layoutProgress$
                    .pipe(
                        filter((progress) => progress?.anchorReady === true || progress?.complete === true),
                        take(1)
                    )
                    .subscribe(() => this._docSelectionManagerService.refreshSelection(selectionTarget, false)));
            }
        }));
    }
}

function getGesturePoint(evt: IPointerEvent | IMouseEvent): { x: number; y: number } {
    const point = getEventClientPoint(evt, null);
    return {
        x: point?.clientX ?? evt.offsetX,
        y: point?.clientY ?? evt.offsetY,
    };
}

function normalizeScrollDelta(delta: number, scale: number): number {
    return delta / (Number.isFinite(scale) && scale > 0 ? scale : 1);
}

function createInertiaTracker(isModernDocument: boolean) {
    const startTime = performance.now();
    let lastMoveTime = startTime;
    const history: Array<{ x: number; y: number }> = [];
    const displacement = { x: 0, y: 0 };

    return {
        track(deltaX: number, deltaY: number): void {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastMoveTime;
            lastMoveTime = currentTime;
            if (deltaTime <= 0) {
                return;
            }

            const scrollDeltaX = isModernDocument ? 0 : -deltaX;
            const scrollDeltaY = -deltaY;
            history.push({
                x: scrollDeltaX / deltaTime * 16,
                y: scrollDeltaY / deltaTime * 16,
            });
            if (history.length > 5) {
                history.shift();
            }
            displacement.x += Math.abs(scrollDeltaX);
            displacement.y += Math.abs(scrollDeltaY);
        },
        getVelocity: () => calculateInertiaVelocity(history, performance.now() - startTime, displacement),
    };
}

function calculateInertiaVelocity(
    history: Array<{ x: number; y: number }>,
    duration: number,
    displacement: { x: number; y: number }
): { x: number; y: number } {
    if (history.length === 0) {
        return { x: 0, y: 0 };
    }

    let totalWeight = 0;
    let velocityX = 0;
    let velocityY = 0;
    history.forEach((sample, index) => {
        const weight = (index + 1) ** 2;
        totalWeight += weight;
        velocityX += sample.x * weight;
        velocityY += sample.y * weight;
    });
    velocityX /= totalWeight;
    velocityY /= totalWeight;

    const distance = Math.hypot(displacement.x, displacement.y);
    const speed = Math.hypot(velocityX, velocityY);
    const swipeSpeed = duration > 0 ? distance / duration : 0;
    const isFlick = duration < 240 && distance > 30;
    let multiplier = 0.05 * (0.5 + Math.min(speed / 5, 1) * 0.5);
    if (isFlick) {
        multiplier = 0.05 + (0.26 - 0.05) * Math.min(swipeSpeed / 2, 1);
        if (duration < 150 && speed > 3) {
            multiplier *= 1.3;
        }
    }
    multiplier = Math.max(0.025, Math.min(0.39, multiplier));

    return displacement.x > displacement.y
        ? { x: velocityX * multiplier, y: 0 }
        : { x: 0, y: velocityY * multiplier };
}
