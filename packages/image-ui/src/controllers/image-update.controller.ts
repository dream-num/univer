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

import type { ICommandInfo, IDrawingGroupUpdateParam, IDrawingOrderMapParam, IDrawingParam, IDrawingSearch, ITransformState, Nullable } from '@univerjs/core';
import {
    checkIfMove,
    Disposable,
    DrawingTypeEnum,
    ICommandService,
    IDrawingManagerService,
    IImageRemoteService,
    ImageSourceType,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { BaseObject, IImageProps, Scene } from '@univerjs/engine-render';
import { CURSOR_TYPE, DRAWING_OBJECT_LAYER_INDEX, Group, Image, IRenderManagerService } from '@univerjs/engine-render';
import type { IImageData } from '@univerjs/drawing';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { IDialogService } from '@univerjs/ui';
import { COMPONENT_IMAGE_VIEWER } from '../views/image-viewer/component-name';
import { ImageResetSizeOperation } from '../commands/operations/image-reset-size.operation';
import type { ISetImageAlignOperationParams } from '../commands/operations/image-align.operation';
import { AlignType, SetImageAlignOperation } from '../commands/operations/image-align.operation';
import type { ISetImageGroupOperationParams } from '../commands/operations/image-group.operation';
import { GroupType, SetImageGroupOperation } from '../commands/operations/image-group.operation';
import { CloseImageCropOperation } from '../commands/operations/image-crop.operation';
import { getUpdateParams } from '../utils/get-update-params';

const IMAGE_VIEWER_DROPDOWN_PADDING = 50;

interface IDrawingTransformCache {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    transform: ITransformState;
}

@OnLifecycle(LifecycleStages.Rendered, ImageUpdateController)
export class ImageUpdateController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IImageRemoteService private readonly _imageRemoteService: IImageRemoteService,
        @IDialogService private readonly _dialogService: IDialogService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._drawingAddListener();

        this._drawingRemoveListener();

        this._drawingUpdateListener();

        this._commandExecutedListener();

        this._drawingArrangeListener();

        this._drawingGroupListener();

        this._drawingRefreshListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === ImageResetSizeOperation.id) {
                    const params = command.params as IDrawingSearch[];
                    if (params == null) {
                        return;
                    }
                    this._resetImageSize(params);
                }
                // else if (command.id === SetDrawingArrangeMutation.id) {
                //     const params = command.params as ISetImageArrangeMutationParams;
                //     if (params == null) {
                //         return;
                //     }
                //     this._drawingArrange(params);
                // }
                else if (command.id === SetImageAlignOperation.id) {
                    const params = command.params as ISetImageAlignOperationParams;
                    if (params == null) {
                        return;
                    }
                    this._drawingAlign(params);
                }
                //  else if (command.id === SetImageGroupOperation.id) {
                //     const params = command.params as ISetImageGroupOperationParams;
                //     if (params == null) {
                //         return;
                //     }
                //     this._drawingGroup(params);
                // }
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
            const imageShapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
            const object = scene.getObjectIncludeInGroup(imageShapeKey);

            if (object == null || objects.includes(object)) {
                return;
            }

            objects.push(object);

            const { transform } = drawing;

            transform && object.transformByState(transform);

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

            transform && object.transformByState(transform);

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

    private _drawingAlign(params: ISetImageAlignOperationParams) {
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
            const { unitId, subUnitId, drawingId } = drawing;
            const drawingParam = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId });

            if (drawingParam == null || drawingParam.transform == null) {
                return;
            }

            drawingTransformCaches.push({
                unitId,
                subUnitId,
                drawingId,
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
            const { unitId, subUnitId, drawingId, transform } = drawingTransformCache;

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
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    transform: {
                        left: newLeft,
                        top: newTop,
                    },
                });
            }
        });

        this._drawingManagerService.featurePluginUpdateNotification(updateParams);

        transformer.refreshControls();
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

    private _resetImageSize(params: IDrawingSearch[]) {
        const updateParams: IImageData[] = [];
        const sceneList: Scene[] = [];

        params.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }
            const { scene, transformer } = renderObject;

            const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            const imageShape = scene.getObject(imageShapeKey);

            if (imageShape == null) {
                return true;
            }

            const imageData = this._drawingManagerService.getDrawingByParam(param);

            if (imageData == null) {
                return true;
            }

            if (imageData.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                return;
            }

            (imageShape as Image).resetSize();

            const { width, height } = (imageShape as Image).getNativeSize();

            if (sceneList.includes(scene) === false) {
                sceneList.push(scene);
            }

            updateParams.push({
                ...imageData,
                transform: {
                    ...imageData.transform,
                    height,
                    width,
                    angle: 0,
                },
                srcRect: null,
            } as IImageData);
        });

        this._drawingManagerService.featurePluginUpdateNotification(updateParams);

        sceneList.forEach((scene) => {
            const transformer = scene.getTransformerByCreate();
            transformer.refreshControls();
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
        const { scene, transformer } = renderObject;

        drawingIds.forEach((drawingId, index) => {
            const oKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
            const object = scene.getObject(oKey) as Image;
            if (object == null) {
                return;
            }
            object.setProps({ zIndex: index });
            object.makeDirty();
        });
    }

    private _sceneListenerOnImageMap: WeakSet<Scene> = new WeakSet();

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                const sceneList: Scene[] = [];
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const imageParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;

                    if (imageParam == null) {
                        return;
                    }

                    const { transform, drawingType } = imageParam;

                    if (drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                        return;
                    }

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene, transformer } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                    const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape != null) {
                        imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                        return;
                    }

                    const imageConfig: IImageProps = { left, top, width, height, zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1 };

                    const imageNativeCache = this._getImageSourceCache(imageParam);
                    if (imageNativeCache != null) {
                        imageConfig.image = imageNativeCache;
                    } else {
                        imageConfig.url = imageParam.source;
                    }

                    const image = new Image(imageShapeKey, imageConfig);
                    this._addImageSourceCache(imageParam, image.getNative());

                    scene.addObject(image, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(image);

                    this._addHoverForImage(image);
                    this._addDialogForImage(image);

                    if (!sceneList.includes(scene)) {
                        sceneList.push(scene);
                    }
                });

                sceneList.forEach((scene) => {
                    if (this._sceneListenerOnImageMap.has(scene)) {
                        return;
                    }
                    this._addListenerOnImage(scene);
                    this._sceneListenerOnImageMap.add(scene);
                });
            })
        );
    }

    private _addHoverForImage(o: Image) {
        this.disposeWithMe(
            toDisposable(
                o.onPointerEnterObserver.add(() => {
                    o.cursor = CURSOR_TYPE.GRAB;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeaveObserver.add(() => {
                    o.cursor = CURSOR_TYPE.DEFAULT;
                })
            )
        );
    }

    private _addDialogForImage(o: Image) {
        this.disposeWithMe(
            toDisposable(
                o.onDblclickObserver.add(() => {
                    const dialogId = `${o.oKey}-viewer-dialog`;

                    const nativeSize = o.getNativeSize();
                    const screenWidth = window.innerWidth - IMAGE_VIEWER_DROPDOWN_PADDING;
                    const screenHeight = window.innerHeight - IMAGE_VIEWER_DROPDOWN_PADDING;

                    const adjustSize = this._adjustImageSize(nativeSize.width, nativeSize.height, screenWidth, screenHeight);

                    const dialog = this._dialogService.open({
                        width: adjustSize.width,
                        id: dialogId,
                        children: {
                            label: {
                                name: COMPONENT_IMAGE_VIEWER,
                                props: {
                                    src: o.getNative()?.src,
                                    width: adjustSize.width,
                                    height: adjustSize.height,
                                },
                            },
                        },
                        destroyOnClose: true,
                        draggable: false,
                        onClose: () => {
                            this._dialogService.close(dialogId);
                            dialog.dispose();
                        },
                    });
                })
            )
        );
    }

    private _adjustImageSize(nativeWidth: number, nativeHeight: number, screenWidth: number, screenHeight: number) {
        // Use native size if the image is smaller than the screen
        if (nativeWidth <= screenWidth && nativeHeight <= screenHeight) {
            return {
                width: nativeWidth,
                height: nativeHeight,
            };
        }

        // Calculate scale ratios
        const widthRatio = screenWidth / nativeWidth;
        const heightRatio = screenHeight / nativeHeight;
        const scale = Math.min(widthRatio, heightRatio); // Choose the smaller ratio to ensure the image fits within the screen

        // Return new dimensions
        return {
            width: Math.floor(nativeWidth * scale),
            height: Math.floor(nativeHeight * scale),
        };
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
                    const { scene, transformer } = renderObject;

                    const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape != null) {
                        imageShape.dispose();
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

                    const imageParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;

                    if (imageParam == null) {
                        return;
                    }

                    const { transform, drawingType } = imageParam;

                    if (drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                        return;
                    }

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene, transformer } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    const { left = 0, top = 0, width = 0, height = 0, angle = 0, flipX = false, flipY = false, skewX = 0, skewY = 0 } = transform;

                    const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape == null) {
                        return true;
                    }

                    imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
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
                    const { scene, transformer } = renderObject;

                    const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                    const imageShape = scene.getObject(imageShapeKey);

                    const drawingParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;
                    if (drawingParam == null) {
                        return;
                    }
                    const { transform } = drawingParam;

                    if (transform == null) {
                        return true;
                    }

                    const { left = 0, top = 0, width = 0, height = 0, angle = 0, flipX = false, flipY = false, skewX = 0, skewY = 0 } = transform;

                    if (imageShape == null) {
                        return true;
                    }

                    imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
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
    private _addListenerOnImage(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        let startTransforms: Nullable<ITransformState[]> = null;

        this.disposeWithMe(
            toDisposable(
                transformer.onChangeStartObservable.add((state) => {
                    const { objects } = state;
                    const objectArray = Array.from(objects.values());
                    const drawings: IDrawingSearch[] = [];
                    startTransforms = objectArray.map((object) => {
                        const { left, top, height, width, angle, oKey, groupKey, isInGroup } = object;
                        const drawing = this._drawingManagerService.getDrawingOKey(oKey);
                        if (isInGroup || object instanceof Group) {
                            let group: Group;
                            if (object instanceof Group) {
                                group = object;
                            } else {
                                group = object.ancestorGroup as Group;
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
                        this._drawingManagerService.focusDrawing(drawings);
                    } else {
                        this._drawingManagerService.focusDrawing(null);
                    }
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                transformer.onChangingObservable.add((state) => {
                    const { objects } = state;
                    const params = getUpdateParams(objects, this._drawingManagerService);
                    if (params.length > 0) {
                        // this._drawingManagerService.batchUpdate(params.filter((param) => {
                        //     if (param == null) {
                        //         return false;
                        //     }
                        //     return true;
                        // }) as IDrawingParam[]);
                    }
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                transformer.onChangeEndObservable.add((state) => {
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

    private _imageSourceCache: Map<string, HTMLImageElement> = new Map();

    private _addImageSourceCache(imageData: IImageData, imageSource: Nullable<HTMLImageElement>) {
        const { source, imageSourceType } = imageData;
        if (imageSourceType === ImageSourceType.BASE64 || imageSource == null) {
            return;
        }

        this._imageSourceCache.set(source, imageSource);
    }

    private _getImageSourceCache(imageData: IImageData): Nullable<HTMLImageElement> {
        const { source, imageSourceType } = imageData;

        if (imageSourceType === ImageSourceType.BASE64) {
            return;
        }

        return this._imageSourceCache.get(source);
    }
}
