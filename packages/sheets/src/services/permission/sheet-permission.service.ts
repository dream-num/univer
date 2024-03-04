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

import {
    Disposable,
    getTypeFromPermissionItemList,
    IPermissionService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
    UniverEditablePermissionPoint,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import { SheetEditablePermission } from './permission-point';

@OnLifecycle(LifecycleStages.Ready, SheetPermissionService)
export class SheetPermissionService extends Disposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        workbook.getSheets().forEach((worksheet) => {
            const subUnitId = worksheet.getSheetId();
            const sheetPermission = new SheetEditablePermission(unitId, subUnitId);
            this._permissionService.addPermissionPoint(workbook.getUnitId(), sheetPermission);
        });

        this.disposeWithMe(
            toDisposable(
                workbook.sheetCreated$.subscribe((worksheet) => {
                    const subUnitId = worksheet.getSheetId();
                    const sheetPermission = new SheetEditablePermission(unitId, subUnitId);
                    this._permissionService.addPermissionPoint(workbook.getUnitId(), sheetPermission);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                workbook.sheetDisposed$.subscribe((worksheet) => {
                    const subUnitId = worksheet.getSheetId();
                    const sheetPermission = new SheetEditablePermission(unitId, subUnitId);
                    this._permissionService.deletePermissionPoint(workbook.getUnitId(), sheetPermission.id);
                })
            )
        );
    }

    getEditable$(unitId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _unitId = unitId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_unitId, _sheetId);
        return this._permissionService
            .composePermission$(_unitId, [UniverEditablePermissionPoint, sheetPermission.id])
            .pipe(
                map(([univerEditable, sheetEditable]) => {
                    const editable = univerEditable.value && sheetEditable.value;
                    const status = getTypeFromPermissionItemList([univerEditable, sheetEditable]);
                    return { value: editable, status };
                })
            );
    }

    getSheetEditable(unitId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _unitId = unitId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_unitId, _sheetId);
        return this._permissionService
            .composePermission(_unitId, [UniverEditablePermissionPoint, sheetPermission.id])
            .every((item) => item.value);
    }

    setSheetEditable(v: boolean, unitId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _unitId = unitId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_unitId, _sheetId);
        this._permissionService.updatePermissionPoint(_unitId, sheetPermission.id, v);
    }
}
