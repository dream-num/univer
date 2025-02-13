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

import type { IPermissionPoint } from '@univerjs/core';
import { PermissionStatus } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';

export class WorksheetDeleteColumnPermission implements IPermissionPoint {
    value = true;
    type = UnitObject.Worksheet;
    status = PermissionStatus.INIT;
    id: string;
    subType = UnitAction.DeleteColumn;
    constructor(public unitId: string, public subUnitId: string) {
        this.id = `${this.type}.${UnitAction.DeleteColumn}_${unitId}_${subUnitId}`;
    }
}
