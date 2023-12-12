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

import { Inject } from '@wendellhu/redi';

import { Disposable } from '../../shared';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IPermissionService } from './permission.service';
import { UniverEditablePermission } from './permission-point';

@OnLifecycle(LifecycleStages.Starting, UniverPermissionService)
export class UniverPermissionService extends Disposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._univerInstanceService.sheetAdded$.subscribe((workbook) => {
            const univerEditablePermission = new UniverEditablePermission(workbook.getUnitId());
            this._permissionService.addPermissionPoint(workbook.getUnitId(), univerEditablePermission);
        });
    }

    getEditable(unitID?: string) {
        let unitId = unitID;
        if (!unitId) {
            unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        }
        const univerEditablePermission = new UniverEditablePermission(unitId);
        const permission = this._permissionService.getPermissionPoint(unitId, univerEditablePermission.id);
        return permission?.value;
    }

    setEditable(unitID: string, v: boolean) {
        const univerEditablePermission = new UniverEditablePermission(unitID);
        this._permissionService.updatePermissionPoint(unitID, univerEditablePermission.id, v);
    }
}
