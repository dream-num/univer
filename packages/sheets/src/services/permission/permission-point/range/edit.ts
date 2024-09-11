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

import { PermissionStatus } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import type { IPermissionPoint } from '@univerjs/core';

export class RangeProtectionPermissionEditPoint implements IPermissionPoint {
    type = UnitObject.SelectRange;
    subType = UnitAction.Edit;
    status = PermissionStatus.INIT;
    value = true;
    id: string;
    unitId: string;
    subUnitId: string;
    permissionId: string;
    constructor(unitId: string, subUnitId: string, permissionId: string) {
        this.unitId = unitId;
        this.subUnitId = subUnitId;
        this.permissionId = permissionId;
        this.id = `${UnitObject.SelectRange}.${UnitAction.Edit}.${permissionId}`;
    }
}
