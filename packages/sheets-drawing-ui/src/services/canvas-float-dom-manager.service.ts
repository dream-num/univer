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

import type { IDisposable, IPosition, ITransformState, Nullable, Serializable, Workbook, Worksheet } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { BaseObject, IBoundRectNoAngle, IRectProps, IRender, Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISetFrozenMutationParams } from '@univerjs/sheets';
import type { IFloatDomData, ISheetDrawingPosition, ISheetFloatDom } from '@univerjs/sheets-drawing';
import type { IFloatDomLayout } from '@univerjs/ui';
import type { IInsertDrawingCommandParams } from '../commands/commands/interfaces';
import { Disposable, DisposableCollection, DrawingTypeEnum, fromEventSubject, generateRandomId, ICommandService, Inject, IUniverInstanceService, LifecycleService, LifecycleStages, UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';

import { DRAWING_OBJECT_LAYER_INDEX, IRenderManagerService, ObjectType, Rect, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { getSheetCommandTarget, SetFrozenMutation } from '@univerjs/sheets';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService, SetZoomRatioOperation, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
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
}

interface ICanvasFloatDomInfo {
    position$: BehaviorSubject<IFloatDomLayout>;
    dispose: IDisposable;
    rect: Rect;
    unitId: string;
    subUnitId: string;
}

export function transformBound2DOMBound(originBound: IBoundRectNoAngle, scene: Scene, skeleton: SpreadsheetSkeleton, worksheet: Worksheet) {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    const absolute = {
        left: true,
        top: true,
    };

    if (!viewMain) {
        return {
            ...originBound,
            absolute,
        };
    }
    const { left, right, top, bottom } = originBound;
    const freeze = worksheet.getFreeze();
    const { startColumn, startRow, xSplit, ySplit } = freeze;
    // freeze start
    const startSheetView = skeleton.getNoMergeCellPositionByIndexWithNoHeader(startRow - ySplit, startColumn - xSplit);
    //  freeze end
    const endSheetView = skeleton.getNoMergeCellPositionByIndexWithNoHeader(startRow, startColumn);
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const freezeWidth = endSheetView.startX - startSheetView.startX;
    const freezeHeight = endSheetView.startY - startSheetView.startY;

    const { top: freezeTop, left: freezeLeft, viewportScrollX: actualScrollX, viewportScrollY: actualScrollY } = viewMain;
    let offsetLeft: number;
    let offsetRight: number;

    // viewMain or viewTop
    if (left < freezeLeft) {
        absolute.left = true;
        offsetLeft = ((freezeWidth + rowHeaderWidth) + (left - freezeLeft)) * scaleX;
        offsetRight = Math.max(
            Math.min(
                ((freezeWidth + rowHeaderWidth) + (right - freezeLeft)) * scaleX,
                (freezeWidth + rowHeaderWidth) * scaleX
            ),
            (right - actualScrollX) * scaleX);
    } else {
        absolute.left = false;
        offsetLeft = Math.max((left - actualScrollX) * scaleX, (freezeWidth + rowHeaderWidth) * scaleX);
        offsetRight = Math.max((right - actualScrollX) * scaleX, (freezeWidth + rowHeaderWidth) * scaleX);
    }

    let offsetTop: number;
    let offsetBottom: number;
    // viewMain or viewTop
    if (top < freezeTop) {
        absolute.top = true;
        offsetTop = ((freezeHeight + columnHeaderHeight) + (top - freezeTop)) * scaleY;
        offsetBottom = Math.max(
            Math.min(
                ((freezeHeight + columnHeaderHeight) + (right - freezeTop)) * scaleY,
                (freezeHeight + columnHeaderHeight) * scaleY
            ),
            (bottom - actualScrollY) * scaleY
        );
    } else {
        absolute.top = false;
        offsetTop = Math.max((top - actualScrollY) * scaleY, (freezeHeight + columnHeaderHeight) * scaleY);
        offsetBottom = Math.max((bottom - actualScrollY) * scaleY, (freezeHeight + columnHeaderHeight) * scaleY);
    }

    return {
        left: offsetLeft,
        right: offsetRight,
        top: offsetTop,
        bottom: offsetBottom,
        absolute,
    };
}

const calcPosition = (
    targetObject: BaseObject,
    currentRender: IRender,
    skeleton: SpreadsheetSkeleton,
    worksheet: Worksheet
): IFloatDomLayout => {
    const { scene } = currentRender;
    const { left, top, width, height, angle } = targetObject;
    const bound: IBoundRectNoAngle = {
        left,
        right: left + width,
        top,
        bottom: top + height,
    };

    const offsetBound = transformBound2DOMBound(bound, scene, skeleton, worksheet);
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

        const renderObject = this._renderManagerService.getRenderById(unitId);

        const scene = renderObject?.scene;

        if (renderObject == null || scene == null) {
            return null;
        }

        const transformer = scene.getTransformerByCreate();
        const canvas = renderObject.engine.getCanvasElement();

        return { scene, transformer, renderObject, canvas };
    }

    private _getFloatDomProps(id: string) {
        let props;
        this._hooks.forEach((hook) => {
            props = hook.onGetFloatDomProps(id);
        });

        return props;
    }

    // eslint-disable-next-line max-lines-per-function
    private _drawingAddListener() {
        this.disposeWithMe(
            // eslint-disable-next-line max-lines-per-function
            this._drawingManagerService.add$.subscribe((params) => {
                // eslint-disable-next-line max-lines-per-function
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
                    const initPosition = calcPosition(rect, renderObject.renderObject, skeleton.skeleton, target.worksheet);
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
                        const newPosition = calcPosition(rect, renderObject.renderObject, skeleton.skeleton, target.worksheet);
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
                const info = this._domLayerInfoMap.get(id);
                if (info) {
                    const position = calcPosition(info.rect, renderObject.renderObject, skeleton.skeleton, target.worksheet);
                    info.position$.next(position);
                }
            });
        };

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
}
