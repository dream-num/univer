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

import type { DrawingTypeEnum, ICommandInfo, IDrawingParam, IDrawingSearch, ITransformState, Nullable } from '@univerjs/core';
import type { IDrawingGroupUpdateParam, IDrawingOrderMapParam } from '@univerjs/drawing';
import type { BaseObject, Image, IShapeProps, Scene, Shape } from '@univerjs/engine-render';
import type { ISetDrawingAlignOperationParams } from '../commands/operations/drawing-align.operation';
import {
    checkIfMove,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    toDisposable,
} from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, Group, IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import { AlignType, SetDrawingAlignOperation } from '../commands/operations/drawing-align.operation';
import { CloseImageCropOperation } from '../commands/operations/image-crop.operation';
import { getUpdateParams } from '../utils/get-update-params';
import { getCurrentUnitInfo } from './utils';

interface IDrawingTransformCache {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    drawingType: DrawingTypeEnum;
    transform: ITransformState;
}

export class DrawingUpdateController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._recoveryImages();

        this._drawingAddListener();

        this._drawingRemoveListener();

        this._drawingUpdateListener();

        this._commandExecutedListener();

        this._drawingArrangeListener();

        this._drawingGroupListener();

        this._drawingRefreshListener();

        this._drawingVisibleListener();
    }

    private _recoveryImages() {
        const drawingList = this._drawingManagerService.drawingManagerData;

        const info = getCurrentUnitInfo(this._currentUniverService);
        if (info == null) {
            return;
        }

        const { unitId: currentUnitId, subUnitId: currentSubUnitId } = info;

        Object.keys(drawingList).forEach((unitId) => {
            Object.keys(drawingList[unitId]).forEach((subUnitId) => {
                const drawingMap = drawingList[unitId][subUnitId].data;
                if (drawingMap == null || unitId !== currentUnitId || subUnitId !== currentSubUnitId) {
                    return;
                }
                Object.keys(drawingMap).forEach((drawingId) => {
                    const drawing = drawingMap[drawingId];
                    if (drawing) {
                        this._insertDrawing([{ unitId, subUnitId, drawingId }]);
                    }
                });
            });
        });
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetDrawingAlignOperation.id) {
                    const params = command.params as ISetDrawingAlignOperationParams;
                    if (params == null) {
                        return;
                    }
                    this._drawingAlign(params);
                }
            })
        );
    }

    private _drawingGroupListener() {
        this.disposeWithMe(
            this._drawingManagerService.group$.subscribe((params) => {
                this._groupDrawings(params);
            })
        );

        this.disposeWithMe(
            this._drawingManagerService.ungroup$.subscribe((params) => {
                this._ungroupDrawings(params);
            })
        );
    }

    // private _drawingGroup(params: ISetImageGroupOperationParams) {
    //     const { groupType } = params;
    //     const drawings = this._drawingManagerService.getFocusDrawings();

    //     if (drawings.length === 0) {
    //         return;
    //     }

    //     switch (groupType) {
    //         case GroupType.group:
    //             this._groupDrawings(drawings);
    //             break;
    //         case GroupType.regroup:
    //             this._regroupDrawings(drawings);
    //             break;
    //         case GroupType.ungroup:
    //             this._ungroupDrawings(drawings);
    //             break;
    //         default:
    //             break;
    //     }
    // }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderObject = this._renderManagerService.getRenderById(unitId);

        const scene = renderObject?.scene;

        if (scene == null) {
            return null;
        }

        const transformer = scene.getTransformerByCreate();

        return { scene, transformer };
    }

    private _groupDrawings(drawings: IDrawingGroupUpdateParam[]) {
        drawings.forEach((drawing) => {
            this._groupDrawing(drawing);
        });
    }

    private _groupDrawing(params: IDrawingGroupUpdateParam) {
        const { parent, children } = params;

        const { unitId, subUnitId, drawingId } = parent;

        const renderObject = this._getSceneAndTransformerByDrawingSearch(parent.unitId);

        if (renderObject == null) {
            return;
        }

        const { scene, transformer } = renderObject;

        this._commandService.syncExecuteCommand(CloseImageCropOperation.id);

        const objects: BaseObject[] = [];

        children.forEach((drawing) => {
            const drawingShapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
            const object = scene.getObjectIncludeInGroup(drawingShapeKey);

            if (object == null || objects.includes(object)) {
                return;
            }

            objects.push(object);

            const { transform } = drawing;

            if (transform == null) {
                return;
            }

            if (object.classType === RENDER_CLASS_TYPE.GROUP) {
                object.transformByState({ left: transform.left, top: transform.top });
            } else {
                object.transformByState(transform);
            }

            // const group = object?.ancestorGroup;
            // if (group != null && objects.includes(group) === false) {
            //     objects.push(group);
            // } else if (object != null && objects.includes(object) === false) {
            //     objects.push(object);
            // }
        });

        if (objects.length === 0) {
            return;
        }

        const groupKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
        const group = new Group(groupKey);

        scene.addObject(group, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(group);

        group.addObjects(...objects);
        // group.reCalculateObjects();
        parent.transform && group.transformByState({ left: parent.transform.left, top: parent.transform.top });

        transformer.clearSelectedObjects();
        transformer.setSelectedControl(group);
    }

    // private _regroupDrawings(drawings: IDrawingSearch[]) {
    //     const renderObject = this._getSceneAndTransformerByDrawingSearch(drawings[0].unitId);

    //     if (renderObject == null) {
    //         return;
    //     }

    //     const { scene, transformer } = renderObject;

    //     const objects: BaseObject[] = [];

    //     let firstGroup: Nullable<Group> = null;

    //     drawings.forEach((drawing) => {
    //         const imageShapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
    //         const o = scene.getObject(imageShapeKey);

    //         if (o == null) {
    //             return true;
    //         }

    //         const group = o.ancestorGroup as Nullable<Group>;

    //         if (group != null && firstGroup == null) {
    //             firstGroup = group;
    //         } else if (group != null && !objects.includes(group)) {
    //             objects.push(group);
    //         } else if (!objects.includes(o)) {
    //             objects.push(o);
    //         }
    //     });

    //     if (firstGroup == null) {
    //         return;
    //     }

    //     if (objects.length === 0) {
    //         return;
    //     }

    //     (firstGroup as Group).addObjects(...objects);

    //     (firstGroup as Group).reCalculateObjects();

    //     transformer.clearSelectedObjects();

    //     transformer.setSelectedControl(firstGroup);
    // }

    private _ungroupDrawings(drawings: IDrawingGroupUpdateParam[]) {
        drawings.forEach((drawing) => {
            this._ungroupDrawing(drawing);
        });
    }

    private _ungroupDrawing(drawing: IDrawingGroupUpdateParam) {
        const { parent, children } = drawing;

        const renderObject = this._getSceneAndTransformerByDrawingSearch(parent.unitId);

        if (renderObject == null) {
            return;
        }

        const { scene, transformer } = renderObject;

        // const objects: BaseObject[] = [];

        children.forEach((drawing) => {
            const drawingKey = getDrawingShapeKeyByDrawingSearch(drawing);
            const object = scene.getObjectIncludeInGroup(drawingKey);

            if (object == null) {
                return true;
            }

            if (object == null) {
                return;
            }

            // objects.push(object);

            const { transform } = drawing;

            if (transform == null) {
                return;
            }

            if (object.classType === RENDER_CLASS_TYPE.GROUP) {
                object.transformByState({ left: transform.left, top: transform.top });
            } else {
                object.transformByState(transform);
            }

            // transform && object.transformByState(transform);

            // const group = o.ancestorGroup as Nullable<Group>;
            // if (group != null && !objects.includes(group)) {
            //     objects.push(group);
            // } else if (o instanceof Group && !objects.includes(o)) {
            //     objects.push(o);
            // }
        });

        const groupKey = getDrawingShapeKeyByDrawingSearch(parent);
        const group = scene.getObject(groupKey) as Group;
        const { width, height } = group;
        group.getObjects().forEach((object) => {
            group.removeSelfObjectAndTransform(object.oKey, width, height);
        });
        group.dispose();

        // if (objects.length === 0) {
        //     return;
        // }

        // objects.forEach((group) => {
        //     const { width, height } = group;
        //     group.getObjects().forEach((object) => {
        //         group.removeSelfObjectAndTransform(object.oKey, width, height);
        //     });
        //     group.dispose();
        // });

        transformer.clearSelectedObjects();
    }

    private _drawingAlign(params: ISetDrawingAlignOperationParams) {
        const { alignType } = params;
        const drawings = this._drawingManagerService.getFocusDrawings();

        if (alignType === AlignType.default) {
            return;
        }

        const drawingTransformCaches: IDrawingTransformCache[] = [];
        let minLeft = Number.POSITIVE_INFINITY;
        let minTop = Number.POSITIVE_INFINITY;
        let maxRight = Number.NEGATIVE_INFINITY;
        let maxBottom = Number.NEGATIVE_INFINITY;
        let drawingCount = 0;
        drawings.forEach((drawing) => {
            const { unitId, subUnitId, drawingId, drawingType } = drawing;
            const drawingParam = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId });

            if (drawingParam == null || drawingParam.transform == null) {
                return;
            }

            drawingTransformCaches.push({
                unitId,
                subUnitId,
                drawingId,
                drawingType,
                transform: drawingParam.transform,
            });

            const { left = 0, top = 0, width = 0, height = 0 } = drawingParam.transform;
            minLeft = Math.min(minLeft, left);
            minTop = Math.min(minTop, top);
            maxRight = Math.max(maxRight, left + width);
            maxBottom = Math.max(maxBottom, top + height);

            drawingCount++;
        });

        if (drawingCount === 0) {
            return;
        }

        this._sortDrawingTransform(drawingTransformCaches, alignType);

        this._applyAlignType(drawingTransformCaches, alignType, minLeft, minTop, maxRight, maxBottom, drawingCount);
    }

    private _applyAlignType(drawingTransformCaches: IDrawingTransformCache[], alignType: AlignType, minLeft: number, minTop: number, maxRight: number, maxBottom: number, drawingCount: number) {
        const averageHorizon = Math.round((maxRight - minLeft) / drawingCount * 10) / 10;
        const averageVertical = Math.round((maxBottom - minTop) / drawingCount * 10) / 10;
        const updateParams: IDrawingParam[] = [];

        const renderObject = this._getSceneAndTransformerByDrawingSearch(drawingTransformCaches[0].unitId);

        if (renderObject == null) {
            return;
        }
        const { scene, transformer } = renderObject;

        drawingTransformCaches.forEach((drawingTransformCache, index) => {
            const { unitId, subUnitId, drawingId, transform, drawingType } = drawingTransformCache;

            const { left = 0, top = 0, width = 0, height = 0 } = transform;

            let newLeft = left;
            let newTop = top;

            switch (alignType) {
                case AlignType.left:
                    newLeft = minLeft;
                    break;
                case AlignType.center:
                    newLeft = minLeft + (maxRight - minLeft) / 2 - width / 2;
                    break;
                case AlignType.right:
                    newLeft = maxRight - width;
                    break;
                case AlignType.top:
                    newTop = minTop;
                    break;
                case AlignType.middle:
                    newTop = minTop + (maxBottom - minTop) / 2 - height / 2;
                    break;
                case AlignType.bottom:
                    newTop = maxBottom - height;
                    break;
                case AlignType.horizon:
                    newLeft = minLeft + averageHorizon * index;
                    break;
                case AlignType.vertical:
                    newTop = minTop + averageVertical * index;
                    break;
                default:
                    break;
            }

            if (newLeft !== left || newTop !== top) {
                updateParams.push({
                    unitId,
                    subUnitId,
                    drawingId,
                    drawingType,
                    transform: {
                        left: newLeft,
                        top: newTop,
                    },
                });
            }
        });

        this._drawingManagerService.featurePluginUpdateNotification(updateParams);

        transformer.refreshControls().changeNotification();
    }

    private _sortDrawingTransform(drawingTransformCaches: IDrawingTransformCache[], alignType: AlignType) {
        drawingTransformCaches.sort((a, b) => {
            const aTransform = a.transform;
            const bTransform = b.transform;

            const {
                left: aLeft = 0,
                top: aTop = 0,
                width: aWidth = 0,
                height: aHeight = 0,
            } = aTransform;

            const {
                left: bLeft = 0,
                top: bTop = 0,
                width: bWidth = 0,
                height: bHeight = 0,
            } = bTransform;

            switch (alignType) {
                case AlignType.left:
                    return aLeft - bLeft;
                case AlignType.center:
                    return aLeft + aWidth / 2 - (bLeft + bWidth / 2);
                case AlignType.right:
                    return aLeft + aWidth - (bLeft + bWidth);
                case AlignType.top:
                    return aTop - bTop;
                case AlignType.middle:
                    return aTop + aHeight / 2 - (bTop + bHeight / 2);
                case AlignType.bottom:
                    return aTop + aHeight - (bTop + bHeight);
                case AlignType.horizon:
                    return aLeft + aWidth / 2 - (bLeft + bWidth / 2);
                case AlignType.vertical:
                    return aTop + aHeight / 2 - (bTop + bHeight / 2);
                default:
                    return 0;
            }
        });
    }

    private _drawingArrangeListener() {
        this.disposeWithMe(
            this._drawingManagerService.order$.subscribe((params) => {
                this._drawingArrange(params);
            })
        );
    }

    private _drawingArrange(params: IDrawingOrderMapParam) {
        const { unitId, subUnitId, drawingIds } = params;

        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

        if (renderObject == null) {
            return;
        }
        const { scene } = renderObject;

        drawingIds.forEach((drawingId) => {
            const oKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
            const drawingShapes = scene.fuzzyMathObjects(oKey, true) as Shape<IShapeProps>[];
            if (drawingShapes == null || drawingShapes.length === 0) {
                return;
            }
            const index = this._drawingManagerService.getDrawingOrder(unitId, subUnitId).indexOf(drawingId);
            for (const shape of drawingShapes) {
                shape.setProps({ zIndex: index });
                shape.makeDirty();
            }
        });
    }

    private _sceneListenerOnDrawingMap: WeakSet<Scene> = new WeakSet();

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                this._insertDrawing(params);
            })
        );
    }

    private _insertDrawing(params: IDrawingSearch[]) {
        const sceneList: Scene[] = [];
        (params).forEach((param) => {
            const { unitId } = param;

            const drawingParam = this._drawingManagerService.getDrawingByParam(param) as IDrawingParam;
            if (drawingParam == null) {
                return;
            }

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            if (renderObject == null) {
                return;
            }

            const { scene } = renderObject;
            if (!sceneList.includes(scene)) {
                sceneList.push(scene);
            }
        });

        sceneList.forEach((scene) => {
            if (this._sceneListenerOnDrawingMap.has(scene)) {
                return;
            }
            this._addListenerOnDrawing(scene);
            this._sceneListenerOnDrawingMap.add(scene);
        });
    }

    private _drawingRemoveListener() {
        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene } = renderObject;

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const drawingShapes = scene.fuzzyMathObjects(drawingShapeKey, true);

                    if (drawingShapes.length > 0) {
                        for (const drawingShape of drawingShapes) {
                            drawingShape.dispose();
                        }

                        scene.getTransformer()?.clearSelectedObjects();
                    }
                });
            })
        );
    }

    private _drawingUpdateListener() {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const drawingParam = this._drawingManagerService.getDrawingByParam(param) as IDrawingParam;

                    if (drawingParam == null) {
                        return;
                    }

                    const { transform, drawingType } = drawingParam;

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene, transformer } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    const { left = 0, top = 0, width = 0, height = 0, angle = 0, flipX = false, flipY = false, skewX = 0, skewY = 0 } = transform;

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const drawingShape = scene.getObject(drawingShapeKey) as Image;

                    if (drawingShape == null) {
                        return true;
                    }

                    drawingShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });

                    scene.getTransformer()?.debounceRefreshControls();
                });
            })
        );
    }

    private _drawingRefreshListener() {
        this.disposeWithMe(
            this._drawingManagerService.refreshTransform$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
                    if (renderObject == null) {
                        return;
                    }
                    const drawingParam = this._drawingManagerService.getDrawingByParam(param) as IDrawingParam;
                    if (drawingParam == null) {
                        return;
                    }
                    const { transform } = drawingParam;
                    const { scene } = renderObject;

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                    const drawingShape = scene.getObject(drawingShapeKey);

                    if (drawingShape == null || transform == null) {
                        return true;
                    }

                    const {
                        left = 0,
                        top = 0,
                        width = 0,
                        height = 0,
                        angle = 0,
                        flipX = false,
                        flipY = false,
                        skewX = 0,
                        skewY = 0,
                    } = transform;

                    drawingShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                });
            })
        );
    }

    private _drawingVisibleListener() {
        this.disposeWithMe(
            this._drawingManagerService.visible$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId, visible } = param;

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
                    if (renderObject == null) {
                        return;
                    }
                    const { scene } = renderObject;

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                    const drawingShape = scene.getObject(drawingShapeKey);

                    if (drawingShape == null) {
                        return true;
                    }

                    if (visible) {
                        drawingShape.show();
                    } else {
                        drawingShape.hide();
                    }
                });
            })
        );
    }

    private _filterUpdateParams(params: Nullable<IDrawingParam>[], startTransforms: Nullable<ITransformState[]>) {
        return params.filter((param, index) => {
            if (param == null) {
                return false;
            }
            const { transform } = param;
            return checkIfMove(transform, startTransforms?.[index]);
        }) as IDrawingParam[];
    }

    // group?.getObjects().forEach((o) => {
    //     const drawing = this._drawingManagerService.getDrawingOKey(o.oKey);
    //     if (drawing != null) {
    //         const { unitId, subUnitId, drawingId } = drawing;
    //         drawings.push({ unitId, subUnitId, drawingId });
    //     }
    // });

    private _addListenerOnDrawing(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        let startTransforms: Nullable<ITransformState[]> = null;

        this.disposeWithMe(
            toDisposable(
                transformer.changeStart$.subscribe((state) => {
                    const { objects } = state;
                    const objectArray = Array.from(objects.values());
                    const drawings: IDrawingSearch[] = [];
                    startTransforms = objectArray.map((object) => {
                        const { left, top, height, width, angle, oKey, isInGroup } = object;
                        const drawing = this._drawingManagerService.getDrawingOKey(oKey);
                        if (isInGroup || object instanceof Group) {
                            let group = object.ancestorGroup as Group;
                            if (group == null && object instanceof Group) {
                                group = object;
                            }

                            if (group == null) {
                                return null;
                            }

                            const groupDrawing = this._drawingManagerService.getDrawingOKey(group.oKey);
                            if (groupDrawing) {
                                const { unitId, subUnitId, drawingId } = groupDrawing;
                                drawings.push({ unitId, subUnitId, drawingId });
                                const { left, top, height, width, angle } = group;
                                return { left, top, height, width, angle };
                            }
                        } else if (drawing != null) {
                            const { unitId, subUnitId, drawingId } = drawing;
                            drawings.push({ unitId, subUnitId, drawingId });

                            return { left, top, height, width, angle };
                        }
                        return null;
                    }).filter((transform) => transform != null) as ITransformState[];

                    if (drawings.length > 0) {
                        this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, drawings);
                    } else {
                        this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
                    }
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                transformer.changeEnd$.subscribe((state) => {
                    const { objects } = state;
                    const params = this._filterUpdateParams(getUpdateParams(objects, this._drawingManagerService), startTransforms);

                    if (params.length > 0) {
                        // this._drawingManagerService.batchUpdate(params);
                        this._drawingManagerService.featurePluginUpdateNotification(params);
                    }
                })
            )
        );
    }
}
