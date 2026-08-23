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

import type { ICommandService, IPermissionService } from '@univerjs/core';
import type { DocumentUnitPermissionAction } from '@univerjs/docs';
import { canEditDocumentTargets, getDocumentPermissionValue, SetDocumentPermissionCommand } from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';

export class FDocumentPermission {
    constructor(
        private readonly _unitId: string,
        private readonly _commandService: ICommandService,
        private readonly _permissionService: IPermissionService
    ) {}

    async setPoint(action: DocumentUnitPermissionAction, value: boolean): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._unitId,
            action,
            value,
        });
    }

    getPoint(action: DocumentUnitPermissionAction): boolean {
        return getDocumentPermissionValue(
            this._permissionService,
            this._unitId,
            this._unitId,
            action
        );
    }

    async setEditable(editable: boolean): Promise<void> {
        await this.setPoint(UnitAction.Edit, editable);
    }

    async setReadOnly(): Promise<void> {
        await this.setEditable(false);
    }

    canEdit(): boolean {
        return this.getPoint(UnitAction.Edit);
    }
}

export class FDocumentObjectPermission {
    constructor(
        private readonly _unitId: string,
        private readonly _objectId: string,
        private readonly _commandService: ICommandService,
        private readonly _permissionService: IPermissionService,
        private readonly _getParentObjectIds: () => string[] = () => []
    ) {}

    async setEditable(editable: boolean): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._objectId,
            action: UnitAction.Edit,
            value: editable,
        });
    }

    canEdit(): boolean {
        return canEditDocumentTargets(
            this._permissionService,
            this._unitId,
            [...this._getParentObjectIds(), this._objectId]
        );
    }
}
