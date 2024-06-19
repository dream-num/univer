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

import type { Workbook } from '@univerjs/core';
import { Disposable, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import { WorksheetEditPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { combineLatest, distinctUntilChanged, filter } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingPermissionController)
export class SheetDrawingPermissionController extends Disposable {
    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(UserManagerService) private _userManagerService: UserManagerService
    ) {
        super();
        this._initDrawingVisible();
        this._initDrawingEditable();
        this._initViewPermissionChange();
        this._initEditPermissionChange();
    }

    private _initDrawingVisible() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        this.disposeWithMe(
            combineLatest([workbook$, this._userManagerService.currentUser$]).subscribe(([workbook, _]) => {
                if (!workbook) {
                    this._drawingManagerService.setDrawingVisible(false);
                    return;
                }
                workbook.activeSheet$.subscribe((sheet) => {
                    if (!sheet) {
                        this._drawingManagerService.setDrawingVisible(false);
                        return;
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = sheet.getSheetId();
                    const worksheetViewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id);
                    if (worksheetViewPermission?.value) {
                        this._drawingManagerService.setDrawingVisible(true);
                    } else {
                        this._drawingManagerService.setDrawingVisible(false);
                        const unitId = workbook.getUnitId();
                        const subUnitId = sheet.getSheetId();
                        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                        const drawingDataValues = Object.values(drawingData);
                        const renderObject = this._renderManagerService.getRenderById(unitId);
                        const scene = renderObject?.scene;
                        if (scene == null) {
                            return;
                        }
                        const objects = scene.getAllObjects();
                        objects.forEach((object) => {
                            if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                                scene.removeObject(object);
                            }
                        });
                    }
                });
            })
        );
    }

    private _initDrawingEditable() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        this.disposeWithMe(
            combineLatest([workbook$, this._userManagerService.currentUser$]).subscribe(([workbook, _]) => {
                if (!workbook) {
                    this._drawingManagerService.setDrawingEditable(false);
                    return;
                }
                workbook.activeSheet$.subscribe((sheet) => {
                    if (!sheet) {
                        this._drawingManagerService.setDrawingEditable(false);
                        return;
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = sheet.getSheetId();
                    const worksheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id);
                    if (worksheetEditPermission?.value) {
                        this._drawingManagerService.setDrawingEditable(true);
                    } else {
                        this._drawingManagerService.setDrawingEditable(false);
                        const unitId = workbook.getUnitId();
                        const subUnitId = sheet.getSheetId();
                        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                        const drawingDataValues = Object.values(drawingData);
                        const renderObject = this._renderManagerService.getRenderById(unitId);
                        const scene = renderObject?.scene;
                        if (scene == null) {
                            return;
                        }
                        const objects = scene.getAllObjects();
                        objects.forEach((object) => {
                            if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                                scene.detachTransformerFrom(object);
                            }
                        });
                    }
                });
            })
        );
    }

    private _initViewPermissionChange() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        this.disposeWithMe(
            combineLatest([workbook$, this._userManagerService.currentUser$]).subscribe(([workbook, _]) => {
                if (!workbook) {
                    return;
                }
                workbook.activeSheet$.subscribe((sheet) => {
                    if (!sheet) {
                        return;
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = sheet.getSheetId();
                    let initialViewPermission = true;
                    const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                    const drawingDataValues = Object.values(drawingData);
                    const renderObject = this._renderManagerService.getRenderById(unitId);
                    const scene = renderObject?.scene;
                    if (scene == null) {
                        return;
                    }
                    const worksheetViewPermission$ = this._permissionService.getPermissionPoint$(new WorksheetViewPermission(unitId, subUnitId).id);
                    worksheetViewPermission$?.pipe(
                        filter((permission) => permission.value !== initialViewPermission),
                        distinctUntilChanged()
                    ).subscribe({
                        next: (permission) => {
                            initialViewPermission = permission.value;
                            this._drawingManagerService.setDrawingVisible(permission.value);
                            const objects = scene.getAllObjects();

                            if (permission.value) {
                                const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                                const drawingDataValues = Object.values(drawingData);
                                this._drawingManagerService.addNotification(drawingDataValues);
                            } else {
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => item.drawingId === object.oKey)) {
                                        scene.removeObject(object);
                                    }
                                });
                            }
                        },
                        complete: () => {
                            initialViewPermission = true;
                            this._drawingManagerService.setDrawingVisible(true);
                            const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                            const drawingDataValues = Object.values(drawingData);
                            this._drawingManagerService.addNotification(drawingDataValues);
                        },
                    });
                });
            })
        );
    }

    private _initEditPermissionChange() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        this.disposeWithMe(
            combineLatest([workbook$, this._userManagerService.currentUser$]).subscribe(([workbook, _]) => {
                if (!workbook) {
                    return;
                }
                workbook.activeSheet$.subscribe((sheet) => {
                    if (!sheet) {
                        return;
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = sheet.getSheetId();
                    let initialEditPermission = true;
                    const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                    const drawingDataValues = Object.values(drawingData);
                    const renderObject = this._renderManagerService.getRenderById(unitId);
                    const scene = renderObject?.scene;
                    if (scene == null) {
                        return;
                    }
                    const worksheetEditPermission$ = this._permissionService.getPermissionPoint$(new WorksheetEditPermission(unitId, subUnitId).id);
                    worksheetEditPermission$?.pipe(
                        filter((permission) => permission.value !== initialEditPermission),
                        distinctUntilChanged()
                    ).subscribe({
                        next: (permission) => {
                            initialEditPermission = permission.value;
                            this._drawingManagerService.setDrawingVisible(permission.value);
                            const objects = scene.getAllObjects();

                            if (permission.value) {
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => item.drawingId === object.oKey)) {
                                        scene.attachTransformerTo(object);
                                    }
                                });
                                const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                                const drawingDataValues = Object.values(drawingData);
                                this._drawingManagerService.addNotification(drawingDataValues);
                            } else {
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => item.drawingId === object.oKey)) {
                                        scene.detachTransformerFrom(object);
                                    }
                                });
                            }
                        },
                        complete: () => {
                            initialEditPermission = true;
                            const unitId = workbook.getUnitId();
                            const subUnitId = sheet.getSheetId();
                            const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                            const drawingDataValues = Object.values(drawingData);
                            const renderObject = this._renderManagerService.getRenderById(unitId);
                            const scene = renderObject?.scene;
                            if (scene == null) {
                                return;
                            }
                            this._drawingManagerService.setDrawingVisible(true);
                            const objects = scene.getAllObjects();
                            objects.forEach((object) => {
                                if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => item.drawingId === object.oKey)) {
                                    scene.detachTransformerFrom(object);
                                }
                            });
                        },
                    });
                });
            })
        );
    }
}
