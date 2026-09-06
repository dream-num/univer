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
import type { ISetDocZoomRatioOperationParams } from '../../commands/operations/set-doc-zoom-ratio.operation';
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
import { ContextMenuPosition, IContextMenuService, MOBILE_UI_MODE } from '@univerjs/ui';
import { filter, fromEvent, take } from 'rxjs';
import { neoGetDocObject } from '../../basics/component-tools';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { findFirstCursorOffset } from '../../basics/selection';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { MOBILE_DOC_PINCH_ZOOMING } from '../../consts/mobile-context';
import {
    DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    IDocEmbedInteractionBoundaryService,
    IDocEmbedRuntimeFocusCoordinator,
} from '../../services/doc-embed-integration.service';
import { DocMobileElementMenuService } from '../../services/doc-mobile-element-menu.service';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export class DocSelectionRenderController extends Disposable implements IRenderModule {
    private static readonly _mobileDoubleTapInterval = 450;
    private static readonly _mobileDoubleTapDistance = 28;
    private static readonly _mobileDragThreshold = 12;
    private static readonly _mobileInertiaDecelerationRate = 0.992;
    private static readonly _mobileInertiaMinVelocity = 0.22;
    private static readonly _mobileInertiaMaxVelocity = 12;
    private _loadedMap = new WeakSet<RenderComponentType>();
    private _deferredEditorFocusTimer: ReturnType<typeof setTimeout> | null = null;
    private _mobileGestureTimer: ReturnType<typeof setTimeout> | null = null;
    private _mobileGestureDisposables: Array<{ unsubscribe(): void }> = [];
    private _lastMobileTap: { x: number; y: number; time: number } | null = null;
    private _mobileInertiaAnimationId: number | null = null;
    private _mobileInertiaLastFrameTime = 0;
    private _mobileInertiaVelocity = { x: 0, y: 0 };
    private _initialSelectionReady = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
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

    private _initialize() {
        this._init();
        this._refreshListener();
        this._syncSelection();
        this._skeletonListener();
        this._commandExecutedListener();
    }

    private _init() {
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

    private _refreshListener() {
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

    private _syncSelection() {
        this.disposeWithMe(
            this._docSelectionRenderService.textSelectionInner$
                .subscribe((params) => {
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

    private _initialMain(unitId: string) {
        const docObject = neoGetDocObject(this._context);
        const { document, scene } = docObject;
        // Internal editors (comments, links, etc.) are inputs, not documents with a reading mode.
        const isMobile = this._contextService.getContextValue(MOBILE_UI_MODE) && !isInternalEditorID(unitId);
        if (isMobile) {
            this._docSelectionRenderService.exitMobileEditMode();
        }
        if (this._contextService.getContextValue(MOBILE_UI_MODE)) {
            this.disposeWithMe(fromEvent<MouseEvent>(this._context.engine.getCanvasElement(), 'mousedown').subscribe((event) => {
                // WebKit can dispatch a compatibility mousedown after the touch tap
                // focuses the input. Keep its default action from focusing the canvas.
                if (event.button === 0 && this._docSelectionRenderService.isFocusing) {
                    event.preventDefault();
                }
            }));
        }
        if (isMobile) {
            this.disposeWithMe(scene.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                if (evt.cancelable) {
                    evt.preventDefault();
                }
                const { offsetX, offsetY } = this._getMobileDocumentOffset(evt);
                this._startMobileGesture(
                    evt,
                    this._docSelectionRenderService.isMobileEditMode,
                    { offsetX, offsetY },
                    false
                );
                state.stopPropagation();
            }));
        }
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
            if (this._isEditorReadOnly(unitId)) {
                return;
            }
            if (this._isEmbedInteractionEvent(evt, unitId)) {
                return;
            }

            // FIXME:@Jocs: editor status should not be coupled with the instance service.
            const docDataModel = this._instanceSrv.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            if (docDataModel?.getUnitId() !== unitId) {
                this._instanceSrv.setCurrentUnitForType(unitId);
            }
            // Host-owned editors need the current Doc unit for editing commands without replacing the host's global focus.
            const isSheetEditor = unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY || unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;
            if (!isSheetEditor && !this._editorService.getEditorRenderConfig(unitId)?.preserveHostFocus) {
                this._instanceSrv.focusUnit(unitId);
            }

            const { offsetX, offsetY } = isMobile ? this._getMobileDocumentOffset(evt) : evt;
            this._syncEditArea(offsetX, offsetY);

            if (isMobile) {
                if (evt.cancelable) {
                    evt.preventDefault();
                }
                this._startMobileGesture(
                    evt,
                    this._docSelectionRenderService.isMobileEditMode,
                    { offsetX, offsetY }
                );
                if (evt.button !== 2) {
                    state.stopPropagation();
                }
                return;
            }

            const shouldFocusInput = !isMobile || this._docSelectionRenderService.isEditing;
            this._docSelectionRenderService.__onPointDown(evt, shouldFocusInput);

            if (shouldFocusInput && this._editorService.getEditor(unitId)) {
                /**
                 * To accommodate focus switching between different editors.
                 * Since the editor for Univer is canvas-based,
                 * it primarily relies on focus and cannot use the focus event.
                 * Our editor's focus monitoring is based on PointerDown.
                 * The order of occurrence is such that PointerDown comes first.
                 * Translate the above text into English.
                 */
                this._setEditorFocus(unitId);
                const { offsetX, offsetY } = evt;

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
            if (this._isEditorReadOnly(unitId)) {
                return;
            }
            if (this._isEmbedInteractionEvent(evt, unitId)) {
                return;
            }

            if (isMobile) {
                // Mobile taps are handled on pointer up, including double-tap editing.
                return;
            }

            if (this._editorService.getEditor(unitId)) {
                this._setEditorFocus(unitId);
            }
            this._docSelectionRenderService.__handleDblClick(evt);
        }));

        this.disposeWithMe(document.onTripleClick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            if (isMobile || this._isEditorReadOnly(unitId)) {
                return;
            }
            if (this._isEmbedInteractionEvent(evt, unitId)) {
                return;
            }

            this._docSelectionRenderService.__handleTripleClick(evt);
        }));
    }

    override dispose(): void {
        this._clearMobileGesture();
        this._stopMobileInertia();
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

    private _startMobileGesture(
        evt: IPointerEvent | IMouseEvent,
        startedWhileEditing: boolean,
        documentOffset: { offsetX: number; offsetY: number },
        allowTextInteraction = true
    ): void {
        this._clearMobileGesture();
        this._stopMobileInertia();
        const elementTarget = allowTextInteraction ? this._mobileElementMenuService.takeTarget(this._context.unitId) : null;
        this._mobileElementMenuService.close();
        if (this._contextMenuService.visible) {
            this._contextMenuService.hideContextMenu();
        }
        const scene = this._context.scene;
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN) ?? scene.getViewports()[0];
        const isModernDocument = this._context.unit.getSnapshot().documentStyle.documentFlavor === DocumentFlavor.MODERN;
        const { x: startX, y: startY } = getMobileGesturePoint(evt);
        let [previousX, previousY] = [startX, startY];
        let moved = false;
        let selected = false;
        const inertiaTracker = createMobileInertiaTracker(isModernDocument);
        const activeRange = this._docSelectionRenderService.getActiveTextRange();
        const activeOffset = activeRange?.collapsed ? activeRange.startOffset ?? null : null;
        const inputWasFocused = this._docSelectionRenderService.isFocusing;

        if (allowTextInteraction && !elementTarget?.onTap && !elementTarget?.onDrag) {
            this._mobileGestureTimer = setTimeout(() => {
                this._mobileGestureTimer = null;
                if (this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                    return;
                }
                selected = true;
                this._selectMobileWord(evt, startedWhileEditing);
            }, 420);
        }

        const moveDisposable = scene.onPointerMove$.subscribeEvent((moveEvent: IPointerEvent | IMouseEvent) => {
            if (selected || this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                return;
            }
            const { x: moveX, y: moveY } = getMobileGesturePoint(moveEvent);
            const deltaX = moveX - previousX;
            const deltaY = moveY - previousY;
            if (
                !moved &&
                Math.hypot(moveX - startX, moveY - startY) <
                    DocSelectionRenderController._mobileDragThreshold
            ) {
                return;
            }

            moved = true;
            this._lastMobileTap = null;
            this._clearMobileGestureTimer();
            if (elementTarget?.onDrag) {
                elementTarget.onDrag(moveEvent);
            } else {
                this._scrollMobileDocument(viewport, isModernDocument, deltaX, deltaY);
                inertiaTracker.track(deltaX, deltaY);
            }
            previousX = moveX;
            previousY = moveY;
        });
        const upDisposable = scene.onPointerUp$.subscribeEvent(() => {
            if (this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                this._clearMobileGesture();
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
                    this._handleMobileTap(evt, documentOffset, startedWhileEditing, inputWasFocused, activeOffset);
                }
            }
            if (moved && !elementTarget?.onDrag) {
                this._startMobileInertia(viewport, inertiaTracker.getVelocity());
            }
            this._clearMobileGesture();
        });
        const cancelDisposable = scene.onPointerCancel$.subscribeEvent(() => this._clearMobileGesture());
        this._mobileGestureDisposables = [moveDisposable, upDisposable, cancelDisposable];
    }

    private _handleMobileTap(
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
                this._showMobileCaretMenu(evt);
            }
            return;
        }

        const now = Date.now();
        const lastTap = this._lastMobileTap;
        const isDoubleTap = lastTap != null &&
            now - lastTap.time <= DocSelectionRenderController._mobileDoubleTapInterval &&
            Math.hypot(offsetX - lastTap.x, offsetY - lastTap.y) <= DocSelectionRenderController._mobileDoubleTapDistance;
        if (isDoubleTap) {
            this._lastMobileTap = null;
            this._enterMobileEditing(this._context.unitId, evt);
        } else {
            this._lastMobileTap = { x: offsetX, y: offsetY, time: now };
        }
    }

    private _selectMobileWord(evt: IPointerEvent | IMouseEvent, startedWhileEditing: boolean): void {
        this._context.scene.getTransformer()?.clearSelectedObjects();
        this._lastMobileTap = null;
        this._docSelectionRenderService.__handleDblClick(evt, false, false);
        if (startedWhileEditing) {
            this._docSelectionRenderService.suspendMobileEditingInput();
        }
    }

    private _scrollMobileDocument(
        viewport: ReturnType<IRenderContext<DocumentDataModel>['scene']['getViewports']>[number] | undefined,
        isModernDocument: boolean,
        deltaX: number,
        deltaY: number
    ): void {
        const { scaleX, scaleY } = this._context.scene;
        viewport?.scrollByViewportDeltaVal({
            viewportScrollX: isModernDocument ? 0 : normalizeMobileScrollDelta(-deltaX, scaleX),
            viewportScrollY: normalizeMobileScrollDelta(-deltaY, scaleY),
        });
    }

    private _startMobileInertia(
        viewport: ReturnType<IRenderContext<DocumentDataModel>['scene']['getViewports']>[number] | undefined,
        velocity: { x: number; y: number }
    ): void {
        const maxVelocity = DocSelectionRenderController._mobileInertiaMaxVelocity;
        this._mobileInertiaVelocity = {
            x: Math.max(-maxVelocity, Math.min(maxVelocity, velocity.x)),
            y: Math.max(-maxVelocity, Math.min(maxVelocity, velocity.y)),
        };
        if (Math.hypot(this._mobileInertiaVelocity.x, this._mobileInertiaVelocity.y) <= DocSelectionRenderController._mobileInertiaMinVelocity * 2) {
            return;
        }

        this._mobileInertiaLastFrameTime = 0;
        const scroll = (currentTime: number) => {
            if (this._mobileInertiaLastFrameTime === 0) {
                this._mobileInertiaLastFrameTime = currentTime;
                this._mobileInertiaAnimationId = requestAnimationFrame(scroll);
                return;
            }

            const deltaTime = currentTime - this._mobileInertiaLastFrameTime;
            this._mobileInertiaLastFrameTime = currentTime;
            const decelerationRate = DocSelectionRenderController._mobileInertiaDecelerationRate;
            const decelerationFactor = decelerationRate ** deltaTime;
            this._mobileInertiaVelocity.x *= decelerationFactor;
            this._mobileInertiaVelocity.y *= decelerationFactor;
            const dampingFactor = -Math.log(decelerationRate);
            const { scaleX, scaleY } = this._context.scene;
            viewport?.scrollByViewportDeltaVal({
                viewportScrollX: normalizeMobileScrollDelta(
                    this._mobileInertiaVelocity.x * (1 - decelerationFactor) / dampingFactor,
                    scaleX
                ),
                viewportScrollY: normalizeMobileScrollDelta(
                    this._mobileInertiaVelocity.y * (1 - decelerationFactor) / dampingFactor,
                    scaleY
                ),
            });

            if (Math.hypot(this._mobileInertiaVelocity.x, this._mobileInertiaVelocity.y) > DocSelectionRenderController._mobileInertiaMinVelocity) {
                this._mobileInertiaAnimationId = requestAnimationFrame(scroll);
            } else {
                this._mobileInertiaAnimationId = null;
                this._mobileInertiaLastFrameTime = 0;
            }
        };
        this._mobileInertiaAnimationId = requestAnimationFrame(scroll);
    }

    private _stopMobileInertia(): void {
        if (this._mobileInertiaAnimationId != null) {
            cancelAnimationFrame(this._mobileInertiaAnimationId);
        }
        this._mobileInertiaAnimationId = null;
        this._mobileInertiaLastFrameTime = 0;
        this._mobileInertiaVelocity = { x: 0, y: 0 };
    }

    private _enterMobileEditing(unitId: string, evt: IPointerEvent | IMouseEvent): void {
        if (this._editorService.getEditor(unitId)) {
            this._setEditorFocus(unitId);
        }
        this._docSelectionRenderService.enterMobileEditMode();
        const { offsetX, offsetY } = this._getMobileDocumentOffset(evt);
        this._docSelectionRenderService.setCursorManually(offsetX, offsetY, true, true, { strict: false });
    }

    private _getMobileDocumentOffset(evt: IPointerEvent | IMouseEvent): { offsetX: number; offsetY: number } {
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

    private _showMobileCaretMenu(evt: IPointerEvent | IMouseEvent): void {
        const point = getEventClientPoint(evt, null);
        this._contextMenuService.triggerContextMenu({
            clientX: point?.clientX ?? evt.offsetX,
            clientY: point?.clientY ?? evt.offsetY,
            stopPropagation() {},
        }, ContextMenuPosition.DOC_CARET, {
            unitId: this._context.unitId,
            subUnitId: this._context.unitId,
        });
    }

    private _clearMobileGestureTimer(): void {
        if (this._mobileGestureTimer == null) {
            return;
        }
        clearTimeout(this._mobileGestureTimer);
        this._mobileGestureTimer = null;
    }

    private _clearMobileGesture(): void {
        this._clearMobileGestureTimer();
        this._mobileGestureDisposables.forEach((disposable) => disposable.unsubscribe());
        this._mobileGestureDisposables = [];
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const docObject = neoGetDocObject(this._context);
        const { document, scene } = docObject;
        const { documentTransform } = document.getOffsetConfig();
        const activeViewport = scene.getViewports()[0];

        if (activeViewport == null) {
            return;
        }

        const originCoord = activeViewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _isEditorReadOnly(unitId: string) {
        const editor = this._editorService.getEditor(unitId);
        if (!editor) {
            return false;
        }

        return editor.isReadOnly();
    }

    private _setEditorFocus(unitId: string) {
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

    private _commandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id)) {
                const params = command.params as ISetDocZoomRatioOperationParams;
                const { unitId: documentId } = params;

                if (this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)) {
                    return;
                }

                const unitId = this._docSelectionManagerService.__getCurrentSelection()?.unitId;

                if (documentId !== unitId) {
                    return;
                }

                if (this._isEmbedChildInteractionActive(documentId)) {
                    return;
                }

                this._docSelectionManagerService.refreshSelection();
            }
        })
        );
    }

    private _skeletonListener() {
        // Change text selection runtime(skeleton, scene) and update text selection manager current selection.
        this.disposeWithMe(this._docSkeletonManagerService.currentSkeleton$.subscribe((skeleton) => {
            if (!skeleton || this._initialSelectionReady) return;

            const { unitId } = this._context;
            const isInternalEditor = isInternalEditorID(unitId);

            // The initial cursor is set at the beginning of the document,
            // and can be set to the previous cursor position in the future.
            // The skeleton of the editor has not been calculated at this moment, and it is determined whether it is an editor by its ID.
            if (!isInternalEditor) {
                if (this._isEmbedChildInteractionActive(unitId)) {
                    return;
                }
                this._initialSelectionReady = true;

                //TODO: @JOCS Only for docs. move to docs in the future.
                if (!this._contextService.getContextValue(MOBILE_UI_MODE)) {
                    this._docSelectionRenderService.focus();
                }
                const docDataModel = this._context.unit;
                const snapshot = docDataModel.getSnapshot();
                const offset = findFirstCursorOffset(snapshot);
                const selectionTarget = {
                    unitId,
                    subUnitId: unitId,
                };
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
            }
        }));
    }
}

function isEmbedInteractionEvent(evt: IPointerEvent | IMouseEvent): boolean {
    const target = (evt as Event).target;
    if (typeof Element !== 'undefined' && target instanceof Element && target.closest(`[${DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null) {
        return true;
    }

    if (typeof document === 'undefined') {
        return false;
    }

    const point = getEventClientPoint(evt, target);
    const clientX = point?.clientX;
    const clientY = point?.clientY;
    if (typeof clientX !== 'number' || typeof clientY !== 'number' || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
        return false;
    }

    if (typeof document.elementFromPoint !== 'function') {
        return false;
    }

    return document.elementFromPoint(clientX, clientY)?.closest(`[${DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null;
}

function getEventClientPoint(evt: IPointerEvent | IMouseEvent, target: EventTarget | null): { clientX: number; clientY: number } | undefined {
    if (Number.isFinite(evt.clientX) && Number.isFinite(evt.clientY)) {
        return { clientX: evt.clientX, clientY: evt.clientY };
    }

    if (typeof Element !== 'undefined' && target instanceof Element && Number.isFinite(evt.offsetX) && Number.isFinite(evt.offsetY)) {
        const rect = target.getBoundingClientRect();
        return {
            clientX: rect.left + evt.offsetX,
            clientY: rect.top + evt.offsetY,
        };
    }

    if (Number.isFinite(evt.x) && Number.isFinite(evt.y)) {
        return { clientX: evt.x, clientY: evt.y };
    }

    return undefined;
}

function getMobileGesturePoint(evt: IPointerEvent | IMouseEvent): { x: number; y: number } {
    const point = getEventClientPoint(evt, null);
    return {
        x: point?.clientX ?? evt.offsetX,
        y: point?.clientY ?? evt.offsetY,
    };
}

function normalizeMobileScrollDelta(delta: number, scale: number): number {
    return delta / (Number.isFinite(scale) && scale > 0 ? scale : 1);
}

function createMobileInertiaTracker(isModernDocument: boolean) {
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
        getVelocity: () => calculateMobileInertiaVelocity(history, performance.now() - startTime, displacement),
    };
}

function calculateMobileInertiaVelocity(
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
