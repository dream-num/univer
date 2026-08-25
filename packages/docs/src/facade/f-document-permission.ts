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

/**
 * Command-backed permissions for one Document unit.
 * @hideconstructor
 */
export class FDocumentPermission {
    constructor(
        private readonly _unitId: string,
        private readonly _commandService: ICommandService,
        private readonly _permissionService: IPermissionService
    ) {}

    /**
     * Sets one Document unit permission through the command system.
     *
     * Supported actions are Edit, Copy, Print, Export, and Comment. Await the returned promise
     * before reading the new value or performing an action that depends on it.
     *
     * @param {DocumentUnitPermissionAction} action Unit permission action to update.
     * @param {boolean} value Whether the action is allowed.
     * @returns {Promise<void>} Resolves after the permission command finishes.
     * @example Disable copying while keeping the Document editable
     * ```ts
     * import { UnitAction } from '@univerjs/protocol';
     *
     * const document = univerAPI.getActiveDocument();
     * if (!document) throw new Error('No active Document.');
     * await document.getPermission().setPoint(UnitAction.Copy, false);
     * ```
     */
    async setPoint(action: DocumentUnitPermissionAction, value: boolean): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._unitId,
            action,
            value,
        });
    }

    /**
     * Returns the current value of one Document unit permission.
     * @param {DocumentUnitPermissionAction} action Unit permission action to query.
     * @returns {boolean} Whether the action is currently allowed.
     * @example
     * ```ts
     * import { UnitAction } from '@univerjs/protocol';
     *
     * const document = univerAPI.getActiveDocument();
     * const canPrint = document?.getPermission().getPoint(UnitAction.Print) ?? false;
     * console.log(canPrint);
     * ```
     */
    getPoint(action: DocumentUnitPermissionAction): boolean {
        return getDocumentPermissionValue(
            this._permissionService,
            this._unitId,
            this._unitId,
            action
        );
    }

    /**
     * Enables or disables editing for the whole Document.
     * @param {boolean} [editable] Whether editing is allowed. Defaults to true.
     * @returns {Promise<void>} Resolves after the permission command finishes.
     */
    async setEditable(editable = true): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._unitId,
            action: UnitAction.Edit,
            value: editable,
        });
    }

    /**
     * Makes the whole Document read-only.
     * @returns {Promise<void>} Resolves after the permission command finishes.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * if (!document) throw new Error('No active Document.');
     * await document.getPermission().setReadOnly();
     * ```
     */
    async setReadOnly(): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._unitId,
            action: UnitAction.Edit,
            value: false,
        });
    }

    /**
     * Returns whether the whole Document is currently editable.
     * @returns {boolean} Whether Document editing is allowed.
     */
    canEdit(): boolean {
        return getDocumentPermissionValue(
            this._permissionService,
            this._unitId,
            this._unitId,
            UnitAction.Edit
        );
    }
}

/**
 * Command-backed Edit permission for one stable Document object.
 * @hideconstructor
 */
export class FDocumentObjectPermission {
    constructor(
        private readonly _unitId: string,
        private readonly _objectId: string,
        private readonly _commandService: ICommandService,
        private readonly _permissionService: IPermissionService,
        private readonly _getParentObjectIds: () => string[] = () => []
    ) {}

    /**
     * Enables or disables editing for this stable Document object.
     *
     * This changes only the object's Edit point. `canEdit()` also applies the Document unit and
     * parent Section or Paragraph ceilings.
     *
     * @param {boolean} [editable] Whether object editing is allowed. Defaults to true.
     * @returns {Promise<void>} Resolves after the permission command finishes.
     * @example Restore editing for a paragraph
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * const paragraph = document?.getParagraph('paragraph-1');
     * if (!paragraph) throw new Error('Paragraph not found.');
     * await paragraph.getPermission().setEditable();
     * ```
     */
    async setEditable(editable = true): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._objectId,
            action: UnitAction.Edit,
            value: editable,
        });
    }

    /**
     * Makes this stable Document object read-only.
     * @returns {Promise<void>} Resolves after the permission command finishes.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * const section = document?.getSection(0);
     * if (!section) throw new Error('Section not found.');
     * await section.getPermission().setReadOnly();
     * ```
     */
    async setReadOnly(): Promise<void> {
        await this._commandService.executeCommand(SetDocumentPermissionCommand.id, {
            unitId: this._unitId,
            objectId: this._objectId,
            action: UnitAction.Edit,
            value: false,
        });
    }

    /**
     * Returns the effective Edit result after applying the Document, parent, and object permissions.
     * @returns {boolean} Whether the object is currently editable.
     */
    canEdit(): boolean {
        return canEditDocumentTargets(
            this._permissionService,
            this._unitId,
            [...this._getParentObjectIds(), this._objectId]
        );
    }
}
