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

import type { DocumentDataModel, ICommandInfo, Workbook } from '@univerjs/core';
import type { Engine, IRenderContext, IRenderModule, IWheelEvent, Scene, Viewport } from '@univerjs/engine-render';
import type { IDocPageSetupCommandParams } from '../../commands/commands/doc-page-setup.command';
import type { ISetDocZoomRatioOperationParams } from '../../commands/operations/set-doc-zoom-ratio.operation';
import {
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    FOCUSING_DOC,
    fromEventSubject,
    ICommandService,
    IContextService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    Optional,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { getNextWheelZoomRatio, IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { MOBILE_UI_MODE, MobileZoomIndicator } from '@univerjs/ui';
import { animationFrameScheduler, throttleTime } from 'rxjs';
import { neoGetDocObject } from '../../basics/component-tools';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { DocPageSetupCommand } from '../../commands/commands/doc-page-setup.command';
import { SetDocZoomRatioCommand } from '../../commands/commands/set-doc-zoom-ratio.command';
import { SwitchDocModeCommand } from '../../commands/commands/switch-doc-mode.command';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { MOBILE_DOC_PINCH_ZOOMING } from '../../consts/mobile-context';
import { IDocEmbedInteractionBoundaryService } from '../../services/doc-embed-integration.service';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../services/doc-view-scale';
import { DEFAULT_MODERN_DOC_ZOOM_RATIO, getDocEffectiveZoomRatio } from '../../services/doc-zoom';
import { IEditorService } from '../../services/editor/editor-manager.service';

const MOBILE_DOC_ZOOM_MIN = 0.5;
const MOBILE_DOC_ZOOM_MAX = 3;

export function resolveMobileDocPinchZoomRatio(
    initialZoomRatio: number,
    initialDistance: number,
    currentDistance: number
): number {
    if (initialDistance <= 0 || !Number.isFinite(currentDistance)) {
        return initialZoomRatio;
    }

    const ratio = initialZoomRatio * currentDistance / initialDistance;
    return Math.round(Math.max(MOBILE_DOC_ZOOM_MIN, Math.min(MOBILE_DOC_ZOOM_MAX, ratio)) * 100) / 100;
}

export function shouldHandleDocWheelZoom(
    event: Pick<IWheelEvent, 'ctrlKey' | 'metaKey'>,
    focusingDoc: boolean,
    _documentFlavor?: DocumentFlavor
): boolean {
    return focusingDoc && (event.ctrlKey || event.metaKey);
}

interface IMobileDocPinchZoomGestureOptions {
    canvasElement: HTMLCanvasElement;
    commandService: ICommandService;
    contextService: IContextService;
    docViewScaleService: DocViewScaleService;
    engine: Engine;
    scene: Scene;
    textSelectionManagerService: DocSelectionManagerService;
    unitId: string;
    viewport: Viewport;
}

class MobileDocPinchZoomGesture extends Disposable {
    private readonly _zoomIndicator: MobileZoomIndicator;
    private _gestureOwned = false;
    private _pinchZooming = false;
    private _initialDistance = 0;
    private _initialZoomRatio = 1;
    private _anchor = Vector2.Zero();

    constructor(private readonly _options: IMobileDocPinchZoomGestureOptions) {
        super();

        const { canvasElement } = _options;
        this._zoomIndicator = new MobileZoomIndicator(canvasElement);
        this.disposeWithMe(this._zoomIndicator);
        canvasElement.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        canvasElement.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        canvasElement.addEventListener('touchend', this._handleTouchEnd, { passive: false });
        canvasElement.addEventListener('touchcancel', this._handleTouchCancel, { passive: false });
        this.disposeWithMe(toDisposable(() => {
            canvasElement.removeEventListener('touchstart', this._handleTouchStart);
            canvasElement.removeEventListener('touchmove', this._handleTouchMove);
            canvasElement.removeEventListener('touchend', this._handleTouchEnd);
            canvasElement.removeEventListener('touchcancel', this._handleTouchCancel);
            this._finishPinch();
        }));
    }

    private readonly _handleTouchStart = (event: TouchEvent): void => {
        const { contextService, docViewScaleService, scene, viewport } = this._options;
        if (event.touches.length !== 2 || scene.objectsEvented === false) {
            return;
        }

        this._gestureOwned = true;
        this._pinchZooming = true;
        contextService.setContextValue(MOBILE_DOC_PINCH_ZOOMING, true);
        const [touch1, touch2] = event.touches;
        this._initialDistance = this._getTouchDistance(touch1, touch2);
        this._initialZoomRatio = docViewScaleService.getUserZoomRatio();
        this._anchor = viewport.transformVector2SceneCoord(this._getPinchCenter(touch1, touch2));
        this._zoomIndicator.show(Math.round(this._initialZoomRatio * 100));
        event.preventDefault();
    };

    private readonly _handleTouchMove = (event: TouchEvent): void => {
        if (!this._gestureOwned || !this._pinchZooming || event.touches.length !== 2) {
            return;
        }

        const { commandService, docViewScaleService, unitId, viewport } = this._options;
        const [touch1, touch2] = event.touches;
        const nextZoomRatio = resolveMobileDocPinchZoomRatio(
            this._initialZoomRatio,
            this._initialDistance,
            this._getTouchDistance(touch1, touch2)
        );
        if (Math.abs(nextZoomRatio - docViewScaleService.getUserZoomRatio()) >= 0.01) {
            commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId, zoomRatio: nextZoomRatio });
        }

        const currentPoint = viewport.transformVector2SceneCoord(this._getPinchCenter(touch1, touch2));
        viewport.scrollByViewportDeltaVal({
            viewportScrollX: this._anchor.x - currentPoint.x,
            viewportScrollY: this._anchor.y - currentPoint.y,
        });
        this._zoomIndicator.show(Math.round(nextZoomRatio * 100));
        event.preventDefault();
    };

    private readonly _handleTouchEnd = (event: TouchEvent): void => {
        if (!this._gestureOwned) {
            return;
        }
        if (event.touches.length < 2 && this._pinchZooming) {
            this._pinchZooming = false;
            this._zoomIndicator.hide();
        }
        if (event.touches.length === 0) {
            this._finishPinch();
        }
    };

    private readonly _handleTouchCancel = (): void => this._finishPinch();

    private _getTouchPoint(touch: Touch): Vector2 {
        const { canvasElement, engine } = this._options;
        const rect = canvasElement.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
            return Vector2.FromArray([touch.clientX - rect.left, touch.clientY - rect.top]);
        }

        return Vector2.FromArray([
            (touch.clientX - rect.left) * engine.width / rect.width,
            (touch.clientY - rect.top) * engine.height / rect.height,
        ]);
    }

    private _getPinchCenter(touch1: Touch, touch2: Touch): Vector2 {
        const first = this._getTouchPoint(touch1);
        const second = this._getTouchPoint(touch2);
        return Vector2.FromArray([(first.x + second.x) / 2, (first.y + second.y) / 2]);
    }

    private _getTouchDistance(touch1: Touch, touch2: Touch): number {
        const first = this._getTouchPoint(touch1);
        const second = this._getTouchPoint(touch2);
        return Math.hypot(first.x - second.x, first.y - second.y);
    }

    private _finishPinch(): void {
        if (!this._gestureOwned) {
            return;
        }
        this._gestureOwned = false;
        this._pinchZooming = false;
        this._options.contextService.setContextValue(MOBILE_DOC_PINCH_ZOOMING, false);
        this._zoomIndicator.hide();
        this._options.textSelectionManagerService.refreshSelection();
    }
}

export class DocZoomRenderController extends Disposable implements IRenderModule {
    private _isSheetEditor = false;
    private _initTimer: number;
    private _updateTimer: number;
    private _fitToWidthAvailableWidth = 0;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IContextService private readonly _contextService: IContextService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocViewScaleService) private readonly _docViewScaleService: DocViewScaleService,
        @Optional(IDocEmbedInteractionBoundaryService) private readonly _embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService
    ) {
        super();

        this._initSkeletonListener();
        this._initCommandExecutedListener();
        this._initFitToWidthResizeListener();
        this._isSheetEditor = this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        const currentSheet = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const sheetRenderer = currentSheet && this._renderManagerService.getRenderUnitById(currentSheet.getUnitId());
        // TODO: do not use setTimeout.
        this._initTimer = window.setTimeout(() => {
            const zoomRatio = sheetRenderer && this._isSheetEditor
                ? sheetRenderer.scene.scaleX
                : getDocEffectiveZoomRatio(this._context.unit);

            this.updateViewZoom(zoomRatio, true);
        }, 20);

        if (!isInternalEditorID(this._context.unitId)) {
            this._initZoomEventListener();
            this._initMobilePinchZoom();
        }
    }

    override dispose() {
        window.clearTimeout(this._initTimer);
        window.clearTimeout(this._updateTimer);
    }

    private _initSkeletonListener() {
        this.disposeWithMe(this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const documentModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            if (!documentModel) return;

            this._updateTimer = window.setTimeout(() => {
                const currentSheet = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                const sheetRenderer = currentSheet && this._renderManagerService.getRenderUnitById(currentSheet.getUnitId());
                const zoomRatio = !this._isSheetEditor ? getDocEffectiveZoomRatio(documentModel) : sheetRenderer?.scene.scaleX || 1;

                this.updateViewZoom(zoomRatio, false);
            });
        }));
    }

    private _initCommandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id) && (command.params as ISetDocZoomRatioOperationParams).unitId === this._context.unitId) {
                const documentModel = this._context.unit;
                const zoomRatio = getDocEffectiveZoomRatio(documentModel);
                this.updateViewZoom(
                    zoomRatio,
                    !this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)
                );
            }
        }));

        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                const shouldResetZoom = command.id === SwitchDocModeCommand.id ||
                    (command.id === DocPageSetupCommand.id && (command.params as IDocPageSetupCommandParams | undefined)?.documentFlavor === DocumentFlavor.MODERN);

                if (shouldResetZoom) {
                    this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                        zoomRatio: DEFAULT_MODERN_DOC_ZOOM_RATIO,
                        documentId: this._context.unitId,
                    });
                }
            })
        );
    }

    private _initFitToWidthResizeListener(): void {
        this.disposeWithMe(fromEventSubject(this._context.engine.onTransformChange$).pipe(
            throttleTime(0, animationFrameScheduler)
        ).subscribe(() => {
            if (this._docViewScaleService.getOptions().mode !== 'fit-width') {
                return;
            }

            const availableWidth = this._docViewScaleService.getAvailableWidth();
            if (availableWidth <= 1 || Math.abs(availableWidth - this._fitToWidthAvailableWidth) < 1) {
                return;
            }

            this._fitToWidthAvailableWidth = availableWidth;
            this.updateViewZoom(getDocEffectiveZoomRatio(this._context.unit), false);
        }));
    }

    updateViewZoom(zoomRatio: number, needRefreshSelection = true) {
        const docObject = neoGetDocObject(this._context);
        const viewScale = this._docViewScaleService.getViewScale(zoomRatio);
        const viewScaleChanged = docObject.scene.scaleX !== viewScale || docObject.scene.scaleY !== viewScale;
        docObject.scene.scale(viewScale, viewScale);

        if (!this._editorService.isEditor(this._context.unitId)) {
            this._docPageLayoutService.calculatePagePosition();
        }

        if (
            needRefreshSelection &&
            !this._editorService.isEditor(this._context.unitId) &&
            !this._embedInteractionBoundaryService?.hasRecentInteraction()
        ) {
            this._textSelectionManagerService.refreshSelection();
        }

        if (needRefreshSelection && viewScaleChanged && !isInternalEditorID(this._context.unitId)) {
            docObject.scene.getTransformer()?.clearSelectedObjects();
        }

        const createOptions = this._univerInstanceService.getUnitCreateOptions(this._context.unitId);
        if (createOptions?.embeddedRender === true || createOptions?.skipAutoRender === true) {
            this._context.scene.makeDirty();
            this._context.scene.render();
        }
    }

    private _initZoomEventListener() {
        const scene = this._context.scene;

        this.disposeWithMe(
            // hold ctrl & mousewheel ---> zoom
            scene.onMouseWheel$.subscribeEvent((e: IWheelEvent) => {
                const documentModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                if (!documentModel) {
                    return;
                }

                const { documentFlavor } = documentModel.getSnapshot().documentStyle;
                if (!shouldHandleDocWheelZoom(e, Boolean(this._contextService.getContextValue(FOCUSING_DOC)), documentFlavor)) {
                    return;
                }

                const currentRatio = getDocEffectiveZoomRatio(documentModel);
                const nextRatio = getNextWheelZoomRatio(currentRatio, e);

                this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                    zoomRatio: nextRatio,
                    documentId: documentModel.getUnitId(),
                });

                e.preventDefault();
            })
        );
    }

    private _initMobilePinchZoom(): void {
        if (
            !this._contextService.getContextValue(MOBILE_UI_MODE) ||
            this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL
        ) {
            return;
        }

        const scene = this._context.scene;
        const engine = scene.getEngine();
        const canvasElement = engine?.getCanvasElement();
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (engine == null || canvasElement == null || viewport == null) {
            return;
        }

        this.disposeWithMe(new MobileDocPinchZoomGesture({
            canvasElement,
            commandService: this._commandService,
            contextService: this._contextService,
            docViewScaleService: this._docViewScaleService,
            engine,
            scene,
            textSelectionManagerService: this._textSelectionManagerService,
            unitId: this._context.unitId,
            viewport,
        }));
    }
}
