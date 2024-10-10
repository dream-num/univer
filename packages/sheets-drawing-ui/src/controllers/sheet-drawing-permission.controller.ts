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
import { Disposable, Inject, IPermissionService, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import { WorkbookEditablePermission, WorkbookViewPermission, WorksheetEditPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { combineLatest, distinctUntilChanged, filter, map } from 'rxjs';

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
                    const worksheetViewPermission = this._permissionService.composePermission([new WorkbookViewPermission(unitId).id, new WorksheetViewPermission(unitId, subUnitId).id]).every((permission) => permission.value);
                    if (worksheetViewPermission) {
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
                        const objects = scene.getAllObjectsByOrder();
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
                    const worksheetEditPermission = this._permissionService.composePermission([new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id]).every((permission) => permission.value);
                    if (worksheetEditPermission) {
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
                        const objects = scene.getAllObjectsByOrder();
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
                    const renderObject = this._renderManagerService.getRenderById(unitId);
                    const scene = renderObject?.scene;
                    if (scene == null) {
                        return;
                    }
                    const transformer = scene.getTransformerByCreate();
                    const worksheetViewPermission$ = this._permissionService.composePermission$([new WorkbookViewPermission(unitId).id, new WorksheetViewPermission(unitId, subUnitId).id]).pipe(map((permissions) => permissions.every((item) => item.value)));
                    worksheetViewPermission$?.pipe(
                        filter((permission) => permission !== initialViewPermission),
                        distinctUntilChanged()
                    ).subscribe({
                        next: (permission) => {
                            initialViewPermission = permission;
                            this._drawingManagerService.setDrawingVisible(permission);
                            const objects = scene.getAllObjectsByOrder();
                            const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                            const drawingDataValues = Object.values(drawingData);
                            if (permission) {
                                this._drawingManagerService.addNotification(drawingDataValues);
                            } else {
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                                        scene.removeObject(object);
                                    }
                                });
                                transformer.clearSelectedObjects();
                            }
                        },
                    });
                    this._permissionService.getPermissionPoint$(new WorksheetViewPermission(unitId, subUnitId).id)?.pipe(
                        filter((permission) => permission.value !== initialViewPermission),
                        distinctUntilChanged()
                    ).subscribe({
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
                    const renderObject = this._renderManagerService.getRenderById(unitId);
                    const scene = renderObject?.scene;
                    if (scene == null) {
                        return;
                    }
                    const transformer = scene.getTransformerByCreate();
                    const composeWorksheetEditPermission = this._permissionService.composePermission$([new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id]).pipe(map((permissions) => permissions.every((item) => item.value)));
                    composeWorksheetEditPermission?.pipe(
                        filter((permission) => permission !== initialEditPermission),
                        distinctUntilChanged()
                    ).subscribe({
                        next: (permission) => {
                            initialEditPermission = permission;
                            this._drawingManagerService.setDrawingEditable(permission);
                            const objects = scene.getAllObjectsByOrder();
                            const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                            const drawingDataValues = Object.values(drawingData);
                            if (permission) {
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                                        scene.attachTransformerTo(object);
                                    }
                                });

                                this._drawingManagerService.addNotification(drawingDataValues);
                            } else {
                                objects.forEach((object) => {
                                    if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                                        scene.detachTransformerFrom(object);
                                    }
                                });
                                transformer.clearSelectedObjects();
                            }
                        },
                    });
                    this._permissionService.getPermissionPoint$(new WorksheetEditPermission(unitId, subUnitId).id)?.pipe(
                        filter((permission) => permission.value !== initialEditPermission),
                        distinctUntilChanged()
                    ).subscribe({
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
                            this._drawingManagerService.setDrawingEditable(true);
                            const objects = scene.getAllObjectsByOrder();
                            objects.forEach((object) => {
                                if (object.classType === RENDER_CLASS_TYPE.IMAGE && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
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
