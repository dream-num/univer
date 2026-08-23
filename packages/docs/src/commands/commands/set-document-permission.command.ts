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

import type { ICommand } from '@univerjs/core';
import type { DocumentUnitPermissionAction } from '../../services/permission/document-permission';
import { CommandType, IPermissionService } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import {
    DOCUMENT_UNIT_PERMISSION_ACTIONS,
    setDocumentPermissionValue,
} from '../../services/permission/document-permission';

export interface ISetDocumentPermissionCommandParams {
    unitId: string;
    objectId: string;
    action: DocumentUnitPermissionAction;
    value: boolean;
}

export const SetDocumentPermissionCommand: ICommand<ISetDocumentPermissionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.command.set-permission',
    handler(accessor, params) {
        if (!params || !DOCUMENT_UNIT_PERMISSION_ACTIONS.includes(params.action)) {
            return false;
        }
        if (params.objectId !== params.unitId && params.action !== UnitAction.Edit) {
            return false;
        }

        setDocumentPermissionValue(
            accessor.get(IPermissionService),
            params.unitId,
            params.objectId,
            params.action,
            params.value
        );
        return true;
    },
};
