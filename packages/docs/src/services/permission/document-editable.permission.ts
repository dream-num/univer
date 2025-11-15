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

/**
 * Document editable permission point
 * Used to control whether the document can be edited
 */
export class DocumentEditablePermission implements IPermissionPoint {
    id: string;
    value = true;
    type = UnitObject.Unkonwn; // Docs use Unkonwn type
    status = PermissionStatus.INIT;
    subType = UnitAction.Edit;

    constructor(public unitId: string) {
        this.id = `${this.type}.${UnitAction.Edit}_${unitId}`;
    }
}
