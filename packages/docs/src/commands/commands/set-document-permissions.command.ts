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

import type { ICommand, IObjectPermissionBatchResult, ISetObjectPermissionsCommandParams } from '@univerjs/core';
import { CommandType, ObjectPermissionService } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import { createDocumentPermissionPoint } from '../../services/permission/document-permission';

export const SetDocumentPermissionsCommand: ICommand<ISetObjectPermissionsCommandParams, IObjectPermissionBatchResult> = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-permissions',
    async handler(accessor, params) {
        if (!params?.unitId || !Array.isArray(params.changes) || !params.changes.length || params.changes.some((change) =>
            !change?.objectId || change.objectId === params.unitId || (change.policy !== null &&
                (!change.policy || !['all', 'owner', 'members'].includes(change.policy.edit) ||
                    !Array.isArray(change.policy.collaborators) || !Array.isArray(change.policy.strategies) ||
                    change.policy.strategies.some((strategy) => strategy.action !== UnitAction.Edit))))) {
            throw new Error('Invalid object permission batch.');
        }
        return accessor.get(ObjectPermissionService).saveMany(params.changes.map((change) => {
            const point = createDocumentPermissionPoint(params.unitId, change.objectId, UnitAction.Edit);
            return { unitId: params.unitId, objectId: change.objectId, objectType: point.type, policy: change.policy };
        }));
    },
};
