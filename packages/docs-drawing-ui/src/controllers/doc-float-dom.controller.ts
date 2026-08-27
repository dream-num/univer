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

import type { DocumentDataModel, IDisposable, IDrawingSearch, ITransformState, Nullable } from '@univerjs/core';
import type { IDocFloatDom, IInsertDocDrawingCommandParams } from '@univerjs/docs-drawing';
import type { ISetDocZoomRatioOperationParams } from '@univerjs/docs-ui';
import type { IDocFloatDomDataBase } from '@univerjs/drawing';
import type { IBoundRectNoAngle, IDocsCustomBlockRenderViewport, IRender, Rect, Scene } from '@univerjs/engine-render';
import type { IFloatDomLayout } from '@univerjs/ui';
import {
    Disposable,
    DisposableCollection,
    DrawingTypeEnum,
    fromEventSubject,
    generateRandomId,
    ICommandService,
    Inject,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { docDrawingPositionToTransform, DocSkeletonManagerService, isSheetLikeDocsCustomBlockChildType } from '@univerjs/docs';
import { InsertDocDrawingCommand } from '@univerjs/docs-drawing';
import { SetDocZoomRatioOperation, VIEWPORT_KEY } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import { CanvasFloatDomService } from '@univerjs/ui';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';
import { DocRefreshDrawingsService } from '../services/doc-refresh-drawings.service';

export function calcDocFloatDomPositionByRect(
    rect: IBoundRectNoAngle,
    scene: Scene,
    opacity = 1,
    angle = 0
): IFloatDomLayout {
    const { top, left, bottom, right } = rect;
    const width = right - left;
    const height = bottom - top;

    const viewMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!;
    const { viewportScrollX, viewportScrollY } = viewMain;
    const { scaleX, scaleY } = scene.getAncestorScale();

    return {
        startX: (left - viewportScrollX) * scaleX,
        startY: (top - viewportScrollY) * scaleY,
        endX: (left + width - viewportScrollX) * scaleX,
        endY: (top + height - viewportScrollY) * scaleY,
        width: width * scaleX,
        height: height * scaleY,
        rotate: angle,
        absolute: {
            left: false,
            top: false,
        },
        opacity: opacity ?? 1,
    };
}

function calcDocFloatDomPosition(
    object: Rect,
    renderUnit: IRender
): IFloatDomLayout {
    const { top, left, width, height, angle, opacity } = object;
    return calcDocFloatDomPositionByRect({ top, left, bottom: top + height, right: left + width }, renderUnit.scene, opacity, angle);
}

interface ICanvasFloatDomInfo {
    position$: BehaviorSubject<IFloatDomLayout>;
    dispose: IDisposable;
    preserveRuntimeGeometry?: boolean;
    rect: Rect;
    runtimeTransform?: Partial<ITransformState>;
    runtimeViewport?: IDocFloatDomRuntimeViewport;
    unitId: string;
}

interface IDocFloatDomParams extends IDocFloatDomDataBase {
}

type IDocFloatDomRuntimeViewport = Partial<Pick<IDocsCustomBlockRenderViewport, 'bleedLeft' | 'bleedWidth' | 'contentHeight' | 'contentWidth' | 'height' | 'pageContentWidth' | 'viewScale' | 'viewportHeight'>>;

interface IDocFloatDomRuntimeGeometry {
    customBlockRenderViewport?: IDocFloatDomRuntimeViewport;
    hidden?: boolean;
    transform?: Nullable<ITransformState>;
    transforms?: Nullable<ITransformState[]>;
}

export function mergeDocFloatDomRuntimeProps(existingProps: Record<string, unknown> | undefined, param: IDocFloatDomRuntimeGeometry): Record<string, unknown> | undefined {
    const customBlockRenderViewport = pickValidCustomBlockRenderViewport(param.customBlockRenderViewport);
    if (!customBlockRenderViewport) {
        return existingProps;
    }

    return {
        ...existingProps,
        customBlockRenderViewport,
    };
}

function pickValidCustomBlockRenderViewport(viewport: IDocFloatDomRuntimeViewport | undefined): IDocFloatDomRuntimeViewport | undefined {
    const result: IDocFloatDomRuntimeViewport = {};

    if (isNonNegativeNumber(viewport?.bleedLeft)) {
        result.bleedLeft = viewport!.bleedLeft;
    }
    if (isPositiveNumber(viewport?.bleedWidth)) {
        result.bleedWidth = viewport!.bleedWidth;
    }
    if (isPositiveNumber(viewport?.contentHeight)) {
        result.contentHeight = viewport!.contentHeight;
    }
    if (isPositiveNumber(viewport?.contentWidth)) {
        result.contentWidth = viewport!.contentWidth;
    }
    if (isPositiveNumber(viewport?.height)) {
        result.height = viewport!.height;
    }
    if (isPositiveNumber(viewport?.pageContentWidth)) {
        result.pageContentWidth = viewport!.pageContentWidth;
    }
    const viewScale = viewport?.viewScale;
    if (isPositiveNumber(viewScale)) {
        result.viewScale = viewScale;
    }
    if (isPositiveNumber(viewport?.viewportHeight)) {
        result.viewportHeight = viewport!.viewportHeight;
    }

    return Object.keys(result).length ? result : undefined;
}

function isPositiveNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export class DocFloatDomController extends Disposable {
    private _domLayerInfoMap = new Map<string, ICanvasFloatDomInfo>();
    private _pendingRuntimeGeometry = new Map<string, IDocFloatDomRuntimeGeometry>();
    private _pendingRuntimeGeometryInsert = new Map<string, IDrawingSearch>();
    private _pendingRuntimeGeometryRefresh = new Map<string, IDisposable>();

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @Inject(CanvasFloatDomService) private readonly _canvasFloatDomService: CanvasFloatDomService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocRefreshDrawingsService) private readonly _docRefreshDrawingsService: DocRefreshDrawingsService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._pendingRuntimeGeometry.clear();
        this._pendingRuntimeGeometryInsert.clear();
        for (const disposable of this._pendingRuntimeGeometryRefresh.values()) {
            disposable.dispose();
        }
        this._pendingRuntimeGeometryRefresh.clear();
        super.dispose();
    }

    private _initialize() {
        this._drawingAddRemoveListener();
        this._drawingRuntimePropsListener();
        this._initScrollAndZoomEvent();
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderObject = this._renderManagerService.getRenderUnitById(unitId);

        if (renderObject == null) {
            return null;
        }

        const scene = renderObject.scene;

        const transformer = scene.getTransformerByCreate();

        return { scene, transformer, renderUnit: renderObject, canvas: renderObject.engine.getCanvasElement() };
    }

    private _drawingAddRemoveListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                const ready: IDrawingSearch[] = [];
                const refreshUnitIds = new Set<string>();
                for (const param of params) {
                    const drawing = this._drawingManagerService.getDrawingByParam(param);
                    if (isEmbedFloatDomRuntimeParam(drawing)) {
                        this._pendingRuntimeGeometryInsert.set(param.drawingId, param);
                        refreshUnitIds.add(param.unitId);
                        if (this._pendingRuntimeGeometry.has(param.drawingId)) {
                            ready.push(param);
                        }
                    } else {
                        ready.push(param);
                    }
                }
                this._insertRects(ready);
                for (const unitId of refreshUnitIds) {
                    this._refreshDrawingsFromCurrentLayout(unitId);
                }
            })
        );

        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                params.forEach((param) => {
                    this._removeDom(param.drawingId);
                });
            })
        );
    }

    private _refreshDrawingsFromCurrentLayout(unitId: string): void {
        const render = this._renderManagerService.getRenderUnitById(unitId);
        if (render == null) {
            return;
        }

        const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
        if (skeleton != null) {
            if (!this._pendingRuntimeGeometryRefresh.has(unitId)) {
                const subscription = skeleton.dirty$.subscribe(() => {
                    if (!this._hasPendingRuntimeGeometryForUnit(unitId)) {
                        this._disposePendingRuntimeGeometryRefresh(unitId);
                        return;
                    }
                    this._docRefreshDrawingsService.refreshDrawings(skeleton);
                });
                this._pendingRuntimeGeometryRefresh.set(
                    unitId,
                    toDisposable(() => subscription.unsubscribe())
                );
            }
            this._docRefreshDrawingsService.refreshDrawings(skeleton);
        }
    }

    private _hasPendingRuntimeGeometryForUnit(unitId: string): boolean {
        for (const pending of this._pendingRuntimeGeometryInsert.values()) {
            if (pending.unitId === unitId) {
                return true;
            }
        }
        return false;
    }

    private _disposePendingRuntimeGeometryRefresh(unitId: string): void {
        this._pendingRuntimeGeometryRefresh.get(unitId)?.dispose();
        this._pendingRuntimeGeometryRefresh.delete(unitId);
    }

    private _insertRects(params: IDrawingSearch[]) {
        for (const param of params) {
            const { unitId } = param;
            const documentDataModel = this._univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_DOC);
            if (!documentDataModel) {
                continue;
            }

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                continue;
            }

            const rectParam = this._drawingManagerService.getDrawingByParam(param) as IDocFloatDom;
            if (rectParam == null) {
                continue;
            }

            const preserveRuntimeGeometry = isEmbedFloatDomRuntimeParam(rectParam);
            const publishedRuntimeParam = this._pendingRuntimeGeometry.get(param.drawingId);
            if (
                preserveRuntimeGeometry &&
                (publishedRuntimeParam == null || this._pendingRuntimeGeometryInsert.get(param.drawingId) !== param)
            ) {
                continue;
            }

            const rects = this._drawingRenderService.renderFloatDom(rectParam, renderObject.scene);
            if (rects == null || rects.length === 0) {
                continue;
            }

            for (const rect of rects) {
                const runtimeParam: IDocFloatDomRuntimeGeometry = publishedRuntimeParam ?? rectParam;
                const runtimeViewport = pickValidCustomBlockRenderViewport(runtimeParam.customBlockRenderViewport);
                syncRectWithRuntimeParam(rect, runtimeParam, runtimeViewport, undefined, preserveRuntimeGeometry);
                const runtimeTransform = runtimeViewport || preserveRuntimeGeometry ? createTransformFromRect(rect) : undefined;
                this._addHoverForRect(rect);
                const disposableCollection = new DisposableCollection();
                const initPosition = calcDocFloatDomPosition(rect, renderObject.renderUnit);
                const position$ = new BehaviorSubject<IFloatDomLayout>(initPosition);
                const canvas = renderObject.canvas;
                const data = rectParam.data;

                const info: ICanvasFloatDomInfo = {
                    dispose: disposableCollection,
                    preserveRuntimeGeometry,
                    rect,
                    runtimeTransform,
                    runtimeViewport,
                    position$,
                    unitId,
                };

                this._canvasFloatDomService.addFloatDom({
                    position$,
                    id: rectParam.drawingId,
                    componentKey: rectParam.componentKey,
                    contentBox: isSheetLikeEmbedFloatDomRuntimeParam(rectParam)
                        ? { contentInset: 0, wrapperInset: 0 }
                        : undefined,
                    eventPassThrough: preserveRuntimeGeometry ? false : undefined,
                    preserveOnFocusChange: preserveRuntimeGeometry,
                    onPointerDown: (evt) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onPointerMove: (evt: PointerEvent | MouseEvent) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onPointerUp: (evt: PointerEvent | MouseEvent) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onWheel: (evt: WheelEvent) => {
                        canvas.dispatchEvent(new WheelEvent(evt.type, evt));
                    },
                    data,
                    props: mergeDocFloatDomRuntimeProps(undefined, rectParam),
                    unitId,
                });

                const listener = rect.onTransformChange$.subscribeEvent(() => {
                    const newPosition = calcDocFloatDomPosition(rect, renderObject.renderUnit);
                    position$.next(
                        newPosition
                    );
                });
                const scrollListener = subscribeViewportScrollAfter(
                    renderObject.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)?.onScrollAfter$,
                    () => position$.next(calcDocFloatDomPosition(rect, renderObject.renderUnit))
                );

                disposableCollection.add(() => {
                    this._canvasFloatDomService.removeFloatDom(rectParam.drawingId);
                });
                listener && disposableCollection.add(listener);
                scrollListener && disposableCollection.add(scrollListener);
                this._domLayerInfoMap.set(rectParam.drawingId, info);
            }
            this._pendingRuntimeGeometry.delete(param.drawingId);
            this._pendingRuntimeGeometryInsert.delete(param.drawingId);
            if (!this._hasPendingRuntimeGeometryForUnit(unitId)) {
                this._disposePendingRuntimeGeometryRefresh(unitId);
            }
        }
    }

    private _drawingRuntimePropsListener() {
        this.disposeWithMe(
            this._drawingManagerService.refreshTransform$.subscribe((params) => {
                params.forEach((param) => {
                    const floatDomInfo = this._domLayerInfoMap.get(param.drawingId);
                    if (!floatDomInfo) {
                        const pendingInsert = this._pendingRuntimeGeometryInsert.get(param.drawingId);
                        const drawing = this._drawingManagerService.getDrawingByParam(param);
                        if (pendingInsert != null || isEmbedFloatDomRuntimeParam(drawing)) {
                            if (param.hidden === true) {
                                return;
                            }
                            this._pendingRuntimeGeometry.set(param.drawingId, param);
                            if (pendingInsert != null) {
                                this._insertRects([pendingInsert]);
                            }
                        }
                        return;
                    }
                    if (floatDomInfo.unitId !== param.unitId) {
                        return;
                    }
                    if (floatDomInfo.preserveRuntimeGeometry && param.hidden === true) {
                        return;
                    }

                    const runtimeParam: IDocFloatDomRuntimeGeometry = param;
                    const runtimeViewport = pickValidCustomBlockRenderViewport(runtimeParam.customBlockRenderViewport);
                    if (runtimeViewport) {
                        floatDomInfo.runtimeViewport = runtimeViewport;
                    }

                    const synced = syncRectWithRuntimeParam(
                        floatDomInfo.rect,
                        runtimeParam,
                        floatDomInfo.runtimeViewport,
                        floatDomInfo.runtimeTransform,
                        floatDomInfo.preserveRuntimeGeometry
                    );
                    if (synced) {
                        if (runtimeViewport || floatDomInfo.preserveRuntimeGeometry) {
                            floatDomInfo.runtimeTransform = createTransformFromRect(floatDomInfo.rect);
                        }
                        const renderObject = this._getSceneAndTransformerByDrawingSearch(floatDomInfo.unitId);
                        if (renderObject) {
                            floatDomInfo.position$.next(calcDocFloatDomPosition(floatDomInfo.rect, renderObject.renderUnit));
                        }
                    }

                    const currentProps = this._canvasFloatDomService.domLayers.find(([id]) => id === param.drawingId)?.[1].props;
                    this._canvasFloatDomService.updateFloatDom(param.drawingId, {
                        props: mergeDocFloatDomRuntimeProps(currentProps, param),
                    });
                });
            })
        );
    }

    private _addHoverForRect(o: Rect) {
        this.disposeWithMe(
            toDisposable(
                o.onPointerEnter$.subscribeEvent(() => {
                    o.cursor = CURSOR_TYPE.GRAB;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeave$.subscribeEvent(() => {
                    o.cursor = CURSOR_TYPE.DEFAULT;
                })
            )
        );
    }

    private _removeDom(id: string) {
        const pendingUnitId = this._pendingRuntimeGeometryInsert.get(id)?.unitId;
        this._pendingRuntimeGeometry.delete(id);
        this._pendingRuntimeGeometryInsert.delete(id);
        if (pendingUnitId != null && !this._hasPendingRuntimeGeometryForUnit(pendingUnitId)) {
            this._disposePendingRuntimeGeometryRefresh(pendingUnitId);
        }
        const info = this._domLayerInfoMap.get(id);
        if (!info) {
            return;
        }
        const { unitId } = info;
        this._domLayerInfoMap.delete(id);

        info.dispose.dispose();
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (renderObject) {
            renderObject.scene.removeObject(info.rect);
        }
    }

    private _initScrollAndZoomEvent() {
        const updateDoc = (unitId: string) => {
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            if (!renderObject) {
                return;
            }
            this._domLayerInfoMap.forEach((floatDomInfo) => {
                if (floatDomInfo.unitId !== unitId) return;
                const position = calcDocFloatDomPosition(floatDomInfo.rect, renderObject.renderUnit);
                floatDomInfo.position$.next(position);
            });
        };

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(
                map((documentDataModel) => {
                    if (!documentDataModel) return null;
                    const unitId = documentDataModel.getUnitId();
                    const render = this._renderManagerService.getRenderUnitById(unitId);
                    return render ? { render, unitId } : null;
                }),
                switchMap((render) =>
                    render
                        ? fromEventSubject(render.render.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!.onScrollAfter$)
                            .pipe(map(() => ({ unitId: render.unitId })))
                        : of(null)
                )
            ).subscribe((value) => {
                if (!value) return;
                const { unitId } = value;
                updateDoc(unitId);
            })
        );

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetDocZoomRatioOperation.id) {
                const params = (commandInfo.params) as ISetDocZoomRatioOperationParams;
                const { unitId } = params;
                globalThis.queueMicrotask(() => {
                    if (!this._disposed) updateDoc(unitId);
                });
            }
        }));
    }

    insertFloatDom(floatDom: IDocFloatDomParams, opts: { width?: number; height: number; drawingId?: string }) {
        const currentDoc = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
        if (!currentDoc) return false;
        const render = this._getSceneAndTransformerByDrawingSearch(currentDoc.getUnitId());
        if (!render) return false;
        const docSkeletonManagerService = render.renderUnit.with(DocSkeletonManagerService);
        const skeleton = docSkeletonManagerService.getSkeleton();
        const page = skeleton.getSkeletonData()?.pages[0];
        if (!page) return false;
        const { pageWidth, marginLeft, marginRight } = page;
        const width = pageWidth - marginLeft - marginRight;
        const docTransform = {
            size: {
                width: opts.width ?? width,
                height: opts.height,
            },
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: 0,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
                posOffset: 0,
            },
            angle: 0,
        };
        const drawingId = opts.drawingId ?? generateRandomId();
        const params: IInsertDocDrawingCommandParams = {
            unitId: currentDoc.getUnitId(),
            drawings: [
                {
                    drawingId,
                    drawingType: DrawingTypeEnum.DRAWING_DOM,
                    subUnitId: currentDoc.getUnitId(),
                    unitId: currentDoc.getUnitId(),
                    ...floatDom,
                    title: '',
                    description: '',
                    docTransform,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    transform: docDrawingPositionToTransform(docTransform),
                },
            ],
        };
        this._commandService.syncExecuteCommand<IInsertDocDrawingCommandParams>(InsertDocDrawingCommand.id, params);

        return drawingId;
    }
}

function syncRectWithRuntimeParam(
    rect: Rect,
    param: IDocFloatDomRuntimeGeometry,
    fallbackViewport?: IDocFloatDomRuntimeViewport,
    fallbackTransform?: Partial<ITransformState>,
    preserveRuntimeGeometry?: boolean
): boolean {
    const transform = getRuntimeTransform(param, rect, fallbackViewport, fallbackTransform, preserveRuntimeGeometry);
    if (!transform) {
        return false;
    }

    rect.transformByState(transform as never);
    return true;
}

function getRuntimeTransform(
    param: IDocFloatDomRuntimeGeometry,
    rect: Rect,
    fallbackViewport?: IDocFloatDomRuntimeViewport,
    fallbackTransform?: Partial<ITransformState>,
    preserveRuntimeGeometry?: boolean
): Partial<ITransformState> | undefined {
    const transform = param.transform ?? param.transforms?.[0];
    const runtimeViewport = param.customBlockRenderViewport ?? fallbackViewport;
    if (!param.customBlockRenderViewport && preserveRuntimeGeometry && fallbackTransform && transform) {
        return {
            ...transform,
            width: fallbackTransform.width ?? transform.width,
            height: fallbackTransform.height ?? transform.height,
        };
    }

    if (!transform) {
        const height = runtimeViewport?.height ?? runtimeViewport?.contentHeight;
        if (!isPositiveNumber(height)) {
            return undefined;
        }

        return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height,
            angle: rect.angle,
        };
    }

    const height = runtimeViewport?.height ?? runtimeViewport?.contentHeight;
    if (!isPositiveNumber(height)) {
        return transform;
    }

    return {
        ...transform,
        height,
    };
}

function isEmbedFloatDomRuntimeParam(param: unknown): param is IDocFloatDom {
    if (param == null || typeof param !== 'object' || !('data' in param)) {
        return false;
    }

    const data = param.data;
    if (!data || typeof data !== 'object') {
        return false;
    }

    const candidate = data as { embedId?: unknown; hostAnchorId?: unknown; version?: unknown };
    return candidate.version === 1 && typeof candidate.embedId === 'string' && typeof candidate.hostAnchorId === 'string';
}

function isSheetLikeEmbedFloatDomRuntimeParam(param: unknown): param is IDocFloatDom {
    if (!isEmbedFloatDomRuntimeParam(param)) {
        return false;
    }

    const data = param.data;
    return !!data &&
        typeof data === 'object' &&
        'childType' in data &&
        typeof data.childType === 'number' &&
        isSheetLikeDocsCustomBlockChildType(data.childType);
}

function createTransformFromRect(rect: Rect): Partial<ITransformState> {
    return {
        angle: rect.angle,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        width: rect.width,
    };
}

function subscribeViewportScrollAfter(scrollEvent: unknown, callback: () => void): IDisposable | undefined {
    if (!scrollEvent || typeof scrollEvent !== 'object') {
        return undefined;
    }

    const eventSubject = scrollEvent as { subscribeEvent?: (listener: () => void) => IDisposable };
    if (typeof eventSubject.subscribeEvent === 'function') {
        return eventSubject.subscribeEvent(callback);
    }

    const observable = scrollEvent as { subscribe?: (listener: () => void) => { unsubscribe?: () => void } };
    if (typeof observable.subscribe === 'function') {
        const subscription = observable.subscribe(callback);
        return toDisposable(() => subscription.unsubscribe?.());
    }

    return undefined;
}
