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
import { BehaviorSubject, filter, map, of, Subject, switchMap, take } from 'rxjs';
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
export interface ICanvasFloatDomInfo {
    position$: BehaviorSubject<IFloatDomLayout>;
    dispose: IDisposable;
    rect: Rect;
    unitId: string;
    subUnitId: string;
    boundsOfViewArea?: IBoundRectNoAngle;
    scrollDirectionResponse?: ScrollDirectionResponse; // update float dom pos by scrolling
    domAnchor?: IDOMAnchor;
    id: string;
}

export interface IDOMAnchor {
    width: number;
    height: number;
    horizonOffsetAlign?: 'left' | 'right';
    verticalOffsetAlign?: 'top' | 'bottom';
    marginX?: number | string;
    marginY?: number | string;
}

export interface ILimitBound extends IBoundRectNoAngle {
    /**
     * Actually, it means fixed.
     * When left is true, dom is fixed to left of dom pos when dom width is shrinking. or dom is fixed to right of dom pos when dom width is shrinking.
     * When top is true, dom is fixed to top of dom pos when dom height is shrinking. or dom is fixed to bottom of dom pos when dom height is shrinking.
     */
    absolute: {
        left: boolean;
        top: boolean;
    };
}

/**
 * Adjust dom bound size when scrolling (dom bound would shrink when scrolling if over the edge of viewMain)
 * @param posOfFloatObject  The position of float object, relative to sheet content, scale & scrolling does not affect it.
 * @param scene
 * @param skeleton
 * @param worksheet
 * @returns ILimitBound
 */
// eslint-disable-next-line max-lines-per-function
export function transformBound2DOMBound(posOfFloatObject: IBoundRectNoAngle, scene: Scene, skeleton: SpreadsheetSkeleton, worksheet: Worksheet, floatDomInfo?: ICanvasFloatDomInfo, skipBoundsOfViewArea = false): ILimitBound {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

    const freeze = worksheet.getFreeze();
    const { startColumn: viewMainStartColumn, startRow: viewMainStartRow, xSplit: freezedCol, ySplit: freezedRow } = freeze;
    /**
     * Actually, it means fixed.
     */
    const absolute = {
        left: true, // left means the left of pic is in a viewMainLeft
        top: true,
    };

    if (!viewMain) {
        return {
            ...posOfFloatObject,
            absolute,
        };
    }
    const { left, right, top, bottom } = posOfFloatObject;
    let { top: viewBoundsTop, left: viewBoundsLeft, viewportScrollX, viewportScrollY } = viewMain;
    // specify edge of viewbound. if not specify, use viewMain.
    const { boundsOfViewArea: specBoundsOfViewArea, scrollDirectionResponse } = floatDomInfo || {};
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const boundsOfViewArea = {
        top: skipBoundsOfViewArea ? 0 : columnHeaderHeight,
        left: skipBoundsOfViewArea ? 0 : rowHeaderWidth,
    };
    if (specBoundsOfViewArea) {
        if (Tools.isDefine(boundsOfViewArea.top)) {
            boundsOfViewArea.top = specBoundsOfViewArea.top;
        }
        if (Tools.isDefine(boundsOfViewArea.left)) {
            boundsOfViewArea.left = specBoundsOfViewArea.left;
        }
    }
    if (scrollDirectionResponse === ScrollDirectionResponse.HORIZONTAL) {
        viewportScrollY = 0;
    }
    if (scrollDirectionResponse === ScrollDirectionResponse.VERTICAL) {
        viewportScrollX = 0;
    }

    let offsetLeft: number = 0;
    let offsetRight: number = 0;

    /**
     * freezed viewport start & end position
     */
    const freezeStartY = skeleton.rowStartY(viewMainStartRow - freezedRow) + columnHeaderHeight;
    const freezeStartX = skeleton.colStartX(viewMainStartColumn - freezedCol) + rowHeaderWidth;
    const freezeEndY = skeleton.rowStartY(viewMainStartRow) + columnHeaderHeight;
    const freezeEndX = skeleton.colStartX(viewMainStartColumn) + rowHeaderWidth;

    if (freezedCol === 0) {
        absolute.left = false;
        offsetLeft = (left - viewportScrollX) * scaleX;
        offsetRight = (right - viewportScrollX) * scaleX;
    } else {
        // freeze
        // viewMainLeft may not start at col = 0
        // DO NOT use viewMainLeft?.viewBound.right. It's not accurate. there is a delay to set viewBound!
        const leftToCanvas = left - (freezeStartX - rowHeaderWidth);
        const rightToCanvas = right - (freezeStartX - rowHeaderWidth);
        if (right < freezeEndX) {
            offsetLeft = leftToCanvas * scaleX;
            offsetRight = rightToCanvas * scaleX;
        } else if (left <= freezeEndX && right >= freezeEndX) {
            offsetLeft = leftToCanvas * scaleX;
            offsetRight = Math.max(viewBoundsLeft, (right - viewportScrollX) * scaleX);
        } else if (left > freezeEndX) {
            absolute.left = false;
            offsetLeft = Math.max((left - viewportScrollX) * scaleX, viewBoundsLeft);
            offsetRight = Math.max((right - viewportScrollX) * scaleX, viewBoundsLeft);
        }
    }

    let offsetTop: number = 0;
    let offsetBottom: number = 0;
    if (freezedRow === 0) {
        absolute.top = false;
        offsetTop = (top - viewportScrollY) * scaleY;
        offsetBottom = (bottom - viewportScrollY) * scaleY;
    } else {
        const topToCanvas = top - (freezeStartY - columnHeaderHeight);
        const bottomToCanvas = bottom - (freezeStartY - columnHeaderHeight);
        if (bottom < freezeEndY) {
            offsetTop = topToCanvas * scaleY;
            offsetBottom = bottomToCanvas * scaleY;
        } else if (top <= freezeEndY && bottom >= freezeEndY) {
            offsetTop = topToCanvas * scaleY;
            offsetBottom = Math.max(viewBoundsTop, (bottom - viewportScrollY) * scaleY);
        } else if (top > freezeEndY) {
            absolute.top = false;
            offsetTop = Math.max((top - viewportScrollY) * scaleY, viewBoundsTop);
            offsetBottom = Math.max((bottom - viewportScrollY) * scaleY, viewBoundsTop);
        }
    }

    offsetLeft = Math.max(offsetLeft, boundsOfViewArea.left);
    offsetTop = Math.max(offsetTop, boundsOfViewArea.top);
    offsetRight = Math.max(offsetRight, boundsOfViewArea.left);
    offsetBottom = Math.max(offsetBottom, boundsOfViewArea.top);

    const rs = {
        left: offsetLeft,
        right: offsetRight,
        top: offsetTop,
        bottom: offsetBottom,
        absolute,
    };
    return rs;
}

/**
 * Calculate the position of the floating dom, limited by bounds of viewMain in transformBound2DOMBound
 * @param floatObject
 * @param renderUnit
 * @param skeleton
 * @param worksheet
 * @returns {IFloatDomLayout} position
 */
export const calcSheetFloatDomPosition = (
    floatObject: BaseObject,
    scene: Scene,
    skeleton: SpreadsheetSkeleton,
    worksheet: Worksheet,
    floatDomInfo?: ICanvasFloatDomInfo
): IFloatDomLayout => {
    const { left, top, width, height, angle } = floatObject;
    const boundOfFloatObject: IBoundRectNoAngle = {
        left,
        right: left + width,
        top,
        bottom: top + height,
    };

    const offsetBound = transformBound2DOMBound(boundOfFloatObject, scene, skeleton, worksheet, floatDomInfo);
    const { scaleX, scaleY } = scene.getAncestorScale();

    const domPos: IFloatDomLayout = {
        startX: offsetBound.left,
        endX: offsetBound.right,
        startY: offsetBound.top,
        endY: offsetBound.bottom,
        rotate: angle,
        width: width * scaleX,
        height: height * scaleY,
        absolute: offsetBound.absolute,
    };

    return domPos;
};

export class SheetCanvasFloatDomManagerService extends Disposable {
    /**
     * for update dom container position when scrolling and zoom
     */
    private _domLayerInfoMap: Map<string, ICanvasFloatDomInfo> = new Map();

    private _transformChange$ = new Subject<{ id: string; value: ITransformState }>();
    transformChange$ = this._transformChange$.asObservable();

    private _add$ = new Subject<{ unitId: string; subUnitId: string; id: string; data?: Record<string, any> }>();
    public add$ = this._add$.asObservable();

    private _remove$ = new Subject<{ unitId: string; subUnitId: string; id: string }>();
    remove$ = this._remove$.asObservable();

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

    getFloatDomInfo(id: string) {
        return this._domLayerInfoMap.get(id);
    }

    getFloatDomsBySubUnitId(unitId: string, subUnitId: string) {
        return Array.from(this._domLayerInfoMap.values()).filter((info) => info.subUnitId === subUnitId && info.unitId === unitId);
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

    // eslint-disable-next-line max-lines-per-function
    private _drawingAddListener() {
        this.disposeWithMe(

            // eslint-disable-next-line max-lines-per-function
            this._drawingManagerService.add$.subscribe((params: IDrawingSearch[]) => {
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

                    const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
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
                    imageConfig.rotateEnabled = false;

                    if (isChart) {
                        const backgroundColor = data ? (data as Record<string, string>).backgroundColor : 'white';
                        imageConfig.fill = backgroundColor;

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
                    const disposableCollection = new DisposableCollection();
                    const initPosition = calcSheetFloatDomPosition(rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet);
                    const position$ = new BehaviorSubject<IFloatDomLayout>(initPosition);

                    const info: ICanvasFloatDomInfo = {
                        dispose: disposableCollection,
                        rect,
                        position$,
                        unitId,
                        subUnitId,
                        id: drawingId,
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
                        data,
                        unitId,
                    });

                    const listener = rect.onTransformChange$.subscribeEvent(() => {
                        const newPosition = calcSheetFloatDomPosition(rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet);
                        position$.next(
                            newPosition
                        );
                    });

                    disposableCollection.add(() => {
                        this._canvasFloatDomService.removeFloatDom(drawingId);
                    });
                    listener && disposableCollection.add(listener);
                    this._domLayerInfoMap.set(drawingId, info);
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
                        scene.getTransformer()?.clearSelectedObjects();
                    }
                });
            })
        );
    }

    private _scrollUpdateListener() {
        const updateSheet = (unitId: string, subUnitId: string) => {
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            const ids = Array.from(this._domLayerInfoMap.keys())
                .map((id) => ({ id, ...this._domLayerInfoMap.get(id) }))
                .filter((info) => info.subUnitId === subUnitId && info.unitId === unitId)
                .map((info) => info.id);
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
            if (!renderObject || !target || !skeleton) {
                return;
            }
            ids.forEach((id) => {
                const floatDomInfo = this._domLayerInfoMap.get(id);
                if (floatDomInfo) {
                    const position = calcSheetFloatDomPosition(floatDomInfo.rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
                    floatDomInfo.position$.next(position);
                }
            });
        };

        // #region scroll
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
                switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null)),
                map((worksheet) => {
                    if (!worksheet) return null;
                    const unitId = worksheet.getUnitId();
                    const render = this._renderManagerService.getRenderById(unitId);
                    return render ? { render, unitId, subUnitId: worksheet.getSheetId() } : null;
                }),
                switchMap((render) =>
                    render
                        ? fromEventSubject(render.render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!.onScrollAfter$)
                            .pipe(map(() => ({ unitId: render.unitId, subUnitId: render.subUnitId })))
                        : of(null)
                )
            ).subscribe((value) => {
                if (!value) return; // TODO@weird94: maybe we should throw an error here and do some cleaning work?

                const { unitId, subUnitId } = value;
                updateSheet(unitId, subUnitId);
            })
        );

        //#endregion

        // #region zoom
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetZoomRatioOperation.id) {
                const params = (commandInfo.params) as any;
                const { unitId } = params;
                const subUnitIds = Array.from(this._domLayerInfoMap.values()).filter((info) => info.unitId === unitId).map((info) => info.subUnitId);
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
            const param = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId: id });
            if (!param) {
                return;
            }
            const jsonOp = this._sheetDrawingService.getBatchRemoveOp([param]) as IDrawingJsonUndo1;

            const { redo, objects } = jsonOp;
            this._commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE });
        }
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    addFloatDomToRange(range: IRange, config: ICanvasFloatDom, domAnchor: Partial<IDOMAnchor>, propId?: string) {
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

        const { componentKey, data, allowTransform = true } = config;
        const id = propId ?? generateRandomId();

        const { position: rangePosition, position$: rangePos$ } = this._createRangePositionObserver(range, currentRender, skeletonParam.skeleton);
        const sheetTransform = this._getPosition(rangePosition, unitId);
        if (sheetTransform == null) {
            return;
        }

        const scene = renderObject.scene;
        const { scaleX } = scene.getAncestorScale();
        const domPosFromRange = calcDomPositionByAnchor(rangePosition, domAnchor, scaleX);

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: config.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            transform: {
                left: domPosFromRange.startX,
                top: domPosFromRange.startY,
                width: domPosFromRange.width,
                height: domPosFromRange.height,
            } as ITransformState,
            data,
            allowTransform,
        };

        {
            const { unitId, subUnitId, drawingId } = sheetDrawingParam;
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            const floatDomParam = sheetDrawingParam;

            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return;
            }

            const activeSheetId = workbook.getActiveSheet().getSheetId();

            if (!floatDomParam || !target) {
                return;
            }

            const skMangerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
            if (!skMangerService) {
                return;
            }
            const skeletonParam = skMangerService.getWorksheetSkeleton(subUnitId);
            if (!skeletonParam) {
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
            // from floatDomParam.transform
            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            const rectShape = scene.getObject(rectShapeKey);

            if (rectShape != null) {
                rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                return;
            }

            const domConfig: IRectProps = {
                left, // from floatDomParam.transform
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
            const disposableCollection = new DisposableCollection();

            const viewMain = scene.getMainViewport();
            const { rowHeaderWidth, columnHeaderHeight } = skeletonParam.skeleton;

            const boundsOfViewArea: IBoundRectNoAngle = {
                top: columnHeaderHeight,
                left: rowHeaderWidth,
                bottom: viewMain.bottom,
                right: viewMain.right,
            };

            const floatDomInfo = {
                dispose: disposableCollection,
                rect: domRect,
                boundsOfViewArea,
                domAnchor,
                unitId,
                subUnitId,
            } as unknown as ICanvasFloatDomInfo;

            const initedPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeletonParam.skeleton, target.worksheet, floatDomInfo);
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
                data,
                unitId,
            };
            if (config.eventPassThrough) {
                floatDomCfg = {
                    ...floatDomCfg,
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

            this.disposeWithMe(rangePos$.subscribe((newRangePos) => {
                const calcOffsetPos = calcDomPositionByAnchor({
                    rotate: 0,
                    startX: newRangePos.startX,
                    startY: newRangePos.startY,
                    endX: newRangePos.endX,
                    endY: newRangePos.endY,
                    width: domAnchor.width ?? newRangePos.width,
                    height: domAnchor.height ?? newRangePos.height,
                    absolute: {
                        left: rangePosition.absolute.left,
                        top: rangePosition.absolute.top,
                    },
                }, domAnchor);
                const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                const newRect = new Rect(rectShapeKey, {
                    left: calcOffsetPos.startX,
                    top: calcOffsetPos.startY,
                    width: domAnchor.width ?? newRangePos.width,
                    height: domAnchor.height ?? newRangePos.height,
                    zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
                });
                const newPos = calcSheetFloatDomPosition(newRect, renderObject.renderUnit.scene, skeletonParam.skeleton, target.worksheet, floatDomInfo);
                position$.next(newPos);
            }));
            const skm = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);

            skm?.currentSkeleton$.subscribe((skeleton) => {
                if (!skeleton) return;
                if (skeletonParam.sheetId !== skeleton.sheetId) {
                    this._removeDom(id, true);
                }
            });

            const listener = domRect.onTransformChange$.subscribeEvent(() => {
                const newPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeletonParam.skeleton, target.worksheet, floatDomInfo);
                position$.next(
                    newPosition
                );
            });

            disposableCollection.add(() => {
                this._canvasFloatDomService.removeFloatDom(drawingId);
            });
            listener && disposableCollection.add(listener);
            this._domLayerInfoMap.set(drawingId, floatDomInfo);
        }

        return {
            id,
            dispose: () => {
                this._removeDom(id, true);
            },
        };
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    addFloatDomToColumnHeader(column: number, config: ICanvasFloatDom, domLayoutParam: IDOMAnchor, propId?: string) {
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

        const { componentKey, data, allowTransform = true } = config;
        const id = propId ?? generateRandomId();

        // rangePostion relative to canvas.(if no scrolling)
        const { position: rangePosition, position$: rangePos$ } = this._createRangePositionObserver({
            startRow: 0,
            endRow: 0,
            startColumn: column,
            endColumn: column,
        }, currentRender, skeletonParam.skeleton);
        const headerCellPosition = rangePosition;
        headerCellPosition.startY = 0; // for column header

        const sheetTransform = this._getPosition(rangePosition, unitId);
        if (sheetTransform == null) {
            return;
        }

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: config.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            transform: {
                left: headerCellPosition.startX,
                top: headerCellPosition.startY,
                width: headerCellPosition.width,
                height: headerCellPosition.height,
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

            const skMangerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
            if (!skMangerService) {
                return;
            }
            const skeleton = skMangerService.getWorksheetSkeleton(subUnitId);
            if (!skeleton) {
                return;
            }

            const { transform, data } = floatDomParam;

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

            const calcOffsetPos = calcDomPositionByAnchor({
                rotate: 0,
                startX: headerCellPosition.startX,
                startY: 0,
                endX: rangePosition.endX,
                endY: rangePosition.endY,
                width: domLayoutParam.width,
                height: domLayoutParam.height,
                absolute: {
                    left: rangePosition.absolute.left,
                    top: rangePosition.absolute.top,
                },
            }, domLayoutParam);
            const headerRectConfig: IRectProps = {
                left: calcOffsetPos.startX,
                top: calcOffsetPos.startY,
                width: calcOffsetPos.width,
                height: calcOffsetPos.height,
                zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
            };

            const domRect = new Rect(rectShapeKey, headerRectConfig);
            scene.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
            if (floatDomParam.allowTransform !== false) {
                scene.attachTransformerTo(domRect);
            }
            const disposableCollection = new DisposableCollection();

            const viewMain = scene.getMainViewport();
            const boundsOfViewArea: IBoundRectNoAngle = {
                top: 0, //viewMain.top,
                left: viewMain.left,
                bottom: viewMain.bottom,
                right: viewMain.right,
            };
            const floatDomInfo = {
                dispose: disposableCollection,
                rect: domRect,
                // position$,
                unitId,
                subUnitId,
                boundsOfViewArea,
                domAnchor: domLayoutParam,
                scrollDirectionResponse: ScrollDirectionResponse.HORIZONTAL,
            } as unknown as ICanvasFloatDomInfo;

            const initedPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
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
                data,
                unitId,
            };
            if (config.eventPassThrough) {
                floatDomCfg = {
                    ...floatDomCfg,
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
                const newPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
                position$.next(
                    newPosition
                );
            });

            this.disposeWithMe(rangePos$.subscribe((newHeaderPos) => {
                const calcOffsetPos = calcDomPositionByAnchor({
                    rotate: 0,
                    startX: newHeaderPos.startX,
                    startY: 0,
                    endX: newHeaderPos.endX,
                    endY: newHeaderPos.endY,
                    width: domLayoutParam.width,
                    height: domLayoutParam.height,
                    absolute: {
                        left: rangePosition.absolute.left,
                        top: rangePosition.absolute.top,
                    },
                }, domLayoutParam);
                const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                const newRect = new Rect(rectShapeKey, {
                    left: calcOffsetPos.startX,
                    top: 0,
                    width: domLayoutParam.width,
                    height: domLayoutParam.height,
                    zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
                });
                const newPos = calcSheetFloatDomPosition(newRect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
                position$.next(newPos);
            }));

            const skm = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
            skm?.currentSkeleton$.subscribe((skeleton) => {
                if (!skeleton) return;
                if (skeletonParam.sheetId !== skeleton.sheetId) {
                    this._removeDom(id, true);
                }
            });

            disposableCollection.add(() => {
                this._canvasFloatDomService.removeFloatDom(drawingId);
            });
            listener && disposableCollection.add(listener);
            this._domLayerInfoMap.set(drawingId, floatDomInfo);
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
    // eslint-disable-next-line max-lines-per-function
    private _createRangePositionObserver(
        range: IRange,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton
    ) {
        let { startRow, startColumn } = range;
        const topLeftCoord = calcCellPositionByCell(startRow, startColumn, skeleton);
        const topLeftPos$ = new BehaviorSubject(topLeftCoord);

        const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
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
    skeleton: SpreadsheetSkeleton
): IBoundRectNoAngle {
    const primaryWithCoord = skeleton.getCellWithCoordByIndex(row, col);
    const cellInfo = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

    return {
        left: cellInfo.startX,
        right: cellInfo.endX,
        top: cellInfo.startY,
        bottom: cellInfo.endY,
    };
}

function calcDomPositionByAnchor(rangePosition: IFloatDomLayout, domAnchor?: Partial<IDOMAnchor>, scale?: number): IFloatDomLayout {
    scale = scale ?? 1;

    const rangeWidth = rangePosition.endX - rangePosition.startX;
    const rangeHeight = rangePosition.endY - rangePosition.startY;
    const domWidth = domAnchor?.width ?? rangeWidth;
    const domHeight = domAnchor?.height ?? rangeHeight;

    let domLeft = 0;
    let domTop = 0;

    if (domAnchor) {
        if (domAnchor.horizonOffsetAlign === 'right') {
            const offsetX = calculateOffset(domAnchor.marginX, rangeWidth * scale);
            domLeft = rangePosition.endX - offsetX - domWidth;
        } else {
            // default align left
            domLeft = rangePosition.startX + calculateOffset(domAnchor.marginX, rangeWidth);
        }

        if (domAnchor.verticalOffsetAlign === 'bottom') {
            const offsetY = calculateOffset(domAnchor.marginY, rangeHeight * scale);
            domTop = rangePosition.endY - offsetY - domHeight;
        } else {
            domTop = rangePosition.startY + calculateOffset(domAnchor.marginY, rangeHeight);
        }
    }

    return {
        rotate: 0,
        startX: domLeft,
        startY: domTop,
        endX: rangePosition.endX,
        endY: rangePosition.endY,
        width: domWidth,
        height: domHeight,
        absolute: {
            left: rangePosition.absolute.left,
            top: rangePosition.absolute.top,
        },
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
