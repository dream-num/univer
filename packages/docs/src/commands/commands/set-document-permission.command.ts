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

import type { ICommand, IObjectPermissionPolicy } from '@univerjs/core';
import type { DocumentUnitPermissionAction } from '../../services/permission/document-permission';
import { CommandType, ObjectPermissionService } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import {
    createDocumentPermissionPoint,
    DOCUMENT_UNIT_PERMISSION_ACTIONS,
} from '../../services/permission/document-permission';

export interface ISetDocumentPermissionCommandParams {
    unitId: string;
    objectId: string;
    action: DocumentUnitPermissionAction;
    value: boolean;
    policy?: IObjectPermissionPolicy;
}

export const SetDocumentPermissionCommand: ICommand<ISetDocumentPermissionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-permission',
    async handler(accessor, params) {
        if (!params || !DOCUMENT_UNIT_PERMISSION_ACTIONS.includes(params.action)) {
            return false;
        }
        if (params.objectId !== params.unitId && params.action !== UnitAction.Edit) {
            return false;
        }

        if (params.policy && (!['all', 'owner', 'members'].includes(params.policy.edit) ||
            params.policy.strategies.some((strategy) => !DOCUMENT_UNIT_PERMISSION_ACTIONS.includes(strategy.action as typeof params.action) ||
                (params.objectId !== params.unitId && strategy.action !== UnitAction.Edit)))) {
            return false;
        }
        const point = createDocumentPermissionPoint(params.unitId, params.objectId, params.action);
        const target = { unitId: params.unitId, objectId: params.objectId, objectType: point.type };
        const service = accessor.get(ObjectPermissionService);
        if (params.policy) {
            await service.save(target, params.policy);
        } else {
            await service.setPoint(target, point, params.value);
        }
        return true;
    },
};
