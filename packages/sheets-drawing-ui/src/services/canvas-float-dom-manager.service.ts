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

/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable no-console */
import type { IDisposable, IDrawingSearch, IPosition, IRange, ITransformState, Nullable, Serializable, Workbook, Worksheet } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { BaseObject, IBoundRectNoAngle, IRectProps, IRender, Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISetFrozenMutationParams, ISetWorksheetRowAutoHeightMutationParams } from '@univerjs/sheets';
import type { IFloatDomData, ISheetDrawingPosition, ISheetFloatDom } from '@univerjs/sheets-drawing';
import type { IFloatDom, IFloatDomLayout } from '@univerjs/ui';
import type { IInsertDrawingCommandParams } from '../commands/commands/interfaces';
import { Disposable, DisposableCollection, DrawingTypeEnum, fromEventSubject, generateRandomId, ICommandService, Inject, IUniverInstanceService, LifecycleService, LifecycleStages, Tools, UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, IRenderManagerService, ObjectType, Rect, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { COMMAND_LISTENER_SKELETON_CHANGE, getSheetCommandTarget, SetFrozenMutation, SetWorksheetRowAutoHeightMutation } from '@univerjs/sheets';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService, SetScrollOperation, SetZoomRatioOperation, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { CanvasFloatDomService } from '@univerjs/ui';
import { BehaviorSubject, filter, map, Subject, switchMap, take } from 'rxjs';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';

export interface ICanvasFloatDom {
    /**
     * whether allow transform float-dom
     */
    allowTransform?: boolean;
    /**
     * initial position of float-dom
     */
    initPosition: IPosition;
    componentKey: string;
    /**
     * unitId of workbook, if not set, will use current workbook
     */
    unitId?: string;
    /**
     * subUnitId of worksheet, if not set, will use current worksheet
     */
    subUnitId?: string;
    /**
     * @deprecated Please use `data`. for saving to disk, everything add to float-dom must be serializable.
     */
    props?: Record<string, any>;
    /**
     * data of component, will save to snapshot, json-like data
     */
    data?: Serializable;
    /**
     * the float-dom type
     */
    type?: DrawingTypeEnum;

    /**
     * whether allow event pass through float dom to canvas.
     */
    eventPassThrough?: boolean;
}

enum ScrollDirectionResponse {
    ALL = 'ALL',
    HORIZONTAL = 'HORIZONTAL',
    VERTICAL = 'VERTICAL',
}
interface ICanvasFloatDomInfo {
    position$: BehaviorSubject<IFloatDomLayout>;
    dispose: IDisposable;
    rect: Rect;
    unitId: string;
    subUnitId: string;
    boundsOfViewArea?: IBoundRectNoAngle;
    scrollDirectionResponse?: ScrollDirectionResponse; // update float dom pos by scrolling
}

export interface IDOMRangeLayout {
    width: number;
    height: number;
    horizonOffsetAlign?: 'left' | 'right';
    verticalOffsetAlign?: 'top' | 'bottom';
    marginX?: number;
    marginY?: number;
}

export interface ILimitBound extends IBoundRectNoAngle {
    absolute: {
        left: boolean;
        top: boolean;
    };
}

/**
 * Adjust dom bound size when scrolling (dom bound would shrink when scrolling if over the edge of viewMain)
 * @param posOfFloatObject
 * @param scene
 * @param skeleton
 * @param worksheet
 * @returns ILimitBound
 */
export function transformBound2DOMBound(posOfFloatObject: IBoundRectNoAngle, scene: Scene, skeleton: SpreadsheetSkeleton, worksheet: Worksheet, floatDomInfo?: ICanvasFloatDomInfo): ILimitBound {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    const absolute = {
        left: true,
        top: true,
    };

    if (!viewMain) {
        return {
            ...posOfFloatObject,
            absolute,
        };
    }
    const { left, right, top, bottom } = posOfFloatObject;
    let { top: topBoundOfViewArea, left: leftBoundViewArea, viewportScrollX: actualScrollX, viewportScrollY: actualScrollY } = viewMain;

    // specify edge of viewbound. if not specify, use viewMain.
    const { boundsOfViewArea, scrollDirectionResponse } = floatDomInfo || {};
    if (boundsOfViewArea) {
        if (Tools.isDefine(boundsOfViewArea.top)) {
            topBoundOfViewArea = boundsOfViewArea.top;
        }
        if (Tools.isDefine(boundsOfViewArea.left)) {
            leftBoundViewArea = boundsOfViewArea.left;
        }
    }
    if (scrollDirectionResponse === ScrollDirectionResponse.HORIZONTAL) {
        actualScrollY = 0;
    }
    if (scrollDirectionResponse === ScrollDirectionResponse.VERTICAL) {
        actualScrollX = 0;
    }

    let offsetLeft: number;
    let offsetRight: number;

    // viewMain or viewTop
    if (left < leftBoundViewArea) {
        absolute.left = true;
        offsetLeft = ((leftBoundViewArea) + (left - leftBoundViewArea)) * scaleX;
        offsetRight = Math.max(
            Math.min(
                ((leftBoundViewArea) + (right - leftBoundViewArea)) * scaleX,
                (leftBoundViewArea) * scaleX
            ),
            (right - actualScrollX) * scaleX);
    } else {
        absolute.left = false;
        offsetLeft = Math.max((left - actualScrollX) * scaleX, (leftBoundViewArea) * scaleX);
        offsetRight = Math.max((right - actualScrollX) * scaleX, (leftBoundViewArea) * scaleX);
    }

    let offsetTop: number;
    let offsetBottom: number;
    // viewMain or viewTop
    if (top < topBoundOfViewArea) {
        absolute.top = true;
        offsetTop = ((topBoundOfViewArea) + (top - topBoundOfViewArea)) * scaleY;
        offsetBottom = Math.max(
            Math.min(
                ((topBoundOfViewArea) + (right - topBoundOfViewArea)) * scaleY,
                (topBoundOfViewArea) * scaleY
            ),
            (bottom - actualScrollY) * scaleY
        );
    } else {
        absolute.top = false;
        offsetTop = Math.max((top - actualScrollY) * scaleY, (topBoundOfViewArea) * scaleY);
        offsetBottom = Math.max((bottom - actualScrollY) * scaleY, (topBoundOfViewArea) * scaleY);
    }

    return {
        left: offsetLeft,
        right: offsetRight,
        top: offsetTop,
        bottom: offsetBottom,
        absolute,
    };
}

/**
 * Calculate the position of the floating dom, limited by bounds of viewMain in transformBound2DOMBound
 * @param floatObject
 * @param renderUnit
 * @param skeleton
 * @param worksheet
 * @returns {IFloatDomLayout} position
 */
const calcPosition = (
    floatObject: BaseObject,
    renderUnit: IRender,
    skeleton: SpreadsheetSkeleton,
    worksheet: Worksheet,
    floatDomInfo?: ICanvasFloatDomInfo
): IFloatDomLayout => {
    const { scene } = renderUnit;
    const { left, top, width, height, angle } = floatObject;
    const boundOfFloatObject: IBoundRectNoAngle = {
        left,
        right: left + width,
        top,
        bottom: top + height,
    };

    const offsetBound = transformBound2DOMBound(boundOfFloatObject, scene, skeleton, worksheet, floatDomInfo);
    const { scaleX, scaleY } = scene.getAncestorScale();

    return {
        startX: offsetBound.left,
        endX: offsetBound.right,
        startY: offsetBound.top,
        endY: offsetBound.bottom,
        rotate: angle,
        width: width * scaleX,
        height: height * scaleY,
        absolute: offsetBound.absolute,
    };
};

export interface ISheetCanvasFloatDomHook {
    onGetFloatDomProps: (id: string) => Record<string, any>;
}

export class SheetCanvasFloatDomManagerService extends Disposable {
    /**
     * for update dom container position when scrolling
     */
    private _domLayerMap: Map<string, Map<string, Map<string, { props?: any }>>> = new Map();
    private _domLayerInfoMap: Map<string, ICanvasFloatDomInfo> = new Map();

    private _transformChange$ = new Subject<{ id: string; value: ITransformState }>();
    transformChange$ = this._transformChange$.asObservable();

    private _add$ = new Subject<{ unitId: string; subUnitId: string; id: string; data?: Record<string, any> }>();
    public add$ = this._add$.asObservable();

    private _remove$ = new Subject<{ unitId: string; subUnitId: string; id: string }>();
    remove$ = this._remove$.asObservable();

    private _hooks: ISheetCanvasFloatDomHook[] = [];

    constructor(
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @IDrawingManagerService private _drawingManagerService: IDrawingManagerService,
        @Inject(CanvasFloatDomService) private readonly _canvasFloatDomService: CanvasFloatDomService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService
    ) {
        super();
        this._drawingAddListener();
        this._featureUpdateListener();
        this._deleteListener();
        this._bindScrollEvent();
    }

    private _bindScrollEvent() {
        this._lifecycleService.lifecycle$.pipe(filter((s) => s === LifecycleStages.Rendered), take(1)).subscribe(() => {
            this._scrollUpdateListener();
        });
    }

    private _ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._domLayerMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._domLayerMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    getFloatDomInfo(id: string) {
        return this._domLayerInfoMap.get(id);
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderUnit = this._renderManagerService.getRenderById(unitId);

        const scene = renderUnit?.scene;

        if (renderUnit == null || scene == null) {
            return null;
        }

        const transformer = scene.getTransformerByCreate();
        const canvas = renderUnit.engine.getCanvasElement();

        return { scene, transformer, renderUnit, canvas };
    }

    private _getFloatDomProps(id: string) {
        let props;
        this._hooks.forEach((hook) => {
            props = hook.onGetFloatDomProps(id);
        });

        return props;
    }

    private _drawingAddListener() {
        this.disposeWithMe(

            this._drawingManagerService.add$.subscribe((params: IDrawingSearch[]) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;
                    const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
                    const floatDomParam = this._drawingManagerService.getDrawingByParam(param) as IFloatDomData;

                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                    if (!workbook) {
                        return;
                    }

                    const activeSheetId = workbook.getActiveSheet().getSheetId();

                    if (!floatDomParam || !target) {
                        return;
                    }

                    const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
                    if (!skeleton) {
                        return;
                    }

                    const { transform, drawingType, data } = floatDomParam;

                    if (drawingType !== DrawingTypeEnum.DRAWING_DOM && drawingType !== DrawingTypeEnum.DRAWING_CHART) {
                        return;
                    }

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene, canvas } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    if (activeSheetId !== subUnitId) {
                        return;
                    }

                    const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                    const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const rectShape = scene.getObject(rectShapeKey);

                    if (rectShape != null) {
                        rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                        return;
                    }

                    const imageConfig: IRectProps = {
                        left,
                        top,
                        width,
                        height,
                        zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
                    };

                    const isChart = drawingType === DrawingTypeEnum.DRAWING_CHART;

                    if (isChart) {
                        const backgroundColor = data ? (data as Record<string, string>).backgroundColor : 'white';
                        imageConfig.fill = backgroundColor;
                        imageConfig.rotateEnabled = false;
                        if (data && (data as Record<string, string>).border) {
                            imageConfig.stroke = (data as Record<string, string>).border;
                        }
                        imageConfig.paintFirst = 'stroke';
                        imageConfig.strokeWidth = 1;
                        imageConfig.borderEnabled = false;
                        imageConfig.radius = 8;
                    }

                    const rect = new Rect(rectShapeKey, imageConfig);

                    if (isChart) {
                        rect.setObjectType(ObjectType.CHART);
                    }

                    scene.addObject(rect, DRAWING_OBJECT_LAYER_INDEX);
                    if (floatDomParam.allowTransform !== false) {
                        scene.attachTransformerTo(rect);
                    }
                    const map = this._ensureMap(unitId, subUnitId);
                    const disposableCollection = new DisposableCollection();
                    const initPosition = calcPosition(rect, renderObject.renderUnit, skeleton.skeleton, target.worksheet);
                    const position$ = new BehaviorSubject<IFloatDomLayout>(initPosition);

                    const info: ICanvasFloatDomInfo = {
                        dispose: disposableCollection,
                        rect,
                        position$,
                        unitId,
                        subUnitId,
                    };

                    this._canvasFloatDomService.addFloatDom({
                        position$,
                        id: drawingId,
                        componentKey: floatDomParam.componentKey,
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
                        props: map.get(drawingId)?.props ?? this._getFloatDomProps(drawingId),
                        data,
                        unitId,
                    });

                    const listener = rect.onTransformChange$.subscribeEvent(() => {
                        const newPosition = calcPosition(rect, renderObject.renderUnit, skeleton.skeleton, target.worksheet);
                        position$.next(
                            newPosition
                        );
                    });

                    disposableCollection.add(() => {
                        this._canvasFloatDomService.removeFloatDom(drawingId);
                    });
                    listener && disposableCollection.add(listener);
                    this._domLayerInfoMap.set(drawingId, info);
                    map.set(drawingId, {
                        ...map.get(drawingId),
                    });
                });
            })
        );

        // remove float-dom control when drawing removed
        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;
                    const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
                    if (renderObject == null) {
                        return;
                    }
                    const { transformer, scene } = renderObject;
                    const rectShape = scene.getObject(rectShapeKey);
                    if (rectShape?.oKey) {
                        transformer.clearControlByIds([rectShape?.oKey]);
                    }
                });
            })
        );
    }

    private _scrollUpdateListener() {
        const updateSheet = (unitId: string, subUnitId: string) => {
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            const map = this._ensureMap(unitId, subUnitId);
            const ids = Array.from(map.keys());
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
            if (!renderObject || !target || !skeleton) {
                return;
            }
            ids.forEach((id) => {
                const floatDomInfo = this._domLayerInfoMap.get(id);
                if (floatDomInfo) {
                    const position = calcPosition(floatDomInfo.rect, renderObject.renderUnit, skeleton.skeleton, target.worksheet, floatDomInfo);
                    floatDomInfo.position$.next(position);
                }
            });
        };

        // #region scroll
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
                filter((workbook) => !!workbook),
                switchMap((workbook) => workbook.activeSheet$),
                filter((sheet) => !!sheet),
                map((sheet) => {
                    const render = this._renderManagerService.getRenderById(sheet.getUnitId());
                    return render ? { render, unitId: sheet.getUnitId(), subUnitId: sheet.getSheetId() } : null;
                }),
                filter((render) => !!render),
                switchMap((render) =>
                    fromEventSubject(render.render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!.onScrollAfter$)
                        .pipe(map(() => ({ unitId: render.unitId, subUnitId: render.subUnitId })))
                )
            ).subscribe(({ unitId, subUnitId }) => {
                updateSheet(unitId, subUnitId);
            })
        );
        //#endregion

        // #region zoom
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetZoomRatioOperation.id) {
                const params = (commandInfo.params) as any;
                const { unitId } = params;
                const subUnitIds = Array.from(this._domLayerMap.get(unitId)?.keys() ?? []);
                subUnitIds.forEach((subUnitId) => {
                    updateSheet(unitId, subUnitId);
                });
            } else if (commandInfo.id === SetFrozenMutation.id) {
                const { unitId, subUnitId } = commandInfo.params as ISetFrozenMutationParams;
                updateSheet(unitId, subUnitId);
            }
        }));
        //# endregion
    }

    private _getPosition(position: IPosition, unitId: string): Nullable<ISheetDrawingPosition> {
        const { startX, endX, startY, endY } = position;
        const selectionRenderService = this._renderManagerService.getRenderById(unitId)?.with(ISheetSelectionRenderService);
        if (selectionRenderService == null) {
            return;
        }
        const start = selectionRenderService.getCellWithCoordByOffset(startX, startY);
        if (start == null) {
            return;
        }

        const from = {
            column: start.actualColumn,
            columnOffset: startX - start.startX,
            row: start.actualRow,
            rowOffset: startY - start.startY,
        };

        const end = selectionRenderService.getCellWithCoordByOffset(endX, endY);

        if (end == null) {
            return;
        }

        const to = {
            column: end.actualColumn,
            columnOffset: endX - end.startX,
            row: end.actualRow,
            rowOffset: endY - end.startY,
        };

        return {
            from,
            to,
        };
    }

    private _featureUpdateListener() {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                (params).forEach((data) => {
                    const sheetDrawing = this._drawingManagerService.getDrawingByParam(data);

                    if (!sheetDrawing) {
                        return;
                    }

                    if (sheetDrawing.drawingType !== DrawingTypeEnum.DRAWING_DOM && sheetDrawing.drawingType !== DrawingTypeEnum.DRAWING_CHART) {
                        return;
                    }

                    const newValue = {
                        ...sheetDrawing.transform,
                    };
                    this._transformChange$.next({ id: data.drawingId, value: newValue });
                });
            })
        );
    }

    private _deleteListener() {
        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                params.forEach((param) => {
                    this._removeDom(param.drawingId);
                });
            })
        );
    }

    updateFloatDomProps(unitId: string, subUnitId: string, id: string, props: Record<string, any>) {
        const info = this._domLayerInfoMap.get(id);
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (info && renderObject) {
            const { scene } = renderObject;
            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: id });
            const rectShape = scene.getObject(rectShapeKey);
            if (rectShape && rectShape instanceof Rect) {
                rectShape.setProps(props);
            }
        }
    }

    // CreateFloatDomCommand --> floatDomService.addFloatDomToPosition
    addFloatDomToPosition(layer: ICanvasFloatDom, propId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: layer.unitId,
            subUnitId: layer.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }

        const { unitId, subUnitId } = target;
        const { initPosition, componentKey, data, allowTransform = true } = layer;
        const id = propId ?? generateRandomId();

        const sheetTransform = this._getPosition(initPosition, unitId);
        if (sheetTransform == null) {
            return;
        }
        const map = this._ensureMap(unitId, subUnitId);
        map.set(id, layer);

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: layer.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            transform: {
                left: initPosition.startX,
                top: initPosition.startY,
                width: initPosition.endX - initPosition.startX,
                height: initPosition.endY - initPosition.startY,
            },
            data,
            allowTransform,
        };

        // mutation
        // ---> this._drawingManagerService.add$.subscribe
        this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId,
            drawings: [sheetDrawingParam],
        } as IInsertDrawingCommandParams);

        this._add$.next({ unitId, subUnitId, id });

        return {
            id,
            dispose: () => {
                this._removeDom(id, true);
            },
        };
    }

    private _removeDom(id: string, removeDrawing = false) {
        const info = this._domLayerInfoMap.get(id);
        if (!info) {
            return;
        }
        const { unitId, subUnitId } = info;
        this._domLayerInfoMap.delete(id);

        info.dispose.dispose();
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (renderObject) {
            renderObject.scene.removeObject(info.rect);
        }

        if (removeDrawing) {
            const map = this._ensureMap(unitId, subUnitId);
            map.delete(id);
            const param = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId: id });
            if (!param) {
                return;
            }
            const jsonOp = this._sheetDrawingService.getBatchRemoveOp([param]) as IDrawingJsonUndo1;

            const { redo, objects } = jsonOp;
            this._commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE });
        }
    }

    addHook(hook: ISheetCanvasFloatDomHook): IDisposable {
        this._hooks.push(hook);

        return {
            dispose: () => {
                const index = this._hooks.findIndex((h) => h === hook);
                this._hooks.splice(index, 1);
            },
        };
    }

    addFloatDomToRange(range: IRange, config: ICanvasFloatDom, domPos: IDOMRangeLayout, propId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: config.unitId,
            subUnitId: config.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }
        const { unitId, subUnitId } = target;
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (!renderObject) return;
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) return;
        const skeletonParam = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
        if (!skeletonParam) return;
        // const viewMain = renderObject.scene.getMainViewport();

        const { componentKey, data, allowTransform = true } = config;
        const id = propId ?? generateRandomId();
        // const drawingId = id;

        const { position: rangePosition } = this._createRangePositionObserver(range, currentRender, skeletonParam.skeleton);
        const sheetTransform = this._getPosition(rangePosition, unitId);
        if (sheetTransform == null) {
            return;
        }
        const map = this._ensureMap(unitId, subUnitId);
        map.set(id, config);
        const rangeWidth = rangePosition.endX - rangePosition.startX;
        const rangeHeight = rangePosition.endY - rangePosition.startY;
        const domWidth = domPos.width ?? rangeWidth;
        const domHeight = domPos.height ?? rangeHeight;

        const domLeft = rangePosition.startX + calculateOffset(domPos.marginX, rangeWidth);
        const domTop = rangePosition.startY + calculateOffset(domPos.marginY, rangeHeight);

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: config.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            transform: {
                left: domLeft,
                top: domTop,
                width: domWidth,
                height: domHeight,
            } as ITransformState,
            data,
            allowTransform,
        };

        // mutation
        // ---> this._drawingManagerService.add$.subscribe
        // this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
        //     unitId,
        //     drawings: [sheetDrawingParam],
        // } as IInsertDrawingCommandParams);
        // this._add$.next({ unitId, subUnitId, id }); // seems no use

        {
            const { unitId, subUnitId, drawingId } = sheetDrawingParam;
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            // const floatDomParam = this._drawingManagerService.getDrawingByParam(sheetDrawingParam) as IFloatDomData;
            const floatDomParam = sheetDrawingParam;

            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return;
            }

            const activeSheetId = workbook.getActiveSheet().getSheetId();

            if (!floatDomParam || !target) {
                return;
            }

            const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
            if (!skeleton) {
                return;
            }

            const { transform, drawingType, data } = floatDomParam;

            if (drawingType !== DrawingTypeEnum.DRAWING_DOM && drawingType !== DrawingTypeEnum.DRAWING_CHART) {
                return;
            }

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }
            const { scene, canvas } = renderObject;

            if (transform == null) {
                return;
            }

            if (activeSheetId !== subUnitId) {
                return;
            }

            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            const rectShape = scene.getObject(rectShapeKey);

            if (rectShape != null) {
                rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                return;
            }

            const domConfig: IRectProps = {
                left,
                top,
                width,
                height,
                zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
            };

            const isChart = drawingType === DrawingTypeEnum.DRAWING_CHART;

            if (isChart) {
                const backgroundColor = data ? (data as Record<string, string>).backgroundColor : 'white';
                domConfig.fill = backgroundColor;
                domConfig.rotateEnabled = false;
                if (data && (data as Record<string, string>).border) {
                    domConfig.stroke = (data as Record<string, string>).border;
                }
                domConfig.paintFirst = 'stroke';
                domConfig.strokeWidth = 1;
                domConfig.borderEnabled = false;
                domConfig.radius = 8;
            }

            const domRect = new Rect(rectShapeKey, domConfig);

            if (isChart) {
                domRect.setObjectType(ObjectType.CHART);
            }

            scene.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
            if (floatDomParam.allowTransform !== false) {
                scene.attachTransformerTo(domRect);
            }
            const map = this._ensureMap(unitId, subUnitId);
            const disposableCollection = new DisposableCollection();

            const viewMain = scene.getMainViewport();
            const boundsOfViewArea: IBoundRectNoAngle = {
                top: viewMain.top,
                left: viewMain.left,
                bottom: viewMain.bottom,
                right: viewMain.right,
            };

            const floatDomInfo = {
                dispose: disposableCollection,
                rect: domRect,
                boundsOfViewArea,
                // position$,
                unitId,
                subUnitId,
            } as unknown as ICanvasFloatDomInfo;

            const initedPosition = calcPosition(domRect, renderObject.renderUnit, skeleton.skeleton, target.worksheet, floatDomInfo);
            const position$ = new BehaviorSubject<IFloatDomLayout>(initedPosition);
            floatDomInfo.position$ = position$;

            // used in FloatDom.tsx
            let floatDomCfg: IFloatDom = {
                position$,
                id: drawingId,
                componentKey: floatDomParam.componentKey,
                onPointerDown: () => { },
                onPointerMove: () => { },
                onPointerUp: () => { },
                onWheel: (evt: WheelEvent) => {
                    canvas.dispatchEvent(new WheelEvent(evt.type, evt));
                },
                props: map.get(drawingId)?.props ?? this._getFloatDomProps(drawingId),
                data,
                unitId,
            };
            if (config.eventPassThrough) {
                floatDomCfg = { ...floatDomCfg,
                                onPointerDown: (evt) => {
                                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                                },
                                onPointerMove: (evt: PointerEvent | MouseEvent) => {
                                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                                },
                                onPointerUp: (evt: PointerEvent | MouseEvent) => {
                                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                                },
                };
            }
            this._canvasFloatDomService.addFloatDom(floatDomCfg);

            const listener = domRect.onTransformChange$.subscribeEvent(() => {
                const newPosition = calcPosition(domRect, renderObject.renderUnit, skeleton.skeleton, target.worksheet, floatDomInfo);
                position$.next(
                    newPosition
                );
            });

            disposableCollection.add(() => {
                this._canvasFloatDomService.removeFloatDom(drawingId);
            });
            listener && disposableCollection.add(listener);
            this._domLayerInfoMap.set(drawingId, floatDomInfo);
            map.set(drawingId, {
                ...map.get(drawingId),
            });
        }

        return {
            id,
            dispose: () => {
                this._removeDom(id, true);
            },
        };
    }

    addFloatDomToColumnHeader(column: number, config: ICanvasFloatDom, domLayout: IDOMRangeLayout, propId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: config.unitId,
            subUnitId: config.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }
        const { unitId, subUnitId } = target;
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (!renderObject) return;
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) return;
        const skeletonParam = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
        if (!skeletonParam) return;
        // const viewMain = renderObject.scene.getMainViewport();

        const { componentKey, data, allowTransform = true } = config;
        const id = propId ?? generateRandomId();
        // const drawingId = id;

        // rangePostion relative to canvas.(if no scrolling)
        const { position: rangePosition } = this._createRangePositionObserver({
            startRow: 0,
            endRow: 0,
            startColumn: column,
            endColumn: column,
        }, currentRender, skeletonParam.skeleton);
        const headerPosition = rangePosition;
        headerPosition.startY = 0;

        const sheetTransform = this._getPosition(rangePosition, unitId);
        if (sheetTransform == null) {
            return;
        }
        // this._ensureMap for what?
        const map = this._ensureMap(unitId, subUnitId);
        map.set(id, config);
        const rangeWidth = rangePosition.endX - rangePosition.startX;
        const rangeHeight = rangePosition.endY - rangePosition.startY;
        const domWidth = domLayout.width ?? rangeWidth;
        const domHeight = domLayout.height ?? rangeHeight;

        let domLeft = 0;
        let domTop = 0;
        if (domLayout.horizonOffsetAlign === 'right') {
            const offsetX = calculateOffset(domLayout.marginX, rangeWidth);
            domLeft = headerPosition.endX - offsetX - domWidth;
        } else {
            // default align left
            domLeft = headerPosition.startX + calculateOffset(domLayout.marginX, rangeWidth);
        }

        if (domLayout.verticalOffsetAlign === 'bottom') {
            const offsetY = calculateOffset(domLayout.marginY, rangeHeight);
            domTop = headerPosition.endY - offsetY - domHeight;
        } else {
            domTop = headerPosition.startY + calculateOffset(domLayout.marginY, rangeHeight);
        }

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: config.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            transform: {
                left: domLeft,
                top: domTop,
                width: domWidth,
                height: domHeight,
            } as ITransformState,
            data,
            allowTransform,
        };

        {
            const { unitId, subUnitId, drawingId } = sheetDrawingParam;
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            // const floatDomParam = this._drawingManagerService.getDrawingByParam(sheetDrawingParam) as IFloatDomData;
            const floatDomParam = sheetDrawingParam;

            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return;
            }

            const activeSheetId = workbook.getActiveSheet().getSheetId();

            if (!floatDomParam || !target) {
                return;
            }

            const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
            if (!skeleton) {
                return;
            }

            const { transform, drawingType, data } = floatDomParam;

            if (drawingType !== DrawingTypeEnum.DRAWING_DOM && drawingType !== DrawingTypeEnum.DRAWING_CHART) {
                return;
            }

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }
            const { scene, canvas } = renderObject;

            if (transform == null) {
                return;
            }

            if (activeSheetId !== subUnitId) {
                return;
            }

            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            const rectShape = scene.getObject(rectShapeKey);

            if (rectShape != null) {
                rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                return;
            }

            const domConfig: IRectProps = {
                left,
                top,
                width,
                height,
                zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
            };

            const domRect = new Rect(rectShapeKey, domConfig);
            scene.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
            if (floatDomParam.allowTransform !== false) {
                scene.attachTransformerTo(domRect);
            }
            const map = this._ensureMap(unitId, subUnitId);
            const disposableCollection = new DisposableCollection();

            const viewMain = scene.getMainViewport();
            const boundsOfViewArea: IBoundRectNoAngle = {
                top: 0, //viewMain.top,
                left: viewMain.left,
                bottom: viewMain.bottom,
                right: viewMain.right,
            };
            // why call twice? there is another calcPosition below.
            const floatDomInfo = {
                dispose: disposableCollection,
                rect: domRect,
                // position$,
                unitId,
                subUnitId,
                boundsOfViewArea,
                scrollDirectionResponse: ScrollDirectionResponse.HORIZONTAL,
            } as unknown as ICanvasFloatDomInfo;

            const initedPosition = calcPosition(domRect, renderObject.renderUnit, skeleton.skeleton, target.worksheet, floatDomInfo);
            const position$ = new BehaviorSubject<IFloatDomLayout>(initedPosition);
            floatDomInfo.position$ = position$;

            let floatDomCfg: IFloatDom = {
                position$,
                id: drawingId,
                componentKey: floatDomParam.componentKey,
                onPointerDown: () => { },
                onPointerMove: () => { },
                onPointerUp: () => { },
                onWheel: (evt: WheelEvent) => {
                    canvas.dispatchEvent(new WheelEvent(evt.type, evt));
                },
                props: map.get(drawingId)?.props ?? this._getFloatDomProps(drawingId),
                data,
                unitId,
            };
            if (config.eventPassThrough) {
                floatDomCfg = { ...floatDomCfg,
                                onPointerDown: (evt) => {
                                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                                },
                                onPointerMove: (evt: PointerEvent | MouseEvent) => {
                                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                                },
                                onPointerUp: (evt: PointerEvent | MouseEvent) => {
                                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                                },
                };
            }
            this._canvasFloatDomService.addFloatDom(floatDomCfg);

            const listener = domRect.onTransformChange$.subscribeEvent(() => {
                const newPosition = calcPosition(domRect, renderObject.renderUnit, skeleton.skeleton, target.worksheet, floatDomInfo);
                position$.next(
                    newPosition
                );
            });

            disposableCollection.add(() => {
                this._canvasFloatDomService.removeFloatDom(drawingId);
            });
            listener && disposableCollection.add(listener);
            this._domLayerInfoMap.set(drawingId, floatDomInfo);
            map.set(drawingId, {
                ...map.get(drawingId),
            });
        }

        return {
            id,
            dispose: () => {
                this._removeDom(id, true);
            },
        };
    }

    /**
     * Unlike _createCellPositionObserver, this accept a range not a single cell.
     *
     * @param initialRow
     * @param initialCol
     * @param currentRender
     * @param skeleton
     * @param activeViewport
     * @returns position of cell to canvas.
     */
    private _createRangePositionObserver(
        range: IRange,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton
        // activeViewport: Viewport
    ) {
        // window.sk = skeleton;
        let { startRow, startColumn } = range;
        const topLeftCoord = calcCellPositionByCell(startRow, startColumn, skeleton);
        const topLeftPos$ = new BehaviorSubject(topLeftCoord);

        const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
        // const rightBottomCellWidth = skeleton.getColWidth(range.endColumn);
        // const rightBottomCellHeight = skeleton.getRowHeight(range.endRow);

        const rightBottomPos$ = new BehaviorSubject(rightBottomCoord);

        const updatePosition = () => {
            const topLeftCoord = calcCellPositionByCell(startRow, startColumn, skeleton);
            const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);

            topLeftPos$.next(topLeftCoord);
            rightBottomPos$.next(rightBottomCoord);
        };

        const disposable = new DisposableCollection();
        disposable.add(currentRender.engine.clientRect$.subscribe(() => updatePosition()));

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                if (params.rowsAutoHeightInfo.findIndex((item) => item.row === startRow) > -1) {
                    updatePosition();
                    return;
                }
            }

            if (
                COMMAND_LISTENER_SKELETON_CHANGE.indexOf(commandInfo.id) > -1 ||
                commandInfo.id === SetScrollOperation.id ||
                commandInfo.id === SetZoomRatioOperation.id
            ) {
                updatePosition();
            }
        }));

        const updateRowCol = (newRow: number, newCol: number) => {
            startRow = newRow;
            startColumn = newCol;

            updatePosition();
        };
        // const position$ = combineLatest(topLeftPos$, rightBottomPos$);
        // rotate: number;
        // width: number;
        // height: number;
        // absolute: {
        //     left: boolean;
        //     top: boolean;
        // };

        const genPosition = () => {
            return {
                rotate: 0,
                width: rightBottomCoord.right - topLeftCoord.left,
                height: rightBottomCoord.bottom - topLeftCoord.top,
                absolute: {
                    left: true,
                    top: true,
                },
                startX: topLeftCoord.left,
                startY: topLeftCoord.top,
                endX: rightBottomCoord.right,
                endY: rightBottomCoord.bottom,
            };
        };
        const position$ = topLeftPos$.pipe(
            map((topLeft) => {
                const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
                console.log('service', topLeft.left, topLeft.top);
                return {
                    rotate: 0,
                    width: rightBottomCoord.right - topLeft.left,
                    height: rightBottomCoord.bottom - topLeft.top,
                    absolute: {
                        left: true,
                        top: true,
                    },
                    startX: topLeft.left,
                    startY: topLeft.top,
                    endX: rightBottomCoord.right,
                    endY: rightBottomCoord.bottom,
                } as IFloatDomLayout;
            })
        );
        const position: IFloatDomLayout = genPosition();
        console.log('init position', position);

        return {
            position$,
            position,
            updateRowCol,
            topLeftPos$,
            rightBottomPos$,
            disposable,
        };
    }
}

/**
 * Unlike sheet popup, this Position only relative to sheet content, not window.
 * @param row
 * @param col
 * @param currentRender
 * @param skeleton
 * @param activeViewport
 * @returns
 */
function calcCellPositionByCell(
    row: number,
    col: number,
    // currentRender: IRender,
    skeleton: SpreadsheetSkeleton
    // activeViewport?: Viewport
): IBoundRectNoAngle {
    // const { scene, engine } = currentRender;

    const primaryWithCoord = skeleton.getCellWithCoordByIndex(row, col);
    const cellInfo = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

    // const { scaleX, scaleY } = scene.getAncestorScale();
    // const scrollXY = {
    //     x: activeViewport.viewportScrollX,
    //     y: activeViewport.viewportScrollY,
    // };

    // const canvasElement = engine.getCanvasElement();
    // const canvasClientRect = canvasElement.getBoundingClientRect();

    // We should take the scale into account when canvas is scaled by CSS.
    // const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
    // const { top, left, width } = canvasClientRect; // real width affected by scale
    // const scaleAdjust = width / widthOfCanvas;

    return {
        left: cellInfo.startX,
        right: cellInfo.endX,
        top: cellInfo.startY,
        bottom: cellInfo.endY,
    };
}

function calculateOffset(value: number | string | undefined, rangeWidth: number): number {
    if (value === undefined) return 0;

    // 如果是数字直接返回
    if (typeof value === 'number') return value;

    // 处理百分比字符串
    const percentage = Number.parseFloat(value);
    return (rangeWidth * percentage) / 100;
}
