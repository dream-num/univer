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

import type { Nullable, Workbook } from '@univerjs/core';
import { Disposable, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import type { BaseObject, IImageProps, Shape } from '@univerjs/engine-render';
import { CURSOR_TYPE, IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import { WorksheetEditPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';
import { combineLatest, combineLatestWith, filter, map } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingPermissionController)
export class SheetDrawingPermissionController extends Disposable {
    private _editSubscription: Nullable<Subscription>;
    private _viewSubscription: Nullable<Subscription>;
    private _editCompleteSubscription: Nullable<Subscription>;
    private _viewCompleteSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(UserManagerService) private _userManagerService: UserManagerService
    ) {
        super();
        this._initDrawingPermission();
    }

    private _dispose() {
        this._editSubscription?.unsubscribe();
        this._viewSubscription?.unsubscribe();
        this._editCompleteSubscription?.unsubscribe();
        this._viewCompleteSubscription?.unsubscribe();
    }

    private _initDrawingPermission() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        this.disposeWithMe(
            workbook$?.subscribe((workbook) => {
                if (!workbook) {
                    return;
                }

                combineLatest([workbook.activeSheet$, this._userManagerService.currentUser$]).subscribe(([sheet, _]) => {
                    if (sheet) {
                        const unitId = workbook.getUnitId();
                        const subUnitId = sheet.getSheetId();
                        const operationEditSet: Set<BaseObject> = new Set();
                        const operationViewSet: Set<BaseObject> = new Set();
                        this._dispose();
                        let sheetEditPermission = true;
                        let sheetViewPermission = true;
                        const sheetEditPermission$ = this._permissionService.getPermissionPoint$(new WorksheetEditPermission(unitId, subUnitId).id)?.pipe(
                            map((permission) => !!permission.value)
                        );
                        const sheetViewPermission$ = this._permissionService.getPermissionPoint$(new WorksheetViewPermission(unitId, subUnitId).id)?.pipe(
                            map((permission) => !!permission.value)
                        );
                        // edit
                        this._editSubscription = sheetEditPermission$?.pipe(
                            filter((permission) => permission !== sheetEditPermission),
                            combineLatestWith(this._drawingManagerService.add$)
                        ).subscribe({
                            next: ([permission, addArr]) => {
                                sheetEditPermission = permission;
                                const isSameSheet = addArr.length && addArr.every((item) => item.unitId === unitId && item.subUnitId === subUnitId);
                                if (!isSameSheet) {
                                    return;
                                }
                                const renderObject = this._renderManagerService.getRenderById(unitId);
                                const scene = renderObject?.scene;
                                if (scene == null) {
                                    return;
                                }
                                const transformer = scene.getTransformerByCreate();
                                const objects = scene.getAllObjects();
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && object.oKey.includes(subUnitId)) {
                                        if (permission) {
                                            scene.detachTransformerFrom(object);
                                            object.onPointerEnterObserver.clear();
                                            object.onPointerEnterObserver.add(() => {
                                                object.cursor = CURSOR_TYPE.POINTER;
                                            });
                                            transformer.clearSelectedObjects();
                                            operationEditSet.delete(object);
                                        } else {
                                            scene.attachTransformerTo(object);
                                            object.onPointerEnterObserver.add(() => {
                                                object.cursor = CURSOR_TYPE.GRAB;
                                            });
                                            operationEditSet.add(object);
                                        }
                                    }
                                });
                            },
                        });
                        this._editCompleteSubscription = sheetEditPermission$?.subscribe({
                            complete: () => {
                                const renderObject = this._renderManagerService.getRenderById(unitId);
                                const scene = renderObject?.scene;
                                if (scene == null) {
                                    return;
                                }
                                [...operationEditSet].forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE) {
                                        scene.attachTransformerTo(object);
                                        object.onPointerEnterObserver.add(() => {
                                            object.cursor = CURSOR_TYPE.GRAB;
                                        });
                                    }
                                });
                                operationEditSet.clear();
                                sheetEditPermission = true;
                            },
                        });

                        // view

                        this._viewSubscription = sheetViewPermission$?.pipe(
                            filter((permission) => permission !== sheetViewPermission),
                            combineLatestWith(this._drawingManagerService.add$)
                        ).subscribe({
                            next: ([permission, addArr]) => {
                                sheetViewPermission = permission;
                                const isSameSheet = addArr.length && addArr.every((item) => item.unitId === unitId && item.subUnitId === subUnitId);
                                if (!isSameSheet) {
                                    return;
                                }
                                const renderObject = this._renderManagerService.getRenderById(unitId);
                                const scene = renderObject?.scene;
                                if (scene == null) {
                                    return;
                                }
                                const objects = scene.getAllObjects();
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && object.oKey.includes(subUnitId)) {
                                        (object as Shape<IImageProps>).setProps({ visible: permission });
                                        permission ? operationViewSet.delete(object) : operationViewSet.add(object);
                                    }
                                });
                            },
                        });
                        this._viewCompleteSubscription = sheetViewPermission$?.subscribe({
                            complete: () => {
                                const renderObject = this._renderManagerService.getRenderById(unitId);
                                const scene = renderObject?.scene;
                                if (scene == null) {
                                    return;
                                }
                                [...operationViewSet].forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE) {
                                        (object as Shape<IImageProps>).setProps({ visible: true });
                                    }
                                });
                                sheetViewPermission = true;
                                operationViewSet.clear();
                            },
                        });
                    }
                });
            })
        );
    }
}
