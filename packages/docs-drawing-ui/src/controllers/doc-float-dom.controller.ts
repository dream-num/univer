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
import { docDrawingPositionToTransform, DocSkeletonManagerService } from '@univerjs/docs';
import { InsertDocDrawingCommand } from '@univerjs/docs-drawing';
import { SetDocZoomRatioOperation, VIEWPORT_KEY } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import { CanvasFloatDomService } from '@univerjs/ui';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';

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

type IDocFloatDomRuntimeViewport = Partial<Pick<IDocsCustomBlockRenderViewport, 'bleedLeft' | 'bleedWidth' | 'contentHeight' | 'contentWidth' | 'height' | 'viewportHeight'>>;

interface IDocFloatDomRuntimeParam extends IDocFloatDom {
    customBlockRenderViewport?: IDocFloatDomRuntimeViewport;
    transform?: Partial<ITransformState>;
    transforms?: Array<Partial<ITransformState>>;
}

export function mergeDocFloatDomRuntimeProps(existingProps: Record<string, unknown> | undefined, param: IDocFloatDomRuntimeParam): Record<string, unknown> | undefined {
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

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @Inject(CanvasFloatDomService) private readonly _canvasFloatDomService: CanvasFloatDomService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
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

        const renderObject = this._renderManagerService.getRenderById(unitId);

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
                this._insertRects(params);
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

    private _insertRects(params: IDrawingSearch[]) {
        (params).forEach(async (param) => {
            const { unitId } = param;
            const documentDataModel = this._univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_DOC);
            if (!documentDataModel) {
                return;
            }

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }

            const rectParam = this._drawingManagerService.getDrawingByParam(param) as IDocFloatDom;
            if (rectParam == null) {
                return;
            }

            const rects = await this._drawingRenderService.renderFloatDom(rectParam, renderObject.scene);
            if (rects == null || rects.length === 0) {
                return;
            }

            for (const rect of rects) {
                const runtimeParam = rectParam as IDocFloatDomRuntimeParam;
                const runtimeViewport = pickValidCustomBlockRenderViewport(runtimeParam.customBlockRenderViewport);
                const preserveRuntimeGeometry = isEmbedFloatDomRuntimeParam(runtimeParam);
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
                    props: mergeDocFloatDomRuntimeProps(undefined, rectParam as IDocFloatDomRuntimeParam),
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
        });
    }

    private _drawingRuntimePropsListener() {
        this.disposeWithMe(
            this._drawingManagerService.refreshTransform$.subscribe((params) => {
                params.forEach((param) => {
                    const floatDomInfo = this._domLayerInfoMap.get(param.drawingId);
                    if (!floatDomInfo) {
                        return;
                    }

                    const runtimeParam = param as IDocFloatDomRuntimeParam;
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
                        props: mergeDocFloatDomRuntimeProps(currentProps, param as IDocFloatDomRuntimeParam),
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
                    const render = this._renderManagerService.getRenderById(unitId);
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
                updateDoc(unitId);
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
    param: IDocFloatDomRuntimeParam,
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
    param: IDocFloatDomRuntimeParam,
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

function isEmbedFloatDomRuntimeParam(param: IDocFloatDomRuntimeParam): boolean {
    const data = param.data;
    if (!data || typeof data !== 'object') {
        return false;
    }

    const candidate = data as { embedId?: unknown; hostAnchorId?: unknown; version?: unknown };
    return candidate.version === 1 && typeof candidate.embedId === 'string' && typeof candidate.hostAnchorId === 'string';
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
