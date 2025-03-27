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

/* eslint-disable max-lines-per-function */

import type { Workbook, Worksheet } from '@univerjs/core';
import { Disposable, Inject, IPermissionService, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import { WorkbookEditablePermission, WorkbookViewPermission, WorksheetEditPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { combineLatest, distinctUntilChanged, EMPTY, map, switchMap, tap } from 'rxjs';

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
        const currentUser$ = this._userManagerService.currentUser$;
        const combined$ = combineLatest([workbook$, currentUser$]);

        this.disposeWithMe(
            combined$
                .pipe(
                    switchMap(([workbook, _]) => {
                        if (!workbook) {
                            this._drawingManagerService.setDrawingVisible(false);
                            return EMPTY;
                        }

                        return workbook.activeSheet$.pipe(
                            tap((sheet) => {
                                if (!sheet) {
                                    this._drawingManagerService.setDrawingVisible(false);
                                    return;
                                }

                                const unitId = workbook.getUnitId();
                                const subUnitId = sheet.getSheetId();

                                const worksheetViewPermission = this._permissionService
                                    .composePermission([
                                        new WorkbookViewPermission(unitId).id,
                                        new WorksheetViewPermission(unitId, subUnitId).id,
                                    ])
                                    .every((permission) => permission.value);

                                if (worksheetViewPermission) {
                                    this._drawingManagerService.setDrawingVisible(true);
                                } else {
                                    this._handleDrawingVisibilityFalse(workbook, sheet);
                                }
                            })
                        );
                    })
                )
                .subscribe()
        );
    }

    private _handleDrawingVisibilityFalse(workbook: Workbook, sheet: Worksheet) {
        this._drawingManagerService.setDrawingVisible(false);

        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const drawingDataValues = Object.values(drawingData);

        const renderObject = this._renderManagerService.getRenderById(unitId);
        const scene = renderObject?.scene;

        if (!scene) {
            return;
        }

        const objects = scene.getAllObjectsByOrder();

        objects.forEach((object) => {
            if (
                object.classType === RENDER_CLASS_TYPE.IMAGE &&
                drawingDataValues.some((item) => object.oKey.includes(item.drawingId))
            ) {
                scene.removeObject(object);
            }
        });
    }

    private _initDrawingEditable() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const currentUser$ = this._userManagerService.currentUser$;

        const combined$ = combineLatest([workbook$, currentUser$]);

        this.disposeWithMe(
            combined$
                .pipe(
                    switchMap(([workbook, _]) => {
                        if (!workbook) {
                            this._drawingManagerService.setDrawingEditable(false);
                            return EMPTY;
                        }

                        return workbook.activeSheet$.pipe(
                            tap((sheet) => {
                                if (!sheet) {
                                    this._drawingManagerService.setDrawingEditable(false);
                                    return;
                                }

                                const unitId = workbook.getUnitId();
                                const subUnitId = sheet.getSheetId();

                                const worksheetEditPermission = this._permissionService
                                    .composePermission([
                                        new WorkbookEditablePermission(unitId).id,
                                        new WorksheetEditPermission(unitId, subUnitId).id,
                                    ])
                                    .every((permission) => permission.value);

                                if (worksheetEditPermission) {
                                    this._drawingManagerService.setDrawingEditable(true);
                                } else {
                                    this._handleDrawingEditableFalse(workbook, sheet);
                                }
                            })
                        );
                    })
                )
                .subscribe()
        );
    }

    private _handleDrawingEditableFalse(workbook: Workbook, sheet: Worksheet) {
        this._drawingManagerService.setDrawingEditable(false);

        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const drawingDataValues = Object.values(drawingData);

        const renderObject = this._renderManagerService.getRenderById(unitId);
        const scene = renderObject?.scene;

        if (!scene) {
            return;
        }

        const objects = scene.getAllObjectsByOrder();

        objects.forEach((object) => {
            if (
                object.classType === RENDER_CLASS_TYPE.IMAGE &&
                drawingDataValues.some((item) => object.oKey.includes(item.drawingId))
            ) {
                scene.detachTransformerFrom(object);
            }
        });
    }

    private _initViewPermissionChange() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const currentUser$ = this._userManagerService.currentUser$;
        this.disposeWithMe(
            combineLatest([workbook$, currentUser$])
                .pipe(
                    switchMap(([workbook, _]) => {
                        if (!workbook) return EMPTY;

                        return workbook.activeSheet$.pipe(
                            switchMap((sheet) => {
                                if (!sheet) {
                                    return EMPTY;
                                }

                                const unitId = workbook.getUnitId();
                                const subUnitId = sheet.getSheetId();
                                const renderObject = this._renderManagerService.getRenderById(unitId);
                                const scene = renderObject?.scene;

                                if (!scene) {
                                    return EMPTY;
                                }

                                const transformer = scene.getTransformerByCreate();

                                const worksheetViewPermission$ = this._permissionService
                                    .composePermission$([
                                        new WorkbookViewPermission(unitId).id,
                                        new WorksheetViewPermission(unitId, subUnitId).id,
                                    ])
                                    .pipe(
                                        map((permissions) => permissions.every((item) => item.value)),
                                        distinctUntilChanged()
                                    );

                                return worksheetViewPermission$.pipe(
                                    map((permission) => ({
                                        permission,
                                        scene,
                                        transformer,
                                        unitId,
                                        subUnitId,
                                    }))
                                );
                            })
                        );
                    })
                )
                .subscribe({
                    next: ({ permission, scene, transformer, unitId, subUnitId }) => {
                        this._drawingManagerService.setDrawingVisible(permission);

                        const objects = scene.getAllObjectsByOrder();
                        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                        const drawingDataValues = Object.values(drawingData);

                        if (permission) {
                            this._drawingManagerService.addNotification(drawingDataValues);
                        } else {
                            objects.forEach((object) => {
                                if (
                                    object.classType === RENDER_CLASS_TYPE.IMAGE &&
                                    drawingDataValues.some((item) => object.oKey.includes(item.drawingId))
                                ) {
                                    scene.removeObject(object);
                                }
                            });
                            transformer.clearSelectedObjects();
                        }
                    },
                    complete: () => {
                        this._drawingManagerService.setDrawingVisible(true);
                        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                        const sheet = workbook?.getActiveSheet();
                        const unitId = workbook?.getUnitId();
                        const subUnitId = sheet?.getSheetId();
                        if (!unitId || !subUnitId) {
                            return;
                        }
                        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                        const drawingDataValues = Object.values(drawingData);
                        this._drawingManagerService.addNotification(drawingDataValues);
                    },
                })
        );
    }

    private _initEditPermissionChange() {
        const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const currentUser$ = this._userManagerService.currentUser$;

        this.disposeWithMe(
            combineLatest([workbook$, currentUser$])
                .pipe(
                    switchMap(([workbook, _]) => {
                        if (!workbook) {
                            return EMPTY;
                        }

                        return workbook.activeSheet$.pipe(
                            switchMap((sheet) => {
                                if (!sheet) {
                                    return EMPTY;
                                }

                                const unitId = workbook.getUnitId();
                                const subUnitId = sheet.getSheetId();
                                const renderObject = this._renderManagerService.getRenderById(unitId);
                                const scene = renderObject?.scene;

                                if (!scene) {
                                    return EMPTY;
                                }

                                const transformer = scene.getTransformerByCreate();

                                const composeWorksheetEditPermission$ = this._permissionService
                                    .composePermission$([
                                        new WorkbookEditablePermission(unitId).id,
                                        new WorksheetEditPermission(unitId, subUnitId).id,
                                    ])
                                    .pipe(
                                        map((permissions) => permissions.every((item) => item.value)),
                                        distinctUntilChanged()
                                    );

                                return composeWorksheetEditPermission$.pipe(
                                    map((permission) => ({
                                        permission,
                                        scene,
                                        transformer,
                                        unitId,
                                        subUnitId,
                                    }))
                                );
                            })
                        );
                    })
                )
                .subscribe({
                    next: ({ permission, scene, transformer, unitId, subUnitId }) => {
                        this._drawingManagerService.setDrawingEditable(permission);

                        const objects = scene.getAllObjectsByOrder();
                        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                        const drawingDataValues = Object.values(drawingData);

                        if (permission) {
                            objects.forEach((object) => {
                                if (
                                    object.classType === RENDER_CLASS_TYPE.IMAGE &&
                                    drawingDataValues.some((item) => object.oKey.includes(item.drawingId))
                                ) {
                                    scene.attachTransformerTo(object);
                                }
                            });

                            this._drawingManagerService.addNotification(drawingDataValues);
                        } else {
                            objects.forEach((object) => {
                                if (
                                    object.classType === RENDER_CLASS_TYPE.IMAGE &&
                                    drawingDataValues.some((item) => object.oKey.includes(item.drawingId))
                                ) {
                                    scene.detachTransformerFrom(object);
                                }
                            });

                            transformer.clearSelectedObjects();
                        }
                    },
                    complete: () => {
                        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                        if (!workbook) {
                            return;
                        }

                        const unitId = workbook.getUnitId();
                        const sheet = workbook.getActiveSheet();
                        if (!sheet) {
                            return;
                        }

                        const subUnitId = sheet.getSheetId();
                        const renderObject = this._renderManagerService.getRenderById(unitId);
                        const scene = renderObject?.scene;

                        if (!scene) {
                            return;
                        }

                        const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
                        const drawingDataValues = Object.values(drawingData);

                        this._drawingManagerService.setDrawingEditable(true);

                        const objects = scene.getAllObjectsByOrder();
                        objects.forEach((object) => {
                            if (
                                object.classType === RENDER_CLASS_TYPE.IMAGE &&
                                drawingDataValues.some((item) => object.oKey.includes(item.drawingId))
                            ) {
                                scene.detachTransformerFrom(object);
                            }
                        });
                    },
                })
        );
    }
}
