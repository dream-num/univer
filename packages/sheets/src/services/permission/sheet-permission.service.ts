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
import {
    DisposableCollection,
    IPermissionService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    PermissionStatus,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { takeUntil } from 'rxjs/operators';

import { of } from 'rxjs';
import { SheetEditablePermission } from './permission-point';

@OnLifecycle(LifecycleStages.Ready, SheetPermissionService)
export class SheetPermissionService extends RxDisposable {
    private _disposableByUnit = new Map<string, IDisposable>();

    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)!;
        if (!workbook) return;

        this._interceptWorkbook(workbook);
        this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.SHEET)
            .pipe(takeUntil(this.dispose$))
            .subscribe((workbook) => this._interceptWorkbook(workbook));

        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.SHEET)
            .pipe(takeUntil(this.dispose$))
            .subscribe((workbook) => this._disposableByUnit.get(workbook.getUnitId())?.dispose());
    }

    private _interceptWorkbook(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        const disposableCollection = new DisposableCollection();

        workbook.getSheets().forEach((worksheet) => {
            const subUnitId = worksheet.getSheetId();
            const sheetPermission = new SheetEditablePermission(unitId, subUnitId);
            this._permissionService.addPermissionPoint(workbook.getUnitId(), sheetPermission);
        });

        disposableCollection.add(toDisposable(
            workbook.sheetCreated$.subscribe((worksheet) => {
                const subUnitId = worksheet.getSheetId();
                const sheetPermission = new SheetEditablePermission(unitId, subUnitId);
                this._permissionService.addPermissionPoint(workbook.getUnitId(), sheetPermission);
            })
        ));

        disposableCollection.add(toDisposable(
            workbook.sheetDisposed$.subscribe((worksheet) => {
                const subUnitId = worksheet.getSheetId();
                const sheetPermission = new SheetEditablePermission(unitId, subUnitId);
                this._permissionService.deletePermissionPoint(workbook.getUnitId(), sheetPermission.id);
            })
        ));

        disposableCollection.add(toDisposable(() => this._disposableByUnit.delete(unitId)));
        this._disposableByUnit.set(unitId, disposableCollection);
    }

    getEditable$(unitId?: string, sheetId?: string) {
        return of({ value: true, status: PermissionStatus.INIT });

        // const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)!;
        // if (!workbook) {
        // }

        // const _unitId = unitId || workbook.getUnitId();
        // const sheet = workbook.getActiveSheet();
        // const _sheetId = sheetId || sheet.getSheetId();
        // const sheetPermission = new SheetEditablePermission(_unitId, _sheetId);
        // return this._permissionService
        //     .composePermission$(_unitId, [UniverEditablePermissionPoint, sheetPermission.id])
        //     .pipe(
        //         map(([univerEditable, sheetEditable]) => {
        //             const editable = univerEditable.value && sheetEditable.value;
        //             const status = getTypeFromPermissionItemList([univerEditable, sheetEditable]);
        //             return { value: editable, status };
        //         })
        //     );
    }

    getSheetEditable(unitId?: string, sheetId?: string) {
        return true;
        // const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)!;
        // if (!workbook) return false;

        // const _unitId = unitId || workbook.getUnitId();
        // const sheet = workbook.getActiveSheet();
        // const _sheetId = sheetId || sheet.getSheetId();
        // const sheetPermission = new SheetEditablePermission(_unitId, _sheetId);
        // return this._permissionService
        //     .composePermission(_unitId, [UniverEditablePermissionPoint, sheetPermission.id])
        //     .every((item) => item.value);
    }

    setSheetEditable(v: boolean, unitId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)!;
        if (!workbook) return;

        const _unitId = unitId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_unitId, _sheetId);
        this._permissionService.updatePermissionPoint(_unitId, sheetPermission.id, v);
    }
}
